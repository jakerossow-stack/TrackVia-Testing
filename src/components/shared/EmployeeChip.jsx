export function EmployeeChip({ employee, size = 'sm' }) {
  if (!employee) return null;
  const sz = size === 'lg' ? 32 : 24;
  const fs = size === 'lg' ? 13 : 11;
  const clearanceColors = { top_secret: 'var(--red)', secret: 'var(--amber)', confidential: 'var(--blue)', none: 'var(--ink-4)' };
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: `3px 8px 3px 3px` }}>
      <div style={{
        width: sz, height: sz, borderRadius: 8, background: clearanceColors[employee.clearanceLevel] || 'var(--ink-3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: fs - 1, fontWeight: 600,
      }}>{employee.initials}</div>
      <span style={{ fontSize: fs, color: 'var(--ink-2)', fontWeight: 500 }}>{employee.name}</span>
    </div>
  );
}
