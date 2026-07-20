import {
  activityItems,
  decisions,
  milestones,
  risks,
  statusUpdates,
  workItems,
  type DecisionItem,
  type DependencyItem,
  type Milestone,
  type RiskItem,
  type StatusUpdate,
  type WorkItem,
} from "./projectCommandCenter";

export type ProjectCommandCenterData = {
  phase: string;
  phaseDetail: string;
  health: "On track" | "At risk" | "Completed";
  nextMilestone: string;
  nextMilestoneDate: string;
  aiSummary: string;
  aiEvidence: string;
  primaryAttentionTitle: string;
  primaryAttentionDetail: string;
  milestones: Milestone[];
  workItems: WorkItem[];
  dependencies: DependencyItem[];
  risks: RiskItem[];
  decisions: DecisionItem[];
  statusUpdates: StatusUpdate[];
  activityItems: typeof activityItems;
};

const synohubCommandCenter: ProjectCommandCenterData = {
  phase: "Build",
  phaseDetail: "Command-center experience",
  health: "On track",
  nextMilestone: "Project command center",
  nextMilestoneDate: "Jul 29",
  aiSummary:
    "The project command-center milestone is on track, but the automation prototype may slip unless the AI approval policy is confirmed this week.",
  aiEvidence: "Based on milestone dates, SYN-38, the risk register, and the latest project decision.",
  primaryAttentionTitle: "SYN-38 needs an approval-policy decision",
  primaryAttentionDetail: "Blocking the automation prototype · Owner: Aakash",
  milestones,
  workItems,
  dependencies: [
    {
      id: "DEP-SYN-1",
      predecessorId: "SYN-31",
      successorId: "SYN-34",
      type: "Finish-to-start",
    },
  ],
  risks,
  decisions,
  statusUpdates,
  activityItems,
};

const monitoringWorkItems: WorkItem[] = [
  {
    id: "MON-12",
    title: "Confirm production host inventory",
    owner: "Aakash",
    dueDate: "Jul 19",
    priority: "High",
    status: "Done",
  },
  {
    id: "MON-14",
    title: "Configure uptime checks and alert routing",
    owner: "DevOps",
    dueDate: "Jul 24",
    priority: "High",
    status: "In progress",
  },
  {
    id: "MON-18",
    title: "Approve incident escalation policy",
    owner: "Parth",
    dueDate: "Jul 23",
    priority: "High",
    status: "Blocked",
  },
  {
    id: "MON-21",
    title: "Prepare weekly availability report",
    owner: "QA",
    dueDate: "Jul 29",
    priority: "Medium",
    status: "To do",
  },
];

const monitoringCommandCenter: ProjectCommandCenterData = {
  phase: "Configuration",
  phaseDetail: "Monitoring and alert rollout",
  health: "At risk",
  nextMilestone: "Production alerting ready",
  nextMilestoneDate: "Jul 31",
  aiSummary:
    "Monitoring configuration is progressing, but production escalation cannot be completed until the incident policy is approved.",
  aiEvidence: "Based on MON-18, the alerting milestone, and the current issue register.",
  primaryAttentionTitle: "MON-18 is blocking escalation setup",
  primaryAttentionDetail: "Incident policy approval required · Owner: Parth",
  milestones: [
    {
      name: "Inventory & access",
      owner: "Aakash",
      dueDate: "Jul 19, 2026",
      progress: 100,
      status: "Completed",
      deliverables: "Verified host inventory, access matrix, and environment ownership",
    },
    {
      name: "Production alerting",
      owner: "DevOps Team",
      dueDate: "Jul 31, 2026",
      progress: 55,
      status: "At risk",
      deliverables: "Uptime checks, routing rules, escalation policy, and on-call validation",
    },
  ],
  workItems: monitoringWorkItems,
  dependencies: [
    {
      id: "DEP-MON-1",
      predecessorId: "MON-12",
      successorId: "MON-14",
      type: "Finish-to-start",
    },
  ],
  risks: [
    {
      title: "Incident escalation policy is awaiting approval",
      type: "Issue",
      owner: "Parth Popat",
      severity: "High",
      response: "Approve severity definitions and the primary escalation chain.",
      reviewDate: "Jul 23, 2026",
    },
    {
      title: "Staging thresholds may create noisy production alerts",
      type: "Risk",
      owner: "DevOps Team",
      severity: "Medium",
      response: "Run a seven-day baseline and tune thresholds before enabling paging.",
      reviewDate: "Jul 28, 2026",
    },
  ],
  decisions: [
    {
      title: "Use service-based alert ownership",
      decision: "Alerts will route to the team responsible for the affected service.",
      owner: "Aakash",
      date: "Jul 18, 2026",
      context: "Service ownership reduces unnecessary escalation and shortens response time.",
    },
  ],
  statusUpdates: [
    {
      period: "Jul 14–20, 2026",
      health: "Amber",
      summary: "Host inventory is complete; alert rollout is waiting on escalation-policy approval.",
      highlights: ["Production hosts verified", "Initial uptime checks configured"],
      nextSteps: ["Approve escalation policy", "Validate paging in staging"],
      author: "Approved by Parth Popat · generated with Syno AI",
    },
  ],
  activityItems: [
    {
      time: "Today, 7:45 AM",
      actor: "DevOps Team",
      action: "Completed production host inventory verification.",
      type: "Monitoring",
    },
    {
      time: "Jul 19, 4:10 PM",
      actor: "Aakash",
      action: "Requested approval for the incident escalation policy.",
      type: "Issue",
    },
  ],
};

