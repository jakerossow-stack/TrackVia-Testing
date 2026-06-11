import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { Shield, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Tooltip } from 'recharts';

const DEMO_DATA = [
  { day: 'Day 1', score: 18, event: null },
  { day: 'Day 3', score: 24, event: 'Inspection overdue 2d' },
  { day: 'Day 6', score: 31, event: null },
  { day: 'Day 8', score: 40, event: 'Task reassigned 3×' },
  { day: 'Day 12', score: 52, event: null },
  { day: 'Day 15', score: 61, event: 'Approval lag 72hrs' },
  { day: 'Day 18', score: 69, event: null },
  { day: 'Day 21', score: 77, event: 'Incident risk HIGH' },
  { day: 'Day 24', score: 83, event: null },
];

export function Login() {
  const navigate = useNavigate();
  const login = useAppStore(s => s.login);
  const [email, setEmail] = useState('admin@meridiandefense.com');
  const [password, setPassword] = useState('demo1234');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 400));
    const ok = login(email, password);
    if (ok) {
      navigate('/dashboard');
    } else {
      setError('Invalid credentials. Try admin@meridiandefense.com / demo1234');
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--surface)', fontFamily: 'DM Sans' }}>
      {/* Left side — animated chart */}
      <div style={{ flex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, background: 'var(--ink)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%, rgba(217,48,37,0.08) 0%, transparent 60%)' }} />
        <div style={{ width: '100%', maxWidth: 520, zIndex: 1 }}>
          <h1 style={{ fontSize: 36, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Know before it breaks.</h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', marginBottom: 32, lineHeight: 1.6 }}>
            Signal detects behavioral patterns 6–9 days before failures occur — not after.
          </p>
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20 }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Fort Meade Expansion — Risk Score Buildup</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={DEMO_DATA}>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--ink)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, fontSize: 11, color: '#fff' }}
                  formatter={v => [v, 'Risk Score']}
                />
                <ReferenceLine y={50} stroke="rgba(196,123,0,0.5)" strokeDasharray="4 4" />
                <ReferenceLine y={70} stroke="rgba(217,48,37,0.5)" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="score" stroke="var(--red)" strokeWidth={2.5} dot={(props) => {
                  const { cx, cy, payload } = props;
                  if (!payload.event) return <circle cx={cx} cy={cy} r={2} fill="rgba(255,255,255,0.3)" />;
                  return <circle cx={cx} cy={cy} r={6} fill="var(--red)" stroke="rgba(255,255,255,0.3)" strokeWidth={2} />;
                }} animationDuration={1200} />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              {DEMO_DATA.filter(d => d.event).map(d => (
                <span key={d.day} style={{ fontSize: 10, padding: '2px 8px', background: 'rgba(217,48,37,0.2)', border: '1px solid rgba(217,48,37,0.3)', borderRadius: 10, color: '#ff6b6b' }}>
                  {d.day}: {d.event}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right side — login form */}
      <div style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div className="pulse-dot" style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--red)' }} />
              <span style={{ fontWeight: 700, fontSize: 18 }}>TrackVia Signal</span>
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>Sign in</h2>
            <p style={{ fontSize: 13, color: 'var(--ink-3)' }}>AI-powered operational risk monitoring for field service teams.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Email address</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                style={{ width: '100%', height: 44, padding: '0 12px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, background: 'var(--surface-2)', color: 'var(--ink)', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', height: 44, padding: '0 12px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, background: 'var(--surface-2)', color: 'var(--ink)', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {error && (
              <div style={{ display: 'flex', gap: 8, padding: 10, background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: 7, marginBottom: 16 }}>
                <AlertCircle size={14} color="var(--red)" aria-hidden="true" />
                <p style={{ fontSize: 12, color: 'var(--red)' }}>{error}</p>
              </div>
            )}

            <button
              type="submit" disabled={loading}
              style={{ width: '100%', height: 44, background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 7, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p style={{ marginTop: 16, fontSize: 11, color: 'var(--ink-4)', textAlign: 'center' }}>
            Demo: admin@meridiandefense.com / demo1234
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 24, padding: '8px 12px', background: 'var(--blue-bg)', border: '1px solid var(--blue-border)', borderRadius: 7 }}>
            <Shield size={14} color="var(--blue)" aria-hidden="true" />
            <span style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 500 }}>FedRAMP Moderate Authorized</span>
          </div>
        </div>
      </div>
    </div>
  );
}
