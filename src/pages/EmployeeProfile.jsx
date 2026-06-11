import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Sparkles, Lock, Plus, RefreshCw, AlertCircle, Search, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/appStore';
import { SEED_SCHEDULES, SEED_TASK_HISTORY } from '../store/seedData';
import { useEmployeeInsight } from '../hooks/useAiAnalysis';
import { ClearanceBadge, StatCard, EmptyState, Modal, Skeleton, utilColor, fmtDate } from '../components/shared/ui';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const SKILL_BLOCK_COLORS = {
  Electrical: 'bg-blue-bg border-blue-border text-blue',
  HVAC: 'bg-amber-bg border-amber-border text-amber',
  Plumbing: 'bg-green-bg border-green-border text-green',
  Inspections: 'bg-red-bg border-red-border text-red',
  Safety: 'bg-surface border-bdr-2 text-ink-2',
  Equipment: 'bg-blue-bg border-blue-border text-blue',
};

function useUtilTrend(emp) {
  return useMemo(() => {
    if (!emp) return [];
    let seed = 0;
    for (const ch of emp.id) seed = (seed * 31 + ch.charCodeAt(0)) % 9973;
    const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    return [4, 3, 2, 1].map((w) => ({
      week: `Wk -${w}`,
      utilization: Math.max(35, Math.min(118, Math.round(emp.utilizationPercent + (rand() - 0.55) * 22 * (w / 2)))),
    })).concat([{ week: 'Now', utilization: emp.utilizationPercent }]);
  }, [emp]);
}

