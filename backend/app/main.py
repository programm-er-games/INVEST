import json
import time
import shutil
import re
import os
import hashlib
import html
import tempfile
import zipfile
from pathlib import Path, PurePosixPath
from datetime import datetime, timezone
from typing import Literal
from uuid import UUID, uuid4

from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from pydantic import BaseModel, Field, field_validator
from fastapi.responses import FileResponse, HTMLResponse, StreamingResponse
from starlette.background import BackgroundTask
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, text
from sqlalchemy.exc import SQLAlchemyError

from app.config import settings
from app.ai.explanations import provider_configuration
from app.sources.archive import ArchiveValidationError, extract_project_archive
from app.sources.run_files import RunSourceFileError, resolve_run_source_file
from app.scanners.presentation import _redact
from app.security.redaction import redact_text
from app.db import SessionLocal
from app.models import (
    AuditLog,
    Finding,
    FindingState,
    Project,
    Workflow,
    WorkflowRun,
    WorkflowVersion,
)
from app.workflows.registry import registry
from app.workflows.schemas import WorkflowGraph
from app.workflows.validator import validate_graph
from app.workflows.engine import CACHE_TTL_SECONDS, execute_graph, WorkflowExecutionError


class ProjectRename(BaseModel):
    name: str = Field(min_length=1, max_length=200)

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Название проекта не может быть пустым.")
        return value


class SelectedRunRequest(BaseModel):
    node_ids: list[str] = Field(min_length=1, max_length=100)
    force_full_scan: bool = False
    force_node_ids: list[str] = Field(default_factory=list, max_length=100)

    @field_validator("node_ids")
    @classmethod
    def validate_node_ids(cls, value: list[str]) -> list[str]:
        normalized = list(dict.fromkeys(item.strip() for item in value if isinstance(item, str) and item.strip()))
        if not normalized or any(len(item) > 120 for item in normalized):
            raise ValueError("Укажите от 1 до 100 корректных идентификаторов блоков.")
        return normalized


