export const DEMO_USERS = [
  { id: 'user_1', name: 'Alex Morgan', email: 'admin@meridiandefense.com', password: 'demo1234', role: 'admin', avatarInitials: 'AM', organizationId: 'org_1' },
  { id: 'user_2', name: 'Sam Chen', email: 'manager@meridiandefense.com', password: 'demo1234', role: 'manager', avatarInitials: 'SC', organizationId: 'org_1' },
  { id: 'user_3', name: 'Jordan Lee', email: 'supervisor@meridiandefense.com', password: 'demo1234', role: 'supervisor', avatarInitials: 'JL', organizationId: 'org_1' },
];

export const SEED_ORGANIZATION = {
  id: 'org_1',
  name: 'Meridian Defense Contractors',
  industry: 'defense_contractor',
  fedRampEnabled: true,
  employeeCount: 47,
  activeProjects: 8,
};

export const SEED_EMPLOYEES = [
  { id: 'emp_1', name: 'Marcus T.', initials: 'MT', role: 'Senior Field Tech', department: 'Field Operations', skills: { Electrical: 95, HVAC: 40, Plumbing: 30, Inspections: 88, Safety: 90, Equipment: 75 }, utilizationPercent: 62, onTimeRate: 94, currentStreak: 12, weeklyTaskCount: 8, avgMatchScore: 91, clearanceLevel: 'secret', active: true },
  { id: 'emp_2', name: 'Priya S.', initials: 'PS', role: 'HVAC Specialist', department: 'Mechanical', skills: { Electrical: 45, HVAC: 98, Plumbing: 55, Inspections: 80, Safety: 85, Equipment: 70 }, utilizationPercent: 104, onTimeRate: 78, currentStreak: 3, weeklyTaskCount: 14, avgMatchScore: 85, clearanceLevel: 'confidential', active: true },
  { id: 'emp_3', name: 'Diego R.', initials: 'DR', role: 'Plumbing & Pipefitting', department: 'Plumbing', skills: { Electrical: 30, HVAC: 35, Plumbing: 96, Inspections: 70, Safety: 80, Equipment: 65 }, utilizationPercent: 78, onTimeRate: 89, currentStreak: 7, weeklyTaskCount: 9, avgMatchScore: 88, clearanceLevel: 'secret', active: true },
  { id: 'emp_4', name: 'Keisha W.', initials: 'KW', role: 'Safety & Compliance', department: 'Compliance', skills: { Electrical: 55, HVAC: 50, Plumbing: 45, Inspections: 95, Safety: 99, Equipment: 80 }, utilizationPercent: 85, onTimeRate: 97, currentStreak: 21, weeklyTaskCount: 11, avgMatchScore: 93, clearanceLevel: 'top_secret', active: true },
  { id: 'emp_5', name: 'James O.', initials: 'JO', role: 'Equipment Technician', department: 'Equipment', skills: { Electrical: 70, HVAC: 65, Plumbing: 40, Inspections: 75, Safety: 75, Equipment: 97 }, utilizationPercent: 71, onTimeRate: 91, currentStreak: 9, weeklyTaskCount: 7, avgMatchScore: 87, clearanceLevel: 'confidential', active: true },
];

const fortMeadeHistory = [];
const baseScores = [28,30,32,33,35,37,39,42,44,46,48,50,52,54,57,58,60,62,64,65,66,67,68,69,70,71,72,74];
for (let i = 0; i < 28; i++) {
  const date = new Date();
  date.setDate(date.getDate() - (27 - i));
  fortMeadeHistory.push({
    date: date.toISOString().split('T')[0],
    riskScore: baseScores[i],
    triggerType: i === 2 ? 'inspection_drift' : i === 7 ? 'task_ping_pong' : i === 13 ? 'approval_lag' : i === 19 ? 'documentation_thinning' : null,
    note: i === 2 ? 'First inspection drift detected' : i === 7 ? 'Task reassignment pattern emerges' : i === 13 ? 'Crosses warning threshold' : i === 19 ? 'Documentation thinning begins' : i === 23 ? 'Crosses critical threshold' : '',
  });
}

