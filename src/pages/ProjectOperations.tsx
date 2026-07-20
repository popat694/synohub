import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import type {
  DecisionItem,
  DependencyItem,
  Milestone,
  RiskItem,
  StatusUpdate,
  WorkItem,
} from "../data/projectCommandCenter";
import {
  useProjectOperationsData,
  wouldCreateDependencyCycle,
} from "../data/projectOperationsStore";
import { initialProjects } from "../data/projects";

type OperationsSection =
  | "milestones"
  | "work"
  | "dependencies"
  | "risks"
  | "decisions"
  | "updates";

const operationsSections: { id: OperationsSection; label: string }[] = [
  { id: "milestones", label: "Milestones" },
  { id: "work", label: "Work items" },
  { id: "dependencies", label: "Dependencies" },
  { id: "risks", label: "Risks & issues" },
  { id: "decisions", label: "Decisions" },
  { id: "updates", label: "Status updates" },
];

export default function ProjectOperations() {
  const { projectId } = useParams();
  const numericProjectId = Number(projectId);
  const project = initialProjects.find((candidate) => candidate.id === numericProjectId);
  const [activeSection, setActiveSection] = useState<OperationsSection>("milestones");
  const { data, updateData, storageWarning } = useProjectOperationsData(numericProjectId);

  if (!project) return <ProjectOperationsNotFound />;
  const activeLabel =
    operationsSections.find((section) => section.id === activeSection)?.label ?? "Operations";

  return (
    <>
      <PageMeta
        title={`${project.name} Operations | SynoHub`}
        description={`Manage operational project data for ${project.name}.`}
      />

      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Project operations" />

        {storageWarning ? (
          <div
            role="alert"
            className="border-l-4 border-warning-500 bg-warning-50 px-4 py-3 text-sm font-medium text-warning-700 dark:bg-warning-500/10 dark:text-warning-300"
          >
            {storageWarning}
          </div>
        ) : null}

        <header className="flex flex-col gap-5 border-b border-gray-200 pb-6 dark:border-gray-800 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              to={`/projects/${project.id}`}
              aria-label="Back to command center"
              className="inline-flex items-center text-sm font-medium text-brand-500 transition hover:text-brand-600 dark:text-brand-300"
            >
              ← Back to command center
            </Link>
            <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-brand-500 dark:text-brand-300">
              {project.projectNumber}
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
              Project operations
            </h1>
            <p className="mt-2 text-lg font-medium text-gray-700 dark:text-gray-200">{project.name}</p>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500 dark:text-gray-400">
              Maintain the operational records that drive project health, planning, and reporting.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-x-6 gap-y-3 text-sm sm:grid-cols-6 lg:grid-cols-3 xl:grid-cols-6">
            <OperationCount label="Milestones" value={data.milestones.length} />
            <OperationCount label="Work" value={data.workItems.length} />
            <OperationCount label="Risks" value={data.risks.length} />
            <OperationCount label="Decisions" value={data.decisions.length} />
            <OperationCount label="Updates" value={data.statusUpdates.length} />
            <OperationCount label="Dependencies" value={data.dependencies.length} />
          </div>
        </header>

        <div className="border-b border-gray-200 dark:border-gray-800">
          <nav className="flex gap-1 overflow-x-auto" aria-label="Project operation sections">
            {operationsSections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                aria-current={activeSection === section.id ? "page" : undefined}
                className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition ${
                  activeSection === section.id
                    ? "border-brand-500 text-brand-600 dark:text-brand-300"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90"
                }`}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        <section aria-labelledby="operations-section-heading" className="min-h-[480px]">
          <h2 id="operations-section-heading" className="text-xl font-semibold text-gray-900 dark:text-white">
            {activeLabel}
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Review and maintain {activeLabel.toLowerCase()} for this project.
          </p>
          {activeSection === "milestones" ? (
            <MilestonesSection
              milestones={data.milestones}
              onAdd={(milestone) =>
                updateData((current) => ({
                  ...current,
                  milestones: [...current.milestones, milestone],
                }))
              }
            />
          ) : null}
          {activeSection === "work" ? (
            <WorkItemsSection
              items={data.workItems}
              onAdd={(item) =>
                updateData((current) => ({
                  ...current,
                  workItems: [...current.workItems, item],
                }))
              }
            />
          ) : null}
          {activeSection === "dependencies" ? (
            <DependenciesSection
              dependencies={data.dependencies}
              workItems={data.workItems}
              onAdd={(dependency) =>
                updateData((current) => ({
                  ...current,
                  dependencies: [...current.dependencies, dependency],
                }))
              }
            />
          ) : null}
          {activeSection === "risks" ? (
            <RisksSection
              risks={data.risks}
              onAdd={(risk) =>
                updateData((current) => ({
                  ...current,
                  risks: [...current.risks, risk],
                }))
              }
            />
          ) : null}
          {activeSection === "decisions" ? (
            <DecisionsSection
              decisions={data.decisions}
              onAdd={(decision) =>
                updateData((current) => ({
                  ...current,
                  decisions: [...current.decisions, decision],
                }))
              }
            />
          ) : null}
          {activeSection === "updates" ? (
            <StatusUpdatesSection
              updates={data.statusUpdates}
              onAdd={(update) =>
                updateData((current) => ({
                  ...current,
                  statusUpdates: [update, ...current.statusUpdates],
                }))
              }
            />
          ) : null}
        </section>
      </div>
    </>
  );
}

const emptyMilestone: Milestone = {
  name: "",
  owner: "",
  dueDate: "",
  progress: 0,
  status: "On track",
  deliverables: "",
};

function MilestonesSection({
  milestones,
  onAdd,
}: {
  milestones: Milestone[];
  onAdd: (milestone: Milestone) => void;
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [draft, setDraft] = useState(emptyMilestone);
  const [errors, setErrors] = useState<string[]>([]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = [
      !draft.name.trim() ? "Milestone name is required." : "",
      !draft.owner.trim() ? "Milestone owner is required." : "",
      !draft.dueDate.trim() ? "Milestone due date is required." : "",
      !draft.deliverables.trim() ? "Deliverables are required." : "",
      draft.progress < 0 || draft.progress > 100 ? "Progress must be between 0 and 100." : "",
    ].filter(Boolean);

    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      return;
    }

    onAdd({
      ...draft,
      name: draft.name.trim(),
      owner: draft.owner.trim(),
      dueDate: draft.dueDate.trim(),
      deliverables: draft.deliverables.trim(),
    });
    setDraft(emptyMilestone);
    setErrors([]);
    setIsCreating(false);
  };

  return (
    <div className="mt-6">
      <SectionToolbar
        count={`${milestones.length} milestone${milestones.length === 1 ? "" : "s"}`}
        action="Add milestone"
        onAction={() => {
          setDraft(emptyMilestone);
          setErrors([]);
          setIsCreating(true);
        }}
      />
      {isCreating ? (
        <form onSubmit={submit} className="mt-6 border-y border-gray-200 py-6 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">New milestone</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Define a measurable delivery point with an accountable owner.
          </p>
          <ValidationErrors errors={errors} label="Milestone validation errors" />
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            <TextField
              label="Milestone name"
              value={draft.name}
              onChange={(value) => setDraft((current) => ({ ...current, name: value }))}
            />
            <TextField
              label="Milestone owner"
              value={draft.owner}
              onChange={(value) => setDraft((current) => ({ ...current, owner: value }))}
            />
            <DateField
              label="Milestone due date"
              value={draft.dueDate}
              onChange={(value) => setDraft((current) => ({ ...current, dueDate: value }))}
            />
            <NumberField
              label="Milestone progress"
              value={draft.progress}
              min={0}
              max={100}
              onChange={(value) => setDraft((current) => ({ ...current, progress: value }))}
            />
            <SelectField
              label="Milestone status"
              value={draft.status}
              options={["Completed", "On track", "At risk"]}
              onChange={(value) =>
                setDraft((current) => ({ ...current, status: value as Milestone["status"] }))
              }
            />
            <TextAreaField
              label="Milestone deliverables"
              value={draft.deliverables}
              onChange={(value) => setDraft((current) => ({ ...current, deliverables: value }))}
            />
          </div>
          <FormActions saveLabel="Save milestone" onCancel={() => setIsCreating(false)} />
        </form>
      ) : null}
      <div className="mt-6 border-y border-gray-200 dark:border-gray-800">
        {milestones.map((milestone) => (
          <div
            key={`${milestone.name}-${milestone.dueDate}`}
            className="grid gap-3 border-b border-gray-100 py-4 last:border-b-0 dark:border-gray-800 md:grid-cols-[minmax(0,1fr)_150px_120px_130px] md:items-center"
          >
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{milestone.name}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{milestone.deliverables}</p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">{milestone.owner}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{milestone.dueDate}</p>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {milestone.progress}% complete
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{milestone.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionToolbar({
  count,
  action,
  onAction,
}: {
  count: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">{count}</p>
      <button
        type="button"
        onClick={onAction}
        className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white transition hover:bg-brand-600"
      >
        {action}
      </button>
    </div>
  );
}

type WorkItemDraft = WorkItem;

const emptyWorkItem: WorkItemDraft = {
  id: "",
  title: "",
  owner: "",
  dueDate: "",
  priority: "Medium",
  status: "To do",
};

function WorkItemsSection({ items, onAdd }: { items: WorkItem[]; onAdd: (item: WorkItem) => void }) {
  const [isCreating, setIsCreating] = useState(false);
  const [draft, setDraft] = useState<WorkItemDraft>(emptyWorkItem);
  const [errors, setErrors] = useState<string[]>([]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const workItemId = draft.id.trim();
    const nextErrors = [
      !workItemId ? "Work item ID is required." : "",
      workItemId && items.some((item) => item.id === workItemId)
        ? `Work item ID "${workItemId}" already exists.`
        : "",
      !draft.title.trim() ? "Title is required." : "",
      !draft.owner.trim() ? "Owner is required." : "",
      !draft.dueDate.trim() ? "Due date is required." : "",
    ].filter(Boolean);

    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      return;
    }

    onAdd({
      ...draft,
      id: draft.id.trim(),
      title: draft.title.trim(),
      owner: draft.owner.trim(),
      dueDate: draft.dueDate.trim(),
    });
    setDraft(emptyWorkItem);
    setErrors([]);
    setIsCreating(false);
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {items.length} work item{items.length === 1 ? "" : "s"}
        </p>
        <button
          type="button"
          onClick={() => {
            setDraft(emptyWorkItem);
            setErrors([]);
            setIsCreating(true);
          }}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          Add work item
        </button>
      </div>

      {isCreating ? (
        <form onSubmit={submit} className="mt-6 border-y border-gray-200 py-6 dark:border-gray-800">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">New work item</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Add an accountable unit of work to the project plan.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-sm font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
            >
              Cancel
            </button>
          </div>

          <ValidationErrors errors={errors} label="Work item validation errors" />

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            <TextField
              label="Work item ID"
              value={draft.id}
              onChange={(value) => setDraft((current) => ({ ...current, id: value }))}
            />
            <TextField
              label="Work item title"
              value={draft.title}
              onChange={(value) => setDraft((current) => ({ ...current, title: value }))}
            />
            <TextField
              label="Work item owner"
              value={draft.owner}
              onChange={(value) => setDraft((current) => ({ ...current, owner: value }))}
            />
            <DateField
              label="Work item due date"
              value={draft.dueDate}
              onChange={(value) => setDraft((current) => ({ ...current, dueDate: value }))}
            />
            <SelectField
              label="Work item priority"
              value={draft.priority}
              options={["High", "Medium", "Low"]}
              onChange={(value) =>
                setDraft((current) => ({ ...current, priority: value as WorkItem["priority"] }))
              }
            />
            <SelectField
              label="Work item status"
              value={draft.status}
              options={["To do", "In progress", "Blocked", "Done"]}
              onChange={(value) =>
                setDraft((current) => ({ ...current, status: value as WorkItem["status"] }))
              }
            />
          </div>
          <FormActions saveLabel="Save work item" onCancel={() => setIsCreating(false)} />
        </form>
      ) : null}

      <div className="mt-6 overflow-hidden border-y border-gray-200 dark:border-gray-800">
        {items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-1 gap-3 border-b border-gray-100 px-1 py-4 last:border-b-0 dark:border-gray-800 md:grid-cols-[110px_minmax(0,1fr)_140px_120px_110px] md:items-center"
          >
            <p className="text-sm font-semibold text-brand-600 dark:text-brand-300">{item.id}</p>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Due {item.dueDate}</p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">{item.owner}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{item.priority}</p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{item.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

type StatusUpdateDraft = Omit<StatusUpdate, "highlights" | "nextSteps"> & {
  highlightsText: string;
  nextStepsText: string;
};

const emptyStatusUpdate: StatusUpdateDraft = {
  period: "",
  health: "Green",
  summary: "",
  highlightsText: "",
  nextStepsText: "",
  author: "",
};

function toList(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function StatusUpdatesSection({
  updates,
  onAdd,
}: {
  updates: StatusUpdate[];
  onAdd: (update: StatusUpdate) => void;
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [draft, setDraft] = useState(emptyStatusUpdate);
  const [errors, setErrors] = useState<string[]>([]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const highlights = toList(draft.highlightsText);
    const nextSteps = toList(draft.nextStepsText);
    const nextErrors = [
      !draft.period.trim() ? "Reporting period is required." : "",
      !draft.summary.trim() ? "Status summary is required." : "",
      highlights.length === 0 ? "At least one highlight is required." : "",
      nextSteps.length === 0 ? "At least one next step is required." : "",
      !draft.author.trim() ? "Update author is required." : "",
    ].filter(Boolean);

    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      return;
    }

    onAdd({
      period: draft.period.trim(),
      health: draft.health,
      summary: draft.summary.trim(),
      highlights,
      nextSteps,
      author: draft.author.trim(),
    });
    setDraft(emptyStatusUpdate);
    setErrors([]);
    setIsCreating(false);
  };

  return (
    <div className="mt-6">
      <SectionToolbar
        count={`${updates.length} status update${updates.length === 1 ? "" : "s"}`}
        action="Add status update"
        onAction={() => {
          setDraft(emptyStatusUpdate);
          setErrors([]);
          setIsCreating(true);
        }}
      />
      {isCreating ? (
        <form onSubmit={submit} className="mt-6 border-y border-gray-200 py-6 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">New status update</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Record the approved project narrative and its supporting highlights.
          </p>
          <ValidationErrors errors={errors} label="Status update validation errors" />
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            <TextField
              label="Reporting period"
              value={draft.period}
              onChange={(value) => setDraft((current) => ({ ...current, period: value }))}
            />
            <SelectField
              label="Update health"
              value={draft.health}
              options={["Green", "Amber", "Red"]}
              onChange={(value) =>
                setDraft((current) => ({ ...current, health: value as StatusUpdate["health"] }))
              }
            />
            <TextField
              label="Update author"
              value={draft.author}
              onChange={(value) => setDraft((current) => ({ ...current, author: value }))}
            />
            <TextAreaField
              label="Status summary"
              value={draft.summary}
              onChange={(value) => setDraft((current) => ({ ...current, summary: value }))}
            />
            <TextAreaField
              label="Update highlights"
              value={draft.highlightsText}
              onChange={(value) => setDraft((current) => ({ ...current, highlightsText: value }))}
            />
            <TextAreaField
              label="Update next steps"
              value={draft.nextStepsText}
              onChange={(value) => setDraft((current) => ({ ...current, nextStepsText: value }))}
            />
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Enter each highlight and next step on a separate line.
          </p>
          <FormActions saveLabel="Save status update" onCancel={() => setIsCreating(false)} />
        </form>
      ) : null}
      <div className="mt-6 space-y-5">
        {updates.map((update) => (
          <article
            key={`${update.period}-${update.author}`}
            className="border-y border-gray-200 py-5 dark:border-gray-800"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{update.period}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{update.health} · {update.author}</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-gray-700 dark:text-gray-200">{update.summary}</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <UpdatePoints title="Highlights" items={update.highlights} />
              <UpdatePoints title="Next steps" items={update.nextSteps} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function UpdatePoints({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</p>
      <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-300">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

const emptyDecision: DecisionItem = {
  title: "",
  decision: "",
  owner: "",
  date: "",
  context: "",
};

function DecisionsSection({
  decisions,
  onAdd,
}: {
  decisions: DecisionItem[];
  onAdd: (decision: DecisionItem) => void;
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [draft, setDraft] = useState(emptyDecision);
  const [errors, setErrors] = useState<string[]>([]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = [
      !draft.title.trim() ? "Decision title is required." : "",
      !draft.decision.trim() ? "Decision outcome is required." : "",
      !draft.owner.trim() ? "Decision owner is required." : "",
      !draft.date.trim() ? "Decision date is required." : "",
      !draft.context.trim() ? "Decision context is required." : "",
    ].filter(Boolean);

    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      return;
    }

    onAdd({
      title: draft.title.trim(),
      decision: draft.decision.trim(),
      owner: draft.owner.trim(),
      date: draft.date.trim(),
      context: draft.context.trim(),
    });
    setDraft(emptyDecision);
    setErrors([]);
    setIsCreating(false);
  };

  return (
    <div className="mt-6">
      <SectionToolbar
        count={`${decisions.length} decision${decisions.length === 1 ? "" : "s"}`}
        action="Add decision"
        onAction={() => {
          setDraft(emptyDecision);
          setErrors([]);
          setIsCreating(true);
        }}
      />
      {isCreating ? (
        <form onSubmit={submit} className="mt-6 border-y border-gray-200 py-6 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">New decision</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Capture what was decided, why, and who remains accountable.
          </p>
          <ValidationErrors errors={errors} label="Decision validation errors" />
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            <TextField
              label="Decision title"
              value={draft.title}
              onChange={(value) => setDraft((current) => ({ ...current, title: value }))}
            />
            <TextAreaField
              label="Decision outcome"
              value={draft.decision}
              onChange={(value) => setDraft((current) => ({ ...current, decision: value }))}
            />
            <TextField
              label="Decision owner"
              value={draft.owner}
              onChange={(value) => setDraft((current) => ({ ...current, owner: value }))}
            />
            <DateField
              label="Decision date"
              value={draft.date}
              onChange={(value) => setDraft((current) => ({ ...current, date: value }))}
            />
            <TextAreaField
              label="Decision context"
              value={draft.context}
              onChange={(value) => setDraft((current) => ({ ...current, context: value }))}
            />
          </div>
          <FormActions saveLabel="Save decision" onCancel={() => setIsCreating(false)} />
        </form>
      ) : null}
      <div className="mt-6 border-y border-gray-200 dark:border-gray-800">
        {decisions.map((decision) => (
          <article
            key={`${decision.title}-${decision.date}`}
            className="border-b border-gray-100 py-5 last:border-b-0 dark:border-gray-800"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{decision.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{decision.date} · {decision.owner}</p>
            </div>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">{decision.decision}</p>
            <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">{decision.context}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

const emptyRisk: RiskItem = {
  title: "",
  type: "Risk",
  owner: "",
  severity: "Medium",
  response: "",
  reviewDate: "",
};

function RisksSection({ risks, onAdd }: { risks: RiskItem[]; onAdd: (risk: RiskItem) => void }) {
  const [isCreating, setIsCreating] = useState(false);
  const [draft, setDraft] = useState(emptyRisk);
  const [errors, setErrors] = useState<string[]>([]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = [
      !draft.title.trim() ? "Risk or issue title is required." : "",
      !draft.owner.trim() ? "Risk owner is required." : "",
      !draft.response.trim() ? "Response plan is required." : "",
      !draft.reviewDate.trim() ? "Review date is required." : "",
    ].filter(Boolean);

    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      return;
    }

    onAdd({
      ...draft,
      title: draft.title.trim(),
      owner: draft.owner.trim(),
      response: draft.response.trim(),
      reviewDate: draft.reviewDate.trim(),
    });
    setDraft(emptyRisk);
    setErrors([]);
    setIsCreating(false);
  };

  return (
    <div className="mt-6">
      <SectionToolbar
        count={`${risks.length} risk${risks.length === 1 ? "" : "s"} and issue${risks.length === 1 ? "" : "s"}`}
        action="Add risk or issue"
        onAction={() => {
          setDraft(emptyRisk);
          setErrors([]);
          setIsCreating(true);
        }}
      />
      {isCreating ? (
        <form onSubmit={submit} className="mt-6 border-y border-gray-200 py-6 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">New risk or issue</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Record the impact, accountable owner, and agreed response.
          </p>
          <ValidationErrors errors={errors} label="Risk validation errors" />
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            <TextField
              label="Risk or issue title"
              value={draft.title}
              onChange={(value) => setDraft((current) => ({ ...current, title: value }))}
            />
            <SelectField
              label="Risk type"
              value={draft.type}
              options={["Risk", "Issue"]}
              onChange={(value) =>
                setDraft((current) => ({ ...current, type: value as RiskItem["type"] }))
              }
            />
            <TextField
              label="Risk owner"
              value={draft.owner}
              onChange={(value) => setDraft((current) => ({ ...current, owner: value }))}
            />
            <SelectField
              label="Risk severity"
              value={draft.severity}
              options={["High", "Medium", "Low"]}
              onChange={(value) =>
                setDraft((current) => ({ ...current, severity: value as RiskItem["severity"] }))
              }
            />
            <TextAreaField
              label="Response plan"
              value={draft.response}
              onChange={(value) => setDraft((current) => ({ ...current, response: value }))}
            />
            <DateField
              label="Risk review date"
              value={draft.reviewDate}
              onChange={(value) => setDraft((current) => ({ ...current, reviewDate: value }))}
            />
          </div>
          <FormActions saveLabel="Save risk or issue" onCancel={() => setIsCreating(false)} />
        </form>
      ) : null}
      <div className="mt-6 border-y border-gray-200 dark:border-gray-800">
        {risks.map((risk) => (
          <div
            key={`${risk.title}-${risk.reviewDate}`}
            className="grid gap-3 border-b border-gray-100 py-4 last:border-b-0 dark:border-gray-800 md:grid-cols-[minmax(0,1fr)_120px_130px_120px] md:items-start"
          >
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{risk.title}</p>
              <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">{risk.response}</p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">{risk.owner}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{risk.type} · {risk.severity}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{risk.reviewDate}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const emptyDependency: Omit<DependencyItem, "id"> = {
  predecessorId: "",
  successorId: "",
  type: "Finish-to-start",
};

function DependenciesSection({
  dependencies,
  workItems,
  onAdd,
}: {
  dependencies: DependencyItem[];
  workItems: WorkItem[];
  onAdd: (dependency: DependencyItem) => void;
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [draft, setDraft] = useState(emptyDependency);
  const [errors, setErrors] = useState<string[]>([]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = [
      !draft.predecessorId ? "Predecessor is required." : "",
      !draft.successorId ? "Successor is required." : "",
      draft.predecessorId && draft.predecessorId === draft.successorId
        ? "A work item cannot depend on itself."
        : "",
      dependencies.some(
        (item) =>
          item.predecessorId === draft.predecessorId && item.successorId === draft.successorId,
      )
        ? "This dependency already exists."
        : "",
      draft.predecessorId &&
      draft.successorId &&
      wouldCreateDependencyCycle(dependencies, draft.predecessorId, draft.successorId)
        ? "This dependency would create a cycle."
        : "",
    ].filter(Boolean);

    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      return;
    }

    onAdd({
      id: `DEP-${Date.now()}`,
      ...draft,
    });
    setDraft(emptyDependency);
    setErrors([]);
    setIsCreating(false);
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {dependencies.length} explicit dependenc{dependencies.length === 1 ? "y" : "ies"}
        </p>
        <button
          type="button"
          onClick={() => {
            setDraft(emptyDependency);
            setErrors([]);
            setIsCreating(true);
          }}
          disabled={workItems.length < 2}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add dependency
        </button>
      </div>

      {isCreating ? (
        <form onSubmit={submit} className="mt-6 border-y border-gray-200 py-6 dark:border-gray-800">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">New dependency</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Define the order in which related work must be completed.
            </p>
          </div>
          <ValidationErrors errors={errors} label="Dependency validation errors" />
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            <SelectField
              label="Predecessor work item"
              value={draft.predecessorId}
              options={workItems.map((item) => item.id)}
              placeholder="Select predecessor"
              onChange={(value) =>
                setDraft((current) => ({ ...current, predecessorId: value }))
              }
            />
            <SelectField
              label="Successor work item"
              value={draft.successorId}
              options={workItems.map((item) => item.id)}
              placeholder="Select successor"
              onChange={(value) => setDraft((current) => ({ ...current, successorId: value }))}
            />
            <SelectField
              label="Dependency type"
              value={draft.type}
              options={["Finish-to-start", "Start-to-start", "Finish-to-finish"]}
              onChange={(value) =>
                setDraft((current) => ({ ...current, type: value as DependencyItem["type"] }))
              }
            />
          </div>
          <FormActions saveLabel="Save dependency" onCancel={() => setIsCreating(false)} />
        </form>
      ) : null}

      <div className="mt-6 border-y border-gray-200 dark:border-gray-800">
        {dependencies.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
            No explicit dependencies have been recorded.
          </p>
        ) : (
          dependencies.map((dependency) => (
            <div
              key={dependency.id}
              className="flex flex-col gap-2 border-b border-gray-100 py-4 last:border-b-0 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {dependency.predecessorId} → {dependency.successorId}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{dependency.type}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ValidationErrors({ errors, label }: { errors: string[]; label: string }) {
  if (errors.length === 0) return null;
  return (
    <div
      role="alert"
      aria-label={label}
      className="mt-5 border-l-4 border-error-500 bg-error-50 px-4 py-3 dark:bg-error-500/10"
    >
      <p className="text-sm font-semibold text-error-700 dark:text-error-300">
        Please correct the following fields:
      </p>
      <ul className="mt-2 space-y-1 text-sm text-error-600 dark:text-error-300">
        {errors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white"
      />
    </label>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white"
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="mt-2 w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white"
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function FormActions({ saveLabel, onCancel }: { saveLabel: string; onCancel: () => void }) {
  return (
    <div className="mt-6 flex justify-end gap-3">
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-300 px-5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="inline-flex h-11 items-center justify-center rounded-lg bg-brand-500 px-5 text-sm font-medium text-white transition hover:bg-brand-600"
      >
        {saveLabel}
      </button>
    </div>
  );
}

function OperationCount({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xl font-semibold text-gray-900 dark:text-white">{value}</p>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

function ProjectOperationsNotFound() {
  return (
    <>
      <PageMeta
        title="Project not found | SynoHub"
        description="The requested SynoHub project could not be found."
      />
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Project operations" />
        <section className="border-y border-dashed border-gray-300 px-6 py-20 text-center dark:border-gray-700">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Project not found</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            The project may have been removed or the link may be incorrect.
          </p>
          <Link
            to="/projects"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-brand-500 px-5 text-sm font-medium text-white transition hover:bg-brand-600"
          >
            Return to projects
          </Link>
        </section>
      </div>
    </>
  );
}
