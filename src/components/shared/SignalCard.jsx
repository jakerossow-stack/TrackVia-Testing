import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, Lock, RefreshCw } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { SeverityBadge, ConfidenceBar, SEVERITY_STYLES, timeAgo } from './ui';
import { useAiAnalysis } from '../../hooks/useAiAnalysis';
import { PATTERN_META } from '../../store/seedData';

// ---------------------------------------------------------------------------
// SignalCard — used in the signal feed (full) and as floating alert (compact)
// ---------------------------------------------------------------------------
export function SignalCard({ signal, compact = false, onAct, onDismissed }) {
  const navigate = useNavigate();
  const dismissSignal = useAppStore((s) => s.dismissSignal);
  const projects = useAppStore((s) => s.projects);
  const project = projects.find((p) => p.id === signal.projectId);
  const sev = SEVERITY_STYLES[signal.severity] || SEVERITY_STYLES.watch;

  if (compact) {
    return (
      <div className={`w-80 rounded-card border ${sev.border} bg-surface-2 p-3.5 shadow-modal ${signal.isNew ? 'animate-highlightFlash' : ''}`}>
        <div className="flex items-start gap-2.5">
          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-btn ${sev.bg} ${sev.text} text-sm font-bold`} aria-hidden="true">
            {sev.glyph}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold text-ink">{signal.title}</div>
            <div className="mt-0.5 text-[11px] text-ink-3">
              {project?.name} · {signal.estimatedTimeToIncident} to incident
            </div>
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={onAct}
                className="rounded-btn bg-red px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-red/90"
              >
                {signal.patternType === 'utilization_spike' ? 'Rebalance' : 'Act now'}
              </button>
              <button
                onClick={() => {
                  onDismissed?.();
                  setTimeout(() => dismissSignal(signal.id), 350);
                }}
                className="rounded-btn border border-bdr px-2.5 py-1 text-[11px] font-medium text-ink-3 hover:bg-surface"
              >
                Dismiss
              </button>
            </div>
          </div>
          <button
            onClick={() => {
              onDismissed?.();
              setTimeout(() => dismissSignal(signal.id), 350);
            }}
            className="text-ink-4 hover:text-ink"
            aria-label="Dismiss alert"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  const meta = PATTERN_META[signal.patternType];
  return (
    <div className={`rounded-card border border-bdr bg-surface-2 p-4 transition-colors hover:border-bdr-2 ${signal.isNew ? 'animate-highlightFlash' : ''}`}>
      <div className="flex items-start gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-btn ${sev.bg} ${sev.text} text-base font-bold`} aria-hidden="true">
          {sev.glyph}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigate(`/signals/${signal.id}`)}
              className="text-left text-sm font-semibold text-ink hover:text-red hover:underline"
            >
              {signal.title}
            </button>
            <SeverityBadge severity={signal.severity} />
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-3">
            <span>{project?.name}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{timeAgo(signal.detectedAt)}</span>
            <span aria-hidden="true">·</span>
            <span>{meta?.name}</span>
            <span aria-hidden="true">·</span>
            <span className="font-medium text-ink-2">{signal.estimatedTimeToIncident} to incident</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {signal.evidenceItems.slice(0, 3).map((e, i) => (
              <span key={i} className="rounded-badge border border-bdr bg-surface px-2 py-0.5 text-[10px] text-ink-3">
                {e.label}: <span className="font-mono text-ink-2">{e.value.length > 36 ? e.value.slice(0, 36) + '…' : e.value}</span>
              </span>
            ))}
            {signal.evidenceItems.length > 3 && (
              <span className="rounded-badge border border-bdr bg-surface px-1.5 py-0.5 text-[10px] font-medium text-ink-3">
                +{signal.evidenceItems.length - 3}
              </span>
            )}
          </div>
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
            <ConfidenceBar percent={signal.confidencePercent} />
            <div className="flex items-center gap-2">
              {signal.status === 'active' && (
                <button onClick={() => dismissSignal(signal.id)} className="rounded-btn border border-bdr px-2.5 py-1 text-[11px] font-medium text-ink-3 hover:bg-surface">
                  Dismiss
                </button>
              )}
              <button
                onClick={() => navigate(`/signals/${signal.id}`)}
                className="inline-flex items-center gap-1 rounded-btn bg-ink px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-ink-2"
              >
                View detail <ArrowRight size={11} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AiAnalysisCard — streams the Claude analysis word-by-word
// ---------------------------------------------------------------------------
export function AiAnalysisCard({ signal }) {
  const { text, isStreaming, error, generatedAt, regenerate } = useAiAnalysis(signal);

  return (
    <div className="rounded-card border border-bdr bg-surface-2 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulseDot rounded-full bg-red" aria-hidden="true" />
          <h3 className="text-xs font-bold uppercase tracking-wide text-ink">Signal AI analysis</h3>
          <Lock size={11} className="text-ink-4" aria-hidden="true" />
        </div>
        {!isStreaming && (
          <button
            onClick={regenerate}
            className="inline-flex items-center gap-1 rounded-btn px-2 py-1 text-[11px] font-medium text-ink-3 hover:bg-surface hover:text-ink"
            aria-label="Regenerate analysis"
          >
            <RefreshCw size={11} aria-hidden="true" /> Regenerate
          </button>
        )}
      </div>

      {error ? (
        <div className="mt-3 rounded-btn border border-red-bdr bg-red-bg p-3 text-xs text-red">
          <div className="font-semibold">Analysis unavailable</div>
          <div className="mt-1 text-ink-3">{error}</div>
          <button onClick={regenerate} className="mt-2 rounded-btn border border-red-bdr bg-surface-2 px-2.5 py-1 font-semibold text-red hover:bg-red-bg">
            Try again
          </button>
        </div>
      ) : !text && isStreaming ? (
        <div className="mt-3 flex items-center gap-2 text-xs text-ink-3">
          <span className="font-medium">Signal is analyzing</span>
          <span className="inline-flex gap-0.5" aria-hidden="true">
            <span className="h-1 w-1 animate-pulseDot rounded-full bg-ink-4" />
            <span className="h-1 w-1 animate-pulseDot rounded-full bg-ink-4" style={{ animationDelay: '0.2s' }} />
            <span className="h-1 w-1 animate-pulseDot rounded-full bg-ink-4" style={{ animationDelay: '0.4s' }} />
          </span>
        </div>
      ) : (
        <>
          <div className={`mt-3 whitespace-pre-line text-[13px] leading-relaxed text-ink-2 ${isStreaming ? 'stream-cursor' : ''}`}>
            {text}
          </div>
          {!isStreaming && generatedAt && (
            <div className="mt-2 font-mono text-[10px] text-ink-4">Generated {generatedAt}</div>
          )}
        </>
      )}
    </div>
  );
}
