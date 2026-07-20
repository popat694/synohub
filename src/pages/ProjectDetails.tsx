import { useState, type KeyboardEvent } from "react";
import { Link, useLocation, useParams } from "react-router";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import {
  commandCenterTabs,
  type CommandCenterTab,
  type WorkItem,
} from "../data/projectCommandCenter";
import {
  getProjectCommandCenterData,
  type ProjectCommandCenterData,
} from "../data/projectCommandCenterByProject";
import {
  formatAttachmentSize,
  initialProjects,
  type Project,
  type ProjectStatus,
} from "../data/projects";

const projectStatusStyles: Record<ProjectStatus, string> = {
  Planning:
    "border-warning-200 bg-warning-50 text-warning-700 dark:border-warning-800/40 dark:bg-warning-500/10 dark:text-warning-300",
  "In Progress":
    "border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-500/40 dark:bg-brand-500/10 dark:text-brand-300",
  Completed:
    "border-success-200 bg-success-50 text-success-700 dark:border-success-800/40 dark:bg-success-500/10 dark:text-success-300",
};

const milestoneStatusStyles = {
  Completed: "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-300",
  "On track": "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300",
  "At risk": "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-300",
} as const;

const severityStyles = {
  High: "bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-300",
  Medium: "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-300",
  Low: "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-300",
} as const;

const priorityStyles = {
  High: "text-error-600 dark:text-error-400",
  Medium: "text-warning-600 dark:text-warning-400",
  Low: "text-success-600 dark:text-success-400",
} as const;

const healthStyles = {
  "On track": "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-300",
  "At risk": "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-300",
  Completed: "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300",
} as const;

type ProjectRouteState = {
  project?: Project;
};

