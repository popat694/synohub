import { useMemo, useState } from "react";
import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";

type ProjectStatus = "Planning" | "In Progress" | "Completed";
type ViewMode = "grid" | "list";

type Project = {
  id: number;
  name: string;
  owner: string;
  status: ProjectStatus;
  deadline: string;
  stack: string;
  budget: string;
};

const initialProjects: Project[] = [
  {
    id: 1,
    name: "SynoHub Dashboard",
    owner: "Parth",
    status: "In Progress",
    deadline: "2026-08-20",
    stack: "React, Tailwind, Vite",
    budget: "$24k",
  },
  {
    id: 2,
    name: "Server Monitoring",
    owner: "DevOps Team",
    status: "Planning",
    deadline: "2026-09-01",
    stack: "React, API, Alerts",
    budget: "$18k",
  },
  {
    id: 3,
    name: "Client Portal",
    owner: "Aakash",
    status: "Completed",
    deadline: "2026-07-10",
    stack: "React, Node, PostgreSQL",
    budget: "$31k",
  },
];

const statusStyles: Record<ProjectStatus, string> = {
  Planning:
    "border-warning-200 bg-warning-50 text-warning-700 dark:border-warning-800/40 dark:bg-warning-500/10 dark:text-warning-300",
  "In Progress":
    "border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-500/40 dark:bg-brand-500/10 dark:text-brand-300",
  Completed:
    "border-success-200 bg-success-50 text-success-700 dark:border-success-800/40 dark:bg-success-500/10 dark:text-success-300",
};

const statusDotStyles: Record<ProjectStatus, string> = {
  Planning: "bg-warning-500",
  "In Progress": "bg-brand-500",
  Completed: "bg-success-500",
};

const emptyForm = {
  name: "",
  owner: "",
  status: "Planning" as ProjectStatus,
  deadline: "",
  stack: "",
  budget: "",
};

