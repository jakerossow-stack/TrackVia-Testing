import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { UtilizationHeatmap } from '../components/charts/UtilizationHeatmap';
import { SkillsChart } from '../components/charts/SkillsChart';
import { Users, AlertTriangle, TrendingUp, Star } from 'lucide-react';

function utilColor(v) {
  if (v > 100) return 'var(--red)';
  if (v >= 80) return 'var(--amber)';
  return 'var(--green)';
}

const CLEARANCE_LABELS = { none: 'None', confidential: 'Confidential', secret: 'Secret', top_secret: 'Top Secret' };
const CLEARANCE_COLORS = { none: 'var(--ink-4)', confidential: 'var(--blue)', secret: 'var(--amber)', top_secret: 'var(--red)' };

export function Workforce() {
  const employees = useAppStore(s => s.employees);
  const navigate = useNavigate();
  const [sortCol, setSortCol] = useState('name');
  const [sortAsc, setSortAsc] = useState(true);

  const overCapacity = employees.filter(e => e.utilizationPercent > 100).length;
  const avgUtil = Math.round(employees.reduce((s, e) => s + e.utilizationPercent, 0) / employees.length);
  const avgMatch = Math.round(employees.reduce((s, e) => s + e.avgMatchScore, 0) / employees.length);

  function sortedEmps() {
    return [...employees].sort((a, b) => {
      const va = a[sortCol], vb = b[sortCol];
      if (typeof va === 'string') return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortAsc ? va - vb : vb - va;
    });
  }

  function TH({ col, label }) {
    return (
      <th
        onClick={() => { if (sortCol === col) setSortAsc(!sortAsc); else { setSortCol(col); setSortAsc(true); } }}
        style={{ textAlign: 'left', fontSize: 11, color: sortCol === col ? 'var(--ink)' : 'var(--ink-4)', fontWeight: sortCol === col ? 600 : 500, padding: '0 0 10px', cursor: 'pointer', whiteSpace: 'nowrap', paddingRight: 16 }}
      >{label} {sortCol === col ? (sortAsc ? '↑' : '↓') : ''}</th>
    );
  }

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700 }}>Workforce Overview</h1>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12 }}>
        {[
          { label: 'Total Staff', value: employees.length, icon: Users, color: 'var(--ink)' },
          { label: 'Avg Utilization', value: `${avgUtil}%`, icon: TrendingUp, color: utilColor(avgUtil) },
          { label: 'Over Capacity', value: overCapacity, icon: AlertTriangle, color: overCapacity > 0 ? 'var(--red)' : 'var(--green)' },
          { label: 'Avg Match Score', value: `${avgMatch}%`, icon: Star, color: 'var(--blue)' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{ flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <p style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase' }}>{label}</p>
              <Icon size={15} color={color} aria-hidden="true" />
            </div>
            <p style={{ fontSize: 26, fontWeight: 700, fontFamily: 'DM Mono', color }}>{value}</p>
          </div>
        ))}
      </div>

      <UtilizationHeatmap employees={employees} />
      <SkillsChart employees={employees} />

      {/* Table */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, overflowX: 'auto' }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Team Directory</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
          <thead>
            <tr>
              <TH col="name" label="Name" />
              <TH col="role" label="Role" />
              <TH col="utilizationPercent" label="Utilization" />
              <TH col="avgMatchScore" label="Match Score" />
              <TH col="onTimeRate" label="On-Time Rate" />
              <TH col="weeklyTaskCount" label="Tasks" />
              <th style={{ fontSize: 11, color: 'var(--ink-4)', paddingBottom: 10, textAlign: 'left', paddingRight: 16 }}>Clearance</th>
              <th style={{ fontSize: 11, color: 'var(--ink-4)', paddingBottom: 10, textAlign: 'left' }}>Top Skills</th>
            </tr>
          </thead>
          <tbody>
            {sortedEmps().map(emp => {
              const topSkills = Object.entries(emp.skills).sort((a, b) => b[1] - a[1]).slice(0, 3);
              return (
                <tr key={emp.id} onClick={() => navigate(`/workforce/${emp.id}`)} style={{ cursor: 'pointer', borderTop: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '10px 16px 10px 0', fontSize: 13, fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: CLEARANCE_COLORS[emp.clearanceLevel], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 700 }}>{emp.initials}</div>
                      {emp.name}
                    </div>
                  </td>
                  <td style={{ padding: '10px 16px 10px 0', fontSize: 12, color: 'var(--ink-3)' }}>{emp.role}</td>
                  <td style={{ padding: '10px 16px 10px 0', fontSize: 12, fontFamily: 'DM Mono', fontWeight: 600, color: utilColor(emp.utilizationPercent) }}>{emp.utilizationPercent}%</td>
                  <td style={{ padding: '10px 16px 10px 0', fontSize: 12, fontFamily: 'DM Mono' }}>{emp.avgMatchScore}%</td>
                  <td style={{ padding: '10px 16px 10px 0', fontSize: 12, fontFamily: 'DM Mono' }}>{emp.onTimeRate}%</td>
                  <td style={{ padding: '10px 16px 10px 0', fontSize: 12, fontFamily: 'DM Mono' }}>{emp.weeklyTaskCount}</td>
                  <td style={{ padding: '10px 16px 10px 0' }}>
                    <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: 'var(--surface)', border: '1px solid var(--border)', color: CLEARANCE_COLORS[emp.clearanceLevel], fontWeight: 600 }}>
                      {CLEARANCE_LABELS[emp.clearanceLevel]}
                    </span>
                  </td>
                  <td style={{ padding: '10px 0', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {topSkills.map(([skill, score]) => (
                      <span key={skill} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--ink-3)' }}>{skill} {score}</span>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
