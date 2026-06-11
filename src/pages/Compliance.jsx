import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { ShieldCheck, Download, FileText, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/appStore';
import { SEED_COMPLIANCE_EVENTS } from '../store/seedData';
import { StatusChip, fmtDate } from '../components/shared/ui';

const STATUS_DOT = { compliant: '#1A7A4A', finding: '#D93025', corrected: '#1155CC', pending: '#C47B00' };
const FRAMEWORKS = [
  { key: 'dfars', label: 'DFARS 252.204-7012' },
  { key: 'cmmc', label: 'CMMC Level 2' },
  { key: 'osha', label: 'OSHA' },
];

export default function Compliance() {
  const organization = useAppStore((s) => s.organization);
  const events = SEED_COMPLIANCE_EVENTS;

  const score = useMemo(() => {
    const weights = { compliant: 1, corrected: 0.9, pending: 0.6, finding: 0 };
    const total = events.reduce((a, e) => a + (weights[e.status] ?? 0), 0);
    return Math.round((total / events.length) * 100);
  }, [events]);
  const scoreClass = score >= 90 ? 'text-green' : score >= 75 ? 'text-amber' : 'text-red';

  const timelineData = useMemo(
    () =>
      events.map((e) => ({
        ...e,
        ts: new Date(e.date).getTime(),
        y: e.framework === 'dfars' ? 3 : e.framework === 'cmmc' ? 2 : 1,
      })),
    [events]
  );

  const frameworkStatus = (key) => {
    const fw = events.filter((e) => e.framework === key);
    if (fw.some((e) => e.status === 'finding')) return 'finding';
    if (fw.some((e) => e.status === 'pending')) return 'pending';
    return 'compliant';
  };

  const exportReport = () => {
    const compliant = events.filter((e) => e.status === 'compliant' || e.status === 'corrected');
    const lines = [
      'TRACKVIA SIGNAL — DFARS COMPLIANCE EXPORT',
      `Organization: ${organization?.name}`,
      `Generated: ${new Date().toISOString()}`,
      `Compliance score: ${score}%`,
      'All data processed within FedRAMP Moderate authorization boundary.',
      '',
      'COMPLIANT / CORRECTED ITEMS',
      '---------------------------',
      ...compliant.map((e) => `${fmtDate(e.date)} | ${e.framework.toUpperCase()} | ${e.type} | ${e.description} | ${e.status.toUpperCase()}`),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dfars-report-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('DFARS report exported');
  };

  return (
    <div className="mx-auto max-w-[1100px] p-6">
      {/* FedRAMP boundary notice */}
      <div className="flex items-start gap-3 rounded-card border border-blue-border bg-blue-bg px-4 py-3">
        <ShieldCheck size={18} className="mt-0.5 shrink-0 text-blue" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-ink">All data processed within FedRAMP Moderate authorization boundary</p>
          <p className="mt-0.5 text-xs text-ink-3">
            Compliance records, AI analysis, and linked signal data never leave the authorized environment. Audit trail retained per DFARS 252.204-7012.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-ink">Compliance Log</h1>
          <p className="mt-0.5 text-sm text-ink-3">DFARS / CMMC / OSHA events for {organization?.name}</p>
        </div>
        <button
          onClick={exportReport}
          className="inline-flex h-9 items-center gap-1.5 rounded-btn bg-ink px-3.5 text-sm font-medium text-white hover:bg-ink-2"
        >
          <Download size={15} aria-hidden="true" /> Export DFARS report
        </button>
      </div>

      {/* Score card */}
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_2fr]">
        <div className="rounded-card border border-bdr bg-surface-2 p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-ink-4">Compliance score</div>
          <div className={`mt-1 font-mono text-5xl font-medium ${scoreClass}`}>{score}%</div>
          <p className="mt-1.5 text-xs text-ink-4">Weighted across {events.length} events, trailing 12 months</p>
        </div>
        <div className="rounded-card border border-bdr bg-surface-2 p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-ink-4">Framework status</div>
          <div className="mt-3 space-y-2.5">
            {FRAMEWORKS.map((f) => (
              <div key={f.key} className="flex items-center justify-between border-b border-bdr pb-2.5 last:border-0 last:pb-0">
                <span className="flex items-center gap-1.5 text-sm text-ink-2">
                  <Lock size={12} className="text-ink-4" aria-hidden="true" /> {f.label}
                </span>
                <StatusChip status={frameworkStatus(f.key)} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <section className="mt-5 rounded-card border border-bdr bg-surface-2 p-5">
        <h2 className="font-display text-sm font-bold text-ink">Compliance events — last 12 months</h2>
        <div className="mt-3 h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 16, left: -8, bottom: 0 }}>
              <XAxis
                dataKey="ts" type="number" domain={['dataMin - 1000000000', 'dataMax + 1000000000']}
                tickFormatter={(ts) => new Date(ts).toLocaleDateString(undefined, { month: 'short' })}
                tick={{ fontSize: 10, fill: '#7A9AB0' }} axisLine={{ stroke: '#DCE4EC' }} tickLine={false}
              />
              <YAxis
                dataKey="y" type="number" domain={[0.5, 3.5]} ticks={[1, 2, 3]}
                tickFormatter={(v) => (v === 3 ? 'DFARS' : v === 2 ? 'CMMC' : 'OSHA')}
                tick={{ fontSize: 10, fill: '#7A9AB0' }} axisLine={false} tickLine={false} width={48}
              />
              <ZAxis range={[90, 90]} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ payload }) => {
                  const d = payload?.[0]?.payload;
                  if (!d) return null;
                  return (
                    <div className="rounded-btn border border-bdr bg-surface-2 px-3 py-2 text-xs shadow-modal">
                      <div className="font-mono text-[10px] text-ink-4">{fmtDate(d.date)} · {d.type}</div>
                      <div className="mt-0.5 max-w-[240px] font-medium text-ink-2">{d.description}</div>
                    </div>
                  );
                }}
              />
              <Scatter data={timelineData} animationDuration={300} shape={(props) => (
                <circle cx={props.cx} cy={props.cy} r={6} fill={STATUS_DOT[props.payload.status]} stroke="#FFFFFF" strokeWidth={1.5} />
              )} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-4 text-[11px] text-ink-4">
          {Object.entries(STATUS_DOT).map(([k, c]) => (
            <span key={k} className="inline-flex items-center gap-1.5 capitalize">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} /> {k}
            </span>
          ))}
        </div>
      </section>

      {/* Log table */}
      <section className="mt-5 overflow-hidden rounded-card border border-bdr bg-surface-2">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-bdr bg-surface text-left">
                {['Date', 'Type', 'Description', 'Status', 'Linked signal', 'Docs'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-ink-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...events].sort((a, b) => new Date(b.date) - new Date(a.date)).map((e) => (
                <tr key={e.id} className="border-b border-bdr last:border-0 hover:bg-surface">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-ink-3">{fmtDate(e.date)}</td>
                  <td className="px-4 py-3 text-ink-2">{e.type}</td>
                  <td className="px-4 py-3 text-ink-2">{e.description}</td>
                  <td className="px-4 py-3"><StatusChip status={e.status} /></td>
                  <td className="px-4 py-3">
                    {e.linkedSignalId?.startsWith('sig_') ? (
                      <Link to={`/signals/${e.linkedSignalId}`} className="font-mono text-xs text-blue hover:underline">{e.linkedSignalId}</Link>
                    ) : e.linkedSignalId ? (
                      <span className="font-mono text-xs text-ink-4">{e.linkedSignalId}</span>
                    ) : (
                      <span className="text-xs text-ink-4">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toast('Documentation viewer is connected to your TrackVia workspace in production.', { icon: '📄' })}
                      className="inline-flex items-center gap-1 rounded-btn border border-bdr px-2 py-1 text-xs text-ink-3 hover:border-bdr-2 hover:text-ink"
                    >
                      <FileText size={12} aria-hidden="true" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
