import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, History } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { SEED_PREDICTIONS, PATTERN_META } from '../store/seedData';
import { StatCard, EmptyState, fmtDateTime } from '../components/shared/ui';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'correct', label: 'Correct' },
  { key: 'missed', label: 'Missed' },
  { key: 'pending', label: 'Pending' },
];

export default function PredictionHistory() {
  const projects = useAppStore((s) => s.projects);
  const [filter, setFilter] = useState('all');

  const stats = useMemo(() => {
    const scored = SEED_PREDICTIONS.filter((p) => p.correct !== null);
    const correct = scored.filter((p) => p.correct).length;
    return {
      total: SEED_PREDICTIONS.length,
      correct,
      missed: scored.length - correct,
      pending: SEED_PREDICTIONS.length - scored.length,
      accuracy: scored.length ? Math.round((correct / scored.length) * 100) : 0,
      avgLead: Math.round(SEED_PREDICTIONS.reduce((a, p) => a + p.leadTimeDays, 0) / SEED_PREDICTIONS.length),
      costAvoided: SEED_PREDICTIONS.reduce((a, p) => a + (p.costAvoided || 0), 0),
    };
  }, []);

  const list = SEED_PREDICTIONS.filter((p) =>
    filter === 'all' ? true
      : filter === 'correct' ? p.correct === true
      : filter === 'missed' ? p.correct === false
      : p.correct === null
  ).sort((a, b) => new Date(b.predictedAt) - new Date(a.predictedAt));

  return (
    <div className="mx-auto max-w-[1000px] p-6">
      <h1 className="font-display text-xl font-bold text-ink">Prediction History</h1>
      <p className="mt-0.5 text-sm text-ink-3">Every call Signal has made, scored against what actually happened</p>

      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Predictions made" value={stats.total} sub="Last 90 days" />
        <StatCard label="Accuracy" value={`${stats.accuracy}%`} valueClass="text-green" sub={`${stats.correct} correct · ${stats.missed} missed · ${stats.pending} pending`} />
        <StatCard label="Avg lead time" value={`${stats.avgLead}d`} valueClass="text-blue" sub="Warning before incident" />
        <StatCard label="Cost avoided" value={`$${stats.costAvoided.toLocaleString()}`} valueClass="text-green" sub="From acted-on predictions" />
      </div>

      <div className="mt-6 flex gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`h-8 rounded-btn border px-3 text-xs font-medium ${
              filter === f.key ? 'border-ink bg-ink text-white' : 'border-bdr bg-surface-2 text-ink-3 hover:border-bdr-2'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="mt-4">
          <EmptyState icon={History} iconClass="text-ink-4" title="No predictions match"
            message="Try a different outcome filter."
            action={<button onClick={() => setFilter('all')} className="rounded-btn bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink-2">Show all</button>} />
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {list.map((p) => {
            const project = projects.find((x) => x.id === p.projectId);
            const ok = p.correct === true; const miss = p.correct === false;
            return (
              <div key={p.id} className={`rounded-card border p-5 ${ok ? 'border-green-border bg-green-bg/40' : miss ? 'border-red-border bg-red-bg/40' : 'border-bdr bg-surface-2'}`}>
                <div className="flex flex-wrap items-center gap-2">
                  {ok ? <CheckCircle2 size={16} className="text-green" aria-hidden="true" />
                    : miss ? <XCircle size={16} className="text-red" aria-hidden="true" />
                    : <Clock size={16} className="text-amber" aria-hidden="true" />}
                  <span className="text-xs font-semibold uppercase tracking-wide text-ink-3">
                    {ok ? 'Correct' : miss ? 'Missed' : 'Pending'}
                  </span>
                  <span className="rounded-badge border border-bdr bg-surface px-2 py-0.5 font-mono text-[10px] text-ink-3">
                    {PATTERN_META[p.patternType]?.name}
                  </span>
                  <Link to={`/projects/${p.projectId}`} className="text-xs font-medium text-blue hover:underline">{project?.name}</Link>
                  <span className="ml-auto font-mono text-[11px] text-ink-4">{fmtDateTime(p.predictedAt)}</span>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-ink-4">Predicted</div>
                    <p className="mt-0.5 text-sm font-medium text-ink-2">{p.predictedOutcome}</p>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-ink-4">Actual</div>
                    <p className="mt-0.5 text-sm text-ink-2">{p.actualOutcome}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4 border-t border-bdr/70 pt-2.5 font-mono text-[11px] text-ink-4">
                  <span>Lead time: {p.leadTimeDays} days</span>
                  {p.costAvoided > 0 && <span className="text-green">${p.costAvoided.toLocaleString()} avoided</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
