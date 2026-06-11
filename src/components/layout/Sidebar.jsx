import { NavLink, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import {
  LayoutDashboard, Radio, FolderKanban, Library,
  History, BarChart3, Brain,
  ClipboardList, Shield, Settings, ChevronRight,
} from 'lucide-react';

const NAV = [
  { section: 'MONITORING', items: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Risk Dashboard' },
    { to: '/signals', icon: Radio, label: 'Signal Feed', badge: 'signals' },
    { to: '/projects', icon: FolderKanban, label: 'Projects' },
    { to: '/patterns', icon: Library, label: 'Pattern Library' },
  ]},
  { section: 'INTELLIGENCE', items: [
    { to: '/intelligence/history', icon: History, label: 'Prediction History' },
    { to: '/intelligence/accuracy', icon: BarChart3, label: 'Accuracy Report' },
  ]},
  { section: 'OPERATIONS', items: [
    { to: '/workforce', icon: Brain, label: 'Workforce' },
    { to: '/compliance', icon: Shield, label: 'Compliance Log' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ]},
];

export function Sidebar() {
  const signals = useAppStore(s => s.signals);
  const activeCount = signals.filter(s => s.status === 'active').length;

  return (
    <div style={{
      width: 220, minHeight: '100vh', background: 'var(--surface-2)',
      borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
      flexShrink: 0,
    }}>
      <div style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {NAV.map(({ section, items }) => (
          <div key={section} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 8px', marginBottom: 4 }}>
              {section}
            </div>
            {items.map(({ to, icon: Icon, label, badge }) => (
              <NavLink key={to} to={to} style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 8,
                textDecoration: 'none', fontSize: 13, fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--ink)' : 'var(--ink-3)',
                background: isActive ? 'var(--surface)' : 'transparent',
                borderLeft: isActive ? '2px solid var(--red)' : '2px solid transparent',
                marginBottom: 1,
              })}>
                <Icon size={15} aria-hidden="true" />
                <span style={{ flex: 1 }}>{label}</span>
                {badge === 'signals' && activeCount > 0 && (
                  <span style={{ background: 'var(--red)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10 }}>{activeCount}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* FedRAMP badge */}
      <div style={{
        margin: 8, padding: '8px 10px', background: 'var(--blue-bg)', border: '1px solid var(--blue-border)',
        borderRadius: 8, display: 'flex', alignItems: 'flex-start', gap: 8,
      }}>
        <Shield size={14} color="var(--blue)" style={{ marginTop: 1, flexShrink: 0 }} aria-hidden="true" />
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--blue)' }}>FedRAMP Moderate</p>
          <p style={{ fontSize: 10, color: 'var(--ink-4)', lineHeight: 1.4, marginTop: 1 }}>All data stays within your authorization boundary</p>
        </div>
      </div>
    </div>
  );
}
