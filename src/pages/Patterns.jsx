import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { PATTERN_LIBRARY } from '../store/seedData';

const TIER_STYLE = {
  'Critical predictor': 'bg-red-bg text-red border-red-border',
  'Warning predictor': 'bg-amber-bg text-amber border-amber-border',
  Watch: 'bg-blue-bg text-blue border-blue-border',
};

export default function Patterns() {
  const signals = useAppStore((s) => s.signals);
  const activeByType = signals.reduce((acc, s) => {
    if (s.status === 'active') acc[s.patternType] = (acc[s.patternType] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-[1100px] p-6">
      <h1 className="font-display text-xl font-bold text-ink">Pattern Library</h1>
      <p className="mt-0.5 max-w-2xl text-sm text-ink-3">
        The nine behavioral patterns Signal monitors continuously. Each pattern is a weak signal on its own —
        their predictive power comes from co-occurrence and intensification over time.
      </p>

      <div className="mt-6 space-y-4">
        {PATTERN_LIBRARY.map((p) => {
          const Icon = Icons[p.icon] || Icons.Activity;
          const activeCount = activeByType[p.type] || 0;
          return (
            <div key={p.type} className="rounded-card border border-bdr bg-surface-2 p-5">
              <div className="flex flex-wrap items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-btn border border-bdr bg-surface text-ink-2">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-[15px] font-bold text-ink">{p.name}</h2>
                    <span className={`rounded-badge border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${TIER_STYLE[p.tier]}`}>
                      {p.tier}
                    </span>
                    {activeCount > 0 && (
                      <Link
                        to={`/signals?pattern=${p.type}`}
                        className="rounded-pill border border-amber-border bg-amber-bg px-2 py-0.5 font-mono text-[10px] font-medium text-amber hover:brightness-95"
                      >
                        {activeCount} active now
                      </Link>
                    )}
                  </div>
                  <p className="mt-1 text-sm font-medium text-ink-2">{p.description}</p>
                  <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-ink-3">{p.detail}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
