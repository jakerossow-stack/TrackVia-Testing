import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { SeverityBadge } from '../components/shared/SeverityBadge';
import { ConfidenceBar } from '../components/shared/ConfidenceBar';
import { CheckCircle2, Radio, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export function SignalFeed() {
  const signals = useAppStore(s => s.signals);
  const projects = useAppStore(s => s.projects);
  const dismissSignal = useAppStore(s => s.dismissSignal);
  const navigate = useNavigate();

  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('active');
  const [filterProject, setFilterProject] = useState('all');
  const [sortBy, setSortBy] = useState('severity');

  const filtered = signals
    .filter(s => filterSeverity === 'all' || s.severity === filterSeverity)
    .filter(s => filterStatus === 'all' || s.status === filterStatus)
    .filter(s => filterProject === 'all' || s.projectId === filterProject)
    .sort((a, b) => {
      if (sortBy === 'severity') {
        const order = { critical: 0, warning: 1, watch: 2 };
        return (order[a.severity] || 3) - (order[b.severity] || 3);
      }
      if (sortBy === 'confidence') return b.confidencePercent - a.confidencePercent;
      return new Date(b.detectedAt) - new Date(a.detectedAt);
    });

  const filterBtn = (label, active, onClick) => (
    <button onClick={onClick} style={{
      padding: '5px 12px', borderRadius: 6, border: `1px solid ${active ? 'var(--ink)' : 'var(--border)'}`,
      background: active ? 'var(--ink)' : 'var(--surface-2)', color: active ? '#fff' : 'var(--ink-3)',
      fontSize: 12, fontWeight: active ? 600 : 400, cursor: 'pointer',
    }}>{label}</button>
  );

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Signal Feed</h1>
        <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{filtered.length} signals matching filters</p>
      </div>

      {/* Filters */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--ink-4)', marginRight: 4, fontWeight: 500 }}>SEVERITY</span>
          {['all', 'critical', 'warning', 'watch'].map(v => filterBtn(v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1), filterSeverity === v, () => setFilterSeverity(v)))}
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--ink-4)', marginRight: 4, fontWeight: 500 }}>STATUS</span>
          {['all', 'active', 'dismissed', 'resolved'].map(v => filterBtn(v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1), filterStatus === v, () => setFilterStatus(v)))}
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--ink-4)', marginRight: 4, fontWeight: 500 }}>PROJECT</span>
          <select value={filterProject} onChange={e => setFilterProject(e.target.value)} style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 12, background: 'var(--surface-2)', color: 'var(--ink-2)' }}>
            <option value="all">All Projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--ink-4)', marginRight: 4, fontWeight: 500 }}>SORT</span>
          {[['severity', 'Severity'], ['confidence', 'Confidence'], ['date', 'Date']].map(([v, l]) => filterBtn(l, sortBy === v, () => setSortBy(v)))}
        </div>
      </div>

      {/* Signal list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 64, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12 }}>
          <CheckCircle2 size={40} color="var(--green)" style={{ margin: '0 auto 16px' }} aria-hidden="true" />
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--green)' }}>No active signals</p>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 6 }}>No signals matching your filters. Operations look healthy.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(sig => {
            const project = projects.find(p => p.id === sig.projectId);
            return (
              <div
                key={sig.id}
                onClick={() => navigate(`/signals/${sig.id}`)}
                style={{
                  background: 'var(--surface-2)', border: `1px solid ${sig.severity === 'critical' ? 'var(--red-border)' : sig.severity === 'warning' ? 'var(--amber-border)' : 'var(--border)'}`,
                  borderRadius: 10, padding: 16, cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <SeverityBadge severity={sig.severity} />
                      <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>{project?.name}</span>
                      <span style={{ fontSize: 10, color: 'var(--ink-4)', marginLeft: 'auto', fontFamily: 'DM Mono' }}>
                        {new Date(sig.detectedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{sig.title}</p>
                    <p style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.5, marginBottom: 10 }}>{sig.description.slice(0, 140)}...</p>
                    <div style={{ marginBottom: 10 }}>
                      <ConfidenceBar percent={sig.confidencePercent} />
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      {sig.evidenceItems?.slice(0, 3).map((item, i) => (
                        <span key={i} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, background: item.severity === 'critical' ? 'var(--red-bg)' : 'var(--amber-bg)', border: `1px solid ${item.severity === 'critical' ? 'var(--red-border)' : 'var(--amber-border)'}`, color: item.severity === 'critical' ? 'var(--red)' : 'var(--amber)' }}>{item.label}</span>
                      ))}
                      {sig.estimatedTimeToIncident && (
                        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--ink-4)', fontFamily: 'DM Mono' }}>
                          <Clock size={10} aria-hidden="true" /> {sig.estimatedTimeToIncident} to incident
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={e => { e.stopPropagation(); dismissSignal(sig.id); toast.success('Signal dismissed'); }}
                      style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', fontSize: 11, cursor: 'pointer', color: 'var(--ink-3)' }}
                    >Dismiss</button>
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/signals/${sig.id}`); }}
                      style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--ink)', fontSize: 11, cursor: 'pointer', color: '#fff' }}
                    >View</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
