import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, AlertTriangle, CheckCircle2, XCircle, ArrowUpRight, Lock,
  FileText, Send, Search,
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { PATTERN_META } from '../store/seedData';
import RiskGauge from '../components/shared/RiskGauge';
import RiskTimeline from '../components/charts/RiskTimeline';
import { AiAnalysisCard, SignalCard } from '../components/shared/SignalCard';
import {
  SeverityBadge, StatusChip, ConfidenceBar, EmployeeChip, EmptyState, Modal,
  fmtDateTime, timeAgo, SEVERITY_STYLES,
} from '../components/shared/ui';

const PRIORITY_STYLES = {
  high: 'bg-red-bg text-red border-red-border',
  medium: 'bg-amber-bg text-amber border-amber-border',
  low: 'bg-surface text-ink-3 border-bdr',
};

export default function SignalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const signal = useAppStore((s) => s.signals.find((x) => x.id === id));
  const project = useAppStore((s) => s.projects.find((p) => p.id === signal?.projectId));
  const signals = useAppStore((s) => s.signals);
  const employees = useAppStore((s) => s.employees);
  const currentUser = useAppStore((s) => s.currentUser);
  const { dismissSignal, resolveSignal, escalateSignal, addSignalNote, completeAction, assignAction, selectSignal } =
    useAppStore();

  const [noteText, setNoteText] = useState('');
  const [resolveOpen, setResolveOpen] = useState(false);
  const [resolution, setResolution] = useState('');

  if (!signal) {
    return (
      <div className="p-6">
        <EmptyState
          icon={Search}
          iconClass="text-ink-4"
          title="Signal not found"
          message="This signal may have been removed, or the link is out of date."
          action={
            <Link to="/signals" className="inline-flex items-center gap-2 rounded-btn bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink-2">
              <ArrowLeft size={15} aria-hidden="true" /> Back to Signal Feed
            </Link>
          }
        />
      </div>
    );
  }

  const meta = PATTERN_META[signal.patternType];
  const related = signals.filter((s) => s.projectId === signal.projectId && s.id !== signal.id && s.status === 'active');
  const sev = SEVERITY_STYLES[signal.severity];

  const submitNote = (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    addSignalNote(signal.id, noteText.trim());
    setNoteText('');
  };

  return (
    <div className="mx-auto max-w-[1200px] p-6 pb-24">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1.5 rounded-btn px-2 py-1 text-sm text-ink-3 hover:bg-surface-2 hover:text-ink"
      >
        <ArrowLeft size={15} aria-hidden="true" /> Back
      </button>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[3fr_2fr]">
        {/* ---------------- Left column (60%) ---------------- */}
        <div className="min-w-0 space-y-6">
          {/* Header */}
          <div className="rounded-card border border-bdr bg-surface-2 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge severity={signal.severity} />
              <StatusChip status={signal.status} />
              <span className="rounded-badge border border-bdr bg-surface px-2 py-0.5 font-mono text-[11px] text-ink-3">
                {meta?.name || signal.patternType}
              </span>
            </div>
            <h1 className="mt-3 font-display text-[22px] font-bold leading-snug text-ink">{signal.title}</h1>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-3">{signal.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-4">
              <Link to={`/projects/${signal.projectId}`} className="font-medium text-blue hover:underline">
                {project?.name}
              </Link>
              <span className="font-mono">Detected {fmtDateTime(signal.detectedAt)} ({timeAgo(signal.detectedAt)})</span>
              <span className={`font-mono font-medium ${sev.text}`}>Est. time to incident: {signal.estimatedTimeToIncident}</span>
            </div>
          </div>

          {/* Evidence */}
          <section className="rounded-card border border-bdr bg-surface-2 p-5">
            <h2 className="font-display text-sm font-bold text-ink">Evidence</h2>
            <p className="mt-0.5 text-xs text-ink-4">Behavioral observations contributing to this signal</p>
            <ul className="mt-3 divide-y divide-bdr">
              {signal.evidenceItems.map((ev, i) => {
                const s = SEVERITY_STYLES[ev.severity === 'normal' ? 'watch' : ev.severity];
                return (
                  <li key={i} className="flex items-start gap-3 py-2.5">
                    <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-badge border ${s.bg} ${s.border} ${s.text}`}>
                      <AlertTriangle size={12} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-ink-2">{ev.label}</div>
                      <div className="font-mono text-xs text-ink-3">{ev.value}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* AI analysis */}
          <AiAnalysisCard signal={signal} />

          {/* Timeline */}
          <section className="rounded-card border border-bdr bg-surface-2 p-5">
            <h2 className="font-display text-sm font-bold text-ink">Signal buildup — {project?.name}</h2>
            <div className="mt-3">
              <RiskTimeline project={project} height={240} />
            </div>
          </section>

          {/* Notes */}
          <section className="rounded-card border border-bdr bg-surface-2 p-5">
            <h2 className="font-display text-sm font-bold text-ink">Notes</h2>
            {signal.notes.length === 0 ? (
              <div className="mt-3 rounded-btn border border-dashed border-bdr-2 bg-surface px-4 py-5 text-center">
                <FileText size={18} className="mx-auto text-ink-4" aria-hidden="true" />
                <p className="mt-1.5 text-xs text-ink-4">No notes yet. Add context for your team below.</p>
              </div>
            ) : (
              <ul className="mt-3 space-y-3">
                {signal.notes.map((n) => {
                  const author = n.authorId === currentUser?.id
                    ? currentUser
                    : employees.find((e) => e.id === n.authorId) || { name: 'Team member', initials: 'TM' };
                  return (
                    <li key={n.id} className="flex gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-avatar bg-ink text-[11px] font-bold text-white">
                        {author.avatarInitials || author.initials}
                      </span>
                      <div className="min-w-0 rounded-btn border border-bdr bg-surface px-3 py-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs font-semibold text-ink-2">{author.name}</span>
                          <span className="font-mono text-[10px] text-ink-4">{timeAgo(n.createdAt)}</span>
                        </div>
                        <p className="mt-0.5 text-sm leading-relaxed text-ink-2">{n.content}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            <form onSubmit={submitNote} className="mt-4 flex gap-2">
              <input
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note for the team…"
                className="h-10 flex-1 rounded-btn border border-bdr bg-surface-2 px-3 text-sm text-ink placeholder:text-ink-4 focus:border-bdr-2"
              />
              <button
                type="submit"
                disabled={!noteText.trim()}
                className="inline-flex h-10 items-center gap-1.5 rounded-btn bg-ink px-4 text-sm font-medium text-white hover:bg-ink-2 disabled:opacity-40"
              >
                <Send size={14} aria-hidden="true" /> Add
              </button>
            </form>
          </section>
        </div>

        {/* ---------------- Right column (40%) ---------------- */}
        <div className="min-w-0 space-y-6">
          {/* Gauge */}
          <section className="rounded-card border border-bdr bg-surface-2 p-5">
            <h2 className="font-display text-sm font-bold text-ink">Current project risk</h2>
            <div className="mt-2 flex justify-center">
              <RiskGauge score={project?.riskScore ?? 0} size={210} />
            </div>
            <p className="mt-1 text-center font-mono text-[11px] text-ink-4">
              Trend: {project?.riskTrend} · updates live as actions complete
            </p>
          </section>

          {/* Actions */}
          <section className="rounded-card border border-bdr bg-surface-2 p-5">
            <h2 className="font-display text-sm font-bold text-ink">Recommended actions</h2>
            {signal.recommendedActions.length === 0 ? (
              <p className="mt-3 text-xs text-ink-4">No open actions for this signal.</p>
            ) : (
              <ol className="mt-3 space-y-3">
                {signal.recommendedActions.map((a, i) => (
                  <li key={a.id} className={`rounded-btn border p-3 ${a.status === 'completed' ? 'border-green-border bg-green-bg/50' : 'border-bdr bg-surface'}`}>
                    <div className="flex items-start gap-2.5">
                      <button
                        onClick={() => a.status !== 'completed' && completeAction(a.id)}
                        disabled={a.status === 'completed'}
                        aria-label={a.status === 'completed' ? 'Action completed' : `Complete action ${i + 1}`}
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                          a.status === 'completed'
                            ? 'border-green bg-green text-white'
                            : 'border-bdr-2 bg-surface-2 text-transparent hover:border-green hover:text-green/40'
                        }`}
                      >
                        <CheckCircle2 size={13} aria-hidden="true" />
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-ink-4">#{i + 1}</span>
                          <span className={`rounded-badge border px-1.5 py-px text-[10px] font-semibold uppercase ${PRIORITY_STYLES[a.priority]}`}>
                            {a.priority}
                          </span>
                          <span className="font-mono text-[10px] text-ink-4">due {a.dueDate}</span>
                        </div>
                        <p className={`mt-1 text-sm leading-snug ${a.status === 'completed' ? 'text-ink-4 line-through' : 'text-ink-2'}`}>
                          {a.description}
                        </p>
                        <div className="mt-2">
                          <label className="sr-only" htmlFor={`assign-${a.id}`}>Assign to</label>
                          <select
                            id={`assign-${a.id}`}
                            value={a.assignedTo || ''}
                            onChange={(e) => assignAction(a.id, e.target.value || null)}
                            disabled={a.status === 'completed'}
                            className="h-7 w-full rounded-btn border border-bdr bg-surface-2 px-2 text-xs text-ink-2 disabled:opacity-50"
                          >
                            <option value="">Unassigned</option>
                            {employees.filter((e) => e.active).map((e) => (
                              <option key={e.id} value={e.id}>{e.name} — {e.role}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* Related signals */}
          <section className="rounded-card border border-bdr bg-surface-2 p-5">
            <h2 className="font-display text-sm font-bold text-ink">Related signals on this project</h2>
            {related.length === 0 ? (
              <p className="mt-3 text-xs text-ink-4">No other active signals on {project?.name}.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {related.map((s) => (
                  <Link
                    key={s.id}
                    to={`/signals/${s.id}`}
                    onClick={() => selectSignal(s.id)}
                    className="flex items-center justify-between gap-2 rounded-btn border border-bdr bg-surface px-3 py-2 hover:border-bdr-2"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-ink-2">{s.title}</div>
                      <div className="font-mono text-[10px] text-ink-4">{timeAgo(s.detectedAt)}</div>
                    </div>
                    <SeverityBadge severity={s.severity} />
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Metadata */}
          <section className="rounded-card border border-bdr bg-surface-2 p-5">
            <h2 className="flex items-center gap-1.5 font-display text-sm font-bold text-ink">
              Signal metadata <Lock size={12} className="text-ink-4" aria-hidden="true" />
            </h2>
            <dl className="mt-3 space-y-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-4">Confidence</dt>
                <dd className="mt-1"><ConfidenceBar percent={signal.confidencePercent} /></dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-4">Pattern type</dt>
                <dd className="mt-1 text-ink-2">{meta?.name} <span className="text-ink-4">· {meta?.tier}</span></dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-4">Involved employees</dt>
                <dd className="mt-1.5 flex flex-wrap gap-1.5">
                  {signal.involvedEmployees.length === 0 ? (
                    <span className="text-xs text-ink-4">None identified</span>
                  ) : (
                    signal.involvedEmployees.map((id) => <EmployeeChip key={id} employeeId={id} />)
                  )}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>

      {/* Sticky action bar */}
      {signal.status === 'active' || signal.status === 'escalated' ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-bdr bg-surface-2/95 backdrop-blur">
          <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-end gap-2 px-6 py-3">
            <span className="mr-auto hidden text-xs text-ink-4 sm:block">
              Signal {signal.id} · {meta?.name} · {signal.confidencePercent}% confidence
            </span>
            <button
              onClick={() => { dismissSignal(signal.id); navigate('/signals'); }}
              className="inline-flex h-9 items-center gap-1.5 rounded-btn border border-bdr bg-surface-2 px-3.5 text-sm font-medium text-ink-3 hover:border-bdr-2 hover:text-ink"
            >
              <XCircle size={15} aria-hidden="true" /> Dismiss signal
            </button>
            {signal.status !== 'escalated' && (
              <button
                onClick={() => escalateSignal(signal.id)}
                className="inline-flex h-9 items-center gap-1.5 rounded-btn border border-amber-border bg-amber-bg px-3.5 text-sm font-medium text-amber hover:brightness-95"
              >
                <ArrowUpRight size={15} aria-hidden="true" /> Escalate
              </button>
            )}
            <button
              onClick={() => setResolveOpen(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-btn bg-green px-3.5 text-sm font-medium text-white hover:brightness-110"
            >
              <CheckCircle2 size={15} aria-hidden="true" /> Resolve
            </button>
          </div>
        </div>
      ) : null}

      <Modal open={resolveOpen} onClose={() => setResolveOpen(false)} title="Resolve signal">
        <p className="text-sm text-ink-3">
          Describe how this risk was addressed. The resolution is stored with the signal for the compliance trail.
        </p>
        <textarea
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          rows={4}
          placeholder="e.g. Inspections rescheduled and completed; work order ownership reassigned to Keisha W."
          className="mt-3 w-full rounded-btn border border-bdr bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:border-bdr-2"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={() => setResolveOpen(false)} className="h-9 rounded-btn border border-bdr px-3.5 text-sm font-medium text-ink-3 hover:text-ink">
            Cancel
          </button>
          <button
            disabled={!resolution.trim()}
            onClick={() => { resolveSignal(signal.id, resolution.trim()); setResolveOpen(false); navigate('/signals'); }}
            className="h-9 rounded-btn bg-green px-3.5 text-sm font-medium text-white hover:brightness-110 disabled:opacity-40"
          >
            Resolve with note
          </button>
        </div>
      </Modal>
    </div>
  );
}
