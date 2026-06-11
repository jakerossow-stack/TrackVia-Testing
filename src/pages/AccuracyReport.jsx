import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
  LineChart, Line, ReferenceLine,
} from 'recharts';
import { Target, Lock } from 'lucide-react';
import { SEED_PREDICTIONS, PATTERN_LIBRARY, PATTERN_META } from '../store/seedData';
import { StatCard } from '../components/shared/ui';

const TOOLTIP_STYLE = { borderRadius: 7, border: '1px solid #DCE4EC', fontSize: 12 };

export default function AccuracyReport() {
  const { scored, accuracy, avgLead, byPattern, monthly } = useMemo(() => {
    const scored = SEED_PREDICTIONS.filter((p) => p.correct !== null);
    const correct = scored.filter((p) => p.correct).length;
    const accuracy = scored.length ? Math.round((correct / scored.length) * 100) : 0;
    const avgLead = Math.round(SEED_PREDICTIONS.reduce((a, p) => a + p.leadTimeDays, 0) / SEED_PREDICTIONS.length);

    // Per-pattern accuracy (deterministic baseline blended with actual outcomes)
    const BASE = {
      inspection_drift: 91, task_ping_pong: 84, approval_lag: 79, maintenance_skip: 88,
      skill_task_mismatch: 72, utilization_spike: 76, documentation_thinning: 69,
      notification_suppression: 66, composite_risk: 93,
    };
    const byPattern = PATTERN_LIBRARY.map((p) => {
      const preds = scored.filter((x) => x.patternType === p.type);
      let acc = BASE[p.type];
      if (preds.length) {
        const localAcc = (preds.filter((x) => x.correct).length / preds.length) * 100;
        acc = Math.round((acc + localAcc) / 2);
      }
      return { name: p.name, accuracy: acc, samples: preds.length };
    }).sort((a, b) => b.accuracy - a.accuracy);

    const monthly = [
      { month: 'Jan', accuracy: 71 }, { month: 'Feb', accuracy: 74 }, { month: 'Mar', accuracy: 78 },
      { month: 'Apr', accuracy: 81 }, { month: 'May', accuracy: 83 }, { month: 'Jun', accuracy: accuracy },
    ];
    return { scored, accuracy, avgLead, byPattern, monthly };
  }, []);

  return (
    <div className="mx-auto max-w-[1000px] p-6">
      <div className="flex items-center gap-2">
        <h1 className="font-display text-xl font-bold text-ink">Model Accuracy Report</h1>
        <Lock size={13} className="text-ink-4" aria-hidden="true" />
      </div>
      <p className="mt-0.5 text-sm text-ink-3">How well Signal&rsquo;s predictions hold up — by pattern type and over time</p>

      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Overall accuracy" value={`${accuracy}%`} valueClass="text-green" sub={`${scored.length} scored predictions, 90d`} />
        <StatCard label="Avg lead time" value={`${avgLead} days`} valueClass="text-blue" sub="Target window: 6–9 days" />
        <StatCard label="Best pattern" value={byPattern[0]?.name} valueClass="text-ink" sub={`${byPattern[0]?.accuracy}% accuracy`} />
        <StatCard label="Weakest pattern" value={byPattern[byPattern.length - 1]?.name} valueClass="text-ink" sub={`${byPattern[byPattern.length - 1]?.accuracy}% — being retrained`} />
      </div>

      {/* Trend */}
      <section className="mt-5 rounded-card border border-bdr bg-surface-2 p-5">
        <h2 className="font-display text-sm font-bold text-ink">Accuracy trend — last 6 months</h2>
        <div className="mt-3 h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthly} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="#DCE4EC" strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#7A9AB0' }} axisLine={false} tickLine={false} />
              <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#7A9AB0' }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip formatter={(v) => [`${v}%`, 'Accuracy']} contentStyle={TOOLTIP_STYLE} />
              <ReferenceLine y={80} stroke="#C47B00" strokeDasharray="5 4" label={{ value: 'SLA 80%', fontSize: 10, fill: '#C47B00', position: 'insideTopRight' }} />
              <Line type="monotone" dataKey="accuracy" stroke="#1A7A4A" strokeWidth={2.5} dot={{ r: 3, fill: '#1A7A4A' }} animationDuration={300} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Per pattern */}
      <section className="mt-5 rounded-card border border-bdr bg-surface-2 p-5">
        <div className="flex items-center gap-2">
          <Target size={15} className="text-ink-3" aria-hidden="true" />
          <h2 className="font-display text-sm font-bold text-ink">Accuracy by pattern type</h2>
        </div>
        <p className="mt-0.5 text-xs text-ink-4">Patterns below 75% are weighted lower in composite scoring until retraining completes</p>
        <div className="mt-4 h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byPattern} layout="vertical" margin={{ top: 0, right: 28, left: 40, bottom: 0 }}>
              <CartesianGrid stroke="#DCE4EC" strokeDasharray="2 4" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#7A9AB0' }} axisLine={false} tickLine={false} unit="%" />
              <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11, fill: '#4A6070' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => [`${v}%`, 'Accuracy']} contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="accuracy" radius={[0, 4, 4, 0]} barSize={16} animationDuration={300}>
                {byPattern.map((p) => (
                  <Cell key={p.name} fill={p.accuracy >= 85 ? '#1A7A4A' : p.accuracy >= 75 ? '#1155CC' : '#D93025'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex items-center gap-4 text-[11px] text-ink-4">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-green" /> ≥85% strong</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-blue" /> 75–84% reliable</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-red" /> &lt;75% retraining</span>
        </div>
      </section>

      <p className="mt-5 rounded-card border border-blue-border bg-blue-bg px-4 py-3 text-xs leading-relaxed text-ink-2">
        Methodology: a prediction is scored <span className="font-medium">correct</span> when the predicted incident occurred
        within the stated window, or was verifiably averted by a recommended action completed inside the lead time.
        Predictions still inside their window are excluded from accuracy until resolved.
      </p>
    </div>
  );
}
