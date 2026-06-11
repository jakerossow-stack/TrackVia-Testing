import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { SeverityBadge } from '../components/shared/SeverityBadge';
import { ConfidenceBar } from '../components/shared/ConfidenceBar';
import { AiAnalysisCard } from '../components/shared/AiAnalysisCard';
import { RiskGauge } from '../components/shared/RiskGauge';
import { EmployeeChip } from '../components/shared/EmployeeChip';
import { RiskTimeline } from '../components/charts/RiskTimeline';
import { useAiAnalysis } from '../hooks/useAiAnalysis';
import { useState } from 'react';
import { ArrowLeft, CheckCircle, User, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export function SignalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const signals = useAppStore(s => s.signals);
  const projects = useAppStore(s => s.projects);
  const employees = useAppStore(s => s.employees);
  const updateAction = useAppStore(s => s.updateAction);
  const addSignalNote = useAppStore(s => s.addSignalNote);
  const dismissSignal = useAppStore(s => s.dismissSignal);
  const { text, isStreaming, error, analyzeSignal } = useAiAnalysis();
  const [noteText, setNoteText] = useState('');
  const [localScore, setLocalScore] = useState(null);

  const signal = signals.find(s => s.id === id);
  const project = projects.find(p => p.id === signal?.projectId);

  if (!signal) return (
    <div style={{ padding: 32, textAlign: 'center' }}>
      <p style={{ color: 'var(--ink-3)' }}>Signal not found.</p>
      <button onClick={() => navigate('/signals')} style={{ marginTop: 12, color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer' }}>← Back to signals</button>
    </div>
  );

  const riskScore = localScore ?? project?.riskScore ?? 0;
  const involvedEmps = employees.filter(e => signal.involvedEmployees?.includes(e.id));

  function handleCompleteAction(action) {
    if (action.status === 'completed') return;
    updateAction(signal.id, action.id, { status: 'completed', completedAt: new Date().toISOString() });
    const dec = 8 + Math.floor(Math.random() * 5);
    const newScore = Math.max(0, riskScore - dec);
    setLocalScore(newScore);
    toast.success(`Action completed — risk score updated to ${newScore}`);
  }

  function handleAddNote(e) {
    e.preventDefault();
    if (!noteText.trim()) return;
    addSignalNote(signal.id, noteText);
    setNoteText('');
    toast.success('Note added');
  }

  return (
    <div style={{ padding: 24 }}>
      <button onClick={() => navigate('/signals')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', fontSize: 13, marginBottom: 16 }}>
        <ArrowLeft size={14} aria-hidden="true" /> Back to Signal Feed
      </button>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Left column */}
        <div style={{ flex: 3, display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
          {/* Header */}
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <SeverityBadge severity={signal.severity} size="lg" />
              <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>{project?.name}</span>
              <span style={{ fontSize: 11, color: 'var(--ink-4)', marginLeft: 'auto', fontFamily: 'DM Mono' }}>
                Detected {new Date(signal.detectedAt).toLocaleString()}
              </span>
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.4, marginBottom: 8 }}>{signal.title}</h1>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6 }}>{signal.description}</p>
          </div>

          {/* Evidence */}
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Evidence Items</h2>
            {signal.evidenceItems?.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < signal.evidenceItems.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.severity === 'critical' ? 'var(--red)' : item.severity === 'warning' ? 'var(--amber)' : 'var(--ink-4)' }} />
                  <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{item.label}</span>
                </div>
                <span style={{ fontSize: 12, fontFamily: 'DM Mono', fontWeight: 600, color: item.severity === 'critical' ? 'var(--red)' : item.severity === 'warning' ? 'var(--amber)' : 'var(--ink-3)' }}>{item.value}</span>
              </div>
            ))}
          </div>

          {/* AI Analysis */}
          <AiAnalysisCard
            text={text} isStreaming={isStreaming} error={error}
            onAnalyze={() => analyzeSignal(signal, project?.signalHistory?.slice(-7))}
          />

          {/* Timeline */}
          {project && <RiskTimeline history={project.signalHistory} title={`Risk timeline — ${project.name}`} />}

          {/* Notes */}
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Notes</h2>
            {(signal.notes || []).length === 0 && <p style={{ fontSize: 12, color: 'var(--ink-4)', marginBottom: 12 }}>No notes yet.</p>}
            {(signal.notes || []).map(note => (
              <div key={note.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <p style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.5 }}>{note.text}</p>
                <p style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 4, fontFamily: 'DM Mono' }}>{new Date(note.createdAt).toLocaleString()}</p>
              </div>
            ))}
            <form onSubmit={handleAddNote} style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <input value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Add a note..." style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, background: 'var(--surface)' }} />
              <button type="submit" style={{ padding: '8px 16px', background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 7, fontSize: 12, cursor: 'pointer' }}>Add</button>
            </form>
          </div>
        </div>

        {/* Right column */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24, minWidth: 0 }}>
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: 'var(--ink-4)', marginBottom: 8 }}>CURRENT RISK SCORE</p>
            <RiskGauge score={riskScore} size={160} />
          </div>

          {/* Actions */}
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Recommended Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {signal.recommendedActions?.map(action => {
                const done = action.status === 'completed';
                const assignee = employees.find(e => e.id === action.assignedTo);
                return (
                  <div key={action.id} style={{ padding: 12, borderRadius: 8, border: `1px solid ${done ? 'var(--green-border)' : 'var(--border)'}`, background: done ? 'var(--green-bg)' : 'var(--surface)', opacity: done ? 0.8 : 1 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleCompleteAction(action)} style={{ background: 'none', border: 'none', cursor: done ? 'default' : 'pointer', padding: 0, marginTop: 1 }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${done ? 'var(--green)' : 'var(--border-2)'}`, background: done ? 'var(--green)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {done && <span style={{ color: '#fff', fontSize: 9 }}>✓</span>}
                        </div>
                      </button>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 12, color: done ? 'var(--ink-3)' : 'var(--ink-2)', textDecoration: done ? 'line-through' : 'none', lineHeight: 1.4 }}>{action.description}</p>
                        <div style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
                          {assignee && <span style={{ fontSize: 10, color: 'var(--ink-4)' }}>👤 {assignee.name}</span>}
                          <span style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'DM Mono' }}>Due {action.dueDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Metadata */}
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Signal Metadata</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--ink-4)' }}>Confidence</span>
                <span style={{ fontFamily: 'DM Mono', color: 'var(--ink-2)', fontWeight: 600 }}>{signal.confidencePercent}%</span>
              </div>
              <ConfidenceBar percent={signal.confidencePercent} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 4 }}>
                <span style={{ color: 'var(--ink-4)' }}>Pattern Type</span>
                <span style={{ color: 'var(--ink-2)', fontWeight: 500 }}>{signal.patternType.replace(/_/g, ' ')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--ink-4)' }}>Time to Incident</span>
                <span style={{ color: 'var(--ink-2)', fontFamily: 'DM Mono', fontWeight: 600 }}>{signal.estimatedTimeToIncident}</span>
              </div>
            </div>
            {involvedEmps.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <p style={{ fontSize: 11, color: 'var(--ink-4)', marginBottom: 6 }}>INVOLVED PERSONNEL <Lock size={10} style={{ display: 'inline', verticalAlign: 'middle' }} aria-hidden="true" /></p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {involvedEmps.map(e => <EmployeeChip key={e.id} employee={e} />)}
                </div>
              </div>
            )}
          </div>

          {/* Actions bar */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { dismissSignal(signal.id); navigate('/signals'); toast.success('Signal dismissed'); }} style={{ flex: 1, padding: 10, borderRadius: 7, border: '1px solid var(--border)', background: 'var(--surface)', fontSize: 12, cursor: 'pointer', color: 'var(--ink-3)' }}>Dismiss</button>
            <button style={{ flex: 1, padding: 10, borderRadius: 7, border: '1px solid var(--green-border)', background: 'var(--green-bg)', fontSize: 12, cursor: 'pointer', color: 'var(--green)', fontWeight: 600 }}>Resolve</button>
          </div>
        </div>
      </div>
    </div>
  );
}