export default function Projects() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const stats = useMemo(() => {
    const total = projects.length;
    const inProgress = projects.filter((project) => project.status === "In Progress").length;
    const completed = projects.filter((project) => project.status === "Completed").length;

    return { total, inProgress, completed };
  }, [projects]);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setProjects((current) => [
      {
        id: Date.now(),
        name: form.name.trim(),
        owner: form.owner.trim(),
        status: form.status,
        deadline: form.deadline,
        stack: form.stack.trim(),
        budget: form.budget.trim(),
      },
      ...current,
    ]);

    setForm(emptyForm);
    setViewMode("grid");
    closeDrawer();
  };

  return (
    <>
      <PageMeta
        title="Projects | SynoHub"
        description="Track projects, switch between list and grid view, and create new projects in SynoHub."
      />

      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Projects" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: "Total projects", value: stats.total },
            { label: "In progress", value: stats.inProgress },
            { label: "Completed", value: stats.completed },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <section className="space-y-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Project board
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Switch between list and grid view.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-gray-800 dark:bg-gray-900/40">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    viewMode === "grid"
                      ? "bg-white text-gray-800 shadow-sm dark:bg-gray-800 dark:text-white/90"
                      : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90"
                  }`}
                >
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    viewMode === "list"
                      ? "bg-white text-gray-800 shadow-sm dark:bg-gray-800 dark:text-white/90"
                      : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90"
                  }`}
                >
                  List
                </button>
              </div>

              <button
                type="button"
                onClick={openDrawer}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-brand-500 px-5 text-sm font-medium text-white transition hover:bg-brand-600"
              >
                Add project
              </button>
            </div>
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2">
              {projects.map((project) => (
                <article
                  key={project.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        {project.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Owned by {project.owner}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[project.status]}`}
                    >
                      <span className={`mr-2 size-2 rounded-full ${statusDotStyles[project.status]}`} />
                      {project.status}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50">
                      <p className="text-gray-500 dark:text-gray-400">Deadline</p>
                      <p className="mt-1 font-medium text-gray-800 dark:text-white/90">
                        {project.deadline || "Not set"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50">
                      <p className="text-gray-500 dark:text-gray-400">Budget</p>
                      <p className="mt-1 font-medium text-gray-800 dark:text-white/90">
                        {project.budget || "Not set"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl bg-gray-50 p-3 text-sm dark:bg-gray-800/50">
                    <p className="text-gray-500 dark:text-gray-400">Stack</p>
                    <p className="mt-1 font-medium text-gray-800 dark:text-white/90">
                      {project.stack || "Not set"}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 border-b border-gray-200 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <div>Project</div>
                <div>Owner</div>
                <div>Status</div>
                <div>Deadline</div>
                <div>Budget</div>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="grid grid-cols-1 gap-4 px-5 py-4 text-sm md:grid-cols-[2fr_1fr_1fr_1fr_1fr] md:items-center"
                  >
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white/90">
                        {project.name}
                      </p>
                      <p className="mt-1 text-gray-500 dark:text-gray-400">
                        {project.stack || "No stack set"}
                      </p>
                    </div>
                    <div className="text-gray-700 dark:text-gray-300">{project.owner}</div>
                    <div>
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[project.status]}`}
                      >
                        {project.status}
                      </span>
                    </div>
                    <div className="text-gray-700 dark:text-gray-300">
                      {project.deadline || "Not set"}
                    </div>
                    <div className="text-gray-700 dark:text-gray-300">
                      {project.budget || "Not set"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      <div
        className={`fixed inset-0 z-[60] transition duration-300 ease-out ${
          isDrawerOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!isDrawerOpen}
      >
        <button
          type="button"
          aria-label="Close project drawer"
          className={`absolute inset-0 bg-gray-950/50 backdrop-blur-sm transition-opacity duration-300 ${
            isDrawerOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeDrawer}
        />

        <aside
          className={`absolute right-0 top-0 h-full w-full max-w-[460px] border-l border-gray-200 bg-white shadow-2xl transition-transform duration-300 ease-out dark:border-gray-800 dark:bg-gray-900 sm:max-w-[520px] ${
            isDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5 dark:border-gray-800">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Add project
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Create a project in the side panel.
                </p>
              </div>

              <button
                type="button"
                onClick={closeDrawer}
                className="inline-flex size-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white/90"
                aria-label="Close drawer"
              >
                ✕
              </button>
            </div>

            <form className="flex-1 space-y-4 overflow-y-auto px-6 py-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Project name
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className="h-11 w-full rounded-xl border border-gray-300 bg-transparent px-4 text-sm text-gray-800 outline-none transition focus:border-brand-500 dark:border-gray-700 dark:text-white/90"
                  placeholder="Website revamp"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Owner
                  </label>
                  <input
                    required
                    value={form.owner}
                    onChange={(event) => setForm({ ...form, owner: event.target.value })}
                    className="h-11 w-full rounded-xl border border-gray-300 bg-transparent px-4 text-sm text-gray-800 outline-none transition focus:border-brand-500 dark:border-gray-700 dark:text-white/90"
                    placeholder="Parth"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm({ ...form, status: event.target.value as ProjectStatus })
                    }
                    className="h-11 w-full rounded-xl border border-gray-300 bg-transparent px-4 text-sm text-gray-800 outline-none transition focus:border-brand-500 dark:border-gray-700 dark:text-white/90"
                  >
                    <option>Planning</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(event) => setForm({ ...form, deadline: event.target.value })}
                    className="h-11 w-full rounded-xl border border-gray-300 bg-transparent px-4 text-sm text-gray-800 outline-none transition focus:border-brand-500 dark:border-gray-700 dark:text-white/90"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Budget
                  </label>
                  <input
                    value={form.budget}
                    onChange={(event) => setForm({ ...form, budget: event.target.value })}
                    className="h-11 w-full rounded-xl border border-gray-300 bg-transparent px-4 text-sm text-gray-800 outline-none transition focus:border-brand-500 dark:border-gray-700 dark:text-white/90"
                    placeholder="$25k"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tech stack
                </label>
                <input
                  value={form.stack}
                  onChange={(event) => setForm({ ...form, stack: event.target.value })}
                  className="h-11 w-full rounded-xl border border-gray-300 bg-transparent px-4 text-sm text-gray-800 outline-none transition focus:border-brand-500 dark:border-gray-700 dark:text-white/90"
                  placeholder="React, Node, PostgreSQL"
                />
              </div>

              <div className="sticky bottom-0 flex items-center gap-3 border-t border-gray-200 bg-white pt-4 dark:border-gray-800 dark:bg-gray-900">
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-300 px-5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-brand-500 px-5 text-sm font-medium text-white transition hover:bg-brand-600"
                >
                  Create project
                </button>
              </div>
            </form>
          </div>
        </aside>
      </div>
    </>
  );
}
