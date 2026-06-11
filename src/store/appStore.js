import { create } from 'zustand';
import { DEMO_USERS, SEED_ORGANIZATION, SEED_EMPLOYEES, SEED_PROJECTS, SEED_SIGNALS } from './seedData';

const STORAGE_KEY = 'trackvia_signal_state';
const INIT_KEY = 'signal_initialized';

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      currentUser: state.currentUser,
      signals: state.signals,
      projects: state.projects,
      employees: state.employees,
      organization: state.organization,
      dismissedAlerts: state.dismissedAlerts,
    }));
  } catch {}
}

const initialized = localStorage.getItem(INIT_KEY);
const saved = loadState();

const initialState = initialized && saved ? saved : {
  currentUser: null,
  signals: SEED_SIGNALS,
  projects: SEED_PROJECTS,
  employees: SEED_EMPLOYEES,
  organization: SEED_ORGANIZATION,
  dismissedAlerts: [],
};

export const useAppStore = create((set, get) => ({
  ...initialState,

  login: (email, password) => {
    const user = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (!user) return false;
    localStorage.setItem(INIT_KEY, 'true');
    set(state => {
      const newState = { ...state, currentUser: user };
      saveState(newState);
      return newState;
    });
    return true;
  },

  logout: () => {
    set(state => {
      const newState = { ...state, currentUser: null };
      saveState(newState);
      return newState;
    });
  },

  updateSignal: (id, updates) => {
    set(state => {
      const signals = state.signals.map(s => s.id === id ? { ...s, ...updates } : s);
      const newState = { ...state, signals };
      saveState(newState);
      return newState;
    });
  },

  dismissSignal: (id) => {
    set(state => {
      const signals = state.signals.map(s => s.id === id ? { ...s, status: 'dismissed' } : s);
      const newState = { ...state, signals };
      saveState(newState);
      return newState;
    });
  },

  updateAction: (signalId, actionId, updates) => {
    set(state => {
      const signals = state.signals.map(s => {
        if (s.id !== signalId) return s;
        return {
          ...s,
          recommendedActions: s.recommendedActions.map(a => a.id === actionId ? { ...a, ...updates } : a)
        };
      });
      const newState = { ...state, signals };
      saveState(newState);
      return newState;
    });
  },

  addSignalNote: (signalId, note) => {
    set(state => {
      const signals = state.signals.map(s => {
        if (s.id !== signalId) return s;
        return { ...s, notes: [...(s.notes || []), { id: `note_${Date.now()}`, text: note, createdAt: new Date().toISOString(), userId: state.currentUser?.id }] };
      });
      const newState = { ...state, signals };
      saveState(newState);
      return newState;
    });
  },

  dismissAlert: (id) => {
    set(state => {
      const newState = { ...state, dismissedAlerts: [...state.dismissedAlerts, id] };
      saveState(newState);
      return newState;
    });
  },

  updateEmployee: (id, updates) => {
    set(state => {
      const employees = state.employees.map(e => e.id === id ? { ...e, ...updates } : e);
      const newState = { ...state, employees };
      saveState(newState);
      return newState;
    });
  },
}));
