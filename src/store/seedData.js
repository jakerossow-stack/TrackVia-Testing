// All seed data for TrackVia Signal. Loaded into localStorage on first run.

const today = new Date();
const daysAgo = (n) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};
const hoursAgo = (n) => {
  const d = new Date(today);
  d.setHours(d.getHours() - n);
  return d.toISOString();
};

export const SEED_ORGANIZATION = {
  id: 'org_1',
  name: 'Meridian Defense Contractors',
  industry: 'defense_contractor',
  fedRampEnabled: true,
  employeeCount: 47,
  activeProjects: 8,
};

export const DEMO_USERS = [
  { id: 'user_1', name: 'Alex Reyes', email: 'admin@meridiandefense.com', password: 'demo1234', role: 'admin', avatarInitials: 'AR', organizationId: 'org_1' },
  { id: 'user_2', name: 'Morgan Chen', email: 'manager@meridiandefense.com', password: 'demo1234', role: 'manager', avatarInitials: 'MC', organizationId: 'org_1' },
  { id: 'user_3', name: 'Sam Whitfield', email: 'supervisor@meridiandefense.com', password: 'demo1234', role: 'supervisor', avatarInitials: 'SW', organizationId: 'org_1' },
];

// --- Fort Meade 28-day risk arc -------------------------------------------
// Starts ~28, climbs to 74 with the specified key events.
const FORT_MEADE_KEYFRAMES = [
  [0, 28, null, 'Baseline monitoring'],
  [3, 35, 'inspection_drift', 'First inspection drift detected'],
  [8, 48, 'task_ping_pong', 'Task reassignment pattern emerges'],
  [14, 57, null, 'Crosses warning threshold — alert triggered'],
  [20, 65, 'documentation_thinning', 'Documentation thinning begins'],
  [24, 69, null, 'Crosses critical threshold'],
  [28, 74, 'composite_risk', 'Today — still rising'],
];

function buildHistory(keyframes, totalDays) {
  const events = [];
  for (let day = 0; day <= totalDays; day++) {
    // interpolate between keyframes with a touch of jitter (deterministic)
    let prev = keyframes[0];
    let next = keyframes[keyframes.length - 1];
    for (let k = 0; k < keyframes.length - 1; k++) {
      if (day >= keyframes[k][0] && day <= keyframes[k + 1][0]) {
        prev = keyframes[k];
        next = keyframes[k + 1];
        break;
      }
    }
    const span = next[0] - prev[0] || 1;
    const t = (day - prev[0]) / span;
    const base = prev[1] + (next[1] - prev[1]) * t;
    const jitter = ((day * 7919) % 5) - 2; // -2..+2, deterministic
    const kf = keyframes.find((k) => k[0] === day);
    const score = kf ? kf[1] : Math.round(Math.max(0, Math.min(100, base + jitter * 0.6)));
    events.push({
      date: daysAgo(totalDays - day),
      riskScore: score,
      triggerType: kf ? kf[2] : null,
      note: kf ? kf[3] : '',
    });
  }
  return events;
}

const flatHistory = (start, end, totalDays, eventDay, eventType, eventNote) =>
  buildHistory(
    [
      [0, start, null, 'Baseline monitoring'],
      ...(eventDay != null ? [[eventDay, Math.round((start + end) / 2), eventType, eventNote]] : []),
      [totalDays, end, null, ''],
    ],
    totalDays
  );