export const SEED_PROJECTS = [
  {
    id: 'proj_1', name: 'Fort Meade Expansion', status: 'critical', riskScore: 74, riskTrend: 'rising',
    activeSignalCount: 4, startDate: '2024-01-15', endDate: '2024-08-30',
    location: 'Fort Meade, MD', projectManager: 'emp_4', complianceFramework: 'dfars',
    signalHistory: fortMeadeHistory,
  },
  {
    id: 'proj_2', name: 'Site 7 Infrastructure Upgrade', status: 'at_risk', riskScore: 58, riskTrend: 'rising',
    activeSignalCount: 2, startDate: '2024-02-01', endDate: '2024-07-15',
    location: 'Quantico, VA', projectManager: 'emp_1', complianceFramework: 'cmmc',
    signalHistory: Array.from({length: 28}, (_, i) => {
      const date = new Date(); date.setDate(date.getDate() - (27-i));
      return { date: date.toISOString().split('T')[0], riskScore: Math.round(30 + (i * 1.0) + Math.random() * 5), triggerType: null, note: '' };
    }),
  },
  {
    id: 'proj_3', name: 'HQ HVAC Overhaul', status: 'on_track', riskScore: 31, riskTrend: 'stable',
    activeSignalCount: 1, startDate: '2024-03-01', endDate: '2024-06-30',
    location: 'Arlington, VA', projectManager: 'emp_2', complianceFramework: 'osha',
    signalHistory: Array.from({length: 28}, (_, i) => {
      const date = new Date(); date.setDate(date.getDate() - (27-i));
      return { date: date.toISOString().split('T')[0], riskScore: Math.round(25 + Math.sin(i/3) * 8 + Math.random() * 3), triggerType: null, note: '' };
    }),
  },
  {
    id: 'proj_4', name: 'Annual Safety Review', status: 'on_track', riskScore: 18, riskTrend: 'falling',
    activeSignalCount: 0, startDate: '2024-01-01', endDate: '2024-12-31',
    location: 'Multiple Sites', projectManager: 'emp_4', complianceFramework: 'osha',
    signalHistory: Array.from({length: 28}, (_, i) => {
      const date = new Date(); date.setDate(date.getDate() - (27-i));
      return { date: date.toISOString().split('T')[0], riskScore: Math.round(28 - (i * 0.35) + Math.random() * 3), triggerType: null, note: '' };
    }),
  },
];

