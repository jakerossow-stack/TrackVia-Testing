import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Square, ExternalLink, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import RiskGauge from '../shared/RiskGauge';
import { AiAnalysisCard } from '../shared/SignalCard';
import { SeverityBadge, EmployeeChip, EmptyState, fmtDate, fmtDateTime } from '../shared/ui';
import { PATTERN_META } from '../../store/seedData';

const TABS = ['Risk', 'Actions', 'History'];

export function SignalDetailTabs({ signal, compact = true }) {
  const [tab, setTab] = useState('Risk');
  const navigate = useNavigate();
  const { projects, employees, predictions, settings, completeAction, assignAction } = useAppStore();
  const project = projects.find((p) => p.id === signal?.projectId);

  if (!signal || !project) {
    return (
      <EmptyState
        icon={CheckCircle2}
        title="No signal selected"
        message="Select a signal from the timeline or feed to see its risk breakdown, recommended actions, and prediction history."
      />
    );
  }

  const buildup = project.signalHistory.filter((e) => e.note).slice(-5);
  const projectPredictions = predictions.filter((p) => p.projectId === project.id);

  return (
    <div>
      <div className="mb-3 flex gap-1 rounded-btn border border-bdr bg-surface p-0.5" role="tablist" aria-label="Signal detail tabs">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-[5px] py-1.5 text-[11px] font-semibold transition-colors ${
              tab === t ? 'bg-surface-2 text-ink shadow-sm' : 'text-ink-3 hover:text-ink'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Risk' && (
        <div className="space-y-4">
          <div className="flex justify-center rounded-card border border-bdr bg-surface-2 py-3">
            <RiskGauge
              score={project.riskScore}
              warningThreshold={settings.warningThreshold}
              criticalThreshold={settings.criticalThreshold}
              size={compact ? 160 : 200}
              label={project.name}
            />
          </div>

          <div className="rounded-card border border-bdr bg-surface-2 p-3.5">
            <h4 className="text-[10px] font-bold uppercase tracking-wide text-ink-4">Signal buildup</h4>
            <ol className="mt-2.5 space-y-0">
              {buildup.map((e, i) => (
                <li key={i} className="relative flex gap-2.5 pb-3 last:pb-0">
                  {i < buildup.length - 1 && <span className="absolute left-[5px] top-4 h-full w-px bg-bdr" aria-hidden="true" />}
                  <span
                    className={`relative mt-1 h-[11px] w-[11px] shrink-0 rounded-full border-2 border-surface-2 ${
                      e.riskScore >= settings.criticalThreshold ? 'bg-red' : e.riskScore >= settings.warningThreshold ? 'bg-amber' : 'bg-ink-4'
                    }`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <div className="text-[11px] font-medium leading-tight text-ink-2">{e.note}</div>
                    <div className="font-mono text-[10px] text-ink-4">{fmtDate(e.date)} · score {e.riskScore}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <AiAnalysisCard signal={signal} />

          <div className="rounded-card border border-bdr bg-surface-2 p-3.5">
            <h4 className="text-[10px] font-bold uppercase tracking-wide text-ink-4">Active evidence</h4>
            <ul className="mt-2 space-y-1.5">
              {signal.evidenceItems.map((e, i) => (
                <li key={i} className="flex items-start justify-between gap-2 rounded-btn bg-surface px-2.5 py-2">
                  <div>
                    <div className="text-[11px] font-medium text-ink-2">{e.label}</div>
                    <div className="font-mono text-[10px] leading-snug text-ink-3">{e.value}</div>
                  </div>
                  <SeverityBadge severity={e.severity === 'normal' ? 'watch' : e.severity} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab === 'Actions' && (
        <div className="space-y-2">
          {signal.recommendedActions.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="No actions required yet"
              message="Signal hasn't generated interventions for this pattern. Run a scan to refresh recommendations."
            />
          ) : (
            signal.recommendedActions.map((action, i) => (
              <div key={action.id} className={`rounded-card border border-bdr bg-surface-2 p-3 ${action.status === 'completed' ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-2.5">
                  <button
                    onClick={() => action.status !== 'completed' && completeAction(action.id)}
                    disabled={action.status === 'completed'}
                    className="mt-0.5 text-ink-3 hover:text-green disabled:text-green"
                    aria-label={action.status === 'completed' ? 'Action completed' : `Mark action ${i + 1} complete`}
                  >
                    {action.status === 'completed' ? <CheckSquare size={16} aria-hidden="true" /> : <Square size={16} aria-hidden="true" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className={`text-xs font-medium leading-snug text-ink-2 ${action.status === 'completed' ? 'line-through' : ''}`}>
                      <span className="font-mono text-ink-4">{i + 1}.</span> {action.description}
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-badge border px-1.5 py-0.5 text-[9px] font-medium uppercase ${
                          action.priority === 'high'
                            ? 'border-red-bdr bg-red-bg text-red'
                            : action.priority === 'medium'
                            ? 'border-amber-bdr bg-amber-bg text-amber'
                            : 'border-bdr bg-surface text-ink-3'
                        }`}
                      >
                        {action.priority}
                      </span>
                      <span className="font-mono text-[10px] text-ink-4">Due {fmtDate(action.dueDate)}</span>
                      <select
                        value={action.assignedTo || ''}
                        onChange={(e) => assignAction(action.id, e.target.value || null)}
                        disabled={action.status === 'completed'}
                        className="rounded-badge border border-bdr bg-surface px-1.5 py-0.5 text-[10px] text-ink-2"
                        aria-label="Assign action to employee"
                      >
                        <option value="">Unassigned</option>
                        {employees.filter((e) => e.active).map((e) => (
                          <option key={e.id} value={e.id}>{e.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          <p className="px-1 text-[10px] leading-snug text-ink-4">
            Completing an action recalculates the project risk score immediately.
          </p>
        </div>
      )}

      {tab === 'History' && (
        <div className="space-y-2">
          {projectPredictions.length === 0 ? (
            <EmptyState
              icon={Clock}
              iconClass="text-blue"
              title="No prediction history yet"
              message={`Signal hasn't completed a prediction cycle on ${project.name}. History appears once outcomes are verified.`}
            />
          ) : (
            projectPredictions.map((p) => (
              <div
                key={p.id}
                className={`rounded-card border p-3 ${
                  p.correct === true ? 'border-green-bdr bg-green-bg' : p.correct === false ? 'border-red-bdr bg-red-bg' : 'border-bdr bg-surface-2'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {p.correct === true ? (
                    <CheckCircle2 size={13} className="text-green" aria-hidden="true" />
                  ) : p.correct === false ? (
                    <XCircle size={13} className="text-red" aria-hidden="true" />
                  ) : (
                    <Clock size={13} className="text-amber" aria-hidden="true" />
                  )}
                  <span className="text-[11px] font-semibold text-ink">
                    {p.correct === true ? 'Correct prediction' : p.correct === false ? 'Missed prediction' : 'Pending verification'}
                  </span>
                  <span className="ml-auto font-mono text-[10px] text-ink-4">{fmtDate(p.predictedAt)}</span>
                </div>
                <div className="mt-1.5 text-[11px] leading-snug text-ink-2">
                  <span className="font-medium">Predicted:</span> {p.predictedOutcome}
                </div>
                <div className="mt-0.5 text-[11px] leading-snug text-ink-3">
                  <span className="font-medium">Outcome:</span> {p.actualOutcome}
                </div>
                {p.correct && p.costAvoided > 0 && (
                  <div className="mt-1 font-mono text-[10px] text-green">~${p.costAvoided.toLocaleString()} avoided · {p.leadTimeDays}d lead time</div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// DetailPanel — right rail wrapper (sticky, independent scroll, drawer < 1280px)
// ---------------------------------------------------------------------------
export default function DetailPanel({ drawerOpen, onCloseDrawer }) {
  const navigate = useNavigate();
  const { signals, selectedSignalId } = useAppStore();
  const active = signals.filter((s) => s.status === 'active');
  const signal =
    signals.find((s) => s.id === selectedSignalId) ||
    active.sort((a, b) => ({ critical: 0, warning: 1, watch: 2 }[a.severity] - { critical: 0, warning: 1, watch: 2 }[b.severity]))[0];

  const inner = (
    <div className="panel-scroll h-full overflow-y-auto p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wide text-ink-4">Selected signal</div>
          {signal ? (
            <button
              onClick={() => navigate(`/signals/${signal.id}`)}
              className="mt-0.5 flex items-center gap-1 text-left text-xs font-semibold leading-snug text-ink hover:text-red"
            >
              <span className="line-clamp-2">{signal.title}</span>
              <ExternalLink size={11} className="shrink-0" aria-hidden="true" />
            </button>
          ) : (
            <div className="mt-0.5 text-xs text-ink-3">None active</div>
          )}
        </div>
        {signal && <SeverityBadge severity={signal.severity} />}
      </div>
      <SignalDetailTabs signal={signal} />
    </div>
  );

  return (
    <>
      {/* Desktop rail ≥ 1280px */}
      <aside className="sticky top-12 hidden h-[calc(100vh-48px)] w-[320px] shrink-0 border-l border-bdr bg-surface-2 xl:block" aria-label="Signal detail">
        {inner}
      </aside>
      {/* Drawer < 1280px */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 xl:hidden" role="dialog" aria-modal="true" aria-label="Signal detail">
          <div className="absolute inset-0 bg-ink/40" onClick={onCloseDrawer} />
          <aside className="absolute right-0 top-0 h-full w-[340px] max-w-[90vw] animate-slideUp border-l border-bdr bg-surface-2 shadow-modal">
            <div className="flex items-center justify-between border-b border-bdr px-4 py-2.5">
              <span className="text-xs font-bold text-ink">Signal detail</span>
              <button onClick={onCloseDrawer} className="rounded-btn px-2 text-lg text-ink-4 hover:text-ink" aria-label="Close panel">×</button>
            </div>
            <div className="h-[calc(100%-44px)]">{inner}</div>
          </aside>
        </div>
      )}
    </>
  );
}