class FindingStateUpdate(BaseModel):
    state: Literal["open", "accepted_risk", "fixed", "false_positive"]
    reason: str = Field(min_length=3, max_length=2000)
    expires_at: datetime | None = None

    @field_validator("reason")
    @classmethod
    def reason_must_contain_text(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Укажите причину изменения статуса.")
        return value.strip()


app = FastAPI(title="AI Security Workflow API", version="0.2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/ai/status")
def ai_provider_status():
    """Expose provider readiness without ever returning the API key."""
    return provider_configuration()


@app.get("/health")
def health():
    return {"status": "ok", "service": "api"}


@app.get("/health/db")
def database_health():
    try:
        with SessionLocal() as session:
            session.execute(text("SELECT 1"))
        return {"status": "ok", "service": "postgres"}
    except SQLAlchemyError as exc:
        raise HTTPException(status_code=503, detail="Database unavailable") from exc


@app.post("/api/sources/upload", status_code=201)
def upload_source(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".zip"):
        raise HTTPException(status_code=415, detail="Загрузите ZIP-архив проекта.")
    try:
        result = extract_project_archive(file.file, settings.workspace_root)
        return {
            **result,
            "source": "workspace-upload",
            "message": "Архив безопасно распакован. Команды проекта не запускались.",
        }
    except ArchiveValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except OSError as exc:
        raise HTTPException(
            status_code=500, detail="Не удалось сохранить архив в рабочую директорию."
        ) from exc


def _project_root(project: Project) -> Path:
    workspace = Path(settings.workspace_root).resolve()
    relative = PurePosixPath(project.workspace_path)
    if (
        relative.is_absolute()
        or len(relative.parts) != 2
        or relative.parts[0] != "projects"
        or not relative.parts[1].startswith("project-")
        or any(part in {"", ".", ".."} for part in relative.parts)
    ):
        raise HTTPException(
            status_code=500, detail="Invalid project workspace reference"
        )
    root = workspace.joinpath(*relative.parts)
    if root.is_symlink():
        raise HTTPException(status_code=404, detail="Project files are unavailable")
    try:
        resolved = root.resolve(strict=True)
    except OSError as exc:
        raise HTTPException(
            status_code=404, detail="Project files are unavailable"
        ) from exc
    if not resolved.is_relative_to(workspace) or not resolved.is_dir():
        raise HTTPException(status_code=404, detail="Project files are unavailable")
    return resolved


def _project_has_active_run(session, project: Project) -> bool:
<<<<<<< Updated upstream
    runs = session.scalars(select(WorkflowRun).where(WorkflowRun.status.in_(["queued", "running", "cancelling"]))).all()
=======
    runs = session.scalars(
        select(WorkflowRun).where(WorkflowRun.status.in_(["queued", "running"]))
    ).all()
>>>>>>> Stashed changes
    for run in runs:
        graph = run.graph_snapshot if isinstance(run.graph_snapshot, dict) else {}
        for node in graph.get("nodes", []):
            if not isinstance(node, dict) or node.get("type") != "source.upload":
                continue
            config = node.get("config", {})
            if (
                isinstance(config, dict)
                and config.get("path") == project.workspace_path
            ):
                return True
    return False


def _project_payload(project: Project) -> dict:
    return {
        "id": str(project.id),
        "name": project.name,
        "workspace_path": project.workspace_path,
        "original_filename": project.original_filename,
        "file_count": project.file_count,
        "expanded_bytes": project.expanded_bytes,
        "created_at": project.created_at,
        "updated_at": project.updated_at,
    }


def _safe_project_name(filename: str | None) -> str:
    stem = Path(filename or "Новый проект").stem
    cleaned = re.sub(r"[^\w .()-]+", " ", stem, flags=re.UNICODE).strip(" .-_")
    return (cleaned or "Новый проект")[:200]


def _project_path_is_sensitive(relative: PurePosixPath) -> bool:
    blocked = ("secret", "credential", "password", "token", "private", ".env")
    return any(token in part.lower() for part in relative.parts for token in blocked)


def _project_content_is_safe(content: str) -> bool:
    assignment = re.compile(
        r"(?i)\b(?:password|passwd|api[_-]?(?:key|token)|access[_-]?token|client[_-]?secret|secret|authorization|token)\b\s*[:=]\s*[\"']?[^,\s\"'#]{8,}"
    )
    if "-----BEGIN " in content and "PRIVATE KEY-----" in content:
        return False
    return all(
        _redact(line) == line and not assignment.search(line)
        for line in content.splitlines()
    )


PROJECT_EXPORT_TEXT_SUFFIXES = {
    ".py", ".js", ".jsx", ".ts", ".tsx", ".html", ".css", ".scss",
    ".json", ".yaml", ".yml", ".toml", ".ini", ".md", ".txt", ".xml",
    ".gradle", ".kts", ".properties", ".sql", ".sh", ".ps1",
}


def _project_export_file_is_safe(relative: PurePosixPath, size: int, content: str | None = None) -> bool:
    if _project_path_is_sensitive(relative) or size < 0 or size > 512 * 1024 * 1024:
        return False
    if relative.suffix.lower() in PROJECT_EXPORT_TEXT_SUFFIXES:
        # Large text files are omitted rather than exported without a complete secret scan.
        if size > 1_000_000 or content is None:
            return False
        return _project_content_is_safe(content)
    return True


def _project_file_snapshot(root: Path) -> dict[str, dict[str, int | str]]:
    """Build a bounded, content-addressed manifest for safe project files."""
    manifest: dict[str, dict[str, int | str]] = {}
    for current, directories, filenames in os.walk(root, followlinks=False):
        directories[:] = sorted(
            name
            for name in directories
            if name != ".git" and not (Path(current) / name).is_symlink()
        )
        for filename in sorted(filenames):
            item = Path(current) / filename
            if item.is_symlink():
                continue
            try:
                relative = item.relative_to(root).as_posix()
                stat = item.stat()
                if not item.is_file():
                    continue
                digest = hashlib.sha256()
                with item.open("rb") as source:
                    for chunk in iter(lambda: source.read(1024 * 1024), b""):
                        digest.update(chunk)
                manifest[relative] = {
                    "size": stat.st_size,
                    "sha256": digest.hexdigest(),
                }
            except OSError:
                continue
    return manifest


def _project_snapshot_diff(before: dict, after: dict) -> dict:
    old_paths, new_paths = set(before), set(after)
    added = sorted(new_paths - old_paths)
    removed = sorted(old_paths - new_paths)
    changed = sorted(
        path for path in old_paths & new_paths if before[path] != after[path]
    )
    return {
        "added_count": len(added),
        "removed_count": len(removed),
        "changed_count": len(changed),
        "compared_files": len(old_paths | new_paths),
        "added_files": added[:50],
        "removed_files": removed[:50],
        "changed_files": changed[:50],
        "sample_truncated": any(len(items) > 50 for items in (added, removed, changed)),
    }


@app.get("/api/projects")
def list_projects():
    with SessionLocal() as session:
        rows = session.scalars(
            select(Project).order_by(Project.updated_at.desc(), Project.name)
        ).all()
        return [_project_payload(item) for item in rows]


@app.post("/api/projects", status_code=201)
def create_project(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".zip"):
        raise HTTPException(status_code=415, detail="Загрузите ZIP-архив проекта.")
    project_id = uuid4()
    workspace_path = f"projects/project-{project_id}"
    staging_path = f"projects/.staging-{project_id}"
    try:
        result = extract_project_archive(
            file.file, settings.workspace_root, staging_path
        )
        root = Path(settings.workspace_root).resolve()
        destination = root / workspace_path
        result_path = root / staging_path
        result_path.rename(destination)
        with SessionLocal() as session:
            project = Project(
                id=project_id,
                name=_safe_project_name(file.filename),
                workspace_path=workspace_path,
                original_filename=Path(file.filename).name[:255],
                file_count=result["files"],
                expanded_bytes=result["expanded_bytes"],
            )
            session.add(project)
            session.add(
                AuditLog(
                    action="project.created",
                    entity="project",
                    entity_id=str(project_id),
                    details={
                        "file_count": result["files"],
                        "expanded_bytes": result["expanded_bytes"],
                    },
                )
            )
            session.commit()
            session.refresh(project)
            return _project_payload(project)
    except ArchiveValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except OSError as exc:
        shutil.rmtree(Path(settings.workspace_root) / staging_path, ignore_errors=True)
        raise HTTPException(
            status_code=500, detail="Не удалось сохранить проект в рабочую папку."
        ) from exc
    finally:
        file.file.close()


@app.put("/api/projects/{project_id}/archive")
def update_project_archive(project_id: UUID, file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".zip"):
        raise HTTPException(status_code=415, detail="Загрузите ZIP-архив проекта.")
    with SessionLocal() as session:
        project = session.get(Project, project_id)
        if project is None:
            raise HTTPException(status_code=404, detail="Project not found")
        if _project_has_active_run(session, project):
            raise HTTPException(
                status_code=409,
                detail="Нельзя обновить проект, пока выполняется workflow с этим источником.",
            )
        workspace_path = project.workspace_path
        staging_path = f"projects/.staging-{project_id}-{uuid4().hex}"
        root = Path(settings.workspace_root).resolve()
        destination = _project_root(project)
        staging = root.joinpath(*PurePosixPath(staging_path).parts)
        backup = root / "projects" / f".previous-{project_id}-{uuid4().hex}"
        try:
            before_snapshot = _project_file_snapshot(destination)
            result = extract_project_archive(file.file, root, staging_path)
            after_snapshot = _project_file_snapshot(staging)
            changes = _project_snapshot_diff(before_snapshot, after_snapshot)
            destination.rename(backup)
            try:
                staging.rename(destination)
            except Exception:
                backup.rename(destination)
                raise
            shutil.rmtree(backup, ignore_errors=True)
            project.file_count = result["files"]
            project.expanded_bytes = result["expanded_bytes"]
            project.original_filename = Path(file.filename).name[:255]
            session.add(
                AuditLog(
                    action="project.updated",
                    entity="project",
                    entity_id=str(project_id),
                    details={
                        "file_count": result["files"],
                        "expanded_bytes": result["expanded_bytes"],
                        "changes": changes,
                    },
                )
            )
            session.commit()
            session.refresh(project)
            return _project_payload(project)
        except ArchiveValidationError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        except OSError as exc:
            shutil.rmtree(staging, ignore_errors=True)
            raise HTTPException(
                status_code=500, detail="Не удалось обновить файлы проекта."
            ) from exc
        finally:
            file.file.close()


@app.patch("/api/projects/{project_id}")
def rename_project(project_id: UUID, payload: ProjectRename):
    with SessionLocal() as session:
        project = session.get(Project, project_id)
        if project is None:
            raise HTTPException(status_code=404, detail="Project not found")
        previous = project.name
        project.name = payload.name
        session.add(
            AuditLog(
                action="project.renamed",
                entity="project",
                entity_id=str(project_id),
                details={"previous_name": previous, "name": payload.name},
            )
        )
        session.commit()
        session.refresh(project)
        return _project_payload(project)


@app.delete("/api/projects/{project_id}", status_code=204)
def delete_project(project_id: UUID):
    with SessionLocal() as session:
        project = session.get(Project, project_id)
        if project is None:
            raise HTTPException(status_code=404, detail="Project not found")
        if _project_has_active_run(session, project):
            raise HTTPException(
                status_code=409,
                detail="Нельзя удалить проект, пока выполняется workflow с этим источником.",
            )
        root = _project_root(project)
        shutil.rmtree(root)
        session.add(
            AuditLog(
                action="project.deleted",
                entity="project",
                entity_id=str(project_id),
                details={
                    "name": project.name,
                    "workspace_path": project.workspace_path,
                },
            )
        )
        session.delete(project)
        session.commit()
    return None


@app.get("/api/projects/{project_id}/history")
def project_history(project_id: UUID):
    with SessionLocal() as session:
        project = session.get(Project, project_id)
        if project is None:
            raise HTTPException(status_code=404, detail="Project not found")
        rows = session.scalars(
            select(AuditLog)
            .where(AuditLog.entity == "project", AuditLog.entity_id == str(project_id))
            .order_by(AuditLog.created_at.desc(), AuditLog.id.desc())
            .limit(30)
        ).all()
        return [
            {
                "action": row.action,
                "created_at": row.created_at,
                "details": row.details or {},
            }
            for row in rows
        ]


@app.get("/api/projects/{project_id}/files")
def list_project_files(project_id: UUID):
    with SessionLocal() as session:
        project = session.get(Project, project_id)
        if project is None:
            raise HTTPException(status_code=404, detail="Project not found")
        root = _project_root(project)
        files = []
        for current, directories, filenames in __import__("os").walk(
            root, followlinks=False
        ):
            directories[:] = [
                name
                for name in directories
                if name != ".git" and not (Path(current) / name).is_symlink()
            ]
            for filename in filenames:
                item = Path(current) / filename
                if item.is_symlink():
                    continue
                try:
                    relative = item.relative_to(root).as_posix()
                    files.append({"path": relative, "size": item.stat().st_size})
                except OSError:
                    continue
                if len(files) >= 10000:
                    break
            if len(files) >= 10000:
                break
        return {
            "project": _project_payload(project),
            "files": sorted(files, key=lambda item: item["path"].lower()),
            "truncated": len(files) >= 10000,
        }


class ProjectFileUpdate(BaseModel):
    content: str = Field(max_length=1_000_000)


@app.get("/api/projects/{project_id}/file")
def preview_project_file(
    project_id: UUID,
    path: str = Query(min_length=1, max_length=1000),
    start_line: int = Query(default=1, ge=1),
):
    relative = PurePosixPath(path)
    if (
        relative.is_absolute()
        or "\\" in path
        or "\x00" in path
        or any(part in {"", ".", ".."} for part in relative.parts)
    ):
        raise HTTPException(status_code=400, detail="Invalid project file path")
    with SessionLocal() as session:
        project = session.get(Project, project_id)
        if project is None:
            raise HTTPException(status_code=404, detail="Project not found")
        root = _project_root(project)
        candidate = root.joinpath(*relative.parts)
        current = candidate
        while current != root:
            if current.is_symlink():
                raise HTTPException(
                    status_code=404, detail="Project file is unavailable"
                )
            current = current.parent
        try:
            resolved = candidate.resolve(strict=True)
            if (
                not resolved.is_relative_to(root)
                or not resolved.is_file()
                or resolved.stat().st_size > 1_000_000
            ):
                raise OSError("File is unavailable or too large")
            content = resolved.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError) as exc:
            raise HTTPException(
                status_code=404,
                detail="Файл недоступен для текстового просмотра (лимит 1 MiB).",
            ) from exc
        lines = content.splitlines()
        safe_name = not _project_path_is_sensitive(relative)
        editable_suffixes = {
            ".py",
            ".js",
            ".jsx",
            ".ts",
            ".tsx",
            ".html",
            ".css",
            ".scss",
            ".json",
            ".yaml",
            ".yml",
            ".toml",
            ".ini",
            ".md",
            ".txt",
            ".xml",
            ".gradle",
            ".kts",
            ".properties",
            ".sql",
            ".sh",
            ".ps1",
        }
        editable = (
            safe_name
            and relative.suffix.lower() in editable_suffixes
            and _project_content_is_safe(content)
        )
        first = min(start_line, max(1, len(lines)))
        last = min(len(lines), first + 299)
        return {
            "path": relative.as_posix(),
            "start_line": first,
            "end_line": last,
            "total_lines": len(lines),
            "editable": editable,
            "content": content if editable else None,
            "lines": [
                {"line": number, "text": _redact(lines[number - 1])[:1000]}
                for number in range(first, last + 1)
            ],
        }


