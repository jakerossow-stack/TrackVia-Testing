import { CheckCircle, XCircle } from 'lucide-react';

const HISTORY = [
  { id: 1, date: '2024-04-02', signal: 'Compound failure pattern — Fort Meade', predicted: 'Task delay >3 weeks', actual: 'Prevented via intervention', correct: true, project: 'Fort Meade Expansion' },
  { id: 2, date: '2024-03-15', signal: 'Utilization spike — HQ HVAC', predicted: 'Quality defects in HVAC work', actual: 'Quality issues reported on Day 12', correct: true, project: 'HQ HVAC Overhaul' },
  { id: 3, date: '2024-02-28', signal: 'Approval lag — Site 7', predicted: 'CMMC audit finding in 14 days', actual: 'Resolved before audit', correct: true, project: 'Site 7 Infrastructure' },
  { id: 4, date: '2024-02-10', signal: 'Documentation thinning — Annual Safety', predicted: 'OSHA finding likely', actual: 'Audit passed — no finding', correct: false, project: 'Annual Safety Review' },
];

export function PredictionHistory() {
  const correct = HISTORY.filter(h => h.correct).length;
  const accuracy = Math.round((correct / HISTORY.length) * 100);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Prediction History</h1>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 28, fontWeight: 700, fontFamily: 'DM Mono', color: 'var(--green)' }}>{accuracy}%</p>
          <p style={{ fontSize: 11, color: 'var(--ink-4)' }}>{correct}/{HISTORY.length} correct predictions</p>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {HISTORY.map(h => (
          <div key={h.id} style={{ padding: 16, background: 'var(--surface-2)', border: `1px solid ${h.correct ? 'var(--green-border)' : 'var(--red-border)'}`, borderRadius: 10 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              {h.correct ? <CheckCircle size={18} color="var(--green)" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" /> : <XCircle size={18} color="var(--red)" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>{h.signal}</p>
                  <span style={{ fontSize: 11, fontFamily: 'DM Mono', color: 'var(--ink-4)' }}>{h.date}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 3 }}>Predicted: {h.predicted}</p>
                <p style={{ fontSize: 12, color: h.correct ? 'var(--green)' : 'var(--red)', fontWeight: 500 }}>Actual: {h.actual}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
