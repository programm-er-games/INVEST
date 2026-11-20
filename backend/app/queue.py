"""Durable PostgreSQL-backed workflow execution queue.

Rows in `runs` are the queue. FOR UPDATE SKIP LOCKED makes claiming safe
across multiple worker processes without an external broker.
"""

import logging
import os
import socket
import threading
import time
from datetime import datetime, timedelta, timezone
from uuid import UUID, uuid4

from sqlalchemy import select, update

from app.db import SessionLocal
from app.models import AuditLog, Finding, FindingState, WorkflowRun
from app.workflows.engine import WorkflowExecutionError, execute_graph
from app.workflows.registry import registry
from app.workflows.schemas import WorkflowGraph

logger = logging.getLogger("secworkflow.queue")
STALE_AFTER = timedelta(minutes=2)
HEARTBEAT_INTERVAL = 15


def make_worker_id() -> str:
    return f"{socket.gethostname()}:{os.getpid()}:{uuid4().hex[:8]}"


def claim_next_run(worker_id: str) -> str | None:
    """Atomically claim the oldest queued run; return its UUID as a string."""
    now = datetime.now(timezone.utc)
    with SessionLocal() as session:
        session.execute(
            update(WorkflowRun)
            .where(
                WorkflowRun.status == "cancelling",
                WorkflowRun.heartbeat_at.is_not(None),
                WorkflowRun.heartbeat_at < now - STALE_AFTER,
            )
            .values(status="cancelled", finished_at=now, locked_by=None, heartbeat_at=None, error="Cancellation finalized after worker heartbeat expired")
        )
        session.execute(
            update(WorkflowRun)
            .where(
                WorkflowRun.status == "running",
                WorkflowRun.heartbeat_at.is_not(None),
                WorkflowRun.heartbeat_at < now - STALE_AFTER,
            )
            .values(status="queued", locked_by=None, started_at=None, heartbeat_at=None)
        )
        run = session.scalar(
            select(WorkflowRun)
            .where(WorkflowRun.status == "queued")
            .order_by(WorkflowRun.queued_at.asc(), WorkflowRun.id.asc())
            .with_for_update(skip_locked=True)
            .limit(1)
        )
        if run is None:
            session.commit()
            return None
        run.status = "running"
        run.locked_by = worker_id
        run.started_at = now
        run.heartbeat_at = now
        run.error = None
        session.commit()
        return str(run.id)


def _heartbeat(run_id: str, worker_id: str, stop: threading.Event) -> None:
    while not stop.wait(HEARTBEAT_INTERVAL):
        try:
            with SessionLocal() as session:
                session.execute(
                    update(WorkflowRun)
                    .where(
                        WorkflowRun.id == UUID(run_id),
                        WorkflowRun.status.in_(["running", "cancelling"]),
                        WorkflowRun.locked_by == worker_id,
                    )
                    .values(heartbeat_at=datetime.now(timezone.utc))
                )
                session.commit()
        except Exception:
            logger.exception("Could not refresh heartbeat for run %s", run_id)


def _findings_from_result(result: dict) -> list[dict]:
    unique: dict[str, dict] = {}
    explanations: dict[str, dict] = {}
    for output in result.get("outputs", {}).values():
        for finding in output.get("findings", []):
            fingerprint = finding.get("fingerprint")
            if fingerprint:
                unique.setdefault(str(fingerprint), finding)
        for explanation in output.get("explanations", []):
            fingerprint = explanation.get("fingerprint")
            if fingerprint:
                explanations[str(fingerprint)] = explanation
    return [
        {
            **finding,
            **(
                {"ai_explanation": explanations[str(finding["fingerprint"])]}
                if str(finding.get("fingerprint")) in explanations
                else {}
            ),
        }
        for finding in unique.values()
    ]


def process_run(run_id: str, worker_id: str) -> None:
    with SessionLocal() as session:
        run = session.get(WorkflowRun, UUID(run_id))
        if run is None or run.status not in {"running", "cancelling"} or run.locked_by != worker_id:
            return
        graph_snapshot = run.graph_snapshot
        state_rows = (
            session.scalars(
                select(FindingState).where(FindingState.workflow_id == run.workflow_id)
            ).all()
            if run.workflow_id
            else []
        )
        finding_states = {
            row.fingerprint: {
                "state": row.state,
                "expires_at": row.expires_at.isoformat() if row.expires_at else None,
            }
            for row in state_rows
        }

    stop = threading.Event()
    heartbeat = threading.Thread(
        target=_heartbeat, args=(run_id, worker_id, stop), daemon=True
    )
    heartbeat.start()
    started = datetime.now(timezone.utc)
    try:
        execution_scope = graph_snapshot.get("__execution_scope", {}) if isinstance(graph_snapshot, dict) else {}
        target_node_ids = execution_scope.get("requested_node_ids") if isinstance(execution_scope, dict) else None
        force_full_scan = bool(execution_scope.get("force_full_scan", False)) if isinstance(execution_scope, dict) else False
        force_node_ids = execution_scope.get("force_node_ids", []) if isinstance(execution_scope, dict) else []
        cache_entries = {}
        cache_metadata = {}
        if run.workflow_id and not force_full_scan:
            with SessionLocal() as cache_session:
                previous_runs = cache_session.scalars(
                    select(WorkflowRun)
                    .where(WorkflowRun.workflow_id == run.workflow_id, WorkflowRun.status.in_(["completed", "partial"]))
                    .order_by(WorkflowRun.finished_at.desc())
                    .limit(20)
                ).all()
                for previous in previous_runs:
                    previous_result = previous.result if isinstance(previous.result, dict) else {}
                    previous_cache = previous_result.get("cache_entries", {})
                    previous_metadata = previous_result.get("cache_metadata", {})
                    if isinstance(previous_cache, dict) and previous_cache:
                        cache_entries = previous_cache
                        cache_metadata = previous_metadata if isinstance(previous_metadata, dict) else {}
                        break
        graph_data = {key: value for key, value in graph_snapshot.items() if key != "__execution_scope"} if isinstance(graph_snapshot, dict) else graph_snapshot
        graph = WorkflowGraph.model_validate(graph_data)

        def is_cancel_requested() -> bool:
            with SessionLocal() as cancel_session:
                current_status = cancel_session.scalar(
                    select(WorkflowRun.status).where(WorkflowRun.id == UUID(run_id))
                )
                return current_status in {"cancelling", "cancelled"}

        def report_progress(snapshot: dict) -> None:
            try:
                with SessionLocal() as progress_session:
                    progress_session.execute(
                        update(WorkflowRun)
                        .where(
                            WorkflowRun.id == UUID(run_id),
                            WorkflowRun.status.in_(["running", "cancelling"]),
                            WorkflowRun.locked_by == worker_id,
                        )
                        .values(
                            result=snapshot, heartbeat_at=datetime.now(timezone.utc)
                        )
                    )
                    progress_session.commit()
            except Exception:
                logger.exception("Could not persist progress for run %s", run_id)

