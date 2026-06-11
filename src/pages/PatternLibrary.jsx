import { useAppStore } from '../store/appStore';
import { PATTERN_TYPES } from '../store/seedData';
import { AlertTriangle, Search, ArrowLeftRight, Clock, Wrench, UserX, TrendingUp, FileText, BellOff } from 'lucide-react';

const ICON_MAP = { Search, ArrowLeftRight, Clock, Wrench, UserX, TrendingUp, FileText, BellOff, AlertTriangle };

export function PatternLibrary() {
  const signals = useAppStore(s => s.signals);
  const activeSignals = signals.filter(s => s.status === 'active');

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Pattern Library</h1>
      <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 24 }}>Signal monitors 9 behavioral patterns. Each pattern has been validated against historical incident data.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {PATTERN_TYPES.map(pt => {
          const Icon = ICON_MAP[pt.icon] || AlertTriangle;
          const activeCount = activeSignals.filter(s => s.patternType === pt.type).length;
          const severityColor = pt.severity === 'critical' ? 'var(--red)' : pt.severity === 'warning' ? 'var(--amber)' : 'var(--ink-4)';
          const severityBg = pt.severity === 'critical' ? 'var(--red-bg)' : pt.severity === 'warning' ? 'var(--amber-bg)' : 'var(--surface)';
          const severityBorder = pt.severity === 'critical' ? 'var(--red-border)' : pt.severity === 'warning' ? 'var(--amber-border)' : 'var(--border)';
          return (
            <div key={pt.type} style={{ background: 'var(--surface-2)', border: `1px solid ${activeCount > 0 ? severityBorder : 'var(--border)'}`, borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: severityBg, border: `1px solid ${severityBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} color={severityColor} aria-hidden="true" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                  <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: severityBg, color: severityColor, border: `1px solid ${severityBorder}`, fontWeight: 600, textTransform: 'uppercase' }}>{pt.severity} predictor</span>
                  {activeCount > 0 && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid var(--red-border)', fontWeight: 700 }}>{activeCount} active now</span>}
                </div>
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{pt.name}</h3>
              <p style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.5 }}>{pt.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
