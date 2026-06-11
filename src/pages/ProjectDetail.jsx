import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, CalendarDays, ShieldCheck, Search, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { SEED_PREDICTIONS, PATTERN_META } from '../store/seedData';
import RiskGauge from '../components/shared/RiskGauge';
import RiskTimeline from '../components/charts/RiskTimeline';
import { SignalCard } from '../components/shared/SignalCard';
import { StatusChip, EmployeeChip, EmptyState, StatCard, fmtDate, fmtDateTime } from '../components/shared/ui';

const FRAMEWORK_LABEL = { dfars: 'DFARS 252.204-7012', cmmc: 'CMMC Level 2', osha: 'OSHA', none: 'No framework' };

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = useAppStore((s) => s.projects.find((p) => p.id === id));
  const signals = useAppStore((s) => s.signals.filter((x) => x.projectId === id));
  const employees = useAppStore((s) => s.employees);
  const selectSignal = useAppStore((s) => s.selectSignal);

  if (!project) {
    return (
      <div className="p-6">
        <EmptyState icon={Search} iconClass="text-ink-4" title="Project not found"
          message="This project may have been removed, or the link is out of date."
          action={<Link to="/projects" className="rounded-btn bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink-2">Back to Projects</Link>} />
      </div>
    );
  }

  const pm = employees.find((e) => e.id === project.projectManager);
  const active = signals.filter((s) => s.status === 'active');
  const past = signals.filter((s) => s.status !== 'active');
  const predictions = SEED_PREDICTIONS.filter((p) => p.projectId === id);

  return (
    <div className="mx-auto max-w-[1200px] p-6">
      <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-1.5 rounded-btn px-2 py-1 text-sm text-ink-3 hover:bg-surface-2 hover:text-ink">
        <ArrowLeft size={15} aria-hidden="true" /> Back
      </button>

      {/* Header */}
      <div className="rounded-card border border-bdr bg-surface-2 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-xl font-bold text-ink">{project.name}</h1>
              <StatusChip status={project.status} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-4">
              <span className="inline-flex items-center gap-1"><MapPin size={11} aria-hidden="true" /> {project.location}</span>
              <span className="inline-flex items-center gap-1 font-mono"><CalendarDays size={11} aria-hidden="true" /> {fmtDate(project.startDate)} → {fmtDate(project.endDate)}</span>
              <span className="inline-flex items-center gap-1"><ShieldCheck size={11} aria-hidden="true" /> {FRAMEWORK_LABEL[project.complianceFramework]}</span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-ink-3">
              Project manager: {pm ? <EmployeeChip employeeId={pm.id} /> : '—'}
            </div>
          </div>
          <div className="shrink-0">
            <RiskGauge score={project.riskScore} size={190} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Risk score" value={project.riskScore} valueClass={project.riskScore >= 70 ? 'text-red' : project.riskScore >= 50 ? 'text-amber' : 'text-green'} sub={`Trend: ${project.riskTrend}`} />
        <StatCard label="Active signals" value={active.length} valueClass={active.length > 0 ? 'text-amber' : 'text-green'} sub={`${past.length} resolved/dismissed`} />
        <StatCard label="Predictions made" value={predictions.length} sub="On this project to date" />
        <StatCard
          label="Cost avoided"
          value={`$${predictions.reduce((a, p) => a + (p.costAvoided || 0), 0).toLocaleString()}`}
          valueClass="text-green"
          sub="From correct predictions"
        />
      </div>

      {/* Timeline */}
      <section className="mt-5 rounded-card border border-bdr bg-surface-2 p-5">
        <h2 className="font-display text-sm font-bold text-ink">Behavioral signal timeline</h2>
        <p className="mt-0.5 text-xs text-ink-4">Daily composite risk score with detected pattern events</p>
        <div className="mt-3">
          <RiskTimeline project={project} height={280} onSelectEvent={(sigId) => { if (sigId) { selectSignal(sigId); navigate(`/signals/${sigId}`); } }} />
        </div>
      </section>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Signals */}
        <section>
          <h2 className="font-display text-sm font-bold text-ink">Signals on this project</h2>
          {signals.length === 0 ? (
            <div className="mt-3">
              <EmptyState title="No signals detected" message="Signal hasn't detected any risk patterns on this project. Monitoring continues 24/7." />
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {[...active, ...past].map((s) => <SignalCard key={s.id} signal={s} />)}
            </div>
          )}
        </section>

        {/* Prediction history */}
        <section>
          <h2 className="font-display text-sm font-bold text-ink">Prediction history</h2>
          {predictions.length === 0 ? (
            <div className="mt-3">
              <EmptyState icon={Clock} iconClass="text-ink-4" title="No predictions yet"
                message="Once Signal makes calls on this project, their outcomes will be tracked here." />
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {predictions.map((p) => {
                const ok = p.correct === true; const miss = p.correct === false;
                return (
                  <div key={p.id} className={`rounded-card border p-4 ${ok ? 'border-green-border bg-green-bg/40' : miss ? 'border-red-border bg-red-bg/40' : 'border-bdr bg-surface-2'}`}>
                    <div className="flex items-center gap-2">
                      {ok ? <CheckCircle2 size={15} className="text-green" aria-hidden="true" />
                        : miss ? <XCircle size={15} className="text-red" aria-hidden="true" />
                        : <Clock size={15} className="text-amber" aria-hidden="true" />}
                      <span className="text-xs font-semibold uppercase tracking-wide text-ink-3">
                        {ok ? 'Correct prediction' : miss ? 'Missed' : 'Pending'}
                      </span>
                      <span className="ml-auto font-mono text-[10px] text-ink-4">{fmtDateTime(p.predictedAt)}</span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-ink-2">{p.predictedOutcome}</p>
                    <p className="mt-1 text-xs leading-relaxed text-ink-3">{p.actualOutcome}</p>
                    <div className="mt-2 flex items-center gap-3 font-mono text-[10px] text-ink-4">
                      <span>{PATTERN_META[p.patternType]?.name}</span>
                      <span>lead time {p.leadTimeDays}d</span>
                      {p.costAvoided > 0 && <span className="text-green">${p.costAvoided.toLocaleString()} avoided</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
