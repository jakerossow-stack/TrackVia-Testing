export function ConfidenceBar({ percent }) {
  const color = percent >= 80 ? 'var(--red)' : percent >= 60 ? 'var(--amber)' : 'var(--ink-4)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${percent}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'DM Mono', minWidth: 30 }}>{percent}%</span>
    </div>
  );
}