export const SEED_PROJECTS = [
  {
    id: 'proj_1',
    name: 'Fort Meade Expansion',
    status: 'critical',
    riskScore: 74,
    riskTrend: 'rising',
    activeSignalCount: 4,
    startDate: daysAgo(120),
    endDate: daysAgo(-90),
    location: 'Fort Meade, MD',
    projectManager: 'emp_4',
    complianceFramework: 'dfars',
    signalHistory: buildHistory(FORT_MEADE_KEYFRAMES, 28),
  },
  {
    id: 'proj_2',
    name: 'Site 7 Infrastructure Upgrade',
    status: 'at_risk',
    riskScore: 58,
    riskTrend: 'rising',
    activeSignalCount: 2,
    startDate: daysAgo(75),
    endDate: daysAgo(-45),
    location: 'Aberdeen Proving Ground, MD',
    projectManager: 'emp_1',
    complianceFramework: 'cmmc',
    signalHistory: flatHistory(40, 58, 28, 16, 'utilization_spike', 'Utilization spike detected on HVAC crew'),
  },
  {
    id: 'proj_3',
    name: 'HQ HVAC Overhaul',
    status: 'on_track',
    riskScore: 31,
    riskTrend: 'stable',
    activeSignalCount: 1,
    startDate: daysAgo(50),
    endDate: daysAgo(-30),
    location: 'Columbia, MD',
    projectManager: 'emp_2',
    complianceFramework: 'osha',
    signalHistory: flatHistory(26, 31, 28, 12, 'documentation_thinning', 'Work order notes shortening'),
  },
  {
    id: 'proj_4',
    name: 'Annual Safety Review',
    status: 'on_track',
    riskScore: 18,
    riskTrend: 'falling',
    activeSignalCount: 0,
    startDate: daysAgo(30),
    endDate: daysAgo(-15),
    location: 'All sites',
    projectManager: 'emp_4',
    complianceFramework: 'osha',
    signalHistory: flatHistory(24, 18, 28, null, null, null),
  },
];

export const SEED_EMPLOYEES = [
  {
    id: 'emp_1', name: 'Marcus T.', initials: 'MT', role: 'Senior Field Tech', department: 'Field Operations',
    skills: { Electrical: 95, HVAC: 40, Plumbing: 30, Inspections: 88, Safety: 90, Equipment: 75 },
    utilizationPercent: 62, onTimeRate: 94, currentStreak: 12, weeklyTaskCount: 9, avgMatchScore: 91,
    clearanceLevel: 'secret', active: true,
  },
  {
    id: 'emp_2', name: 'Priya S.', initials: 'PS', role: 'HVAC Specialist', department: 'Mechanical',
    skills: { Electrical: 45, HVAC: 98, Plumbing: 55, Inspections: 80, Safety: 85, Equipment: 70 },
    utilizationPercent: 104, onTimeRate: 88, currentStreak: 4, weeklyTaskCount: 16, avgMatchScore: 86,
    clearanceLevel: 'confidential', active: true,
  },
  {
    id: 'emp_3', name: 'Diego R.', initials: 'DR', role: 'Plumbing & Pipefitting', department: 'Mechanical',
    skills: { Electrical: 30, HVAC: 35, Plumbing: 96, Inspections: 70, Safety: 80, Equipment: 65 },
    utilizationPercent: 78, onTimeRate: 91, currentStreak: 7, weeklyTaskCount: 11, avgMatchScore: 84,
    clearanceLevel: 'secret', active: true,
  },
  {
    id: 'emp_4', name: 'Keisha W.', initials: 'KW', role: 'Safety & Compliance', department: 'Compliance',
    skills: { Electrical: 55, HVAC: 50, Plumbing: 45, Inspections: 95, Safety: 99, Equipment: 80 },
    utilizationPercent: 85, onTimeRate: 97, currentStreak: 21, weeklyTaskCount: 8, avgMatchScore: 95,
    clearanceLevel: 'top_secret', active: true,
  },
  {
    id: 'emp_5', name: 'James O.', initials: 'JO', role: 'Equipment Technician', department: 'Field Operations',
    skills: { Electrical: 70, HVAC: 65, Plumbing: 40, Inspections: 75, Safety: 75, Equipment: 97 },
    utilizationPercent: 71, onTimeRate: 89, currentStreak: 5, weeklyTaskCount: 10, avgMatchScore: 88,
    clearanceLevel: 'confidential', active: true,
  },
];

