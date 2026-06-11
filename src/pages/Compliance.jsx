import { useAppStore } from '../store/appStore';
import { Shield, Download, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

const EVENTS = [
  { id: 'ce_1', date: '2024-01-10', type: 'DFARS Audit', description: 'Annual DFARS 252.204-7012 compliance audit', status: 'compliant' },
  { id: 'ce_2', date: '2024-02-15', type: 'CMMC Assessment', description: 'CMMC Level 2 assessment for Site 7', status: 'finding' },
  { id: 'ce_3', date: '2024-02-28', type: 'CMMC Correction', description: 'Access control policy updated per CMMC finding', status: 'corrected' },
  { id: 'ce_4', date: '2024-03-20', type: 'OSHA Inspection', description: 'OSHA 1926 construction safety review at HQ', status: 'compliant' },
  { id: 'ce_5', date: '2024-04-05', type: 'DFARS Review', description: 'Quarterly DFARS data handling review', status: 'compliant' },
  { id: 'ce_6', date: '2024-05-01', type: 'Pending Certification', description: 'CMMC Level 2 re-certification in progress', status: 'pending' },
];

const statusConfig = {
  compliant: { color: 'var(--green)', bg: 'var(--green-bg)', border: 'var(--green-border)', icon: CheckCircle, label: 'Compliant' },
  finding: { color: 'var(--red)', bg: 'var(--red-bg)', border: 'var(--red-border)', icon: AlertCircle, label: 'Finding' },
  corrected: { color: 'var(--blue)', bg: 'var(--blue-bg)', border: 'var(--blue-border)', icon: CheckCircle, label: 'Corrected' },
  pending: { color: 'var(--amber)', bg: 'var(--amber-bg)', border: 'var(--amber-border)', icon: Clock, label: 'Pending' },
};

const monthlyData = [
  { month: 'Jan', compliant: 2, finding: 0 },
  { month: 'Feb', compliant: 1, finding: 1 },
  { month: 'Mar', compliant: 2, finding: 0 },
  { month: 'Apr', compliant: 1, finding: 0 },
  { month: 'May', compliant: 0, finding: 0 },
];

export function Compliance() {
  const organization = useAppStore(s => s.organization);
  const compliantCount = EVENTS.filter(e => e.status === 'compliant').length;
  const total = EVENTS.length;
  const score = Math.round((compliantCount / total) * 100);
  const scoreColor = score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--amber)' : 'var(--red)';

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* FedRAMP notice */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'var(--blue-bg)', border: '1px solid var(--blue-border)', borderRadius: 8 }}>
        <Shield size={16} color="var(--blue)" aria-hidden="true" />
        <p style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 500 }}>All data processed within FedRAMP Moderate authorization boundary. No CUI leaves the secured environment.</p>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* Score card */}
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, minWidth: 200, textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: 'var(--ink-4)', marginBottom: 8, textTransform: 'uppercase' }}>Compliance Score</p>
          <p style={{ fontSize: 52, fontWeight: 700, fontFamily: 'DM Mono', color: scoreColor }}>{score}%</p>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 12, flexWrap: 'wrap' }}>
            {[['DFARS', 'green'], ['CMMC', 'amber'], ['OSHA', 'green']].map(([label, state]) => (
              <span key={label} style={{
                fontSize: 11, padding: '3px 8px', borderRadius: 5, fontWeight: 600,
                background: `var(--${state}-bg)`, border: `1px solid var(--${state}-border)`, color: `var(--${state})`,
              }}>{label} {state === 'green' ? '✓' : '⚠'}</span>
            ))}
          </div>
        </div>

        {/* Timeline chart */}
        <div style={{ flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Compliance Events — Last 12 Months</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--ink-4)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--ink-4)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="compliant" name="Compliant" fill="var(--green)" opacity={0.7} radius={[3,3,0,0]} />
              <Bar dataKey="finding" name="Finding" fill="var(--red)" opacity={0.7} radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Events table */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600 }}>Compliance Log</h2>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--surface)', fontSize: 12, cursor: 'pointer', color: 'var(--ink-2)' }}>
            <Download size={13} aria-hidden="true" /> Export DFARS Report
          </button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Date', 'Type', 'Description', 'Status'].map(h => (
                <th key={h} style={{ textAlign: 'left', fontSize: 11, color: 'var(--ink-4)', fontWeight: 500, paddingBottom: 10, paddingRight: 16 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {EVENTS.map(ev => {
              const cfg = statusConfig[ev.status];
              const Icon = cfg.icon;
              return (
                <tr key={ev.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 16px 10px 0', fontSize: 11, color: 'var(--ink-3)', fontFamily: 'DM Mono' }}>{ev.date}</td>
                  <td style={{ padding: '10px 16px 10px 0', fontSize: 12, fontWeight: 500 }}>{ev.type}</td>
                  <td style={{ padding: '10px 16px 10px 0', fontSize: 12, color: 'var(--ink-3)' }}>{ev.description}</td>
                  <td style={{ padding: '10px 0' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '3px 8px', borderRadius: 10, background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, fontWeight: 600 }}>
                      <Icon size={10} aria-hidden="true" /> {cfg.label}
                    </span>
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
