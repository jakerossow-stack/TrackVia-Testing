import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, Dot } from 'recharts';
import { useState } from 'react';

function CustomDot({ cx, cy, payload, onSelect }) {
  if (!payload.triggerType) return <circle cx={cx} cy={cy} r={3} fill="var(--ink-4)" />;
  const color = payload.riskScore >= 70 ? 'var(--red)' : payload.riskScore >= 50 ? 'var(--amber)' : 'var(--green)';
  return (
    <circle
      cx={cx} cy={cy} r={6} fill={color} stroke="#fff" strokeWidth={2} cursor="pointer"
      onClick={() => onSelect && onSelect(payload)}
    />
  );
}

export function RiskTimeline({ history = [], onDotClick, title }) {
  const [range, setRange] = useState(30);
  const data = history.slice(-range);

  const scoreColor = (v) => v >= 70 ? 'var(--red)' : v >= 50 ? 'var(--amber)' : 'var(--green)';

  return (
    <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{title || 'Behavioral Signal Timeline'}</h2>
        <div style={{ display: 'flex', gap: 4 }}>
          {[7, 30, 90].map(d => (
            <button key={d} onClick={() => setRange(d)} style={{
              padding: '4px 10px', fontSize: 11, borderRadius: 6, cursor: 'pointer', fontWeight: range === d ? 600 : 400,
              background: range === d ? 'var(--ink)' : 'var(--surface)', color: range === d ? '#fff' : 'var(--ink-3)',
              border: `1px solid ${range === d ? 'var(--ink)' : 'var(--border)'}`,
            }}>{d}d</button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--ink-4)' }} tickFormatter={v => v.slice(5)} tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--ink-4)' }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
            formatter={(v) => [<span style={{ color: scoreColor(v), fontWeight: 700 }}>{v}</span>, 'Risk Score']}
          />
          <ReferenceLine y={50} stroke="var(--amber)" strokeDasharray="4 4" label={{ value: 'Warning', position: 'insideTopRight', fontSize: 10, fill: 'var(--amber)' }} />
          <ReferenceLine y={70} stroke="var(--red)" strokeDasharray="4 4" label={{ value: 'Critical', position: 'insideTopRight', fontSize: 10, fill: 'var(--red)' }} />
          <Line
            type="monotone" dataKey="riskScore"
            stroke="var(--ink-3)" strokeWidth={2}
            dot={(props) => <CustomDot {...props} onSelect={onDotClick} />}
            activeDot={{ r: 6, fill: 'var(--ink)' }}
            animationDuration={400}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