export const SEED_SIGNALS = [
  {
    id: 'sig_1',
    projectId: 'proj_1',
    patternType: 'composite_risk',
    severity: 'critical',
    title: 'Compound failure pattern forming on Fort Meade Expansion',
    description:
      'Four independent behavioral patterns are now co-occurring and intensifying: inspections drifting past schedule, repeated task reassignment, thinning work-order documentation, and approval lag on change orders. Historically this combination precedes a stop-work incident.',
    detectedAt: hoursAgo(14),
    estimatedTimeToIncident: '6–9 days',
    confidencePercent: 87,
    status: 'active',
    involvedEmployees: ['emp_1', 'emp_4', 'emp_5'],
    evidenceItems: [
      { label: 'Inspection drift', value: 'Structural inspection 4 days overdue, electrical 2 days', severity: 'critical' },
      { label: 'Task ping-pong', value: 'WO-2241 reassigned 3× in 5 days', severity: 'critical' },
      { label: 'Documentation thinning', value: 'Field notes 38% shorter vs 30-day baseline', severity: 'warning' },
      { label: 'Approval lag', value: 'Change order CO-118 pending 6 days (avg: 1.4)', severity: 'warning' },
    ],
    aiAnalysis: '',
    recommendedActions: [
      { id: 'act_1', signalId: 'sig_1', description: 'Complete overdue structural inspection (Building C, Level 2)', assignedTo: 'emp_4', dueDate: daysAgo(-1), priority: 'high', status: 'pending', completedAt: null },
      { id: 'act_2', signalId: 'sig_1', description: 'Assign a single permanent owner to WO-2241 and lock reassignment', assignedTo: 'emp_1', dueDate: daysAgo(-2), priority: 'high', status: 'pending', completedAt: null },
      { id: 'act_3', signalId: 'sig_1', description: 'Escalate change order CO-118 to PM for same-day decision', assignedTo: null, dueDate: daysAgo(-2), priority: 'medium', status: 'pending', completedAt: null },
      { id: 'act_4', signalId: 'sig_1', description: 'Re-brief field crew on minimum documentation standard (photos + 3-line notes)', assignedTo: 'emp_5', dueDate: daysAgo(-3), priority: 'medium', status: 'pending', completedAt: null },
    ],
    notes: [
      { id: 'note_1', authorId: 'user_2', content: 'Flagged to site lead this morning — structural inspector is booked for Thursday.', createdAt: hoursAgo(6) },
    ],
  },
  {
    id: 'sig_2',
    projectId: 'proj_2',
    patternType: 'utilization_spike',
    severity: 'warning',
    title: 'Utilization spike: Priya S. sustained over capacity',
    description:
      'Priya S. has been at 104% utilization for 9 consecutive days, absorbing all HVAC-tagged work orders on Site 7. Sustained over-capacity historically precedes quality degradation and rework on this task class.',
    detectedAt: hoursAgo(30),
    estimatedTimeToIncident: '14 days',
    confidencePercent: 72,
    status: 'active',
    involvedEmployees: ['emp_2'],
    evidenceItems: [
      { label: 'Utilization', value: 'Priya S. at 104% for 9 consecutive days', severity: 'critical' },
      { label: 'Task concentration', value: '16 active tasks — 100% of Site 7 HVAC volume', severity: 'warning' },
      { label: 'On-time slippage', value: 'On-time rate down 88% → 84% over 2 weeks', severity: 'normal' },
    ],
    aiAnalysis: '',
    recommendedActions: [
      { id: 'act_5', signalId: 'sig_2', description: 'Rebalance 4 HVAC work orders from Priya S. to James O. (HVAC 65)', assignedTo: null, dueDate: daysAgo(-2), priority: 'high', status: 'pending', completedAt: null },
      { id: 'act_6', signalId: 'sig_2', description: 'Cap Priya S. weekly assignment at 12 tasks until utilization < 90%', assignedTo: 'emp_2', dueDate: daysAgo(-5), priority: 'medium', status: 'pending', completedAt: null },
    ],
    notes: [],
  },
  {
    id: 'sig_3',
    projectId: 'proj_3',
    patternType: 'documentation_thinning',
    severity: 'watch',
    title: 'Documentation thinning on HQ HVAC work orders',
    description:
      'Average work-order note length has dropped 31% over the last 12 days. Thinning documentation is an early-stage predictor of compliance findings during OSHA review.',
    detectedAt: hoursAgo(52),
    estimatedTimeToIncident: '21+ days',
    confidencePercent: 61,
    status: 'active',
    involvedEmployees: ['emp_2', 'emp_5'],
    evidenceItems: [
      { label: 'Note length', value: 'Avg notes 31% shorter over 12 days', severity: 'warning' },
      { label: 'Photo attachments', value: 'Photo rate down from 2.1 → 1.3 per closeout', severity: 'normal' },
    ],
    aiAnalysis: '',
    recommendedActions: [
      { id: 'act_7', signalId: 'sig_3', description: 'Enable required-fields template on HVAC closeout form', assignedTo: null, dueDate: daysAgo(-7), priority: 'low', status: 'pending', completedAt: null },
    ],
    notes: [],
  },
];

