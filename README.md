# TrackVia Signal

Predictive operations AI platform for field service and government contractor teams.
Signal monitors behavioral patterns across workflows and flags risk **6–9 days before failures occur** — not the day after.

## Quick start

```bash
npm install
cp .env.example .env       # add your ANTHROPIC_API_KEY (optional — see below)
npm run dev                # Vite frontend :5173 + Express AI proxy :3001
```

Open http://localhost:5173 and sign in with a demo account:

| Email | Password | Role |
|---|---|---|
| admin@meridiandefense.com | demo1234 | Admin |
| manager@meridiandefense.com | demo1234 | Manager |
| supervisor@meridiandefense.com | demo1234 | Supervisor |

## AI integration

All Claude API calls go through the Express backend (`server.js`) so the API key stays server-side:

- `POST /api/analyze-signal` — streamed 3-paragraph risk analysis (Risk tab, Signal Detail)
- `POST /api/employee-insight` — scheduling recommendation (Employee Profile)
- `POST /api/run-scan` — full behavioral scan returning risk updates + new signals ("Run scan now")

**No API key?** Every endpoint has a deterministic fallback, so the full product experience
(streaming analysis, scans, insights) works out of the box. Add `ANTHROPIC_API_KEY` to `.env`
to switch to live `claude-sonnet-4-20250514` responses.

## Tech

React 18 (hooks) · Tailwind CSS · Zustand (+ localStorage persistence) · React Router v6 ·
Recharts · Lucide React · react-hot-toast · Express AI proxy

## Things to try

1. **Dashboard** — click the event dots on the Fort Meade timeline to load signals into the right panel.
2. **Actions tab** — complete an action and watch the risk gauge animate down, the status re-tier, and a toast confirm.
3. **Run scan now** (topbar) — live scan with progress, results toast, and new-signal highlight flash.
4. **Settings → Alert Thresholds** — drag the sliders and watch the live gauge preview re-tier.
5. **Compliance** — export the DFARS report; note the FedRAMP boundary notice.
6. **Reset demo data** — Settings → General restores the original seed state.

State persists in localStorage (`signal_state_v1`); corrupted storage auto-reseeds with a toast.
