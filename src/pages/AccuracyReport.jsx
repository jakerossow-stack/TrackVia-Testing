import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const data = [
  { pattern: 'Composite Risk', accuracy: 87, count: 12 },
  { pattern: 'Util. Spike', accuracy: 79, count: 8 },
  { pattern: 'Insp. Drift', accuracy: 92, count: 15 },
  { pattern: 'Doc. Thin.', accuracy: 71, count: 6 },
  { pattern: 'Task P-P', accuracy: 84, count: 10 },
  { pattern: 'Approv. Lag', accuracy: 88, count: 9 },
];

export function AccuracyReport() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Model Accuracy Report</h1>
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Prediction Accuracy by Pattern Type</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
            <XAxis dataKey="pattern" tick={{ fontSize: 10, fill: 'var(--ink-3)' }} axisLine={false} tickLine={false} />
            <YAxis domain={[50, 100]} tick={{ fontSize: 10, fill: 'var(--ink-4)' }} axisLine={false} tickLine={false} />
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid var(--border)' }} formatter={v => [`${v}%`, 'Accuracy']} />
            <Bar dataKey="accuracy" fill="var(--blue)" opacity={0.8} radius={[4,4,0,0]} animationDuration={500} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
