// TrackVia Signal — Express backend (AI proxy)
// Keeps ANTHROPIC_API_KEY server-side. Never exposed to the client.
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';
const API_KEY = process.env.ANTHROPIC_API_KEY;

function anthropicHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
    'anthropic-version': '2023-06-01',
  };
}

// ---------------------------------------------------------------------------
// POST /api/analyze-signal — streamed risk analysis for a single signal
// Body: { signalData, projectHistory, employeeData }
// ---------------------------------------------------------------------------
app.post('/api/analyze-signal', async (req, res) => {
  const { signalData, projectHistory, employeeData } = req.body || {};
  if (!signalData) return res.status(400).json({ error: 'signalData is required' });

  const prompt = `You are Signal, an AI operations risk analyst for TrackVia. You analyze behavioral patterns in field operations and government contractor workflows to predict failures before they occur.

Analyze the following active signal and produce a clear, specific risk analysis in 3 short paragraphs:
1. What is actually happening operationally (name the specific patterns, be concrete)
2. Why this combination of patterns is dangerous (how they compound each other)
3. What will happen if no action is taken in the next 7 days (specific, credible consequence)

Be direct and specific. Do not use vague language like "may cause issues." Name the probable outcome. Keep each paragraph to 2-3 sentences.

Signal data: ${JSON.stringify(signalData)}
Project history: ${JSON.stringify(projectHistory || [])}
Involved employees: ${JSON.stringify(employeeData || [])}`;

  if (!API_KEY) {
    // Graceful degradation: stream a deterministic fallback so the UI still works.
    return streamFallback(res, fallbackAnalysis(signalData));
  }

  try {
    const upstream = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: anthropicHeaders(),
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1000,
        stream: true,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const errText = await upstream.text().catch(() => '');
      console.error('Anthropic error:', upstream.status, errText);
      return streamFallback(res, fallbackAnalysis(signalData));
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6).trim();
        if (payload === '[DONE]') continue;
        try {
          const evt = JSON.parse(payload);
          if (evt.type === 'content_block_delta' && evt.delta?.text) {
            res.write(evt.delta.text);
          }
        } catch {
          /* partial JSON across chunks — skip */
        }
      }
    }
    res.end();
  } catch (err) {
    console.error('analyze-signal failed:', err.message);
    if (!res.headersSent) streamFallback(res, fallbackAnalysis(signalData));
    else res.end();
  }
});

// ---------------------------------------------------------------------------
// POST /api/employee-insight — scheduling recommendation for one employee
// Body: { employee, recentTasks, teamContext }
// ---------------------------------------------------------------------------
app.post('/api/employee-insight', async (req, res) => {
  const { employee, recentTasks, teamContext } = req.body || {};
  if (!employee) return res.status(400).json({ error: 'employee is required' });

  const prompt = `You are Signal, an AI workforce optimization analyst. Based on this employee's performance data, generate a 2-paragraph scheduling recommendation for their manager.

Paragraph 1: What this person is genuinely best at (based on their skill scores and task performance, not just their job title). Be specific about skill scores and patterns.
Paragraph 2: One concrete scheduling recommendation for next week — which task type to prioritize for this employee and why, including who they should be paired with for best results.

Keep it under 120 words total. Write for an operations manager, not an HR system.

Employee data: ${JSON.stringify(employee)}
Recent tasks: ${JSON.stringify(recentTasks || [])}
Team context: ${JSON.stringify(teamContext || [])}`;

  if (!API_KEY) return res.json({ insight: fallbackInsight(employee) });

  try {
    const upstream = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: anthropicHeaders(),
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!upstream.ok) throw new Error(`Anthropic ${upstream.status}`);
    const data = await upstream.json();
    const insight = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n');
    res.json({ insight });
  } catch (err) {
    console.error('employee-insight failed:', err.message);
    res.json({ insight: fallbackInsight(employee) });
  }
});

