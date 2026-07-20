import { useCallback, useEffect, useState } from "react";
import type { ProjectCommandCenterData } from "./projectCommandCenterByProject";
import { getProjectCommandCenterData } from "./projectCommandCenterByProject";

const STORAGE_VERSION = 1;
const storagePrefix = "synohub.project-operations";
const STORAGE_WARNING = "Saved for this session only; browser storage is unavailable.";

type PersistedProjectOperations = {
  version: number;
  data: ProjectCommandCenterData;
};

type MemoryEntry = {
  data: ProjectCommandCenterData;
  storageUnavailable: boolean;
};

const projectOperationsMemory = new Map<number, MemoryEntry>();

function cloneProjectData(projectId: number): ProjectCommandCenterData {
  return structuredClone(getProjectCommandCenterData(projectId));
}

function storageKey(projectId: number) {
  return `${storagePrefix}.v${STORAGE_VERSION}.${projectId}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasNonBlankStringFields(value: unknown, fields: string[]) {
  return (
    isRecord(value) &&
    fields.every((field) => typeof value[field] === "string" && value[field].trim().length > 0)
  );
}

function isOneOf(value: unknown, options: readonly string[]) {
  return typeof value === "string" && options.includes(value);
}

function hasUniqueStringField(items: unknown[], field: string) {
  const values = items.map((item) => (isRecord(item) ? item[field] : undefined));
  return values.every((value) => typeof value === "string") && new Set(values).size === values.length;
}

function isMilestones(value: unknown) {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        hasNonBlankStringFields(item, ["name", "owner", "dueDate", "status", "deliverables"]) &&
        typeof item.progress === "number" &&
        Number.isFinite(item.progress) &&
        item.progress >= 0 &&
        item.progress <= 100 &&
        isOneOf(item.status, ["Completed", "On track", "At risk"]),
    )
  );
}

function isNonBlankStringRecordArray(value: unknown, fields: string[]) {
  return Array.isArray(value) && value.every((item) => hasNonBlankStringFields(item, fields));
}

function isWorkItems(value: unknown) {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        hasNonBlankStringFields(item, ["id", "title", "owner", "dueDate", "priority", "status"]) &&
        isOneOf(item.priority, ["High", "Medium", "Low"]) &&
        isOneOf(item.status, ["To do", "In progress", "Blocked", "Done"]),
    ) &&
    hasUniqueStringField(value, "id")
  );
}

export function wouldCreateDependencyCycle(
  dependencies: ProjectCommandCenterData["dependencies"],
  predecessorId: string,
  successorId: string,
) {
  const successorsByPredecessor = new Map<string, string[]>();
  for (const dependency of dependencies) {
    const successors = successorsByPredecessor.get(dependency.predecessorId) ?? [];
    successors.push(dependency.successorId);
    successorsByPredecessor.set(dependency.predecessorId, successors);
  }

  const pending = [successorId];
  const visited = new Set<string>();
  while (pending.length > 0) {
    const current = pending.pop();
    if (!current || visited.has(current)) continue;
    if (current === predecessorId) return true;
    visited.add(current);
    pending.push(...(successorsByPredecessor.get(current) ?? []));
  }
  return false;
}

function hasDependencyCycle(dependencies: ProjectCommandCenterData["dependencies"]) {
  return dependencies.some((dependency, index) =>
    wouldCreateDependencyCycle(
      dependencies.slice(0, index),
      dependency.predecessorId,
      dependency.successorId,
    ),
  );
}

function isDependencies(value: unknown, workItems: ProjectCommandCenterData["workItems"]) {
  if (!Array.isArray(value) || !hasUniqueStringField(value, "id")) return false;
  const acceptedWorkItemIds = new Set(workItems.map((item) => item.id));
  const fieldsAreValid = value.every(
    (item) =>
      hasNonBlankStringFields(item, ["id", "predecessorId", "successorId", "type"]) &&
      isOneOf(item.type, ["Finish-to-start", "Start-to-start", "Finish-to-finish"]) &&
      item.predecessorId !== item.successorId &&
      acceptedWorkItemIds.has(item.predecessorId) &&
      acceptedWorkItemIds.has(item.successorId),
  );

  return fieldsAreValid && !hasDependencyCycle(value as ProjectCommandCenterData["dependencies"]);
}

function isRisks(value: unknown) {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        hasNonBlankStringFields(item, [
          "title",
          "type",
          "owner",
          "severity",
          "response",
          "reviewDate",
        ]) &&
        isOneOf(item.type, ["Risk", "Issue"]) &&
        isOneOf(item.severity, ["High", "Medium", "Low"]),
    )
  );
}

function isStatusUpdates(value: unknown) {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        hasNonBlankStringFields(item, ["period", "health", "summary", "author"]) &&
        isOneOf(item.health, ["Green", "Amber", "Red"]) &&
        Array.isArray(item.highlights) &&
        item.highlights.length > 0 &&
        item.highlights.every(
          (entry: unknown) => typeof entry === "string" && entry.trim().length > 0,
        ) &&
        Array.isArray(item.nextSteps) &&
        item.nextSteps.length > 0 &&
        item.nextSteps.every(
          (entry: unknown) => typeof entry === "string" && entry.trim().length > 0,
        ),
    )
  );
}

export function loadProjectOperations(projectId: number): ProjectCommandCenterData {
  const memoryEntry = projectOperationsMemory.get(projectId);
  if (memoryEntry) return memoryEntry.data;

  const fallback = cloneProjectData(projectId);
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(storageKey(projectId));
    if (!raw) return fallback;

    const persisted = JSON.parse(raw) as Partial<PersistedProjectOperations>;
    if (persisted.version !== STORAGE_VERSION || !persisted.data) return fallback;

    const candidate = persisted.data;
    const workItems = isWorkItems(candidate.workItems) ? candidate.workItems : fallback.workItems;
    return {
      ...fallback,
      milestones: isMilestones(candidate.milestones) ? candidate.milestones : fallback.milestones,
      workItems,
      dependencies: isDependencies(candidate.dependencies, workItems)
        ? candidate.dependencies
        : fallback.dependencies,
      risks: isRisks(candidate.risks) ? candidate.risks : fallback.risks,
      decisions: isNonBlankStringRecordArray(candidate.decisions, [
        "title",
        "decision",
        "owner",
        "date",
        "context",
      ])
        ? candidate.decisions
        : fallback.decisions,
      statusUpdates: isStatusUpdates(candidate.statusUpdates)
        ? candidate.statusUpdates
        : fallback.statusUpdates,
      activityItems: isNonBlankStringRecordArray(candidate.activityItems, [
        "time",
        "actor",
        "action",
        "type",
      ])
        ? candidate.activityItems
        : fallback.activityItems,
    };
  } catch {
    return fallback;
  }
}

function saveProjectOperations(projectId: number, data: ProjectCommandCenterData) {
  projectOperationsMemory.set(projectId, { data, storageUnavailable: false });
  if (typeof window === "undefined") return true;

  const value: PersistedProjectOperations = { version: STORAGE_VERSION, data };
  try {
    window.localStorage.setItem(storageKey(projectId), JSON.stringify(value));
    return true;
  } catch {
    projectOperationsMemory.set(projectId, { data, storageUnavailable: true });
    return false;
  }
}

export function clearProjectOperationsMemoryForTests() {
  projectOperationsMemory.clear();
}

export function useProjectOperationsData(projectId: number) {
  const [data, setData] = useState<ProjectCommandCenterData>(() => loadProjectOperations(projectId));
  const [storageWarning, setStorageWarning] = useState<string | null>(() =>
    projectOperationsMemory.get(projectId)?.storageUnavailable ? STORAGE_WARNING : null,
  );

  useEffect(() => {
    setData(loadProjectOperations(projectId));
    setStorageWarning(
      projectOperationsMemory.get(projectId)?.storageUnavailable ? STORAGE_WARNING : null,
    );
  }, [projectId]);

  const updateData = useCallback(
    (updater: (current: ProjectCommandCenterData) => ProjectCommandCenterData) => {
      setData((current) => {
        const next = updater(current);
        setStorageWarning(saveProjectOperations(projectId, next) ? null : STORAGE_WARNING);
        return next;
      });
    },
    [projectId],
  );

  return { data, updateData, storageWarning };
}
