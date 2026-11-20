import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ReactFlow, Background, Controls, MiniMap, Handle, Position, addEdge, reconnectEdge,
    useEdgesState, useNodesState,
    type Connection, type Edge, type Node, type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
<<<<<<< Updated upstream
  Activity, AlertTriangle, Bot, Check, ChevronDown, CircleHelp, CirclePlay,
  Code2, GitBranch, Layers3, LockKeyhole, Plus, Search, Shield, Trash2,
  UploadCloud, Workflow, X, Zap, Copy, Save, RefreshCw, ArrowLeftRight,
  PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, FolderOpen, FileText, Pencil, ChevronRight, Download,
=======
    Activity, AlertTriangle, Bot, Check, ChevronDown, CircleHelp, CirclePlay,
    Code2, GitBranch, Layers3, LockKeyhole, Plus, Search, Shield, Trash2,
    UploadCloud, Workflow, X, Zap, Copy, Save, RefreshCw, ArrowLeftRight,
    PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, FolderOpen, FileText, Pencil, ChevronRight,
>>>>>>> Stashed changes
} from "lucide-react";

type Manifest = { type: string; title: string; category: string; description: string };
type Project = { id: string; name: string; workspace_path: string; original_filename?: string | null; file_count: number; expanded_bytes: number; created_at: string; updated_at: string };
type ProjectFile = { path: string; size: number };
type ProjectTreeNode = { name: string; path: string; kind: "directory" | "file"; size?: number; children: ProjectTreeNode[] };
type ProjectHistoryEntry = { action: string; created_at: string; details: { file_count?: number; expanded_bytes?: number; previous_name?: string; name?: string; path?: string; changes?: { added_count?: number; removed_count?: number; changed_count?: number; compared_files?: number; added_files?: string[]; removed_files?: string[]; changed_files?: string[]; sample_truncated?: boolean } } };
type ProjectFilePreview = { path: string; start_line: number; end_line: number; total_lines: number; editable?: boolean; content?: string | null; lines: Array<{ line: number; text: string }> };
type ProjectVisualPreview = { path: string; url: string; kind: "image" | "pdf" };
type ProjectEditorTab = { path: string; name: string; kind: "text" | "image" | "pdf"; draft: string; baseline: string; editing: boolean };
type ProjectSearchResult = { path: string; line: number; text: string };
type Finding = { id?: string; fingerprint?: string; rule_id: string; severity: string; path: string; line?: number; message?: string; masked_value?: string; why_it_matters?: string; recommendation?: string; cwe?: string[]; cve?: string | null; code_context?: Array<{ line: number; text: string; is_finding: boolean }>; start_line?: number; end_line?: number; code_context_redacted?: boolean; ai_explanation?: { root_cause: string; impact: string; recommendation: string; confidence: number; evidence_limits: string; source_evidence?: Array<{ line: number; text: string; is_finding: boolean }> } };
type FindingLifecycle = { state: "open" | "accepted_risk" | "fixed" | "false_positive"; reason: string; expires_at?: string | null };
type WorkflowVersionDiff = { from_version: number; to_version: number; name_changed: boolean; name_before: string; name_after: string; nodes: { added: Array<{id:string;type:string}>; removed: Array<{id:string;type:string}>; changed: Array<{id:string;label:string;changes:Array<{field:string;before:unknown;after:unknown}>}> }; edges: { added: Array<{id:string;source:string;target:string}>; removed: Array<{id:string;source:string;target:string}> }; summary: Record<string,number> };
type WorkflowVersionSummary = { version: number; created_at: string; name: string; node_count: number; edge_count: number };
type WorkflowRunSummary = { id: string; status: string; source?: string; queued_at?: string; started_at?: string; finished_at?: string; total_findings?: number; severity?: Record<string, number>; cache?: { scanner_blocks: number; cache_hits: number; fresh_scans: number; hit_rate: number; ttl_seconds: number } };
type SecurityTrend = {
  points: Array<{ run_id: string; status: string; queued_at?: string | null; finished_at?: string | null; duration_ms?: number | null; total_findings: number; severity: Record<string, number>; security_gate?: { decision?: "PASS" | "WARN" | "BLOCK"; blocked?: boolean } | null }>;
  summary: { runs: number; latest_findings: number; previous_findings: number | null; delta: number | null };
};
type RunComparison = {
  from_run: { id: string; status: string; finished_at?: string | null };
  to_run: { id: string; status: string; finished_at?: string | null };
  findings: {
    new: Array<{ fingerprint: string; rule_id?: string; severity?: string; path?: string; line?: number | null }>;
    not_observed_before: Array<{ fingerprint: string; rule_id?: string; severity?: string; path?: string; line?: number | null }>;
    persisting: Array<{ fingerprint: string; rule_id?: string; severity?: string; previous_severity?: string; severity_changed: boolean; path?: string; line?: number | null }>;
    disappeared: Array<{ fingerprint: string; rule_id?: string; severity?: string; path?: string; line?: number | null }>;
    not_observed: Array<{ fingerprint: string; rule_id?: string; severity?: string; path?: string; line?: number | null }>;
    absence_confirmed: boolean;
    summary: { new: number; not_observed_before: number; persisting: number; disappeared: number; not_observed: number };
  };
  nodes: Array<{ node_id: string; change: string; fields?: Record<string, { before: unknown; after: unknown }> }>;
  summary: { new_findings: number; not_observed_before_findings: number; persisting_findings: number; disappeared_findings: number; not_observed_findings: number; changed_nodes: number };
  limitations: { before_findings_truncated: boolean; after_findings_truncated: boolean; absence_confirmed: boolean; note?: string | null };
};
type SourcePreview = { path: string; finding_line: number | null; start_line: number; end_line: number; total_lines: number; redacted: boolean; lines: Array<{ line: number; text: string; is_finding: boolean }> };
type Telemetry = {
<<<<<<< Updated upstream
  run_id?: string; status: string; source?: string; queued_at?: string; started_at?: string;
  finished_at?: string; duration_ms?: number | null; total_findings: number;
  severity: Record<string, number>;
  cache?: { scanner_blocks: number; cache_hits: number; fresh_scans: number; hit_rate: number; ttl_seconds: number };
  scanners: Array<{ node_id?: string; type: string; status: string; findings: number; duration_ms?: number | null }>;
  completed_nodes?: number; total_nodes?: number; current_node?: string | null;
  security_gate?: { decision: "PASS" | "WARN" | "BLOCK"; blocked: boolean; counts: Record<string, number>; policy: { block_on: string[]; warn_on: string[] } } | null;
  trace?: Array<{ node_id: string; type: string; status: string; diagnostic_level?: "info" | "warning" | "error" | "blocked"; reason_code?: string; reason?: string; message?: string; provider?: string; model?: string; provider_request_ms?: number; provider_attempts?: number; provider_http_status?: number; provider_error_code?: string | null; duration_ms?: number; findings?: number; cached?: boolean; cache_bypass_reason?: string; cache_age_seconds?: number }>;
  scanner_progress?: { files_scanned: number; total_files: number; current_file: string } | null;
  node_results?: Record<string, { status?: string; message?: string; findings?: number; severity?: Record<string, number>; explained_count?: number; analyzed_count?: number; skipped_count?: number; unexplained_count?: number; coverage?: number; provider?: string | null; model?: string | null; provider_request_ms?: number | null; provider_attempts?: number | null; provider_http_status?: number | null; provider_error_code?: string | null; total_findings?: number; explanations?: Array<{ root_cause?: string; impact?: string; recommendation?: string }> }>;
=======
    run_id?: string; status: string; source?: string; queued_at?: string; started_at?: string;
    finished_at?: string; duration_ms?: number | null; total_findings: number;
    severity: Record<string, number>;
    scanners: Array<{ node_id?: string; type: string; status: string; findings: number; duration_ms?: number | null }>;
    completed_nodes?: number; total_nodes?: number; current_node?: string | null;
    security_gate?: { decision: "PASS" | "WARN" | "BLOCK"; blocked: boolean; counts: Record<string, number>; policy: { block_on: string[]; warn_on: string[] } } | null;
    trace?: Array<{ node_id: string; type: string; status: string; duration_ms?: number; findings?: number }>;
    scanner_progress?: { files_scanned: number; total_files: number; current_file: string } | null;
    node_results?: Record<string, { status?: string; message?: string; findings?: number; severity?: Record<string, number>; explained_count?: number; total_findings?: number; explanations?: Array<{ root_cause?: string; impact?: string; recommendation?: string }> }>;
>>>>>>> Stashed changes
};
type NodeData = { label: string; nodeType: string; category: string; description: string; config: Record<string, unknown>; executionStatus?: "idle" | "queued" | "running" | "completed" | "failed" | "blocked" | "configuration_required"; executionDetail?: string; executionNotes?: string[]; executionSeverity?: Record<string, number>; executionDuration?: number | null; executionCount?: number; executionCoverage?: number; executionProgress?: number; executionProgressLabel?: string };
type FlowNode = Node<NodeData>;

const formatDuration = (ms?: number | null) => ms == null ? "—" : ms < 1000 ? `${Math.round(ms)} мс` : ms < 60000 ? `${(ms / 1000).toFixed(1)} с` : `${Math.floor(ms / 60000)} мин ${Math.round((ms % 60000) / 1000)} с`;
const formatDate = (value?: string) => value ? new Date(value).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—";

const highlightCodeLine = (source: string): React.ReactNode[] => {
  const pattern = /(\/\/.*$|#.*$|\/\*.*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:const|let|var|function|return|if|else|for|while|class|interface|type|import|export|from|async|await|try|catch|throw|new|public|private|protected|static|fun|val|var|package|object|when|true|false|null|None|True|False|def|self)\b|\b\d+(?:\.\d+)?\b)/g;
  const output: React.ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(source)) !== null) {
    if (match.index > cursor) output.push(source.slice(cursor, match.index));
    const token = match[0];
    const tone = /^(\/\/|#|\/\*)/.test(token) ? "comment"
      : /^["']/.test(token) ? "string"
      : /^\d/.test(token) ? "number" : "keyword";
    output.push(<span className={"syntax-" + tone} key={match.index}>{token}</span>);
    cursor = match.index + token.length;
  }
  if (cursor < source.length) output.push(source.slice(cursor));
  return output;
};


const categoryMeta: Record<string, { label: string; tone: string }> = {
    Trigger: { label: "Триггер", tone: "blue" }, Source: { label: "Источник", tone: "cyan" },
    Security: { label: "Security", tone: "violet" }, Logic: { label: "Логика", tone: "amber" },
    AI: { label: "AI", tone: "pink" }, Notify: { label: "Уведомления", tone: "green" },
    CI: { label: "CI / Gate", tone: "green" },
};
const seedNodes: FlowNode[] = [
    { id: "trigger", type: "workflow", position: { x: 70, y: 190 }, data: { label: "Manual trigger", nodeType: "trigger.manual", category: "Trigger", description: "Ручной запуск проверки по кнопке «Запустить».", config: {} } },
    { id: "source", type: "workflow", position: { x: 300, y: 190 }, data: { label: "Project source", nodeType: "source.upload", category: "Source", description: "Выбери ZIP-архив или Git-репозиторий. Пока источник не задан, сканеры не запускаются.", config: {} } },
    { id: "secrets", type: "workflow", position: { x: 550, y: 100 }, data: { label: "Secrets scanner", nodeType: "scan.secrets", category: "Security", description: "Ищет токены, ключи и другие потенциально раскрытые секреты.", config: {} } },
    { id: "sca", type: "workflow", position: { x: 550, y: 285 }, data: { label: "Dependency scanner", nodeType: "scan.sca", category: "Security", description: "Проверяет Gradle-зависимости по локальному advisory snapshot.", config: {} } },
    { id: "sast", type: "workflow", position: { x: 550, y: 470 }, data: { label: "Kotlin SAST", nodeType: "scan.sast", category: "Security", description: "Статически анализирует Kotlin/Spring-код на поддерживаемые классы проблем.", config: {} } },
    { id: "merge", type: "workflow", position: { x: 850, y: 285 }, data: { label: "Merge findings", nodeType: "findings.merge", category: "Logic", description: "Объединяет результаты сканеров и удаляет дубликаты по fingerprint.", config: {} } },
    { id: "gate", type: "workflow", position: { x: 1120, y: 285 }, data: { label: "Security Gate", nodeType: "ci.gate", category: "CI", description: "Блокирует workflow при CRITICAL/HIGH находках; пороги настраиваются в конфигурации.", config: { block_on: ["CRITICAL", "HIGH"], warn_on: ["MEDIUM", "LOW", "INFO"] } } },
    { id: "ai-explain", type: "workflow", position: { x: 1120, y: 70 }, data: { label: "AI explanation", nodeType: "ai.explain", category: "AI", description: "Объясняет подтверждённые находки: причина, влияние и рекомендации. Требует LLM-настройки в корневом .env.", config: { language: "ru", max_findings: 20 } } },
];
const seedEdges: Edge[] = [
    { id: "e1", source: "trigger", target: "source", type: "smoothstep", animated: false, className: "edge-idle", style: { stroke: "#6686a5", strokeWidth: 2 }, label: "запуск" },
    { id: "e2", source: "source", target: "secrets", type: "smoothstep", animated: false, className: "edge-idle", style: { stroke: "#6686a5", strokeWidth: 2 } },
    { id: "e3", source: "source", target: "sca", type: "smoothstep", animated: false, className: "edge-idle", style: { stroke: "#6686a5", strokeWidth: 2 } },
    { id: "e4", source: "source", target: "sast", type: "smoothstep", animated: false, className: "edge-idle", style: { stroke: "#6686a5", strokeWidth: 2 } },
    { id: "e5", source: "secrets", target: "merge", type: "smoothstep", animated: false, className: "edge-idle", style: { stroke: "#6686a5", strokeWidth: 2 } },
    { id: "e6", source: "sca", target: "merge", type: "smoothstep", animated: false, className: "edge-idle", style: { stroke: "#6686a5", strokeWidth: 2 } },
    { id: "e7", source: "sast", target: "merge", type: "smoothstep", animated: false, className: "edge-idle", style: { stroke: "#6686a5", strokeWidth: 2 } },
    { id: "e8", source: "merge", target: "gate", type: "smoothstep", animated: false, className: "edge-idle", style: { stroke: "#6686a5", strokeWidth: 2 }, label: "policy" },
    { id: "e9", source: "merge", target: "ai-explain", type: "smoothstep", animated: false, className: "edge-idle", style: { stroke: "#6686a5", strokeWidth: 2 }, label: "объяснение" },
];

function WorkflowNode({ data, selected }: NodeProps<FlowNode>) {
<<<<<<< Updated upstream
  const meta = categoryMeta[data.category] || { label: data.category, tone: "slate" };
  const statusLabel = data.executionStatus === "running" ? "ВЫПОЛНЯЕТСЯ"
    : data.executionStatus === "completed" ? "ЗАВЕРШЁН"
    : data.executionStatus === "failed" ? "ОШИБКА"
    : data.executionStatus === "blocked" ? "ЗАБЛОКИРОВАН"
    : data.executionStatus === "configuration_required" ? "НУЖНА НАСТРОЙКА"
    : data.executionStatus === "queued" ? "В ОЧЕРЕДИ" : "ГОТОВ К ЗАПУСКУ";
  const hasExecutionOutput = Boolean(data.executionDetail || data.executionNotes?.length || data.executionDuration != null || data.executionCount != null || data.executionCoverage != null);
  const outputTone = data.executionStatus === "failed" || data.executionStatus === "blocked" ? "danger"
    : data.executionStatus === "configuration_required" ? "warning"
    : data.executionStatus === "completed" ? "success"
    : data.executionStatus === "running" ? "active" : "neutral";
  return <div title={data.executionDetail || data.description} className={"workflow-node tone-" + meta.tone + (selected ? " is-selected" : "") + (data.executionStatus && data.executionStatus !== "idle" ? " node-" + data.executionStatus : "")}>
    <Handle type="target" position={Position.Left} />
    <div className="node-topline"><span>{meta.label}</span><span className={"node-state state-" + outputTone}>{data.executionStatus === "running" && <i className="node-live-dot" />}{statusLabel}</span></div>
    <div className="node-main"><div className="node-symbol">{data.category === "Security" ? <Shield size={17} /> : data.category === "Source" ? <GitBranch size={17} /> : data.category === "Trigger" ? <Zap size={17} /> : data.category === "AI" ? <Bot size={17} /> : <Workflow size={17} />}</div>
      <div className="node-copy"><b>{data.label}</b><small>{data.nodeType}</small></div></div>
    <details className="node-description-details nodrag"><summary>О БЛОКЕ <ChevronDown size={10} /></summary><p>{data.description}</p></details>
    {hasExecutionOutput && <section className={"node-output node-output-" + outputTone}>
      <div className="node-output-heading"><span>РЕЗУЛЬТАТ ВЫПОЛНЕНИЯ</span><i>{outputTone === "danger" ? "!" : outputTone === "success" ? "✓" : outputTone === "active" ? "…" : outputTone === "warning" ? "⚙" : "·"}</i></div>
      {data.executionDetail && <p>{data.executionDetail}</p>}
      {data.executionProgress != null && <div className="node-live-progress" aria-label={`Прогресс сканирования: ${Math.round(data.executionProgress)}%`}><div><span>СКАНИРОВАНИЕ ФАЙЛОВ</span><b>{Math.round(data.executionProgress)}%</b></div><i><span style={{ width: `${data.executionProgress}%` }} /></i>{data.executionProgressLabel && <small title={data.executionProgressLabel}>{data.executionProgressLabel}</small>}</div>}
       {(data.executionDuration != null || data.executionCount != null || data.executionCoverage != null) && <div className="node-execution-metrics">
         {data.executionDuration != null && <span><small>ВРЕМЯ</small><b>{formatDuration(data.executionDuration)}</b></span>}
         {data.executionCount != null && <span><small>НАХОДКИ</small><b>{data.executionCount}</b></span>}
         {data.executionCoverage != null && <span><small>AI ПОКРЫТИЕ</small><b>{Math.round(data.executionCoverage * 100)}%</b></span>}
       </div>}
      {data.executionSeverity && Object.entries(data.executionSeverity).some(([, count]) => count > 0) && <div className="node-severity-breakdown">
        {Object.entries(data.executionSeverity).filter(([, count]) => count > 0).sort(([a], [b]) => ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"].indexOf(a) - ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"].indexOf(b)).map(([severity, count]) => <span className={"node-severity severity-" + severity.toLowerCase()} key={severity}><b>{count}</b>{severity}</span>)}
      </div>}
      {data.executionNotes?.map((note, index) => <div className="node-ai-note" key={index}><b>AI · {index + 1}</b><span>{note}</span></div>)}
    </section>}
    <div className="node-footer"><span>ВХОД / ВЫХОД</span><span className="node-port-label">●</span></div>
    <Handle type="source" position={Position.Right} />
  </div>;
=======
    const meta = categoryMeta[data.category] || { label: data.category, tone: "slate" };
    const statusLabel = data.executionStatus === "running" ? "ВЫПОЛНЯЕТСЯ"
        : data.executionStatus === "completed" ? "ЗАВЕРШЁН"
            : data.executionStatus === "failed" ? "ОШИБКА"
                : data.executionStatus === "blocked" ? "ЗАБЛОКИРОВАН"
                    : data.executionStatus === "configuration_required" ? "НУЖНА НАСТРОЙКА"
                        : data.executionStatus === "queued" ? "В ОЧЕРЕДИ" : "ГОТОВ К ЗАПУСКУ";
    const hasExecutionOutput = Boolean(data.executionDetail || data.executionNotes?.length);
    const outputTone = data.executionStatus === "failed" || data.executionStatus === "blocked" ? "danger"
        : data.executionStatus === "configuration_required" ? "warning"
            : data.executionStatus === "completed" ? "success"
                : data.executionStatus === "running" ? "active" : "neutral";
    return <div title={data.executionDetail || data.description} className={"workflow-node tone-" + meta.tone + (selected ? " is-selected" : "") + (data.executionStatus && data.executionStatus !== "idle" ? " node-" + data.executionStatus : "")}>
        <Handle type="target" position={Position.Left} />
        <div className="node-topline"><span>{meta.label}</span><span className={"node-state state-" + outputTone}>{data.executionStatus === "running" && <i className="node-live-dot" />}{statusLabel}</span></div>
        <div className="node-main"><div className="node-symbol">{data.category === "Security" ? <Shield size={17} /> : data.category === "Source" ? <GitBranch size={17} /> : data.category === "Trigger" ? <Zap size={17} /> : data.category === "AI" ? <Bot size={17} /> : <Workflow size={17} />}</div>
            <div className="node-copy"><b>{data.label}</b><small>{data.nodeType}</small></div></div>
        <p className="node-description">{data.description}</p>
        {hasExecutionOutput && <section className={"node-output node-output-" + outputTone}>
            <div className="node-output-heading"><span>РЕЗУЛЬТАТ ВЫПОЛНЕНИЯ</span><i>{outputTone === "danger" ? "!" : outputTone === "success" ? "✓" : outputTone === "active" ? "…" : outputTone === "warning" ? "⚙" : "·"}</i></div>
            {data.executionDetail && <p>{data.executionDetail}</p>}
            {data.executionSeverity && Object.entries(data.executionSeverity).some(([, count]) => count > 0) && <div className="node-severity-breakdown">
                {Object.entries(data.executionSeverity).filter(([, count]) => count > 0).sort(([a], [b]) => ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"].indexOf(a) - ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"].indexOf(b)).map(([severity, count]) => <span className={"node-severity severity-" + severity.toLowerCase()} key={severity}><b>{count}</b>{severity}</span>)}
            </div>}
            {data.executionNotes?.map((note, index) => <div className="node-ai-note" key={index}><b>AI · {index + 1}</b><span>{note}</span></div>)}
        </section>}
        <div className="node-footer"><span>ВХОД / ВЫХОД</span><span className="node-port-label">●</span></div>
        <Handle type="source" position={Position.Right} />
    </div>;
>>>>>>> Stashed changes
}
const nodeTypes = { workflow: memo(WorkflowNode) };

