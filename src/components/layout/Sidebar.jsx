import { NavLink } from 'react-router-dom';
import {
  Activity,
  Radio,
  FolderKanban,
  Library,
  History,
  Target,
  ClipboardList,
  ShieldCheck,
  Settings,
  Users,
} from 'lucide-react';
import { useSignalCounts } from '../../hooks/useSignals';
import { FedRampChip } from '../shared/ui';

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------
function NavItem({ to, icon: Icon, label, badge, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `group flex items-center gap-2.5 rounded-btn px-2.5 py-2 text-xs font-medium transition-colors ${
          isActive ? 'bg-red-bg text-red' : 'text-ink-3 hover:bg-surface hover:text-ink'
        }`
      }
      title={label}
    >
      <Icon size={15} className="shrink-0" aria-hidden="true" />
      <span className="hidden flex-1 truncate lg:block">{label}</span>
      {badge != null && badge > 0 && (
        <span className="hidden rounded-[20px] bg-red px-1.5 py-0.5 font-mono text-[9px] font-medium leading-none text-white lg:block">
          {badge}
        </span>
      )}
    </NavLink>
  );
}

function SectionLabel({ children }) {
  return <div className="mb-1 mt-4 hidden px-2.5 text-[9px] font-bold uppercase tracking-[0.12em] text-ink-4 first:mt-0 lg:block">{children}</div>;
}

export function Sidebar() {
  const counts = useSignalCounts();
  return (
    <nav className="sticky top-12 flex h-[calc(100vh-48px)] w-14 shrink-0 flex-col border-r border-bdr bg-surface-2 p-2 lg:w-[220px] lg:p-3" aria-label="Primary">
      <div className="flex-1 overflow-y-auto panel-scroll">
        <SectionLabel>Monitoring</SectionLabel>
        <NavItem to="/dashboard" icon={Activity} label="Risk Dashboard" />
        <NavItem to="/signals" icon={Radio} label="Signal Feed" badge={counts.total} end />
        <NavItem to="/projects" icon={FolderKanban} label="Projects" end />
        <NavItem to="/patterns" icon={Library} label="Pattern Library" />

        <SectionLabel>Intelligence</SectionLabel>
        <NavItem to="/intelligence/history" icon={History} label="Prediction History" />
        <NavItem to="/intelligence/accuracy" icon={Target} label="Accuracy Report" />
        <NavItem to="/workforce" icon={Users} label="Workforce" end />

        <SectionLabel>Operations</SectionLabel>
        <NavItem to="/signals?status=active" icon={ClipboardList} label="Work Orders" />
        <NavItem to="/compliance" icon={ShieldCheck} label="Compliance Log" />
        <NavItem to="/settings" icon={Settings} label="Settings" />
      </div>
      <div className="hidden lg:block">
        <FedRampChip />
      </div>
      <div className="flex justify-center lg:hidden" title="FedRAMP Moderate Authorized">
        <ShieldCheck size={16} className="text-blue" aria-label="FedRAMP Moderate Authorized" />
      </div>
    </nav>
  );
}