@app.get("/api/projects/{project_id}/download")
def download_project_archive(project_id: UUID):
    """Export a project without VCS metadata, symlinks, or likely credentials."""
    max_archive_bytes = 1024 * 1024 * 1024
    temporary_path = None
    with SessionLocal() as session:
        project = session.get(Project, project_id)
        if project is None:
            raise HTTPException(status_code=404, detail="Project not found")
        root = _project_root(project)
        try:
            fd, temporary_path = tempfile.mkstemp(prefix="invest-project-", suffix=".zip")
            os.close(fd)
            included = 0
            skipped_sensitive = 0
            with zipfile.ZipFile(temporary_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6, allowZip64=True) as archive:
                for current, directories, filenames in os.walk(root, followlinks=False):
                    current_path = Path(current)
                    directories[:] = sorted(
                        name for name in directories
                        if name != ".git"
                        and not (current_path / name).is_symlink()
                        and not _project_path_is_sensitive(PurePosixPath((current_path / name).relative_to(root).as_posix()))
                    )
                    for filename in sorted(filenames):
                        source = current_path / filename
                        if source.is_symlink():
                            continue
                        relative = PurePosixPath(source.relative_to(root).as_posix())
                        try:
                            if not source.is_file():
                                continue
                            size = source.stat().st_size
                            content = None
                            if relative.suffix.lower() in PROJECT_EXPORT_TEXT_SUFFIXES and size <= 1_000_000:
                                try:
                                    content = source.read_text(encoding="utf-8")
                                except (UnicodeDecodeError, OSError):
                                    content = None
                            if not _project_export_file_is_safe(relative, size, content):
                                skipped_sensitive += 1
                                continue
                            archive.write(source, arcname=relative.as_posix())
                            included += 1
                            if os.path.getsize(temporary_path) > max_archive_bytes:
                                raise HTTPException(status_code=413, detail="Экспорт ограничен размером ZIP до 1 GiB.")
                        except OSError:
                            continue
            if included == 0:
                raise HTTPException(status_code=404, detail="В проекте нет файлов, доступных для экспорта.")
            session.add(AuditLog(
                action="project.exported",
                entity="project",
                entity_id=str(project_id),
                details={"included_files": included, "skipped_sensitive_files": skipped_sensitive},
            ))
            session.commit()
            safe_name = re.sub(r"[^A-Za-z0-9._-]+", "-", project.name).strip("-._") or "project"
            return FileResponse(
                temporary_path,
                media_type="application/zip",
                filename=f"{safe_name}.zip",
                background=BackgroundTask(os.unlink, temporary_path),
                headers={"X-Content-Type-Options": "nosniff", "Cache-Control": "no-store"},
            )
        except HTTPException:
            if temporary_path and os.path.exists(temporary_path):
                os.unlink(temporary_path)
            raise
        except (OSError, zipfile.BadZipFile) as exc:
            if temporary_path and os.path.exists(temporary_path):
                os.unlink(temporary_path)
            raise HTTPException(status_code=500, detail="Не удалось сформировать ZIP-экспорт проекта.") from exc


@app.get("/api/projects/{project_id}/file/download")
def download_project_file(project_id: UUID, path: str = Query(min_length=1, max_length=1000)):
    relative = PurePosixPath(path)
    if relative.is_absolute() or "\\" in path or "\x00" in path or any(part in {"", ".", ".."} for part in relative.parts):
        raise HTTPException(status_code=400, detail="Invalid project file path")
    if _project_path_is_sensitive(relative):
        raise HTTPException(status_code=404, detail="Project file is unavailable")
    with SessionLocal() as session:
        project = session.get(Project, project_id)
        if project is None:
            raise HTTPException(status_code=404, detail="Project not found")
        root = _project_root(project)
        candidate = root.joinpath(*relative.parts)
        current = candidate
        while current != root:
            if current.is_symlink():
                raise HTTPException(status_code=404, detail="Project file is unavailable")
            current = current.parent
        try:
            resolved = candidate.resolve(strict=True)
            if not resolved.is_relative_to(root) or not resolved.is_file():
                raise OSError("File is unavailable")
            size = resolved.stat().st_size
            if size > 100 * 1024 * 1024:
                raise HTTPException(status_code=413, detail="Скачивание одного файла ограничено 100 MiB.")
            content = None
            if relative.suffix.lower() in PROJECT_EXPORT_TEXT_SUFFIXES:
                if size > 1_000_000:
                    raise HTTPException(status_code=413, detail="Текстовые файлы больше 1 MiB нельзя скачать без полной проверки на секреты.")
                content = resolved.read_text(encoding="utf-8")
            if not _project_export_file_is_safe(relative, size, content):
                raise HTTPException(status_code=403, detail="Файл исключён из скачивания проверкой безопасности.")
        except HTTPException:
            raise
        except (OSError, UnicodeDecodeError) as exc:
            raise HTTPException(status_code=404, detail="Файл недоступен для скачивания.") from exc
        session.add(AuditLog(action="project.file_downloaded", entity="project", entity_id=str(project_id), details={
            "path": relative.as_posix(), "bytes": size,
        }))
        session.commit()
        return FileResponse(
            resolved,
            media_type="application/octet-stream",
            filename=resolved.name,
            content_disposition_type="attachment",
            headers={"X-Content-Type-Options": "nosniff", "Cache-Control": "no-store"},
        )


@app.api_route("/api/projects/{project_id}/preview", methods=["GET", "HEAD"])
def preview_project_asset(
    project_id: UUID,
    path: str = Query(min_length=1, max_length=1000),
):
    relative = PurePosixPath(path)
    if relative.is_absolute() or "\\" in path or "\x00" in path or any(part in {"", ".", ".."} for part in relative.parts):
        raise HTTPException(status_code=400, detail="Invalid project file path")
    allowed_types = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
        ".gif": "image/gif",
        ".pdf": "application/pdf",
    }
    media_type = allowed_types.get(relative.suffix.lower())
    if media_type is None:
        raise HTTPException(status_code=415, detail="Формат не поддерживает безопасный предпросмотр.")
    if _project_path_is_sensitive(relative):
        raise HTTPException(status_code=404, detail="Project file is unavailable")
    with SessionLocal() as session:
        project = session.get(Project, project_id)
        if project is None:
            raise HTTPException(status_code=404, detail="Project not found")
        root = _project_root(project)
        candidate = root.joinpath(*relative.parts)
        current = candidate
        while current != root:
            if current.is_symlink():
                raise HTTPException(status_code=404, detail="Project file is unavailable")
            current = current.parent
        try:
            resolved = candidate.resolve(strict=True)
            if not resolved.is_relative_to(root) or not resolved.is_file():
                raise OSError("File is unavailable")
            size = resolved.stat().st_size
            if size > 20 * 1024 * 1024:
                raise HTTPException(status_code=413, detail="Предпросмотр ограничен файлами до 20 MiB.")
        except HTTPException:
            raise
        except OSError as exc:
            raise HTTPException(status_code=404, detail="Файл недоступен для предпросмотра.") from exc
        return FileResponse(
            path=resolved,
            media_type=media_type,
            filename=resolved.name,
            content_disposition_type="inline",
            headers={
                "X-Content-Type-Options": "nosniff",
                "Cache-Control": "no-store",
                "Content-Security-Policy": "default-src 'none'; frame-ancestors 'self'",
            },
        )


@app.put("/api/projects/{project_id}/file")
def update_project_file(
    project_id: UUID,
    payload: ProjectFileUpdate,
    path: str = Query(min_length=1, max_length=1000),
):
    relative = PurePosixPath(path)
    if (
        relative.is_absolute()
        or "\\" in path
        or "\x00" in path
        or any(part in {"", ".", ".."} for part in relative.parts)
    ):
        raise HTTPException(status_code=400, detail="Invalid project file path")
    if relative.suffix.lower() not in {
        ".py",
        ".js",
        ".jsx",
        ".ts",
        ".tsx",
        ".html",
        ".css",
        ".scss",
        ".json",
        ".yaml",
        ".yml",
        ".toml",
        ".ini",
        ".md",
        ".txt",
        ".xml",
        ".gradle",
        ".kts",
        ".properties",
        ".sql",
        ".sh",
        ".ps1",
    }:
        raise HTTPException(
            status_code=415, detail="Этот тип файла нельзя редактировать в браузере."
        )
    if _project_path_is_sensitive(relative):
        raise HTTPException(
            status_code=403,
            detail="Файлы с потенциальными секретами доступны только для чтения.",
        )
    if len(payload.content.encode("utf-8")) > 1_000_000:
        raise HTTPException(
            status_code=413,
            detail="Размер файла после UTF-8 кодирования превышает 1 MiB.",
        )
    if not _project_content_is_safe(payload.content):
        raise HTTPException(
            status_code=400,
            detail="Сохранение отменено: содержимое похоже на секрет или учётные данные.",
        )
    with SessionLocal() as session:
        project = session.get(Project, project_id)
        if project is None:
            raise HTTPException(status_code=404, detail="Project not found")
        if _project_has_active_run(session, project):
            raise HTTPException(
                status_code=409,
                detail="Проект используется активным workflow; редактирование временно заблокировано.",
            )
        root = _project_root(project)
        candidate = root.joinpath(*relative.parts)
        current = candidate
        while current != root:
            if current.is_symlink():
                raise HTTPException(
                    status_code=404, detail="Project file is unavailable"
                )
            current = current.parent
        try:
            resolved = candidate.resolve(strict=True)
            if (
                not resolved.is_relative_to(root)
                or not resolved.is_file()
                or resolved.stat().st_size > 1_000_000
            ):
                raise OSError("File is unavailable or too large")
            original = resolved.read_text(encoding="utf-8")
            if not _project_content_is_safe(original):
                raise HTTPException(
                    status_code=403,
                    detail="Файл содержит потенциальные секреты и доступен только для чтения.",
                )
            temp_name = None
            try:
                with tempfile.NamedTemporaryFile(
                    "w",
                    encoding="utf-8",
                    newline="",
                    dir=resolved.parent,
                    prefix=".invest-edit-",
                    delete=False,
                ) as temporary:
                    temp_name = temporary.name
                    temporary.write(payload.content)
                    temporary.flush()
                    os.fsync(temporary.fileno())
                os.replace(temp_name, resolved)
            finally:
                if temp_name and os.path.exists(temp_name):
                    os.unlink(temp_name)
        except HTTPException:
            raise
        except (OSError, UnicodeDecodeError) as exc:
            raise HTTPException(
                status_code=400,
                detail="Не удалось сохранить файл. Проверь размер и кодировку UTF-8.",
            ) from exc
        session.add(
            AuditLog(
                action="project.file_updated",
                entity="project",
                entity_id=str(project_id),
                details={
                    "path": relative.as_posix(),
                    "bytes": len(payload.content.encode("utf-8")),
                },
            )
        )
        session.commit()
    return {
        "saved": True,
        "path": relative.as_posix(),
        "bytes": len(payload.content.encode("utf-8")),
    }