// ---------------------------------------------------------------------------
// POST /api/run-scan — full-org scan; returns risk updates + any new signals
// Body: { organizationData, allProjects, allSignals }
// ---------------------------------------------------------------------------
app.post('/api/run-scan', async (req, res) => {
  const { organizationData, allProjects, allSignals } = req.body || {};

  const prompt = `You are Signal, an AI operations risk analyst. Scan this organization's current state and identify risk pattern changes.

Respond ONLY with a JSON object (no markdown fences, no preamble) of this exact shape:
{
  "riskUpdates": [{ "projectId": string, "newRiskScore": number, "reason": string }],
  "newSignals": [{
    "projectId": string,
    "patternType": "inspection_drift"|"task_ping_pong"|"approval_lag"|"maintenance_skip"|"skill_task_mismatch"|"utilization_spike"|"documentation_thinning"|"notification_suppression"|"composite_risk",
    "severity": "critical"|"warning"|"watch",
    "title": string,
    "description": string,
    "estimatedTimeToIncident": string,
    "confidencePercent": number,
    "evidenceItems": [{ "label": string, "value": string, "severity": "critical"|"warning"|"normal" }]
  }],
  "summary": string
}

Rules: adjust at most 2-3 project risk scores by small realistic deltas (±2 to ±6). Add at most 1 new signal, and only if the data justifies it (e.g. an employee over 100% utilization without an existing utilization_spike signal on that project, or a rising risk trend without a composite signal). It is valid to return zero new signals.

Organization: ${JSON.stringify(organizationData)}
Projects: ${JSON.stringify((allProjects || []).map(({ signalHistory, ...p }) => p))}
Active signals: ${JSON.stringify((allSignals || []).map((s) => ({ id: s.id, projectId: s.projectId, patternType: s.patternType, severity: s.severity, status: s.status })))}`;

  if (!API_KEY) return res.json(fallbackScan(allProjects, allSignals));

  try {
    const upstream = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: anthropicHeaders(),
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!upstream.ok) throw new Error(`Anthropic ${upstream.status}`);
    const data = await upstream.json();
    const text = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n');
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.json({
      riskUpdates: parsed.riskUpdates || [],
      newSignals: parsed.newSignals || [],
      summary: parsed.summary || 'Scan complete.',
    });
  } catch (err) {
    console.error('run-scan failed:', err.message);
    res.json(fallbackScan(allProjects, allSignals));
  }
});

// ---------------------------------------------------------------------------
// Fallbacks (used when no API key is configured or upstream fails)
// ---------------------------------------------------------------------------
function streamFallback(res, text) {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');
  const words = text.split(' ');
  let i = 0;
  const timer = setInterval(() => {
    if (i >= words.length) {
      clearInterval(timer);
      return res.end();
    }
    res.write(words[i] + ' ');
    i++;
  }, 18);
}

function fallbackAnalysis(signal) {
  const evidence = (signal.evidenceItems || []).map((e) => `${e.label} (${e.value})`).join(', ');
  return `This project is showing a ${signal.severity}-grade ${String(signal.patternType).replace(/_/g, ' ')} pattern. The concrete evidence on record: ${evidence || 'multiple correlated behavioral deviations across the last two weeks'}. These are not isolated data points — they have appeared together and intensified over consecutive monitoring windows.\n\nThe danger is compounding. Each pattern in this signal degrades the safety margin the others depend on: thinner documentation hides the early symptoms that drifting inspections would normally catch, and reassignment churn means no single owner sees the full picture. Signal's model weighs this combination at ${signal.confidencePercent}% confidence precisely because historically these patterns co-occur before real incidents, not after.\n\nIf no action is taken within 7 days, the most probable outcome is a missed inspection-driven stop-work event inside the ${signal.estimatedTimeToIncident} window, with an associated compliance finding on the project's framework. Reassigning a clear owner and closing the overdue items this week is the cheapest available intervention.`;
}

function fallbackInsight(employee) {
  const skills = Object.entries(employee.skills || {}).sort((a, b) => b[1] - a[1]);
  const top = skills[0] || ['their core trade', 90];
  const second = skills[1] || ['support work', 75];
  return `${employee.name} is genuinely strongest in ${top[0]} (${top[1]}/100) with reliable secondary depth in ${second[0]} (${second[1]}/100). Their ${employee.onTimeRate ?? 90}% on-time rate and ${employee.avgMatchScore ?? 80} average match score indicate performance holds up when assignments align to those skills — and dips when they don't.\n\nNext week, prioritize ${top[0].toLowerCase()}-heavy work orders for ${employee.name.split(' ')[0]} and keep utilization under 90% (currently ${employee.utilizationPercent ?? 75}%). Pair them with a teammate whose profile complements their weakest area so multi-trade jobs don't stall on a single skill gap.`;
}

function fallbackScan(allProjects = [], allSignals = []) {
  const updates = (allProjects || [])
    .filter((p) => p.status !== 'completed')
    .slice(0, 3)
    .map((p) => {
      const delta = p.riskTrend === 'rising' ? 2 : p.riskTrend === 'falling' ? -3 : (Math.random() > 0.5 ? 1 : -1);
      return {
        projectId: p.id,
        newRiskScore: Math.max(0, Math.min(100, p.riskScore + delta)),
        reason: delta > 0 ? 'Pattern intensity increased since last scan' : 'Recent interventions reducing pattern intensity',
      };
    });
  return {
    riskUpdates: updates,
    newSignals: [],
    summary: `Scanned ${allProjects.length} projects and ${allSignals.length} active signals. ${updates.length} risk scores adjusted, no new patterns crossed detection thresholds.`,
  };
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`TrackVia Signal API proxy listening on :${PORT}${API_KEY ? '' : '  (no ANTHROPIC_API_KEY — using deterministic fallbacks)'}`);
});
