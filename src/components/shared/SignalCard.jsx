import { useNavigate } from 'react-router-dom';
import { SeverityBadge } from './SeverityBadge';
import { ConfidenceBar } from './ConfidenceBar';
import { Clock, X, ArrowRight, User } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import toast from 'react-hot-toast';

export function SignalCard({ signal, compact = false, onSelect }) {
  const navigate = useNavigate();
  const dismissSignal = useAppStore(s => s.dismissSignal);

  function handleDismiss(e) {
    e.stopPropagation();
    dismissSignal(signal.id);
    toast.success('Signal dismissed — will continue monitoring');
  }

  return (
    <div
      onClick={() => onSelect ? onSelect(signal) : navigate(`/signals/${signal.id}`)}
      style={{
        background: 'var(--surface-2)', border: `1px solid ${signal.severity === 'critical' ? 'var(--red-border)' : signal.severity === 'warning' ? 'var(--amber-border)' : 'var(--border)'}`,
        borderRadius: 12, padding: compact ? 12 : 16, cursor: 'pointer', transition: 'box-shadow 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <SeverityBadge severity={signal.severity} />
            {signal.estimatedTimeToIncident && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--ink-4)', fontFamily: 'DM Mono' }}>
                <Clock size={10} aria-hidden="true" /> {signal.estimatedTimeToIncident}
              </span>
            )}
          </div>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.4 }}>{signal.title}</h3>
        </div>
        <button
          onClick={handleDismiss}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--ink-4)', borderRadius: 4, flexShrink: 0 }}
          aria-label="Dismiss signal"
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>

      {!compact && <p style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.5, marginBottom: 10 }}>{signal.description.slice(0, 120)}...</p>}

      <div style={{ marginBottom: 10 }}>
        <ConfidenceBar percent={signal.confidencePercent} />
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {(signal.evidenceItems || []).slice(0, 3).map((item, i) => (
          <span key={i} style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 5,
            background: item.severity === 'critical' ? 'var(--red-bg)' : item.severity === 'warning' ? 'var(--amber-bg)' : 'var(--surface)',
            border: `1px solid ${item.severity === 'critical' ? 'var(--red-border)' : item.severity === 'warning' ? 'var(--amber-border)' : 'var(--border)'}`,
            color: item.severity === 'critical' ? 'var(--red)' : item.severity === 'warning' ? 'var(--amber)' : 'var(--ink-3)',
          }}>{item.label}</span>
        ))}
        {(signal.evidenceItems || []).length > 3 && (
          <span style={{ fontSize: 11, color: 'var(--ink-4)', padding: '2px 4px' }}>+{signal.evidenceItems.length - 3} more</span>
        )}
      </div>
    </div>
  );
}
