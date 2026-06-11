import { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Cell } from 'recharts';
import { Modal } from '../shared/ui';
import { SEED_SCHEDULES } from '../../store/seedData';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

// Deterministic per-day utilization derived from the weekly average.
function dailyUtilization(employee, dayIndex) {
  const seed = (employee.id.charCodeAt(employee.id.length - 1) * 31 + dayIndex * 17) % 23;
  const wobble = seed - 11; // -11..+11
  return Math.max(20, Math.min(125, employee.utilizationPercent + wobble));
}

const cellColor = (pct) =>
  pct > 95 ? 'bg-red text-white' : pct >= 80 ? 'bg-amber text-white' : 'bg-green text-white';

export function UtilizationHeatmap({ employees }) {
  const [selected, setSelected] = useState(null); // { employee, dayIndex, pct }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-separate" style={{ borderSpacing: '4px' }}>
        <thead>
          <tr>
            <th className="w-44 text-left text-[11px] font-medium uppercase tracking-wide text-ink-4">Employee</th>
            {DAYS.map((d) => (
              <th key={d} className="text-center font-mono text-[11px] font-medium text-ink-4">{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td className="text-xs font-medium text-ink-2">{emp.name}</td>
              {DAYS.map((d, i) => {
                const pct = dailyUtilization(emp, i);
                return (
                  <td key={d}>
                    <button
                      onClick={() => setSelected({ employee: emp, dayIndex: i, pct })}
                      className={`h-9 w-full rounded-btn font-mono text-[11px] font-medium transition-transform hover:scale-[1.04] ${cellColor(pct)}`}
                      aria-label={`${emp.name}, ${d}: ${pct}% utilization. Click to view tasks.`}
                    >
                      {pct}%
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 flex items-center gap-4 text-[10px] text-ink-3">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-green" aria-hidden="true" /> Healthy (&lt;80%)</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-amber" aria-hidden="true" /> Watch (80–95%)</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-red" aria-hidden="true" /> Over capacity (&gt;95%)</span>
      </div>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `${selected.employee.name} — ${DAYS[selected.dayIndex]}` : ''}
      >
        {selected && (
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm">
              <span className="text-ink-3">Utilization:</span>
              <span className={`font-mono font-medium ${selected.pct > 100 ? 'text-red' : selected.pct >= 80 ? 'text-amber' : 'text-green'}`}>
                {selected.pct}%
              </span>
            </div>
            <div className="space-y-2">
              {(SEED_SCHEDULES[selected.employee.id] || []).map((block, i) => {
                const [task, tag] = block;
                if (i !== selected.dayIndex) return null;
                return task === 'Open' ? (
                  <div key={i} className="rounded-btn border border-dashed border-bdr-2 px-3 py-2.5 text-xs text-ink-4">
                    No tasks scheduled — capacity available
                  </div>
                ) : (
                  <div key={i} className="flex items-center justify-between rounded-btn border border-bdr bg-surface px-3 py-2.5">
                    <span className="text-xs font-medium text-ink-2">{task}</span>
                    <span className="rounded-badge border border-bdr bg-surface-2 px-2 py-0.5 text-[10px] text-ink-3">{tag}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SkillsChart — team average skills vs industry benchmark
// ---------------------------------------------------------------------------
const BENCHMARK = { Electrical: 72, HVAC: 70, Plumbing: 68, Inspections: 78, Safety: 82, Equipment: 74 };

export function SkillsChart({ employees }) {
  const skills = Object.keys(BENCHMARK);
  const data = skills.map((skill) => {
    const avg = Math.round(employees.reduce((sum, e) => sum + (e.skills[skill] || 0), 0) / (employees.length || 1));
    return { skill, team: avg, benchmark: BENCHMARK[skill], gap: avg < BENCHMARK[skill] };
  });

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -22 }} barCategoryGap="28%">
        <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
        <XAxis dataKey="skill" tick={{ fontSize: 10, fill: 'var(--ink-3)', fontFamily: 'DM Sans' }} tickLine={false} axisLine={{ stroke: 'var(--border)' }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--ink-4)', fontFamily: 'DM Mono' }} tickLine={false} axisLine={false} />
        <Tooltip
          cursor={{ fill: 'var(--surface)' }}
          contentStyle={{ borderRadius: 7, border: '1px solid var(--border)', fontSize: 12, fontFamily: 'DM Sans' }}
          formatter={(v, name) => [v, name === 'team' ? 'Team avg' : 'Benchmark']}
        />
        <Bar dataKey="benchmark" fill="var(--border-2)" radius={[4, 4, 0, 0]} animationDuration={300} />
        <Bar dataKey="team" radius={[4, 4, 0, 0]} animationDuration={300}>
          {data.map((d) => (
            <Cell key={d.skill} fill={d.gap ? 'var(--red)' : 'var(--green)'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