// --- Prediction history (for Intelligence pages + History tab) -------------
export const SEED_PREDICTIONS = [
  { id: 'pred_1', projectId: 'proj_1', patternType: 'inspection_drift', predictedAt: daysAgo(64), predictedOutcome: 'Missed inspection → stop-work within 8 days', actualOutcome: 'Inspection completed day 6 after intervention — incident avoided', correct: true, leadTimeDays: 8, costAvoided: 42000 },
  { id: 'pred_2', projectId: 'proj_2', patternType: 'maintenance_skip', predictedAt: daysAgo(51), predictedOutcome: 'Compressor failure within 12 days', actualOutcome: 'Preventive maintenance completed day 4 — no failure', correct: true, leadTimeDays: 12, costAvoided: 28500 },
  { id: 'pred_3', projectId: 'proj_3', patternType: 'approval_lag', predictedAt: daysAgo(45), predictedOutcome: 'Permit expiry → 3-day schedule slip', actualOutcome: 'Permit renewed in time after escalation', correct: true, leadTimeDays: 6, costAvoided: 15000 },
  { id: 'pred_4', projectId: 'proj_1', patternType: 'skill_task_mismatch', predictedAt: daysAgo(38), predictedOutcome: 'Rework on electrical rough-in within 10 days', actualOutcome: 'No rework occurred — crew self-corrected', correct: false, leadTimeDays: 10, costAvoided: 0 },
  { id: 'pred_5', projectId: 'proj_4', patternType: 'documentation_thinning', predictedAt: daysAgo(30), predictedOutcome: 'Audit finding on safety review docs', actualOutcome: 'Two findings issued — predicted 9 days prior', correct: true, leadTimeDays: 9, costAvoided: 8000 },
  { id: 'pred_6', projectId: 'proj_2', patternType: 'task_ping_pong', predictedAt: daysAgo(22), predictedOutcome: 'Work order stall → 2-day slip', actualOutcome: 'Owner assigned day 2 — schedule held', correct: true, leadTimeDays: 7, costAvoided: 11200 },
  { id: 'pred_7', projectId: 'proj_1', patternType: 'utilization_spike', predictedAt: daysAgo(15), predictedOutcome: 'Quality dip on overloaded crew within 14 days', actualOutcome: 'Pending — inside prediction window', correct: null, leadTimeDays: 14, costAvoided: 0 },
];

