import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { useAppStore } from '../../store/appStore';
import { PATTERN_META } from '../../store/seedData';

const RANGES = [
  { key: '7d', days: 7 },
  { key: '30d', days: 30 },
  { key: '90d', days: 90 },
];

function EventDot(props) {
  const { cx, cy, payload, onSelectEvent } = props;
  if (payload.triggerType == null && !payload.note) return null;
  const isPattern = payload.triggerType != null;
  return (
    <g
      onClick={() => onSelectEvent?.(payload)}
      style={{ cursor: onSelectEvent ? 'pointer' : 'default' }}
      role={onSelectEvent ? 'button' : undefined}
    >
      <circle cx={cx} cy={cy} r={9} fill="transparent" />
      <circle cx={cx} cy={cy} r={5} fill={isPattern ? 'var(--red)' : 'var(--amber)'} stroke="#fff" strokeWidth={2} />
    </g>
  );
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-btn border border-bdr bg-surface-2 px-3 py-2 text-xs shadow-modal">
      <div className="font-mono font-medium text-ink">{d.date} · score {d.riskScore}</div>
      {d.triggerType && (
        <div className="mt-0.5 font-medium text-red">{PATTERN_META[d.triggerType]?.name || d.triggerType}</div>
      )}
      {d.note && <div className="mt-0.5 max-w-[220px] text-ink-3">{d.note}</div>}
    </div>
  );
}

export default function RiskTimeline({ project, height = 260, onSelectEvent, showRangeToggle = true }) {
  const settings = useAppStore((s) => s.settings);
  const [range, setRange] = useState('30d');

  const data = useMemo(() => {
    if (!project) return [];
    const days = RANGES.find((r) => r.key === range)?.days ?? 30;
    const history = project.signalHistory || [];
    return history.slice(-Math.min(days + 1, history.length)).map((e) => ({
      ...e,
      date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));
  }, [project, range]);

  if (!project) return null;

  const annotated = data.filter((d) => d.triggerType);

  return (
    <div>
      {showRangeToggle && (
        <div className="mb-3 flex items-center justify-end gap-1" role="group" aria-label="Time range">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              aria-pressed={range === r.key}
              className={`rounded-btn px-2.5 py-1 font-mono text-[11px] font-medium transition-colors ${
                range === r.key ? 'bg-ink text-white' : 'text-ink-3 hover:bg-surface'
              }`}
            >
              {r.key}
            </button>
          ))}
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 18, right: 16, bottom: 0, left: -18 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--ink-4)', fontFamily: 'DM Mono' }} tickLine={false} axisLine={{ stroke: 'var(--border)' }} minTickGap={28} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--ink-4)', fontFamily: 'DM Mono' }} tickLine={false} axisLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <ReferenceLine
            y={settings.warningThreshold}
            stroke="var(--amber)"
            strokeDasharray="5 4"
            label={{ value: `Warning ${settings.warningThreshold}`, position: 'insideTopRight', fontSize: 9, fill: 'var(--amber)', fontFamily: 'DM Mono' }}
          />
          <ReferenceLine
            y={settings.criticalThreshold}
            stroke="var(--red)"
            strokeDasharray="5 4"
            label={{ value: `Critical ${settings.criticalThreshold}`, position: 'insideTopRight', fontSize: 9, fill: 'var(--red)', fontFamily: 'DM Mono' }}
          />
          {annotated.map((d) => (
            <ReferenceLine
              key={d.date + d.triggerType}
              x={d.date}
              stroke="var(--border-2)"
              label={{
                value: PATTERN_META[d.triggerType]?.name || '',
                angle: -90,
                position: 'insideTopLeft',
                fontSize: 8.5,
                fill: 'var(--ink-4)',
                fontFamily: 'DM Mono',
                offset: 10,
              }}
            />
          ))}
          <Line
            type="monotone"
            dataKey="riskScore"
            stroke="var(--red)"
            strokeWidth={2}
            dot={<EventDot onSelectEvent={onSelectEvent} />}
            activeDot={{ r: 4, fill: 'var(--ink)' }}
            animationDuration={300}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