export default function EmployeeProfile() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const employee = useAppStore((s) => s.employees.find((e) => e.id === employeeId));
  const employees = useAppStore((s) => s.employees);

  const taskHistory = SEED_TASK_HISTORY[employeeId] || [];
  const schedule = SEED_SCHEDULES[employeeId] || DAYS.map(() => ['Open']);
  const team = employees.filter((e) => e.active && e.id !== employeeId);
  const { insight, loading, error, regenerate } = useEmployeeInsight(employee, taskHistory, team);
  const trend = useUtilTrend(employee);

  const [skillsAnimated, setSkillsAnimated] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({ name: '', day: 'Mon', skill: 'Electrical' });

  useEffect(() => {
    const t = setTimeout(() => setSkillsAnimated(true), 80);
    return () => clearTimeout(t);
  }, [employeeId]);

  if (!employee) {
    return (
      <div className="p-6">
        <EmptyState icon={Search} iconClass="text-ink-4" title="Employee not found"
          message="This profile may have been removed or deactivated."
          action={<Link to="/workforce" className="rounded-btn bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink-2">Back to Workforce</Link>} />
      </div>
    );
  }

  // Percentile rank of each skill vs team
  const percentile = (skill, score) => {
    const all = employees.filter((e) => e.active).map((e) => e.skills[skill] ?? 0);
    const below = all.filter((v) => v < score).length;
    return Math.round((below / Math.max(all.length - 1, 1)) * 100);
  };

  const submitAssign = (e) => {
    e.preventDefault();
    if (!taskForm.name.trim()) return;
    toast.success(`Task "${taskForm.name}" assigned to ${employee.name} (${taskForm.day})`);
    setTaskForm({ name: '', day: 'Mon', skill: 'Electrical' });
    setAssignOpen(false);
  };

  return (
    <div className="mx-auto max-w-[1200px] p-6">
      <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-1.5 rounded-btn px-2 py-1 text-sm text-ink-3 hover:bg-surface-2 hover:text-ink">
        <ArrowLeft size={15} aria-hidden="true" /> Back
      </button>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[13fr_7fr]">
        {/* ---------- Left 65% ---------- */}
        <div className="min-w-0 space-y-5">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-4 rounded-card border border-bdr bg-surface-2 p-5">
            <span className="flex h-16 w-16 items-center justify-center rounded-avatar bg-ink font-display text-xl font-bold text-white">
              {employee.initials}
            </span>
            <div className="min-w-0">
              <h1 className="font-display text-xl font-bold text-ink">{employee.name}</h1>
              <p className="text-sm text-ink-3">{employee.role} · {employee.department}</p>
            </div>
            <div className="ml-auto"><ClearanceBadge level={employee.clearanceLevel} /></div>
          </div>

          {/* Skills */}
          <section className="rounded-card border border-bdr bg-surface-2 p-5">
            <h2 className="font-display text-sm font-bold text-ink">Skills profile</h2>
            <p className="mt-0.5 text-xs text-ink-4">Score 0–100 with percentile rank vs team</p>
            <div className="mt-4 space-y-3">
              {Object.entries(employee.skills).map(([skill, score]) => (
                <div key={skill}>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="font-medium text-ink-2">{skill}</span>
                    <span className="font-mono text-ink-4">{score} · {percentile(skill, score)}th pctile</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-pill bg-surface">
                    <div
                      className={`h-full rounded-pill transition-all duration-700 ease-out ${score >= 85 ? 'bg-green' : score >= 60 ? 'bg-blue' : 'bg-amber'}`}
                      style={{ width: skillsAnimated ? `${score}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Utilization" value={`${employee.utilizationPercent}%`} valueClass={utilColor(employee.utilizationPercent)} sub={employee.utilizationPercent > 100 ? 'Over capacity' : 'Of weekly capacity'} />
            <StatCard label="Tasks this week" value={employee.weeklyTaskCount} sub={`Streak: ${employee.currentStreak} on-time`} />
            <StatCard label="Avg match score" value={employee.avgMatchScore} valueClass="text-blue" sub="Skill-to-task fit" />
            <StatCard label="On-time rate" value={`${employee.onTimeRate}%`} valueClass={employee.onTimeRate >= 90 ? 'text-green' : 'text-amber'} sub="Trailing 90 days" />
          </div>

          {/* AI insight */}
          <section className="rounded-card border border-blue-border bg-blue-bg/50 p-5">
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-blue" aria-hidden="true" />
              <h2 className="font-display text-sm font-bold text-ink">Signal scheduling insight</h2>
              <Lock size={11} className="text-ink-4" aria-hidden="true" />
              <button
                onClick={regenerate}
                disabled={loading}
                aria-label="Regenerate insight"
                className="ml-auto rounded-btn p-1.5 text-ink-4 hover:bg-surface-2 hover:text-ink disabled:opacity-40"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
              </button>
            </div>
            {loading ? (
              <div className="mt-3 space-y-2">
                <Skeleton className="h-3.5 w-full" /><Skeleton className="h-3.5 w-11/12" /><Skeleton className="h-3.5 w-4/5" />
              </div>
            ) : error ? (
              <div className="mt-3 flex items-start gap-2 rounded-btn border border-red-border bg-red-bg px-3 py-2.5">
                <AlertCircle size={14} className="mt-0.5 shrink-0 text-red" aria-hidden="true" />
                <div className="text-xs text-ink-2">
                  Couldn&rsquo;t generate the insight. {' '}
                  <button onClick={regenerate} className="font-semibold text-red underline">Try again</button>
                </div>
              </div>
            ) : (
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-2">{insight}</p>
            )}
          </section>

          {/* Task history */}
          <section className="rounded-card border border-bdr bg-surface-2 p-5">
            <h2 className="font-display text-sm font-bold text-ink">Recent task history</h2>
            {taskHistory.length === 0 ? (
              <p className="mt-3 text-xs text-ink-4">No completed tasks on record yet.</p>
            ) : (
              <ul className="mt-3 divide-y divide-bdr">
                {taskHistory.map((t, i) => (
                  <li key={i} className="flex items-center gap-3 py-2.5">
                    <span className={`w-12 shrink-0 rounded-badge border px-1.5 py-0.5 text-center font-mono text-xs font-medium ${
                      t.outcome >= 90 ? 'border-green-border bg-green-bg text-green'
                        : t.outcome >= 75 ? 'border-bdr bg-surface text-ink-2'
                        : 'border-amber-border bg-amber-bg text-amber'
                    }`}>{t.outcome}</span>
                    <span className="min-w-0 flex-1 truncate text-sm text-ink-2">{t.task}</span>
                    <span className="shrink-0 font-mono text-[11px] text-ink-4">{fmtDate(t.date)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* ---------- Right 35% ---------- */}
        <div className="min-w-0 space-y-5">
          {/* Week schedule */}
          <section className="rounded-card border border-bdr bg-surface-2 p-5">
            <h2 className="font-display text-sm font-bold text-ink">This week</h2>
            <div className="mt-3 space-y-2">
              {DAYS.map((day, i) => {
                const [task, skill] = schedule[i] || ['Open'];
                const open = task === 'Open';
                return (
                  <div key={day} className="flex items-center gap-2.5">
                    <span className="w-9 shrink-0 font-mono text-[11px] text-ink-4">{day}</span>
                    <div className={`min-w-0 flex-1 truncate rounded-btn border px-2.5 py-1.5 text-xs font-medium ${
                      open ? 'border-dashed border-bdr-2 bg-surface text-ink-4' : SKILL_BLOCK_COLORS[skill] || 'bg-surface border-bdr text-ink-2'
                    }`}>
                      {task}{!open && <span className="ml-1.5 font-normal opacity-70">· {skill}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setAssignOpen(true)}
              className="mt-4 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-btn bg-ink text-sm font-medium text-white hover:bg-ink-2"
            >
              <Plus size={15} aria-hidden="true" /> Assign task
            </button>
          </section>

          {/* Utilization trend */}
          <section className="rounded-card border border-bdr bg-surface-2 p-5">
            <h2 className="font-display text-sm font-bold text-ink">Utilization — last 4 weeks</h2>
            <div className="mt-3 h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 6, right: 4, left: -22, bottom: 0 }}>
                  <defs>
                    <linearGradient id="utilGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1155CC" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#1155CC" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#7A9AB0' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 120]} tick={{ fontSize: 10, fill: '#7A9AB0' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v) => [`${v}%`, 'Utilization']}
                    contentStyle={{ borderRadius: 7, border: '1px solid #DCE4EC', fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="utilization" stroke="#1155CC" strokeWidth={2} fill="url(#utilGrad)" animationDuration={300} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Clearance / certs */}
          <section className="rounded-card border border-bdr bg-surface-2 p-5">
            <h2 className="flex items-center gap-1.5 font-display text-sm font-bold text-ink">
              Clearance &amp; certifications <Lock size={12} className="text-ink-4" aria-hidden="true" />
            </h2>
            <div className="mt-3 space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-4">Clearance level</span>
                <ClearanceBadge level={employee.clearanceLevel} />
              </div>
              {[['OSHA 30', 'Current'], ['Site Access — Fort Meade', employee.clearanceLevel === 'none' ? 'Not eligible' : 'Granted'], ['CPR / First Aid', 'Current']].map(([cert, status]) => (
                <div key={cert} className="flex items-center justify-between border-t border-bdr pt-2.5">
                  <span className="flex items-center gap-1.5 text-ink-2"><ShieldCheck size={13} className="text-blue" aria-hidden="true" /> {cert}</span>
                  <span className={`font-mono text-[11px] ${status === 'Not eligible' ? 'text-ink-4' : 'text-green'}`}>{status}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <Modal open={assignOpen} onClose={() => setAssignOpen(false)} title={`Assign task — ${employee.name}`}>
        <form onSubmit={submitAssign} className="space-y-3">
          <div>
            <label htmlFor="at-name" className="text-xs font-medium text-ink-3">Task description</label>
            <input id="at-name" value={taskForm.name} onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })}
              className="mt-1 h-10 w-full rounded-btn border border-bdr bg-surface px-3 text-sm" placeholder="e.g. Panel inspection — Bldg B" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="at-day" className="text-xs font-medium text-ink-3">Day</label>
              <select id="at-day" value={taskForm.day} onChange={(e) => setTaskForm({ ...taskForm, day: e.target.value })}
                className="mt-1 h-10 w-full rounded-btn border border-bdr bg-surface px-2 text-sm">
                {DAYS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="at-skill" className="text-xs font-medium text-ink-3">Skill area</label>
              <select id="at-skill" value={taskForm.skill} onChange={(e) => setTaskForm({ ...taskForm, skill: e.target.value })}
                className="mt-1 h-10 w-full rounded-btn border border-bdr bg-surface px-2 text-sm">
                {Object.keys(employee.skills).map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          {employee.skills[taskForm.skill] < 60 && (
            <p className="rounded-btn border border-amber-border bg-amber-bg px-3 py-2 text-xs text-amber">
              Match alert: {employee.name}&rsquo;s {taskForm.skill} score is {employee.skills[taskForm.skill]} — this assignment may trigger a skill–task mismatch signal.
            </p>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setAssignOpen(false)} className="h-9 rounded-btn border border-bdr px-3.5 text-sm font-medium text-ink-3 hover:text-ink">Cancel</button>
            <button type="submit" disabled={!taskForm.name.trim()} className="h-9 rounded-btn bg-ink px-3.5 text-sm font-medium text-white hover:bg-ink-2 disabled:opacity-40">Assign</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
