import { useAppStore, severityRank } from '../store/appStore';

export function useActiveSignals() {
  const signals = useAppStore((s) => s.signals);
  return signals
    .filter((s) => s.status === 'active')
    .sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);
}

export function useSignal(id) {
  return useAppStore((s) => s.signals.find((sig) => sig.id === id));
}

export function useSignalCounts() {
  const active = useActiveSignals();
  return {
    total: active.length,
    critical: active.filter((s) => s.severity === 'critical').length,
    warning: active.filter((s) => s.severity === 'warning').length,
    watch: active.filter((s) => s.severity === 'watch').length,
  };
}
