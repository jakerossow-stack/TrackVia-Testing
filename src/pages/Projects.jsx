import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, TrendingUp, TrendingDown, Minus, FolderKanban, MapPin } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { StatusChip, EmptyState, Modal, fmtDate } from '../components/shared/ui';

const FRAMEWORK_LABEL = { dfars: 'DFARS', cmmc: 'CMMC', osha: 'OSHA', none: '—' };

function TrendIcon({ trend }) {
  if (trend === 'rising') return <TrendingUp size={14} className="text-red" aria-hidden="true" />;
  if (trend === 'falling') return <TrendingDown size={14} className="text-green" aria-hidden="true" />;
  return <Minus size={14} className="text-ink-4" aria-hidden="true" />;
}

const scoreColor = (s, settings) =>
  s >= settings.criticalThreshold ? 'text-red' : s >= settings.warningThreshold ? 'text-amber' : 'text-green';

export default function Projects() {
  const projects = useAppStore((s) => s.projects);
  const employees = useAppStore((s) => s.employees);
  const settings = useAppStore((s) => s.settings);
  const addProject = useAppStore((s) => s.addProject);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', location: '', complianceFramework: 'none', projectManager: 'emp_4' });

  const sorted = [...projects].sort((a, b) => b.riskScore - a.riskScore);

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const today = new Date();
    const end = new Date(today); end.setDate(end.getDate() + 90);
    addProject({
      name: form.name.trim(),
      location: form.location.trim() || 'TBD',
      complianceFramework: form.complianceFramework,
      projectManager: form.projectManager,
      status: 'on_track',
      riskScore: 12,
      riskTrend: 'stable',
      activeSignalCount: 0,
      startDate: today.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
      signalHistory: [{ date: today.toISOString().slice(0, 10), riskScore: 12, triggerType: null, note: 'Project created — baseline established' }],
    });
    setForm({ name: '', location: '', complianceFramework: 'none', projectManager: 'emp_4' });
    setOpen(false);
  };

  return (
    <div className="mx-auto max-w-[1200px] p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-ink">Projects</h1>
          <p className="mt-0.5 text-sm text-ink-3">{projects.length} monitored projects · risk scored continuously</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex h-9 items-center gap-1.5 rounded-btn bg-ink px-3.5 text-sm font-medium text-white hover:bg-ink-2"
        >
          <Plus size={15} aria-hidden="true" /> New project
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={FolderKanban}
            iconClass="text-ink-4"
            title="No projects yet"
            message="Create your first project and Signal will begin monitoring its behavioral patterns."
            action={
              <button onClick={() => setOpen(true)} className="rounded-btn bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink-2">
                New project
              </button>
            }
          />
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          {sorted.map((p) => {
            const pm = employees.find((e) => e.id === p.projectManager);
            return (
              <Link
                key={p.id}
                to={`/projects/${p.id}`}
                className="group rounded-card border border-bdr bg-surface-2 p-5 transition-colors hover:border-bdr-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-[15px] font-bold text-ink group-hover:underline">{p.name}</h2>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-ink-4">
                      <MapPin size={11} aria-hidden="true" /> {p.location}
                    </div>
                  </div>
                  <StatusChip status={p.status} />
                </div>

                <div className="mt-4 flex items-end justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-ink-4">Risk score</div>
                    <div className={`flex items-center gap-1.5 font-mono text-2xl font-medium ${scoreColor(p.riskScore, settings)}`}>
                      {p.riskScore}
                      <TrendIcon trend={p.riskTrend} />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wide text-ink-4">Active signals</div>
                    <div className={`font-mono text-2xl font-medium ${p.activeSignalCount > 0 ? 'text-amber' : 'text-green'}`}>
                      {p.activeSignalCount}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wide text-ink-4">Framework</div>
                    <div className="font-mono text-sm text-ink-2">{FRAMEWORK_LABEL[p.complianceFramework]}</div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-bdr pt-3 text-xs text-ink-4">
                  <span>PM: <span className="text-ink-3">{pm?.name || '—'}</span></span>
                  <span className="font-mono">{fmtDate(p.startDate)} → {fmtDate(p.endDate)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New project">
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label htmlFor="np-name" className="text-xs font-medium text-ink-3">Project name</label>
            <input id="np-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 h-10 w-full rounded-btn border border-bdr bg-surface px-3 text-sm" placeholder="e.g. Building D Retrofit" />
          </div>
          <div>
            <label htmlFor="np-loc" className="text-xs font-medium text-ink-3">Location</label>
            <input id="np-loc" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="mt-1 h-10 w-full rounded-btn border border-bdr bg-surface px-3 text-sm" placeholder="e.g. Columbia, MD" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="np-fw" className="text-xs font-medium text-ink-3">Compliance framework</label>
              <select id="np-fw" value={form.complianceFramework} onChange={(e) => setForm({ ...form, complianceFramework: e.target.value })}
                className="mt-1 h-10 w-full rounded-btn border border-bdr bg-surface px-2 text-sm">
                <option value="none">None</option><option value="dfars">DFARS</option>
                <option value="cmmc">CMMC</option><option value="osha">OSHA</option>
              </select>
            </div>
            <div>
              <label htmlFor="np-pm" className="text-xs font-medium text-ink-3">Project manager</label>
              <select id="np-pm" value={form.projectManager} onChange={(e) => setForm({ ...form, projectManager: e.target.value })}
                className="mt-1 h-10 w-full rounded-btn border border-bdr bg-surface px-2 text-sm">
                {employees.filter((e) => e.active).map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="h-9 rounded-btn border border-bdr px-3.5 text-sm font-medium text-ink-3 hover:text-ink">Cancel</button>
            <button type="submit" disabled={!form.name.trim()} className="h-9 rounded-btn bg-ink px-3.5 text-sm font-medium text-white hover:bg-ink-2 disabled:opacity-40">Create project</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
