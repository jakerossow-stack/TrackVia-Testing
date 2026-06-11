import { useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { SignalCard } from '../components/shared/SignalCard';
import { SeverityBadge } from '../components/shared/SeverityBadge';
import { RiskTimeline } from '../components/charts/RiskTimeline';
import { DetailPanel } from '../components/layout/DetailPanel';
import { PATTERN_TYPES } from '../store/seedData';
import {
  AlertTriangle, TrendingUp, CheckCircle2, Target, Loader2, X, ArrowRight,
  Search, ArrowLeftRight, Clock, Wrench, UserX, FileText, BellOff,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ICON_MAP = { Search, ArrowLeftRight, Clock, Wrench, UserX, TrendingUp, FileText, BellOff, AlertTriangle };

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

function StatCard({ label, value, subtext, color, icon: Icon }) {
  return (
    <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <p style={{ fontSize: 11, color: 'var(--ink-4)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
        {Icon && <Icon size={16} color={color} aria-hidden="true" />}
      </div>
      <p style={{ fontSize: 30, fontWeight: 700, color: color || 'var(--ink)', fontFamily: 'DM Mono', marginBottom: 2 }}>{value}</p>
      {subtext && <p style={{ fontSize: 11, color: 'var(--ink-4)' }}>{subtext}</p>}
    </div>
  );
}

function AlertStack({ signals, onSelect, dismissedIds, onDismiss }) {
  const active = signals.filter(s => s.status === 'active' && !dismissedIds.includes(s.id)).slice(0, 3);
  if (!active.length) return null;

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 50, width: 320, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {active.map((sig, i) => (
        <div key={sig.id} style={{
          background: 'var(--surface-2)', border: `1px solid ${sig.severity === 'critical' ? 'var(--red-border)' : 'var(--amber-border)'}`,
          borderRadius: 10, padding: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          animation: 'fade-in 0.3s ease-out',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <SeverityBadge severity={sig.severity} />
              <p style={{ fontSize: 12, fontWeight: 600, marginTop: 6, lineHeight: 1.4 }}>{sig.title.slice(0, 60)}...</p>
              <p style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 3, fontFamily: 'DM Mono' }}>~{sig.estimatedTimeToIncident} to incident</p>
            </div>
            <button onClick={() => onDismiss(sig.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-4)', padding: 2 }}>
              <X size={12} aria-hidden="true" />
            </button>
          </div>
          <button
            onClick={() => onSelect(sig)}
            style={{ marginTop: 8, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '6px 0', background: sig.severity === 'critical' ? 'var(--red-bg)' : 'var(--amber-bg)', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: sig.severity === 'critical' ? 'var(--red)' : 'var(--amber)' }}
          >
            Act now <ArrowRight size={11} aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}

export function Dashboard() {
  const signals = useAppStore(s => s.signals);
  const projects = useAppStore(s => s.projects);
  const organization = useAppStore(s => s.organization);
  const dismissAlert = useAppStore(s => s.dismissAlert);
  const dismissedAlerts = useAppStore(s => s.dismissedAlerts) || [];

  const [selectedSignal, setSelectedSignal] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [localDismissed, setLocalDismissed] = useState([]);

  const activeSignals = signals.filter(s => s.status === 'active');
  const criticalSignals = activeSignals.filter(s => s.severity === 'critical');
  const warningSignals = activeSignals.filter(s => s.severity === 'warning');
  const watchSignals = activeSignals.filter(s => s.severity === 'watch');
  const avgRisk = Math.round(projects.reduce((s, p) => s + p.riskScore, 0) / projects.length);
  const criticalProject = projects.reduce((a, b) => a.riskScore > b.riskScore ? a : b);

  useEffect(() => {
    if (!selectedSignal && activeSignals.length > 0) {
      setSelectedSignal(activeSignals[0]);
    }
  }, []);

  async function handleRunScan() {
    setIsScanning(true);
    toast('Signal is scanning behavioral patterns...', { icon: '🔍' });
    try {
      const res = await fetch(`${API_BASE}/api/run-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationData: organization }),
      });
      const data = await res.json();
      toast.success(`Scan complete — ${data.patternsUpdated} patterns updated, ${data.newSignalsDetected} new signals`);
    } catch {
      toast.error('Scan failed — check your connection');
    } finally {
      setIsScanning(false);
    }
  }

  function handleDismissAlert(id) {
    setLocalDismissed(prev => [...prev, id]);
    dismissAlert(id);
    toast('Dismissed — Signal will continue monitoring', { icon: '👁️' });
  }

  const allDismissed = [...dismissedAlerts, ...localDismissed];

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
      {/* Main content */}
      <div style={{ flex: 1, padding: 24, overflowY: 'auto', minWidth: 0 }}>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700 }}>Risk Dashboard</h1>
            <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>Meridian Defense Contractors · {activeSignals.length} active signals</p>
          </div>
          <button
            onClick={handleRunScan} disabled={isScanning}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 7, cursor: isScanning ? 'not-allowed' : 'pointer',
              background: isScanning ? 'var(--surface)' : 'var(--ink)', color: isScanning ? 'var(--ink-3)' : '#fff',
              border: `1px solid ${isScanning ? 'var(--border)' : 'var(--ink)'}`, fontSize: 13, fontWeight: 500,
            }}
          >
            {isScanning ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} aria-hidden="true" /> : <Target size={14} aria-hidden="true" />}
            {isScanning ? 'Scanning...' : 'Run scan now'}
          </button>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <StatCard label="Avg Risk Score" value={avgRisk} subtext="↑ +8 vs last week" color={avgRisk >= 70 ? 'var(--red)' : avgRisk >= 50 ? 'var(--amber)' : 'var(--green)'} icon={AlertTriangle} />
          <StatCard label="Active Signals" value={activeSignals.length} subtext={`${criticalSignals.length} critical · ${warningSignals.length} warning · ${watchSignals.length} watch`} color="var(--amber)" icon={TrendingUp} />
          <StatCard label="Incidents Prevented" value="12" subtext="Est. $240K cost avoidance" color="var(--green)" icon={CheckCircle2} />
          <StatCard label="Prediction Accuracy" value="89%" subtext="Last 90 days" color="var(--blue)" icon={Target} />
        </div>

        {/* Timeline */}
        <div style={{ marginBottom: 20 }}>
          <RiskTimeline
            history={criticalProject.signalHistory}
            title={`Behavioral signal timeline — ${criticalProject.name}`}
            onDotClick={(payload) => {
              const sig = signals.find(s => s.projectId === criticalProject.id);
              if (sig) setSelectedSignal(sig);
            }}
          />
        </div>

        {/* Pattern grid */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Pattern Library — 9 Monitored Behaviors</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {PATTERN_TYPES.map(pt => {
              const Icon = ICON_MAP[pt.icon] || AlertTriangle;
              const count = activeSignals.filter(s => s.patternType === pt.type).length;
              const severityColor = pt.severity === 'critical' ? 'var(--red)' : pt.severity === 'warning' ? 'var(--amber)' : 'var(--ink-4)';
              return (
                <div key={pt.type} style={{ background: 'var(--surface-2)', border: `1px solid ${count > 0 ? (pt.severity === 'critical' ? 'var(--red-border)' : 'var(--amber-border)') : 'var(--border)'}`, borderRadius: 10, padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: pt.severity === 'critical' ? 'var(--red-bg)' : pt.severity === 'warning' ? 'var(--amber-bg)' : 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={14} color={severityColor} aria-hidden="true" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                      <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: pt.severity === 'critical' ? 'var(--red-bg)' : pt.severity === 'warning' ? 'var(--amber-bg)' : 'var(--surface)', color: severityColor, border: `1px solid ${pt.severity === 'critical' ? 'var(--red-border)' : pt.severity === 'warning' ? 'var(--amber-border)' : 'var(--border)'}`, fontWeight: 600 }}>{pt.severity} predictor</span>
                      {count > 0 && <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid var(--red-border)', fontWeight: 700 }}>{count} active</span>}
                    </div>
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{pt.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2, lineHeight: 1.4 }}>{pt.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active signals list */}
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Active Signals</h2>
          {activeSignals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12 }}>
              <CheckCircle2 size={32} color="var(--green)" style={{ margin: '0 auto 12px' }} aria-hidden="true" />
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--green)' }}>All clear</p>
              <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>No active signals. Operations look healthy.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {activeSignals.map(sig => (
                <SignalCard key={sig.id} signal={sig} onSelect={setSelectedSignal} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right panel */}
      <DetailPanel
        signal={selectedSignal}
        project={selectedSignal ? projects.find(p => p.id === selectedSignal.projectId) : null}
      />

      {/* Alert stack */}
      <AlertStack
        signals={activeSignals}
        onSelect={setSelectedSignal}
        dismissedIds={allDismissed}
        onDismiss={handleDismissAlert}
      />
    </div>
  );
}
