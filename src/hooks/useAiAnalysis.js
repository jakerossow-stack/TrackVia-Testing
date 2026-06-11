import { useState, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export function useAiAnalysis() {
  const [text, setText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  const analyzeSignal = useCallback(async (signalData, projectHistory = []) => {
    setText('');
    setIsStreaming(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/analyze-signal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signalData, projectHistory }),
      });
      if (!res.ok) throw new Error('API error');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setText(prev => prev + decoder.decode(value));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsStreaming(false);
    }
  }, []);

  const getEmployeeInsight = useCallback(async (employee) => {
    setText('');
    setIsStreaming(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/employee-insight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee }),
      });
      if (!res.ok) throw new Error('API error');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setText(prev => prev + decoder.decode(value));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsStreaming(false);
    }
  }, []);

  const refetch = useCallback(() => {
    setText('');
    setError(null);
  }, []);

  return { text, isStreaming, error, analyzeSignal, getEmployeeInsight, refetch };
}