// --- Compliance events ------------------------------------------------------
export const SEED_COMPLIANCE_EVENTS = [
  { id: 'comp_1', date: daysAgo(330), type: 'Certification', description: 'CMMC Level 2 certification renewed', status: 'compliant', linkedSignalId: null, framework: 'cmmc' },
  { id: 'comp_2', date: daysAgo(270), type: 'Audit', description: 'DFARS 252.204-7012 annual audit — no findings', status: 'compliant', linkedSignalId: null, framework: 'dfars' },
  { id: 'comp_3', date: daysAgo(200), type: 'Finding', description: 'OSHA recordkeeping gap on Site 7 incident log', status: 'corrected', linkedSignalId: null, framework: 'osha' },
  { id: 'comp_4', date: daysAgo(155), type: 'Correction', description: 'Incident log remediation verified by compliance officer', status: 'compliant', linkedSignalId: null, framework: 'osha' },
  { id: 'comp_5', date: daysAgo(96), type: 'Audit', description: 'Quarterly NIST 800-171 self-assessment submitted (score 102/110)', status: 'compliant', linkedSignalId: null, framework: 'dfars' },
  { id: 'comp_6', date: daysAgo(30), type: 'Finding', description: 'Safety review documentation findings (2) — predicted by Signal 9 days prior', status: 'corrected', linkedSignalId: 'pred_5', framework: 'osha' },
  { id: 'comp_7', date: daysAgo(3), type: 'Monitoring', description: 'Documentation thinning watch opened on HQ HVAC closeouts', status: 'pending', linkedSignalId: 'sig_3', framework: 'osha' },
];

// --- Pattern library --------------------------------------------------------
export const PATTERN_LIBRARY = [
  { type: 'inspection_drift', name: 'Inspection Drift', icon: 'CalendarClock', tier: 'Critical predictor', description: 'Scheduled inspections sliding past due dates in a widening gap.', detail: 'Signal tracks the delta between scheduled and actual inspection completion. A widening gap across consecutive inspections is one of the strongest single predictors of stop-work events and compliance findings.' },
  { type: 'task_ping_pong', name: 'Task Ping-Pong', icon: 'Repeat', tier: 'Critical predictor', description: 'The same work order reassigned repeatedly without progress.', detail: 'Reassignment without state change means no one owns the outcome. Three or more reassignments in a week historically precedes a stall or quality miss on that work order.' },
  { type: 'approval_lag', name: 'Approval Lag', icon: 'Hourglass', tier: 'Warning predictor', description: 'Approvals and change orders aging far beyond the org baseline.', detail: 'When approvals sit multiple times longer than the rolling average, downstream tasks queue invisibly. Lag compounds into schedule slips that surface weeks later.' },
  { type: 'maintenance_skip', name: 'Maintenance Skip', icon: 'WrenchIcon', tier: 'Critical predictor', description: 'Preventive maintenance windows skipped or deferred.', detail: 'Deferred PM is the classic silent failure precursor. Signal flags consecutive skips on the same asset class before mean-time-to-failure statistics catch up.' },
  { type: 'skill_task_mismatch', name: 'Skill–Task Mismatch', icon: 'Puzzle', tier: 'Warning predictor', description: 'Work assigned to people whose skill profile doesn\u2019t fit it.', detail: 'Match score below 60 on consecutive assignments predicts rework. Often a symptom of capacity pressure elsewhere on the team.' },
  { type: 'utilization_spike', name: 'Utilization Spike', icon: 'Gauge', tier: 'Warning predictor', description: 'A person or crew sustained above healthy capacity.', detail: 'Sustained utilization over 95% degrades quality before it degrades schedule. The damage shows up as rework two weeks later, not as missed deadlines today.' },
  { type: 'documentation_thinning', name: 'Documentation Thinning', icon: 'FileMinus', tier: 'Watch', description: 'Work-order notes and attachments getting steadily shorter.', detail: 'Thinning documentation is an early-stage signal — it usually means crews are rushed or disengaged, and it removes the paper trail audits depend on.' },
  { type: 'notification_suppression', name: 'Notification Suppression', icon: 'BellOff', tier: 'Watch', description: 'Alerts being dismissed or muted without follow-through.', detail: 'When operators mute the system that warns them, risk doesn\u2019t go away — visibility does. Signal tracks dismiss-without-action rates per user and project.' },
  { type: 'composite_risk', name: 'Composite Risk', icon: 'Network', tier: 'Critical predictor', description: 'Multiple independent patterns co-occurring on one project.', detail: 'The flagship pattern. Independent weak signals that co-occur and intensify together multiply each other\u2019s predictive power. This is how Signal calls incidents 6–9 days out.' },
];

