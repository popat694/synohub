import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Link, MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";
import { AppWrapper } from "../components/common/PageMeta";
import { initialProjects } from "../data/projects";
import ProjectDetails from "./ProjectDetails";
import Projects from "./Projects";

function renderWithAppProviders(ui: React.ReactNode, initialPath: string) {
  return render(
    <AppWrapper>
      <MemoryRouter initialEntries={[initialPath]}>{ui}</MemoryRouter>
    </AppWrapper>,
  );
}

describe("project details workflow", () => {
  it("offers a details link for each project", () => {
    renderWithAppProviders(<Projects />, "/projects");

    expect(
      screen.getByRole("link", { name: "View SynoHub Dashboard details" }),
    ).toHaveAttribute("href", "/projects/1");
  });

  it("renders the selected project on its dedicated page", () => {
    renderWithAppProviders(
      <Routes>
        <Route path="/projects/:projectId" element={<ProjectDetails />} />
      </Routes>,
      "/projects/1",
    );

    expect(screen.getByRole("heading", { name: "SynoHub Dashboard" })).toBeInTheDocument();
    expect(screen.getByText("P-1162")).toBeInTheDocument();
    expect(within(screen.getByRole("tabpanel")).getByText("Parth Popat")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to projects" })).toHaveAttribute(
      "href",
      "/projects",
    );
  });

  it("supports the project command-center workflow", async () => {
    const user = userEvent.setup();

    renderWithAppProviders(
      <Routes>
        <Route path="/projects/:projectId" element={<ProjectDetails />} />
      </Routes>,
      "/projects/1",
    );

    expect(screen.getByRole("heading", { name: "AI project intelligence" })).toBeInTheDocument();
    expect(screen.getByText("2 items need attention")).toBeInTheDocument();
    expect(screen.getByText("2 of 6 work items complete")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Plan" }));
    expect(screen.getByRole("heading", { name: "Milestone plan" })).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Work" }));
    expect(screen.getByRole("heading", { name: "Work board" })).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Risks & issues" }));
    expect(screen.getByRole("heading", { name: "Risk register" })).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Decisions" }));
    expect(screen.getByRole("heading", { name: "Decision log" })).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Updates" }));
    expect(screen.getByRole("heading", { name: "Status updates" })).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Activity" }));
    expect(screen.getByRole("heading", { name: "Activity timeline" })).toBeInTheDocument();
  });

  it("uses project-specific operational data", async () => {
    const user = userEvent.setup();

    renderWithAppProviders(
      <Routes>
        <Route path="/projects/:projectId" element={<ProjectDetails />} />
      </Routes>,
      "/projects/2",
    );

    expect(screen.getByRole("heading", { name: "Server Monitoring" })).toBeInTheDocument();
    expect(screen.getByText("1 of 4 work items complete")).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Work" }));
    expect(screen.getByText("MON-12")).toBeInTheDocument();
    expect(screen.queryByText("SYN-31")).not.toBeInTheDocument();
  });

  it("keeps completed-project data isolated from other command centers", async () => {
    const user = userEvent.setup();

    renderWithAppProviders(
      <Routes>
        <Route path="/projects/:projectId" element={<ProjectDetails />} />
      </Routes>,
      "/projects/3",
    );

    expect(screen.getByRole("heading", { name: "Client Portal" })).toBeInTheDocument();
    expect(screen.getByText("3 of 3 work items complete")).toBeInTheDocument();
    expect(screen.getByText("0 items need attention")).toBeInTheDocument();
    expect(screen.queryByText("Blocked work")).not.toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Work" }));
    expect(screen.getByText("CP-81")).toBeInTheDocument();
    expect(screen.queryByText("SYN-31")).not.toBeInTheDocument();
  });

  it("supports keyboard navigation for its tab interface", async () => {
    const user = userEvent.setup();

    renderWithAppProviders(
      <Routes>
        <Route path="/projects/:projectId" element={<ProjectDetails />} />
      </Routes>,
      "/projects/1",
    );

    const overviewTab = screen.getByRole("tab", { name: "Overview" });
    const planTab = screen.getByRole("tab", { name: "Plan" });
    const panel = screen.getByRole("tabpanel");
    const allPanels = screen.getAllByRole("tabpanel", { hidden: true });

    expect(overviewTab).toHaveAttribute("id", "project-tab-overview");
    expect(overviewTab).toHaveAttribute("tabindex", "0");
    expect(planTab).toHaveAttribute("tabindex", "-1");
    expect(panel).toHaveAttribute("aria-labelledby", "project-tab-overview");
    expect(allPanels).toHaveLength(7);
    for (const tab of screen.getAllByRole("tab")) {
      expect(document.getElementById(tab.getAttribute("aria-controls") ?? "missing")).not.toBeNull();
    }

    overviewTab.focus();
    await user.keyboard("{ArrowRight}");
    expect(planTab).toHaveFocus();
    expect(planTab).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Activity" })).toHaveFocus();
    expect(screen.getByRole("heading", { name: "Activity timeline" })).toBeInTheDocument();

    await user.keyboard("{Home}");
    expect(overviewTab).toHaveFocus();
  });

  it("supports a PM-controlled status-update approval lifecycle", async () => {
    const user = userEvent.setup();

    renderWithAppProviders(
      <Routes>
        <Route path="/projects/:projectId" element={<ProjectDetails />} />
      </Routes>,
      "/projects/1",
    );

    await user.click(screen.getByRole("button", { name: "Draft status update" }));
    expect(screen.getByRole("tab", { name: "Updates" })).toHaveFocus();
    expect(screen.queryByText(/awaiting PM approval/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Generate draft" }));
    expect(screen.getByRole("heading", { name: "Status draft workspace" })).toBeInTheDocument();

    const draft = screen.getByRole("textbox", { name: /stakeholder summary/i });
    await user.clear(draft);
    await user.type(draft, "Project-specific status draft");
    await user.click(screen.getByRole("tab", { name: "Work" }));
    await user.click(screen.getByRole("tab", { name: "Updates" }));
    expect(screen.getByRole("textbox", { name: /stakeholder summary/i })).toHaveValue(
      "Project-specific status draft",
    );

    await user.click(screen.getByRole("button", { name: "Submit for approval" }));
    expect(screen.getByText("Awaiting PM approval")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Approve update" }));
    expect(screen.getByText("Approved for sharing")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Share update" }));
    expect(screen.getByText("Shared with stakeholders")).toBeInTheDocument();
  });

  it("resets draft workflow state when navigating to another project", async () => {
    const user = userEvent.setup();

    renderWithAppProviders(
      <>
        <Link to="/projects/2">Switch project</Link>
        <Routes>
          <Route path="/projects/:projectId" element={<ProjectDetails />} />
        </Routes>
      </>,
      "/projects/1",
    );

    await user.click(screen.getByRole("button", { name: "Draft status update" }));
    await user.click(screen.getByRole("button", { name: "Generate draft" }));
    const draft = screen.getByRole("textbox", { name: /stakeholder summary/i });
    await user.clear(draft);
    await user.type(draft, "SynoHub-only draft");

    await user.click(screen.getByRole("link", { name: "Switch project" }));
    expect(screen.getByRole("heading", { name: "Server Monitoring" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Generate draft" })).toBeInTheDocument();
    expect(screen.queryByDisplayValue("SynoHub-only draft")).not.toBeInTheDocument();
  });

  it("prevents approval of an empty generated update", async () => {
    const user = userEvent.setup();
    const newProject = {
      ...initialProjects[0],
      id: 4,
      name: "New Project",
      projectNumber: "P-NEW",
    };

    render(
      <AppWrapper>
        <MemoryRouter
          initialEntries={[{ pathname: "/projects/4", state: { project: newProject } }]}
        >
          <Routes>
            <Route path="/projects/:projectId" element={<ProjectDetails />} />
          </Routes>
        </MemoryRouter>
      </AppWrapper>,
    );

    await user.click(screen.getByRole("button", { name: "Draft status update" }));
    await user.click(screen.getByRole("button", { name: "Generate draft" }));
    expect(screen.getByRole("button", { name: "Submit for approval" })).toBeDisabled();
    expect(screen.getByText("Add a stakeholder summary before submitting.")).toBeInTheDocument();
  });

  it("shows a safe not-found state for an unknown project", () => {
    renderWithAppProviders(
      <Routes>
        <Route path="/projects/:projectId" element={<ProjectDetails />} />
      </Routes>,
      "/projects/999",
    );

    expect(screen.getByRole("heading", { name: "Project not found" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to projects" })).toHaveAttribute(
      "href",
      "/projects",
    );
  });
});
