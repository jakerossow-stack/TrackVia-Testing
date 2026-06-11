import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useAppStore, severityRank } from '../store/appStore';
import { SignalCard } from '../components/shared/SignalCard';
import { EmptyState } from '../components/shared/ui';
import { PATTERN_LIBRARY } from '../store/seedData';

const SORTS = {
  severity: { label: 'By severity', fn: (a, b) => severityRank[a.severity] - severityRank[b.severity] },
  confidence: { label: 'By confidence', fn: (a, b) => b.confidencePercent - a.confidencePercent },
  detected: { label: 'By time detected', fn: (a, b) => new Date(b.detectedAt) - new Date(a.detectedAt) },
  incident: {
    label: 'By time to incident',
    fn: (a, b) => (parseInt(a.estimatedTimeToIncident) || 99) - (parseInt(b.estimatedTimeToIncident) || 99),
  },
};

function Select({ label, value, onChange, options }) {
  return (
    <label className="flex items-center gap-1.5 text-[11px] font-medium text-ink-3">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-btn border border-bdr bg-surface-2 px-2 py-1.5 text-[11px] text-ink-2"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
    </label>
  );
}

export default function SignalFeed() {
  const [params] = useSearchParams();
  const { signals, projects } = useAppStore();
  const [severity, setSeverity] = useState('all');
  const [status, setStatus] = useState(params.get('status') || 'active');
  const [project, setProject] = useState('all');
  const [pattern, setPattern] = useState(params.get('pattern') || 'all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sort, setSort] = useState('severity');

  const filtered = useMemo(() => {
    return signals
      .filter((s) => (severity === 'all' ? true : s.severity === severity))
      .filter((s) => (status === 'all' ? true : s.status === status))
      .filter((s) => (project === 'all' ? true : s.projectId === project))
      .filter((s) => (pattern === 'all' ? true : s.patternType === pattern))
      .filter((s) => (!from ? true : new Date(s.detectedAt) >= new Date(from)))
      .filter((s) => (!to ? true : new Date(s.detectedAt) <= new Date(to + 'T23:59:59')))
      .sort(SORTS[sort].fn);
  }, [signals, severity, status, project, pattern, from, to, sort]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-base font-bold text-ink">Signal feed</h1>
        <Select label="Sort" value={sort} onChange={setSort} options={Object.entries(SORTS).map(([k, v]) => [k, v.label])} />
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-card border border-bdr bg-surface-2 p-3">
        <Select label="Severity" value={severity} onChange={setSeverity} options={[['all', 'All'], ['critical', 'Critical'], ['warning', 'Warning'], ['watch', 'Watch']]} />
        <Select label="Status" value={status} onChange={setStatus} options={[['all', 'All'], ['active', 'Active'], ['dismissed', 'Dismissed'], ['resolved', 'Resolved'], ['escalated', 'Escalated']]} />
        <Select label="Project" value={project} onChange={setProject} options={[['all', 'All projects'], ...projects.map((p) => [p.id, p.name])]} />
        <Select label="Pattern" value={pattern} onChange={setPattern} options={[['all', 'All patterns'], ...PATTERN_LIBRARY.map((p) => [p.type, p.name])]} />
        <label className="flex items-center gap-1.5 text-[11px] font-medium text-ink-3">
          From
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-btn border border-bdr bg-surface-2 px-2 py-1 font-mono text-[11px] text-ink-2" />
        </label>
        <label className="flex items-center gap-1.5 text-[11px] font-medium text-ink-3">
          To
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-btn border border-bdr bg-surface-2 px-2 py-1 font-mono text-[11px] text-ink-2" />
        </label>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No active signals matching your filters"
          message="Operations look healthy. Signal keeps monitoring all 9 behavioral patterns and will surface anything that crosses a detection threshold."
          action={
            <button
              onClick={() => { setSeverity('all'); setStatus('all'); setProject('all'); setPattern('all'); setFrom(''); setTo(''); }}
              className="rounded-btn border border-bdr bg-surface-2 px-3 py-1.5 text-xs font-semibold text-ink-2 hover:bg-surface"
            >
              Clear filters
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((sig) => (
            <SignalCard key={sig.id} signal={sig} />
          ))}
        </div>
      )}
    </div>
  );
}
