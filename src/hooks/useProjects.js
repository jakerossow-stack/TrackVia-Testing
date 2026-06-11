import { useAppStore } from '../store/appStore';

export function useProjects() {
  return useAppStore((s) => s.projects);
}

export function useProject(id) {
  return useAppStore((s) => s.projects.find((p) => p.id === id));
}

export function useMostCriticalProject() {
  const projects = useAppStore((s) => s.projects);
  return [...projects].sort((a, b) => b.riskScore - a.riskScore)[0];
}