@app.get("/api/projects/{project_id}/search")
def search_project_contents(
    project_id: UUID, q: str = Query(min_length=2, max_length=100)
):
    needle = q.casefold()
    text_suffixes = {
        ".py",
        ".js",
        ".jsx",
        ".ts",
        ".tsx",
        ".html",
        ".css",
        ".scss",
        ".json",
        ".yaml",
        ".yml",
        ".toml",
        ".ini",
        ".md",
        ".txt",
        ".xml",
        ".gradle",
        ".kts",
        ".properties",
        ".sql",
        ".sh",
        ".ps1",
    }
    results = []
    scanned = 0
    with SessionLocal() as session:
        project = session.get(Project, project_id)
        if project is None:
            raise HTTPException(status_code=404, detail="Project not found")
        root = _project_root(project)
        for current, directories, filenames in os.walk(root, followlinks=False):
            directories[:] = [
                name
                for name in directories
                if name != ".git" and not (Path(current) / name).is_symlink()
            ]
            for filename in filenames:
                if scanned >= 3000 or len(results) >= 100:
                    break
                item = Path(current) / filename
                if (
                    item.is_symlink()
                    or item.suffix.lower() not in text_suffixes
                    or _project_path_is_sensitive(
                        PurePosixPath(item.relative_to(root).as_posix())
                    )
                ):
                    continue
                try:
                    if item.stat().st_size > 512_000:
                        continue
                    content = item.read_text(encoding="utf-8")
                except (OSError, UnicodeDecodeError):
                    continue
                scanned += 1
                for number, line in enumerate(content.splitlines(), 1):
                    if needle in line.casefold() and _redact(line) == line:
                        results.append(
                            {
                                "path": item.relative_to(root).as_posix(),
                                "line": number,
                                "text": line.strip()[:240],
                            }
                        )
                        if len(results) >= 100:
                            break
            if scanned >= 3000 or len(results) >= 100:
                break
    return {
        "results": results,
        "scanned_files": scanned,
        "truncated": len(results) >= 100 or scanned >= 3000,
    }


@app.get("/api/node-types")
def node_types():
    return [manifest.model_dump() for manifest in registry.all()]


@app.post("/api/workflows/validate")
def validate_workflow(graph: WorkflowGraph):
    return validate_graph(graph, registry).model_dump()


@app.get("/api/workflows")
def list_workflows():
    with SessionLocal() as session:
        rows = session.scalars(
            select(Workflow).order_by(Workflow.updated_at.desc())
        ).all()
        return [
            {
                "id": str(item.id),
                "name": item.name,
                "description": item.description,
                "updated_at": item.updated_at,
            }
            for item in rows
        ]


@app.post("/api/workflows", status_code=201)
def create_workflow(graph: WorkflowGraph):
    validation = validate_graph(graph, registry)
    if not validation.valid:
        raise HTTPException(status_code=422, detail=validation.model_dump())
    with SessionLocal() as session:
        workflow = Workflow(name=graph.name)
        session.add(workflow)
        session.flush()
        session.add(
            WorkflowVersion(
                workflow_id=workflow.id, version=1, graph=graph.model_dump(mode="json")
            )
        )
        session.commit()
        return {"id": str(workflow.id), "name": workflow.name, "version": 1}


@app.get("/api/workflows/{workflow_id}")
def get_workflow(workflow_id: UUID):
    with SessionLocal() as session:
        workflow = session.get(Workflow, workflow_id)
        if workflow is None:
            raise HTTPException(status_code=404, detail="Workflow not found")
        version = session.scalar(
            select(WorkflowVersion)
            .where(WorkflowVersion.workflow_id == workflow_id)
            .order_by(WorkflowVersion.version.desc())
            .limit(1)
        )
        return {
            "id": str(workflow.id),
            "name": workflow.name,
            "version": version.version if version else 0,
            "graph": version.graph if version else None,
        }


@app.put("/api/workflows/{workflow_id}")
def update_workflow(workflow_id: UUID, graph: WorkflowGraph):
    validation = validate_graph(graph, registry)
    if not validation.valid:
        raise HTTPException(status_code=422, detail=validation.model_dump())
    with SessionLocal() as session:
        workflow = session.get(Workflow, workflow_id)
        if workflow is None:
            raise HTTPException(status_code=404, detail="Workflow not found")
        latest = session.scalar(
            select(WorkflowVersion)
            .where(WorkflowVersion.workflow_id == workflow_id)
            .order_by(WorkflowVersion.version.desc())
            .limit(1)
        )
        version = (latest.version if latest else 0) + 1
        workflow.name = graph.name
        session.add(
            WorkflowVersion(
                workflow_id=workflow_id,
                version=version,
                graph=graph.model_dump(mode="json"),
            )
        )
        session.commit()
        return {"id": str(workflow.id), "name": workflow.name, "version": version}


@app.post("/api/workflows/{workflow_id}/runs", status_code=202)
def execute_saved_workflow(workflow_id: UUID, force_full_scan: bool = Query(default=False)):
    """Persist a run request; the dedicated worker performs the scan asynchronously."""
    with SessionLocal() as session:
        workflow = session.get(Workflow, workflow_id)
        if workflow is None:
            raise HTTPException(status_code=404, detail="Workflow not found")
        version = session.scalar(
            select(WorkflowVersion)
            .where(WorkflowVersion.workflow_id == workflow_id)
            .order_by(WorkflowVersion.version.desc())
            .limit(1)
        )
        if version is None:
            raise HTTPException(status_code=409, detail="Workflow has no saved version")

        graph = WorkflowGraph.model_validate(version.graph)
        validation = validate_graph(graph, registry)
        if not validation.valid:
            raise HTTPException(status_code=422, detail=validation.model_dump())

        graph_snapshot = dict(version.graph)
        graph_snapshot["__execution_scope"] = {"requested_node_ids": [], "force_full_scan": force_full_scan}
        run = WorkflowRun(
            workflow_id=workflow_id,
            status="queued",
            source="ui",
            graph_snapshot=graph_snapshot,
        )
        session.add(run)
        session.commit()
        return {
            "run_id": str(run.id),
            "workflow_id": str(workflow_id),
            "workflow_version": version.version,
            "status": "queued",
            "findings_count": 0,
        }


@app.post("/api/workflows/{workflow_id}/runs/selected", status_code=202)
def execute_selected_workflow(workflow_id: UUID, request: SelectedRunRequest):
    with SessionLocal() as session:
        workflow = session.get(Workflow, workflow_id)
        if workflow is None:
            raise HTTPException(status_code=404, detail="Workflow not found")
        version = session.scalar(
            select(WorkflowVersion)
            .where(WorkflowVersion.workflow_id == workflow_id)
            .order_by(WorkflowVersion.version.desc())
            .limit(1)
        )
        if version is None:
            raise HTTPException(status_code=409, detail="Workflow has no saved version")
        graph = WorkflowGraph.model_validate(version.graph)
        validation = validate_graph(graph, registry)
        if not validation.valid:
            raise HTTPException(status_code=422, detail=validation.model_dump())
        known_ids = {node.id for node in graph.nodes}
        unknown = sorted(set(request.node_ids) - known_ids)
        if unknown:
            raise HTTPException(status_code=422, detail={"message": "Выбраны отсутствующие блоки.", "unknown_node_ids": unknown})
        snapshot = graph.model_dump(mode="json")
        known_force_ids = set(request.force_node_ids)
        if not known_force_ids.issubset(known_ids):
            raise HTTPException(status_code=422, detail={"message": "Для сброса кэша выбраны неизвестные блоки.", "unknown_node_ids": sorted(known_force_ids - known_ids)})
        snapshot["__execution_scope"] = {"requested_node_ids": request.node_ids, "force_full_scan": request.force_full_scan, "force_node_ids": request.force_node_ids}
        run = WorkflowRun(
            workflow_id=workflow_id,
            status="queued",
            source="selected",
            graph_snapshot=snapshot,
        )
        session.add(run)
        session.commit()
        return {
            "run_id": str(run.id),
            "workflow_id": str(workflow_id),
            "workflow_version": version.version,
            "requested_node_ids": request.node_ids,
            "status": "queued",
        }


@app.get("/api/workflows/{workflow_id}/versions")
def list_workflow_versions(workflow_id: UUID):
    with SessionLocal() as session:
        workflow = session.get(Workflow, workflow_id)
        if workflow is None:
            raise HTTPException(status_code=404, detail="Workflow not found")
        versions = session.scalars(
            select(WorkflowVersion)
            .where(WorkflowVersion.workflow_id == workflow_id)
            .order_by(WorkflowVersion.version.desc())
        ).all()
        return [
            {
                "version": item.version,
                "created_at": item.created_at,
                "name": item.graph.get("name", workflow.name) if isinstance(item.graph, dict) else workflow.name,
                "node_count": len(item.graph.get("nodes", [])) if isinstance(item.graph, dict) else 0,
                "edge_count": len(item.graph.get("edges", [])) if isinstance(item.graph, dict) else 0,
            }
            for item in versions
        ]


