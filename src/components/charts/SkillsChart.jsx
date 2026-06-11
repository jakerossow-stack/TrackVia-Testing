import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, Cell } from 'recharts';

const BENCHMARKS = { Electrical: 70, HVAC: 72, Plumbing: 68, Inspections: 75, Safety: 80, Equipment: 73 };

export function SkillsChart({ employees }) {
  const skills = Object.keys(BENCHMARKS);
  const data = skills.map(skill => {
    const avg = Math.round(employees.reduce((sum, e) => sum + (e.skills[skill] || 0), 0) / employees.length);
    return { skill, avg, benchmark: BENCHMARKS[skill], gap: avg - BENCHMARKS[skill] };
  });

  return (
    <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600 }}>Team Skills vs. Industry Benchmark</h2>
        <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>Dashed line shows industry benchmark. Red bars indicate skill gaps.</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
          <XAxis dataKey="skill" tick={{ fontSize: 11, fill: 'var(--ink-3)' }} tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--ink-4)' }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
          <Bar dataKey="avg" radius={[4, 4, 0, 0]} animationDuration={400}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.gap < 0 ? 'var(--red)' : 'var(--green)'} opacity={0.8} />
            ))}
          </Bar>
          {skills.map(skill => (
            <ReferenceLine key={skill} x={skill} stroke="none" />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
