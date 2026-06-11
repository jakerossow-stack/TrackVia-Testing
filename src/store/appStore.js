import { create } from 'zustand';
import toast from 'react-hot-toast';
import {
  SEED_ORGANIZATION,
  SEED_PROJECTS,
  SEED_EMPLOYEES,
  SEED_SIGNALS,
  SEED_PREDICTIONS,
  SEED_COMPLIANCE_EVENTS,
  SEED_SETTINGS,
  DEMO_USERS,
} from './seedData';

const STORAGE_KEY = 'signal_state_v1';
const INIT_KEY = 'signal_initialized';
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

// ---------------------------------------------------------------------------
// Persistence helpers — if localStorage is corrupted, re-seed and notify.
// ---------------------------------------------------------------------------
function loadPersisted() {
  try {
    if (!localStorage.getItem(INIT_KEY)) return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.projects) || !Array.isArray(parsed.signals)) {
      throw new Error('shape mismatch');
    }
    return parsed;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(INIT_KEY);
    setTimeout(() => toast('Saved data was corrupted — reset to demo data.', { icon: '↺' }), 400);
    return null;
  }
}

function seedState() {
  return {
    currentUser: null,
    organization: SEED_ORGANIZATION,
    projects: SEED_PROJECTS,
    signals: SEED_SIGNALS,
    employees: SEED_EMPLOYEES,
    predictions: SEED_PREDICTIONS,
    complianceEvents: SEED_COMPLIANCE_EVENTS,
    settings: SEED_SETTINGS,
    lastAnalysisTime: null,
  };
}

const persisted = loadPersisted() || seedState();
if (!localStorage.getItem(INIT_KEY)) {
  localStorage.setItem(INIT_KEY, '1');
  localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
}

function persist(get) {
  const s = get();
  const snapshot = {
    currentUser: s.currentUser,
    organization: s.organization,
    projects: s.projects,
    signals: s.signals,
    employees: s.employees,
    predictions: s.predictions,
    complianceEvents: s.complianceEvents,
    settings: s.settings,
    lastAnalysisTime: s.lastAnalysisTime,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    /* storage full — keep running in memory */
  }
}

const statusForScore = (score, settings) => {
  if (score >= settings.criticalThreshold) return 'critical';
  if (score >= settings.warningThreshold) return 'at_risk';
  return 'on_track';
};