@app.get("/api/workflows/{workflow_id}/versions/compare")
def compare_workflow_versions(
    workflow_id: UUID,
    from_version: int = Query(ge=1),
    to_version: int = Query(ge=1),
):
    if from_version == to_version:
        raise HTTPException(status_code=422, detail="Выберите две разные версии.")
    with SessionLocal() as session:
        if session.get(Workflow, workflow_id) is None:
            raise HTTPException(status_code=404, detail="Workflow not found")
        rows = session.scalars(select(WorkflowVersion).where(
            WorkflowVersion.workflow_id == workflow_id,
            WorkflowVersion.version.in_([from_version, to_version]),
        )).all()
        by_version = {item.version: item for item in rows}
        if from_version not in by_version or to_version not in by_version:
            raise HTTPException(status_code=404, detail="Workflow version not found")
        return {"from_version": from_version, "to_version": to_version,
                **_compare_workflow_graphs(by_version[from_version].graph, by_version[to_version].graph)}


@app.post("/api/workflows/{workflow_id}/versions/{version}/restore", status_code=201)
def restore_workflow_version(workflow_id: UUID, version: int):
    with SessionLocal() as session:
        workflow = session.get(Workflow, workflow_id)
        if workflow is None:
            raise HTTPException(status_code=404, detail="Workflow not found")
        source_version = session.scalar(
            select(WorkflowVersion).where(
                WorkflowVersion.workflow_id == workflow_id,
                WorkflowVersion.version == version,
            )
        )
        if source_version is None:
            raise HTTPException(status_code=404, detail="Workflow version not found")
        graph = WorkflowGraph.model_validate(source_version.graph)
        validation = validate_graph(graph, registry)
        if not validation.valid:
            raise HTTPException(status_code=422, detail=validation.model_dump())
        latest = session.scalar(
            select(WorkflowVersion)
            .where(WorkflowVersion.workflow_id == workflow_id)
            .order_by(WorkflowVersion.version.desc())
            .limit(1)
        )
        next_version = (latest.version if latest else 0) + 1
        workflow.name = graph.name
        session.add(WorkflowVersion(
            workflow_id=workflow_id,
            version=next_version,
            graph=graph.model_dump(mode="json"),
        ))
        session.commit()
        return {"id": str(workflow.id), "restored_from": version, "version": next_version, "name": workflow.name}


@app.post("/api/runs/{run_id}/cancel")
def cancel_workflow_run(run_id: UUID):
    with SessionLocal() as session:
        run = session.get(WorkflowRun, run_id)
        if run is None:
            raise HTTPException(status_code=404, detail="Run not found")
        if run.status in {"completed", "partial", "failed", "cancelled"}:
            raise HTTPException(status_code=409, detail=f"Run is already {run.status}")
        if run.status == "queued":
            run.status = "cancelled"
            run.finished_at = datetime.now(timezone.utc)
            run.error = "Cancelled before worker claimed the run"
        elif run.status == "running":
            run.status = "cancelling"
        elif run.status != "cancelling":
            raise HTTPException(status_code=409, detail=f"Run cannot be cancelled from status {run.status}")
        session.commit()
        return {"run_id": str(run.id), "status": run.status}


@app.post("/api/runs/{run_id}/retry", status_code=202)
def retry_workflow_run(run_id: UUID):
    with SessionLocal() as session:
        previous = session.get(WorkflowRun, run_id)
        if previous is None:
            raise HTTPException(status_code=404, detail="Run not found")
        if previous.status not in {"completed", "partial", "failed", "cancelled"}:
            raise HTTPException(status_code=409, detail="Only finished runs can be retried")
        graph = WorkflowGraph.model_validate(previous.graph_snapshot)
        validation = validate_graph(graph, registry)
        if not validation.valid:
            raise HTTPException(status_code=422, detail=validation.model_dump())
        retry = WorkflowRun(
            workflow_id=previous.workflow_id,
            status="queued",
            source="retry",
            graph_snapshot=previous.graph_snapshot,
        )
        session.add(retry)
        session.commit()
        return {"run_id": str(retry.id), "retry_of": str(previous.id), "status": "queued"}


@app.get("/api/workflows/{workflow_id}/runs")
def list_workflow_runs(workflow_id: UUID):
    with SessionLocal() as session:
        if session.get(Workflow, workflow_id) is None:
            raise HTTPException(status_code=404, detail="Workflow not found")
        rows = session.scalars(
            select(WorkflowRun)
            .where(WorkflowRun.workflow_id == workflow_id)
            .order_by(WorkflowRun.queued_at.desc())
        ).all()
        return [
            {
                "id": str(run.id),
                "status": run.status,
                "source": run.source,
                "queued_at": run.queued_at,
                "started_at": run.started_at,
                "finished_at": run.finished_at,
            }
            for run in rows
        ]

@app.get("/api/workflows/{workflow_id}/security-trend")
def workflow_security_trend(
    workflow_id: UUID,
    limit: int = Query(default=20, ge=2, le=100),
):
    """Return a bounded chronological security trend for the workflow."""
    with SessionLocal() as session:
        if session.get(Workflow, workflow_id) is None:
            raise HTTPException(status_code=404, detail="Workflow not found")
        rows = session.scalars(
            select(WorkflowRun)
            .where(WorkflowRun.workflow_id == workflow_id)
            .where(WorkflowRun.status.in_(["completed", "partial", "failed", "cancelled"]))
            .order_by(WorkflowRun.queued_at.desc())
            .limit(limit)
        ).all()
        points = []
        for run in reversed(rows):
            telemetry = _run_telemetry(session, run)
            points.append({
                "run_id": str(run.id),
                "status": run.status,
                "queued_at": run.queued_at,
                "finished_at": run.finished_at,
                "duration_ms": telemetry.get("duration_ms"),
                "total_findings": telemetry.get("total_findings", 0),
                "severity": telemetry.get("severity", {}),
                "security_gate": telemetry.get("security_gate"),
            })
        return {
            "workflow_id": str(workflow_id),
            "limit": limit,
            "points": points,
            "summary": {
                "runs": len(points),
                "latest_findings": points[-1]["total_findings"] if points else 0,
                "previous_findings": points[-2]["total_findings"] if len(points) > 1 else None,
                "delta": (
                    points[-1]["total_findings"] - points[-2]["total_findings"]
                    if len(points) > 1 else None
                ),
            },
        }



def _compare_scanner_runs(before_result: dict, after_result: dict) -> dict:
    """Compare cache use and scanner-specific findings across two runs."""
    scanner_types = {"scan.secrets", "scan.sca", "scan.sast"}
    before_trace = {str(item.get("node_id")): item for item in before_result.get("trace", []) if isinstance(item, dict) and item.get("type") in scanner_types and item.get("node_id")}
    after_trace = {str(item.get("node_id")): item for item in after_result.get("trace", []) if isinstance(item, dict) and item.get("type") in scanner_types and item.get("node_id")}
    before_outputs = before_result.get("outputs", {}) if isinstance(before_result.get("outputs"), dict) else {}
    after_outputs = after_result.get("outputs", {}) if isinstance(after_result.get("outputs"), dict) else {}
    before_meta = before_result.get("cache_metadata", {}) if isinstance(before_result.get("cache_metadata"), dict) else {}
    after_meta = after_result.get("cache_metadata", {}) if isinstance(after_result.get("cache_metadata"), dict) else {}
    scanners = []
    for node_id in sorted(set(before_trace) | set(after_trace)):
        old_trace, new_trace = before_trace.get(node_id), after_trace.get(node_id)
        old_output, new_output = before_outputs.get(node_id, {}), after_outputs.get(node_id, {})
        old_findings = {str(item.get("fingerprint")): item for item in old_output.get("findings", []) if isinstance(item, dict) and item.get("fingerprint")} if isinstance(old_output, dict) else {}
        new_findings = {str(item.get("fingerprint")): item for item in new_output.get("findings", []) if isinstance(item, dict) and item.get("fingerprint")} if isinstance(new_output, dict) else {}
        old_ids, new_ids = set(old_findings), set(new_findings)
        old_metadata, new_metadata = before_meta.get(node_id), after_meta.get(node_id)
        source_changed = None
        if isinstance(old_metadata, dict) and isinstance(new_metadata, dict) and old_metadata.get("source_hash") and new_metadata.get("source_hash"):
            source_changed = old_metadata["source_hash"] != new_metadata["source_hash"]
        scanners.append({
            "node_id": node_id, "type": (new_trace or old_trace).get("type"),
            "before_present": old_trace is not None, "after_present": new_trace is not None,
            "before_cached": old_trace.get("cached") is True if old_trace else None,
            "after_cached": new_trace.get("cached") is True if new_trace else None,
            "before_cache_age_seconds": old_trace.get("cache_age_seconds") if old_trace else None,
            "after_cache_age_seconds": new_trace.get("cache_age_seconds") if new_trace else None,
            "source_changed": source_changed,
            "before_findings": len(old_ids), "after_findings": len(new_ids),
            "added_findings": len(new_ids - old_ids), "removed_findings": len(old_ids - new_ids),
        })
    before_hits = sum(1 for item in before_trace.values() if item.get("cached") is True)
    after_hits = sum(1 for item in after_trace.values() if item.get("cached") is True)
    return {"cache_comparison": {"before_hits": before_hits, "after_hits": after_hits, "delta_hits": after_hits - before_hits, "before_scanners": len(before_trace), "after_scanners": len(after_trace)}, "scanner_comparison": scanners}

