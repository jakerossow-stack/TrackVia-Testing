import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { SeverityBadge } from '../components/shared/SeverityBadge';
import { TrendingUp, TrendingDown, Minus, FolderKanban } from 'lucide-react';

function riskColor(score) {
  return score >= 70 ? 'var(--red)' : score >= 50 ? 'var(--amber)' : 'var(--green)';
}

export function Projects() {
  const projects = useAppStore(s => s.projects);
  const employees = useAppStore(s => s.employees);
  const navigate = useNavigate();

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Projects</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {projects.map(p => {
          const pm = employees.find(e => e.id === p.projectManager);
          const statusColor = p.status === 'critical' ? 'var(--red)' : p.status === 'at_risk' ? 'var(--amber)' : 'var(--green)';
          const statusBg = p.status === 'critical' ? 'var(--red-bg)' : p.status === 'at_risk' ? 'var(--amber-bg)' : 'var(--green-bg)';
          const TrendIcon = p.riskTrend === 'rising' ? TrendingUp : p.riskTrend === 'falling' ? TrendingDown : Minus;
          const trendColor = p.riskTrend === 'rising' ? 'var(--red)' : p.riskTrend === 'falling' ? 'var(--green)' : 'var(--ink-4)';
          return (
            <div
              key={p.id}
              onClick={() => navigate(`/projects/${p.id}`)}
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 20 }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ width: 48, height: 48, borderRadius: 10, background: statusBg, border: `1px solid ${statusColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FolderKanban size={20} color={statusColor} aria-hidden="true" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <h2 style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</h2>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: statusBg, color: statusColor, border: `1px solid ${statusColor}`, fontWeight: 600 }}>
                    {p.status.replace('_', ' ')}
                  </span>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 5, background: 'var(--surface)', color: 'var(--ink-3)', border: '1px solid var(--border)' }}>
                    {p.complianceFramework.toUpperCase()}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--ink-3)' }}>{p.location} · PM: {pm?.name || 'Unassigned'}</p>
              </div>
              <div style={{ display: 'flex', gap: 24, flexShrink: 0, alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 22, fontWeight: 700, fontFamily: 'DM Mono', color: riskColor(p.riskScore) }}>{p.riskScore}</span>
                    <TrendIcon size={14} color={trendColor} aria-hidden="true" />
                  </div>
                  <p style={{ fontSize: 10, color: 'var(--ink-4)' }}>Risk Score</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: 20, fontWeight: 700, fontFamily: 'DM Mono', color: p.activeSignalCount > 0 ? 'var(--amber)' : 'var(--ink-3)' }}>{p.activeSignalCount}</span>
                  <p style={{ fontSize: 10, color: 'var(--ink-4)' }}>Signals</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: 11, fontFamily: 'DM Mono', color: 'var(--ink-3)' }}>{p.endDate}</span>
                  <p style={{ fontSize: 10, color: 'var(--ink-4)' }}>Deadline</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
