import { useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { ShieldCheck, Plus, Pencil, UserX, UserCheck, RefreshCw, RotateCcw, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/appStore';
import { PATTERN_LIBRARY } from '../store/seedData';
import RiskGauge from '../components/shared/RiskGauge';
import { ClearanceBadge, Modal, timeAgo, utilColor } from '../components/shared/ui';

const TABS = [
  { key: 'general', label: 'General', path: '/settings' },
  { key: 'alerts', label: 'Alert Thresholds', path: '/settings/alerts' },
  { key: 'patterns', label: 'Pattern Weights', path: '/settings/patterns' },
  { key: 'team', label: 'Team', path: '/settings/team' },
  { key: 'integrations', label: 'Integrations', path: '/settings/integrations' },
];

const EMPTY_EMP = {
  name: '', role: '', department: 'Field Operations', clearanceLevel: 'none',
  utilizationPercent: 60, onTimeRate: 90, avgMatchScore: 80, weeklyTaskCount: 5, currentStreak: 0,
  skills: { Electrical: 50, HVAC: 50, Plumbing: 50, Inspections: 50, Safety: 50, Equipment: 50 },
  active: true,
};

function SectionCard({ title, sub, children }) {
  return (
    <section className="rounded-card border border-bdr bg-surface-2 p-5">
      <h2 className="font-display text-sm font-bold text-ink">{title}</h2>
      {sub && <p className="mt-0.5 text-xs text-ink-4">{sub}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

// ---------------------------------------------------------------------------

function GeneralTab() {
  const organization = useAppStore((s) => s.organization);
  const settings = useAppStore((s) => s.settings);
  const updateOrganization = useAppStore((s) => s.updateOrganization);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const resetDemoData = useAppStore((s) => s.resetDemoData);
  const [name, setName] = useState(organization?.name || '');

  return (
    <div className="space-y-5">
      <SectionCard title="Organization">
        <div className="grid max-w-xl grid-cols-1 gap-4">
          <div>
            <label htmlFor="org-name" className="text-xs font-medium text-ink-3">Organization name</label>
            <div className="mt-1 flex gap-2">
              <input id="org-name" value={name} onChange={(e) => setName(e.target.value)}
                className="h-10 flex-1 rounded-btn border border-bdr bg-surface px-3 text-sm" />
              <button
                onClick={() => { updateOrganization({ name: name.trim() || organization.name }); toast.success('Organization updated'); }}
                className="h-10 rounded-btn bg-ink px-4 text-sm font-medium text-white hover:bg-ink-2"
              >Save</button>
            </div>
          </div>
          <div>
            <label htmlFor="org-ind" className="text-xs font-medium text-ink-3">Industry</label>
            <select id="org-ind" value={organization?.industry}
              onChange={(e) => { updateOrganization({ industry: e.target.value }); toast.success('Industry updated'); }}
              className="mt-1 h-10 w-full rounded-btn border border-bdr bg-surface px-2 text-sm">
              <option value="defense_contractor">Defense contractor</option>
              <option value="construction">Construction</option>
              <option value="field_service">Field service</option>
              <option value="manufacturing">Manufacturing</option>
            </select>
          </div>
          <div className="flex items-center justify-between rounded-btn border border-blue-border bg-blue-bg px-4 py-3">
            <div>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                <ShieldCheck size={14} className="text-blue" aria-hidden="true" /> FedRAMP Moderate
              </div>
              <p className="mt-0.5 text-xs text-ink-3">Enabled by your authorization. Contact your TrackVia admin to change boundary settings.</p>
            </div>
            <label className="relative inline-flex cursor-not-allowed items-center" title="Managed by authorization — cannot be changed here">
              <input type="checkbox" checked={organization?.fedRampEnabled} disabled readOnly className="peer sr-only" />
              <span className="h-6 w-11 rounded-pill bg-blue opacity-60 after:absolute after:left-[22px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all" />
            </label>
          </div>
          <div>
            <label htmlFor="org-ret" className="text-xs font-medium text-ink-3">Data retention period</label>
            <select id="org-ret" value={settings.dataRetentionDays}
              onChange={(e) => { updateSettings({ dataRetentionDays: Number(e.target.value) }); toast.success('Retention period updated'); }}
              className="mt-1 h-10 w-full rounded-btn border border-bdr bg-surface px-2 text-sm">
              <option value={90}>90 days</option><option value={180}>180 days</option>
              <option value={365}>1 year (default)</option><option value={1095}>3 years (DFARS recommended)</option>
            </select>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Demo data" sub="Restore the original seed data set. All changes in this session will be discarded.">
        <button
          onClick={() => resetDemoData()}
          className="inline-flex h-9 items-center gap-1.5 rounded-btn border border-red-border bg-red-bg px-3.5 text-sm font-medium text-red hover:brightness-95"
        >
          <RotateCcw size={14} aria-hidden="true" /> Reset demo data
        </button>
      </SectionCard>
    </div>
  );
}

// ---------------------------------------------------------------------------

function AlertsTab() {
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const [warning, setWarning] = useState(settings.warningThreshold);
  const [critical, setCritical] = useState(settings.criticalThreshold);
  const [preview, setPreview] = useState(62);
  const dirty = warning !== settings.warningThreshold || critical !== settings.criticalThreshold;
  const invalid = warning >= critical;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <SectionCard title="Thresholds" sub="Signals fire when a project's composite risk score crosses these lines.">
        <div className="space-y-6">
          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor="th-warn" className="text-sm font-medium text-amber">Warning threshold</label>
              <span className="font-mono text-sm text-ink-2">{warning}</span>
            </div>
            <input id="th-warn" type="range" min={20} max={80} value={warning}
              onChange={(e) => setWarning(Number(e.target.value))} className="mt-2 w-full accent-[#C47B00]" />
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor="th-crit" className="text-sm font-medium text-red">Critical threshold</label>
              <span className="font-mono text-sm text-ink-2">{critical}</span>
            </div>
            <input id="th-crit" type="range" min={40} max={95} value={critical}
              onChange={(e) => setCritical(Number(e.target.value))} className="mt-2 w-full accent-[#D93025]" />
          </div>
          {invalid && (
            <p className="rounded-btn border border-red-border bg-red-bg px-3 py-2 text-xs text-red">
              Warning threshold must be lower than the critical threshold.
            </p>
          )}
          <div className="flex gap-2">
            <button
              disabled={!dirty || invalid}
              onClick={() => { updateSettings({ warningThreshold: warning, criticalThreshold: critical }); toast.success('Alert thresholds saved'); }}
              className="h-9 rounded-btn bg-ink px-4 text-sm font-medium text-white hover:bg-ink-2 disabled:opacity-40"
            >Save thresholds</button>
            <button
              disabled={!dirty}
              onClick={() => { setWarning(settings.warningThreshold); setCritical(settings.criticalThreshold); }}
              className="h-9 rounded-btn border border-bdr px-4 text-sm font-medium text-ink-3 hover:text-ink disabled:opacity-40"
            >Discard</button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Live preview" sub="Drag the sample score to see how a project would be tiered under these thresholds.">
        <div className="flex flex-col items-center">
          <RiskGauge score={preview} size={220} warningThreshold={warning} criticalThreshold={critical} />
          <label htmlFor="th-preview" className="mt-3 text-xs text-ink-4">Sample project score: <span className="font-mono text-ink-2">{preview}</span></label>
          <input id="th-preview" type="range" min={0} max={100} value={preview}
            onChange={(e) => setPreview(Number(e.target.value))} className="mt-1 w-full max-w-xs accent-[#0F1923]" />
          <p className="mt-3 text-center font-mono text-xs">
            {preview >= critical ? <span className="text-red">CRITICAL — immediate alert + escalation path</span>
              : preview >= warning ? <span className="text-amber">WARNING — signal raised, actions recommended</span>
              : <span className="text-green">HEALTHY — monitored, no alert</span>}
          </p>
        </div>
      </SectionCard>
    </div>
  );
}

// ---------------------------------------------------------------------------

function PatternsTab() {
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const weights = settings.patternWeights;

  const enabledTotal = useMemo(
    () => Object.values(weights).reduce((a, w) => a + (w.enabled ? w.weight : 0), 0),
    [weights]
  );
  const valid = enabledTotal >= 15 && enabledTotal <= 35;

  const setWeight = (type, patch) => {
    updateSettings({ patternWeights: { ...weights, [type]: { ...weights[type], ...patch } } });
  };

  return (
    <SectionCard
      title="Pattern weights"
      sub="Tune how much each pattern contributes to the composite risk score. Total enabled weight must stay between 15 and 35."
    >
      <div className={`mb-4 rounded-btn border px-3 py-2 font-mono text-xs ${valid ? 'border-green-border bg-green-bg text-green' : 'border-red-border bg-red-bg text-red'}`}>
        Total enabled weight: {enabledTotal} {valid ? '— valid' : '— out of range (15–35)'}
      </div>
      <div className="divide-y divide-bdr">
        {PATTERN_LIBRARY.map((p) => {
          const Icon = Icons[p.icon] || Icons.Activity;
          const w = weights[p.type] || { enabled: true, weight: 3 };
          return (
            <div key={p.type} className="flex flex-wrap items-center gap-3 py-3">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-btn border border-bdr ${w.enabled ? 'bg-surface text-ink-2' : 'bg-surface text-ink-4 opacity-50'}`}>
                <Icon size={15} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className={`text-sm font-medium ${w.enabled ? 'text-ink' : 'text-ink-4'}`}>{p.name}</div>
                <div className="truncate text-xs text-ink-4">{p.description}</div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-ink-3">
                  <span className="sr-only">Weight for {p.name}</span>
                  <input
                    type="range" min={1} max={5} value={w.weight} disabled={!w.enabled}
                    onChange={(e) => setWeight(p.type, { weight: Number(e.target.value) })}
                    className="w-28 accent-[#0F1923] disabled:opacity-40"
                    aria-label={`Weight for ${p.name}`}
                  />
                  <span className="w-4 font-mono text-ink-2">{w.enabled ? w.weight : '—'}</span>
                </label>
                <button
                  role="switch" aria-checked={w.enabled} aria-label={`${w.enabled ? 'Disable' : 'Enable'} ${p.name}`}
                  onClick={() => setWeight(p.type, { enabled: !w.enabled })}
                  className={`relative h-6 w-11 rounded-pill transition-colors ${w.enabled ? 'bg-green' : 'bg-bdr-2'}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${w.enabled ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------

function TeamTab() {
  const employees = useAppStore((s) => s.employees);
  const updateEmployee = useAppStore((s) => s.updateEmployee);
  const addEmployee = useAppStore((s) => s.addEmployee);
  const [editing, setEditing] = useState(null); // employee object or 'new'
  const [form, setForm] = useState(EMPTY_EMP);

  const openEdit = (emp) => {
    setForm(emp ? { ...emp, skills: { ...emp.skills } } : { ...EMPTY_EMP, skills: { ...EMPTY_EMP.skills } });
    setEditing(emp ? emp.id : 'new');
  };

  const save = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.role.trim()) return;
    const initials = form.name.trim().split(/\s+/).map((w) => w[0].toUpperCase()).slice(0, 2).join('');
    if (editing === 'new') {
      addEmployee({ ...form, initials });
      toast.success(`${form.name} added to the team`);
    } else {
      updateEmployee(editing, { ...form, initials });
      toast.success(`${form.name} updated`);
    }
    setEditing(null);
  };

  return (
    <SectionCard title="Team" sub="Add, edit, or deactivate team members. Deactivated members are excluded from scheduling and risk models.">
      <div className="mb-4">
        <button onClick={() => openEdit(null)} className="inline-flex h-9 items-center gap-1.5 rounded-btn bg-ink px-3.5 text-sm font-medium text-white hover:bg-ink-2">
          <Plus size={15} aria-hidden="true" /> Add team member
        </button>
      </div>
      <div className="divide-y divide-bdr">
        {employees.map((e) => (
          <div key={e.id} className={`flex flex-wrap items-center gap-3 py-3 ${e.active ? '' : 'opacity-50'}`}>
            <span className="flex h-9 w-9 items-center justify-center rounded-avatar bg-ink text-[11px] font-bold text-white">{e.initials}</span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-ink">{e.name} {!e.active && <span className="ml-1 text-xs font-normal text-ink-4">(deactivated)</span>}</div>
              <div className="text-xs text-ink-4">{e.role} · {e.department}</div>
            </div>
            <span className={`font-mono text-xs ${utilColor(e.utilizationPercent)}`}>{e.utilizationPercent}%</span>
            <ClearanceBadge level={e.clearanceLevel} />
            <button onClick={() => openEdit(e)} aria-label={`Edit ${e.name}`}
              className="rounded-btn border border-bdr p-2 text-ink-3 hover:border-bdr-2 hover:text-ink">
              <Pencil size={13} aria-hidden="true" />
            </button>
            <button
              onClick={() => { updateEmployee(e.id, { active: !e.active }); toast.success(`${e.name} ${e.active ? 'deactivated' : 'reactivated'}`); }}
              aria-label={`${e.active ? 'Deactivate' : 'Reactivate'} ${e.name}`}
              className={`rounded-btn border p-2 ${e.active ? 'border-red-border text-red hover:bg-red-bg' : 'border-green-border text-green hover:bg-green-bg'}`}
            >
              {e.active ? <UserX size={13} aria-hidden="true" /> : <UserCheck size={13} aria-hidden="true" />}
            </button>
          </div>
        ))}
      </div>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add team member' : 'Edit team member'} width="max-w-2xl">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="emp-name" className="text-xs font-medium text-ink-3">Name</label>
              <input id="emp-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 h-10 w-full rounded-btn border border-bdr bg-surface px-3 text-sm" />
            </div>
            <div>
              <label htmlFor="emp-role" className="text-xs font-medium text-ink-3">Role</label>
              <input id="emp-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="mt-1 h-10 w-full rounded-btn border border-bdr bg-surface px-3 text-sm" />
            </div>
            <div>
              <label htmlFor="emp-dept" className="text-xs font-medium text-ink-3">Department</label>
              <input id="emp-dept" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="mt-1 h-10 w-full rounded-btn border border-bdr bg-surface px-3 text-sm" />
            </div>
            <div>
              <label htmlFor="emp-clear" className="flex items-center gap-1 text-xs font-medium text-ink-3">
                Clearance level <Lock size={10} className="text-ink-4" aria-hidden="true" />
              </label>
              <select id="emp-clear" value={form.clearanceLevel} onChange={(e) => setForm({ ...form, clearanceLevel: e.target.value })}
                className="mt-1 h-10 w-full rounded-btn border border-bdr bg-surface px-2 text-sm">
                <option value="none">None</option><option value="confidential">Confidential</option>
                <option value="secret">Secret</option><option value="top_secret">Top Secret</option>
              </select>
            </div>
            <div>
              <label htmlFor="emp-util" className="text-xs font-medium text-ink-3">Utilization %</label>
              <input id="emp-util" type="number" min={0} max={150} value={form.utilizationPercent}
                onChange={(e) => setForm({ ...form, utilizationPercent: Number(e.target.value) })}
                className="mt-1 h-10 w-full rounded-btn border border-bdr bg-surface px-3 font-mono text-sm" />
            </div>
            <div>
              <label htmlFor="emp-otr" className="text-xs font-medium text-ink-3">On-time rate %</label>
              <input id="emp-otr" type="number" min={0} max={100} value={form.onTimeRate}
                onChange={(e) => setForm({ ...form, onTimeRate: Number(e.target.value) })}
                className="mt-1 h-10 w-full rounded-btn border border-bdr bg-surface px-3 font-mono text-sm" />
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-ink-3">Skills (0–100)</div>
            <div className="mt-2 grid grid-cols-2 gap-x-5 gap-y-2 sm:grid-cols-3">
              {Object.entries(form.skills).map(([skill, score]) => (
                <label key={skill} className="text-xs text-ink-3">
                  {skill} <span className="font-mono text-ink-2">{score}</span>
                  <input type="range" min={0} max={100} value={score}
                    onChange={(e) => setForm({ ...form, skills: { ...form.skills, [skill]: Number(e.target.value) } })}
                    className="mt-1 w-full accent-[#0F1923]" aria-label={`${skill} score`} />
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setEditing(null)} className="h-9 rounded-btn border border-bdr px-3.5 text-sm font-medium text-ink-3 hover:text-ink">Cancel</button>
            <button type="submit" disabled={!form.name.trim() || !form.role.trim()} className="h-9 rounded-btn bg-ink px-3.5 text-sm font-medium text-white hover:bg-ink-2 disabled:opacity-40">
              {editing === 'new' ? 'Add member' : 'Save changes'}
            </button>
          </div>
        </form>
      </Modal>
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------

function IntegrationsTab() {
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const [syncing, setSyncing] = useState(false);
  const integ = settings.integration;

  const resync = () => {
    setSyncing(true);
    setTimeout(() => {
      updateSettings({ integration: { ...integ, connected: true, lastSync: new Date().toISOString() } });
      setSyncing(false);
      toast.success('TrackVia workflows re-synced — 47 patterns refreshed');
    }, 1800);
  };

  return (
    <div className="space-y-5">
      <SectionCard title="TrackVia workflow connector" sub="Signal reads work orders, inspections, approvals, and notes from your TrackVia apps.">
        <div className="flex flex-wrap items-center gap-3 rounded-btn border border-bdr bg-surface px-4 py-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-btn bg-ink font-display text-sm font-bold text-white">TV</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-ink">TrackVia Workflows</span>
              {integ.connected ? (
                <span className="inline-flex items-center gap-1 rounded-badge border border-green-border bg-green-bg px-2 py-0.5 text-[10px] font-semibold uppercase text-green">
                  <span className="h-1.5 w-1.5 rounded-full bg-green" /> Connected
                </span>
              ) : (
                <span className="rounded-badge border border-red-border bg-red-bg px-2 py-0.5 text-[10px] font-semibold uppercase text-red">Disconnected</span>
              )}
            </div>
            <p className="mt-0.5 font-mono text-[11px] text-ink-4">Last sync: {timeAgo(integ.lastSync)}</p>
          </div>
          <button
            onClick={resync} disabled={syncing}
            className="inline-flex h-9 items-center gap-1.5 rounded-btn border border-bdr bg-surface-2 px-3.5 text-sm font-medium text-ink-2 hover:border-bdr-2 disabled:opacity-50"
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} aria-hidden="true" />
            {syncing ? 'Syncing…' : 'Re-sync now'}
          </button>
        </div>
        <ul className="mt-4 grid grid-cols-1 gap-2 text-xs text-ink-3 sm:grid-cols-2">
          {['Work orders & assignments', 'Inspection schedules & outcomes', 'Approval queues & change orders', 'Notes, photos & documentation'].map((s) => (
            <li key={s} className="flex items-center gap-2 rounded-btn border border-bdr bg-surface-2 px-3 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green" aria-hidden="true" /> {s}
            </li>
          ))}
        </ul>
      </SectionCard>

      <div className="flex items-start gap-3 rounded-card border border-blue-border bg-blue-bg px-4 py-3">
        <ShieldCheck size={16} className="mt-0.5 shrink-0 text-blue" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-ink-2">
          <span className="font-semibold">FedRAMP boundary enforcement:</span> the connector operates entirely inside your
          FedRAMP Moderate authorization boundary. Workflow data is processed in-boundary; no records, attachments, or AI
          analysis output transit external systems.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

export default function Settings() {
  const location = useLocation();
  const active = TABS.find((t) => t.path === location.pathname) || TABS[0];

  return (
    <div className="mx-auto max-w-[1000px] p-6">
      <h1 className="font-display text-xl font-bold text-ink">Settings</h1>
      <p className="mt-0.5 text-sm text-ink-3">Organization configuration, alerting, and model tuning</p>

      <div className="mt-5 flex flex-wrap gap-1.5 border-b border-bdr pb-px">
        {TABS.map((t) => (
          <NavLink
            key={t.key}
            to={t.path}
            end
            className={({ isActive }) =>
              `rounded-t-btn border border-b-0 px-3.5 py-2 text-sm font-medium ${
                isActive ? 'border-bdr bg-surface-2 text-ink' : 'border-transparent text-ink-3 hover:text-ink'
              }`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>

      <div className="mt-5">
        {active.key === 'general' && <GeneralTab />}
        {active.key === 'alerts' && <AlertsTab />}
        {active.key === 'patterns' && <PatternsTab />}
        {active.key === 'team' && <TeamTab />}
        {active.key === 'integrations' && <IntegrationsTab />}
      </div>
    </div>
  );
}