export default function ProjectDetails() {
  const { projectId } = useParams();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<CommandCenterTab>("overview");
  const numericProjectId = Number(projectId);
  const stateProject = (location.state as ProjectRouteState | null)?.project;
  const project =
    stateProject?.id === numericProjectId
      ? stateProject
      : initialProjects.find((candidate) => candidate.id === numericProjectId);

  if (!project) {
    return <ProjectNotFound />;
  }

  const commandCenter = getProjectCommandCenterData(project.id);

  const selectTab = (tab: CommandCenterTab, moveFocus = false) => {
    if (moveFocus) {
      document.getElementById(`project-tab-${tab}`)?.focus();
    }
    setActiveTab(tab);
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight") nextIndex = (index + 1) % commandCenterTabs.length;
    if (event.key === "ArrowLeft") {
      nextIndex = (index - 1 + commandCenterTabs.length) % commandCenterTabs.length;
    }
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = commandCenterTabs.length - 1;

    if (nextIndex !== null) {
      event.preventDefault();
      selectTab(commandCenterTabs[nextIndex].id, true);
    }
  };

  return (
    <>
      <PageMeta
        title={`${project.name} Command Center | SynoHub`}
        description={`Operate ${project.name} from the SynoHub project command center.`}
      />

      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Project command center" />

        <header className="flex flex-col gap-5 border-b border-gray-200 pb-6 dark:border-gray-800 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <Link
              to="/projects"
              aria-label="Back to projects"
              className="inline-flex items-center text-sm font-medium text-brand-500 transition hover:text-brand-600 dark:text-brand-300"
            >
              ← Back to projects
            </Link>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-500 dark:text-brand-300">
                {project.projectNumber}
              </p>
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${projectStatusStyles[project.status]}`}
              >
                {project.status}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${healthStyles[commandCenter.health]}`}
              >
                Overall health · {commandCenter.health}
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-gray-900 dark:text-white">
              {project.name}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500 dark:text-gray-400">
              {project.additionalInformation || "No additional project information has been added."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => selectTab("updates", true)}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-brand-500 px-5 text-sm font-medium text-white transition hover:bg-brand-600"
            >
              Draft status update
            </button>
            {project.repoUrl ? (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-300 px-5 text-sm font-medium text-gray-700 transition hover:border-brand-300 hover:text-brand-600 dark:border-gray-700 dark:text-gray-300 dark:hover:border-brand-500/50 dark:hover:text-brand-300"
                aria-label="Open project repository"
              >
                Open repository ↗
              </a>
            ) : null}
          </div>
        </header>

        <ProjectMetrics data={commandCenter} />

        <div className="border-b border-gray-200 dark:border-gray-800">
          <div
            className="flex gap-1 overflow-x-auto pb-px"
            role="tablist"
            aria-label="Project command center"
          >
            {commandCenterTabs.map((tab, index) => (
              <button
                key={tab.id}
                id={`project-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`project-panel-${tab.id}`}
                tabIndex={activeTab === tab.id ? 0 : -1}
                onClick={() => selectTab(tab.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "border-brand-500 text-brand-600 dark:text-brand-300"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div
          id="project-panel-overview"
          role="tabpanel"
          aria-labelledby="project-tab-overview"
          hidden={activeTab !== "overview"}
          className="min-h-[420px]"
        >
          <OverviewTab
            project={project}
            data={commandCenter}
            onNavigate={(tab) => selectTab(tab, true)}
          />
        </div>
        <div
          id="project-panel-plan"
          role="tabpanel"
          aria-labelledby="project-tab-plan"
          hidden={activeTab !== "plan"}
          className="min-h-[420px]"
        >
          <PlanTab data={commandCenter} />
        </div>
        <div
          id="project-panel-work"
          role="tabpanel"
          aria-labelledby="project-tab-work"
          hidden={activeTab !== "work"}
          className="min-h-[420px]"
        >
          <WorkTab data={commandCenter} />
        </div>
        <div
          id="project-panel-risks"
          role="tabpanel"
          aria-labelledby="project-tab-risks"
          hidden={activeTab !== "risks"}
          className="min-h-[420px]"
        >
          <RisksTab data={commandCenter} />
        </div>
        <div
          id="project-panel-decisions"
          role="tabpanel"
          aria-labelledby="project-tab-decisions"
          hidden={activeTab !== "decisions"}
          className="min-h-[420px]"
        >
          <DecisionsTab data={commandCenter} />
        </div>
        <div
          id="project-panel-updates"
          role="tabpanel"
          aria-labelledby="project-tab-updates"
          hidden={activeTab !== "updates"}
          className="min-h-[420px]"
        >
          <UpdatesTab key={project.id} data={commandCenter} />
        </div>
        <div
          id="project-panel-activity"
          role="tabpanel"
          aria-labelledby="project-tab-activity"
          hidden={activeTab !== "activity"}
          className="min-h-[420px]"
        >
          <ActivityTab data={commandCenter} />
        </div>
      </div>
    </>
  );
}

function getProjectStats(data: ProjectCommandCenterData) {
  const completed = data.workItems.filter((item) => item.status === "Done").length;
  const active = data.workItems.length - completed;
  const blocked = data.workItems.filter((item) => item.status === "Blocked").length;
  const highIssues = data.risks.filter(
    (item) => item.type === "Issue" && item.severity === "High",
  ).length;
  const progress = data.workItems.length
    ? Math.round((completed / data.workItems.length) * 100)
    : 0;

  return { completed, active, blocked, highIssues, progress, attention: blocked + highIssues };
}

function ProjectMetrics({ data }: { data: ProjectCommandCenterData }) {
  const stats = getProjectStats(data);
  const metrics = [
    {
      label: "Progress",
      value: `${stats.progress}%`,
      detail: `${stats.completed} of ${data.workItems.length} work items complete`,
      tone: "brand",
    },
    { label: "Current phase", value: data.phase, detail: data.phaseDetail, tone: "success" },
    {
      label: "Next milestone",
      value: data.nextMilestoneDate,
      detail: data.nextMilestone,
      tone: "warning",
    },
    {
      label: "Open attention",
      value: stats.attention.toString(),
      detail: `${stats.blocked} blocker${stats.blocked === 1 ? "" : "s"} · ${stats.highIssues} high issue${stats.highIssues === 1 ? "" : "s"}`,
      tone: "error",
    },
  ];

  const tones = {
    brand: "bg-brand-500",
    success: "bg-success-500",
    warning: "bg-warning-500",
    error: "bg-error-500",
  } as const;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]"
        >
          <span className={`absolute inset-x-0 top-0 h-1 ${tones[metric.tone as keyof typeof tones]}`} />
          <p className="text-sm text-gray-500 dark:text-gray-400">{metric.label}</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{metric.value}</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{metric.detail}</p>
        </div>
      ))}
    </div>
  );
}

function OverviewTab({
  project,
  data,
  onNavigate,
}: {
  project: Project;
  data: ProjectCommandCenterData;
  onNavigate: (tab: CommandCenterTab) => void;
}) {
  const stats = getProjectStats(data);
  const highIssue = data.risks.find(
    (risk) => risk.type === "Issue" && risk.severity === "High",
  );

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
      <main className="space-y-6">
        <Section title="AI project intelligence" eyebrow="Evidence-backed summary">
          <div className="flex flex-col gap-4 rounded-xl border border-brand-100 bg-brand-50/60 p-4 dark:border-brand-500/20 dark:bg-brand-500/5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-brand-500 px-2.5 py-1 text-xs font-semibold text-white">
                  AI insight
                </span>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {stats.attention} item{stats.attention === 1 ? "" : "s"} {stats.attention === 1 ? "needs" : "need"} attention
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
                {data.aiSummary}
              </p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {data.aiEvidence}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate(data.risks.length > 0 ? "risks" : "decisions")}
              className="shrink-0 rounded-lg border border-brand-200 bg-white px-3 py-2 text-xs font-medium text-brand-700 transition hover:bg-brand-50 dark:border-brand-500/30 dark:bg-gray-900 dark:text-brand-300"
            >
              Review evidence
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {stats.blocked > 0 ? (
              <AttentionItem
                label="Blocked work"
                title={data.primaryAttentionTitle}
                detail={data.primaryAttentionDetail}
                action="Open work"
                onClick={() => onNavigate("work")}
                tone="error"
              />
            ) : null}
            {highIssue ? (
              <AttentionItem
                label="High-impact issue"
                title={highIssue.title}
                detail={`${highIssue.response} · Owner: ${highIssue.owner}`}
                action="Open risks"
                onClick={() => onNavigate("risks")}
                tone="error"
              />
            ) : null}
            <AttentionItem
              label="Upcoming milestone"
              title={`${data.nextMilestone} · ${data.nextMilestoneDate}`}
              detail={`${stats.active} active work item${stats.active === 1 ? "" : "s"}`}
              action="View plan"
              onClick={() => onNavigate("plan")}
              tone="warning"
            />
          </div>
        </Section>

        <Section title="Milestone outlook" actionLabel="View full plan" onAction={() => onNavigate("plan")}>
          <div className="space-y-5">
            {data.milestones.map((milestone) => (
              <div key={milestone.name}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                      {milestone.name}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {milestone.owner} · {milestone.dueDate}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${milestoneStatusStyles[milestone.status]}`}
                  >
                    {milestone.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className={`h-full rounded-full ${milestone.status === "At risk" ? "bg-warning-500" : "bg-brand-500"}`}
                      style={{ width: `${milestone.progress}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                    {milestone.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </main>

      <aside className="space-y-6">
        <Section title="Project profile">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-1">
            <DetailItem label="Project owner" value={project.owner} />
            <DetailItem label="Project manager" value={project.manager} />
            <DetailItem label="Project members" value={project.members || "Not set"} />
            <DetailItem label="Technology" value={project.stack || "Not set"} />
            <DetailItem label="Start date" value={project.startDate || "Not set"} />
            <DetailItem label="Deadline" value={project.deadline || "Not set"} />
            <DetailItem label="Budget" value={project.budget || "Not set"} />
          </div>
        </Section>

        <Section title={`Attachments (${project.attachments.length})`}>
          {project.attachments.length ? (
            <div className="space-y-3">
              {project.attachments.map((attachment) => (
                <div
                  key={`${attachment.name}-${attachment.size}`}
                  className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0 dark:border-gray-800"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                      {attachment.name}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{attachment.type}</p>
                  </div>
                  <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                    {formatAttachmentSize(attachment.size)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No attachments added.</p>
          )}
        </Section>
      </aside>
    </div>
  );
}

function PlanTab({ data }: { data: ProjectCommandCenterData }) {
  const atRisk = data.milestones.filter((milestone) => milestone.status === "At risk").length;

  return (
    <div className="space-y-6">
      <Section
        title="Milestone plan"
        eyebrow={`${data.milestones.length} milestone${data.milestones.length === 1 ? "" : "s"} · ${atRisk} at risk`}
      >
        <div className="space-y-4">
          {data.milestones.map((milestone, index) => (
            <div
              key={milestone.name}
              className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 p-4 dark:border-gray-800 lg:grid-cols-[42px_1.3fr_0.8fr_0.7fr] lg:items-center"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {index + 1}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-gray-800 dark:text-white/90">{milestone.name}</p>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${milestoneStatusStyles[milestone.status]}`}
                  >
                    {milestone.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {milestone.deliverables}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Owner & due date</p>
                <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {milestone.owner}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{milestone.dueDate}</p>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Progress</span>
                  <span>{milestone.progress}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className={`h-full rounded-full ${milestone.status === "At risk" ? "bg-warning-500" : "bg-brand-500"}`}
                    style={{ width: `${milestone.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Dependency chain" eyebrow="Critical delivery path">
        <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
          {data.milestones.map((milestone) => milestone.name).map((dependency, index, all) => (
            <div key={dependency} className="contents">
              <div className="flex-1 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm font-medium text-gray-700 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-300">
                <span className="mb-2 block text-xs text-gray-400">Step {index + 1}</span>
                {dependency}
              </div>
              {index < all.length - 1 ? (
                <span className="text-center text-gray-300 dark:text-gray-700">
                  <span className="lg:hidden">↓</span>
                  <span className="hidden lg:inline">→</span>
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function WorkTab({ data }: { data: ProjectCommandCenterData }) {
  const statuses: WorkItem["status"][] = ["To do", "In progress", "Blocked", "Done"];
  const blocked = data.workItems.filter((item) => item.status === "Blocked").length;

  return (
    <Section
      title="Work board"
      eyebrow={`${data.workItems.length} work items · ${blocked} blocked`}
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-4">
        {statuses.map((status) => {
          const items = data.workItems.filter((item) => item.status === status);
          return (
            <section key={status} className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900/40">
              <div className="flex items-center justify-between px-1 pb-3">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">{status}</h3>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs text-gray-500 shadow-sm dark:bg-gray-800 dark:text-gray-400">
                  {items.length}
                </span>
              </div>
              <div className="space-y-3">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-brand-500 dark:text-brand-300">
                        {item.id}
                      </span>
                      <span className={`text-xs font-medium ${priorityStyles[item.priority]}`}>
                        {item.priority}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-semibold leading-5 text-gray-800 dark:text-white/90">
                      {item.title}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{item.owner}</span>
                      <span>{item.dueDate}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </Section>
  );
}

function RisksTab({ data }: { data: ProjectCommandCenterData }) {
  const highIssues = data.risks.filter(
    (risk) => risk.type === "Issue" && risk.severity === "High",
  ).length;

  return (
    <Section
      title="Risk register"
      eyebrow={`${highIssues} high issue${highIssues === 1 ? "" : "s"} · ${data.risks.length} total`}
    >
      <div className="space-y-4">
        {data.risks.length === 0 ? (
          <p className="rounded-xl bg-gray-50 p-5 text-sm text-gray-500 dark:bg-gray-900/40 dark:text-gray-400">
            No open risks or issues are recorded for this project.
          </p>
        ) : null}
        {data.risks.map((risk) => (
          <article
            key={risk.title}
            className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 p-4 dark:border-gray-800 lg:grid-cols-[1.1fr_1.5fr_0.65fr]"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  {risk.type}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${severityStyles[risk.severity]}`}>
                  {risk.severity}
                </span>
              </div>
              <h3 className="mt-3 font-semibold text-gray-800 dark:text-white/90">{risk.title}</h3>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Response</p>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{risk.response}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Owner</p>
              <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">{risk.owner}</p>
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                Review {risk.reviewDate}
              </p>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

function DecisionsTab({ data }: { data: ProjectCommandCenterData }) {
  return (
    <Section
      title="Decision log"
      eyebrow={`${data.decisions.length} recorded decision${data.decisions.length === 1 ? "" : "s"}`}
    >
      <div className="space-y-4">
        {data.decisions.map((decision) => (
          <article
            key={decision.title}
            className="rounded-xl border border-gray-200 p-5 dark:border-gray-800"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white/90">{decision.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
                  {decision.decision}
                </p>
              </div>
              <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">{decision.date}</span>
            </div>
            <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-500 dark:bg-gray-900/40 dark:text-gray-400">
              <span className="font-medium text-gray-700 dark:text-gray-300">Why:</span> {decision.context}
            </div>
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Decision owner · {decision.owner}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}

type UpdateWorkflowState = "idle" | "draft" | "awaiting" | "approved" | "shared";

function UpdatesTab({ data }: { data: ProjectCommandCenterData }) {
  const [workflowState, setWorkflowState] = useState<UpdateWorkflowState>("idle");
  const [draft, setDraft] = useState(data.statusUpdates[0]?.summary ?? "");

  const workflowLabel = {
    idle: "Not started",
    draft: "Draft ready for review",
    awaiting: "Awaiting PM approval",
    approved: "Approved for sharing",
    shared: "Shared with stakeholders",
  }[workflowState];

  return (
    <Section title="Status updates" eyebrow="Evidence-backed stakeholder reporting">
      <div className="mb-5 flex flex-col gap-3 rounded-xl border border-brand-100 bg-brand-50/60 p-4 dark:border-brand-500/20 dark:bg-brand-500/5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
            Prepare this week&apos;s update with AI
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Review the evidence, edit the draft, and approve before sharing.
          </p>
        </div>
        {workflowState === "idle" ? (
          <button
            type="button"
            onClick={() => setWorkflowState("draft")}
            className="shrink-0 rounded-lg bg-brand-500 px-4 py-2 text-xs font-medium text-white transition hover:bg-brand-600"
          >
            Generate draft
          </button>
        ) : (
          <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-brand-700 shadow-sm dark:bg-gray-900 dark:text-brand-300">
            Workflow active
          </span>
        )}
      </div>

      {workflowState !== "idle" ? (
        <section className="mb-5 rounded-xl border border-gray-200 p-5 dark:border-gray-800">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white/90">Status draft workspace</h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{workflowLabel}</p>
            </div>
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
              Human approval required
            </span>
          </div>

          <label className="mt-5 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Stakeholder summary
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              disabled={workflowState !== "draft"}
              rows={4}
              className="mt-2 w-full resize-y rounded-xl border border-gray-300 bg-white p-3 text-sm font-normal normal-case leading-6 tracking-normal text-gray-700 outline-none transition focus:border-brand-400 disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:disabled:bg-gray-900/50"
            />
          </label>

          <div className="mt-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-900/40">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Evidence reviewed</p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{data.aiEvidence}</p>
          </div>

          <div className="mt-5 flex flex-wrap justify-end gap-3">
            {workflowState === "draft" ? (
              <>
                {!draft.trim() ? (
                  <p className="w-full text-right text-xs text-error-600 dark:text-error-400">
                    Add a stakeholder summary before submitting.
                  </p>
                ) : null}
                <button
                  type="button"
                  disabled={!draft.trim()}
                  onClick={() => setWorkflowState("awaiting")}
                  className="rounded-lg bg-brand-500 px-4 py-2 text-xs font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Submit for approval
                </button>
              </>
            ) : null}
            {workflowState === "awaiting" ? (
              <>
                <button
                  type="button"
                  onClick={() => setWorkflowState("draft")}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 dark:border-gray-700 dark:text-gray-300"
                >
                  Reject draft
                </button>
                <button
                  type="button"
                  onClick={() => setWorkflowState("approved")}
                  className="rounded-lg bg-success-500 px-4 py-2 text-xs font-medium text-white transition hover:bg-success-600"
                >
                  Approve update
                </button>
              </>
            ) : null}
            {workflowState === "approved" ? (
              <>
                <button
                  type="button"
                  onClick={() => setWorkflowState("draft")}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 dark:border-gray-700 dark:text-gray-300"
                >
                  Return to editing
                </button>
                <button
                  type="button"
                  onClick={() => setWorkflowState("shared")}
                  className="rounded-lg bg-brand-500 px-4 py-2 text-xs font-medium text-white transition hover:bg-brand-600"
                >
                  Share update
                </button>
              </>
            ) : null}
          </div>
        </section>
      ) : null}

      <div className="space-y-4">
        {data.statusUpdates.map((update, index) => (
          <article
            key={update.period}
            className="rounded-xl border border-gray-200 p-5 dark:border-gray-800"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-gray-800 dark:text-white/90">{update.period}</h3>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    update.health === "Green"
                      ? "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-300"
                      : update.health === "Amber"
                        ? "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-300"
                        : "bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-300"
                  }`}
                >
                  {update.health}
                </span>
              </div>
              {index === 0 ? (
                <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                  Latest
                </span>
              ) : null}
            </div>
            <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-300">{update.summary}</p>
            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
              <UpdateList title="Highlights" items={update.highlights} />
              <UpdateList title="Next steps" items={update.nextSteps} />
            </div>
            <p className="mt-5 border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
              {update.author}
            </p>
          </article>
        ))}
      </div>
    </Section>
  );
}

function ActivityTab({ data }: { data: ProjectCommandCenterData }) {
  return (
    <Section title="Activity timeline" eyebrow="Project changes, decisions, risks, and AI actions">
      <div className="relative space-y-0 before:absolute before:bottom-4 before:left-[7px] before:top-4 before:w-px before:bg-gray-200 dark:before:bg-gray-800">
        {data.activityItems.map((item) => (
          <article key={`${item.time}-${item.action}`} className="relative grid grid-cols-[16px_1fr] gap-4 pb-6 last:pb-0">
            <span className="relative z-10 mt-1.5 size-4 rounded-full border-4 border-white bg-brand-500 dark:border-gray-900" />
            <div className="flex flex-col gap-2 rounded-xl border border-gray-200 p-4 dark:border-gray-800 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white/90">{item.actor}</p>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    {item.type}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{item.action}</p>
              </div>
              <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">{item.time}</span>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

function Section({
  title,
  eyebrow,
  actionLabel,
  onAction,
  children,
}: {
  title: string;
  eyebrow?: string;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">{title}</h2>
          {eyebrow ? <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{eyebrow}</p> : null}
        </div>
        {actionLabel && onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="text-xs font-medium text-brand-500 transition hover:text-brand-600 dark:text-brand-300"
          >
            {actionLabel} →
          </button>
        ) : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function AttentionItem({
  label,
  title,
  detail,
  action,
  onClick,
  tone,
}: {
  label: string;
  title: string;
  detail: string;
  action: string;
  onClick: () => void;
  tone: "error" | "warning";
}) {
  return (
    <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
      <p className={`text-xs font-semibold uppercase tracking-wide ${tone === "error" ? "text-error-500" : "text-warning-500"}`}>
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-gray-800 dark:text-white/90">{title}</p>
      <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">{detail}</p>
      <button
        type="button"
        onClick={onClick}
        className="mt-3 text-xs font-medium text-brand-500 transition hover:text-brand-600 dark:text-brand-300"
      >
        {action} →
      </button>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-gray-800 dark:text-white/90">{value}</p>
    </div>
  );
}

function UpdateList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-gray-600 dark:text-gray-300">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-500" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProjectNotFound() {
  return (
    <>
      <PageMeta
        title="Project not found | SynoHub"
        description="The requested SynoHub project could not be found."
      />
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Project command center" />
        <section className="rounded-2xl border border-dashed border-gray-300 px-6 py-20 text-center dark:border-gray-700">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Project not found</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            The project may have been removed or the link may be incorrect.
          </p>
          <Link
            to="/projects"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-brand-500 px-5 text-sm font-medium text-white transition hover:bg-brand-600"
          >
            Back to projects
          </Link>
        </section>
      </div>
    </>
  );
}