export const PATTERN_META = Object.fromEntries(PATTERN_LIBRARY.map((p) => [p.type, p]));

// --- Weekly schedule blocks (for employee profile) --------------------------
export const SEED_SCHEDULES = {
  emp_1: [['Panel upgrade — Bldg C', 'Electrical'], ['Inspection prep', 'Inspections'], ['Conduit rough-in', 'Electrical'], ['Safety walk', 'Safety'], ['Open']],
  emp_2: [['RTU-4 replacement', 'HVAC'], ['RTU-4 replacement', 'HVAC'], ['Chiller diagnostics', 'HVAC'], ['Duct balancing', 'HVAC'], ['VAV calibration', 'HVAC']],
  emp_3: [['Backflow testing', 'Plumbing'], ['Pipe re-route — Site 7', 'Plumbing'], ['Open'], ['Fixture install', 'Plumbing'], ['Hydro test', 'Plumbing']],
  emp_4: [['DFARS audit prep', 'Inspections'], ['Site safety review', 'Safety'], ['Structural inspection', 'Inspections'], ['Training session', 'Safety'], ['Documentation review', 'Inspections']],
  emp_5: [['Generator service', 'Equipment'], ['Lift certification', 'Equipment'], ['Tool crib audit', 'Equipment'], ['Open'], ['Crane inspection support', 'Equipment']],
};

export const SEED_TASK_HISTORY = {
  emp_1: [
    { task: 'Electrical panel inspection — Bldg A', outcome: 96, date: daysAgo(2) },
    { task: 'Conduit installation QC', outcome: 92, date: daysAgo(4) },
    { task: 'Emergency lighting test', outcome: 95, date: daysAgo(6) },
    { task: 'HVAC assist (cross-trade)', outcome: 71, date: daysAgo(9) },
    { task: 'Grounding system verification', outcome: 94, date: daysAgo(11) },
  ],
  emp_2: [
    { task: 'RTU-3 compressor replacement', outcome: 90, date: daysAgo(1) },
    { task: 'Chiller seasonal startup', outcome: 88, date: daysAgo(3) },
    { task: 'VAV box troubleshooting ×4', outcome: 82, date: daysAgo(5) },
    { task: 'Duct leakage test', outcome: 79, date: daysAgo(7) },
    { task: 'Boiler combustion analysis', outcome: 91, date: daysAgo(10) },
  ],
  emp_3: [
    { task: 'Backflow preventer certification', outcome: 93, date: daysAgo(2) },
    { task: 'Main line re-route — Site 7', outcome: 89, date: daysAgo(5) },
    { task: 'Fixture rough-in — Bldg C', outcome: 91, date: daysAgo(8) },
  ],
  emp_4: [
    { task: 'Quarterly safety audit — all sites', outcome: 98, date: daysAgo(3) },
    { task: 'Fall protection inspection', outcome: 97, date: daysAgo(6) },
    { task: 'DFARS documentation review', outcome: 95, date: daysAgo(9) },
  ],
  emp_5: [
    { task: 'Generator load bank test', outcome: 96, date: daysAgo(1) },
    { task: 'Scissor lift annual service', outcome: 94, date: daysAgo(4) },
    { task: 'Plumbing assist (cross-trade)', outcome: 68, date: daysAgo(7) },
  ],
};

export const SEED_SETTINGS = {
  warningThreshold: 50,
  criticalThreshold: 70,
  dataRetentionDays: 365,
  patternWeights: Object.fromEntries(PATTERN_LIBRARY.map((p) => [p.type, { enabled: true, weight: 3 }])),
  integration: { connected: true, lastSync: hoursAgo(2) },
};
