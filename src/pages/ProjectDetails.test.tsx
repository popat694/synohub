import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";
import { AppWrapper } from "../components/common/PageMeta";
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
    expect(screen.getByText("Parth Popat")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to projects" })).toHaveAttribute(
      "href",
      "/projects",
    );
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