export const SEED_SIGNALS = [
  {
    id: 'sig_1', projectId: 'proj_1', patternType: 'composite_risk',
    severity: 'critical', title: 'Compound failure pattern detected — Fort Meade Expansion',
    description: 'Four behavioral patterns are converging simultaneously: inspection drift (9 days overdue), task ping-pong (reassigned 4× in 6 days), documentation thinning (notes 34% shorter), and approval lag (3 items >72hrs pending). This combination has an 87% historical correlation with project delays exceeding 3 weeks.',
    detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    estimatedTimeToIncident: '6–9 days',
    confidencePercent: 87,
    status: 'active',
    involvedEmployees: ['emp_1', 'emp_2', 'emp_4'],
    evidenceItems: [
      { label: 'Inspection overdue', value: '9 days past schedule', severity: 'critical' },
      { label: 'Task reassignments', value: '4× in 6 days (Task #FM-2847)', severity: 'critical' },
      { label: 'Avg note length', value: 'Down 34% over 12 days', severity: 'warning' },
      { label: 'Pending approvals', value: '3 items >72hrs (DFARS items)', severity: 'critical' },
    ],
    aiAnalysis: '',
    recommendedActions: [
      { id: 'act_1', signalId: 'sig_1', description: 'Conduct emergency inspection for all overdue items on Fort Meade Expansion', assignedTo: 'emp_4', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], priority: 'high', status: 'pending', completedAt: null },
      { id: 'act_2', signalId: 'sig_1', description: 'Resolve task ownership for Task #FM-2847 — assign permanent owner and freeze reassignments', assignedTo: 'emp_1', dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], priority: 'high', status: 'pending', completedAt: null },
      { id: 'act_3', signalId: 'sig_1', description: 'Escalate 3 pending DFARS approval items to program manager for immediate review', assignedTo: null, dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], priority: 'high', status: 'pending', completedAt: null },
    ],
    notes: [],
  },
  {
    id: 'sig_2', projectId: 'proj_2', patternType: 'utilization_spike',
    severity: 'warning', title: 'HVAC specialist over-capacity — quality risk emerging',
    description: 'Priya S. is operating at 104% utilization across Site 7 tasks. Over-capacity workers show a 3× higher defect rate after 2 consecutive weeks above 95%. She is currently in week 3 of over-capacity status.',
    detectedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    estimatedTimeToIncident: '14 days',
    confidencePercent: 72,
    status: 'active',
    involvedEmployees: ['emp_2'],
    evidenceItems: [
      { label: 'Current utilization', value: '104% (Priya S.)', severity: 'critical' },
      { label: 'Weeks over-capacity', value: '3 consecutive weeks', severity: 'warning' },
      { label: 'On-time rate trend', value: 'Down from 91% → 78% this month', severity: 'warning' },
    ],
    aiAnalysis: '',
    recommendedActions: [
      { id: 'act_4', signalId: 'sig_2', description: "Redistribute 20% of Priya's workload to James O. (Equipment Tech, 71% utilization, HVAC score: 65)", assignedTo: 'emp_1', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], priority: 'medium', status: 'pending', completedAt: null },
    ],
    notes: [],
  },
  {
    id: 'sig_3', projectId: 'proj_3', patternType: 'documentation_thinning',
    severity: 'watch', title: 'Documentation quality declining — HQ HVAC Overhaul',
    description: 'Field notes on HQ HVAC tasks have become progressively shorter over the past 12 days, averaging 31% fewer characters. This pattern often precedes compliance findings when work involves OSHA-regulated systems.',
    detectedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    estimatedTimeToIncident: '21+ days',
    confidencePercent: 61,
    status: 'active',
    involvedEmployees: ['emp_2', 'emp_3'],
    evidenceItems: [
      { label: 'Avg note length reduction', value: '31% shorter over 12 days', severity: 'warning' },
      { label: 'Tasks with minimal notes', value: '7 of last 10 tasks (<50 chars)', severity: 'warning' },
    ],
    aiAnalysis: '',
    recommendedActions: [
      { id: 'act_5', signalId: 'sig_3', description: 'Send documentation quality reminder to HQ HVAC team with OSHA requirement checklist', assignedTo: 'emp_4', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], priority: 'low', status: 'pending', completedAt: null },
    ],
    notes: [],
  },
];

export const PATTERN_TYPES = [
  { type: 'inspection_drift', name: 'Inspection Drift', description: 'Inspections consistently delayed or skipped', severity: 'critical', icon: 'Search' },
  { type: 'task_ping_pong', name: 'Task Ping-Pong', description: 'Tasks reassigned repeatedly without resolution', severity: 'critical', icon: 'ArrowLeftRight' },
  { type: 'approval_lag', name: 'Approval Lag', description: 'Approvals consistently delayed past SLA', severity: 'warning', icon: 'Clock' },
  { type: 'maintenance_skip', name: 'Maintenance Skip', description: 'Scheduled maintenance bypassed or deferred', severity: 'warning', icon: 'Wrench' },
  { type: 'skill_task_mismatch', name: 'Skill-Task Mismatch', description: 'Workers assigned outside their skill profile', severity: 'warning', icon: 'UserX' },
  { type: 'utilization_spike', name: 'Utilization Spike', description: 'Worker capacity exceeded for extended period', severity: 'warning', icon: 'TrendingUp' },
  { type: 'documentation_thinning', name: 'Documentation Thinning', description: 'Field notes becoming shorter or less complete', severity: 'watch', icon: 'FileText' },
  { type: 'notification_suppression', name: 'Notification Suppression', description: 'Alert acknowledgments without follow-up action', severity: 'watch', icon: 'BellOff' },
  { type: 'composite_risk', name: 'Composite Risk', description: 'Multiple patterns converging into compound risk', severity: 'critical', icon: 'AlertTriangle' },
];
