import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Loader2, ScanSearch } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

// ---------------------------------------------------------------------------
// Topbar
// ---------------------------------------------------------------------------
export function Topbar() {
  const navigate = useNavigate();
  const { currentUser, organization, logout, runAnalysis, isAnalyzing } = useAppStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-12 items-center justify-between bg-ink px-4 text-white">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 animate-pulseDot rounded-full bg-red" aria-hidden="true" />
          <span className="text-sm font-bold tracking-tight">TrackVia Signal</span>
        </button>
        <span className="hidden h-4 w-px bg-white/20 sm:block" aria-hidden="true" />
        <span className="hidden text-[11px] font-medium uppercase tracking-widest text-ink-4 sm:block">
          Predictive Operations AI
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={runAnalysis}
          disabled={isAnalyzing}
          className="hidden items-center gap-1.5 rounded-btn border border-white/15 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-white/10 disabled:opacity-60 md:inline-flex"
        >
          {isAnalyzing ? (
            <>
              <Loader2 size={12} className="animate-spin" aria-hidden="true" /> Scanning...
            </>
          ) : (
            <>
              <ScanSearch size={12} aria-hidden="true" /> Run scan now
            </>
          )}
        </button>
        <span className="hidden items-center gap-1.5 rounded-[20px] border border-red-bdr/30 bg-red/15 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-red sm:inline-flex">
          <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-red" aria-hidden="true" />
          MONITORING LIVE
        </span>
        <span className="hidden text-xs text-white/70 lg:block">{organization?.name}</span>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-btn px-1 py-1 hover:bg-white/10"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-avatar bg-red text-[11px] font-bold text-white" aria-hidden="true">
              {currentUser?.avatarInitials}
            </span>
            <ChevronDown size={12} className="text-white/60" aria-hidden="true" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-10 w-48 rounded-card border border-bdr bg-surface-2 py-1.5 shadow-modal" role="menu">
              <div className="border-b border-bdr px-3 pb-2 pt-1">
                <div className="text-xs font-semibold text-ink">{currentUser?.name}</div>
                <div className="text-[10px] capitalize text-ink-4">{currentUser?.role}</div>
              </div>
              <button role="menuitem" onClick={() => { setMenuOpen(false); navigate('/workforce'); }} className="block w-full px-3 py-2 text-left text-xs text-ink-2 hover:bg-surface">
                Profile
              </button>
              <button role="menuitem" onClick={() => { setMenuOpen(false); navigate('/settings'); }} className="block w-full px-3 py-2 text-left text-xs text-ink-2 hover:bg-surface">
                Settings
              </button>
              <button
                role="menuitem"
                onClick={() => { setMenuOpen(false); logout(); navigate('/login'); }}
                className="block w-full px-3 py-2 text-left text-xs font-medium text-red hover:bg-red-bg"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
