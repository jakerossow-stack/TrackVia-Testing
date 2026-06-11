import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpDown, Users } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { UtilizationHeatmap, SkillsChart } from '../components/charts/UtilizationHeatmap';
import { ClearanceBadge, StatCard, EmptyState, utilColor } from '../components/shared/ui';

const COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
  { key: 'utilizationPercent', label: 'Utilization' },
  { key: 'avgMatchScore', label: 'Avg match' },
  { key: 'onTimeRate', label: 'On-time' },
  { key: 'weeklyTaskCount', label: 'Active tasks' },
  { key: 'skills', label: 'Top skills', sortable: false },
  { key: 'clearanceLevel', label: 'Clearance', sortable: false },
];

export default function Workforce() {
  const navigate = useNavigate();
  const employees = useAppStore((s) => s.employees.filter((e) => e.active));
  const [sortKey, setSortKey] = useState('utilizationPercent');
  const [sortDir, setSortDir] = useState('desc');

  const sorted = useMemo(() => {
    const list = [...employees];
    list.sort((a, b) => {
      const av = a[sortKey]; const bv = b[sortKey];
      const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [employees, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  const avgUtil = Math.round(employees.reduce((a, e) => a + e.utilizationPercent, 0) / Math.max(employees.length, 1));
  const overCap = employees.filter((e) => e.utilizationPercent > 100).length;
  const avgMatch = Math.round(employees.reduce((a, e) => a + e.avgMatchScore, 0) / Math.max(employees.length, 1));

  if (employees.length === 0) {
    return (
      <div className="p-6">
        <EmptyState icon={Users} iconClass="text-ink-4" title="No active team members"
          message="Add employees in Settings → Team to begin capacity monitoring." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] p-6">
      <h1 className="font-display text-xl font-bold text-ink">Workforce</h1>
      <p className="mt-0.5 text-sm text-ink-3">Capacity, skill coverage, and scheduling fitness across the team</p>

      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total staff" value={employees.length} sub="Active field + compliance" />
        <StatCard label="Avg utilization" value={`${avgUtil}%`} valueClass={utilColor(avgUtil)} sub="Healthy band: 60–80%" />
        <StatCard label="Over capacity" value={overCap} valueClass={overCap > 0 ? 'text-red' : 'text-green'} sub=">100% sustained utilization" />
        <StatCard label="Avg match score" value={avgMatch} valueClass="text-blue" sub="Skill-to-task fit across assignments" />
      </div>

      {/* Heatmap */}
      <section className="mt-5 rounded-card border border-bdr bg-surface-2 p-5">
        <h2 className="font-display text-sm font-bold text-ink">Utilization heatmap — this week</h2>
        <p className="mt-0.5 text-xs text-ink-4">Click any cell to see that day&rsquo;s assignment</p>
        <div className="mt-4">
          <UtilizationHeatmap employees={employees} />
        </div>
      </section>

      {/* Table */}
      <section className="mt-5 overflow-hidden rounded-card border border-bdr bg-surface-2">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] text-sm">
            <thead>
              <tr className="border-b border-bdr bg-surface text-left">
                {COLUMNS.map((c) => (
                  <th key={c.key} className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-ink-4">
                    {c.sortable === false ? c.label : (
                      <button onClick={() => toggleSort(c.key)} className="inline-flex items-center gap-1 rounded px-1 hover:text-ink-2">
                        {c.label} <ArrowUpDown size={11} aria-hidden="true" className={sortKey === c.key ? 'text-ink-2' : ''} />
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((e) => {
                const topSkills = Object.entries(e.skills).sort((a, b) => b[1] - a[1]).slice(0, 3);
                return (
                  <tr
                    key={e.id}
                    onClick={() => navigate(`/workforce/${e.id}`)}
                    onKeyDown={(ev) => ev.key === 'Enter' && navigate(`/workforce/${e.id}`)}
                    tabIndex={0}
                    className="cursor-pointer border-b border-bdr last:border-0 hover:bg-surface focus-visible:bg-surface"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-avatar bg-ink text-[11px] font-bold text-white">{e.initials}</span>
                        <span className="font-medium text-ink">{e.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-3">{e.role}</td>
                    <td className={`px-4 py-3 font-mono font-medium ${utilColor(e.utilizationPercent)}`}>{e.utilizationPercent}%</td>
                    <td className="px-4 py-3 font-mono text-ink-2">{e.avgMatchScore}</td>
                    <td className="px-4 py-3 font-mono text-ink-2">{e.onTimeRate}%</td>
                    <td className="px-4 py-3 font-mono text-ink-2">{e.weeklyTaskCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {topSkills.map(([name, score]) => (
                          <span key={name} className="rounded-pill border border-bdr bg-surface px-2 py-0.5 text-[10px] text-ink-3">
                            {name} <span className="font-mono text-ink-4">{score}</span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3"><ClearanceBadge level={e.clearanceLevel} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Skills gap */}
      <section className="mt-5 rounded-card border border-bdr bg-surface-2 p-5">
        <h2 className="font-display text-sm font-bold text-ink">Skill coverage vs industry benchmark</h2>
        <p className="mt-0.5 text-xs text-ink-4">Team averages by skill area — gaps vs benchmark highlighted in red</p>
        <div className="mt-4">
          <SkillsChart employees={employees} />
        </div>
      </section>
    </div>
  );
}
