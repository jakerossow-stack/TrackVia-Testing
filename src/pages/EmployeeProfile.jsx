import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { AiAnalysisCard } from '../components/shared/AiAnalysisCard';
import { useAiAnalysis } from '../hooks/useAiAnalysis';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { ArrowLeft, Lock } from 'lucide-react';

const CLEARANCE_LABELS = { none: 'None', confidential: 'Confidential', secret: 'Secret', top_secret: 'Top Secret' };
const CLEARANCE_COLORS = { none: 'var(--ink-4)', confidential: 'var(--blue)', secret: 'var(--amber)', top_secret: 'var(--red)' };

function utilColor(v) {
  return v > 100 ? 'var(--red)' : v >= 80 ? 'var(--amber)' : 'var(--green)';
}

export function EmployeeProfile() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const employees = useAppStore(s => s.employees);
  const { text, isStreaming, error, getEmployeeInsight } = useAiAnalysis();

  const emp = employees.find(e => e.id === employeeId);
  if (!emp) return <div style={{ padding: 32 }}><p style={{ color: 'var(--ink-3)' }}>Employee not found.</p></div>;

  const skillEntries = Object.entries(emp.skills).sort((a, b) => b[1] - a[1]);

  // Generate 4-week utilization trend
  const weeklyTrend = Array.from({ length: 4 }, (_, i) => ({
    week: `Wk ${i + 1}`,
    util: Math.round(emp.utilizationPercent + (Math.random() - 0.5) * 20),
  }));

  return (
    <div style={{ padding: 24 }}>
      <button onClick={() => navigate('/workforce')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', fontSize: 13, marginBottom: 16 }}>
        <ArrowLeft size={14} aria-hidden="true" /> Back to Workforce
      </button>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Left */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
          {/* Header */}
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: 14, background: CLEARANCE_COLORS[emp.clearanceLevel], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#fff' }}>{emp.initials}</div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700 }}>{emp.name}</h1>
              <p style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>{emp.role} · {emp.department}</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)', color: CLEARANCE_COLORS[emp.clearanceLevel], fontWeight: 600 }}>
                  <Lock size={9} style={{ display: 'inline', marginRight: 4 }} aria-hidden="true" />
                  {CLEARANCE_LABELS[emp.clearanceLevel]}
                </span>
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 10, background: utilColor(emp.utilizationPercent) === 'var(--red)' ? 'var(--red-bg)' : 'var(--green-bg)', border: `1px solid ${utilColor(emp.utilizationPercent) === 'var(--red)' ? 'var(--red-border)' : 'var(--green-border)'}`, color: utilColor(emp.utilizationPercent), fontWeight: 600 }}>
                  {emp.utilizationPercent}% utilization
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { label: 'Utilization', value: `${emp.utilizationPercent}%`, color: utilColor(emp.utilizationPercent) },
              { label: 'Tasks This Week', value: emp.weeklyTaskCount, color: 'var(--ink)' },
              { label: 'Match Score', value: `${emp.avgMatchScore}%`, color: 'var(--blue)' },
              { label: 'On-Time Rate', value: `${emp.onTimeRate}%`, color: emp.onTimeRate >= 90 ? 'var(--green)' : 'var(--amber)' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                <p style={{ fontSize: 22, fontWeight: 700, fontFamily: 'DM Mono', color }}>{value}</p>
                <p style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 2 }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Skills Profile</h2>
            {skillEntries.map(([skill, score]) => (
              <div key={skill} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>{skill}</span>
                  <span style={{ fontSize: 12, fontFamily: 'DM Mono', fontWeight: 600, color: score >= 85 ? 'var(--green)' : score >= 60 ? 'var(--ink-3)' : 'var(--amber)' }}>{score}</span>
                </div>
                <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${score}%`, height: '100%', background: score >= 85 ? 'var(--green)' : score >= 60 ? 'var(--blue)' : 'var(--amber)', borderRadius: 4, transition: 'width 0.6s ease' }} />
                </div>
              </div>
            ))}
          </div>

          {/* AI Insight */}
          <AiAnalysisCard
            text={text} isStreaming={isStreaming} error={error}
            onAnalyze={() => getEmployeeInsight(emp)}
            label="Scheduling Insight"
          />
        </div>

        {/* Right */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24 }}>
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Utilization Trend</h2>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={weeklyTrend}>
                <defs>
                  <linearGradient id="utilGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--blue)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--blue)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'var(--ink-4)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 120]} tick={{ fontSize: 10, fill: 'var(--ink-4)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid var(--border)' }} />
                <Area type="monotone" dataKey="util" stroke="var(--blue)" fill="url(#utilGrad)" strokeWidth={2} animationDuration={500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Current Week Schedule</h2>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => (
              <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontSize: 11, color: 'var(--ink-4)', width: 28 }}>{day}</span>
                <div style={{ flex: 1, height: 24, background: i < emp.weeklyTaskCount ? (i % 2 === 0 ? 'var(--blue-bg)' : 'var(--green-bg)') : 'var(--surface)', borderRadius: 4, border: `1px solid ${i < emp.weeklyTaskCount ? (i % 2 === 0 ? 'var(--blue-border)' : 'var(--green-border)') : 'var(--border)'}`, display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
                  {i < emp.weeklyTaskCount && <span style={{ fontSize: 10, color: i % 2 === 0 ? 'var(--blue)' : 'var(--green)' }}>Task #{1000 + i}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