export default function App() {
<<<<<<< Updated upstream
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>(seedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(seedEdges);
  const [manifests, setManifests] = useState<Manifest[]>([]);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [notice, setNotice] = useState("Подключение к API…");
  const [aiProvider, setAiProvider] = useState<{ configured: boolean; base_url_set: boolean; model_set: boolean; api_key_set: boolean; endpoint_valid: boolean | null; endpoint_error?: string | null; model?: string | null } | null>(null);
  const [result, setResult] = useState("Граф готов к проверке.");
  const [findings, setFindings] = useState<Finding[]>([]);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [sourcePreview, setSourcePreview] = useState<SourcePreview | null>(null);
  const [sourcePreviewLoading, setSourcePreviewLoading] = useState(false);
  const [sourcePreviewError, setSourcePreviewError] = useState("");
  const [sourceWindowStart, setSourceWindowStart] = useState(1);
  const [findingStates, setFindingStates] = useState<Record<string, FindingLifecycle>>({});
  const [findingHistory, setFindingHistory] = useState<Record<string, Array<{ details: Record<string, unknown>; created_at: string }>>>({});
  const [findingQuery, setFindingQuery] = useState("");
  const [findingSeverity, setFindingSeverity] = useState("Все");
  const [findingLifecycleFilter, setFindingLifecycleFilter] = useState("Все");
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [lastRunId, setLastRunId] = useState<string | null>(() => window.localStorage.getItem("invest.lastRunId"));
  const [workflowRuns, setWorkflowRuns] = useState<WorkflowRunSummary[]>([]);
  const [workflowVersions, setWorkflowVersions] = useState<WorkflowVersionSummary[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [compareVersion, setCompareVersion] = useState<number | null>(null);
  const [workflowVersionDiff, setWorkflowVersionDiff] = useState<WorkflowVersionDiff | null>(null);
  const [versionDiffLoading, setVersionDiffLoading] = useState(false);
  const [runHistoryLoading, setRunHistoryLoading] = useState(false);
  const [runCompareFrom, setRunCompareFrom] = useState("");
  const [runCompareTo, setRunCompareTo] = useState("");
  const [runComparison, setRunComparison] = useState<RunComparison | null>(null);
  const [securityTrend, setSecurityTrend] = useState<SecurityTrend | null>(null);
  const [securityTrendLoading, setSecurityTrendLoading] = useState(false);
  const [runCompareLoading, setRunCompareLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [projectFileQuery, setProjectFileQuery] = useState("");
  const [expandedProjectDirs, setExpandedProjectDirs] = useState<Set<string>>(new Set());
  const [projectFilePreview, setProjectFilePreview] = useState<ProjectFilePreview | null>(null);
  const [projectVisualPreview, setProjectVisualPreview] = useState<ProjectVisualPreview | null>(null);
  const [projectEditorTabs, setProjectEditorTabs] = useState<ProjectEditorTab[]>([]);
  const [activeEditorTab, setActiveEditorTab] = useState<string | null>(null);
  const [projectEditing, setProjectEditing] = useState(false);
  const [projectDraft, setProjectDraft] = useState("");
  const [editorFind, setEditorFind] = useState("");
  const [editorReplace, setEditorReplace] = useState("");
  const [editorJumpLine, setEditorJumpLine] = useState("");
  const editorFindRef = useRef<HTMLInputElement | null>(null);
  const editorJumpRef = useRef<HTMLInputElement | null>(null);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const editorGutterRef = useRef<HTMLDivElement | null>(null);
  const [projectSaving, setProjectSaving] = useState(false);
  const [projectContentQuery, setProjectContentQuery] = useState("");
  const [projectContentResults, setProjectContentResults] = useState<ProjectSearchResult[]>([]);
  const [projectContentSearching, setProjectContentSearching] = useState(false);
  const [projectHistory, setProjectHistory] = useState<ProjectHistoryEntry[]>([]);
  const [projectHistoryOpen, setProjectHistoryOpen] = useState(false);
  const [projectWorkspaceOpen, setProjectWorkspaceOpen] = useState(false);
  const [projectFilesLoading, setProjectFilesLoading] = useState(false);
  const [uploadingProjectId, setUploadingProjectId] = useState<string | null>(null);
  const [gitUrl, setGitUrl] = useState("");
  const [gitRef, setGitRef] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Все");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("source");
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [traceFilter, setTraceFilter] = useState("all");
  const [showResult, setShowResult] = useState(true);
  const [configText, setConfigText] = useState("{}");
  const [configError, setConfigError] = useState("");
  const [edgeLabel, setEdgeLabel] = useState("");
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [projectFolderOpen, setProjectFolderOpen] = useState(true);
  const [componentsFolderOpen, setComponentsFolderOpen] = useState(true);
=======
    const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>(seedNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(seedEdges);
    const [manifests, setManifests] = useState<Manifest[]>([]);
    const [workflowId, setWorkflowId] = useState<string | null>(null);
    const [notice, setNotice] = useState("Подключение к API…");
    const [result, setResult] = useState("Граф готов к проверке.");
    const [findings, setFindings] = useState<Finding[]>([]);
    const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
    const [sourcePreview, setSourcePreview] = useState<SourcePreview | null>(null);
    const [sourcePreviewLoading, setSourcePreviewLoading] = useState(false);
    const [sourcePreviewError, setSourcePreviewError] = useState("");
    const [sourceWindowStart, setSourceWindowStart] = useState(1);
    const [findingStates, setFindingStates] = useState<Record<string, FindingLifecycle>>({});
    const [findingHistory, setFindingHistory] = useState<Record<string, Array<{ details: Record<string, unknown>; created_at: string }>>>({});
    const [findingQuery, setFindingQuery] = useState("");
    const [findingSeverity, setFindingSeverity] = useState("Все");
    const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
    const [lastRunId, setLastRunId] = useState<string | null>(() => window.localStorage.getItem("invest.lastRunId"));
    const [busy, setBusy] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const [activeProject, setActiveProject] = useState<Project | null>(null);
    const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
    const [projectFileQuery, setProjectFileQuery] = useState("");
    const [expandedProjectDirs, setExpandedProjectDirs] = useState<Set<string>>(new Set());
    const [projectFilePreview, setProjectFilePreview] = useState<ProjectFilePreview | null>(null);
    const [projectEditing, setProjectEditing] = useState(false);
    const [projectDraft, setProjectDraft] = useState("");
    const [projectSaving, setProjectSaving] = useState(false);
    const [projectContentQuery, setProjectContentQuery] = useState("");
    const [projectContentResults, setProjectContentResults] = useState<ProjectSearchResult[]>([]);
    const [projectContentSearching, setProjectContentSearching] = useState(false);
    const [projectHistory, setProjectHistory] = useState<ProjectHistoryEntry[]>([]);
    const [projectHistoryOpen, setProjectHistoryOpen] = useState(false);
    const [projectWorkspaceOpen, setProjectWorkspaceOpen] = useState(false);
    const [projectFilesLoading, setProjectFilesLoading] = useState(false);
    const [uploadingProjectId, setUploadingProjectId] = useState<string | null>(null);
    const [gitUrl, setGitUrl] = useState("");
    const [gitRef, setGitRef] = useState("");
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("Все");
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>("source");
    const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(true);
    const [configText, setConfigText] = useState("{}");
    const [configError, setConfigError] = useState("");
    const [edgeLabel, setEdgeLabel] = useState("");
    const [leftCollapsed, setLeftCollapsed] = useState(false);
    const [rightCollapsed, setRightCollapsed] = useState(false);
>>>>>>> Stashed changes

    useEffect(() => {
        fetch("/api/projects")
            .then(response => { if (!response.ok) throw new Error(); return response.json(); })
            .then((data: Project[]) => setProjects(data))
            .catch(() => setResult("Не удалось загрузить библиотеку проектов."));
    }, []);

<<<<<<< Updated upstream
  useEffect(() => {
    fetch("/api/ai/status").then(response => response.ok ? response.json() : null).then(data => { if (data) setAiProvider(data); }).catch(() => setAiProvider(null));
    fetch("/api/node-types").then(response => { if (!response.ok) throw new Error(); return response.json(); })
      .then((data: Manifest[]) => { setManifests(data); setNotice("API подключён · реестр компонентов синхронизирован"); })
      .catch(() => setNotice("API недоступен · проверьте backend :8000"));
  }, []);

  useEffect(() => {
    if (!workflowId) { setSecurityTrend(null); return; }
    let active = true;
    setSecurityTrendLoading(true);
    fetch("/api/workflows/" + workflowId + "/security-trend?limit=30")
      .then(response => { if (!response.ok) throw new Error("Не удалось загрузить историю безопасности"); return response.json(); })
      .then((data: SecurityTrend) => { if (active) setSecurityTrend(data); })
      .catch(() => { if (active) setSecurityTrend(null); })
      .finally(() => { if (active) setSecurityTrendLoading(false); });
    return () => { active = false; };
  }, [workflowId, workflowRuns[0]?.id]);

  useEffect(() => {
    if (!workflowId) { setTelemetry(null); return; }
    let active = true;
    fetch("/api/workflows/" + workflowId + "/telemetry/latest")
      .then(response => response.ok ? response.json() : null)
      .then((data: Telemetry | null) => { if (active && data) setTelemetry(data); })
      .catch(() => { if (active) setTelemetry(null); });
    return () => { active = false; };
  }, [workflowId]);
=======
    useEffect(() => {
        fetch("/api/node-types").then(response => { if (!response.ok) throw new Error(); return response.json(); })
            .then((data: Manifest[]) => { setManifests(data); setNotice("API подключён · реестр компонентов синхронизирован"); })
            .catch(() => setNotice("API недоступен · проверьте backend :8000"));
    }, []);

    useEffect(() => {
        if (!workflowId) { setTelemetry(null); return; }
        let active = true;
        fetch("/api/workflows/" + workflowId + "/telemetry/latest")
            .then(response => response.ok ? response.json() : null)
            .then((data: Telemetry | null) => { if (active && data) setTelemetry(data); })
            .catch(() => { if (active) setTelemetry(null); });
        return () => { active = false; };
    }, [workflowId]);
>>>>>>> Stashed changes

    useEffect(() => {
        if (!workflowId) { setFindingStates({}); return; }
        let active = true;
        fetch("/api/workflows/" + workflowId + "/finding-states")
            .then(response => response.ok ? response.json() : [])
            .then((rows: Array<FindingLifecycle & { fingerprint: string }>) => {
                if (active) setFindingStates(Object.fromEntries(rows.map(row => [row.fingerprint, row])));
            })
            .catch(() => undefined);
        return () => { active = false; };
    }, [workflowId]);

    useEffect(() => {
        if (!lastRunId) return;
        let active = true;
        fetch("/api/runs/" + lastRunId + "/telemetry")
            .then(response => response.ok ? response.json() : null)
            .then((data: Telemetry | null) => { if (active && data) setTelemetry(data); })
            .catch(() => undefined);
        return () => { active = false; };
    }, [lastRunId]);

<<<<<<< Updated upstream
  const refreshWorkflowRuns = async (id: string) => {
    setRunHistoryLoading(true);
    try {
      const response = await fetch("/api/workflows/" + id + "/runs");
      if (!response.ok) throw new Error("Не удалось загрузить историю запусков");
      const rows = await response.json() as WorkflowRunSummary[];
      const summaries = await Promise.all(rows.slice(0, 12).map(async run => {
        try {
          const telemetryResponse = await fetch("/api/runs/" + run.id + "/telemetry");
          if (!telemetryResponse.ok) return run;
          const data = await telemetryResponse.json() as Telemetry;
          return { ...run, total_findings: data.total_findings, severity: data.severity, cache: data.cache };
        } catch { return run; }
      }));
      setWorkflowRuns(summaries);
    } catch { setWorkflowRuns([]); }
    finally { setRunHistoryLoading(false); }
  };

  useEffect(() => {
    if (!workflowId) { setWorkflowRuns([]); return; }
    void refreshWorkflowRuns(workflowId);
  }, [workflowId]);

  useEffect(() => {
    if (!workflowId) { setWorkflowVersions([]); return; }
    void refreshWorkflowVersions(workflowId);
  }, [workflowId]);

  const refreshWorkflowVersions = async (id: string) => {
    setVersionsLoading(true);
    try {
      const response = await fetch("/api/workflows/" + id + "/versions");
      if (!response.ok) throw new Error("Не удалось загрузить версии workflow");
      setWorkflowVersions(await response.json() as WorkflowVersionSummary[]);
    } catch { setWorkflowVersions([]); }
    finally { setVersionsLoading(false); }
  };

  const compareWorkflowVersions = async (fromVersion: number, toVersion: number) => {
    if (!workflowId || fromVersion === toVersion) return;
    setVersionDiffLoading(true);
    try {
      const response = await fetch("/api/workflows/" + workflowId + "/versions/compare?from_version=" + fromVersion + "&to_version=" + toVersion);
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Не удалось сравнить версии");
      setWorkflowVersionDiff(data as WorkflowVersionDiff);
    } catch (error) { setResult("Ошибка сравнения версий: " + String(error)); setWorkflowVersionDiff(null); }
    finally { setVersionDiffLoading(false); }
  };

  const restoreWorkflowVersion = async (version: number) => {
    if (!workflowId || !window.confirm("Восстановить версию " + version + "? Текущая конфигурация останется в истории.")) return;
    try {
      const response = await fetch("/api/workflows/" + workflowId + "/versions/" + version + "/restore", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Не удалось восстановить версию");
      setResult("Версия " + version + " восстановлена как новая версия " + data.version + ". Перезагрузите workflow, чтобы применить граф.");
      await refreshWorkflowVersions(workflowId);
    } catch (error) { setResult("Ошибка восстановления версии: " + String(error)); }
  };

  const compareWorkflowRuns = async () => {
    if (!workflowId || !runCompareFrom || !runCompareTo || runCompareFrom === runCompareTo) return;
    setRunCompareLoading(true);
    try {
      const params = new URLSearchParams({ from_run: runCompareFrom, to_run: runCompareTo });
      const response = await fetch("/api/workflows/" + workflowId + "/runs/compare?" + params.toString());
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Не удалось сравнить запуски");
      setRunComparison(data as RunComparison);
    } catch (error) {
      setRunComparison(null);
      setResult("Ошибка сравнения запусков: " + String(error));
    } finally { setRunCompareLoading(false); }
  };

  const openHistoricalRun = async (run: WorkflowRunSummary) => {
    try {
      const [findingResponse, telemetryResponse] = await Promise.all([
        fetch("/api/runs/" + run.id + "/findings"),
        fetch("/api/runs/" + run.id + "/telemetry"),
      ]);
      if (!findingResponse.ok || !telemetryResponse.ok) throw new Error("Не удалось открыть выбранный запуск");
      const [rows, data] = await Promise.all([findingResponse.json(), telemetryResponse.json()]);
      setFindings(rows as Finding[]);
      setTelemetry(data as Telemetry);
      setSelectedFinding(null);
      setLastRunId(run.id);
      window.localStorage.setItem("invest.lastRunId", run.id);
      setResult("Открыта история запуска · " + run.id);
    } catch (error) { setResult("Ошибка загрузки истории: " + String(error)); }
  };

  const saveRunReportToProject = async (run: WorkflowRunSummary) => {
    if (!activeProject) return;
    try {
      const response = await fetch("/api/projects/" + activeProject.id + "/reports/" + run.id, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Не удалось сохранить отчёт");
      setResult("Отчёт сохранён в " + activeProject.name + " · " + data.path);
      await refreshProjects();
      const [filesResponse, historyResponse] = await Promise.all([
        fetch("/api/projects/" + activeProject.id + "/files"),
        fetch("/api/projects/" + activeProject.id + "/history"),
      ]);
      if (filesResponse.ok) setProjectFiles(((await filesResponse.json()).files || []) as ProjectFile[]);
      if (historyResponse.ok) setProjectHistory(await historyResponse.json() as ProjectHistoryEntry[]);
    } catch (error) { setResult("Ошибка сохранения отчёта: " + String(error)); }
  };

  const cancelWorkflowRun = async (run: WorkflowRunSummary) => {
    try {
      const response = await fetch("/api/runs/" + run.id + "/cancel", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Не удалось отменить запуск");
      setResult(data.status === "cancelled" ? "Запуск отменён до старта." : "Отмена запрошена. Текущий блок завершится, затем workflow остановится.");
      if (workflowId) await refreshWorkflowRuns(workflowId);
    } catch (error) { setResult("Ошибка отмены: " + String(error)); }
  };

  const retryWorkflowRun = async (run: WorkflowRunSummary) => {
    try {
      const response = await fetch("/api/runs/" + run.id + "/retry", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Не удалось повторить запуск");
      setResult("Создан повторный запуск · " + data.run_id);
      if (workflowId) await refreshWorkflowRuns(workflowId);
    } catch (error) { setResult("Ошибка повторного запуска: " + String(error)); }
  };

  const runHistoryComparison = useMemo(() => {
    const completed = workflowRuns.filter(run => ["completed", "partial"].includes(run.status) && run.total_findings !== undefined);
    if (completed.length < 2) return null;
    const current = completed[0];
    const previous = completed[1];
    const levels = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];
    return {
      current, previous,
      delta: (current.total_findings || 0) - (previous.total_findings || 0),
      severity: levels.map(level => ({ level, current: current.severity?.[level] || 0, previous: previous.severity?.[level] || 0 })),
    };
  }, [workflowRuns]);

  useEffect(() => {
    if (!selectedFinding?.fingerprint || !lastRunId) { setSourcePreview(null); setSourcePreviewError(""); return; }
    const controller = new AbortController();
    setSourcePreview(null); setSourcePreviewLoading(true); setSourcePreviewError("");
    const params = new URLSearchParams({ start_line: String(sourceWindowStart), end_line: String(sourceWindowStart + 99) });
    fetch(`/api/runs/${lastRunId}/findings/${encodeURIComponent(selectedFinding.fingerprint)}/source?${params}`, { signal: controller.signal })
      .then(async response => { const data = await response.json(); if (!response.ok) throw new Error(data.detail || "Не удалось открыть исходник"); return data as SourcePreview; })
      .then(data => { setSourcePreview(data); setSourcePreviewError(""); })
      .catch(error => { if (!(error instanceof DOMException && error.name === "AbortError")) { setSourcePreview(null); setSourcePreviewError(error instanceof Error ? error.message : String(error)); } })
      .finally(() => { if (!controller.signal.aborted) setSourcePreviewLoading(false); });
    return () => controller.abort();
  }, [selectedFinding?.fingerprint, lastRunId, sourceWindowStart]);

  useEffect(() => {
    if (!telemetry) return;
    const trace = new Map((telemetry.trace || []).map(item => [item.node_id, item]));
    const current = telemetry.current_node || null;
    const nodeResults = telemetry.node_results || {};
    setNodes(currentNodes => currentNodes.map(node => {
      const step = trace.get(node.id);
      const output = nodeResults[node.id];
      const status = current === node.id ? "running"
        : step?.status === "failed" ? "failed"
        : step?.status === "blocked" ? "blocked"
        : step?.status === "configuration_required" ? "configuration_required"
        : step?.status === "completed" || step?.status === "ready" ? "completed"
        : telemetry.status === "queued" || telemetry.status === "running" || telemetry.status === "cancelling" ? "queued" : "idle";
      let detail = output?.message || "";
      if (output?.status === "completed" && node.data.nodeType.startsWith("scan.")) {
        detail = `Проверка завершена · найдено: ${output.findings ?? 0}.`;
      } else if (output?.status === "completed" && node.data.nodeType === "findings.merge") {
        detail = `Объединено уникальных находок: ${output.findings ?? 0}.`;
      }
      let notes: string[] = [];
      if (node.data.nodeType === "ai.explain" && output) {
        notes = (output.explanations || []).map(item => [item.root_cause, item.recommendation].filter(Boolean).join(" · ")).filter(Boolean);
        detail = output.status === "configuration_required" ? "Нужен LLM-провайдер: заполните LLM_BASE_URL, LLM_MODEL и LLM_API_KEY."
          : output.status === "failed" ? (output.message || "AI-провайдер не вернул корректный ответ. Проверьте доступность и настройки.")
          : output.status === "completed" ? `Объяснено: ${output.explained_count ?? 0} из ${output.analyzed_count ?? output.total_findings ?? 0} · покрытие ${Math.round((output.coverage ?? 0) * 100)}% · пропущено лимитом: ${output.skipped_count ?? 0}.` : detail;
      } else if (node.data.nodeType === "source.git" && output?.status === "ready") {
        detail = "Репозиторий клонирован в изолированную рабочую область.";
      } else if (node.data.nodeType === "source.upload" && output?.status === "ready") {
        detail = "Каталог проекта доступен сканерам.";
      } else if (status === "idle" && telemetry.status === "running") {
        detail = "Ожидает завершения предыдущих связанных блоков.";
      }
      const count = typeof output?.findings === "number" ? output.findings : typeof output?.total_findings === "number" ? output.total_findings : undefined;
       return { ...node, data: { ...node.data, executionStatus: status, executionDetail: detail, executionNotes: notes, executionSeverity: output?.severity, executionDuration: step?.duration_ms ?? null, executionCount: count, executionCoverage: typeof output?.coverage === "number" ? output.coverage : undefined, executionProgress: node.id === current && telemetry.scanner_progress && telemetry.scanner_progress.total_files > 0 ? Math.min(100, Math.max(0, telemetry.scanner_progress.files_scanned / telemetry.scanner_progress.total_files * 100)) : undefined, executionProgressLabel: node.id === current && telemetry.scanner_progress ? `${telemetry.scanner_progress.files_scanned}/${telemetry.scanner_progress.total_files} файлов${telemetry.scanner_progress.current_file ? ` · ${telemetry.scanner_progress.current_file}` : ""}` : undefined } };
    }));
    setEdges(currentEdges => currentEdges.map(edge => {
      const sourceStep = trace.get(edge.source);
      const targetStep = trace.get(edge.target);
      const sourceOutput = nodeResults[edge.source];
      const active = current === edge.target && (sourceStep?.status === "completed" || sourceStep?.status === "ready");
      const complete = !!sourceStep && !!targetStep && ["completed", "ready"].includes(sourceStep.status) && ["completed", "ready"].includes(targetStep.status);
      const flowCount = typeof sourceOutput?.findings === "number" ? sourceOutput.findings : typeof sourceOutput?.total_findings === "number" ? sourceOutput.total_findings : undefined;
      const flowLabel = edge.source === "ai-explain" && typeof sourceOutput?.explained_count === "number" ? `${sourceOutput.explained_count} объяснений` : flowCount != null ? `${flowCount} находок` : edge.label;
      return { ...edge, label: flowLabel, labelShowBg: true, labelBgStyle: { fill: "#14263a", fillOpacity: 0.94 }, labelStyle: { fill: "#c3d8ed", fontSize: 9 }, animated: active, className: active ? "edge-active" : complete ? "edge-completed" : "edge-idle" };
    }));
  }, [telemetry, setNodes, setEdges]);

  const selectedNode = nodes.find(node => node.id === selectedNodeId) || null;
  const selectedEdge = edges.find(edge => edge.id === selectedEdgeId) || null;
  useEffect(() => {
    setConfigText(selectedNode ? JSON.stringify(selectedNode.data.config || {}, null, 2) : "{}");
    setConfigError("");
  }, [selectedNodeId, nodes.find(n => n.id === selectedNodeId)?.data.config]);
  useEffect(() => { setEdgeLabel(selectedEdge?.label?.toString() || ""); }, [selectedEdgeId, selectedEdge?.label]);

  const onConnect = useCallback((connection: Connection) => {
    setEdges(current => addEdge({ ...connection, id: "edge-" + Date.now(), type: "smoothstep", animated: false, className: "edge-idle", style: { stroke: "#6686a5", strokeWidth: 2 } }, current));
    setSelectedNodeId(null); setSelectedEdgeId(null);
  }, [setEdges]);
  const onReconnect = useCallback((oldEdge: Edge, newConnection: Connection) => {
    setEdges(current => reconnectEdge(oldEdge, newConnection, current, { shouldReplaceId: false }));
  }, [setEdges]);

  const addNode = (manifest: Manifest) => {
    const id = manifest.type + "-" + Date.now();
    const position = { x: 180 + (nodes.length % 3) * 245, y: 90 + Math.floor(nodes.length / 3) * 145 };
    const node: FlowNode = { id, type: "workflow", position, data: { label: manifest.title, nodeType: manifest.type, category: manifest.category, description: manifest.description, config: {} } };
    setNodes(current => [...current, node]); setSelectedNodeId(id); setSelectedEdgeId(null);
  };
  const updateNode = (id: string, patch: Partial<NodeData>) => setNodes(current => current.map(node => node.id === id ? { ...node, data: { ...node.data, ...patch } } : node));
  const deleteSelectedNode = () => {
    if (!selectedNodeId) return;
    setNodes(current => current.filter(node => node.id !== selectedNodeId));
    setEdges(current => current.filter(edge => edge.source !== selectedNodeId && edge.target !== selectedNodeId));
    setSelectedNodeId(null);
  };
  const duplicateSelectedNode = () => {
    if (!selectedNode) return;
    const id = selectedNode.data.nodeType + "-" + Date.now();
    const copy: FlowNode = { ...selectedNode, id, position: { x: selectedNode.position.x + 55, y: selectedNode.position.y + 55 }, selected: false, data: { ...selectedNode.data, config: { ...selectedNode.data.config } } };
    setNodes(current => [...current, copy]); setSelectedNodeId(id);
  };
  const replaceSelectedNode = (type: string) => {
    if (!selectedNode) return;
    const manifest = manifests.find(item => item.type === type);
    if (!manifest) return;
    updateNode(selectedNode.id, { nodeType: manifest.type, label: manifest.title, category: manifest.category, description: manifest.description, config: {} });
  };
  const saveNodeConfig = () => {
    if (!selectedNode) return;
    try {
      const parsed = JSON.parse(configText);
      if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") throw new Error("Конфигурация должна быть JSON-объектом.");
      updateNode(selectedNode.id, { config: parsed as Record<string, unknown> }); setConfigError(""); setResult("Настройки блока сохранены в графе.");
    } catch (error) { setConfigError(error instanceof Error ? error.message : "Некорректный JSON"); }
  };
  const deleteSelectedEdge = () => {
    if (!selectedEdgeId) return;
    setEdges(current => current.filter(edge => edge.id !== selectedEdgeId)); setSelectedEdgeId(null);
  };
  const updateEdgeEndpoint = (field: "source" | "target", value: string) => {
    if (!selectedEdgeId) return;
    setEdges(current => current.map(edge => edge.id === selectedEdgeId ? { ...edge, [field]: value } : edge));
  };

  const graph = useMemo(() => ({
    name: activeProject?.name || "Security pipeline",
    nodes: nodes.map(node => ({ id: node.id, type: node.data.nodeType, position: node.position, config: node.data.config || {} })),
    edges: edges.map(edge => ({ id: edge.id, source: edge.source, target: edge.target, source_handle: edge.sourceHandle, target_handle: edge.targetHandle })),
  }), [nodes, edges, activeProject?.name]);


  const refreshProjects = async () => {
    const response = await fetch("/api/projects");
    if (!response.ok) throw new Error("Не удалось обновить библиотеку проектов");
    setProjects(await response.json());
  };
  const uploadProjectArchive = async (file: File | undefined, projectId?: string) => {
    if (!file) return;
    setUploading(true); setUploadingProjectId(projectId || "new");
    try {
      const form = new FormData(); form.append("file", file);
      const response = await fetch(projectId ? `/api/projects/${projectId}/archive` : "/api/projects", {
        method: projectId ? "PUT" : "POST", body: form,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail || data));
      await refreshProjects();
      if (activeProject?.id === data.id) {
        setActiveProject(data);
        setProjectVisualPreview(null);
        const filesResponse = await fetch(`/api/projects/${data.id}/files`);
        if (filesResponse.ok) {
          const updatedFiles = ((await filesResponse.json()).files || []) as ProjectFile[];
          setProjectFiles(updatedFiles);
          setProjectFileQuery("");
          setExpandedProjectDirs(new Set(updatedFiles.flatMap(file => {
            const parts = file.path.split("/");
            return parts.slice(0, -1).map((_, index) => parts.slice(0, index + 1).join("/"));
          })));
        }
        setProjectFilePreview(null);
        const historyResponse = await fetch(`/api/projects/${data.id}/history`);
        if (historyResponse.ok) setProjectHistory(await historyResponse.json());
      }
      setResult((projectId ? "Проект обновлён" : "Проект добавлен") + " · " + data.name + " · " + data.file_count + " файлов");
    } catch (error) { setResult("Ошибка загрузки проекта: " + String(error)); }
    finally { setUploading(false); setUploadingProjectId(null); }
  };
  const openProject = async (project: Project) => {
    setProjectFilesLoading(true);
    try {
      const response = await fetch(`/api/projects/${project.id}/files`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Не удалось открыть проект");
      setActiveProject(data.project || project);
      setProjectFiles(data.files || []);
      setProjectFilePreview(null);
      setProjectVisualPreview(null);
      setProjectEditorTabs([]);
      setActiveEditorTab(null);
      setProjectDraft("");
      setProjectEditing(false);
      setProjectHistoryOpen(false);
      const historyResponse = await fetch(`/api/projects/${project.id}/history`);
      if (historyResponse.ok) setProjectHistory(await historyResponse.json());
      else setProjectHistory([]);
      const sourceNode = nodes.find(node => node.data.category === "Source");
      if (sourceNode) updateNode(sourceNode.id, {
        nodeType: "source.upload", label: project.name, description: "Постоянный проект из библиотеки. Источник доступен всем связанным сканерам.",
        config: { path: project.workspace_path }, executionStatus: "idle", executionDetail: "", executionNotes: [], executionSeverity: undefined,
      });
      setProjectWorkspaceOpen(true);
      setResult("Открыт проект · " + project.name + " · источник подключён к workflow.");
    } catch (error) { setResult("Не удалось открыть проект: " + String(error)); }
    finally { setProjectFilesLoading(false); }
  };
  const applyProject = (project: Project) => {
    const sourceNode = nodes.find(node => node.data.category === "Source");
    if (!sourceNode) {
      setResult("Невозможно применить проект: добавь на граф блок-источник.");
      return;
    }
    updateNode(sourceNode.id, {
      nodeType: "source.upload",
      label: project.name,
      description: "Постоянный проект из библиотеки. Источник доступен всем связанным сканерам.",
      config: { path: project.workspace_path },
      executionStatus: "idle",
      executionDetail: "",
      executionNotes: [],
      executionSeverity: undefined,
    });
    setActiveProject(project);
    setResult("Проект применён к workflow · " + project.name + ". Открывать рабочую область не требуется.");
  };
  const renameProject = async (project: Project) => {
    const name = window.prompt("Новое название проекта:", project.name);
    if (name === null || !name.trim()) return;
    try {
      const response = await fetch(`/api/projects/${project.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim() }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Не удалось переименовать проект");
      await refreshProjects();
      if (activeProject?.id === project.id) {
        setActiveProject(data);
        const sourceNode = nodes.find(node => node.data.category === "Source");
        if (sourceNode && sourceNode.data.config.path === project.workspace_path) updateNode(sourceNode.id, { label: data.name });
      }
      setResult("Проект переименован · " + data.name);
    } catch (error) { setResult("Ошибка переименования: " + String(error)); }
  };
  const deleteProject = async (project: Project) => {
    if (!window.confirm(`Удалить проект «${project.name}» и все его файлы? Это действие необратимо.`)) return;
    try {
      const response = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Не удалось удалить проект");
      await refreshProjects();
      if (activeProject?.id === project.id) {
        const sourceNode = nodes.find(node => node.data.category === "Source");
        if (sourceNode && sourceNode.data.config.path === project.workspace_path) updateNode(sourceNode.id, {
          label: "Project source", description: "Выбери ZIP из библиотеки или настрой Git-источник.", config: {},
          executionStatus: "idle", executionDetail: "", executionNotes: [], executionSeverity: undefined,
        });
        setActiveProject(null); setProjectFiles([]); setProjectFilePreview(null); setProjectVisualPreview(null); setProjectEditorTabs([]); setActiveEditorTab(null); setProjectDraft(""); setProjectEditing(false); setProjectHistory([]); setProjectHistoryOpen(false); setProjectWorkspaceOpen(false);
      }
      setResult("Проект удалён · " + project.name);
    } catch (error) { setResult("Ошибка удаления: " + String(error)); }
  };
  const openProjectFile = async (file: ProjectFile, startLine = 1, forceReload = false) => {
    if (!activeProject) return;
    const cachedTab = forceReload ? undefined : projectEditorTabs.find(tab => tab.path === file.path);
    setProjectFilesLoading(true);
    setEditorFind("");
    setEditorReplace("");
    setEditorJumpLine("");
    try {
      const suffix = file.path.split(".").pop()?.toLowerCase() || "";
      const imageTypes = new Set(["png", "jpg", "jpeg", "webp", "gif"]);
      const isPdf = suffix === "pdf";
      if (imageTypes.has(suffix) || isPdf) {
        const params = new URLSearchParams({ path: file.path });
        const url = `/api/projects/${activeProject.id}/preview?${params}`;
        const response = await fetch(url, { method: "HEAD" });
        if (!response.ok) {
          const message = response.headers.get("content-type")?.includes("application/json")
            ? (await response.json()).detail : "Не удалось открыть файл";
          throw new Error(message || "Не удалось открыть файл");
        }
        setProjectVisualPreview({ path: file.path, url, kind: isPdf ? "pdf" : "image" });
        setProjectFilePreview(null);
        setProjectEditing(false);
        setProjectDraft("");
        setActiveEditorTab(file.path);
        setProjectEditorTabs(tabs => tabs.some(tab => tab.path === file.path) ? tabs : [...tabs, { path: file.path, name: file.path.split("/").pop() || file.path, kind: isPdf ? "pdf" : "image", draft: "", baseline: "", editing: false }]);
        return;
      }
      const params = new URLSearchParams({ path: file.path, start_line: String(startLine) });
      const response = await fetch(`/api/projects/${activeProject.id}/file?${params}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Не удалось открыть файл");
      setProjectVisualPreview(null);
      setProjectFilePreview(data);
      const loadedContent = data.editable && typeof data.content === "string" ? data.content : "";
      const restoredDraft = cachedTab?.draft ?? loadedContent;
      setProjectEditing(cachedTab?.editing ?? false);
      setProjectDraft(restoredDraft);
      setActiveEditorTab(file.path);
      setProjectEditorTabs(tabs => tabs.some(tab => tab.path === file.path)
        ? tabs.map(tab => tab.path === file.path ? { ...tab, kind: "text", draft: restoredDraft, baseline: forceReload ? loadedContent : (tab.baseline || loadedContent) } : tab)
        : [...tabs, { path: file.path, name: file.path.split("/").pop() || file.path, kind: "text", draft: restoredDraft, baseline: loadedContent, editing: false }]);
    } catch (error) { setResult("Просмотр файла: " + String(error)); }
    finally { setProjectFilesLoading(false); }
  };

  const searchProjectContent = async () => {
    if (!activeProject || projectContentQuery.trim().length < 2) return;
    setProjectContentSearching(true);
    try {
      const params = new URLSearchParams({ q: projectContentQuery.trim() });
      const response = await fetch(`/api/projects/${activeProject.id}/search?${params}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Поиск не выполнен");
      setProjectContentResults(data.results || []);
      setResult(`Поиск завершён · ${(data.results || []).length} совпадений · проверено ${data.scanned_files} файлов`);
    } catch (error) { setResult("Поиск по содержимому: " + String(error)); }
    finally { setProjectContentSearching(false); }
  };
  const updateActiveEditorDraft = (value: string) => {
    setProjectDraft(value);
    if (activeEditorTab) setProjectEditorTabs(tabs => tabs.map(tab => tab.path === activeEditorTab ? { ...tab, draft: value } : tab));
  };
  const setActiveEditorEditing = (editing: boolean) => {
    setProjectEditing(editing);
    if (activeEditorTab) setProjectEditorTabs(tabs => tabs.map(tab => tab.path === activeEditorTab ? { ...tab, editing } : tab));
  };
  const closeEditorTab = (path: string) => {
    const tab = projectEditorTabs.find(item => item.path === path);
    if (tab && tab.draft !== tab.baseline && !window.confirm(`Вкладка «${tab.name}» содержит несохранённые изменения. Закрыть её без сохранения?`)) return;
    const remaining = projectEditorTabs.filter(item => item.path !== path);
    setProjectEditorTabs(remaining);
    if (activeEditorTab === path) {
      const next = remaining[remaining.length - 1];
      setActiveEditorTab(next?.path || null);
      if (next) { const file = projectFiles.find(item => item.path === next.path); if (file) void openProjectFile(file); }
      else { setProjectFilePreview(null); setProjectVisualPreview(null); setProjectDraft(""); setProjectEditing(false); }
    }
  };
  const findNextInEditor = () => {
    const needle = editorFind;
    const editor = editorRef.current;
    if (!needle || !editor) return;
    const start = editor.selectionEnd;
    const found = projectDraft.indexOf(needle, start);
    const index = found >= 0 ? found : projectDraft.indexOf(needle);
    if (index < 0) { setResult("Совпадений не найдено."); return; }
    editor.focus();
    editor.setSelectionRange(index, index + needle.length);
    setResult(`Найдено совпадение на позиции ${index + 1}.`);
  };
  const replaceAllInEditor = () => {
    if (!editorFind) return;
    const matches = projectDraft.split(editorFind).length - 1;
    if (!matches) { setResult("Совпадений для замены не найдено."); return; }
    setProjectDraft(projectDraft.split(editorFind).join(editorReplace));
    setResult(`Заменено совпадений: ${matches}. Не забудь сохранить файл.`);
  };
  const jumpToEditorLine = () => {
    const editor = editorRef.current;
    const requested = Number.parseInt(editorJumpLine, 10);
    if (!editor || !Number.isFinite(requested) || requested < 1) return;
    const lines = projectDraft.split("\n");
    const target = Math.min(requested, lines.length);
    const offset = lines.slice(0, target - 1).reduce((sum, line) => sum + line.length + 1, 0);
    editor.focus();
    editor.setSelectionRange(offset, offset);
    const lineHeight = Number.parseFloat(window.getComputedStyle(editor).lineHeight) || 15.3;
    editor.scrollTop = Math.max(0, (target - 1) * lineHeight - editor.clientHeight / 2);
    setEditorJumpLine(String(target));
    setResult(`Переход к строке ${target} из ${lines.length}.`);
  };
  const handleEditorKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(event.ctrlKey || event.metaKey)) return;
    const key = event.key.toLowerCase();
    if (key === "s") { event.preventDefault(); if (!projectSaving) void saveProjectFile(); }
    else if (key === "f" || key === "h") { event.preventDefault(); editorFindRef.current?.focus(); }
    else if (key === "g") { event.preventDefault(); editorJumpRef.current?.focus(); }
  };
  const downloadProjectFile = () => {
    if (!activeProject) return;
    const path = projectFilePreview?.path || projectVisualPreview?.path;
    if (!path) return;
    const params = new URLSearchParams({ path });
    window.location.assign(`/api/projects/${activeProject.id}/file/download?${params}`);
  };
  const downloadProject = () => {
    if (!activeProject) return;
    window.location.assign(`/api/projects/${activeProject.id}/download`);
    setResult("Подготовка ZIP-экспорта · секретные файлы и .git исключаются.");
  };
  const saveProjectFile = async () => {
    if (!activeProject || !projectFilePreview?.editable || !projectEditing) return;
    setProjectSaving(true);
    try {
      const params = new URLSearchParams({ path: projectFilePreview.path });
      const response = await fetch(`/api/projects/${activeProject.id}/file?${params}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: projectDraft }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Не удалось сохранить файл");
      const savedPath = projectFilePreview.path;
      setActiveEditorEditing(false);
      setProjectEditorTabs(tabs => tabs.map(tab => tab.path === savedPath ? { ...tab, baseline: projectDraft, draft: projectDraft, editing: false } : tab));
      await openProjectFile({ path: savedPath, size: new Blob([projectDraft]).size }, 1, true);
      setResult("Файл сохранён · " + data.path);
      const historyResponse = await fetch(`/api/projects/${activeProject.id}/history`);
      if (historyResponse.ok) setProjectHistory(await historyResponse.json());
    } catch (error) { setResult("Ошибка сохранения: " + String(error)); }
    finally { setProjectSaving(false); }
  };
  const uploadArchive = async (file?: File) => {
    if (!file) return;
    setUploading(true); setFindings([]);
    try {
      const form = new FormData(); form.append("file", file);
      const response = await fetch("/api/sources/upload", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail || data));
      const sourceNode = nodes.find(node => node.data.category === "Source");
      if (sourceNode) updateNode(sourceNode.id, { nodeType: "source.upload", label: "Workspace source", description: "Сканирует безопасно распакованный ZIP-каталог.", config: { path: data.path }, executionStatus: "idle", executionDetail: "" });
      setResult("Архив принят · " + data.files + " файлов · " + Math.round(data.expanded_bytes / 1024) + " KiB распаковано. Источник обновлён.");
    } catch (error) { setResult("Ошибка загрузки ZIP: " + String(error)); }
    finally { setUploading(false); }
  };
  const persistWorkflow = async () => {
    const response = await fetch(workflowId ? "/api/workflows/" + workflowId : "/api/workflows", {
      method: workflowId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(graph),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(data));
    setWorkflowId(data.id); return data.id as string;
  };
  const saveWorkflow = async () => {
    setBusy(true);
    try { const id = await persistWorkflow(); setResult("Сохранено · workflow " + id); }
    catch (error) { setResult("Не удалось сохранить workflow: " + String(error)); }
    finally { setBusy(false); }
  };
  const validateWorkflow = async () => {
    setBusy(true);
    try {
      const response = await fetch("/api/workflows/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(graph) });
      const data = await response.json(); setResult(JSON.stringify(data, null, 2)); setShowResult(true);
    } catch { setResult("Не удалось связаться с API. Проверьте backend."); setShowResult(true); }
    finally { setBusy(false); }
  };
  const runWorkflow = async (selectedNodeIds?: string[], forceFullScan = false, forceNodeIds: string[] = []) => {
    setBusy(true); setFindings([]);
    try {
      const id = await persistWorkflow();
      const endpoint = selectedNodeIds?.length ? "/api/workflows/" + id + "/runs/selected" : "/api/workflows/" + id + "/runs";
      const response = await fetch(forceFullScan && !selectedNodeIds?.length ? endpoint + "?force_full_scan=true" : endpoint, { method: "POST", ...(selectedNodeIds?.length ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify({ node_ids: selectedNodeIds, force_full_scan: forceFullScan, force_node_ids: forceNodeIds }) } : {}) });
      const queued = await response.json();
      if (!response.ok) throw new Error(JSON.stringify(queued));
      setShowResult(true);
      setResult((selectedNodeIds?.length ? "Выборочный запуск поставлен в очередь · " : "Задание поставлено в очередь · ") + queued.run_id + (selectedNodeIds?.length ? " · зависимости будут выполнены автоматически" : ""));
      setLastRunId(queued.run_id); window.localStorage.setItem("invest.lastRunId", queued.run_id);

      setTelemetry({ status: "queued", total_findings: 0, severity: {}, scanners: [], completed_nodes: 0, total_nodes: nodes.length });
      const completed = await new Promise<Telemetry>((resolve, reject) => {
        const stream = new EventSource("/api/runs/" + queued.run_id + "/events");
        let settled = false;
        let fallbackStarted = false;
        const finish = (data: Telemetry) => {
          if (settled) return;
          settled = true; stream.close(); window.clearTimeout(timeout); resolve(data);
        };
        const fallback = async () => {
          if (fallbackStarted || settled) return;
          fallbackStarted = true; stream.close();
          try {
            for (let attempt = 0; attempt < 300; attempt += 1) {
              await new Promise(resolveWait => window.setTimeout(resolveWait, 1000));
              const response = await fetch("/api/runs/" + queued.run_id + "/telemetry");
              if (!response.ok) throw new Error("Не удалось получить телеметрию задания");
              const data: Telemetry = await response.json();
              setTelemetry(data);
              if (["completed", "partial", "failed", "cancelled"].includes(data.status)) { finish(data); return; }
            }
            throw new Error("Превышено время ожидания worker. Задание сохранено в очереди.");
          } catch (error) {
            if (!settled) { settled = true; window.clearTimeout(timeout); reject(error); }
          }
        };
        const timeout = window.setTimeout(() => { void fallback(); }, 300000);
        stream.onmessage = event => {
          try {
            const data: Telemetry = JSON.parse(event.data);
            setTelemetry(data);
            setResult("Выполнение · " + data.completed_nodes + "/" + data.total_nodes + " блоков");
            if (["completed", "partial", "failed", "cancelled"].includes(data.status)) finish(data);
          } catch { /* Ignore malformed telemetry frame and keep the stream alive. */ }
        };
        stream.onerror = () => { void fallback(); };
      });
      const findingsResponse = await fetch("/api/runs/" + queued.run_id + "/findings");
      if (findingsResponse.ok) setFindings(await findingsResponse.json());
      const telemetryResponse = await fetch("/api/runs/" + queued.run_id + "/telemetry");
      if (telemetryResponse.ok) setTelemetry(await telemetryResponse.json());
      setResult("Проверка завершена · " + completed.status + " · " + completed.total_findings + " находок");
      if (completed.status === "failed") setResult("Проверка завершилась с ошибкой.");
      await refreshWorkflowRuns(id);
    } catch (error) { setResult("Запуск не выполнен: " + String(error)); setShowResult(true); }
    finally { setBusy(false); }
  };
  const updateFindingLifecycle = async (finding: Finding, state: FindingLifecycle["state"]) => {
    if (!workflowId || !finding.fingerprint) return;
    const reason = window.prompt("Причина изменения статуса уязвимости:", state === "open" ? "Повторная проверка" : "");
    if (reason === null || !reason.trim()) return;
    try {
      const response = await fetch("/api/workflows/" + workflowId + "/findings/" + finding.fingerprint + "/state", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state, reason: reason.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Не удалось изменить статус");
      setFindingStates(current => ({ ...current, [finding.fingerprint!]: data }));
      setResult("Статус уязвимости обновлён · " + state);
    } catch (error) { setResult("Ошибка статуса уязвимости: " + String(error)); }
  };
  const loadFindingHistory = async (fingerprint: string) => {
    if (!workflowId) return;
    try {
      const response = await fetch("/api/workflows/" + workflowId + "/findings/" + fingerprint + "/history");
      if (!response.ok) throw new Error("Не удалось загрузить историю");
      const history = await response.json();
      setFindingHistory(current => ({ ...current, [fingerprint]: history }));
    } catch (error) { setResult(String(error)); }
  };
  const categories = ["Все", ...Array.from(new Set(manifests.map(item => item.category)))];
  const filtered = manifests.filter(item => (category === "Все" || item.category === category) && (item.title + " " + item.description + " " + item.type).toLowerCase().includes(search.toLowerCase()));
  const findingLifecycleCounts = useMemo(() => findings.reduce((counts, item) => {
    const state = item.fingerprint ? (findingStates[item.fingerprint]?.state || "open") : "open";
    counts[state] = (counts[state] || 0) + 1;
    return counts;
  }, {} as Record<string, number>), [findings, findingStates]);
  const findingGroups = useMemo(() => {
    const query = findingQuery.trim().toLowerCase();
    const visible = findings.filter(item => {
      const lifecycle = item.fingerprint ? (findingStates[item.fingerprint]?.state || "open") : "open";
      const lifecycleMatch = findingLifecycleFilter === "Все"
        || (findingLifecycleFilter === "Открытые" && lifecycle === "open")
        || (findingLifecycleFilter === "Принятый риск" && lifecycle === "accepted_risk")
        || (findingLifecycleFilter === "Исправленные" && lifecycle === "fixed")
        || (findingLifecycleFilter === "Ложные срабатывания" && lifecycle === "false_positive");
      return lifecycleMatch
        && (findingSeverity === "Все" || item.severity.toUpperCase() === findingSeverity)
        && (!query || [item.rule_id, item.path, item.message, item.why_it_matters, item.recommendation].filter(Boolean).join(" ").toLowerCase().includes(query));
    });
    const groups = new Map<string, Finding[]>();
    for (const item of visible) { const path = item.path || "Файл не указан"; groups.set(path, [...(groups.get(path) || []), item]); }
    return Array.from(groups, ([path, items]) => ({ path, items: items.sort((a,b) => (a.line || 0) - (b.line || 0)) })).sort((a,b) => a.path.localeCompare(b.path));
  }, [findings, findingQuery, findingSeverity, findingLifecycleFilter, findingStates]);
  const orderedVisibleFindings = findingGroups.flatMap(group => group.items);
  const selectedFindingIndex = selectedFinding ? orderedVisibleFindings.findIndex(item => item.fingerprint === selectedFinding.fingerprint) : -1;
  const selectAdjacentFinding = (direction: -1 | 1) => { const next = orderedVisibleFindings[selectedFindingIndex + direction]; if (next) { setSelectedFinding(next); setSourceWindowStart(Math.max(1, (next.line || 1) - 40)); } };
  const toggleFindingSource = (finding: Finding) => {
    if (selectedFinding?.fingerprint === finding.fingerprint) { setSelectedFinding(null); return; }
    setSelectedFinding(finding); setSourceWindowStart(Math.max(1, (finding.line || 1) - 40));
  };
  const aiNode = nodes.find(node => node.data.nodeType === "ai.explain");
  const aiNodeResult = aiNode ? telemetry?.node_results?.[aiNode.id] : undefined;
=======
    useEffect(() => {
        if (!selectedFinding?.fingerprint || !lastRunId) { setSourcePreview(null); setSourcePreviewError(""); return; }
        const controller = new AbortController();
        setSourcePreview(null); setSourcePreviewLoading(true); setSourcePreviewError("");
        const params = new URLSearchParams({ start_line: String(sourceWindowStart), end_line: String(sourceWindowStart + 99) });
        fetch(`/api/runs/${lastRunId}/findings/${encodeURIComponent(selectedFinding.fingerprint)}/source?${params}`, { signal: controller.signal })
            .then(async response => { const data = await response.json(); if (!response.ok) throw new Error(data.detail || "Не удалось открыть исходник"); return data as SourcePreview; })
            .then(data => { setSourcePreview(data); setSourcePreviewError(""); })
            .catch(error => { if (!(error instanceof DOMException && error.name === "AbortError")) { setSourcePreview(null); setSourcePreviewError(error instanceof Error ? error.message : String(error)); } })
            .finally(() => { if (!controller.signal.aborted) setSourcePreviewLoading(false); });
        return () => controller.abort();
    }, [selectedFinding?.fingerprint, lastRunId, sourceWindowStart]);

    useEffect(() => {
        if (!telemetry) return;
        const trace = new Map((telemetry.trace || []).map(item => [item.node_id, item]));
        const current = telemetry.current_node || null;
        const nodeResults = telemetry.node_results || {};
        setNodes(currentNodes => currentNodes.map(node => {
            const step = trace.get(node.id);
            const output = nodeResults[node.id];
            const status = current === node.id ? "running"
                : step?.status === "failed" ? "failed"
                    : step?.status === "blocked" ? "blocked"
                        : step?.status === "configuration_required" ? "configuration_required"
                            : step?.status === "completed" || step?.status === "ready" ? "completed"
                                : telemetry.status === "queued" ? "queued" : "idle";
            let detail = output?.message || "";
            if (output?.status === "completed" && node.data.nodeType.startsWith("scan.")) {
                detail = `Проверка завершена · найдено: ${output.findings ?? 0}.`;
            } else if (output?.status === "completed" && node.data.nodeType === "findings.merge") {
                detail = `Объединено уникальных находок: ${output.findings ?? 0}.`;
            }
            let notes: string[] = [];
            if (node.data.nodeType === "ai.explain" && output) {
                notes = (output.explanations || []).map(item => [item.root_cause, item.recommendation].filter(Boolean).join(" · ")).filter(Boolean);
                detail = output.status === "configuration_required" ? "Нужен LLM-провайдер: заполните LLM_BASE_URL, LLM_MODEL и LLM_API_KEY."
                    : output.status === "failed" ? "AI-провайдер не вернул корректный ответ. Проверьте доступность и настройки."
                        : output.status === "completed" ? `Объяснено находок: ${output.explained_count ?? 0} из ${output.total_findings ?? 0}.` : detail;
            } else if (node.data.nodeType === "source.git" && output?.status === "ready") {
                detail = "Репозиторий клонирован в изолированную рабочую область.";
            } else if (node.data.nodeType === "source.upload" && output?.status === "ready") {
                detail = "Каталог проекта доступен сканерам.";
            } else if (status === "idle" && telemetry.status === "running") {
                detail = "Ожидает завершения предыдущих связанных блоков.";
            }
            return { ...node, data: { ...node.data, executionStatus: status, executionDetail: detail, executionNotes: notes, executionSeverity: output?.severity } };
        }));
        setEdges(currentEdges => currentEdges.map(edge => {
            const sourceStep = trace.get(edge.source);
            const targetStep = trace.get(edge.target);
            const active = current === edge.target && (sourceStep?.status === "completed" || sourceStep?.status === "ready");
            const complete = !!sourceStep && !!targetStep && ["completed", "ready"].includes(sourceStep.status) && ["completed", "ready"].includes(targetStep.status);
            return { ...edge, animated: active, className: active ? "edge-active" : complete ? "edge-completed" : "edge-idle" };
        }));
    }, [telemetry, setNodes, setEdges]);
>>>>>>> Stashed changes

    const selectedNode = nodes.find(node => node.id === selectedNodeId) || null;
    const selectedEdge = edges.find(edge => edge.id === selectedEdgeId) || null;
    useEffect(() => {
        setConfigText(selectedNode ? JSON.stringify(selectedNode.data.config || {}, null, 2) : "{}");
        setConfigError("");
    }, [selectedNodeId, nodes.find(n => n.id === selectedNodeId)?.data.config]);
    useEffect(() => { setEdgeLabel(selectedEdge?.label?.toString() || ""); }, [selectedEdgeId, selectedEdge?.label]);

    const onConnect = useCallback((connection: Connection) => {
        setEdges(current => addEdge({ ...connection, id: "edge-" + Date.now(), type: "smoothstep", animated: false, className: "edge-idle", style: { stroke: "#6686a5", strokeWidth: 2 } }, current));
        setSelectedNodeId(null); setSelectedEdgeId(null);
    }, [setEdges]);
    const onReconnect = useCallback((oldEdge: Edge, newConnection: Connection) => {
        setEdges(current => reconnectEdge(oldEdge, newConnection, current, { shouldReplaceId: false }));
    }, [setEdges]);

    const addNode = (manifest: Manifest) => {
        const id = manifest.type + "-" + Date.now();
        const position = { x: 180 + (nodes.length % 3) * 245, y: 90 + Math.floor(nodes.length / 3) * 145 };
        const node: FlowNode = { id, type: "workflow", position, data: { label: manifest.title, nodeType: manifest.type, category: manifest.category, description: manifest.description, config: {} } };
        setNodes(current => [...current, node]); setSelectedNodeId(id); setSelectedEdgeId(null);
    };
    const updateNode = (id: string, patch: Partial<NodeData>) => setNodes(current => current.map(node => node.id === id ? { ...node, data: { ...node.data, ...patch } } : node));
    const deleteSelectedNode = () => {
        if (!selectedNodeId) return;
        setNodes(current => current.filter(node => node.id !== selectedNodeId));
        setEdges(current => current.filter(edge => edge.source !== selectedNodeId && edge.target !== selectedNodeId));
        setSelectedNodeId(null);
    };
    const duplicateSelectedNode = () => {
        if (!selectedNode) return;
        const id = selectedNode.data.nodeType + "-" + Date.now();
        const copy: FlowNode = { ...selectedNode, id, position: { x: selectedNode.position.x + 55, y: selectedNode.position.y + 55 }, selected: false, data: { ...selectedNode.data, config: { ...selectedNode.data.config } } };
        setNodes(current => [...current, copy]); setSelectedNodeId(id);
    };
    const replaceSelectedNode = (type: string) => {
        if (!selectedNode) return;
        const manifest = manifests.find(item => item.type === type);
        if (!manifest) return;
        updateNode(selectedNode.id, { nodeType: manifest.type, label: manifest.title, category: manifest.category, description: manifest.description, config: {} });
    };
    const saveNodeConfig = () => {
        if (!selectedNode) return;
        try {
            const parsed = JSON.parse(configText);
            if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") throw new Error("Конфигурация должна быть JSON-объектом.");
            updateNode(selectedNode.id, { config: parsed as Record<string, unknown> }); setConfigError(""); setResult("Настройки блока сохранены в графе.");
        } catch (error) { setConfigError(error instanceof Error ? error.message : "Некорректный JSON"); }
    };
    const deleteSelectedEdge = () => {
        if (!selectedEdgeId) return;
        setEdges(current => current.filter(edge => edge.id !== selectedEdgeId)); setSelectedEdgeId(null);
    };
    const updateEdgeEndpoint = (field: "source" | "target", value: string) => {
        if (!selectedEdgeId) return;
        setEdges(current => current.map(edge => edge.id === selectedEdgeId ? { ...edge, [field]: value } : edge));
    };

    const graph = useMemo(() => ({
        name: activeProject?.name || "Security pipeline",
        nodes: nodes.map(node => ({ id: node.id, type: node.data.nodeType, position: node.position, config: node.data.config || {} })),
        edges: edges.map(edge => ({ id: edge.id, source: edge.source, target: edge.target, source_handle: edge.sourceHandle, target_handle: edge.targetHandle })),
    }), [nodes, edges, activeProject?.name]);

<<<<<<< Updated upstream
  return <main className="shell">
    <header className="topbar">
      <div className="brand"><div className="mark"><Shield size={19} /></div><div><b>INVEST <span>／</span> SECURITY WORKFLOW</b><small>VISUAL SECURITY AUTOMATION PLATFORM</small></div></div>
      <div className="status"><i className={notice.startsWith("API подключён") ? "online" : ""} />{notice}</div>
      <div className="actions"><span className="revision"><GitBranch size={13} /> feat / platform-foundation</span>
        <button className="ghost" disabled={busy} onClick={saveWorkflow}><Save size={13} /> Сохранить</button>
        <button className="validate" disabled={busy} onClick={validateWorkflow}><Check size={14} /> Проверить</button>
        <button className="run-selected" disabled={busy || !selectedNodeId} onClick={() => selectedNodeId && void runWorkflow([selectedNodeId])}><Zap size={13} /> Блок</button><button className="run" disabled={busy} onClick={() => void runWorkflow()}><CirclePlay size={14} /> {busy ? "Выполняется…" : "Запустить всё"}</button><button className="ghost" disabled={busy} title="Игнорировать кэш и выполнить полное сканирование" onClick={() => void runWorkflow(undefined, true)}><RefreshCw size={13} /> Полный анализ</button>
      </div>
    </header>
    <div className={"layout" + (leftCollapsed ? " left-collapsed" : "") + (rightCollapsed ? " right-collapsed" : "")}>
      <aside className={"panel palette" + (leftCollapsed ? " is-collapsed" : "")}>
        {leftCollapsed ? <button className="collapsed-rail" onClick={() => setLeftCollapsed(false)} title="Развернуть библиотеку блоков" aria-label="Развернуть библиотеку блоков"><PanelLeftOpen size={17} /><span>БЛОКИ</span></button> : <>
        <div className="panel-heading"><div><div className="eyebrow">WORKFLOW BUILDER</div><h3><Workflow size={17} /> Библиотека блоков</h3></div><div className="panel-heading-actions"><span className="counter">{manifests.length}</span><button className="icon-button collapse-control" onClick={() => setLeftCollapsed(true)} title="Свернуть библиотеку блоков" aria-label="Свернуть библиотеку блоков"><PanelLeftClose size={14} /></button></div></div>
        <p className="panel-intro">Добавляй компоненты на холст. Настройки, замена и удаление доступны в инспекторе выбранного блока.</p>
        <div className="searchbox"><Search size={14} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Найти блок или назначение…" /><kbd>/</kbd></div>
        <section className={"palette-folder" + (projectFolderOpen ? " folder-open" : "")}>
          <button className="palette-folder-head project-folder-head" onClick={() => setProjectFolderOpen(value => !value)} aria-expanded={projectFolderOpen}>
            <span className="palette-folder-leading"><ChevronRight size={13} className="palette-folder-chevron"/><FolderOpen size={15}/><b>ПРОЕКТЫ / PROJECT LIBRARY</b></span>
            <small>{projects.length}</small>
          </button>
          {projectFolderOpen && <div className="palette-folder-body">
        <div className="source-section">
          <div className="project-library">
            <label className="project-add-button"><Plus size={13}/><span>{uploadingProjectId === "new" ? "Загрузка проекта…" : "Добавить ZIP в библиотеку"}</span><input type="file" accept=".zip,application/zip" disabled={uploading || busy} onChange={event => { void uploadProjectArchive(event.target.files?.[0]); event.currentTarget.value = ""; }}/></label>
            <small className="upload-hint">До 300 MiB на архив · постоянное хранение · файлы не исполняются</small>
            {projects.map(project => <article className={"project-library-item" + (activeProject?.id === project.id ? " project-active" : "")} key={project.id}>
              <div className="project-library-main"><div className="project-folder-icon"><FolderOpen size={15}/></div><div className="project-library-copy"><b title={project.name}>{project.name}</b><small>{project.file_count} файлов · {(project.expanded_bytes / 1048576).toFixed(1)} MiB</small></div></div>
              <div className="project-library-actions">
                <button title="Открыть файлы и историю проекта" onClick={() => void openProject(project)}><FolderOpen size={12}/>Открыть</button><button className="project-apply-button" title="Подключить проект как источник текущего workflow" onClick={() => applyProject(project)}><Check size={12}/>Применить</button>
                <label title="Обновить содержимое ZIP"><RefreshCw size={12}/><input type="file" accept=".zip,application/zip" disabled={uploading || busy} onChange={event => { void uploadProjectArchive(event.target.files?.[0], project.id); event.currentTarget.value = ""; }}/></label>
                <button title="Переименовать" onClick={() => void renameProject(project)}><Pencil size={12}/></button>
                <button title="Удалить проект" className="project-delete" onClick={() => void deleteProject(project)}><Trash2 size={12}/></button>
              </div>
            </article>)}
            {projects.length === 0 && <div className="project-library-empty"><FolderOpen size={17}/><span>Библиотека пока пуста. Добавь ZIP-архив проекта.</span></div>}
          </div>
          <div className="section-caption source-secondary-caption">БЫСТРЫЙ ИСТОЧНИК ДЛЯ ОДНОГО ЗАПУСКА</div>
          <label className="archive-upload"><UploadCloud size={15} /><span>{uploading ? "Загрузка и проверка…" : "Загрузить ZIP проекта"}</span><input type="file" accept=".zip,application/zip" disabled={uploading || busy} onChange={event => { void uploadArchive(event.target.files?.[0]); event.currentTarget.value = ""; }} /></label>
          <small className="upload-hint">До 300 MiB · временный источник для одного workflow</small>
          <div className="source-divider"><span>ИЛИ КЛОНИРОВАТЬ ЧЕРЕЗ GIT</span></div>
          <label className="source-field">HTTPS-ссылка репозитория<input value={gitUrl} onChange={event => setGitUrl(event.target.value)} placeholder="https://github.com/owner/repository.git" disabled={busy || uploading}/></label>
          <label className="source-field">Ветка или тег<input value={gitRef} onChange={event => setGitRef(event.target.value)} placeholder="main (необязательно)" disabled={busy || uploading}/></label>
          <button className="git-source-button" disabled={busy || uploading || !gitUrl.trim()} onClick={() => {
            const sourceNode = nodes.find(node => node.data.category === "Source");
            if (!sourceNode) { setResult("В графе отсутствует блок-источник."); return; }
            updateNode(sourceNode.id, { nodeType: "source.git", label: "Git repository", description: "Клонирует разрешённый HTTPS-репозиторий в изолированную рабочую область.", config: { url: gitUrl.trim(), ...(gitRef.trim() ? { ref: gitRef.trim() } : {}) }, executionStatus: "idle", executionDetail: "" });
            setResult("Git-источник настроен. Добавьте точный URL в ALLOWED_TARGETS корневого .env, затем нажмите «Запустить».");
          }}><GitBranch size={13}/> Использовать Git-источник</button>
          <small className="upload-hint">Только HTTPS и точное совпадение с ALLOWED_TARGETS в корневом .env. Клонирование выполняется worker при запуске.</small>
        </div>
          </div>}
        </section>
        <section className={"palette-folder components-folder" + (componentsFolderOpen ? " folder-open" : "")}>
          <button className="palette-folder-head components-folder-head" onClick={() => setComponentsFolderOpen(value => !value)} aria-expanded={componentsFolderOpen}>
            <span className="palette-folder-leading"><ChevronRight size={13} className="palette-folder-chevron"/><Code2 size={15}/><b>КОМПОНЕНТЫ API</b></span>
            <small>{manifests.length}</small>
          </button>
          {componentsFolderOpen && <div className="palette-folder-body">
          <div className="category-filters">{categories.map(item => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
        {filtered.map(manifest => <article className="library-item" key={manifest.type}>
          <div className="library-main"><div className={"library-icon tone-" + (categoryMeta[manifest.category] || {tone:"slate"}).tone}><Code2 size={15} /></div><div className="library-copy"><b>{manifest.title}</b><small>{manifest.type}</small></div><button className="add-node" title="Добавить блок на холст" onClick={() => addNode(manifest)}><Plus size={15} /></button></div>
          <details className="node-help"><summary><CircleHelp size={12} /> Что делает блок <ChevronDown size={12} /></summary><p>{manifest.description}</p><span>{categoryMeta[manifest.category]?.label || manifest.category} · тип: {manifest.type}</span></details>
        </article>)}
        {!manifests.length && <div className="empty-library">Загружаем реестр компонентов API…</div>}
        {manifests.length > 0 && filtered.length === 0 && <div className="empty-library">Ничего не найдено.</div>}
        <div className="palette-note"><LockKeyhole size={14} /><span>Код репозитория анализируется как данные, без запуска его скриптов.</span></div>
          </div>}
        </section>
        </>}
      </aside>

      <section className="editor">
        <div className="editor-head"><div><span className="eyebrow">EDITOR / WORKFLOW 001</span><h1>Security pipeline</h1><p>Перетаскивай блоки, соединяй порты, выбирай элемент для редактирования</p></div>
          <div className="counts"><span><Layers3 size={13} />{nodes.length} блоков</span><span><GitBranch size={13} />{edges.length} связей</span></div></div>
        <div className="flow"><ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes}
          onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onReconnect={onReconnect}
          onNodeClick={(_, node) => { setSelectedNodeId(node.id); setSelectedEdgeId(null); }}
          onEdgeClick={(_, edge) => { setSelectedEdgeId(edge.id); setSelectedNodeId(null); }}
          onPaneClick={() => { setSelectedNodeId(null); setSelectedEdgeId(null); }}
          edgesReconnectable deleteKeyCode={["Backspace", "Delete"]} fitView fitViewOptions={{ padding: 0.2 }}>
          <Background color="#31445c" gap={22} size={1} /><MiniMap pannable zoomable nodeColor={node => node.type === "workflow" ? "#426b91" : "#526176"} /><Controls />
        </ReactFlow></div>
        <div className="flow-foot"><span><Activity size={13} /> {telemetry?.status === "running" ? "ВЫПОЛНЕНИЕ ГРАФА" : telemetry?.status === "completed" ? "ГРАФ ЗАВЕРШЁН" : telemetry?.status === "failed" ? "ОШИБКА ВЫПОЛНЕНИЯ" : "РЕДАКТОР ГРАФА"} <i /> {telemetry ? `${telemetry.completed_nodes || 0}/${telemetry.total_nodes || nodes.length} шагов` : "Сетка 22 px"}</span><span>{telemetry?.current_node ? `Сейчас: ${telemetry.current_node}` : telemetry?.scanner_progress ? `Файлы: ${telemetry.scanner_progress.files_scanned}/${telemetry.scanner_progress.total_files}` : "Связь можно выбрать и перетащить за конец для переназначения"}</span></div>
      </section>

      <aside className={"panel inspector" + (rightCollapsed ? " is-collapsed" : "")}>
        {rightCollapsed ? <button className="collapsed-rail" onClick={() => setRightCollapsed(false)} title="Развернуть инспектор" aria-label="Развернуть инспектор"><PanelRightOpen size={17} /><span>ИНСПЕКТОР</span></button> : <>
        <div className="inspector-top"><div><div className="eyebrow">INSPECTOR / EDITOR</div><h3><Activity size={17} /> Свойства элемента</h3></div><div className="panel-heading-actions"><button className="icon-button collapse-control" onClick={() => setRightCollapsed(true)} title="Свернуть инспектор" aria-label="Свернуть инспектор"><PanelRightClose size={14} /></button><button className="icon-button" title={showResult ? "Свернуть результат" : "Показать результат"} onClick={() => setShowResult(value => !value)}>{showResult ? <X size={14} /> : <ChevronDown size={14} />}</button></div></div>
        {selectedNode && <section className="edit-section">
          <div className="section-caption">РЕДАКТИРОВАНИЕ БЛОКА</div>
          <label className="field-label">Название блока<input value={selectedNode.data.label} onChange={event => updateNode(selectedNode.id, { label: event.target.value })} /></label>
          <label className="field-label">Заменить тип блока<select value={selectedNode.data.nodeType} onChange={event => replaceSelectedNode(event.target.value)}><option value={selectedNode.data.nodeType}>{selectedNode.data.nodeType}</option>{manifests.filter(item => item.type !== selectedNode.data.nodeType).map(item => <option key={item.type} value={item.type}>{item.title} · {item.type}</option>)}</select></label>
          {selectedNode.data.nodeType === "ai.explain" ? <>
            <div className="ai-node-guide"><div><Bot size={16}/><b>AI-АНАЛИЗАТОР · {aiProvider?.configured ? (aiProvider.endpoint_valid ? "КОНФИГУРАЦИЯ НАЙДЕНА" : "ОШИБКА АДРЕСА") : "ТРЕБУЕТ НАСТРОЙКИ"}</b></div><p>Получает находки из блока Merge findings. Ключ API хранится только в корневом .env и не вводится здесь.</p><div className="ai-provider-checks"><span className={aiProvider?.base_url_set ? "is-ready" : ""}>BASE URL {aiProvider?.base_url_set ? "✓" : "—"}</span><span className={aiProvider?.model_set ? "is-ready" : ""}>MODEL {aiProvider?.model_set ? "✓" : "—"}</span><span className={aiProvider?.api_key_set ? "is-ready" : ""}>API KEY {aiProvider?.api_key_set ? "✓" : "—"}</span></div>{aiProvider?.endpoint_error && <p className="ai-provider-error">{aiProvider.endpoint_error}</p>}{!aiProvider?.configured && <ol><li>Добавь LLM_BASE_URL, LLM_MODEL и LLM_API_KEY в корневой .env</li><li>Перезапусти api и worker</li><li>Запусти workflow после настройки</li></ol>}{aiProvider?.configured && aiProvider?.endpoint_valid && <div className="ai-provider-ready-note"><b>Конфигурация загружена.</b> Повторно добавлять параметры не нужно. Запусти workflow: результат реального обращения к модели появится в статусе этого блока.</div>}{aiNodeResult && <div className="ai-provider-run-state"><b>ПОСЛЕДНИЙ ЗАПУСК: {aiNodeResult.status === "completed" ? "ЗАВЕРШЁН" : aiNodeResult.status === "failed" ? "ОШИБКА" : aiNodeResult.status === "configuration_required" ? "НЕТ КОНФИГУРАЦИИ" : String(aiNodeResult.status).toUpperCase()}</b>{aiNodeResult.status === "failed" && <p>{aiNodeResult.message || "Проверь логи worker."}</p>}{aiNodeResult.status === "completed" && <p>Объяснено: {aiNodeResult.explained_count ?? 0} из {aiNodeResult.analyzed_count ?? aiNodeResult.total_findings ?? 0} · покрытие {Math.round((aiNodeResult.coverage ?? 0) * 100)}% · без объяснения: {aiNodeResult.unexplained_count ?? 0} · пропущено лимитом: {aiNodeResult.skipped_count ?? 0}.</p>}{aiNodeResult.status === "failed" && <p>Проанализировано до ошибки: {aiNodeResult.analyzed_count ?? 0} · не обработано лимитом: {aiNodeResult.skipped_count ?? 0}.</p>}{aiNodeResult.model && <small>Модель ответа: {aiNodeResult.model} · провайдер: {aiNodeResult.provider || "OpenAI-compatible"}</small>}</div>}<small>Модель: {aiProvider?.model || "не задана"} · ключ не отображается и не передаётся в браузер</small></div>
            <label className="field-label">Язык объяснений<select value={String(selectedNode.data.config.language || "ru")} onChange={event => updateNode(selectedNode.id, { config: { ...selectedNode.data.config, language: event.target.value } })}><option value="ru">Русский</option><option value="en">English</option></select></label>
            <label className="field-label">Максимум находок<input type="number" min={1} max={25} value={Number(selectedNode.data.config.max_findings ?? 20)} onChange={event => updateNode(selectedNode.id, { config: { ...selectedNode.data.config, max_findings: Math.max(1, Math.min(25, Number(event.target.value) || 1)) } })}/></label>
            <p className="edit-hint">AI не меняет severity, не создаёт новые уязвимости и не влияет на Security Gate. Ветка AI независима от проверки политики.</p>
          </> : <>
            <label className="field-label">Конфигурация (JSON)<textarea className="config-editor" spellCheck={false} value={configText} onChange={event => setConfigText(event.target.value)} /></label>
          </>}
          {selectedNode.data.nodeType !== "ai.explain" && <><button className="save-config" onClick={saveNodeConfig}><Check size={13} /> Применить настройки</button>{configError && <p className="config-error">{configError}</p>}</>}
          <div className="element-actions"><button className="ghost" onClick={duplicateSelectedNode}><Copy size={13} /> Дублировать</button><button className="danger" onClick={deleteSelectedNode}><Trash2 size={13} /> Удалить блок</button></div>
          <p className="edit-hint">Замена сохраняет позицию и связи блока, но сбрасывает его конфигурацию. Удаление также удаляет связанные рёбра.</p>
        </section>}
        {selectedEdge && <section className="edit-section">
          <div className="section-caption">РЕДАКТИРОВАНИЕ СВЯЗИ</div>
          <label className="field-label">Откуда (источник)<select value={selectedEdge.source} onChange={event => updateEdgeEndpoint("source", event.target.value)}>{nodes.map(node => <option key={node.id} value={node.id}>{node.data.label} · {node.id}</option>)}</select></label>
          <label className="field-label">Куда (получатель)<select value={selectedEdge.target} onChange={event => updateEdgeEndpoint("target", event.target.value)}>{nodes.map(node => <option key={node.id} value={node.id}>{node.data.label} · {node.id}</option>)}</select></label>
          <label className="field-label">Подпись связи<input value={edgeLabel} onChange={event => { setEdgeLabel(event.target.value); setEdges(current => current.map(edge => edge.id === selectedEdge.id ? { ...edge, label: event.target.value } : edge)); }} placeholder="например: success" /></label>
          <div className="edge-flow-diagnostics">
            <div className="section-caption">ДИАГНОСТИКА ПОТОКА</div>
            {(() => {
              const sourceNode = nodes.find(node => node.id === selectedEdge.source);
              const targetNode = nodes.find(node => node.id === selectedEdge.target);
              const sourceResult = telemetry?.node_results?.[selectedEdge.source];
              const sourceTrace = telemetry?.trace?.find(step => step.node_id === selectedEdge.source);
              const targetTrace = telemetry?.trace?.find(step => step.node_id === selectedEdge.target);
              const count = typeof sourceResult?.findings === "number" ? sourceResult.findings : typeof sourceResult?.total_findings === "number" ? sourceResult.total_findings : undefined;
              const explained = typeof sourceResult?.explained_count === "number" ? sourceResult.explained_count : undefined;
              const statusText = (status?: string) => status === "completed" || status === "ready" ? "завершён" : status === "running" ? "выполняется" : status === "failed" ? "ошибка" : status === "blocked" ? "заблокирован" : status || "нет данных";
              return <>
                <div className="edge-flow-route"><div><small>ИСТОЧНИК</small><b>{sourceNode?.data.label || selectedEdge.source}</b><span>{statusText(sourceTrace?.status || sourceResult?.status)}</span></div><i>→</i><div><small>ПОЛУЧАТЕЛЬ</small><b>{targetNode?.data.label || selectedEdge.target}</b><span>{statusText(targetTrace?.status || (telemetry?.current_node === selectedEdge.target ? "running" : undefined))}</span></div></div>
                <div className="edge-flow-payload"><small>ДАННЫЕ НА ВЫХОДЕ ИСТОЧНИКА</small>
                  {count != null ? <b>{count} {count === 1 ? "находка" : count >= 2 && count <= 4 ? "находки" : "находок"}</b> : explained != null ? <b>{explained} объяснений AI</b> : <b className="edge-flow-unknown">Счётчик не передан телеметрией</b>}
                  {sourceTrace?.duration_ms != null && <span>Время шага: {formatDuration(sourceTrace.duration_ms)}</span>}
                  {sourceResult?.message && <p>{sourceResult.message}</p>}
                </div>
                {!telemetry && <p className="edge-flow-empty">Запусти workflow, чтобы увидеть фактическое состояние передачи данных.</p>}
                {telemetry && !sourceResult && !sourceTrace && <p className="edge-flow-empty">Для этого источника нет отдельной записи в телеметрии текущего запуска.</p>}
              </>;
            })()}
          </div>
          <div className="element-actions"><button className="danger" onClick={deleteSelectedEdge}><Trash2 size={13} /> Удалить связь</button></div>
          <p className="edit-hint">Также можно создать связь, потянув линию от правого порта одного блока к левому порту другого. Перетащи конец существующей связи, чтобы перенаправить её.</p>
        </section>}
        {!selectedNode && !selectedEdge && <div className="empty-inspector"><Workflow size={26} /><b>Ничего не выбрано</b><p>Выбери блок или линию на холсте. Здесь появятся доступные настройки и действия.</p></div>}
        <div className="inspector-tabs"><span className="tab-active">Результаты</span><span className="tab-state">{busy ? "RUNNING" : "IDLE"}</span></div>
        <div className="runtime"><div><Bot size={18} /></div><section><b>Workflow runtime</b><small>Исполнитель графа API</small></section><label className={busy ? "running" : ""}>{busy ? "RUNNING" : "READY"}</label></div>
        <section className="telemetry-card">
          <div className="telemetry-heading"><div><div className="section-caption">RUN TELEMETRY</div><b>Последний запуск</b></div><span className={"telemetry-status status-" + (telemetry?.status || "empty")}>{telemetry?.status === "completed" ? "УСПЕШНО" : telemetry?.status === "partial" ? "ЧАСТИЧНО" : telemetry?.status === "failed" ? "ОШИБКА" : telemetry?.status === "running" ? "В РАБОТЕ" : telemetry?.status === "queued" ? "В ОЧЕРЕДИ" : "НЕТ ДАННЫХ"}</span></div>
          {telemetry && telemetry.status !== "never_run" ? <>
            {telemetry.security_gate && <div className={"security-gate-result gate-" + telemetry.security_gate.decision.toLowerCase()}><span>SECURITY GATE</span><strong>{telemetry.security_gate.decision}</strong><small>BLOCK: {telemetry.security_gate.policy.block_on.join(", ")} · WARN: {telemetry.security_gate.policy.warn_on.join(", ")}</small></div>}
          <div className="telemetry-metrics">
              <div><strong>{formatDuration(telemetry.duration_ms)}</strong><small>ДЛИТЕЛЬНОСТЬ</small></div>
              <div><strong>{telemetry.total_findings}</strong><small>НАХОДКИ</small></div>
              <div><strong>{telemetry.completed_nodes || 0}/{telemetry.total_nodes || 0}</strong><small>ШАГИ</small></div>
            </div>
            <div className="telemetry-time"><span>Начало: {formatDate(telemetry.started_at || telemetry.queued_at)}</span><span>Завершение: {formatDate(telemetry.finished_at)}</span></div>
            {telemetry.status === "running" && <div className="telemetry-progress"><i style={{ width: `${telemetry.total_nodes ? Math.min(100, (telemetry.completed_nodes || 0) / telemetry.total_nodes * 100) : 0}%` }} /></div>}
            <div className="severity-strip">{["CRITICAL","HIGH","MEDIUM","LOW","INFO"].filter(level => (telemetry.severity?.[level] || 0) > 0).map(level => <span key={level} className={"severity-" + level.toLowerCase()}>{level} <b>{telemetry.severity[level]}</b></span>)}</div>
            {telemetry.scanners?.length > 0 && <div className="scanner-telemetry">{telemetry.scanners.map(scanner => <div key={scanner.node_id || scanner.type}><span>{scanner.type.replace("scan.", "").toUpperCase()}</span><small>{scanner.status}</small><b>{scanner.findings} · {formatDuration(scanner.duration_ms)}</b></div>)}</div>}
            {telemetry.current_node && <div className="telemetry-current"><span className="live-pulse" /> Сейчас выполняется: <b>{telemetry.current_node}</b></div>}
            {telemetry.scanner_progress && <div className="scanner-file-progress">
              <div><span>АНАЛИЗ ФАЙЛОВ</span><b>{telemetry.scanner_progress.files_scanned} / {telemetry.scanner_progress.total_files}</b></div>
              <div className="scanner-file-track"><i style={{ width: telemetry.scanner_progress.total_files ? Math.min(100, telemetry.scanner_progress.files_scanned / telemetry.scanner_progress.total_files * 100) + "%" : "0%" }} /></div>
              <small>Сейчас: {telemetry.scanner_progress.current_file}</small>
            </div>}
            {telemetry.trace && telemetry.trace.length > 0 && <div className="execution-timeline">
              <div className="execution-timeline-title">ХОД ВЫПОЛНЕНИЯ <span>{telemetry.trace.length} / {telemetry.total_nodes || telemetry.trace.length}</span></div>{telemetry.cache && telemetry.cache.scanner_blocks > 0 && <div className="cache-telemetry-strip"><span><b>{telemetry.cache.cache_hits}</b> из {telemetry.cache.scanner_blocks} сканеров взято из кэша</span><span>{Math.round(telemetry.cache.hit_rate * 100)}% повторного использования</span><small>Срок актуальности: {Math.round(telemetry.cache.ttl_seconds / 3600)} ч</small></div>}
              {telemetry.trace.map((step, index) => <div className={"execution-step step-" + step.status} key={step.node_id}>
                <i>{step.status === "completed" ? "✓" : step.status === "failed" ? "!" : step.status === "blocked" ? "Ⅱ" : index + 1}</i>
                <span><b>{step.type}</b><small>{step.cached ? "Из кэша" : step.status === "completed" ? "Завершён" : step.status === "failed" ? "Ошибка" : step.status === "blocked" ? "Заблокирован" : step.status}</small></span>
                <em>{formatDuration(step.duration_ms)}</em>
                {typeof step.findings === "number" && <strong>{step.findings} находок</strong>}
              </div>)}
              {telemetry.status === "running" && telemetry.current_node && <div className="execution-active"><span className="live-pulse" /> Выполняется {telemetry.current_node}…</div>}
            </div>}
          </> : <p className="telemetry-empty">Запусков пока нет. Телеметрия появится после первой проверки.</p>}
        </section>
        {telemetry?.trace && telemetry.trace.length > 0 && <section className="execution-timeline">
          <div className="run-history-heading"><div><span className="section-caption">EXECUTION TRACE</span><b>Хронология выполнения</b></div><span>{telemetry.trace.length} этапов</span></div>
          <p className="execution-timeline-hint">Этапы показаны в порядке, который вернул исполнитель. Выбери запись, чтобы открыть соответствующий блок графа.</p>
          <div className="trace-filters" role="group" aria-label="Фильтр событий">
            {[["all","Все"],["error","Ошибки"],["warning","Предупреждения"],["blocked","Блокировки"]].map(([value,label]) => <button type="button" key={value} className={traceFilter === value ? "is-active" : ""} onClick={() => setTraceFilter(value)}>{label}</button>)}
          </div>
          <ol>{telemetry.trace.filter(step => traceFilter === "all" || (step.diagnostic_level || (step.status === "failed" ? "error" : step.status === "blocked" ? "blocked" : "info")) === traceFilter).map((step, index) => {
            const result = telemetry.node_results?.[step.node_id];
            const node = nodes.find(item => item.id === step.node_id);
            const status = step.status || result?.status || "unknown";
            const label = status === "completed" || status === "ready" ? "ЗАВЕРШЁН" : status === "running" ? "В РАБОТЕ" : status === "failed" ? "ОШИБКА" : status === "blocked" ? "ЗАБЛОКИРОВАН" : status === "skipped" ? "ПРОПУЩЕН" : status.toUpperCase();
            return <li key={step.node_id + "-" + index} className={"trace-item trace-" + status}>
              <button type="button" onClick={() => { setSelectedNodeId(step.node_id); setSelectedEdgeId(null); }} className={selectedNodeId === step.node_id ? "trace-item-button is-selected" : "trace-item-button"}>
                <span className="trace-index">{String(index + 1).padStart(2, "0")}</span>
                <span className="trace-main"><b>{node?.data.label || step.type || step.node_id}</b><small>{step.type || step.node_id}{step.reason_code ? " · " + step.reason_code : ""}</small>{(step.reason || result?.message || step.message) && <em>{step.reason || result?.message || step.message}</em>}</span>
                <span className="trace-meta"><strong>{label}</strong>{step.cached && <small className="trace-cache-hit">ИЗ КЭША</small>}{step.cache_bypass_reason && <small>Причина нового сканирования: {step.cache_bypass_reason}</small>}{step.cache_age_seconds != null && <small>Возраст кэша: {Math.floor(step.cache_age_seconds / 3600)} ч {Math.floor((step.cache_age_seconds % 3600) / 60)} мин</small>}{step.diagnostic_level && <small>{step.diagnostic_level === "error" ? "КРИТИЧНОЕ СОБЫТИЕ" : step.diagnostic_level === "warning" ? "ТРЕБУЕТ ВНИМАНИЯ" : step.diagnostic_level === "blocked" ? "НЕТ ВХОДНЫХ ДАННЫХ" : "ИНФОРМАЦИЯ"}</small>}{step.duration_ms != null && <small>{formatDuration(step.duration_ms)}</small>}{typeof step.findings === "number" && <small>{step.findings} находок</small>}{step.provider && <small>LLM: {step.provider}</small>}{step.model && <small>МОДЕЛЬ: {step.model}</small>}{step.provider_request_ms != null && <small>ЗАПРОС: {formatDuration(step.provider_request_ms)}</small>}{step.provider_attempts != null && <small>ПОПЫТКИ: {step.provider_attempts}</small>}{step.provider_http_status != null && <small>HTTP: {step.provider_http_status}</small>}{step.provider_error_code && <small className="trace-provider-error">{step.provider_error_code}</small>}</span>
              </button>
              {["scan.secrets","scan.sca","scan.sast"].includes(step.type) && <button type="button" className="trace-cache-reset" disabled={busy} onClick={() => void runWorkflow([step.node_id], false, [step.node_id])} title="Повторно выполнить этот блок без кэша">Пересканировать блок</button>}
            </li>;
          })}</ol>
        </section>}
        <section className="run-history-card">
          <div className="run-history-heading"><div><span className="section-caption">ANALYSIS HISTORY</span><b>История запусков</b></div><button onClick={() => workflowId && void refreshWorkflowRuns(workflowId)} disabled={!workflowId || runHistoryLoading}>{runHistoryLoading ? "ЗАГРУЗКА…" : "ОБНОВИТЬ"}</button></div>
          {runHistoryComparison && <div className="run-comparison">
            <div className="run-comparison-total"><span>ИЗМЕНЕНИЕ НАХОДОК</span><strong className={runHistoryComparison.delta < 0 ? "delta-good" : runHistoryComparison.delta > 0 ? "delta-bad" : "delta-neutral"}>{runHistoryComparison.delta > 0 ? "+" : ""}{runHistoryComparison.delta}</strong><small>{runHistoryComparison.delta < 0 ? "меньше, чем в предыдущем запуске" : runHistoryComparison.delta > 0 ? "больше, чем в предыдущем запуске" : "без изменений"}</small></div>
            <div className="run-comparison-levels">{runHistoryComparison.severity.map(item => <div key={item.level}><span>{item.level}</span><b>{item.previous} → {item.current}</b><i className={item.current < item.previous ? "delta-good" : item.current > item.previous ? "delta-bad" : "delta-neutral"}>{item.current-item.previous > 0 ? "+" : ""}{item.current-item.previous}</i></div>)}</div>
            <small className="run-comparison-note">Сравнение двух последних завершённых запусков · {formatDate(runHistoryComparison.previous.finished_at || runHistoryComparison.previous.queued_at)} → {formatDate(runHistoryComparison.current.finished_at || runHistoryComparison.current.queued_at)}</small>
          </div>}
          {workflowRuns.filter(run => ["completed", "partial", "failed", "cancelled"].includes(run.status)).length >= 2 && <div className="run-compare-controls">
            <label>ОТ ЗАПУСКА
              <select value={runCompareFrom} onChange={event => { setRunCompareFrom(event.target.value); setRunComparison(null); }}>
                <option value="">Выбрать запуск…</option>
                {workflowRuns.filter(run => ["completed", "partial", "failed", "cancelled"].includes(run.status)).map(run => <option key={run.id} value={run.id}>#{workflowRuns.findIndex(item => item.id === run.id) + 1} · {formatDate(run.finished_at || run.queued_at)} · {run.status}</option>)}
              </select>
            </label>
            <label>К ЗАПУСКУ
              <select value={runCompareTo} onChange={event => { setRunCompareTo(event.target.value); setRunComparison(null); }}>
                <option value="">Выбрать запуск…</option>
                {workflowRuns.filter(run => ["completed", "partial", "failed", "cancelled"].includes(run.status)).map(run => <option key={run.id} value={run.id}>#{workflowRuns.findIndex(item => item.id === run.id) + 1} · {formatDate(run.finished_at || run.queued_at)} · {run.status}</option>)}
              </select>
            </label>
            <button disabled={!runCompareFrom || !runCompareTo || runCompareFrom === runCompareTo || runCompareLoading} onClick={() => void compareWorkflowRuns()}>{runCompareLoading ? "СРАВНЕНИЕ…" : "СРАВНИТЬ ЗАПУСКИ"}</button>
          </div>}
          {securityTrend && securityTrend.points.length > 0 && <section className="security-trend-panel">
            <div className="security-trend-head">
              <div><span className="section-caption">RISK HISTORY · LAST {securityTrend.points.length} RUNS</span><b>Динамика безопасности</b></div>
              <div className="security-trend-latest"><strong className={securityTrend.summary.delta == null || securityTrend.summary.delta === 0 ? "delta-neutral" : securityTrend.summary.delta < 0 ? "delta-good" : "delta-bad"}>{securityTrend.summary.delta == null ? "—" : (securityTrend.summary.delta > 0 ? "+" : "") + securityTrend.summary.delta}</strong><small>изменение находок</small></div>
            </div>
            <div className="security-trend-chart" role="img" aria-label="График количества находок по последним запускам">
              <svg viewBox="0 0 640 184" preserveAspectRatio="none">
                {[0,1,2,3].map(tick => <g key={tick}><line x1="34" x2="628" y1={18+tick*43} y2={18+tick*43}/><text x="26" y={22+tick*43}>{Math.round(Math.max(...securityTrend.points.map(point => point.total_findings),1)*(3-tick)/3)}</text></g>)}
                {securityTrend.points.length > 1 && <polyline points={securityTrend.points.map((point,index) => {
                  const max=Math.max(...securityTrend.points.map(item=>item.total_findings),1);
                  return (40+index*(580/Math.max(securityTrend.points.length-1,1)))+","+(150-(point.total_findings/max)*125);
                }).join(" ")} />}
                {securityTrend.points.map((point,index) => {
                  const max=Math.max(...securityTrend.points.map(item=>item.total_findings),1);
                  const x=40+index*(580/Math.max(securityTrend.points.length-1,1));
                  const y=150-(point.total_findings/max)*125;
                  return <g key={point.run_id} className="security-trend-point" onClick={() => { const run=workflowRuns.find(item=>item.id===point.run_id); if(run) void openHistoricalRun(run); }}>
                    <circle cx={x} cy={y} r="4.5"/><title>{formatDate(point.finished_at || point.queued_at || undefined)} · {point.total_findings} находок · Gate {point.security_gate?.decision || "—"}</title>
                  </g>;
                })}
              </svg>
            </div>
            <div className="security-trend-legend"><span><i className="trend-dot"/></span><span>Количество находок</span><span className="trend-gate-pass">PASS</span><span className="trend-gate-warn">WARN</span><span className="trend-gate-block">BLOCK</span><small>Нажми на точку, чтобы открыть запуск</small></div>
            <div className="security-trend-breakdown">
              {(["CRITICAL","HIGH","MEDIUM","LOW","INFO"] as const).map(level => <div key={level}><span>{level}</span><b>{securityTrend.points[securityTrend.points.length-1].severity[level] || 0}</b></div>)}
              <div><span>ПОСЛЕДНИЙ GATE</span><b>{securityTrend.points[securityTrend.points.length-1].security_gate?.decision || "—"}</b></div>
              <div><span>ДЛИТЕЛЬНОСТЬ</span><b>{formatDuration(securityTrend.points[securityTrend.points.length-1].duration_ms)}</b></div>
            </div>
          </section>}
          {!securityTrend && securityTrendLoading && <p className="run-history-empty">Загружаем динамику безопасности…</p>}
          {runComparison && <div className="run-diff-panel">
            <div className="run-diff-heading"><b>ИЗМЕНЕНИЯ МЕЖДУ ЗАПУСКАМИ</b><small>{formatDate(runComparison.from_run.finished_at || "")} → {formatDate(runComparison.to_run.finished_at || "")}</small></div>
            <div className="run-diff-stats">
              <div><b className="delta-bad">+{runComparison.findings.summary.new}</b><span>НОВЫЕ</span></div>
              <div><b>{runComparison.findings.summary.persisting}</b><span>СОХРАНИЛИСЬ</span></div>
              <div><b>{runComparison.findings.summary.not_observed_before}</b><span>НЕ БЫЛИ ПОДТВЕРЖДЕНЫ РАНЬШЕ</span></div>
              <div><b className="delta-good">−{runComparison.findings.summary.disappeared}</b><span>ИСЧЕЗЛИ</span></div>
              <div><b>{runComparison.findings.summary.not_observed}</b><span>НЕ ПРОВЕРЕНЫ</span></div>
              <div><b>{runComparison.summary.changed_nodes}</b><span>ИЗМЕНЕНИЯ БЛОКОВ</span></div>
            </div>
            {!runComparison.limitations.absence_confirmed && <p className="run-diff-warning">{runComparison.limitations.note || "Часть результатов нельзя считать подтверждённо исчезнувшими."}</p>}
            {(runComparison.limitations.before_findings_truncated || runComparison.limitations.after_findings_truncated) && <p className="run-diff-warning">Один из отчётов содержит более 5000 находок: сравнение ограничено сохранённой выборкой.</p>}
            {(["new", "not_observed_before", "persisting", "disappeared", "not_observed"] as const).map(kind => runComparison.findings[kind].length > 0 && <div className="run-diff-group" key={kind}>
              <b>{kind === "new" ? "НОВЫЕ НАХОДКИ" : kind === "not_observed_before" ? "НЕ ПОДТВЕРЖДЕНЫ ПРЕДЫДУЩИМ СКАНОМ" : kind === "persisting" ? "СОХРАНЯЮЩИЕСЯ НАХОДКИ" : kind === "disappeared" ? "ОТСУТСТВУЮТ В ПОЛНОМ СКАНЕ" : "НЕ НАБЛЮДАЛИСЬ В ЧАСТИЧНОМ ЗАПУСКЕ"}</b>
              {runComparison.findings[kind].slice(0, 30).map(item => <div key={item.fingerprint}><span>{item.severity || "—"}</span><code>{item.rule_id || item.fingerprint.slice(0, 12)}</code><small>{item.path}{item.line ? ":" + item.line : ""}</small>{kind === "persisting" && (item as RunComparison["findings"]["persisting"][number]).severity_changed && <i>{(item as RunComparison["findings"]["persisting"][number]).previous_severity || "—"} → {item.severity || "—"}</i>}</div>)}
              {runComparison.findings[kind].length > 30 && <small>Показаны первые 30 из {runComparison.findings[kind].length}.</small>}
            </div>)}
            {runComparison.nodes.length > 0 && <div className="run-diff-group"><b>ИЗМЕНЕНИЯ ПО БЛОКАМ</b>{runComparison.nodes.map(item => <div key={item.node_id}><code>{item.node_id}</code><small>{item.change === "changed" ? Object.keys(item.fields || {}).join(" · ") : item.change === "added_to_trace" ? "появился в трассировке" : "нет в трассировке нового запуска"}</small></div>)}</div>}
          </div>}
          {workflowRuns.length > 0 ? <div className="run-history-list">{workflowRuns.map((run, index) => <div className={"run-history-row" + (run.id === lastRunId ? " is-current" : "")} key={run.id}>
            <div><b>#{workflowRuns.length-index}</b><span className={"run-history-state state-" + run.status}>{run.status === "completed" ? "УСПЕШНО" : run.status === "partial" ? "ЧАСТИЧНО" : run.status === "failed" ? "ОШИБКА" : run.status === "running" ? "В РАБОТЕ" : run.status === "queued" ? "В ОЧЕРЕДИ" : run.status === "cancelling" ? "ОТМЕНА" : run.status === "cancelled" ? "ОТМЕНЁН" : run.status}</span></div>
            <small>{formatDate(run.finished_at || run.queued_at)}</small><strong>{run.total_findings ?? "—"} находок</strong>{run.cache && run.cache.scanner_blocks > 0 && <small className="run-cache-summary">{run.cache.cache_hits}/{run.cache.scanner_blocks} сканеров из кэша · {Math.round(run.cache.hit_rate * 100)}%</small>}
            <button onClick={() => void openHistoricalRun(run)} disabled={run.id === lastRunId}>{run.id === lastRunId ? "ОТКРЫТ" : "ОТКРЫТЬ"}</button>{["queued", "running", "cancelling"].includes(run.status) ? <button className="run-action-cancel" onClick={() => void cancelWorkflowRun(run)} disabled={run.status === "cancelling"}>{run.status === "cancelling" ? "ОТМЕНА…" : "ОТМЕНИТЬ"}</button> : ["completed", "partial", "failed", "cancelled"].includes(run.status) ? <button className="run-action-retry" onClick={() => void retryWorkflowRun(run)}>ПОВТОРИТЬ</button> : null}<div className="run-report-links">{activeProject && <button type="button" onClick={() => void saveRunReportToProject(run)} title="Сохранить JSON-отчёт в активный проект">В ПРОЕКТ</button>}<a href={"/api/runs/" + run.id + "/report.html"} target="_blank" rel="noreferrer">HTML</a><a href={"/api/runs/" + run.id + "/report.json"} target="_blank" rel="noreferrer">JSON</a></div>
          </div>)}</div> : <p className="run-history-empty">{runHistoryLoading ? "Загружаем историю…" : "История появится после первого сохранённого запуска workflow."}</p>}
        </section>
        <section className="workflow-version-card">
          <div className="run-history-heading"><div><span className="section-caption">CONFIGURATION HISTORY</span><b>Версии workflow</b></div><button onClick={() => workflowId && void refreshWorkflowVersions(workflowId)} disabled={!workflowId || versionsLoading}>{versionsLoading ? "ЗАГРУЗКА…" : "ОБНОВИТЬ"}</button></div>
          {workflowVersions.length > 1 && <div className="workflow-version-compare-control">
            <label>Сравнить V<select value={compareVersion ?? workflowVersions[1].version} onChange={event => { setCompareVersion(Number(event.target.value)); setWorkflowVersionDiff(null); }}>{workflowVersions.slice(1).map(item => <option key={item.version} value={item.version}>V{item.version}</option>)}</select></label>
            <span>с V{workflowVersions[0].version}</span>
            <button disabled={versionDiffLoading} onClick={() => void compareWorkflowVersions(compareVersion ?? workflowVersions[1].version, workflowVersions[0].version)}>{versionDiffLoading ? "СРАВНЕНИЕ…" : "СРАВНИТЬ"}</button>
          </div>}
          {workflowVersionDiff && <div className="workflow-version-diff">
            <div className="workflow-diff-summary">{Object.entries(workflowVersionDiff.summary).map(([key,value]) => <span key={key}><b>{value}</b>{({added_nodes:"блоков добавлено",removed_nodes:"блоков удалено",changed_nodes:"блоков изменено",added_edges:"связей добавлено",removed_edges:"связей удалено"} as Record<string,string>)[key] || key}</span>)}</div>
            {workflowVersionDiff.name_changed && <p className="workflow-diff-name">Название: {workflowVersionDiff.name_before} → {workflowVersionDiff.name_after}</p>}
            {workflowVersionDiff.nodes.added.map(item => <div className="workflow-diff-row diff-added" key={"na"+item.id}><b>+ БЛОК</b><span>{item.type}</span><small>{item.id}</small></div>)}
            {workflowVersionDiff.nodes.removed.map(item => <div className="workflow-diff-row diff-removed" key={"nr"+item.id}><b>− БЛОК</b><span>{item.type}</span><small>{item.id}</small></div>)}
            {workflowVersionDiff.nodes.changed.map(item => <div className="workflow-diff-row diff-changed" key={"nc"+item.id}><b>ИЗМЕНЁН</b><span>{item.label}</span><small>{item.changes.map(change => change.field).join(" · ")}</small></div>)}
            {workflowVersionDiff.edges.added.map(item => <div className="workflow-diff-row diff-added" key={"ea"+item.id}><b>+ СВЯЗЬ</b><span>{item.source} → {item.target}</span></div>)}
            {workflowVersionDiff.edges.removed.map(item => <div className="workflow-diff-row diff-removed" key={"er"+item.id}><b>− СВЯЗЬ</b><span>{item.source} → {item.target}</span></div>)}
            {Object.values(workflowVersionDiff.summary).every(value => value === 0) && !workflowVersionDiff.name_changed && <p className="run-history-empty">Между версиями нет изменений.</p>}
          </div>}
          {workflowVersions.length ? <div className="workflow-version-list">{workflowVersions.map(item => <div className="workflow-version-row" key={item.version}>
            <div><b>V{item.version}</b><span>{item.name}</span><small>{formatDate(item.created_at)} · {item.node_count} блоков · {item.edge_count} связей</small></div>
            {item.version !== workflowVersions[0].version && <button onClick={() => void restoreWorkflowVersion(item.version)}>ВОССТАНОВИТЬ</button>}
            {item.version === workflowVersions[0].version && <em>ТЕКУЩАЯ</em>}
          </div>)}</div> : <p className="run-history-empty">{versionsLoading ? "Загружаем версии…" : "Сохранённые версии появятся здесь."}</p>}
        </section>
        <div className="findings-head"><b>Результаты безопасности</b><span>{findings.length}</span></div>
        {findings.length > 0 && <div className="finding-browser">
          <label className="finding-search"><Search size={13}/><input value={findingQuery} onChange={event => setFindingQuery(event.target.value)} placeholder="Поиск по файлу, правилу или описанию"/></label>
          <select aria-label="Фильтр серьёзности" value={findingSeverity} onChange={event => setFindingSeverity(event.target.value)}>{["Все","CRITICAL","HIGH","MEDIUM","LOW","INFO"].map(level => <option key={level}>{level}</option>)}</select>
          <select aria-label="Фильтр статуса" value={findingLifecycleFilter} onChange={event => setFindingLifecycleFilter(event.target.value)}>{["Все","Открытые","Принятый риск","Исправленные","Ложные срабатывания"].map(state => <option key={state}>{state}</option>)}</select>
          <span>{orderedVisibleFindings.length} / {findings.length}</span>
          <div className="finding-lifecycle-summary" aria-label="Распределение находок по статусам">
            <span className="is-open">{findingLifecycleCounts.open || 0} открыто</span>
            <span className="is-risk">{findingLifecycleCounts.accepted_risk || 0} риск</span>
            <span className="is-fixed">{findingLifecycleCounts.fixed || 0} исправлено</span>
            <span className="is-false">{findingLifecycleCounts.false_positive || 0} FP</span>
          </div>
        </div>}
        {findings.length === 0 ? <p className="empty-findings">После запуска здесь появятся находки SAST, SCA и Secrets Scanner.</p> : findingGroups.length === 0 ? <p className="empty-findings">По текущим фильтрам ничего не найдено.</p> :
          findingGroups.map(group => <section className="finding-file-group" key={group.path}>
            <div className="finding-file-heading"><Code2 size={13}/><b>{group.path}</b><span>{group.items.length} · находок</span></div>
            {group.items.map((finding, index) => <article className="finding" key={finding.id || finding.rule_id + index}>
            <div><strong>{finding.rule_id}</strong><label>{finding.severity}</label></div>
            <small className="finding-location">{finding.path}{finding.line ? ":" + finding.line : ""}</small>
            <p>{finding.message || "Потенциальная проблема; проверьте контекст."}</p>
            {finding.why_it_matters && <div className="finding-explanation"><b>ПОЧЕМУ ЭТО ПРОБЛЕМА</b><p>{finding.why_it_matters}</p></div>}
            {finding.recommendation && <div className="finding-remediation"><b>КАК ИСПРАВИТЬ</b><p>{finding.recommendation}</p></div>}
            {finding.ai_explanation && <div className="finding-ai-explanation">
              <div><Bot size={13} /><b>AI EXPLANATION</b><span>{Math.round(finding.ai_explanation.confidence * 100)}% confidence</span></div>
              <p><b>Причина:</b> {finding.ai_explanation.root_cause}</p>
              <p><b>Влияние:</b> {finding.ai_explanation.impact}</p>
              <p><b>Рекомендация:</b> {finding.ai_explanation.recommendation}</p>
              {finding.ai_explanation.source_evidence?.length ? <div className="ai-source-evidence"><b>ИСТОЧНИК ДОКАЗАТЕЛЬСТВА · ИЗ СКАНЕРА</b>{finding.ai_explanation.source_evidence.map(item => <div className={item.is_finding ? "is-finding-line" : ""} key={item.line}><span>{item.line}</span><code>{item.text}</code></div>)}</div> : <small className="ai-no-evidence">Сканер не предоставил фрагмент исходного кода для подтверждения. Не считайте текст модели доказательством.</small>}
              {finding.ai_explanation.evidence_limits && <small>Ограничения анализа: {finding.ai_explanation.evidence_limits}</small>}
              <small className="ai-confidence-note">Уверенность — оценка модели, а не вероятность эксплуатации или подтверждение уязвимости.</small>
            </div>}
            {!finding.ai_explanation && aiNode && <div className="finding-ai-explanation ai-explanation-pending">
              <div><Bot size={13}/><b>AI EXPLANATION</b><span>{aiNodeResult?.status === "completed" ? "НЕТ ОТВЕТА" : aiNodeResult?.status === "failed" ? "ОШИБКА" : aiNodeResult?.status === "configuration_required" ? "НЕ НАСТРОЕН" : "ОЖИДАЕТ ЗАПУСКА"}</span></div>
              <p>{aiNodeResult?.status === "configuration_required"
                ? "Объяснение не создано: настройте LLM_BASE_URL, LLM_MODEL и LLM_API_KEY в корневом .env и перезапустите api и worker."
                : aiNodeResult?.status === "failed"
                  ? (aiNodeResult?.message || "Провайдер AI не вернул корректный результат. Проверьте адрес, модель, API-ключ и доступность провайдера.")
                  : aiNodeResult?.status === "completed"
                    ? "Для этой находки модель не вернула проверенное объяснение или находка не попала в установленный лимит. Ниже остаются результаты детерминированного анализа."
                    : "AI-объяснение появится после выполнения соответствующего блока workflow."}</p>
            </div>}
            {(finding.cwe?.length || finding.cve) && <div className="finding-identifiers">{finding.cwe?.map(value => <span key={value}>{value}</span>)}{finding.cve && <span>{finding.cve}</span>}</div>}
            {finding.masked_value && <code>{finding.masked_value}</code>}
            <button className="source-preview-toggle" onClick={() => setSelectedFinding(current => current?.fingerprint === finding.fingerprint ? null : finding)}>
              <Code2 size={13} /> {selectedFinding?.fingerprint === finding.fingerprint ? "Скрыть исходник" : "Открыть исходник"}
            </button>
            {selectedFinding?.fingerprint === finding.fingerprint && <div className="source-code-preview">
              <div className="source-code-head"><span>{finding.path}</span><div className="source-code-nav"><button disabled={selectedFindingIndex <= 0} onClick={() => selectAdjacentFinding(-1)} title="Предыдущая находка">←</button><b>{selectedFindingIndex >= 0 ? `${selectedFindingIndex + 1} / ${orderedVisibleFindings.length}` : `СТРОКА ${finding.line || "—"}`}</b><button disabled={selectedFindingIndex < 0 || selectedFindingIndex >= orderedVisibleFindings.length - 1} onClick={() => selectAdjacentFinding(1)} title="Следующая находка">→</button></div></div>
              {sourcePreviewLoading && <p className="source-loading">Загружаю проверенный фрагмент файла…</p>}
              {sourcePreviewError && <p className="source-preview-error">{sourcePreviewError}</p>}
              {sourcePreview?.redacted && <p className="source-redacted-note">Файл содержит секретную находку: содержимое строк полностью скрыто.</p>}
              {sourcePreview?.lines?.length ? <><div className="source-window-nav"><span>СТРОКИ {sourcePreview.start_line}–{sourcePreview.end_line} ИЗ {sourcePreview.total_lines}</span><div><button disabled={sourcePreview.start_line <= 1 || sourcePreviewLoading} onClick={() => setSourceWindowStart(Math.max(1, sourcePreview.start_line - 100))}>← 100</button><button disabled={sourcePreview.end_line >= sourcePreview.total_lines || sourcePreviewLoading} onClick={() => setSourceWindowStart(sourcePreview.end_line + 1)}>100 →</button></div></div><pre>{sourcePreview.lines.map(row => <span key={row.line} className={row.is_finding ? "code-line code-line-hit" : "code-line"}><i>{row.line}</i><code>{row.text || " "}</code></span>)}</pre></> : !sourcePreviewLoading && !sourcePreviewError && finding.code_context?.length ? <pre>{finding.code_context.map(row => <span key={row.line} className={row.is_finding ? "code-line code-line-hit" : "code-line"}><i>{row.line}</i><code>{row.text || " "}</code></span>)}</pre> : null}
            </div>}
            {finding.fingerprint && <div className="finding-lifecycle">
              <label>Статус
                <select value={findingStates[finding.fingerprint]?.state || "open"} onChange={event => void updateFindingLifecycle(finding, event.target.value as FindingLifecycle["state"])}>
                  <option value="open">Открыта</option><option value="accepted_risk">Принятый риск</option><option value="fixed">Исправлена</option><option value="false_positive">Ложное срабатывание</option>
                </select>
              </label>
              <button className="history-button" onClick={() => void loadFindingHistory(finding.fingerprint!)}>История</button>
              {findingHistory[finding.fingerprint] && <div className="finding-history">{findingHistory[finding.fingerprint].length ? findingHistory[finding.fingerprint].map((entry, index) => <p key={index}><b>{String(entry.details.new_state || "изменение")}</b> · {formatDate(entry.created_at)}<small>{String(entry.details.reason || "")}</small></p>) : <small>Изменений пока нет.</small>}</div>}
            </div>}
          </article>)}
          </section>)}
        {showResult && <section className="result-section"><div className="result-title"><span>Последний ответ API</span><AlertTriangle size={13} /></div><pre>{result}</pre></section>}
        <div className="safe"><Shield size={16} /><div><b>Изолированный анализ</b><p>Проект не запускается. ZIP проверяется, Git ограничен allowlist. Секреты маскируются.</p></div></div>
        </>}
      </aside>
    </div>
    {projectWorkspaceOpen && activeProject && <div className="project-workspace-backdrop">
      <section className="project-workspace">
        <header className="project-workspace-header"><div><div className="eyebrow">PROJECT WORKSPACE / SOURCE EXPLORER</div><h2><FolderOpen size={19}/> {activeProject.name}</h2><p>{activeProject.file_count} файлов · {(activeProject.expanded_bytes / 1048576).toFixed(1)} MiB · {activeProject.workspace_path}</p></div><div className="project-workspace-actions"><span className="project-connected"><i/> ПОДКЛЮЧЁН К WORKFLOW</span><button className="ghost" onClick={downloadProject} title="Скачать безопасный ZIP проекта"><Download size={13}/> Скачать ZIP</button><button className="ghost" onClick={() => setProjectHistoryOpen(value => !value)}><RefreshCw size={13}/> История {projectHistory.length ? `· ${projectHistory.length}` : ""}</button><button className="ghost" onClick={() => setProjectWorkspaceOpen(false)}><X size={14}/> Закрыть</button></div></header>
        <div className="project-workspace-body">
          <aside className="project-file-tree">
            <div className="project-tree-toolbar"><div className="section-caption">СТРУКТУРА ПРОЕКТА · {projectFiles.length} ФАЙЛОВ</div><label className="project-tree-search"><Search size={12}/><input value={projectFileQuery} onChange={event => setProjectFileQuery(event.target.value)} placeholder="Поиск по файлам и папкам…"/>{projectFileQuery && <button onClick={() => setProjectFileQuery("")} title="Очистить поиск"><X size={11}/></button>}</label></div>
            <div className="project-content-search"><div className="section-caption">ПОИСК В ИСХОДНИКАХ</div><div><Search size={12}/><input value={projectContentQuery} onChange={event => setProjectContentQuery(event.target.value)} onKeyDown={event => { if (event.key === "Enter") void searchProjectContent(); }} placeholder="Найти текст в файлах…"/><button disabled={projectContentSearching || projectContentQuery.trim().length < 2} onClick={() => void searchProjectContent()}>{projectContentSearching ? "…" : "Найти"}</button></div></div>
            {projectContentResults.length > 0 && <div className="project-content-results">{projectContentResults.map((item,index) => <button key={item.path+item.line+index} onClick={() => { const file=projectFiles.find(f=>f.path===item.path); if(file) void openProjectFile(file, item.line); }}><b>{item.path}:{item.line}</b><span>{item.text}</span></button>)}</div>}
            {projectFilesLoading && <small className="source-loading">Загрузка…</small>}
            {projectFiles.length > 0 && projectTree.length > 0 && <div className="project-tree-list">{renderProjectTree(projectTree)}</div>}
            {projectFiles.length > 0 && projectTree.length === 0 && <p className="telemetry-empty">По запросу ничего не найдено.</p>}
            {projectFiles.length === 0 && <p className="telemetry-empty">В архиве не найдено файлов для отображения.</p>}
          </aside>
          <section className="project-file-view">
            {projectEditorTabs.length > 0 && <div className="project-editor-tabs" role="tablist" aria-label="Открытые файлы">{projectEditorTabs.map(tab => <div key={tab.path} className={"project-editor-tab" + (activeEditorTab === tab.path ? " active" : "")} role="tab" aria-selected={activeEditorTab === tab.path}><button className="project-editor-tab-open" title={tab.path} onClick={() => { const file = projectFiles.find(item => item.path === tab.path); if (file) void openProjectFile(file); }}><FileText size={11}/><span>{tab.name}</span>{tab.draft !== tab.baseline && <i title="Несохранённые изменения" />}</button><button className="project-editor-tab-close" title="Закрыть вкладку" onClick={() => closeEditorTab(tab.path)}><X size={11}/></button></div>)}</div>}
            <div className="project-file-view-head"><span><FileText size={13}/> {projectFilePreview?.path || projectVisualPreview?.path || "Выбери файл в дереве проекта"}</span>
              {projectFilePreview && <div className="project-file-tools"><small>{projectFilePreview.total_lines} строк · {projectFilePreview.editable ? "текстовый файл" : "только чтение"}</small>{projectFilePreview.editable && !projectEditing && <button onClick={() => setActiveEditorEditing(true)}><Pencil size={12}/> Изменить</button>}{projectEditing && <><button className="save" disabled={projectSaving} onClick={() => void saveProjectFile()}><Save size={12}/> {projectSaving ? "Сохранение…" : "Сохранить"}</button><button onClick={() => { const baseline = projectEditorTabs.find(tab => tab.path === activeEditorTab)?.baseline ?? projectFilePreview.content ?? ""; updateActiveEditorDraft(baseline); setActiveEditorEditing(false); }}>Отмена</button></>}</div>}{(projectFilePreview || projectVisualPreview) && <button className="ghost" onClick={downloadProjectFile} title="Скачать выбранный файл"><Download size={12}/> Скачать файл</button>}
            </div>
            {projectVisualPreview ? <div className={"project-asset-preview " + (projectVisualPreview.kind === "pdf" ? "is-pdf" : "is-image")}>{projectVisualPreview.kind === "image" ? <img src={projectVisualPreview.url} alt={projectVisualPreview.path} /> : <iframe src={projectVisualPreview.url} title={projectVisualPreview.path} />}</div> : projectFilePreview ? projectEditing ? <>
              <div className="project-editor-findbar">
                <div><Search size={12}/><input ref={editorFindRef} value={editorFind} onChange={event => setEditorFind(event.target.value)} placeholder="Найти в файле…" onKeyDown={event => { if (event.key === "Enter") findNextInEditor(); }}/><button onClick={findNextInEditor} disabled={!editorFind}>Найти далее</button></div>
                <div><ArrowLeftRight size={12}/><input value={editorReplace} onChange={event => setEditorReplace(event.target.value)} placeholder="Заменить на…"/><button onClick={replaceAllInEditor} disabled={!editorFind}>Заменить всё</button></div>
                <div className="editor-jump-control"><label><span>СТРОКА</span><input ref={editorJumpRef} inputMode="numeric" value={editorJumpLine} onChange={event => setEditorJumpLine(event.target.value.replace(/[^0-9]/g, ""))} onKeyDown={event => { if (event.key === "Enter") jumpToEditorLine(); }} placeholder="№"/></label><button onClick={jumpToEditorLine} disabled={!editorJumpLine}>Перейти</button></div><small>{editorFind ? `${Math.max(0, projectDraft.split(editorFind).length - 1)} совп.` : "Ctrl+F поиск · Ctrl+H замена · Ctrl+G строка · Ctrl+S сохранить"}</small>
              </div>
              <div className="project-editor-surface">
                <div className="project-editor-gutter" ref={editorGutterRef}>{projectDraft.split("\n").map((_, index) => <span key={index}>{index + 1}</span>)}</div>
                <textarea ref={editorRef} className="project-code-editor" spellCheck={false} value={projectDraft} onChange={event => updateActiveEditorDraft(event.target.value)} onKeyDown={handleEditorKeyDown} onScroll={event => { if (editorGutterRef.current) editorGutterRef.current.scrollTop = event.currentTarget.scrollTop; }} />
              </div>
            </> : <pre className="project-source-code">{projectFilePreview.lines.map(line => <span className="code-line" key={line.line}><i>{line.line}</i><code>{highlightCodeLine(line.text || " ")}</code></span>)}</pre> : <div className="project-file-empty"><FolderOpen size={30}/><b>Проект открыт в INVEST</b><p>Выбери файл слева, чтобы просмотреть его содержимое. Каталог проекта уже подключён к блоку Project source на графе.</p></div>}
          </section>
=======

    const refreshProjects = async () => {
        const response = await fetch("/api/projects");
        if (!response.ok) throw new Error("Не удалось обновить библиотеку проектов");
        setProjects(await response.json());
    };
    const uploadProjectArchive = async (file: File | undefined, projectId?: string) => {
        if (!file) return;
        setUploading(true); setUploadingProjectId(projectId || "new");
        try {
            const form = new FormData(); form.append("file", file);
            const response = await fetch(projectId ? `/api/projects/${projectId}/archive` : "/api/projects", {
                method: projectId ? "PUT" : "POST", body: form,
            });
            const data = await response.json();
            if (!response.ok) throw new Error(typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail || data));
            await refreshProjects();
            if (activeProject?.id === data.id) {
                setActiveProject(data);
                const filesResponse = await fetch(`/api/projects/${data.id}/files`);
                if (filesResponse.ok) {
                    const updatedFiles = ((await filesResponse.json()).files || []) as ProjectFile[];
                    setProjectFiles(updatedFiles);
                    setProjectFileQuery("");
                    setExpandedProjectDirs(new Set(updatedFiles.flatMap(file => {
                        const parts = file.path.split("/");
                        return parts.slice(0, -1).map((_, index) => parts.slice(0, index + 1).join("/"));
                    })));
                }
                setProjectFilePreview(null);
                const historyResponse = await fetch(`/api/projects/${data.id}/history`);
                if (historyResponse.ok) setProjectHistory(await historyResponse.json());
            }
            setResult((projectId ? "Проект обновлён" : "Проект добавлен") + " · " + data.name + " · " + data.file_count + " файлов");
        } catch (error) { setResult("Ошибка загрузки проекта: " + String(error)); }
        finally { setUploading(false); setUploadingProjectId(null); }
    };
    const openProject = async (project: Project) => {
        setProjectFilesLoading(true);
        try {
            const response = await fetch(`/api/projects/${project.id}/files`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || "Не удалось открыть проект");
            setActiveProject(data.project || project);
            setProjectFiles(data.files || []);
            setProjectFilePreview(null);
            setProjectHistoryOpen(false);
            const historyResponse = await fetch(`/api/projects/${project.id}/history`);
            if (historyResponse.ok) setProjectHistory(await historyResponse.json());
            else setProjectHistory([]);
            const sourceNode = nodes.find(node => node.data.category === "Source");
            if (sourceNode) updateNode(sourceNode.id, {
                nodeType: "source.upload", label: project.name, description: "Постоянный проект из библиотеки. Источник доступен всем связанным сканерам.",
                config: { path: project.workspace_path }, executionStatus: "idle", executionDetail: "", executionNotes: [], executionSeverity: undefined,
            });
            setProjectWorkspaceOpen(true);
            setResult("Открыт проект · " + project.name + " · источник подключён к workflow.");
        } catch (error) { setResult("Не удалось открыть проект: " + String(error)); }
        finally { setProjectFilesLoading(false); }
    };
    const renameProject = async (project: Project) => {
        const name = window.prompt("Новое название проекта:", project.name);
        if (name === null || !name.trim()) return;
        try {
            const response = await fetch(`/api/projects/${project.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim() }) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || "Не удалось переименовать проект");
            await refreshProjects();
            if (activeProject?.id === project.id) {
                setActiveProject(data);
                const sourceNode = nodes.find(node => node.data.category === "Source");
                if (sourceNode && sourceNode.data.config.path === project.workspace_path) updateNode(sourceNode.id, { label: data.name });
            }
            setResult("Проект переименован · " + data.name);
        } catch (error) { setResult("Ошибка переименования: " + String(error)); }
    };
    const deleteProject = async (project: Project) => {
        if (!window.confirm(`Удалить проект «${project.name}» и все его файлы? Это действие необратимо.`)) return;
        try {
            const response = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Не удалось удалить проект");
            await refreshProjects();
            if (activeProject?.id === project.id) {
                const sourceNode = nodes.find(node => node.data.category === "Source");
                if (sourceNode && sourceNode.data.config.path === project.workspace_path) updateNode(sourceNode.id, {
                    label: "Project source", description: "Выбери ZIP из библиотеки или настрой Git-источник.", config: {},
                    executionStatus: "idle", executionDetail: "", executionNotes: [], executionSeverity: undefined,
                });
                setActiveProject(null); setProjectFiles([]); setProjectFilePreview(null); setProjectHistory([]); setProjectHistoryOpen(false); setProjectWorkspaceOpen(false);
            }
            setResult("Проект удалён · " + project.name);
        } catch (error) { setResult("Ошибка удаления: " + String(error)); }
    };
    const openProjectFile = async (file: ProjectFile, startLine = 1) => {
        if (!activeProject) return;
        setProjectFilesLoading(true);
        try {
            const params = new URLSearchParams({ path: file.path, start_line: String(startLine) });
            const response = await fetch(`/api/projects/${activeProject.id}/file?${params}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || "Не удалось открыть файл");
            setProjectFilePreview(data);
            setProjectEditing(false);
            setProjectDraft(data.editable && typeof data.content === "string" ? data.content : "");
        } catch (error) { setResult("Просмотр файла: " + String(error)); }
        finally { setProjectFilesLoading(false); }
    };

    const searchProjectContent = async () => {
        if (!activeProject || projectContentQuery.trim().length < 2) return;
        setProjectContentSearching(true);
        try {
            const params = new URLSearchParams({ q: projectContentQuery.trim() });
            const response = await fetch(`/api/projects/${activeProject.id}/search?${params}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || "Поиск не выполнен");
            setProjectContentResults(data.results || []);
            setResult(`Поиск завершён · ${(data.results || []).length} совпадений · проверено ${data.scanned_files} файлов`);
        } catch (error) { setResult("Поиск по содержимому: " + String(error)); }
        finally { setProjectContentSearching(false); }
    };
    const saveProjectFile = async () => {
        if (!activeProject || !projectFilePreview?.editable || !projectEditing) return;
        setProjectSaving(true);
        try {
            const params = new URLSearchParams({ path: projectFilePreview.path });
            const response = await fetch(`/api/projects/${activeProject.id}/file?${params}`, {
                method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: projectDraft }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || "Не удалось сохранить файл");
            const savedPath = projectFilePreview.path;
            setProjectEditing(false);
            await openProjectFile({ path: savedPath, size: new Blob([projectDraft]).size });
            setResult("Файл сохранён · " + data.path);
            const historyResponse = await fetch(`/api/projects/${activeProject.id}/history`);
            if (historyResponse.ok) setProjectHistory(await historyResponse.json());
        } catch (error) { setResult("Ошибка сохранения: " + String(error)); }
        finally { setProjectSaving(false); }
    };
    const uploadArchive = async (file?: File) => {
        if (!file) return;
        setUploading(true); setFindings([]);
        try {
            const form = new FormData(); form.append("file", file);
            const response = await fetch("/api/sources/upload", { method: "POST", body: form });
            const data = await response.json();
            if (!response.ok) throw new Error(typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail || data));
            const sourceNode = nodes.find(node => node.data.category === "Source");
            if (sourceNode) updateNode(sourceNode.id, { nodeType: "source.upload", label: "Workspace source", description: "Сканирует безопасно распакованный ZIP-каталог.", config: { path: data.path }, executionStatus: "idle", executionDetail: "" });
            setResult("Архив принят · " + data.files + " файлов · " + Math.round(data.expanded_bytes / 1024) + " KiB распаковано. Источник обновлён.");
        } catch (error) { setResult("Ошибка загрузки ZIP: " + String(error)); }
        finally { setUploading(false); }
    };
    const persistWorkflow = async () => {
        const response = await fetch(workflowId ? "/api/workflows/" + workflowId : "/api/workflows", {
            method: workflowId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(graph),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(JSON.stringify(data));
        setWorkflowId(data.id); return data.id as string;
    };
    const saveWorkflow = async () => {
        setBusy(true);
        try { const id = await persistWorkflow(); setResult("Сохранено · workflow " + id); }
        catch (error) { setResult("Не удалось сохранить workflow: " + String(error)); }
        finally { setBusy(false); }
    };
    const validateWorkflow = async () => {
        setBusy(true);
        try {
            const response = await fetch("/api/workflows/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(graph) });
            const data = await response.json(); setResult(JSON.stringify(data, null, 2)); setShowResult(true);
        } catch { setResult("Не удалось связаться с API. Проверьте backend."); setShowResult(true); }
        finally { setBusy(false); }
    };
    const runWorkflow = async () => {
        setBusy(true); setFindings([]);
        try {
            const id = await persistWorkflow();
            const response = await fetch("/api/workflows/" + id + "/runs", { method: "POST" });
            const queued = await response.json();
            if (!response.ok) throw new Error(JSON.stringify(queued));
            setShowResult(true);
            setResult("Задание поставлено в очередь · " + queued.run_id);
            setLastRunId(queued.run_id); window.localStorage.setItem("invest.lastRunId", queued.run_id);

            setTelemetry({ status: "queued", total_findings: 0, severity: {}, scanners: [], completed_nodes: 0, total_nodes: nodes.length });
            const completed = await new Promise<Telemetry>((resolve, reject) => {
                const stream = new EventSource("/api/runs/" + queued.run_id + "/events");
                let settled = false;
                let fallbackStarted = false;
                const finish = (data: Telemetry) => {
                    if (settled) return;
                    settled = true; stream.close(); window.clearTimeout(timeout); resolve(data);
                };
                const fallback = async () => {
                    if (fallbackStarted || settled) return;
                    fallbackStarted = true; stream.close();
                    try {
                        for (let attempt = 0; attempt < 300; attempt += 1) {
                            await new Promise(resolveWait => window.setTimeout(resolveWait, 1000));
                            const response = await fetch("/api/runs/" + queued.run_id + "/telemetry");
                            if (!response.ok) throw new Error("Не удалось получить телеметрию задания");
                            const data: Telemetry = await response.json();
                            setTelemetry(data);
                            if (["completed", "partial", "failed"].includes(data.status)) { finish(data); return; }
                        }
                        throw new Error("Превышено время ожидания worker. Задание сохранено в очереди.");
                    } catch (error) {
                        if (!settled) { settled = true; window.clearTimeout(timeout); reject(error); }
                    }
                };
                const timeout = window.setTimeout(() => { void fallback(); }, 300000);
                stream.onmessage = event => {
                    try {
                        const data: Telemetry = JSON.parse(event.data);
                        setTelemetry(data);
                        setResult("Выполнение · " + data.completed_nodes + "/" + data.total_nodes + " блоков");
                        if (["completed", "partial", "failed"].includes(data.status)) finish(data);
                    } catch { /* Ignore malformed telemetry frame and keep the stream alive. */ }
                };
                stream.onerror = () => { void fallback(); };
            });
            const findingsResponse = await fetch("/api/runs/" + queued.run_id + "/findings");
            if (findingsResponse.ok) setFindings(await findingsResponse.json());
            const telemetryResponse = await fetch("/api/runs/" + queued.run_id + "/telemetry");
            if (telemetryResponse.ok) setTelemetry(await telemetryResponse.json());
            setResult("Проверка завершена · " + completed.status + " · " + completed.total_findings + " находок");
            if (completed.status === "failed") setResult("Проверка завершилась с ошибкой.");
        } catch (error) { setResult("Запуск не выполнен: " + String(error)); setShowResult(true); }
        finally { setBusy(false); }
    };
    const updateFindingLifecycle = async (finding: Finding, state: FindingLifecycle["state"]) => {
        if (!workflowId || !finding.fingerprint) return;
        const reason = window.prompt("Причина изменения статуса уязвимости:", state === "open" ? "Повторная проверка" : "");
        if (reason === null || !reason.trim()) return;
        try {
            const response = await fetch("/api/workflows/" + workflowId + "/findings/" + finding.fingerprint + "/state", {
                method: "PUT", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ state, reason: reason.trim() }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || "Не удалось изменить статус");
            setFindingStates(current => ({ ...current, [finding.fingerprint!]: data }));
            setResult("Статус уязвимости обновлён · " + state);
        } catch (error) { setResult("Ошибка статуса уязвимости: " + String(error)); }
    };
    const loadFindingHistory = async (fingerprint: string) => {
        if (!workflowId) return;
        try {
            const response = await fetch("/api/workflows/" + workflowId + "/findings/" + fingerprint + "/history");
            if (!response.ok) throw new Error("Не удалось загрузить историю");
            const history = await response.json();
            setFindingHistory(current => ({ ...current, [fingerprint]: history }));
        } catch (error) { setResult(String(error)); }
    };
    const categories = ["Все", ...Array.from(new Set(manifests.map(item => item.category)))];
    const filtered = manifests.filter(item => (category === "Все" || item.category === category) && (item.title + " " + item.description + " " + item.type).toLowerCase().includes(search.toLowerCase()));
    const findingGroups = useMemo(() => {
        const query = findingQuery.trim().toLowerCase();
        const visible = findings.filter(item => (findingSeverity === "Все" || item.severity.toUpperCase() === findingSeverity)
            && (!query || [item.rule_id, item.path, item.message, item.why_it_matters].filter(Boolean).join(" ").toLowerCase().includes(query)));
        const groups = new Map<string, Finding[]>();
        for (const item of visible) { const path = item.path || "Файл не указан"; groups.set(path, [...(groups.get(path) || []), item]); }
        return Array.from(groups, ([path, items]) => ({ path, items: items.sort((a, b) => (a.line || 0) - (b.line || 0)) })).sort((a, b) => a.path.localeCompare(b.path));
    }, [findings, findingQuery, findingSeverity]);
    const orderedVisibleFindings = findingGroups.flatMap(group => group.items);
    const selectedFindingIndex = selectedFinding ? orderedVisibleFindings.findIndex(item => item.fingerprint === selectedFinding.fingerprint) : -1;
    const selectAdjacentFinding = (direction: -1 | 1) => { const next = orderedVisibleFindings[selectedFindingIndex + direction]; if (next) { setSelectedFinding(next); setSourceWindowStart(Math.max(1, (next.line || 1) - 40)); } };
    const toggleFindingSource = (finding: Finding) => {
        if (selectedFinding?.fingerprint === finding.fingerprint) { setSelectedFinding(null); return; }
        setSelectedFinding(finding); setSourceWindowStart(Math.max(1, (finding.line || 1) - 40));
    };
    const aiNode = nodes.find(node => node.data.nodeType === "ai.explain");
    const aiNodeResult = aiNode ? telemetry?.node_results?.[aiNode.id] : undefined;

    const projectTree = useMemo(() => {
        const root: ProjectTreeNode = { name: "", path: "", kind: "directory", children: [] };
        const query = projectFileQuery.trim().toLowerCase();
        for (const file of projectFiles) {
            if (query && !file.path.toLowerCase().includes(query)) continue;
            const parts = file.path.split("/").filter(Boolean);
            let cursor = root;
            parts.forEach((part, index) => {
                const currentPath = parts.slice(0, index + 1).join("/");
                const isFile = index === parts.length - 1;
                let child = cursor.children.find(item => item.name === part);
                if (!child) {
                    child = { name: part, path: currentPath, kind: isFile ? "file" : "directory", size: isFile ? file.size : undefined, children: [] };
                    cursor.children.push(child);
                }
                cursor = child;
            });
        }
        const sort = (items: ProjectTreeNode[]) => {
            items.sort((a, b) => a.kind === b.kind ? a.name.localeCompare(b.name) : a.kind === "directory" ? -1 : 1);
            items.forEach(item => sort(item.children));
        };
        sort(root.children);
        return root.children;
    }, [projectFiles, projectFileQuery]);

    const toggleProjectDir = (path: string) => setExpandedProjectDirs(current => {
        const next = new Set(current);
        if (next.has(path)) next.delete(path); else next.add(path);
        return next;
    });
    const renderProjectTree = (items: ProjectTreeNode[], depth = 0): React.ReactNode => items.map(item => {
        const expanded = projectFileQuery.trim() ? true : expandedProjectDirs.has(item.path);
        if (item.kind === "directory") return <div className="project-tree-entry" key={item.path}>
            <button className="project-file-row project-folder-row" style={{ paddingLeft: 7 + depth * 13 }} onClick={() => toggleProjectDir(item.path)} aria-expanded={expanded}>
                <ChevronRight size={11} className={expanded ? "project-tree-chevron expanded" : "project-tree-chevron"} /><FolderOpen size={13} /><span title={item.path}>{item.name}</span><small>{item.children.length}</small>
            </button>
            {expanded && <div className="project-tree-children">{renderProjectTree(item.children, depth + 1)}</div>}
        </div>;
        const file = projectFiles.find(candidate => candidate.path === item.path);
        return <button key={item.path} className={"project-file-row project-leaf-row" + (projectFilePreview?.path === item.path ? " selected" : "")} style={{ paddingLeft: 24 + depth * 13 }} onClick={() => file && void openProjectFile(file)}><FileText size={12} /><span title={item.path}>{item.name}</span><small>{(item.size || 0) < 1024 ? (item.size || 0) + " B" : ((item.size || 0) / 1024).toFixed(0) + " KB"}</small></button>;
    });

    return <main className="shell">
        <header className="topbar">
            <div className="brand"><div className="mark"><Shield size={19} /></div><div><b>INVEST <span>／</span> SECURITY WORKFLOW</b><small>VISUAL SECURITY AUTOMATION PLATFORM</small></div></div>
            <div className="status"><i className={notice.startsWith("API подключён") ? "online" : ""} />{notice}</div>
            <div className="actions"><span className="revision"><GitBranch size={13} /> feat / platform-foundation</span>
                <button className="ghost" disabled={busy} onClick={saveWorkflow}><Save size={13} /> Сохранить</button>
                <button className="validate" disabled={busy} onClick={validateWorkflow}><Check size={14} /> Проверить</button>
                <button className="run" disabled={busy} onClick={runWorkflow}><CirclePlay size={14} /> {busy ? "Выполняется…" : "Запустить"}</button>
            </div>
        </header>
        <div className={"layout" + (leftCollapsed ? " left-collapsed" : "") + (rightCollapsed ? " right-collapsed" : "")}>
            <aside className={"panel palette" + (leftCollapsed ? " is-collapsed" : "")}>
                {leftCollapsed ? <button className="collapsed-rail" onClick={() => setLeftCollapsed(false)} title="Развернуть библиотеку блоков" aria-label="Развернуть библиотеку блоков"><PanelLeftOpen size={17} /><span>БЛОКИ</span></button> : <>
                    <div className="panel-heading"><div><div className="eyebrow">WORKFLOW BUILDER</div><h3><Workflow size={17} /> Библиотека блоков</h3></div><div className="panel-heading-actions"><span className="counter">{manifests.length}</span><button className="icon-button collapse-control" onClick={() => setLeftCollapsed(true)} title="Свернуть библиотеку блоков" aria-label="Свернуть библиотеку блоков"><PanelLeftClose size={14} /></button></div></div>
                    <p className="panel-intro">Добавляй компоненты на холст. Настройки, замена и удаление доступны в инспекторе выбранного блока.</p>
                    <div className="searchbox"><Search size={14} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Найти блок или назначение…" /><kbd>/</kbd></div>
                    <div className="category-filters">{categories.map(item => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
                    <div className="source-section">
                        <div className="section-caption">ПРОЕКТЫ / PROJECT LIBRARY</div>
                        <div className="project-library">
                            <label className="project-add-button"><Plus size={13} /><span>{uploadingProjectId === "new" ? "Загрузка проекта…" : "Добавить ZIP в библиотеку"}</span><input type="file" accept=".zip,application/zip" disabled={uploading || busy} onChange={event => { void uploadProjectArchive(event.target.files?.[0]); event.currentTarget.value = ""; }} /></label>
                            <small className="upload-hint">До 300 MiB на архив · постоянное хранение · файлы не исполняются</small>
                            {projects.map(project => <article className={"project-library-item" + (activeProject?.id === project.id ? " project-active" : "")} key={project.id}>
                                <div className="project-library-main"><div className="project-folder-icon"><FolderOpen size={15} /></div><div className="project-library-copy"><b title={project.name}>{project.name}</b><small>{project.file_count} файлов · {(project.expanded_bytes / 1048576).toFixed(1)} MiB</small></div></div>
                                <div className="project-library-actions">
                                    <button title="Открыть проект в площадке" onClick={() => void openProject(project)}><FolderOpen size={12} />Открыть</button>
                                    <label title="Обновить содержимое ZIP"><RefreshCw size={12} /><input type="file" accept=".zip,application/zip" disabled={uploading || busy} onChange={event => { void uploadProjectArchive(event.target.files?.[0], project.id); event.currentTarget.value = ""; }} /></label>
                                    <button title="Переименовать" onClick={() => void renameProject(project)}><Pencil size={12} /></button>
                                    <button title="Удалить проект" className="project-delete" onClick={() => void deleteProject(project)}><Trash2 size={12} /></button>
                                </div>
                            </article>)}
                            {projects.length === 0 && <div className="project-library-empty"><FolderOpen size={17} /><span>Библиотека пока пуста. Добавь ZIP-архив проекта.</span></div>}
                        </div>
                        <div className="section-caption source-secondary-caption">БЫСТРЫЙ ИСТОЧНИК ДЛЯ ОДНОГО ЗАПУСКА</div>
                        <label className="archive-upload"><UploadCloud size={15} /><span>{uploading ? "Загрузка и проверка…" : "Загрузить ZIP проекта"}</span><input type="file" accept=".zip,application/zip" disabled={uploading || busy} onChange={event => { void uploadArchive(event.target.files?.[0]); event.currentTarget.value = ""; }} /></label>
                        <small className="upload-hint">До 300 MiB · временный источник для одного workflow</small>
                        <div className="source-divider"><span>ИЛИ КЛОНИРОВАТЬ ЧЕРЕЗ GIT</span></div>
                        <label className="source-field">HTTPS-ссылка репозитория<input value={gitUrl} onChange={event => setGitUrl(event.target.value)} placeholder="https://github.com/owner/repository.git" disabled={busy || uploading} /></label>
                        <label className="source-field">Ветка или тег<input value={gitRef} onChange={event => setGitRef(event.target.value)} placeholder="main (необязательно)" disabled={busy || uploading} /></label>
                        <button className="git-source-button" disabled={busy || uploading || !gitUrl.trim()} onClick={() => {
                            const sourceNode = nodes.find(node => node.data.category === "Source");
                            if (!sourceNode) { setResult("В графе отсутствует блок-источник."); return; }
                            updateNode(sourceNode.id, { nodeType: "source.git", label: "Git repository", description: "Клонирует разрешённый HTTPS-репозиторий в изолированную рабочую область.", config: { url: gitUrl.trim(), ...(gitRef.trim() ? { ref: gitRef.trim() } : {}) }, executionStatus: "idle", executionDetail: "" });
                            setResult("Git-источник настроен. Добавьте точный URL в ALLOWED_TARGETS корневого .env, затем нажмите «Запустить».");
                        }}><GitBranch size={13} /> Использовать Git-источник</button>
                        <small className="upload-hint">Только HTTPS и точное совпадение с ALLOWED_TARGETS в корневом .env. Клонирование выполняется worker при запуске.</small>
                    </div>
                    <div className="section-caption library-caption">КОМПОНЕНТЫ API</div>
                    {filtered.map(manifest => <article className="library-item" key={manifest.type}>
                        <div className="library-main"><div className={"library-icon tone-" + (categoryMeta[manifest.category] || { tone: "slate" }).tone}><Code2 size={15} /></div><div className="library-copy"><b>{manifest.title}</b><small>{manifest.type}</small></div><button className="add-node" title="Добавить блок на холст" onClick={() => addNode(manifest)}><Plus size={15} /></button></div>
                        <details className="node-help"><summary><CircleHelp size={12} /> Что делает блок <ChevronDown size={12} /></summary><p>{manifest.description}</p><span>{categoryMeta[manifest.category]?.label || manifest.category} · тип: {manifest.type}</span></details>
                    </article>)}
                    {!manifests.length && <div className="empty-library">Загружаем реестр компонентов API…</div>}
                    {manifests.length > 0 && filtered.length === 0 && <div className="empty-library">Ничего не найдено.</div>}
                    <div className="palette-note"><LockKeyhole size={14} /><span>Код репозитория анализируется как данные, без запуска его скриптов.</span></div>
                </>}
            </aside>

            <section className="editor">
                <div className="editor-head"><div><span className="eyebrow">EDITOR / WORKFLOW 001</span><h1>Security pipeline</h1><p>Перетаскивай блоки, соединяй порты, выбирай элемент для редактирования</p></div>
                    <div className="counts"><span><Layers3 size={13} />{nodes.length} блоков</span><span><GitBranch size={13} />{edges.length} связей</span></div></div>
                <div className="flow"><ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes}
                    onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onReconnect={onReconnect}
                    onNodeClick={(_, node) => { setSelectedNodeId(node.id); setSelectedEdgeId(null); }}
                    onEdgeClick={(_, edge) => { setSelectedEdgeId(edge.id); setSelectedNodeId(null); }}
                    onPaneClick={() => { setSelectedNodeId(null); setSelectedEdgeId(null); }}
                    edgesReconnectable deleteKeyCode={["Backspace", "Delete"]} fitView fitViewOptions={{ padding: 0.2 }}>
                    <Background color="#31445c" gap={22} size={1} /><MiniMap pannable zoomable nodeColor={node => node.type === "workflow" ? "#426b91" : "#526176"} /><Controls />
                </ReactFlow></div>
                <div className="flow-foot"><span><Activity size={13} /> Редактор графа <i /> Сетка 22 px</span><span>Связь можно выбрать и перетащить за конец для переназначения</span></div>
            </section>

            <aside className={"panel inspector" + (rightCollapsed ? " is-collapsed" : "")}>
                {rightCollapsed ? <button className="collapsed-rail" onClick={() => setRightCollapsed(false)} title="Развернуть инспектор" aria-label="Развернуть инспектор"><PanelRightOpen size={17} /><span>ИНСПЕКТОР</span></button> : <>
                    <div className="inspector-top"><div><div className="eyebrow">INSPECTOR / EDITOR</div><h3><Activity size={17} /> Свойства элемента</h3></div><div className="panel-heading-actions"><button className="icon-button collapse-control" onClick={() => setRightCollapsed(true)} title="Свернуть инспектор" aria-label="Свернуть инспектор"><PanelRightClose size={14} /></button><button className="icon-button" title={showResult ? "Свернуть результат" : "Показать результат"} onClick={() => setShowResult(value => !value)}>{showResult ? <X size={14} /> : <ChevronDown size={14} />}</button></div></div>
                    {selectedNode && <section className="edit-section">
                        <div className="section-caption">РЕДАКТИРОВАНИЕ БЛОКА</div>
                        <label className="field-label">Название блока<input value={selectedNode.data.label} onChange={event => updateNode(selectedNode.id, { label: event.target.value })} /></label>
                        <label className="field-label">Заменить тип блока<select value={selectedNode.data.nodeType} onChange={event => replaceSelectedNode(event.target.value)}><option value={selectedNode.data.nodeType}>{selectedNode.data.nodeType}</option>{manifests.filter(item => item.type !== selectedNode.data.nodeType).map(item => <option key={item.type} value={item.type}>{item.title} · {item.type}</option>)}</select></label>
                        {selectedNode.data.nodeType === "ai.explain" ? <>
                            <div className="ai-node-guide"><div><Bot size={16} /><b>AI-АНАЛИЗАТОР ПОДКЛЮЧЁН К ГРАФУ</b></div><p>Получает находки из блока Merge findings. Ключ API хранится только в корневом .env и не вводится здесь.</p><ol><li>Добавь LLM_BASE_URL, LLM_MODEL и LLM_API_KEY в .env</li><li>Перезапусти api и worker</li><li>Запусти workflow — объяснения появятся в карточках находок</li></ol></div>
                            <label className="field-label">Язык объяснений<select value={String(selectedNode.data.config.language || "ru")} onChange={event => updateNode(selectedNode.id, { config: { ...selectedNode.data.config, language: event.target.value } })}><option value="ru">Русский</option><option value="en">English</option></select></label>
                            <label className="field-label">Максимум находок<input type="number" min={1} max={25} value={Number(selectedNode.data.config.max_findings ?? 20)} onChange={event => updateNode(selectedNode.id, { config: { ...selectedNode.data.config, max_findings: Math.max(1, Math.min(25, Number(event.target.value) || 1)) } })} /></label>
                            <p className="edit-hint">AI не меняет severity, не создаёт новые уязвимости и не влияет на Security Gate. Ветка AI независима от проверки политики.</p>
                        </> : <>
                            <label className="field-label">Конфигурация (JSON)<textarea className="config-editor" spellCheck={false} value={configText} onChange={event => setConfigText(event.target.value)} /></label>
                        </>}
                        {selectedNode.data.nodeType !== "ai.explain" && <><button className="save-config" onClick={saveNodeConfig}><Check size={13} /> Применить настройки</button>{configError && <p className="config-error">{configError}</p>}</>}
                        <div className="element-actions"><button className="ghost" onClick={duplicateSelectedNode}><Copy size={13} /> Дублировать</button><button className="danger" onClick={deleteSelectedNode}><Trash2 size={13} /> Удалить блок</button></div>
                        <p className="edit-hint">Замена сохраняет позицию и связи блока, но сбрасывает его конфигурацию. Удаление также удаляет связанные рёбра.</p>
                    </section>}
                    {selectedEdge && <section className="edit-section">
                        <div className="section-caption">РЕДАКТИРОВАНИЕ СВЯЗИ</div>
                        <label className="field-label">Откуда (источник)<select value={selectedEdge.source} onChange={event => updateEdgeEndpoint("source", event.target.value)}>{nodes.map(node => <option key={node.id} value={node.id}>{node.data.label} · {node.id}</option>)}</select></label>
                        <label className="field-label">Куда (получатель)<select value={selectedEdge.target} onChange={event => updateEdgeEndpoint("target", event.target.value)}>{nodes.map(node => <option key={node.id} value={node.id}>{node.data.label} · {node.id}</option>)}</select></label>
                        <label className="field-label">Подпись связи<input value={edgeLabel} onChange={event => { setEdgeLabel(event.target.value); setEdges(current => current.map(edge => edge.id === selectedEdge.id ? { ...edge, label: event.target.value } : edge)); }} placeholder="например: success" /></label>
                        <div className="element-actions"><button className="danger" onClick={deleteSelectedEdge}><Trash2 size={13} /> Удалить связь</button></div>
                        <p className="edit-hint">Также можно создать связь, потянув линию от правого порта одного блока к левому порту другого. Перетащи конец существующей связи, чтобы перенаправить её.</p>
                    </section>}
                    {!selectedNode && !selectedEdge && <div className="empty-inspector"><Workflow size={26} /><b>Ничего не выбрано</b><p>Выбери блок или линию на холсте. Здесь появятся доступные настройки и действия.</p></div>}
                    <div className="inspector-tabs"><span className="tab-active">Результаты</span><span className="tab-state">{busy ? "RUNNING" : "IDLE"}</span></div>
                    <div className="runtime"><div><Bot size={18} /></div><section><b>Workflow runtime</b><small>Исполнитель графа API</small></section><label className={busy ? "running" : ""}>{busy ? "RUNNING" : "READY"}</label></div>
                    <section className="telemetry-card">
                        <div className="telemetry-heading"><div><div className="section-caption">RUN TELEMETRY</div><b>Последний запуск</b></div><span className={"telemetry-status status-" + (telemetry?.status || "empty")}>{telemetry?.status === "completed" ? "УСПЕШНО" : telemetry?.status === "partial" ? "ЧАСТИЧНО" : telemetry?.status === "failed" ? "ОШИБКА" : telemetry?.status === "running" ? "В РАБОТЕ" : telemetry?.status === "queued" ? "В ОЧЕРЕДИ" : "НЕТ ДАННЫХ"}</span></div>
                        {telemetry && telemetry.status !== "never_run" ? <>
                            {telemetry.security_gate && <div className={"security-gate-result gate-" + telemetry.security_gate.decision.toLowerCase()}><span>SECURITY GATE</span><strong>{telemetry.security_gate.decision}</strong><small>BLOCK: {telemetry.security_gate.policy.block_on.join(", ")} · WARN: {telemetry.security_gate.policy.warn_on.join(", ")}</small></div>}
                            <div className="telemetry-metrics">
                                <div><strong>{formatDuration(telemetry.duration_ms)}</strong><small>ДЛИТЕЛЬНОСТЬ</small></div>
                                <div><strong>{telemetry.total_findings}</strong><small>НАХОДКИ</small></div>
                                <div><strong>{telemetry.completed_nodes || 0}/{telemetry.total_nodes || 0}</strong><small>ШАГИ</small></div>
                            </div>
                            <div className="telemetry-time"><span>Начало: {formatDate(telemetry.started_at || telemetry.queued_at)}</span><span>Завершение: {formatDate(telemetry.finished_at)}</span></div>
                            {telemetry.status === "running" && <div className="telemetry-progress"><i style={{ width: `${telemetry.total_nodes ? Math.min(100, (telemetry.completed_nodes || 0) / telemetry.total_nodes * 100) : 0}%` }} /></div>}
                            <div className="severity-strip">{["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"].filter(level => (telemetry.severity?.[level] || 0) > 0).map(level => <span key={level} className={"severity-" + level.toLowerCase()}>{level} <b>{telemetry.severity[level]}</b></span>)}</div>
                            {telemetry.scanners?.length > 0 && <div className="scanner-telemetry">{telemetry.scanners.map(scanner => <div key={scanner.node_id || scanner.type}><span>{scanner.type.replace("scan.", "").toUpperCase()}</span><small>{scanner.status}</small><b>{scanner.findings} · {formatDuration(scanner.duration_ms)}</b></div>)}</div>}
                            {telemetry.current_node && <div className="telemetry-current"><span className="live-pulse" /> Сейчас выполняется: <b>{telemetry.current_node}</b></div>}
                            {telemetry.scanner_progress && <div className="scanner-file-progress">
                                <div><span>АНАЛИЗ ФАЙЛОВ</span><b>{telemetry.scanner_progress.files_scanned} / {telemetry.scanner_progress.total_files}</b></div>
                                <div className="scanner-file-track"><i style={{ width: telemetry.scanner_progress.total_files ? Math.min(100, telemetry.scanner_progress.files_scanned / telemetry.scanner_progress.total_files * 100) + "%" : "0%" }} /></div>
                                <small>Сейчас: {telemetry.scanner_progress.current_file}</small>
                            </div>}
                            {telemetry.trace && telemetry.trace.length > 0 && <div className="execution-timeline">
                                <div className="execution-timeline-title">ХОД ВЫПОЛНЕНИЯ <span>{telemetry.trace.length} / {telemetry.total_nodes || telemetry.trace.length}</span></div>
                                {telemetry.trace.map((step, index) => <div className={"execution-step step-" + step.status} key={step.node_id}>
                                    <i>{step.status === "completed" ? "✓" : step.status === "failed" ? "!" : step.status === "blocked" ? "Ⅱ" : index + 1}</i>
                                    <span><b>{step.type}</b><small>{step.status === "completed" ? "Завершён" : step.status === "failed" ? "Ошибка" : step.status === "blocked" ? "Заблокирован" : step.status}</small></span>
                                    <em>{formatDuration(step.duration_ms)}</em>
                                    {typeof step.findings === "number" && <strong>{step.findings} находок</strong>}
                                </div>)}
                                {telemetry.status === "running" && telemetry.current_node && <div className="execution-active"><span className="live-pulse" /> Выполняется {telemetry.current_node}…</div>}
                            </div>}
                        </> : <p className="telemetry-empty">Запусков пока нет. Телеметрия появится после первой проверки.</p>}
                    </section>
                    <div className="findings-head"><b>Результаты безопасности</b><span>{findings.length}</span></div>
                    {findings.length > 0 && <div className="finding-browser">
                        <label className="finding-search"><Search size={13} /><input value={findingQuery} onChange={event => setFindingQuery(event.target.value)} placeholder="Поиск по файлу, правилу или описанию" /></label>
                        <select aria-label="Фильтр серьёзности" value={findingSeverity} onChange={event => setFindingSeverity(event.target.value)}>{["Все", "CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"].map(level => <option key={level}>{level}</option>)}</select>
                        <span>{orderedVisibleFindings.length} / {findings.length}</span>
                    </div>}
                    {findings.length === 0 ? <p className="empty-findings">После запуска здесь появятся находки SAST, SCA и Secrets Scanner.</p> : findingGroups.length === 0 ? <p className="empty-findings">По текущим фильтрам ничего не найдено.</p> :
                        findingGroups.map(group => <section className="finding-file-group" key={group.path}>
                            <div className="finding-file-heading"><Code2 size={13} /><b>{group.path}</b><span>{group.items.length} · находок</span></div>
                            {group.items.map((finding, index) => <article className="finding" key={finding.id || finding.rule_id + index}>
                                <div><strong>{finding.rule_id}</strong><label>{finding.severity}</label></div>
                                <small className="finding-location">{finding.path}{finding.line ? ":" + finding.line : ""}</small>
                                <p>{finding.message || "Потенциальная проблема; проверьте контекст."}</p>
                                {finding.why_it_matters && <div className="finding-explanation"><b>ПОЧЕМУ ЭТО ПРОБЛЕМА</b><p>{finding.why_it_matters}</p></div>}
                                {finding.recommendation && <div className="finding-remediation"><b>КАК ИСПРАВИТЬ</b><p>{finding.recommendation}</p></div>}
                                {finding.ai_explanation && <div className="finding-ai-explanation">
                                    <div><Bot size={13} /><b>AI EXPLANATION</b><span>{Math.round(finding.ai_explanation.confidence * 100)}% confidence</span></div>
                                    <p><b>Причина:</b> {finding.ai_explanation.root_cause}</p>
                                    <p><b>Влияние:</b> {finding.ai_explanation.impact}</p>
                                    <p><b>Рекомендация:</b> {finding.ai_explanation.recommendation}</p>
                                    {finding.ai_explanation.evidence_limits && <small>Ограничения анализа: {finding.ai_explanation.evidence_limits}</small>}
                                </div>}
                                {!finding.ai_explanation && aiNode && <div className="finding-ai-explanation ai-explanation-pending">
                                    <div><Bot size={13} /><b>AI EXPLANATION</b><span>{aiNodeResult?.status === "completed" ? "НЕТ ОТВЕТА" : aiNodeResult?.status === "failed" ? "ОШИБКА" : aiNodeResult?.status === "configuration_required" ? "НЕ НАСТРОЕН" : "ОЖИДАЕТ ЗАПУСКА"}</span></div>
                                    <p>{aiNodeResult?.status === "configuration_required"
                                        ? "Объяснение не создано: настройте LLM_BASE_URL, LLM_MODEL и LLM_API_KEY в корневом .env и перезапустите api и worker."
                                        : aiNodeResult?.status === "failed"
                                            ? "Провайдер AI не вернул корректный результат. Проверьте адрес, модель, API-ключ и доступность провайдера."
                                            : aiNodeResult?.status === "completed"
                                                ? "Для этой находки модель не вернула проверенное объяснение или находка не попала в установленный лимит. Ниже остаются результаты детерминированного анализа."
                                                : "AI-объяснение появится после выполнения соответствующего блока workflow."}</p>
                                </div>}
                                {(finding.cwe?.length || finding.cve) && <div className="finding-identifiers">{finding.cwe?.map(value => <span key={value}>{value}</span>)}{finding.cve && <span>{finding.cve}</span>}</div>}
                                {finding.masked_value && <code>{finding.masked_value}</code>}
                                <button className="source-preview-toggle" onClick={() => setSelectedFinding(current => current?.fingerprint === finding.fingerprint ? null : finding)}>
                                    <Code2 size={13} /> {selectedFinding?.fingerprint === finding.fingerprint ? "Скрыть исходник" : "Открыть исходник"}
                                </button>
                                {selectedFinding?.fingerprint === finding.fingerprint && <div className="source-code-preview">
                                    <div className="source-code-head"><span>{finding.path}</span><div className="source-code-nav"><button disabled={selectedFindingIndex <= 0} onClick={() => selectAdjacentFinding(-1)} title="Предыдущая находка">←</button><b>{selectedFindingIndex >= 0 ? `${selectedFindingIndex + 1} / ${orderedVisibleFindings.length}` : `СТРОКА ${finding.line || "—"}`}</b><button disabled={selectedFindingIndex < 0 || selectedFindingIndex >= orderedVisibleFindings.length - 1} onClick={() => selectAdjacentFinding(1)} title="Следующая находка">→</button></div></div>
                                    {sourcePreviewLoading && <p className="source-loading">Загружаю проверенный фрагмент файла…</p>}
                                    {sourcePreviewError && <p className="source-preview-error">{sourcePreviewError}</p>}
                                    {sourcePreview?.redacted && <p className="source-redacted-note">Файл содержит секретную находку: содержимое строк полностью скрыто.</p>}
                                    {sourcePreview?.lines?.length ? <><div className="source-window-nav"><span>СТРОКИ {sourcePreview.start_line}–{sourcePreview.end_line} ИЗ {sourcePreview.total_lines}</span><div><button disabled={sourcePreview.start_line <= 1 || sourcePreviewLoading} onClick={() => setSourceWindowStart(Math.max(1, sourcePreview.start_line - 100))}>← 100</button><button disabled={sourcePreview.end_line >= sourcePreview.total_lines || sourcePreviewLoading} onClick={() => setSourceWindowStart(sourcePreview.end_line + 1)}>100 →</button></div></div><pre>{sourcePreview.lines.map(row => <span key={row.line} className={row.is_finding ? "code-line code-line-hit" : "code-line"}><i>{row.line}</i><code>{row.text || " "}</code></span>)}</pre></> : !sourcePreviewLoading && !sourcePreviewError && finding.code_context?.length ? <pre>{finding.code_context.map(row => <span key={row.line} className={row.is_finding ? "code-line code-line-hit" : "code-line"}><i>{row.line}</i><code>{row.text || " "}</code></span>)}</pre> : null}
                                </div>}
                                {finding.fingerprint && <div className="finding-lifecycle">
                                    <label>Статус
                                        <select value={findingStates[finding.fingerprint]?.state || "open"} onChange={event => void updateFindingLifecycle(finding, event.target.value as FindingLifecycle["state"])}>
                                            <option value="open">Открыта</option><option value="accepted_risk">Принятый риск</option><option value="fixed">Исправлена</option><option value="false_positive">Ложное срабатывание</option>
                                        </select>
                                    </label>
                                    <button className="history-button" onClick={() => void loadFindingHistory(finding.fingerprint!)}>История</button>
                                    {findingHistory[finding.fingerprint] && <div className="finding-history">{findingHistory[finding.fingerprint].length ? findingHistory[finding.fingerprint].map((entry, index) => <p key={index}><b>{String(entry.details.new_state || "изменение")}</b> · {formatDate(entry.created_at)}<small>{String(entry.details.reason || "")}</small></p>) : <small>Изменений пока нет.</small>}</div>}
                                </div>}
                            </article>)}
                        </section>)}
                    {showResult && <section className="result-section"><div className="result-title"><span>Последний ответ API</span><AlertTriangle size={13} /></div><pre>{result}</pre></section>}
                    <div className="safe"><Shield size={16} /><div><b>Изолированный анализ</b><p>Проект не запускается. ZIP проверяется, Git ограничен allowlist. Секреты маскируются.</p></div></div>
                </>}
            </aside>
>>>>>>> Stashed changes
        </div>
        {projectWorkspaceOpen && activeProject && <div className="project-workspace-backdrop">
            <section className="project-workspace">
                <header className="project-workspace-header"><div><div className="eyebrow">PROJECT WORKSPACE / SOURCE EXPLORER</div><h2><FolderOpen size={19} /> {activeProject.name}</h2><p>{activeProject.file_count} файлов · {(activeProject.expanded_bytes / 1048576).toFixed(1)} MiB · {activeProject.workspace_path}</p></div><div className="project-workspace-actions"><span className="project-connected"><i /> ПОДКЛЮЧЁН К WORKFLOW</span><button className="ghost" onClick={() => setProjectHistoryOpen(value => !value)}><RefreshCw size={13} /> История {projectHistory.length ? `· ${projectHistory.length}` : ""}</button><button className="ghost" onClick={() => setProjectWorkspaceOpen(false)}><X size={14} /> Закрыть</button></div></header>
                <div className="project-workspace-body">
                    <aside className="project-file-tree">
                        <div className="project-tree-toolbar"><div className="section-caption">СТРУКТУРА ПРОЕКТА · {projectFiles.length} ФАЙЛОВ</div><label className="project-tree-search"><Search size={12} /><input value={projectFileQuery} onChange={event => setProjectFileQuery(event.target.value)} placeholder="Поиск по файлам и папкам…" />{projectFileQuery && <button onClick={() => setProjectFileQuery("")} title="Очистить поиск"><X size={11} /></button>}</label></div>
                        <div className="project-content-search"><div className="section-caption">ПОИСК В ИСХОДНИКАХ</div><div><Search size={12} /><input value={projectContentQuery} onChange={event => setProjectContentQuery(event.target.value)} onKeyDown={event => { if (event.key === "Enter") void searchProjectContent(); }} placeholder="Найти текст в файлах…" /><button disabled={projectContentSearching || projectContentQuery.trim().length < 2} onClick={() => void searchProjectContent()}>{projectContentSearching ? "…" : "Найти"}</button></div></div>
                        {projectContentResults.length > 0 && <div className="project-content-results">{projectContentResults.map((item, index) => <button key={item.path + item.line + index} onClick={() => { const file = projectFiles.find(f => f.path === item.path); if (file) void openProjectFile(file, item.line); }}><b>{item.path}:{item.line}</b><span>{item.text}</span></button>)}</div>}
                        {projectFilesLoading && <small className="source-loading">Загрузка…</small>}
                        {projectFiles.length > 0 && projectTree.length > 0 && <div className="project-tree-list">{renderProjectTree(projectTree)}</div>}
                        {projectFiles.length > 0 && projectTree.length === 0 && <p className="telemetry-empty">По запросу ничего не найдено.</p>}
                        {projectFiles.length === 0 && <p className="telemetry-empty">В архиве не найдено файлов для отображения.</p>}
                    </aside>
                    <section className="project-file-view">
                        <div className="project-file-view-head"><span><FileText size={13} /> {projectFilePreview?.path || "Выбери файл в дереве проекта"}</span>
                            {projectFilePreview && <div className="project-file-tools"><small>{projectFilePreview.total_lines} строк · {projectFilePreview.editable ? "текстовый файл" : "только чтение"}</small>{projectFilePreview.editable && !projectEditing && <button onClick={() => setProjectEditing(true)}><Pencil size={12} /> Изменить</button>}{projectEditing && <><button className="save" disabled={projectSaving} onClick={() => void saveProjectFile()}><Save size={12} /> {projectSaving ? "Сохранение…" : "Сохранить"}</button><button onClick={() => { setProjectEditing(false); setProjectDraft(projectFilePreview.content || ""); }}>Отмена</button></>}</div>}
                        </div>
                        {projectFilePreview ? projectEditing ? <textarea className="project-code-editor" spellCheck={false} value={projectDraft} onChange={event => setProjectDraft(event.target.value)} /> : <pre className="project-source-code">{projectFilePreview.lines.map(line => <span className="code-line" key={line.line}><i>{line.line}</i><code>{line.text || " "}</code></span>)}</pre> : <div className="project-file-empty"><FolderOpen size={30} /><b>Проект открыт в INVEST</b><p>Выбери файл слева, чтобы просмотреть его содержимое. Каталог проекта уже подключён к блоку Project source на графе.</p></div>}
                    </section>
                </div>
                {projectHistoryOpen && <aside className="project-history-drawer">
                    <div className="project-history-head"><div><b>История проекта</b><small>Последние 30 событий · сравнение ZIP</small></div><button className="ghost" onClick={() => setProjectHistoryOpen(false)}><X size={13} /></button></div>
                    <div className="project-history-list">
                        {projectHistory.map((entry, index) => {
                            const changes = entry.details?.changes;
                            const title = entry.action === "project.updated" ? "Архив обновлён" : entry.action === "project.created" ? "Проект добавлен" : entry.action === "project.renamed" ? "Название изменено" : entry.action === "project.file_updated" ? "Файл отредактирован" : "Проект изменён";
                            return <article className="project-history-item" key={entry.action + entry.created_at + index}>
                                <div className="project-history-item-top"><b>{title}</b><time>{formatDate(entry.created_at)}</time></div>
                                {changes ? <>
                                    <div className="project-change-stats"><span className="added">+{changes.added_count || 0} добавлено</span><span className="changed">~{changes.changed_count || 0} изменено</span><span className="removed">−{changes.removed_count || 0} удалено</span></div>
                                    {(["added_files", "changed_files", "removed_files"] as const).map((key) => (changes[key] || []).length > 0 && <div className="project-change-group" key={key}><small>{key === "added_files" ? "ДОБАВЛЕННЫЕ" : key === "changed_files" ? "ИЗМЕНЁННЫЕ" : "УДАЛЁННЫЕ"}</small>{(changes[key] || []).slice(0, 8).map(path => <code key={path}>{path}</code>)}</div>)}
                                    {changes.sample_truncated && <small className="project-history-muted">Показаны первые 50 путей каждой категории.</small>}
                                </> : <p className="project-history-muted">{entry.details?.file_count ? `${entry.details.file_count} файлов · ${((entry.details.expanded_bytes || 0) / 1048576).toFixed(1)} MiB` : entry.details?.path || entry.details?.name || "Событие библиотеки проектов"}</p>}
                            </article>;
                        })}
                        {projectHistory.length === 0 && <p className="project-history-muted">История пока пуста. После обновления ZIP здесь появится сравнение версий.</p>}
                    </div>
                </aside>}
                <footer className="project-workspace-footer"><span>READ-ONLY SOURCE VIEW · SECRET MASKING ENABLED</span><span>Запуск анализа доступен на основном холсте</span></footer>
            </section>
        </div>}
        <footer><span>INVEST · AI SECURITY WORKFLOW</span><span>EDITOR · 0.7.0</span></footer>
    </main>;
}