def _compare_run_snapshots(before: dict, after: dict) -> dict:
    """Compare two completed scan snapshots without treating partial absence as a fix."""
    old_findings = {
        str(item.get("fingerprint")): item
        for item in before.get("findings", [])
        if isinstance(item, dict) and item.get("fingerprint")
    }
    new_findings = {
        str(item.get("fingerprint")): item
        for item in after.get("findings", [])
        if isinstance(item, dict) and item.get("fingerprint")
    }
    old_ids, new_ids = set(old_findings), set(new_findings)
    complete_before = before.get("run", {}).get("status") == "completed" and not before.get("findings_truncated", False)
    complete_after = after.get("run", {}).get("status") == "completed" and not after.get("findings_truncated", False)

    def finding_summary(item: dict) -> dict:
        return {
            "fingerprint": item.get("fingerprint"),
            "rule_id": item.get("rule_id"),
            "severity": item.get("severity"),
            "path": item.get("path"),
            "line": item.get("line"),
        }

    candidate_added = [finding_summary(new_findings[key]) for key in sorted(new_ids - old_ids)]
    added = candidate_added if complete_before else []
    not_observed_before = [] if complete_before else candidate_added
    persisted = []
    for key in sorted(old_ids & new_ids):
        old, new = old_findings[key], new_findings[key]
        persisted.append({
            **finding_summary(new),
            "severity_changed": old.get("severity") != new.get("severity"),
            "previous_severity": old.get("severity"),
        })
    missing = [finding_summary(old_findings[key]) for key in sorted(old_ids - new_ids)]
    disappeared = missing if complete_after else []
    not_observed = [] if complete_after else missing

    old_trace = {
        str(item.get("node_id")): item
        for item in before.get("telemetry", {}).get("trace", [])
        if isinstance(item, dict) and item.get("node_id")
    }
    new_trace = {
        str(item.get("node_id")): item
        for item in after.get("telemetry", {}).get("trace", [])
        if isinstance(item, dict) and item.get("node_id")
    }
    node_changes = []
    for node_id in sorted(set(old_trace) | set(new_trace)):
        old, new = old_trace.get(node_id), new_trace.get(node_id)
        if old is None or new is None:
            node_changes.append({
                "node_id": node_id,
                "change": "added_to_trace" if old is None else "missing_from_trace",
                "before_status": old.get("status") if old else None,
                "after_status": new.get("status") if new else None,
            })
            continue
        fields = ("status", "duration_ms", "findings", "diagnostic_level", "reason_code")
        changes = {
            field: {"before": old.get(field), "after": new.get(field)}
            for field in fields if old.get(field) != new.get(field)
        }
        if changes:
            node_changes.append({"node_id": node_id, "change": "changed", "fields": changes})

    return {
        "findings": {
            "new": added,
            "not_observed_before": not_observed_before,
            "persisting": persisted,
            "disappeared": disappeared,
            "not_observed": not_observed,
            "absence_confirmed": complete_after,
            "summary": {
                "new": len(added),
                "not_observed_before": len(not_observed_before),
                "persisting": len(persisted),
                "disappeared": len(disappeared),
                "not_observed": len(not_observed),
            },
        },
        "nodes": node_changes,
        "summary": {
            "new_findings": len(added),
            "not_observed_before_findings": len(not_observed_before),
            "persisting_findings": len(persisted),
            "disappeared_findings": len(disappeared),
            "not_observed_findings": len(not_observed),
            "changed_nodes": len(node_changes),
        },
    }


@app.get("/api/workflows/{workflow_id}/runs/compare")
def compare_workflow_runs(
    workflow_id: UUID,
    from_run: UUID = Query(...),
    to_run: UUID = Query(...),
):
    if from_run == to_run:
        raise HTTPException(status_code=422, detail="Выберите два разных запуска.")
    terminal = {"completed", "partial", "failed", "cancelled"}
    with SessionLocal() as session:
        if session.get(Workflow, workflow_id) is None:
            raise HTTPException(status_code=404, detail="Workflow not found")
        before = session.get(WorkflowRun, from_run)
        after = session.get(WorkflowRun, to_run)
        if before is None or after is None:
            raise HTTPException(status_code=404, detail="Run not found")
        if before.workflow_id != workflow_id or after.workflow_id != workflow_id:
            raise HTTPException(status_code=404, detail="Run not found in this workflow")
        if before.status not in terminal or after.status not in terminal:
            raise HTTPException(status_code=409, detail="Сравнивать можно только завершённые запуски.")
        before_report = _build_run_report(session, before)
        after_report = _build_run_report(session, after)
        diff = _compare_run_snapshots(before_report, after_report)
        before_result = before.result if isinstance(before.result, dict) else {}
        after_result = after.result if isinstance(after.result, dict) else {}
        scanner_diff = _compare_scanner_runs(before_result, after_result)
        return {
            "workflow_id": str(workflow_id),
            **scanner_diff,
            "from_run": before_report["run"],
            "to_run": after_report["run"],
            **diff,
            "limitations": {
                "before_findings_truncated": before_report["findings_truncated"],
                "after_findings_truncated": after_report["findings_truncated"],
                "absence_confirmed": diff["findings"]["absence_confirmed"],
                "note": None if diff["findings"]["absence_confirmed"] else
                    "Полнота сравнения ограничена: запуск назначения неполный или один из отчётов усечён. Отсутствие находок не считается подтверждённым исправлением.",
            },
        }


def _cache_telemetry_summary(trace: list) -> dict:
    scanner_steps = [
        item for item in trace
        if isinstance(item, dict) and item.get("type") in {"scan.secrets", "scan.sca", "scan.sast"}
    ]
    hits = sum(1 for item in scanner_steps if item.get("cached") is True)
    total = len(scanner_steps)
    return {
        "scanner_blocks": total,
        "cache_hits": hits,
        "fresh_scans": total - hits,
        "hit_rate": round(hits / total, 4) if total else 0.0,
        "ttl_seconds": CACHE_TTL_SECONDS,
    }


def _run_telemetry(session, run: WorkflowRun):
    findings = session.scalars(select(Finding).where(Finding.run_id == run.id)).all()
    severity = {}
    for finding in findings:
        key = (finding.severity or "UNKNOWN").upper()
        severity[key] = severity.get(key, 0) + 1

    result = run.result if isinstance(run.result, dict) else {}
    trace = result.get("trace", []) if isinstance(result, dict) else []
<<<<<<< Updated upstream
    progress = result if run.status in {"running", "cancelling"} and "completed_nodes" in result else None
=======
    progress = (
        result if run.status == "running" and "completed_nodes" in result else None
    )
