export function SeverityBadge({ severity, size = 'sm' }) {
  const config = {
    critical: { bg: 'var(--red-bg)', border: 'var(--red-border)', color: 'var(--red)', label: 'Critical', dot: '●' },
    warning:  { bg: 'var(--amber-bg)', border: 'var(--amber-border)', color: 'var(--amber)', label: 'Warning', dot: '▲' },
    watch:    { bg: 'var(--surface)', border: 'var(--border)', color: 'var(--ink-3)', label: 'Watch', dot: '◉' },
  }[severity] || { bg: 'var(--surface)', border: 'var(--border)', color: 'var(--ink-3)', label: severity, dot: '●' };

  const pad = size === 'lg' ? '6px 12px' : '3px 8px';
  const fs = size === 'lg' ? '13px' : '11px';

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: config.bg, border: `1px solid ${config.border}`,
      color: config.color, borderRadius: 20, padding: pad, fontSize: fs, fontWeight: 600,
    }}>
      <span>{config.dot}</span>
      {config.label}
    </span>
  );
}
