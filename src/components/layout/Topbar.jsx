import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { ChevronDown, Settings, LogOut, User } from 'lucide-react';

export function Topbar({ onRunScan, isScanning }) {
  const [dropOpen, setDropOpen] = useState(false);
  const currentUser = useAppStore(s => s.currentUser);
  const organization = useAppStore(s => s.organization);
  const logout = useAppStore(s => s.logout);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div style={{
      height: 48, background: 'var(--ink)', display: 'flex', alignItems: 'center',
      padding: '0 20px', position: 'sticky', top: 0, zIndex: 100, gap: 16,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div className="pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)' }} />
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 15, fontFamily: 'DM Sans' }}>TrackVia Signal</span>
      </div>

      <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.15)' }} />
      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Predictive Operations AI</span>

      <div style={{ flex: 1 }} />

      {/* Live badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(217,48,37,0.15)', border: '1px solid rgba(217,48,37,0.3)', borderRadius: 20, padding: '3px 10px' }}>
        <div className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)' }} />
        <span style={{ fontSize: 10, color: '#ff6b6b', fontWeight: 600 }}>MONITORING LIVE</span>
      </div>

      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{organization?.name}</span>

      {/* User avatar */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setDropOpen(!dropOpen)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '4px 8px', cursor: 'pointer', color: '#fff' }}
        >
          <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
            {currentUser?.avatarInitials}
          </div>
          <span style={{ fontSize: 12 }}>{currentUser?.name}</span>
          <ChevronDown size={12} aria-hidden="true" />
        </button>
        {dropOpen && (
          <div style={{
            position: 'absolute', right: 0, top: 40, background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 10, padding: 6, minWidth: 160, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 200,
          }}>
            <button onClick={() => { setDropOpen(false); navigate('/settings'); }} style={menuItemStyle}>
              <Settings size={13} aria-hidden="true" /> Settings
            </button>
            <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
            <button onClick={handleLogout} style={{ ...menuItemStyle, color: 'var(--red)' }}>
              <LogOut size={13} aria-hidden="true" /> Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const menuItemStyle = {
  display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'none',
  border: 'none', padding: '7px 10px', borderRadius: 7, cursor: 'pointer',
  fontSize: 13, color: 'var(--ink-2)', textAlign: 'left',
};
