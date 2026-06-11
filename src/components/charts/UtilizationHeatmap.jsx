const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

function utilizationColor(v) {
  if (v > 100) return 'var(--red)';
  if (v >= 80) return 'var(--amber)';
  return 'var(--green)';
}

export function UtilizationHeatmap({ employees }) {
  // Generate pseudo-daily utilization from weekly avg with variation
  function dayUtil(base, dayIdx) {
    const variation = [0.9, 1.05, 1.1, 0.95, 0.85];
    return Math.round(base * variation[dayIdx] + (Math.random() - 0.5) * 8);
  }

  return (
    <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, overflowX: 'auto' }}>
      <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Utilization Heatmap — This Week</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', fontSize: 11, color: 'var(--ink-4)', fontWeight: 500, paddingBottom: 8, width: 160 }}>Employee</th>
            {DAYS.map(d => <th key={d} style={{ fontSize: 11, color: 'var(--ink-4)', fontWeight: 500, paddingBottom: 8, textAlign: 'center' }}>{d}</th>)}
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp.id}>
              <td style={{ padding: '4px 0', fontSize: 13, color: 'var(--ink-2)' }}>{emp.name}</td>
              {DAYS.map((_, i) => {
                const v = dayUtil(emp.utilizationPercent, i);
                return (
                  <td key={i} style={{ padding: 4, textAlign: 'center' }}>
                    <div title={`${v}%`} style={{
                      margin: '0 auto', width: 36, height: 28, borderRadius: 6,
                      background: utilizationColor(v), opacity: 0.7 + (v / 400),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, color: '#fff', fontWeight: 600, fontFamily: 'DM Mono',
                    }}>{v}%</div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
        {[['< 80%', 'var(--green)', 'Healthy'], ['80–100%', 'var(--amber)', 'Watch'], ['> 100%', 'var(--red)', 'Over-capacity']].map(([range, color, label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: color, opacity: 0.8 }} />
            <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{range} — {label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
