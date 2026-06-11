import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, YAxis, ReferenceLine, XAxis } from 'recharts';
import { useAppStore } from '../store/appStore';

// Looping illustration: risk climbs from green territory to red, event dots appear.
const ARC = [28, 29, 31, 30, 33, 35, 38, 41, 45, 48, 50, 53, 57, 59, 62, 65, 67, 69, 71, 74];
const EVENTS = {
  5: 'Inspection overdue 2d',
  9: 'Task reassigned 3×',
  13: 'Warning threshold crossed',
  17: 'Docs thinning 31%',
};

function LoginIllustration() {
  const [tick, setTick] = useState(2);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t >= ARC.length ? 2 : t + 1)), 700);
    return () => clearInterval(id);
  }, []);

  const data = ARC.slice(0, tick).map((v, i) => ({ i, score: v, label: EVENTS[i] }));
  const current = ARC[tick - 1];
  const lastEvent = Object.entries(EVENTS).filter(([k]) => Number(k) < tick).pop();

  return (
    <div className="flex h-full flex-col justify-center p-12">
      <div className="mb-2 flex items-center gap-2">
        <span className="h-2 w-2 animate-pulseDot rounded-full bg-red" aria-hidden="true" />
        <span className="font-mono text-[11px] uppercase tracking-widest text-ink-4">Live pattern detection</span>
      </div>
      <h2 className="max-w-md text-2xl font-bold leading-snug text-ink">
        Signal watches the behavior, so the failure never gets the chance.
      </h2>
      <div className="mt-8 rounded-card border border-bdr bg-surface-2 p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-ink-2">Fort Meade Expansion — risk score</span>
          <span className={`font-mono text-lg font-medium ${current >= 70 ? 'text-red' : current >= 50 ? 'text-amber' : 'text-green'}`}>
            {current}
          </span>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data} margin={{ top: 16, right: 8, bottom: 0, left: -28 }}>
            <XAxis dataKey="i" hide />
            <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: 'var(--ink-4)', fontFamily: 'DM Mono' }} tickLine={false} axisLine={false} />
            <ReferenceLine y={50} stroke="var(--amber)" strokeDasharray="4 4" />
            <ReferenceLine y={70} stroke="var(--red)" strokeDasharray="4 4" />
            <Line
              type="monotone"
              dataKey="score"
              stroke="var(--red)"
              strokeWidth={2}
              isAnimationActive={false}
              dot={({ cx, cy, payload }) =>
                payload.label ? <circle key={payload.i} cx={cx} cy={cy} r={4} fill="var(--red)" stroke="#fff" strokeWidth={1.5} /> : null
              }
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="h-5 font-mono text-[11px] text-red">
          {lastEvent ? `● ${lastEvent[1]}` : ''}
        </div>
      </div>
      <p className="mt-6 max-w-md text-sm leading-relaxed text-ink-3">
        We flag the problem <span className="font-semibold text-ink">6–9 days before it happens</span>, not the day after.
        Behavioral patterns across inspections, assignments, approvals, and documentation — monitored continuously.
      </p>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const login = useAppStore((s) => s.login);
  const currentUser = useAppStore((s) => s.currentUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) navigate('/dashboard', { replace: true });
  }, [currentUser, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-surface">
      <div className="hidden flex-[3] lg:block">
        <LoginIllustration />
      </div>
      <div className="flex flex-[2] items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-card border border-bdr bg-surface-2 p-8">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 animate-pulseDot rounded-full bg-red" aria-hidden="true" />
            <span className="text-base font-bold tracking-tight text-ink">TrackVia Signal</span>
          </div>
          <h1 className="mt-6 text-[32px] font-bold leading-tight text-ink">Know before it breaks.</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-3">
            AI-powered operational risk monitoring for field service teams.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-3">
            <div>
              <label htmlFor="email" className="mb-1 block text-xs font-medium text-ink-2">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="h-11 w-full rounded-btn border border-bdr bg-surface-2 px-3 text-sm text-ink placeholder:text-ink-4 focus:border-bdr-2"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-xs font-medium text-ink-2">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 w-full rounded-btn border border-bdr bg-surface-2 px-3 text-sm text-ink placeholder:text-ink-4 focus:border-bdr-2"
              />
            </div>
            {error && (
              <div className="rounded-btn border border-red-bdr bg-red-bg px-3 py-2 text-xs text-red" role="alert">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-btn bg-red text-sm font-semibold text-white transition-colors hover:bg-red/90 disabled:opacity-60"
            >
              {loading && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
              Sign in
            </button>
          </form>

          <p className="mt-4 font-mono text-[11px] text-ink-4">
            Demo: admin@meridiandefense.com / demo1234
          </p>

          <div className="mt-8 flex items-center gap-2 border-t border-bdr pt-4">
            <ShieldCheck size={16} className="text-blue" aria-hidden="true" />
            <span className="text-xs font-medium text-blue">FedRAMP Moderate Authorized</span>
          </div>
        </div>
      </div>
    </div>
  );
}