>>>>>>> Stashed changes
    if progress:
        severity = progress.get("severity", severity)
    total_findings = (
        progress.get("total_findings", len(findings)) if progress else len(findings)
    )
    now = datetime.now(timezone.utc)
    duration_ms = None
    if run.started_at:
        ended = run.finished_at or now
        duration_ms = max(0, round((ended - run.started_at).total_seconds() * 1000))

    scanner_types = {"scan.secrets", "scan.sca", "scan.sast"}
    scanners = [
        {
            "node_id": item.get("node_id"),
            "type": item.get("type"),
            "status": item.get("status"),
            "findings": item.get("findings", 0),
            "duration_ms": item.get("duration_ms"),
        }
        for item in trace
        if item.get("type") in scanner_types
    ]
    return {
        "run_id": str(run.id),
        "workflow_id": str(run.workflow_id) if run.workflow_id else None,
        "status": run.status,
        "source": run.source,
        "queued_at": run.queued_at,
        "started_at": run.started_at,
        "finished_at": run.finished_at,
        "duration_ms": duration_ms,
        "total_findings": total_findings,
        "severity": severity,
        "scanners": scanners,
        "cache": _cache_telemetry_summary(trace),
        "trace": trace,
        "completed_nodes": (
            progress.get("completed_nodes", len(trace)) if progress else len(trace)
        ),
        "total_nodes": (
            progress.get("total_nodes", len(run.graph_snapshot.get("nodes", [])))
            if progress
            else len(run.graph_snapshot.get("nodes", []))
        ),
        "current_node": progress.get("current_node") if progress else None,
        "scanner_progress": progress.get("scanner_progress") if progress else None,
        "node_results": (
            progress.get("node_results", {})
            if progress
            else {
                node_id: {
                    "status": output.get("status"),
                    **({"message": output["message"]} if output.get("message") else {}),
<<<<<<< Updated upstream
                    **({"findings": output["summary"]["total"]} if isinstance(output.get("summary"), dict) else {}),
                    **({
                        "explained_count": output.get("explained_count", len(output.get("explanations", []))),
                        "analyzed_count": output.get("analyzed_count", 0),
                        "skipped_count": output.get("skipped_count", 0),
                        "unexplained_count": output.get("unexplained_count", 0),
                        "coverage": output.get("coverage", 0),
                        "provider": output.get("provider"),
                        "model": output.get("model"),
                    } if node_id in {item.get("node_id") for item in trace if item.get("type") == "ai.explain"} else {}),
                    **({"total_findings": len(output.get("findings", []))} if node_id in {item.get("node_id") for item in trace if item.get("type") == "ai.explain"} else {}),
                    **({"explanations": [
=======
                    **(
                        {"findings": output["summary"]["total"]}
                        if isinstance(output.get("summary"), dict)
                        else {}
                    ),
                    **(
>>>>>>> Stashed changes
                        {
                            "explained_count": output.get(
                                "explained_count", len(output.get("explanations", []))
                            )
                        }
                        if node_id
                        in {
                            item.get("node_id")
                            for item in trace
                            if item.get("type") == "ai.explain"
                        }
                        else {}
                    ),
                    **(
                        {"total_findings": len(output.get("findings", []))}
                        if node_id
                        in {
                            item.get("node_id")
                            for item in trace
                            if item.get("type") == "ai.explain"
                        }
                        else {}
                    ),
                    **(
                        {
                            "explanations": [
                                {
                                    "root_cause": str(item.get("root_cause", ""))[:240],
                                    "impact": str(item.get("impact", ""))[:180],
                                    "recommendation": str(
                                        item.get("recommendation", "")
                                    )[:240],
                                }
                                for item in output.get("explanations", [])[:3]
                            ]
                        }
                        if node_id
                        in {
                            item.get("node_id")
                            for item in trace
                            if item.get("type") == "ai.explain"
                        }
                        else {}
                    ),
                }
                for node_id, output in (
                    result.get("outputs", {}) if isinstance(result, dict) else {}
                ).items()
            }
        ),
        "security_gate": result.get("security_gate"),
        "error": run.error,
    }


@app.get("/api/workflows/{workflow_id}/telemetry/latest")
def latest_workflow_telemetry(workflow_id: UUID):
    with SessionLocal() as session:
        if session.get(Workflow, workflow_id) is None:
            raise HTTPException(status_code=404, detail="Workflow not found")
        run = session.scalar(
            select(WorkflowRun)
            .where(WorkflowRun.workflow_id == workflow_id)
            .order_by(WorkflowRun.queued_at.desc())
            .limit(1)
        )
        if run is None:
            return {
                "status": "never_run",
                "total_findings": 0,
                "severity": {},
                "scanners": [],
            }
        return _run_telemetry(session, run)


def _safe_report_value(value, key: str = ""):
    """Bound and redact report content before it leaves the API."""
    if re.search(r"(?i)(api[_-]?key|access[_-]?token|authorization|password|passwd|client[_-]?secret|private[_-]?key|ciphertext|nonce)", key):
        return "[REDACTED]"
    if isinstance(value, dict):
        return {
            str(child_key)[:120]: _safe_report_value(child_value, str(child_key))
            for child_key, child_value in list(value.items())[:500]
        }
    if isinstance(value, (list, tuple)):
        return [_safe_report_value(item) for item in value[:5000]]
    if isinstance(value, str):
        return redact_text(_redact(value[:5000]))
    if value is None or isinstance(value, (bool, int, float)):
        return value
    return str(value)[:500]


def _compare_workflow_graphs(before: dict, after: dict) -> dict:
    def indexed(graph: dict, key: str) -> dict:
        rows = graph.get(key, []) if isinstance(graph, dict) else []
        return {str(item.get("id")): item for item in rows if isinstance(item, dict) and item.get("id") is not None}

    old_nodes, new_nodes = indexed(before, "nodes"), indexed(after, "nodes")
    old_edges, new_edges = indexed(before, "edges"), indexed(after, "edges")
    added_nodes = sorted(set(new_nodes) - set(old_nodes))
    removed_nodes = sorted(set(old_nodes) - set(new_nodes))
    changed_nodes = []
    for node_id in sorted(set(old_nodes) & set(new_nodes)):
        old, new = old_nodes[node_id], new_nodes[node_id]
        changes = []
        for field in ("type", "config", "position"):
            if old.get(field, {}) != new.get(field, {}):
                changes.append({"field": field, "before": _safe_report_value(old.get(field, {}), field),
                                "after": _safe_report_value(new.get(field, {}), field)})
        if changes:
            changed_nodes.append({"id": node_id, "label": _safe_report_value(new.get("config", {}).get("label", new.get("type", node_id))),
                                  "changes": changes})
    added_edges = sorted(set(new_edges) - set(old_edges))
    removed_edges = sorted(set(old_edges) - set(new_edges))
    return {
        "name_changed": before.get("name") != after.get("name"),
        "name_before": _safe_report_value(before.get("name", "")),
        "name_after": _safe_report_value(after.get("name", "")),
        "nodes": {
            "added": [{"id": key, "type": _safe_report_value(new_nodes[key].get("type", ""))} for key in added_nodes],
            "removed": [{"id": key, "type": _safe_report_value(old_nodes[key].get("type", ""))} for key in removed_nodes],
            "changed": changed_nodes,
        },
        "edges": {
            "added": [{"id": key, "source": new_edges[key].get("source"), "target": new_edges[key].get("target")} for key in added_edges],
            "removed": [{"id": key, "source": old_edges[key].get("source"), "target": old_edges[key].get("target")} for key in removed_edges],
        },
        "summary": {"added_nodes": len(added_nodes), "removed_nodes": len(removed_nodes), "changed_nodes": len(changed_nodes),
                    "added_edges": len(added_edges), "removed_edges": len(removed_edges)},
    }


def _build_run_report(session, run: WorkflowRun) -> dict:
    telemetry = _safe_report_value(_run_telemetry(session, run))
    rows = session.scalars(
        select(Finding).where(Finding.run_id == run.id).order_by(Finding.severity, Finding.path, Finding.line).limit(5000)
    ).all()
    findings = [
        _safe_report_value({
            "fingerprint": item.fingerprint,
            "rule_id": item.rule_id,
            "severity": item.severity,
            "path": item.path,
            "line": item.line,
            **(item.payload if isinstance(item.payload, dict) else {}),
        })
        for item in rows
    ]
    return {
        "report_version": 1,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "run": {
            "id": str(run.id),
            "workflow_id": str(run.workflow_id) if run.workflow_id else None,
            "status": run.status,
            "source": run.source,
            "queued_at": run.queued_at.isoformat() if run.queued_at else None,
            "started_at": run.started_at.isoformat() if run.started_at else None,
            "finished_at": run.finished_at.isoformat() if run.finished_at else None,
            "error": _safe_report_value(run.error) if run.error else None,
        },
        "telemetry": telemetry,
        "findings": findings,
        "findings_truncated": len(rows) >= 5000,
    }


@app.post("/api/projects/{project_id}/reports/{run_id}", status_code=201)
def save_run_report_to_project(project_id: UUID, run_id: UUID):
    with SessionLocal() as session:
        project = session.get(Project, project_id)
        run = session.get(WorkflowRun, run_id)
        if project is None:
            raise HTTPException(status_code=404, detail="Project not found")
        if run is None:
            raise HTTPException(status_code=404, detail="Run not found")
        root = _project_root(project)
        reports_dir = root / "reports"
        if reports_dir.is_symlink():
            raise HTTPException(status_code=400, detail="Report directory is unavailable")
        reports_dir.mkdir(mode=0o750, exist_ok=True)
        if reports_dir.resolve(strict=True).parent != root:
            raise HTTPException(status_code=400, detail="Invalid report directory")
        report = _build_run_report(session, run)
        payload = json.dumps(report, ensure_ascii=False, indent=2, default=str)
        if len(payload.encode("utf-8")) > 10 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="Report exceeds the 10 MiB project storage limit")
        filename = f"run-{run_id}.json"
        destination = reports_dir / filename
        if destination.is_symlink() or destination.exists():
            raise HTTPException(status_code=409, detail="A report for this run already exists in the project")
        try:
            with destination.open("x", encoding="utf-8") as stream:
                stream.write(payload)
        except FileExistsError as exc:
            raise HTTPException(status_code=409, detail="A report for this run already exists in the project") from exc
        session.add(AuditLog(
            action="report_saved",
            entity="project",
            entity_id=str(project_id),
            details={"run_id": str(run_id), "path": f"reports/{filename}", "bytes": len(payload.encode("utf-8"))},
        ))
        session.commit()
        return {"project_id": str(project_id), "run_id": str(run_id), "path": f"reports/{filename}", "bytes": len(payload.encode("utf-8"))}


@app.get("/api/runs/{run_id}/report.json")
def export_run_report_json(run_id: UUID):
    with SessionLocal() as session:
        run = session.get(WorkflowRun, run_id)
        if run is None:
            raise HTTPException(status_code=404, detail="Run not found")
        return _build_run_report(session, run)


@app.get("/api/runs/{run_id}/report.html", response_class=HTMLResponse)
def export_run_report_html(run_id: UUID):
    with SessionLocal() as session:
        run = session.get(WorkflowRun, run_id)
        if run is None:
            raise HTTPException(status_code=404, detail="Run not found")
        report = _build_run_report(session, run)
    encoded = html.escape(json.dumps(report, ensure_ascii=False, indent=2, default=str))
    title = html.escape(f"INVEST · Отчёт запуска {report['run']['id']}")
    document = f"""<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title><style>
:root{{color-scheme:dark}}body{{margin:0;padding:32px;background:#0b1119;color:#d7e3ee;font:14px/1.6 system-ui,sans-serif}}
main{{max-width:1100px;margin:auto}}h1{{font-size:22px}}.meta{{color:#8ea5b9}}pre{{overflow:auto;padding:20px;border:1px solid #26384a;border-radius:8px;background:#101c29;color:#c4d9e9;white-space:pre-wrap;overflow-wrap:anywhere}}
@media(max-width:640px){{body{{padding:14px}}pre{{padding:12px;font-size:12px}}}}
</style></head><body><main><h1>Отчёт INVEST</h1><p class="meta">Запуск {html.escape(report['run']['id'])} · статус {html.escape(report['run']['status'])}</p>
<p>Отчёт содержит телеметрию, хронологию, диагностические сообщения и находки. Секретные поля и значения маскируются.</p><pre>{encoded}</pre></main></body></html>"""
    return HTMLResponse(document, headers={"Content-Disposition": f'inline; filename="invest-run-{run_id}.html"' })


@app.get("/api/runs/{run_id}/telemetry")
def get_run_telemetry(run_id: UUID):
    with SessionLocal() as session:
        run = session.get(WorkflowRun, run_id)
        if run is None:
            raise HTTPException(status_code=404, detail="Run not found")
        return _run_telemetry(session, run)


@app.get("/api/runs/{run_id}/events")
def stream_run_events(run_id: UUID):
    def event_stream():
        deadline = time.monotonic() + 1800
        while time.monotonic() < deadline:
            with SessionLocal() as session:
                run = session.get(WorkflowRun, run_id)
                if run is None:
                    payload = {"status": "not_found", "run_id": str(run_id)}
                    yield "event: error\ndata: " + json.dumps(payload) + "\n\n"
                    return
                payload = _run_telemetry(session, run)
            yield "data: " + json.dumps(payload, default=str) + "\n\n"
            if payload["status"] in {"completed", "partial", "failed", "cancelled"}:
                return
            time.sleep(1)

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.get("/api/runs/{run_id}")
def get_run(run_id: UUID):
    with SessionLocal() as session:
        run = session.get(WorkflowRun, run_id)
        if run is None:
            raise HTTPException(status_code=404, detail="Run not found")
        return {
            "id": str(run.id),
            "workflow_id": str(run.workflow_id) if run.workflow_id else None,
            "status": run.status,
            "source": run.source,
            "result": run.result,
            "error": run.error,
            "queued_at": run.queued_at,
            "started_at": run.started_at,
            "finished_at": run.finished_at,
        }


@app.get("/api/runs/{run_id}/findings")
def list_run_findings(run_id: UUID):
    with SessionLocal() as session:
        if session.get(WorkflowRun, run_id) is None:
            raise HTTPException(status_code=404, detail="Run not found")
        rows = session.scalars(
            select(Finding)
            .where(Finding.run_id == run_id)
            .order_by(Finding.severity, Finding.path, Finding.line)
        ).all()
        return [
            {
                "id": str(item.id),
                "fingerprint": item.fingerprint,
                "rule_id": item.rule_id,
                "severity": item.severity,
                "path": item.path,
                "line": item.line,
                **item.payload,
            }
            for item in rows
        ]


@app.get("/api/runs/{run_id}/findings/{fingerprint}/source")
def get_finding_source(
    run_id: UUID,
    fingerprint: str,
    start_line: int | None = Query(default=None, ge=1),
    end_line: int | None = Query(default=None, ge=1),
):
    """Return a bounded, redacted source window for a finding belonging to this run."""
    if not fingerprint or len(fingerprint) > 64:
        raise HTTPException(status_code=422, detail="Invalid finding fingerprint")
    if start_line is not None and end_line is not None and end_line < start_line:
        raise HTTPException(status_code=422, detail="end_line must be >= start_line")
    if (
        start_line is not None
        and end_line is not None
        and end_line - start_line + 1 > 300
    ):
        raise HTTPException(
            status_code=422, detail="Source window is limited to 300 lines"
        )

    with SessionLocal() as session:
        run = session.get(WorkflowRun, run_id)
        if run is None:
            raise HTTPException(status_code=404, detail="Run not found")
        finding = session.scalar(
            select(Finding)
            .where(Finding.run_id == run_id, Finding.fingerprint == fingerprint)
            .limit(1)
        )
        if finding is None:
            raise HTTPException(status_code=404, detail="Finding not found in this run")
        payload = finding.payload if isinstance(finding.payload, dict) else {}
        try:
            source_file = resolve_run_source_file(
                settings.workspace_root,
                run.graph_snapshot,
                run.result or {},
                finding.path,
            )
            if source_file.stat().st_size > 1_000_000:
                raise RunSourceFileError("Source file exceeds the 1 MiB preview limit")
            content = source_file.read_text(encoding="utf-8")
        except (RunSourceFileError, OSError, UnicodeDecodeError) as exc:
            raise HTTPException(
                status_code=404, detail="Source file is unavailable for this run"
            ) from exc

        lines = content.splitlines()
        total_lines = len(lines)
        center = finding.line or 1
        first = start_line if start_line is not None else max(1, center - 40)
        last = end_line if end_line is not None else min(total_lines, first + 99)
        if first > max(total_lines, 1):
            raise HTTPException(
                status_code=416, detail="Requested source window is outside the file"
            )
        last = min(last, first + 299, total_lines)
        redact_entire_file = str(payload.get("category", "")).upper() == "SECRET"
        window = [
            {
                "line": number,
                "text": (
                    "[REDACTED: secret-bearing source file]"
                    if redact_entire_file
                    else _redact(lines[number - 1])[:1000]
                ),
                "is_finding": number == finding.line,
            }
            for number in range(first, last + 1)
        ]
        return {
            "path": finding.path,
            "finding_line": finding.line,
            "start_line": first,
            "end_line": last,
            "total_lines": total_lines,
            "redacted": redact_entire_file,
            "lines": window,
        }


@app.post("/api/workflows/run")
def run_workflow(graph: WorkflowGraph):
    try:
        return execute_graph(graph, registry)
    except WorkflowExecutionError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.get("/api/workflows/{workflow_id}/finding-states")
def list_finding_states(workflow_id: UUID):
    with SessionLocal() as session:
        if session.get(Workflow, workflow_id) is None:
            raise HTTPException(status_code=404, detail="Workflow not found")
        rows = session.scalars(
            select(FindingState)
            .where(FindingState.workflow_id == workflow_id)
            .order_by(FindingState.fingerprint)
        ).all()
        return [
            {
                "fingerprint": row.fingerprint,
                "state": row.state,
                "reason": row.reason,
                "expires_at": row.expires_at,
            }
            for row in rows
        ]


@app.put("/api/workflows/{workflow_id}/findings/{fingerprint}/state")
def update_finding_state(
    workflow_id: UUID, fingerprint: str, payload: FindingStateUpdate
):
    if not fingerprint or len(fingerprint) > 64:
        raise HTTPException(status_code=422, detail="Invalid finding fingerprint")
    if payload.state != "accepted_risk" and payload.expires_at is not None:
        raise HTTPException(
            status_code=422,
            detail="Срок действия допускается только для accepted_risk.",
        )

    with SessionLocal() as session:
        if session.get(Workflow, workflow_id) is None:
            raise HTTPException(status_code=404, detail="Workflow not found")
        finding = session.scalar(
            select(Finding)
            .join(WorkflowRun, Finding.run_id == WorkflowRun.id)
            .where(
                WorkflowRun.workflow_id == workflow_id,
                Finding.fingerprint == fingerprint,
            )
            .limit(1)
        )
        if finding is None:
            raise HTTPException(
                status_code=404, detail="Finding not found in this workflow"
            )

        state_row = session.scalar(
            select(FindingState).where(
                FindingState.workflow_id == workflow_id,
                FindingState.fingerprint == fingerprint,
            )
        )
        previous_state = state_row.state if state_row else None
        if state_row is None:
            state_row = FindingState(
                workflow_id=workflow_id,
                fingerprint=fingerprint,
                state=payload.state,
                reason=payload.reason,
                expires_at=payload.expires_at,
            )
            session.add(state_row)
        else:
            state_row.state = payload.state
            state_row.reason = payload.reason
            state_row.expires_at = payload.expires_at

        session.add(
            AuditLog(
                action="finding.state.changed",
                entity="finding_state",
                entity_id=f"{workflow_id}:{fingerprint}",
                details={
                    "workflow_id": str(workflow_id),
                    "fingerprint": fingerprint,
                    "previous_state": previous_state,
                    "new_state": payload.state,
                    "reason": payload.reason,
                    "expires_at": (
                        payload.expires_at.isoformat() if payload.expires_at else None
                    ),
                },
            )
        )
        session.commit()
        return {
            "fingerprint": fingerprint,
            "previous_state": previous_state,
            "state": state_row.state,
            "reason": state_row.reason,
            "expires_at": state_row.expires_at,
        }


@app.get("/api/workflows/{workflow_id}/findings/{fingerprint}/history")
def finding_state_history(workflow_id: UUID, fingerprint: str):
    with SessionLocal() as session:
        if session.get(Workflow, workflow_id) is None:
            raise HTTPException(status_code=404, detail="Workflow not found")
        entity_id = f"{workflow_id}:{fingerprint}"
        rows = session.scalars(
            select(AuditLog)
            .where(AuditLog.entity == "finding_state", AuditLog.entity_id == entity_id)
            .order_by(AuditLog.created_at.desc(), AuditLog.id.desc())
        ).all()
        return [
            {
                "action": row.action,
                "details": row.details,
                "created_at": row.created_at,
            }
            for row in rows
        ]
