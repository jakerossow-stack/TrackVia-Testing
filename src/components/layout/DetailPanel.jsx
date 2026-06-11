import { useState } from 'react';
import { X, CheckCircle, User } from 'lucide-react';
import { RiskGauge } from '../shared/RiskGauge';
import { AiAnalysisCard } from '../shared/AiAnalysisCard';
import { ConfidenceBar } from '../shared/ConfidenceBar';
import { useAiAnalysis } from '../../hooks/useAiAnalysis';
import { useAppStore } from '../../store/appStore';
import toast from 'react-hot-toast';

export function DetailPanel({ signal, project, onClose }) {
  const [tab, setTab] = useState('risk');
  const { text, isStreaming, error, analyzeSignal } = useAiAnalysis();
  const employees = useAppStore(s => s.employees);
  const updateAction = useAppStore(s => s.updateAction);
  const projects = useAppStore(s => s.projects);
  const [localScore, setLocalScore] = useState(project?.riskScore || 0);

  const proj = project || projects.find(p => p.id === signal?.projectId);

  function handleAnalyze() {
    if (signal && proj) analyzeSignal(signal, proj.signalHistory?.slice(-7));
  }

  function handleCompleteAction(action) {
    if (action.status === 'completed') return;
    updateAction(signal.id, action.id, { status: 'completed', completedAt: new Date().toISOString() });
    const dec = 8 + Math.floor(Math.random() * 5);
    const newScore = Math.max(0, localScore - dec);
    setLocalScore(newScore);
    toast.success(`Action completed — risk score updated to ${newScore}`);
  }

  if (!signal) return (
    <div style={{ width: 320, borderLeft: '1px solid var(--border)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <p style={{ color: 'var(--ink-4)', fontSize: 13, textAlign: 'center', padding: 24 }}>Select a signal to view details</p>
    </div>
  );

  const involvedEmps = employees.filter(e => signal.involvedEmployees?.includes(e.id));

  return (
    <div style={{ width: 320, borderLeft: '1px solid var(--border)', background: 'var(--surface-2)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto', maxHeight: '100vh', position: 'sticky', top: 0 }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 10, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{proj?.name}</p>
          <h2 style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>{signal.title}</h2>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-4)', padding: 4 }}>
            <X size={14} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
        {['risk', 'actions', 'history'].map(t => (
          <button key={t} onClick={() => { setTab(t); if (t === 'risk' && !text) handleAnalyze(); }} style={{
            flex: 1, padding: '8px 0', background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: tab === t ? 600 : 400,
            color: tab === t ? 'var(--ink)' : 'var(--ink-3)',
            borderBottom: tab === t ? '2px solid var(--red)' : '2px solid transparent',
            textTransform: 'capitalize',
          }}>{t}</button>
        ))}
      </div>

      <div style={{ padding: 16, flex: 1 }}>
        {tab === 'risk' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <RiskGauge score={localScore || proj?.riskScore || 0} size={140} />
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: 8 }}>Evidence</p>
              {signal.evidenceItems?.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{item.label}</span>
                  <span style={{
                    fontSize: 11, fontFamily: 'DM Mono', fontWeight: 600,
                    color: item.severity === 'critical' ? 'var(--red)' : item.severity === 'warning' ? 'var(--amber)' : 'var(--ink-3)',
                  }}>{item.value}</span>
                </div>
              ))}
            </div>
            <AiAnalysisCard text={text} isStreaming={isStreaming} error={error} onAnalyze={handleAnalyze} />
          </div>
        )}

        {tab === 'actions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {signal.recommendedActions?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--ink-4)' }}>
                <CheckCircle size={32} style={{ margin: '0 auto 8px' }} aria-hidden="true" />
                <p style={{ fontSize: 13 }}>All actions complete</p>
              </div>
            ) : signal.recommendedActions?.map((action, i) => {
              const assignee = employees.find(e => e.id === action.assignedTo);
              const done = action.status === 'completed';
              return (
                <div key={action.id} style={{
                  padding: 12, borderRadius: 8, border: `1px solid ${done ? 'var(--green-border)' : 'var(--border)'}`,
                  background: done ? 'var(--green-bg)' : 'var(--surface)', opacity: done ? 0.7 : 1,
                }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleCompleteAction(action)} style={{ background: 'none', border: 'none', cursor: done ? 'default' : 'pointer', padding: 0, flexShrink: 0, marginTop: 2 }}>
                      <div style={{
                        width: 16, height: 16, borderRadius: '50%', border: `2px solid ${done ? 'var(--green)' : 'var(--border-2)'}`,
                        background: done ? 'var(--green)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {done && <span style={{ color: '#fff', fontSize: 10 }}>✓</span>}
                      </div>
                    </button>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12, color: done ? 'var(--ink-3)' : 'var(--ink-2)', textDecoration: done ? 'line-through' : 'none', lineHeight: 1.4 }}>{action.description}</p>
                      <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
                        {assignee && <span style={{ fontSize: 10, color: 'var(--ink-4)' }}><User size={10} style={{ display: 'inline', marginRight: 3 }} aria-hidden="true" />{assignee.name}</span>}
                        <span style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'DM Mono' }}>Due {action.dueDate}</span>
                        <span style={{
                          fontSize: 10, padding: '1px 6px', borderRadius: 4,
                          background: action.priority === 'high' ? 'var(--red-bg)' : action.priority === 'medium' ? 'var(--amber-bg)' : 'var(--surface)',
                          color: action.priority === 'high' ? 'var(--red)' : action.priority === 'medium' ? 'var(--amber)' : 'var(--ink-4)',
                          border: `1px solid ${action.priority === 'high' ? 'var(--red-border)' : action.priority === 'medium' ? 'var(--amber-border)' : 'var(--border)'}`,
                        }}>{action.priority}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontSize: 12, color: 'var(--ink-3)' }}>Signal detection history for {proj?.name}</p>
            {proj?.signalHistory?.filter(e => e.triggerType).map((event, i) => (
              <div key={i} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)' }}>
                <p style={{ fontSize: 11, fontFamily: 'DM Mono', color: 'var(--ink-4)', marginBottom: 4 }}>{event.date}</p>
                <p style={{ fontSize: 12, color: 'var(--ink-2)', fontWeight: 500 }}>{event.note || event.triggerType}</p>
                <p style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>Risk score: <span style={{ fontFamily: 'DM Mono', color: event.riskScore >= 70 ? 'var(--red)' : event.riskScore >= 50 ? 'var(--amber)' : 'var(--green)' }}>{event.riskScore}</span></p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
