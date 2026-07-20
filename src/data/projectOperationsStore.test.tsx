import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getProjectCommandCenterData } from "./projectCommandCenterByProject";
import {
  clearProjectOperationsMemoryForTests,
  loadProjectOperations,
  useProjectOperationsData,
} from "./projectOperationsStore";

const storageKey = "synohub.project-operations.v1.1";

function persist(data: Record<string, unknown>) {
  window.localStorage.setItem(storageKey, JSON.stringify({ version: 1, data }));
}

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
  clearProjectOperationsMemoryForTests();
});

describe("project operations persistence", () => {
  it("falls back to seeded data when localStorage reads throw", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Storage is unavailable", "SecurityError");
    });

    expect(() => loadProjectOperations(1)).not.toThrow();
    expect(loadProjectOperations(1).workItems).toEqual(getProjectCommandCenterData(1).workItems);
  });

  it("updates in-memory hook state when localStorage writes throw", () => {
    const { result } = renderHook(() => useProjectOperationsData(1));
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Storage quota exceeded", "QuotaExceededError");
    });

    expect(() => {
      act(() => {
        result.current.updateData((current) => ({
          ...current,
          decisions: [
            ...current.decisions,
            {
              title: "Keep local state",
              decision: "Render the update even when persistence fails.",
              owner: "Parth",
              date: "Jul 20, 2026",
              context: "Browser storage is optional.",
            },
          ],
        }));
      });
    }).not.toThrow();

    expect(result.current.data.decisions[result.current.data.decisions.length - 1]?.title).toBe(
      "Keep local state",
    );
    expect(result.current.storageWarning).toBe(
      "Saved for this session only; browser storage is unavailable.",
    );
  });

  it("retains updates across hook remounts when localStorage writes throw", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Storage quota exceeded", "QuotaExceededError");
    });
    const first = renderHook(() => useProjectOperationsData(1));

    act(() => {
      first.result.current.updateData((current) => ({
        ...current,
        decisions: [
          ...current.decisions,
          {
            title: "Session decision",
            decision: "Retain this update across navigation.",
            owner: "Parth",
            date: "Jul 20, 2026",
            context: "Durable browser storage failed.",
          },
        ],
      }));
    });
    first.unmount();

    const second = renderHook(() => useProjectOperationsData(1));
    const decisions = second.result.current.data.decisions;
    expect(decisions[decisions.length - 1]?.title).toBe("Session decision");
    expect(second.result.current.storageWarning).toBe(
      "Saved for this session only; browser storage is unavailable.",
    );
  });

  it.each([
    ["out-of-range milestone progress", { milestones: [{ name: "Bad", owner: "A", dueDate: "Soon", progress: 101, status: "On track", deliverables: "None" }] }, "milestones"],
    ["invalid milestone status", { milestones: [{ name: "Bad", owner: "A", dueDate: "Soon", progress: 50, status: "Late", deliverables: "None" }] }, "milestones"],
    ["duplicate work-item IDs", { workItems: [
      { id: "DUP-1", title: "One", owner: "A", dueDate: "Soon", priority: "High", status: "To do" },
      { id: "DUP-1", title: "Two", owner: "B", dueDate: "Later", priority: "Low", status: "Done" },
    ] }, "workItems"],
    ["invalid work-item enums", { workItems: [{ id: "NEW-1", title: "Bad", owner: "A", dueDate: "Soon", priority: "Urgent", status: "Started" }] }, "workItems"],
    ["invalid risk enums", { risks: [{ title: "Bad", type: "Concern", owner: "A", severity: "Critical", response: "Watch", reviewDate: "Soon" }] }, "risks"],
    ["invalid update health", { statusUpdates: [{ period: "Now", health: "Blue", summary: "Bad", highlights: [], nextSteps: [], author: "A" }] }, "statusUpdates"],
    ["legacy activity fields", { activityItems: [{ time: "Now", actor: "A", action: "Changed", detail: "Legacy", category: "Update" }] }, "activityItems"],
  ])("falls back from %s", (_label, data, collection) => {
    persist(data);

    expect(loadProjectOperations(1)[collection as keyof ReturnType<typeof loadProjectOperations>]).toEqual(
      getProjectCommandCenterData(1)[collection as keyof ReturnType<typeof loadProjectOperations>],
    );
  });

  it.each([
    ["blank milestone fields", { milestones: [{ name: " ", owner: "A", dueDate: "Soon", progress: 50, status: "On track", deliverables: "None" }] }, "milestones"],
    ["blank work-item fields", { workItems: [{ id: "NEW-1", title: " ", owner: "A", dueDate: "Soon", priority: "High", status: "To do" }] }, "workItems"],
    ["blank risk fields", { risks: [{ title: "Bad", type: "Risk", owner: " ", severity: "High", response: "Watch", reviewDate: "Soon" }] }, "risks"],
    ["blank decision fields", { decisions: [{ title: "Decision", decision: " ", owner: "A", date: "Soon", context: "Context" }] }, "decisions"],
    ["empty status-update highlights", { statusUpdates: [{ period: "Now", health: "Green", summary: "Good", highlights: [], nextSteps: ["Continue"], author: "A" }] }, "statusUpdates"],
    ["blank status-update highlights", { statusUpdates: [{ period: "Now", health: "Green", summary: "Good", highlights: ["Done", " "], nextSteps: ["Continue"], author: "A" }] }, "statusUpdates"],
    ["empty status-update next steps", { statusUpdates: [{ period: "Now", health: "Green", summary: "Good", highlights: ["Done"], nextSteps: [], author: "A" }] }, "statusUpdates"],
    ["blank status-update next steps", { statusUpdates: [{ period: "Now", health: "Green", summary: "Good", highlights: ["Done"], nextSteps: ["Continue", "\t"], author: "A" }] }, "statusUpdates"],
    ["blank activity fields", { activityItems: [{ time: "Now", actor: "A", action: " ", type: "Review" }] }, "activityItems"],
  ])("falls back from %s", (_label, data, collection) => {
    persist(data);

    expect(loadProjectOperations(1)[collection as keyof ReturnType<typeof loadProjectOperations>]).toEqual(
      getProjectCommandCenterData(1)[collection as keyof ReturnType<typeof loadProjectOperations>],
    );
  });

  it.each([
    ["duplicate dependency IDs", [
      { id: "DEP-1", predecessorId: "SYN-31", successorId: "SYN-34", type: "Finish-to-start" },
      { id: "DEP-1", predecessorId: "SYN-34", successorId: "SYN-38", type: "Start-to-start" },
    ]],
    ["self-referential dependencies", [
      { id: "DEP-1", predecessorId: "SYN-31", successorId: "SYN-31", type: "Finish-to-start" },
    ]],
    ["dangling dependencies", [
      { id: "DEP-1", predecessorId: "SYN-31", successorId: "MISSING", type: "Finish-to-start" },
    ]],
    ["invalid dependency types", [
      { id: "DEP-1", predecessorId: "SYN-31", successorId: "SYN-34", type: "Blocks" },
    ]],
    ["cyclic dependencies", [
      { id: "DEP-1", predecessorId: "SYN-31", successorId: "SYN-34", type: "Finish-to-start" },
      { id: "DEP-2", predecessorId: "SYN-34", successorId: "SYN-38", type: "Finish-to-start" },
      { id: "DEP-3", predecessorId: "SYN-38", successorId: "SYN-31", type: "Finish-to-start" },
    ]],
  ])("falls back from %s", (_label, dependencies) => {
    persist({ dependencies });

    expect(loadProjectOperations(1).dependencies).toEqual(getProjectCommandCenterData(1).dependencies);
  });

  it("validates dependencies against the accepted persisted work items", () => {
    const workItems = [
      { id: "NEW-1", title: "Accepted", owner: "A", dueDate: "Soon", priority: "High", status: "To do" },
      { id: "NEW-2", title: "Accepted too", owner: "B", dueDate: "Later", priority: "Low", status: "Done" },
    ];
    persist({
      workItems,
      dependencies: [
        { id: "DEP-NEW", predecessorId: "SYN-31", successorId: "SYN-34", type: "Finish-to-start" },
      ],
    });

    const loaded = loadProjectOperations(1);
    expect(loaded.workItems).toEqual(workItems);
    expect(loaded.dependencies).toEqual(getProjectCommandCenterData(1).dependencies);
  });

  it("accepts valid acyclic persisted dependencies", () => {
    const dependencies = [
      { id: "DEP-1", predecessorId: "SYN-31", successorId: "SYN-34", type: "Finish-to-start" },
      { id: "DEP-2", predecessorId: "SYN-34", successorId: "SYN-38", type: "Start-to-start" },
    ];
    persist({ dependencies });

    expect(loadProjectOperations(1).dependencies).toEqual(dependencies);
  });

  it("accepts activity items with time, actor, action, and type", () => {
    const activityItems = [{ time: "Now", actor: "Parth", action: "Validated persistence.", type: "Review" }];
    persist({ activityItems });

    expect(loadProjectOperations(1).activityItems).toEqual(activityItems);
  });
});
