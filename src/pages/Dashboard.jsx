import { useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useActiveSignals, useSignalCounts } from '../hooks/useSignals';
import { useMostCriticalProject } from '../hooks/useProjects';
import RiskTimeline from '../components/charts/RiskTimeline';
import { SignalCard } from '../components/shared/SignalCard';
import { StatCard } from '../components/shared/ui';
import { PATTERN_LIBRARY } from '../store/seedData';

const TIER_BADGE = {
  'Critical predictor': 'bg-red-bg border-red-bdr text-red',
  'Warning predictor': 'bg-amber-bg border-amber-bdr text-amber',
  Watch: 'bg-blue-bg border-blue-bdr text-blue',
};

function PatternGrid() {
  const navigate = useNavigate();
  const active = useActiveSignals();
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {PATTERN_LIBRARY.map((p) => {
        const Icon = Icons[p.icon] || Icons.Activity;
        const count = active.filter((s) => s.patternType === p.type).length;
        return (
          <button
            key={p.type}
            onClick={() => navigate('/patterns')}
            className="rounded-card border border-bdr bg-surface-2 p-3.5 text-left transition-colors hover:border-bdr-2"
          >
            <div className="flex items-start justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-btn bg-surface text-ink-3">
                <Icon size={16} aria-hidden="true" />
              </span>
              {count > 0 && (
                <span className="rounded-[20px] bg-red px-1.5 py-0.5 font-mono text-[10px] font-medium text-white">{count} active</span>
              )}
            </div>
            <div className="mt-2 text-xs font-semibold text-ink">{p.name}</div>
            <div className="mt-0.5 text-[11px] leading-snug text-ink-3">{p.description}</div>
            <span className={`mt-2 inline-block rounded-badge border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide ${TIER_BADGE[p.tier]}`}>
              {p.tier}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function BeforeAfter({ project }) {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <div className="rounded-card border border-red-bdr bg-red-bg p-4">
        <div className="text-[10px] font-bold uppercase tracking-wide text-red">Without Signal</div>
        <div className="mt-1 text-xs font-semibold text-ink">{project?.name} — projected sequence</div>
        <ol className="mt-3 space-y-2.5">
          {[
            ['Day 14', 'Warning patterns invisible — buried across 4 separate systems'],
            ['Day 24', 'Structural inspection missed; nobody assigned to follow up'],
            ['Day 31', 'Stop-work order issued during routine government site visit'],
            ['Day 31+', '11-day schedule slip, DFARS finding, ~$84K in delay costs'],
          ].map(([day, txt]) => (
            <li key={day} className="flex gap-2.5 text-[11px] leading-snug">
              <span className="w-12 shrink-0 font-mono font-medium text-red">{day}</span>
              <span className="text-ink-2">{txt}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="rounded-card border border-green-bdr bg-green-bg p-4">
        <div className="text-[10px] font-bold uppercase tracking-wide text-green">With Signal</div>
        <div className="mt-1 text-xs font-semibold text-ink">{project?.name} — actual sequence</div>
        <ol className="mt-3 space-y-2.5">
          {[
            ['Day 14', 'Composite alert fired the moment the warning threshold was crossed'],
            ['Day 15', 'Four targeted actions assigned: inspection, ownership, escalation, docs'],
            ['Day 22', 'Inspection completed 9 days before the projected incident window'],
            ['Day 31', 'No stop-work. Schedule held. ~$84K avoided.'],
          ].map(([day, txt]) => (
            <li key={day} className="flex gap-2.5 text-[11px] leading-snug">
              <span className="w-12 shrink-0 font-mono font-medium text-green">{day}</span>
              <span className="text-ink-2">{txt}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function AlertStack({ onAct }) {
  const active = useActiveSignals();
  const [hidden, setHidden] = useState([]);
  const [leaving, setLeaving] = useState([]);
  const visible = active.filter((s) => !hidden.includes(s.id)).slice(0, 3);

  if (visible.length === 0) return null;
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-30 flex flex-col-reverse items-end gap-2.5">
      {visible
        .slice()
        .reverse()
        .map((sig, i) => (
          <div
            key={sig.id}
            className={`pointer-events-auto transition-all ${leaving.includes(sig.id) ? 'animate-slideOutRight' : 'animate-slideUp'}`}
            style={{ zIndex: 30 + i }}
          >
            <SignalCard
              signal={sig}
              compact
              onAct={() => onAct(sig.id)}
              onDismissed={() => {
                setLeaving((l) => [...l, sig.id]);
                setTimeout(() => setHidden((h) => [...h, sig.id]), 360);
              }}
            />
          </div>
        ))}
      {active.length > 3 && (
        <div className="pointer-events-auto w-72 rounded-card border border-bdr bg-surface-2 px-3 py-1.5 text-center font-mono text-[10px] text-ink-4 shadow-modal">
          +{active.length - 3} more in feed
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { openDrawer } = useOutletContext() || {};
  const navigate = useNavigate();
  const { projects, predictions, selectSignal, signals } = useAppStore();
  const counts = useSignalCounts();
  const criticalProject = useMostCriticalProject();

  const stats = useMemo(() => {
    const activeProjects = projects.filter((p) => p.status !== 'completed');
    const avgRisk = Math.round(activeProjects.reduce((s, p) => s + p.riskScore, 0) / (activeProjects.length || 1));
    const verified = predictions.filter((p) => p.correct !== null);
    const correct = verified.filter((p) => p.correct).length;
    const accuracy = verified.length ? Math.round((correct / verified.length) * 100) : 0;
    const prevented = predictions.filter((p) => p.correct && p.costAvoided > 0);
    const avoided = prevented.reduce((s, p) => s + p.costAvoided, 0);
    return { avgRisk, accuracy, prevented: prevented.length, avoided };
  }, [projects, predictions]);

  const handleSelect = (id) => {
    selectSignal(id);
    openDrawer?.();
  };

  const handleTimelineEvent = (payload) => {
    if (!payload.triggerType) return;
    const match = signals.find((s) => s.projectId === criticalProject.id && s.patternType === payload.triggerType && s.status === 'active');
    handleSelect((match || signals.find((s) => s.projectId === criticalProject.id && s.status === 'active'))?.id);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          label="Risk score (avg)"
          value={stats.avgRisk}
          valueClass={stats.avgRisk >= 70 ? 'text-red' : stats.avgRisk >= 50 ? 'text-amber' : 'text-green'}
          sub="▲ 6 vs last week"
          subClass="text-red"
        />
        <StatCard
          label="Active signals"
          value={counts.total}
          valueClass="text-amber"
          sub={`${counts.critical} critical · ${counts.warning} warning · ${counts.watch} watch`}
        />
        <StatCard
          label="Incidents prevented"
          value={stats.prevented}
          valueClass="text-green"
          sub={`~$${stats.avoided.toLocaleString()} estimated cost avoidance`}
          subClass="text-green"
        />
        <StatCard label="Prediction accuracy" value={`${stats.accuracy}%`} sub="Verified over last 90 days" />
      </div>

      <section className="rounded-card border border-bdr bg-surface-2 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-ink">
            Behavioral signal timeline — <button onClick={() => navigate(`/projects/${criticalProject?.id}`)} className="text-red hover:underline">{criticalProject?.name}</button>
          </h2>
          <span className="font-mono text-[10px] text-ink-4">Click an event dot to inspect the signal</span>
        </div>
        <RiskTimeline project={criticalProject} onSelectEvent={handleTimelineEvent} />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold text-ink">Pattern categories <span className="font-normal text-ink-4">— 9 behavioral predictors under continuous watch</span></h2>
        <PatternGrid />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold text-ink">What early intervention changes</h2>
        <BeforeAfter project={criticalProject} />
      </section>

      <AlertStack onAct={handleSelect} />
    </div>
  );
}
