import { useEffect } from 'react';
import { RefreshCw, Lock, AlertTriangle } from 'lucide-react';

export function AiAnalysisCard({ text, isStreaming, error, onAnalyze, label = 'AI Analysis' }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', animation: isStreaming ? 'pulse-dot 1s infinite' : 'none' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Signal AI · {label}</span>
          <Lock size={12} color="var(--ink-4)" aria-hidden="true" />
        </div>
        <button
          onClick={onAnalyze}
          disabled={isStreaming}
          style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: '1px solid var(--border)', borderRadius: 7, padding: '4px 8px', cursor: isStreaming ? 'not-allowed' : 'pointer', color: 'var(--ink-3)', fontSize: 11 }}
        >
          <RefreshCw size={11} style={{ animation: isStreaming ? 'spin 1s linear infinite' : 'none' }} aria-hidden="true" />
          {isStreaming ? 'Analyzing...' : 'Regenerate'}
        </button>
      </div>

      {error ? (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: 12, background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: 8 }}>
          <AlertTriangle size={16} color="var(--red)" aria-hidden="true" />
          <div>
            <p style={{ fontSize: 13, color: 'var(--red)', fontWeight: 500 }}>Analysis unavailable</p>
            <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{error}</p>
            <button onClick={onAnalyze} style={{ marginTop: 8, fontSize: 12, color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Try again</button>
          </div>
        </div>
      ) : !text && !isStreaming ? (
        <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>
          <p>Click Regenerate to run AI analysis</p>
        </div>
      ) : (
        <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.7, minHeight: 60 }}>
          {text || (
            <span style={{ color: 'var(--ink-4)' }}>
              Signal is analyzing
              <span style={{ animation: 'pulse-dot 1.2s infinite' }}>...</span>
            </span>
          )}
          {isStreaming && <span style={{ display: 'inline-block', width: 8, height: 14, background: 'var(--ink-3)', marginLeft: 2, verticalAlign: 'middle', animation: 'pulse-dot 0.8s infinite' }} />}
        </div>
      )}
      {text && !isStreaming && (
        <p style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 10, fontFamily: 'DM Mono' }}>Generated {new Date().toLocaleTimeString()}</p>
      )}
    </div>
  );
}
