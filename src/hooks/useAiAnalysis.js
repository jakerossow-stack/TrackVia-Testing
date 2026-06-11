import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppStore, API_BASE_URL } from '../store/appStore';

// ---------------------------------------------------------------------------
// useAiAnalysis — streams /api/analyze-signal word-by-word for a signal.
// Caches the result on the signal in the store so revisits are instant.
// ---------------------------------------------------------------------------
export function useAiAnalysis(signal) {
  const setSignalAnalysis = useAppStore((s) => s.setSignalAnalysis);
  const projects = useAppStore((s) => s.projects);
  const employees = useAppStore((s) => s.employees);

  const [text, setText] = useState(signal?.aiAnalysis || '');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [generatedAt, setGeneratedAt] = useState(signal?.aiAnalysis ? 'earlier this session' : null);
  const abortRef = useRef(null);
  const signalIdRef = useRef(signal?.id);

  const run = useCallback(
    async (force = false) => {
      if (!signal) return;
      if (signal.aiAnalysis && !force) {
        setText(signal.aiAnalysis);
        return;
      }
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setText('');
      setError(null);
      setIsStreaming(true);
      try {
        const project = projects.find((p) => p.id === signal.projectId);
        const involved = employees.filter((e) => signal.involvedEmployees.includes(e.id));
        const res = await fetch(`${API_BASE_URL}/api/analyze-signal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            signalData: { ...signal, aiAnalysis: undefined, notes: undefined },
            projectHistory: project?.signalHistory?.slice(-14) || [],
            employeeData: involved.map(({ skills, ...e }) => ({ ...e, topSkills: skills })),
          }),
        });
        if (!res.ok || !res.body) throw new Error(`Analysis service returned ${res.status}`);
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let full = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          full += chunk;
          setText(full);
        }
        setSignalAnalysis(signal.id, full);
        setGeneratedAt(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Couldn\u2019t reach the analysis service. Check that the API server is running on port 3001.');
        }
      } finally {
        setIsStreaming(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [signal?.id]
  );

  useEffect(() => {
    if (signal?.id !== signalIdRef.current) {
      signalIdRef.current = signal?.id;
      setText(signal?.aiAnalysis || '');
      setError(null);
      setGeneratedAt(signal?.aiAnalysis ? 'earlier this session' : null);
    }
    if (signal && !signal.aiAnalysis) run();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signal?.id]);

  return { text, isStreaming, error, generatedAt, regenerate: () => run(true) };
}

// ---------------------------------------------------------------------------
// useEmployeeInsight — one-shot Claude scheduling recommendation
// ---------------------------------------------------------------------------
export function useEmployeeInsight(employee, recentTasks, team) {
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(async () => {
    if (!employee) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/employee-insight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee,
          recentTasks,
          teamContext: (team || []).map((e) => ({ name: e.name, role: e.role, skills: e.skills, utilizationPercent: e.utilizationPercent })),
        }),
      });
      if (!res.ok) throw new Error(`Insight service returned ${res.status}`);
      const data = await res.json();
      setInsight(data.insight || '');
    } catch {
      setError('Couldn\u2019t reach the insight service. Check that the API server is running on port 3001.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee?.id]);

  useEffect(() => {
    run();
  }, [run]);

  return { insight, loading, error, retry: run };
}