const portalWorkItems: WorkItem[] = [
  {
    id: "CP-81",
    title: "Complete customer onboarding flow",
    owner: "Aakash",
    dueDate: "Jul 5",
    priority: "High",
    status: "Done",
  },
  {
    id: "CP-84",
    title: "Run production acceptance tests",
    owner: "QA",
    dueDate: "Jul 8",
    priority: "High",
    status: "Done",
  },
  {
    id: "CP-89",
    title: "Publish support handover guide",
    owner: "Sneh",
    dueDate: "Jul 10",
    priority: "Medium",
    status: "Done",
  },
];

const portalCommandCenter: ProjectCommandCenterData = {
  phase: "Closed",
  phaseDetail: "Handover complete",
  health: "Completed",
  nextMilestone: "Post-launch review",
  nextMilestoneDate: "Jul 31",
  aiSummary:
    "Delivery and handover are complete. The remaining PM action is to capture post-launch lessons and confirm benefit ownership.",
  aiEvidence: "Based on completed CP work items, the final acceptance decision, and the closure update.",
  primaryAttentionTitle: "Schedule the post-launch review",
  primaryAttentionDetail: "Closure follow-up · Owner: Parth",
  milestones: [
    {
      name: "Client portal launch",
      owner: "Aakash",
      dueDate: "Jul 10, 2026",
      progress: 100,
      status: "Completed",
      deliverables: "Onboarding portal, acceptance sign-off, and support handover",
    },
  ],
  workItems: portalWorkItems,
  dependencies: [
    {
      id: "DEP-CP-1",
      predecessorId: "CP-81",
      successorId: "CP-84",
      type: "Finish-to-start",
    },
  ],
  risks: [],
  decisions: [
    {
      title: "Approve production launch",
      decision: "The client portal met acceptance criteria and was approved for launch.",
      owner: "Parth Popat",
      date: "Jul 10, 2026",
      context: "QA, security checks, and stakeholder acceptance were complete.",
    },
  ],
  statusUpdates: [
    {
      period: "Jul 6–10, 2026",
      health: "Green",
      summary: "The client portal launched successfully and ownership transferred to support.",
      highlights: ["Acceptance tests passed", "Support handover completed"],
      nextSteps: ["Run post-launch review", "Track adoption for 30 days"],
      author: "Parth Popat",
    },
  ],
  activityItems: [
    {
      time: "Jul 10, 5:00 PM",
      actor: "Parth Popat",
      action: "Approved production launch and project closure.",
      type: "Decision",
    },
  ],
};

const emptyCommandCenter: ProjectCommandCenterData = {
  phase: "Planning",
  phaseDetail: "Plan not yet defined",
  health: "On track",
  nextMilestone: "No milestone scheduled",
  nextMilestoneDate: "TBD",
  aiSummary:
    "This project does not have enough operational data for an evidence-backed summary yet.",
  aiEvidence: "No milestones, work items, risks, decisions, or status updates are available.",
  primaryAttentionTitle: "Complete the initial project plan",
  primaryAttentionDetail: "Add milestones, owners, and work items before requesting AI analysis.",
  milestones: [],
  workItems: [],
  dependencies: [],
  risks: [],
  decisions: [],
  statusUpdates: [],
  activityItems: [],
};

export function getProjectCommandCenterData(projectId: number): ProjectCommandCenterData {
  if (projectId === 1) return synohubCommandCenter;
  if (projectId === 2) return monitoringCommandCenter;
  if (projectId === 3) return portalCommandCenter;
  return emptyCommandCenter;
}
