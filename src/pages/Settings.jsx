import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { RiskGauge } from '../components/shared/RiskGauge';
import { PATTERN_TYPES } from '../store/seedData';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';

export function Settings() {
  const organization = useAppStore(s => s.organization);
  const [tab, setTab] = useState('general');
  const [warnThreshold, setWarnThreshold] = useState(50);
  const [critThreshold, setCritThreshold] = useState(70);
  const [patternWeights, setPatternWeights] = useState(
    Object.fromEntries(PATTERN_TYPES.map(p => [p.type, { enabled: true, weight: 3 }]))
  );

  const tabs = ['general', 'alerts', 'patterns', 'team', 'integrations'];

  function handleSave() {
    toast.success('Settings saved');
  }

  return (
    <div style={{ padding: 24, maxWidth: 840 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Settings</h1>
        <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 7, background: 'var(--ink)', color: '#fff', border: 'none', fontSize: 13, cursor: 'pointer' }}>
          <Save size={14} aria-hidden="true" /> Save changes
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13,
            fontWeight: tab === t ? 600 : 400, color: tab === t ? 'var(--ink)' : 'var(--ink-3)',
            borderBottom: tab === t ? '2px solid var(--red)' : '2px solid transparent',
            textTransform: 'capitalize',
          }}>{t === 'alerts' ? 'Alert Thresholds' : t === 'patterns' ? 'Pattern Weights' : t}</button>
        ))}
      </div>

      {tab === 'general' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <FormRow label="Organization Name">
            <input defaultValue={organization?.name} style={inputStyle} />
          </FormRow>
          <FormRow label="Industry">
            <select defaultValue={organization?.industry} style={inputStyle}>
              <option value="defense_contractor">Defense Contractor</option>
              <option value="construction">Construction</option>
              <option value="field_service">Field Service</option>
              <option value="manufacturing">Manufacturing</option>
            </select>
          </FormRow>
          <FormRow label="Data Retention">
            <select defaultValue="90" style={inputStyle}>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="180">180 days</option>
              <option value="365">365 days</option>
            </select>
          </FormRow>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 500 }}>FedRAMP Mode</p>
              <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>Enforce FedRAMP Moderate data handling boundaries</p>
            </div>
            <div style={{ width: 36, height: 20, background: organization?.fedRampEnabled ? 'var(--blue)' : 'var(--border)', borderRadius: 10, cursor: 'not-allowed', position: 'relative' }}>
              <div style={{ width: 16, height: 16, background: '#fff', borderRadius: '50%', position: 'absolute', top: 2, left: organization?.fedRampEnabled ? 18 : 2, transition: 'left 0.2s' }} />
            </div>
          </div>
        </div>
      )}

      {tab === 'alerts' && (
        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 500 }}>Warning Threshold</label>
                <span style={{ fontSize: 13, fontFamily: 'DM Mono', color: 'var(--amber)', fontWeight: 600 }}>{warnThreshold}</span>
              </div>
              <input type="range" min={20} max={80} value={warnThreshold} onChange={e => setWarnThreshold(+e.target.value)} style={{ width: '100%', accentColor: 'var(--amber)' }} />
              <p style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 4 }}>Signals trigger warning alerts above this score</p>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 500 }}>Critical Threshold</label>
                <span style={{ fontSize: 13, fontFamily: 'DM Mono', color: 'var(--red)', fontWeight: 600 }}>{critThreshold}</span>
              </div>
              <input type="range" min={50} max={95} value={critThreshold} onChange={e => setCritThreshold(+e.target.value)} style={{ width: '100%', accentColor: 'var(--red)' }} />
              <p style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 4 }}>Signals trigger critical alerts above this score</p>
            </div>
          </div>
          <div style={{ width: 200, textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: 'var(--ink-4)', marginBottom: 8 }}>PREVIEW</p>
            <RiskGauge score={critThreshold} size={160} />
          </div>
        </div>
      )}

      {tab === 'patterns' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {PATTERN_TYPES.map(pt => {
            const pw = patternWeights[pt.type] || { enabled: true, weight: 3 };
            return (
              <div key={pt.type} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 14, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, opacity: pw.enabled ? 1 : 0.5 }}>
                <button
                  onClick={() => setPatternWeights(prev => ({ ...prev, [pt.type]: { ...pw, enabled: !pw.enabled } }))}
                  style={{ width: 36, height: 20, background: pw.enabled ? 'var(--green)' : 'var(--border)', borderRadius: 10, border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0 }}
                >
                  <div style={{ width: 16, height: 16, background: '#fff', borderRadius: '50%', position: 'absolute', top: 2, left: pw.enabled ? 18 : 2, transition: 'left 0.2s' }} />
                </button>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 500 }}>{pt.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 1 }}>{pt.description}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>Weight:</span>
                  <input
                    type="range" min={1} max={5} value={pw.weight} disabled={!pw.enabled}
                    onChange={e => setPatternWeights(prev => ({ ...prev, [pt.type]: { ...pw, weight: +e.target.value } }))}
                    style={{ width: 80, accentColor: 'var(--red)' }}
                  />
                  <span style={{ fontSize: 12, fontFamily: 'DM Mono', fontWeight: 600, minWidth: 12 }}>{pw.weight}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'team' && (
        <div>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 16 }}>Manage team members via the Workforce section.</p>
          <a href="/workforce" style={{ color: 'var(--blue)', fontSize: 13 }}>Go to Workforce →</a>
        </div>
      )}

      {tab === 'integrations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 20, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600 }}>TrackVia Workflow Connector</p>
                <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>Monitors TrackVia records, tasks, and workflow events for behavioral patterns</p>
              </div>
              <span style={{ padding: '4px 10px', borderRadius: 10, background: 'var(--green-bg)', border: '1px solid var(--green-border)', color: 'var(--green)', fontSize: 12, fontWeight: 600 }}>● Connected</span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--ink-4)', fontFamily: 'DM Mono' }}>Last sync: {new Date().toLocaleString()}</p>
            <button style={{ marginTop: 10, padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', fontSize: 12, cursor: 'pointer' }}>Re-sync now</button>
          </div>
          <div style={{ padding: 10, background: 'var(--blue-bg)', border: '1px solid var(--blue-border)', borderRadius: 8, fontSize: 12, color: 'var(--blue)' }}>
            🔒 FedRAMP boundary enforcement active — all data remains within your authorized environment.
          </div>
        </div>
      )}
    </div>
  );
}

function FormRow({ label, children }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%', height: 40, padding: '0 12px', border: '1px solid var(--border)',
  borderRadius: 7, fontSize: 13, background: 'var(--surface)', color: 'var(--ink)',
};
