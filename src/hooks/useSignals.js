import { useAppStore } from '../store/appStore';
import { useMemo } from 'react';

export function useSignals(filters = {}) {
  const signals = useAppStore(state => state.signals);

  const filtered = useMemo(() => {
    return signals.filter(s => {
      if (filters.severity && s.severity !== filters.severity) return false;
      if (filters.status && s.status !== filters.status) return false;
      if (filters.projectId && s.projectId !== filters.projectId) return false;
      if (filters.patternType && s.patternType !== filters.patternType) return false;
      return true;
    });
  }, [signals, filters]);

  const activeCount = useMemo(() => signals.filter(s => s.status === 'active').length, [signals]);
  const criticalCount = useMemo(() => signals.filter(s => s.severity === 'critical' && s.status === 'active').length, [signals]);

  return { signals: filtered, allSignals: signals, activeCount, criticalCount };
}
