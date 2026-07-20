import { Link, useLocation, useParams } from "react-router";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import {
  formatAttachmentSize,
  initialProjects,
  type Project,
  type ProjectStatus,
} from "../data/projects";

const statusStyles: Record<ProjectStatus, string> = {
  Planning:
    "border-warning-200 bg-warning-50 text-warning-700 dark:border-warning-800/40 dark:bg-warning-500/10 dark:text-warning-300",
  "In Progress":
    "border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-500/40 dark:bg-brand-500/10 dark:text-brand-300",
  Completed:
    "border-success-200 bg-success-50 text-success-700 dark:border-success-800/40 dark:bg-success-500/10 dark:text-success-300",
};

type ProjectRouteState = {
  project?: Project;
};

export default function ProjectDetails() {
  const { projectId } = useParams();
  const location = useLocation();
  const numericProjectId = Number(projectId);
  const stateProject = (location.state as ProjectRouteState | null)?.project;
  const project =
    stateProject?.id === numericProjectId
      ? stateProject
      : initialProjects.find((candidate) => candidate.id === numericProjectId);

  if (!project) {
    return (
      <>
        <PageMeta
          title="Project not found | SynoHub"
          description="The requested SynoHub project could not be found."
        />
        <div className="space-y-6">
          <PageBreadcrumb pageTitle="Project details" />
          <section className="rounded-2xl border border-dashed border-gray-300 px-6 py-20 text-center dark:border-gray-700">
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              Project not found
            </h1>
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

  return (
    <>
      <PageMeta
        title={`${project.name} | SynoHub`}
        description={`View project details for ${project.name} in SynoHub.`}
      />

      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Project details" />

        <header className="flex flex-col gap-5 border-b border-gray-200 pb-6 dark:border-gray-800 lg:flex-row lg:items-start lg:justify-between">
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
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${statusStyles[project.status]}`}
              >
                {project.status}
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-gray-900 dark:text-white">
              {project.name}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500 dark:text-gray-400">
              {project.additionalInformation || "No additional project information has been added."}
            </p>
          </div>

          {project.repoUrl ? (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl border border-gray-300 px-5 text-sm font-medium text-gray-700 transition hover:border-brand-300 hover:text-brand-600 dark:border-gray-700 dark:text-gray-300 dark:hover:border-brand-500/50 dark:hover:text-brand-300"
              aria-label="Open project repository"
            >
              Open repository ↗
            </a>
          ) : null}
        </header>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.7fr)]">
          <main className="space-y-6">
            <DetailSection title="Overview">
              <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                <DetailItem label="Project owner" value={project.owner} />
                <DetailItem label="Project manager" value={project.manager} />
                <DetailItem label="Start date" value={project.startDate || "Not set"} />
                <DetailItem label="Deadline" value={project.deadline || "Not set"} />
                <DetailItem label="Budget" value={project.budget || "Not set"} />
                <DetailItem label="Status" value={project.status} />
              </div>
            </DetailSection>

            <DetailSection title="Team and technology">
              <div className="space-y-5">
                <DetailItem label="Project members" value={project.members || "Not set"} />
                <DetailItem label="Technology stack" value={project.stack || "Not set"} />
              </div>
            </DetailSection>

            <DetailSection title="Additional information">
              <p className="text-sm leading-7 text-gray-700 dark:text-gray-300">
                {project.additionalInformation || "No additional information has been added."}
              </p>
            </DetailSection>
          </main>

          <aside className="space-y-6">
            <DetailSection title="Repository">
              {project.repoUrl ? (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="break-words text-sm font-medium text-brand-500 transition hover:text-brand-600 dark:text-brand-300 [overflow-wrap:anywhere]"
                >
                  {project.repoUrl}
                </a>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No repository URL set.</p>
              )}
            </DetailSection>

            <DetailSection title={`Attachments (${project.attachments.length})`}>
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
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {attachment.type}
                        </p>
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
            </DetailSection>
          </aside>
        </div>
      </div>
    </>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
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