export const severityRank = { critical: 0, warning: 1, watch: 2 };

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------
export const useAppStore = create((set, get) => ({
  ...persisted,
  isAnalyzing: false,
  selectedSignalId: null,

  // ----- Auth ---------------------------------------------------------------
  login: async (email, password) => {
    await new Promise((r) => setTimeout(r, 450)); // simulate network
    const user = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );
    if (!user) throw new Error('Email or password doesn\u2019t match a demo account.');
    const { password: _pw, ...safeUser } = user;
    set({ currentUser: safeUser });
    persist(get);
    return safeUser;
  },

  logout: () => {
    set({ currentUser: null, selectedSignalId: null });
    persist(get);
  },

  // ----- Selection ------------------------------------------------------------
  selectSignal: (id) => set({ selectedSignalId: id }),

  // ----- Projects -------------------------------------------------------------
  addProject: (project) => {
    const id = `proj_${Date.now()}`;
    set((s) => ({ projects: [...s.projects, { ...project, id }] }));
    persist(get);
  },

  updateProject: (id, updates) => {
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
    persist(get);
  },

  // ----- Signals ----------------------------------------------------------------
  dismissSignal: (id) => {
    set((s) => ({
      signals: s.signals.map((sig) => (sig.id === id ? { ...sig, status: 'dismissed' } : sig)),
    }));
    get().recountSignals();
    persist(get);
    toast('Dismissed — Signal will continue monitoring', { icon: '👁' });
  },

  resolveSignal: (id, resolution) => {
    set((s) => ({
      signals: s.signals.map((sig) =>
        sig.id === id
          ? {
              ...sig,
              status: 'resolved',
              notes: [
                ...sig.notes,
                {
                  id: `note_${Date.now()}`,
                  authorId: s.currentUser?.id || 'user_1',
                  content: `Resolved: ${resolution}`,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : sig
      ),
    }));
    get().recountSignals();
    persist(get);
    toast.success('Signal resolved');
  },

  escalateSignal: (id) => {
    set((s) => ({
      signals: s.signals.map((sig) => (sig.id === id ? { ...sig, status: 'escalated' } : sig)),
    }));
    persist(get);
    toast('Signal escalated to leadership', { icon: '⬆' });
  },

  addSignalNote: (signalId, note) => {
    set((s) => ({
      signals: s.signals.map((sig) =>
        sig.id === signalId
          ? {
              ...sig,
              notes: [
                ...sig.notes,
                {
                  id: `note_${Date.now()}`,
                  authorId: s.currentUser?.id || 'user_1',
                  content: note,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : sig
      ),
    }));
    persist(get);
  },

  setSignalAnalysis: (signalId, analysis) => {
    set((s) => ({
      signals: s.signals.map((sig) => (sig.id === signalId ? { ...sig, aiAnalysis: analysis } : sig)),
    }));
    persist(get);
  },

  recountSignals: () => {
    set((s) => ({
      projects: s.projects.map((p) => ({
        ...p,
        activeSignalCount: s.signals.filter((sig) => sig.projectId === p.id && sig.status === 'active').length,
      })),
    }));
  },

  // ----- Employees -----------------------------------------------------------
  updateEmployee: (id, updates) => {
    set((s) => ({
      employees: s.employees.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
    persist(get);
  },

  addEmployee: (employee) => {
    const id = `emp_${Date.now()}`;
    set((s) => ({ employees: [...s.employees, { ...employee, id }] }));
    persist(get);
  },

  // ----- Actions ----------------------------------------------------------------
  completeAction: (actionId) => {
    const s = get();
    let affectedProjectId = null;
    let newScore = null;

    const signals = s.signals.map((sig) => {
      const idx = sig.recommendedActions.findIndex((a) => a.id === actionId);
      if (idx === -1) return sig;
      affectedProjectId = sig.projectId;
      const actions = sig.recommendedActions.map((a) =>
        a.id === actionId ? { ...a, status: 'completed', completedAt: new Date().toISOString() } : a
      );
      return { ...sig, recommendedActions: actions };
    });

    const projects = s.projects.map((p) => {
      if (p.id !== affectedProjectId) return p;
      const decrement = 8 + Math.floor(Math.random() * 5); // 8–12
      newScore = Math.max(0, p.riskScore - decrement);
      const status = statusForScore(newScore, s.settings);
      const today = new Date().toISOString().slice(0, 10);
      const history = [...p.signalHistory];
      const last = history[history.length - 1];
      const entry = { date: today, riskScore: newScore, triggerType: null, note: 'Recommended action completed' };
      if (last && last.date === today) history[history.length - 1] = entry;
      else history.push(entry);
      return {
        ...p,
        riskScore: newScore,
        status,
        riskTrend: 'falling',
        signalHistory: history,
      };
    });

    set({ signals, projects });
    persist(get);
    if (newScore != null) toast.success(`Action completed — risk score updated to ${newScore}`);
  },

  assignAction: (actionId, employeeId) => {
    set((s) => ({
      signals: s.signals.map((sig) => ({
        ...sig,
        recommendedActions: sig.recommendedActions.map((a) =>
          a.id === actionId ? { ...a, assignedTo: employeeId, status: a.status === 'pending' ? 'in_progress' : a.status } : a
        ),
      })),
    }));
    persist(get);
  },

  // ----- Settings -----------------------------------------------------------
  updateSettings: (updates) => {
    set((s) => ({ settings: { ...s.settings, ...updates } }));
    persist(get);
  },

  updateOrganization: (updates) => {
    set((s) => ({ organization: { ...s.organization, ...updates } }));
    persist(get);
  },

  // ----- AI: full-org scan ----------------------------------------------------
  runAnalysis: async () => {
    const s = get();
    if (s.isAnalyzing) return;
    set({ isAnalyzing: true });
    toast(`Signal is scanning 47 behavioral patterns across ${s.organization.activeProjects} projects...`, {
      icon: '📡',
      duration: 3000,
    });
    try {
      const res = await fetch(`${API_BASE}/api/run-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationData: s.organization,
          allProjects: s.projects,
          allSignals: s.signals.filter((x) => x.status === 'active'),
        }),
      });
      if (!res.ok) throw new Error(`Scan failed (${res.status})`);
      const data = await res.json();

      const updates = data.riskUpdates || [];
      const incoming = (data.newSignals || []).map((n, i) => ({
        id: `sig_${Date.now()}_${i}`,
        status: 'active',
        detectedAt: new Date().toISOString(),
        involvedEmployees: [],
        aiAnalysis: '',
        recommendedActions: [],
        notes: [],
        isNew: true,
        ...n,
      }));

      set((st) => ({
        projects: st.projects.map((p) => {
          const u = updates.find((x) => x.projectId === p.id);
          if (!u) return p;
          const score = Math.max(0, Math.min(100, Math.round(u.newRiskScore)));
          return {
            ...p,
            riskScore: score,
            status: statusForScore(score, st.settings),
            riskTrend: score > p.riskScore ? 'rising' : score < p.riskScore ? 'falling' : p.riskTrend,
          };
        }),
        signals: [...incoming, ...st.signals],
        lastAnalysisTime: new Date().toISOString(),
      }));
      get().recountSignals();
      persist(get);
      toast.success(
        `Scan complete — ${updates.length} pattern${updates.length === 1 ? '' : 's'} updated, ${incoming.length} new signal${incoming.length === 1 ? '' : 's'} detected`
      );
    } catch (err) {
      toast.error(`Scan failed: ${err.message}. Check that the API server is running.`);
    } finally {
      set({ isAnalyzing: false });
    }
  },

  resetDemoData: () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(INIT_KEY);
    const fresh = seedState();
    localStorage.setItem(INIT_KEY, '1');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    set({ ...fresh, currentUser: get().currentUser });
    toast.success('Demo data reset');
  },
}));

export const API_BASE_URL = API_BASE;
