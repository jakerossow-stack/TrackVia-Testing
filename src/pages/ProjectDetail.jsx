import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { RiskTimeline } from '../components/charts/RiskTimeline';
import { SignalCard } from '../components/shared/SignalCard';
import { RiskGauge } from '../components/shared/RiskGauge';
import { ArrowLeft } from 'lucide-react';

export function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const projects = useAppStore(s => s.projects);
  const signals = useAppStore(s => s.signals);
  const employees = useAppStore(s => s.employees);

  const project = projects.find(p => p.id === id);
  if (!project) return <div style={{ padding: 32 }}><p style={{ color: 'var(--ink-3)' }}>Project not found.</p></div>;

  const projectSignals = signals.filter(s => s.projectId === id && s.status === 'active');
  const pm = employees.find(e => e.id === project.projectManager);

  return (
    <div style={{ padding: 24 }}>
      <button onClick={() => navigate('/projects')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', fontSize: 13, marginBottom: 16 }}>
        <ArrowLeft size={14} aria-hidden="true" /> Back to Projects
      </button>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{project.name}</h1>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--ink-3)' }}>
              <span>📍 {project.location}</span>
              <span>PM: {pm?.name}</span>
              <span>📅 {project.startDate} → {project.endDate}</span>
              <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{project.complianceFramework}</span>
            </div>
          </div>
          <RiskTimeline history={project.signalHistory} title="Risk history" />
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Active Signals ({projectSignals.length})</h2>
            {projectSignals.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--ink-4)', fontSize: 13 }}>No active signals on this project.</div>
            ) : projectSignals.map(s => <SignalCard key={s.id} signal={s} />)}
          </div>
        </div>
        <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: 'var(--ink-4)', marginBottom: 8 }}>RISK SCORE</p>
            <RiskGauge score={project.riskScore} size={140} />
          </div>
        </div>
      </div>
    </div>
  );
}