<<<<<<< Updated upstream
        result = execute_graph(graph, registry, on_progress=report_progress, finding_states=finding_states, should_cancel=is_cancel_requested, target_node_ids=target_node_ids, cache_entries=cache_entries, force_full_scan=force_full_scan, force_node_ids=force_node_ids, cache_metadata=cache_metadata)
=======
        result = execute_graph(
            graph, registry, on_progress=report_progress, finding_states=finding_states
        )
>>>>>>> Stashed changes
        final_status = result.get("status", "failed")
        error = None
    except Exception as exc:
        logger.exception("Workflow run %s failed", run_id)
        result = {"status": "failed", "error": "Workflow execution failed"}
        final_status = "failed"
        # Keep details in server logs, not in a public API response.
        error = (
            str(exc)[:1000]
            if isinstance(exc, WorkflowExecutionError)
            else "Internal execution error"
        )
    finally:
        stop.set()
        heartbeat.join(timeout=2)

    findings = _findings_from_result(result)
    with SessionLocal() as session:
        run = session.get(WorkflowRun, UUID(run_id))
        if run is None or run.status not in {"running", "cancelling"} or run.locked_by != worker_id:
            logger.warning("Run %s ownership changed before completion", run_id)
            return
        run.status = "cancelled" if run.status == "cancelling" or final_status == "cancelled" else final_status
        run.result = result
        run.error = error
        run.finished_at = datetime.now(timezone.utc)
        run.heartbeat_at = None
        run.locked_by = None
        present_fingerprints = {str(item["fingerprint"]) for item in findings}
        if run.workflow_id and present_fingerprints:
            lifecycle_rows = session.scalars(
                select(FindingState).where(
                    FindingState.workflow_id == run.workflow_id,
                    FindingState.fingerprint.in_(present_fingerprints),
                )
            ).all()
            now = datetime.now(timezone.utc)
            for lifecycle in lifecycle_rows:
                expired_risk = (
                    lifecycle.state == "accepted_risk"
                    and lifecycle.expires_at is not None
                    and lifecycle.expires_at <= now
                )
                reappeared_fixed = lifecycle.state == "fixed"
                if expired_risk or reappeared_fixed:
                    previous_state = lifecycle.state
                    lifecycle.state = "open"
                    lifecycle.reason = (
                        "Срок принятого риска истёк; находка обнаружена повторно."
                        if expired_risk
                        else "Находка повторно обнаружена сканером после статуса fixed."
                    )
                    lifecycle.expires_at = None
                    session.add(
                        AuditLog(
                            action="finding.state.reopened",
                            entity="finding_state",
                            entity_id=f"{run.workflow_id}:{lifecycle.fingerprint}",
                            details={
                                "workflow_id": str(run.workflow_id),
                                "fingerprint": lifecycle.fingerprint,
                                "previous_state": previous_state,
                                "new_state": "open",
                                "reason": lifecycle.reason,
                                "run_id": str(run.id),
                            },
                        )
                    )
        for finding in findings:
            session.add(
                Finding(
                    run_id=run.id,
                    fingerprint=str(finding["fingerprint"]),
                    rule_id=str(finding.get("rule_id", "unknown"))[:160],
                    severity=str(finding.get("severity", "INFO"))[:16],
                    path=str(finding.get("path", "")),
                    line=finding.get("line"),
                    payload=finding,
                )
            )
        session.commit()
    logger.info(
        "Run %s finished with status=%s findings=%d",
        run_id,
        final_status,
        len(findings),
    )


def run_worker(poll_interval: float = 2.0) -> None:
    worker_id = make_worker_id()
    logger.info("Worker %s started", worker_id)
    while True:
        try:
            run_id = claim_next_run(worker_id)
            if run_id is None:
                time.sleep(poll_interval)
                continue
            logger.info("Worker %s claimed run %s", worker_id, run_id)
            process_run(run_id, worker_id)
        except Exception:
            logger.exception("Queue polling failed")
            time.sleep(max(poll_interval, 2.0))
