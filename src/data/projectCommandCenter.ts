export type CommandCenterTab =
  | "overview"
  | "plan"
  | "work"
  | "risks"
  | "decisions"
  | "updates"
  | "activity";

export type Milestone = {
  name: string;
  owner: string;
  dueDate: string;
  progress: number;
  status: "Completed" | "On track" | "At risk";
  deliverables: string;
};

export type WorkItem = {
  id: string;
  title: string;
  owner: string;
  dueDate: string;
  priority: "High" | "Medium" | "Low";
  status: "To do" | "In progress" | "Blocked" | "Done";
};

export type DependencyItem = {
  id: string;
  predecessorId: string;
  successorId: string;
  type: "Finish-to-start" | "Start-to-start" | "Finish-to-finish";
};

export type RiskItem = {
  title: string;
  type: "Risk" | "Issue";
  owner: string;
  severity: "High" | "Medium" | "Low";
  response: string;
  reviewDate: string;
};

export type DecisionItem = {
  title: string;
  decision: string;
  owner: string;
  date: string;
  context: string;
};

export type StatusUpdate = {
  period: string;
  health: "Green" | "Amber" | "Red";
  summary: string;
  highlights: string[];
  nextSteps: string[];
  author: string;
};

export const commandCenterTabs: { id: CommandCenterTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "plan", label: "Plan" },
  { id: "work", label: "Work" },
  { id: "risks", label: "Risks & issues" },
  { id: "decisions", label: "Decisions" },
  { id: "updates", label: "Updates" },
  { id: "activity", label: "Activity" },
];

export const milestones: Milestone[] = [
  {
    name: "Foundation & UX",
    owner: "Kishan Bhatt",
    dueDate: "Jul 24, 2026",
    progress: 100,
    status: "Completed",
    deliverables: "Project structure, navigation, core dashboard patterns",
  },
  {
    name: "Project command center",
    owner: "Parth Popat",
    dueDate: "Jul 29, 2026",
    progress: 68,
    status: "On track",
    deliverables: "Overview, planning, work, risk, decision, and reporting surfaces",
  },
  {
    name: "Workflow automation prototype",
    owner: "Aakash",
    dueDate: "Aug 12, 2026",
    progress: 20,
    status: "At risk",
    deliverables: "AI briefing, status draft, and approval workflow prototype",
  },
];

export const workItems: WorkItem[] = [
  {
    id: "SYN-31",
    title: "Finalize command-center information architecture",
    owner: "Parth",
    dueDate: "Jul 22",
    priority: "High",
    status: "Done",
  },
  {
    id: "SYN-34",
    title: "Build project health overview",
    owner: "Kishan",
    dueDate: "Jul 24",
    priority: "High",
    status: "In progress",
  },
  {
    id: "SYN-38",
    title: "Define AI recommendation approval states",
    owner: "Aakash",
    dueDate: "Jul 27",
    priority: "High",
    status: "Blocked",
  },
  {
    id: "SYN-41",
    title: "Prepare status-update template",
    owner: "Sneh",
    dueDate: "Jul 28",
    priority: "Medium",
    status: "To do",
  },
  {
    id: "SYN-43",
    title: "Review GitHub integration requirements",
    owner: "Aakash",
    dueDate: "Jul 30",
    priority: "Medium",
    status: "To do",
  },
  {
    id: "SYN-29",
    title: "Create project details route",
    owner: "Kishan",
    dueDate: "Jul 20",
    priority: "High",
    status: "Done",
  },
];

export const risks: RiskItem[] = [
  {
    title: "AI approval policy is not finalized",
    type: "Issue",
    owner: "Parth Popat",
    severity: "High",
    response: "Confirm which AI actions require approval before building automation rules.",
    reviewDate: "Jul 23, 2026",
  },
  {
    title: "GitHub and task-provider schemas may diverge",
    type: "Risk",
    owner: "Aakash",
    severity: "Medium",
    response: "Define one canonical work-item model and map external systems into it.",
    reviewDate: "Jul 27, 2026",
  },
  {
    title: "Prototype scope may grow beyond the August milestone",
    type: "Risk",
    owner: "Kishan Bhatt",
    severity: "Medium",
    response: "Keep the first automation slice limited to briefing, draft, and approval.",
    reviewDate: "Jul 29, 2026",
  },
];

export const decisions: DecisionItem[] = [
  {
    title: "Use a dedicated project command center",
    decision: "The project details route will become the operational home for each project.",
    owner: "Parth Popat",
    date: "Jul 20, 2026",
    context: "Complex PM workflows need more room than a modal or side drawer provides.",
  },
  {
    title: "Keep the PM accountable for AI actions",
    decision: "AI will prepare and recommend; project managers will approve consequential actions.",
    owner: "Parth Popat",
    date: "Jul 20, 2026",
    context: "Assignments, deadlines, scope, and stakeholder messages require human judgment.",
  },
  {
    title: "Prioritize an evidence-backed status workflow",
    decision: "The first AI workflow will draft project health and status updates from source activity.",
    owner: "Kishan Bhatt",
    date: "Jul 19, 2026",
    context: "Status preparation is frequent, measurable, and easy for a PM to validate.",
  },
];

export const statusUpdates: StatusUpdate[] = [
  {
    period: "Jul 14–20, 2026",
    health: "Amber",
    summary:
      "The command-center direction is approved and the project details foundation is complete. AI approval policy remains the primary blocker for the automation prototype.",
    highlights: [
      "Project board and dedicated details route completed",
      "Command-center workflow and information architecture agreed",
      "Frontend quality gates and browser verification passing",
    ],
    nextSteps: [
      "Approve AI recommendation states",
      "Complete command-center frontend",
      "Define canonical work-item model",
    ],
    author: "Approved by Parth Popat · generated with Syno AI",
  },
  {
    period: "Jul 7–13, 2026",
    health: "Green",
    summary: "Initial dashboard scope, technology choices, and repository setup were completed.",
    highlights: ["React and TailAdmin scaffold selected", "Core project documentation created"],
    nextSteps: ["Build project management surfaces", "Validate the PM workflow"],
    author: "Kishan Bhatt",
  },
];

export const activityItems = [
  {
    time: "Today, 8:14 AM",
    actor: "Syno AI",
    action: "Completed an independent review of the project-details workflow.",
    type: "AI review",
  },
  {
    time: "Today, 8:09 AM",
    actor: "Kishan Bhatt",
    action: "Added the dedicated project-details route and verification tests.",
    type: "Development",
  },
  {
    time: "Today, 7:58 AM",
    actor: "Parth Popat",
    action: "Selected the project command center as the preferred product direction.",
    type: "Decision",
  },
  {
    time: "Jul 18, 4:30 PM",
    actor: "Aakash",
    action: "Raised a dependency on AI approval and audit requirements.",
    type: "Risk",
  },
  {
    time: "Jul 17, 12:19 PM",
    actor: "Kishan Bhatt",
    action: "Updated the project board with repository metadata.",
    type: "Project update",
  },
];
