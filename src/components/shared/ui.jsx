import { AlertCircle, AlertTriangle, Circle, Lock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

// ---------------------------------------------------------------------------
// SeverityBadge
// ---------------------------------------------------------------------------
export const SEVERITY_STYLES = {
  critical: { bg: 'bg-red-bg', border: 'border-red-bdr', text: 'text-red', Icon: AlertCircle, glyph: '!' },
  warning: { bg: 'bg-amber-bg', border: 'border-amber-bdr', text: 'text-amber', Icon: AlertTriangle, glyph: '▲' },
  watch: { bg: 'bg-blue-bg', border: 'border-blue-bdr', text: 'text-blue', Icon: Circle, glyph: '●' },
};

export function SeverityBadge({ severity, size = 'sm' }) {
  const s = SEVERITY_STYLES[severity] || SEVERITY_STYLES.watch;
  const Icon = s.Icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-badge border px-2 font-medium uppercase tracking-wide ${s.bg} ${s.border} ${s.text} ${
        size === 'sm' ? 'py-0.5 text-[10px]' : 'py-1 text-xs'
      }`}
    >
      <Icon size={size === 'sm' ? 10 : 12} aria-hidden="true" />
      {severity}
    </span>
  );
}

export function StatusChip({ status }) {
  const map = {
    on_track: { label: 'On track', cls: 'bg-green-bg border-green-bdr text-green' },
    at_risk: { label: 'At risk', cls: 'bg-amber-bg border-amber-bdr text-amber' },
    critical: { label: 'Critical', cls: 'bg-red-bg border-red-bdr text-red' },
    completed: { label: 'Completed', cls: 'bg-surface border-bdr text-ink-3' },
    active: { label: 'Active', cls: 'bg-red-bg border-red-bdr text-red' },
    dismissed: { label: 'Dismissed', cls: 'bg-surface border-bdr text-ink-3' },
    resolved: { label: 'Resolved', cls: 'bg-green-bg border-green-bdr text-green' },
    escalated: { label: 'Escalated', cls: 'bg-amber-bg border-amber-bdr text-amber' },
    compliant: { label: 'Compliant', cls: 'bg-green-bg border-green-bdr text-green' },
    finding: { label: 'Finding', cls: 'bg-red-bg border-red-bdr text-red' },
    corrected: { label: 'Corrected', cls: 'bg-blue-bg border-blue-bdr text-blue' },
    pending: { label: 'Pending', cls: 'bg-amber-bg border-amber-bdr text-amber' },
  };
  const m = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center rounded-badge border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${m.cls}`}>
      {m.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// ConfidenceBar
// ---------------------------------------------------------------------------
export function ConfidenceBar({ percent, label = true }) {
  const color = percent >= 80 ? 'bg-red' : percent >= 65 ? 'bg-amber' : 'bg-blue';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface" role="img" aria-label={`Confidence ${percent}%`}>
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${percent}%` }} />
      </div>
      {label && <span className="font-mono text-xs text-ink-3">{percent}%</span>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// EmployeeChip
// ---------------------------------------------------------------------------
export function EmployeeChip({ employeeId, size = 'sm', onClick }) {
  const employee = useAppStore((s) => s.employees.find((e) => e.id === employeeId));
  if (!employee) return null;
  const Comp = onClick ? 'button' : 'span';
  return (
    <Comp
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-[20px] border border-bdr bg-surface-2 pr-2.5 ${
        size === 'sm' ? 'py-0.5 pl-0.5 text-xs' : 'py-1 pl-1 text-sm'
      } ${onClick ? 'cursor-pointer transition-colors hover:border-bdr-2 hover:bg-surface' : ''}`}
    >
      <span
        className={`flex items-center justify-center rounded-avatar bg-ink font-semibold text-white ${
          size === 'sm' ? 'h-5 w-5 text-[9px]' : 'h-6 w-6 text-[10px]'
        }`}
        aria-hidden="true"
      >
        {employee.initials}
      </span>
      <span className="font-medium text-ink-2">{employee.name}</span>
    </Comp>
  );
}

// ---------------------------------------------------------------------------
// ClearanceBadge
// ---------------------------------------------------------------------------
export function ClearanceBadge({ level }) {
  if (!level || level === 'none') return <span className="text-xs text-ink-4">No clearance</span>;
  const labels = { confidential: 'Confidential', secret: 'Secret', top_secret: 'Top Secret' };
  return (
    <span className="inline-flex items-center gap-1 rounded-badge border border-blue-bdr bg-blue-bg px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-blue">
      <Lock size={10} aria-hidden="true" />
      {labels[level]}
    </span>
  );
}

// ---------------------------------------------------------------------------
// FedRampChip
// ---------------------------------------------------------------------------
export function FedRampChip({ compact = false }) {
  return (
    <div className={`flex items-start gap-2 rounded-card border border-blue-bdr bg-blue-bg p-3 ${compact ? 'items-center p-2' : ''}`}>
      <ShieldCheck size={compact ? 14 : 18} className="mt-0.5 shrink-0 text-blue" aria-hidden="true" />
      <div>
        <div className={`font-semibold text-blue ${compact ? 'text-[11px]' : 'text-xs'}`}>FedRAMP Moderate Authorized</div>
        {!compact && (
          <div className="mt-0.5 text-[10px] leading-snug text-ink-3">All data stays within your authorization boundary</div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// StatCard
// ---------------------------------------------------------------------------
export function StatCard({ label, value, valueClass = 'text-ink', sub, subClass = 'text-ink-4' }) {
  return (
    <div className="rounded-card border border-bdr bg-surface-2 p-4">
      <div className="text-[11px] font-medium uppercase tracking-wide text-ink-4">{label}</div>
      <div className={`mt-1 font-mono text-3xl font-medium ${valueClass}`}>{value}</div>
      {sub && <div className={`mt-1 text-xs ${subClass}`}>{sub}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// EmptyState
// ---------------------------------------------------------------------------
export function EmptyState({ icon: Icon = CheckCircle2, iconClass = 'text-green', title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-bdr bg-surface-2 px-6 py-12 text-center">
      <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface ${iconClass}`}>
        <Icon size={24} aria-hidden="true" />
      </div>
      <div className="text-sm font-semibold text-ink">{title}</div>
      <div className="mt-1 max-w-sm text-xs leading-relaxed text-ink-3">{message}</div>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------
export function Modal({ open, onClose, title, children, width = 'max-w-lg' }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`w-full ${width} animate-slideUp rounded-card border border-bdr bg-surface-2 shadow-modal`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-bdr px-5 py-3.5">
          <h2 className="text-sm font-bold text-ink">{title}</h2>
          <button onClick={onClose} className="rounded-btn px-2 py-1 text-lg leading-none text-ink-4 hover:bg-surface hover:text-ink" aria-label="Close dialog">
            ×
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------
export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export const utilColor = (pct) => (pct > 100 ? 'text-red' : pct >= 80 ? 'text-amber' : 'text-green');
export const utilBg = (pct) => (pct > 100 ? 'bg-red' : pct >= 95 ? 'bg-amber' : pct >= 80 ? 'bg-amber' : 'bg-green');

export const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
export const fmtDateTime = (iso) =>
  new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
export const timeAgo = (iso) => {
  const mins = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};
