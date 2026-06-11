import { useAppStore } from '../store/appStore';
import { useMemo } from 'react';

export function useProjects() {
  const projects = useAppStore(state => state.projects);
  const signals = useAppStore(state => state.signals);

  const projectsWithSignals = useMemo(() => {
    return projects.map(p => ({
      ...p,
      signals: signals.filter(s => s.projectId === p.id && s.status === 'active'),
    }));
  }, [projects, signals]);

  return { projects: projectsWithSignals };
}
