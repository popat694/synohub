export type ProjectStatus = "Planning" | "In Progress" | "Completed";

export type Attachment = {
  name: string;
  size: number;
  type: string;
};

export type Project = {
  id: number;
  projectNumber: string;
  name: string;
  owner: string;
  manager: string;
  members: string;
  startDate: string;
  additionalInformation: string;
  repoUrl: string;
  attachments: Attachment[];
  status: ProjectStatus;
  deadline: string;
  stack: string;
  budget: string;
};

export const initialProjects: Project[] = [
  {
    id: 1,
    projectNumber: "P-1162",
    name: "SynoHub Dashboard",
    owner: "Parth Popat",
    manager: "Kishan Bhatt",
    members: "Parth, Kishan, Aakash",
    startDate: "2026-07-18",
    additionalInformation: "Core admin dashboard with monitoring and workflow improvements.",
    repoUrl: "https://github.com/syno-hub/dashboard",
    attachments: [
      { name: "project-logo.svg", size: 8421, type: "image/svg+xml" },
      { name: "dashboard-spec.pdf", size: 214321, type: "application/pdf" },
    ],
    status: "In Progress",
    deadline: "2026-08-20",
    stack: "React, Tailwind, Vite",
    budget: "$24k",
  },
  {
    id: 2,
    projectNumber: "P-1124",
    name: "Server Monitoring",
    owner: "DevOps Team",
    manager: "Aakash",
    members: "DevOps, QA, Infra",
    startDate: "2026-07-22",
    additionalInformation: "Alerts, uptime tracking, and operational reporting.",
    repoUrl: "https://gitlab.com/syno-hub/server-monitoring",
    attachments: [
      {
        name: "ops-notes.docx",
        size: 56120,
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      },
    ],
    status: "Planning",
    deadline: "2026-09-01",
    stack: "React, API, Alerts",
    budget: "$18k",
  },
  {
    id: 3,
    projectNumber: "P-0912",
    name: "Client Portal",
    owner: "Aakash",
    manager: "Parth Popat",
    members: "Aakash, Parth, Sneh",
    startDate: "2026-06-27",
    additionalInformation: "Customer-facing portal with onboarding documents and support workflows.",
    repoUrl: "https://bitbucket.org/syno-hub/client-portal",
    attachments: [
      { name: "portal-wireframes.fig", size: 980120, type: "application/octet-stream" },
    ],
    status: "Completed",
    deadline: "2026-07-10",
    stack: "React, Node, PostgreSQL",
    budget: "$31k",
  },
];

export function formatAttachmentSize(size: number) {
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  if (size >= 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${size} B`;
}
