import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { AppWrapper } from "../components/common/PageMeta";
import { ThemeProvider } from "../context/ThemeContext";
import { clearProjectOperationsMemoryForTests } from "../data/projectOperationsStore";

function renderAppAt(path: string) {
  window.history.pushState({}, "", path);
  return render(
    <ThemeProvider>
      <AppWrapper>
        <App />
      </AppWrapper>
    </ThemeProvider>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
  window.history.pushState({}, "", "/");
  window.localStorage.clear();
  clearProjectOperationsMemoryForTests();
});

describe("project operations workflow", () => {
  it("opens a dedicated operations workspace for the selected project", async () => {
    renderAppAt("/projects/1/operations");

    expect(
      await screen.findByRole("heading", { level: 1, name: "Project operations" }),
    ).toBeInTheDocument();
    expect(screen.getByText("SynoHub Dashboard")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to command center" })).toHaveAttribute(
      "href",
      "/projects/1",
    );

    for (const section of [
      "Milestones",
      "Work items",
      "Dependencies",
      "Risks & issues",
      "Decisions",
      "Status updates",
    ]) {
      expect(screen.getByRole("button", { name: section })).toBeInTheDocument();
    }
  });

  it("shows a safe not-found state for an unknown project", async () => {
    renderAppAt("/projects/999/operations");

    expect(await screen.findByText("Project not found")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Return to projects" })).toHaveAttribute(
      "href",
      "/projects",
    );
  });

  it("falls back to seeded records when persisted operations data is malformed", async () => {
    window.localStorage.setItem(
      "synohub.project-operations.v1.1",
      JSON.stringify({ version: 1, data: { workItems: [null], milestones: "invalid" } }),
    );
    const user = userEvent.setup();

    renderAppAt("/projects/1/operations");
    await user.click(await screen.findByRole("button", { name: "Work items" }));

    expect(screen.getByText("SYN-31")).toBeInTheDocument();
  });

  it("validates and creates a work item in the project workspace", async () => {
    const user = userEvent.setup();
    renderAppAt("/projects/1/operations");

    await user.click(await screen.findByRole("button", { name: "Work items" }));
    expect(screen.getByText("SYN-38")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Add work item" }));
    await user.click(screen.getByRole("button", { name: "Save work item" }));

    expect(screen.getByText("Work item ID is required.")).toBeInTheDocument();
    expect(screen.getByText("Title is required.")).toBeInTheDocument();
    expect(screen.getByText("Owner is required.")).toBeInTheDocument();
    expect(screen.getByText("Due date is required.")).toBeInTheDocument();

    await user.type(screen.getByRole("textbox", { name: "Work item ID" }), "SYN-55");
    await user.type(
      screen.getByRole("textbox", { name: "Work item title" }),
      "Map operational data contracts",
    );
    await user.type(screen.getByRole("textbox", { name: "Work item owner" }), "Parth");
    await user.type(screen.getByLabelText("Work item due date"), "2026-08-05");
    await user.selectOptions(screen.getByLabelText("Work item priority"), "High");
    await user.selectOptions(screen.getByLabelText("Work item status"), "In progress");
    await user.click(screen.getByRole("button", { name: "Save work item" }));

    expect(screen.getByText("SYN-55")).toBeInTheDocument();
    expect(screen.getByText("Map operational data contracts")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Save work item" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Back to command center" }));
    await user.click(await screen.findByRole("tab", { name: "Work" }));
    expect(screen.getByText("SYN-55")).toBeInTheDocument();
    expect(screen.getByText("2 of 7 work items complete")).toBeInTheDocument();
  });

  it("warns and retains a submitted record across navigation when browser storage fails", async () => {
    const originalSetItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (
      this: Storage,
      key: string,
      value: string,
    ) {
      if (key.startsWith("synohub.project-operations")) {
        throw new DOMException("Storage quota exceeded", "QuotaExceededError");
      }
      return originalSetItem.call(this, key, value);
    });
    const user = userEvent.setup();
    renderAppAt("/projects/1/operations");

    await user.click(await screen.findByRole("button", { name: "Work items" }));
    await user.click(screen.getByRole("button", { name: "Add work item" }));
    await user.type(screen.getByRole("textbox", { name: "Work item ID" }), "SYN-SESSION");
    await user.type(screen.getByRole("textbox", { name: "Work item title" }), "Session-only work");
    await user.type(screen.getByRole("textbox", { name: "Work item owner" }), "Parth");
    await user.type(screen.getByLabelText("Work item due date"), "2026-08-05");
    await user.click(screen.getByRole("button", { name: "Save work item" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Saved for this session only; browser storage is unavailable.",
    );
    await user.click(screen.getByRole("link", { name: "Back to command center" }));
    await user.click(await screen.findByRole("link", { name: "Manage project operations" }));
    await user.click(await screen.findByRole("button", { name: "Work items" }));
    expect(screen.getByText("SYN-SESSION")).toBeInTheDocument();
    expect(screen.getByText("Session-only work")).toBeInTheDocument();
  });

  it("rejects a duplicate work-item ID with a clear validation error", async () => {
    const user = userEvent.setup();
    renderAppAt("/projects/1/operations");

    await user.click(await screen.findByRole("button", { name: "Work items" }));
    await user.click(screen.getByRole("button", { name: "Add work item" }));
    await user.type(screen.getByRole("textbox", { name: "Work item ID" }), "SYN-31");
    await user.type(screen.getByRole("textbox", { name: "Work item title" }), "Duplicate item");
    await user.type(screen.getByRole("textbox", { name: "Work item owner" }), "Parth");
    await user.type(screen.getByLabelText("Work item due date"), "2026-08-05");
    await user.click(screen.getByRole("button", { name: "Save work item" }));

    expect(screen.getByText('Work item ID "SYN-31" already exists.')).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save work item" })).toBeInTheDocument();
    expect(screen.getAllByText("SYN-31")).toHaveLength(1);
  });

  it("creates an explicit dependency between work items", async () => {
    const user = userEvent.setup();
    renderAppAt("/projects/1/operations");

    await user.click(await screen.findByRole("button", { name: "Dependencies" }));
    await user.click(screen.getByRole("button", { name: "Add dependency" }));
    await user.click(screen.getByRole("button", { name: "Save dependency" }));

    expect(screen.getByText("Predecessor is required.")).toBeInTheDocument();
    expect(screen.getByText("Successor is required.")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Predecessor work item"), "SYN-34");
    await user.selectOptions(screen.getByLabelText("Successor work item"), "SYN-41");
    await user.selectOptions(screen.getByLabelText("Dependency type"), "Finish-to-start");
    await user.click(screen.getByRole("button", { name: "Save dependency" }));

    expect(screen.getByText("SYN-34 → SYN-41")).toBeInTheDocument();
    expect(screen.getAllByText("Finish-to-start")).toHaveLength(2);

    await user.click(screen.getByRole("link", { name: "Back to command center" }));
    await user.click(await screen.findByRole("tab", { name: "Plan" }));
    expect(screen.getByText("SYN-34 → SYN-41")).toBeInTheDocument();
  });

  it("rejects direct and transitive dependency cycles", async () => {
    const user = userEvent.setup();
    renderAppAt("/projects/1/operations");
    await user.click(await screen.findByRole("button", { name: "Dependencies" }));

    await user.click(screen.getByRole("button", { name: "Add dependency" }));
    await user.selectOptions(screen.getByLabelText("Predecessor work item"), "SYN-34");
    await user.selectOptions(screen.getByLabelText("Successor work item"), "SYN-31");
    await user.click(screen.getByRole("button", { name: "Save dependency" }));
    expect(screen.getByText("This dependency would create a cycle.")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Successor work item"), "SYN-38");
    await user.click(screen.getByRole("button", { name: "Save dependency" }));
    await user.click(screen.getByRole("button", { name: "Add dependency" }));
    await user.selectOptions(screen.getByLabelText("Predecessor work item"), "SYN-38");
    await user.selectOptions(screen.getByLabelText("Successor work item"), "SYN-31");
    await user.click(screen.getByRole("button", { name: "Save dependency" }));
    expect(screen.getByText("This dependency would create a cycle.")).toBeInTheDocument();
  });

  it("validates and creates a milestone", async () => {
    const user = userEvent.setup();
    renderAppAt("/projects/1/operations");

    await user.click(await screen.findByRole("button", { name: "Add milestone" }));
    await user.click(screen.getByRole("button", { name: "Save milestone" }));
    expect(screen.getByText("Milestone name is required.")).toBeInTheDocument();
    expect(screen.getByText("Milestone owner is required.")).toBeInTheDocument();
    expect(screen.getByText("Milestone due date is required.")).toBeInTheDocument();
    expect(screen.getByText("Deliverables are required.")).toBeInTheDocument();

    await user.type(screen.getByRole("textbox", { name: "Milestone name" }), "Operations data foundation");
    await user.type(screen.getByRole("textbox", { name: "Milestone owner" }), "Kishan");
    await user.type(screen.getByLabelText("Milestone due date"), "2026-08-12");
    await user.clear(screen.getByLabelText("Milestone progress"));
    await user.type(screen.getByLabelText("Milestone progress"), "25");
    await user.selectOptions(screen.getByLabelText("Milestone status"), "On track");
    await user.type(
      screen.getByRole("textbox", { name: "Milestone deliverables" }),
      "Operational records and persistence layer",
    );
    await user.click(screen.getByRole("button", { name: "Save milestone" }));

    expect(screen.getByText("Operations data foundation")).toBeInTheDocument();
    expect(screen.getByText("25% complete")).toBeInTheDocument();
  });

  it("records a risk with an owner and response", async () => {
    const user = userEvent.setup();
    renderAppAt("/projects/1/operations");

    await user.click(await screen.findByRole("button", { name: "Risks & issues" }));
    await user.click(screen.getByRole("button", { name: "Add risk or issue" }));
    await user.click(screen.getByRole("button", { name: "Save risk or issue" }));
    expect(screen.getByText("Risk or issue title is required.")).toBeInTheDocument();
    expect(screen.getByText("Risk owner is required.")).toBeInTheDocument();
    expect(screen.getByText("Response plan is required.")).toBeInTheDocument();
    expect(screen.getByText("Review date is required.")).toBeInTheDocument();

    await user.type(
      screen.getByRole("textbox", { name: "Risk or issue title" }),
      "Operational schema may drift",
    );
    await user.selectOptions(screen.getByLabelText("Risk type"), "Risk");
    await user.type(screen.getByRole("textbox", { name: "Risk owner" }), "Aakash");
    await user.selectOptions(screen.getByLabelText("Risk severity"), "High");
    await user.type(
      screen.getByRole("textbox", { name: "Response plan" }),
      "Review data contracts before each integration.",
    );
    await user.type(screen.getByLabelText("Risk review date"), "2026-08-08");
    await user.click(screen.getByRole("button", { name: "Save risk or issue" }));

    expect(screen.getByText("Operational schema may drift")).toBeInTheDocument();
    expect(screen.getByText("Review data contracts before each integration.")).toBeInTheDocument();
  });

  it("records a project decision with its rationale", async () => {
    const user = userEvent.setup();
    renderAppAt("/projects/1/operations");

    await user.click(await screen.findByRole("button", { name: "Decisions" }));
    await user.click(screen.getByRole("button", { name: "Add decision" }));
    await user.click(screen.getByRole("button", { name: "Save decision" }));
    expect(screen.getByText("Decision title is required.")).toBeInTheDocument();
    expect(screen.getByText("Decision outcome is required.")).toBeInTheDocument();
    expect(screen.getByText("Decision owner is required.")).toBeInTheDocument();
    expect(screen.getByText("Decision date is required.")).toBeInTheDocument();
    expect(screen.getByText("Decision context is required.")).toBeInTheDocument();

    await user.type(
      screen.getByRole("textbox", { name: "Decision title" }),
      "Use a canonical operations model",
    );
    await user.type(
      screen.getByRole("textbox", { name: "Decision outcome" }),
      "All integrations will map into SynoHub records.",
    );
    await user.type(screen.getByRole("textbox", { name: "Decision owner" }), "Parth");
    await user.type(screen.getByLabelText("Decision date"), "2026-07-20");
    await user.type(
      screen.getByRole("textbox", { name: "Decision context" }),
      "A single model prevents provider-specific behavior from leaking into PM workflows.",
    );
    await user.click(screen.getByRole("button", { name: "Save decision" }));

    expect(screen.getByText("Use a canonical operations model")).toBeInTheDocument();
    expect(screen.getByText("All integrations will map into SynoHub records.")).toBeInTheDocument();
  });

  it("records a structured status update", async () => {
    const user = userEvent.setup();
    renderAppAt("/projects/1/operations");

    await user.click(await screen.findByRole("button", { name: "Status updates" }));
    await user.click(screen.getByRole("button", { name: "Add status update" }));
    await user.click(screen.getByRole("button", { name: "Save status update" }));
    expect(screen.getByText("Reporting period is required.")).toBeInTheDocument();
    expect(screen.getByText("Status summary is required.")).toBeInTheDocument();
    expect(screen.getByText("At least one highlight is required.")).toBeInTheDocument();
    expect(screen.getByText("At least one next step is required.")).toBeInTheDocument();
    expect(screen.getByText("Update author is required.")).toBeInTheDocument();

    await user.type(screen.getByRole("textbox", { name: "Reporting period" }), "Jul 21–27, 2026");
    await user.selectOptions(screen.getByLabelText("Update health"), "Green");
    await user.type(
      screen.getByRole("textbox", { name: "Status summary" }),
      "The operations workspace is ready for PM validation.",
    );
    await user.type(
      screen.getByRole("textbox", { name: "Update highlights" }),
      "Added canonical project records\nAdded explicit dependency tracking",
    );
    await user.type(
      screen.getByRole("textbox", { name: "Update next steps" }),
      "Validate workflows with PMs\nConnect the backend API",
    );
    await user.type(screen.getByRole("textbox", { name: "Update author" }), "Parth Popat");
    await user.click(screen.getByRole("button", { name: "Save status update" }));

    expect(screen.getByText("Jul 21–27, 2026")).toBeInTheDocument();
    expect(screen.getByText("The operations workspace is ready for PM validation.")).toBeInTheDocument();
  });
});
