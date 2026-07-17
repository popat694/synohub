import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import { ServerRackIcon } from "../icons";

type Server = {
  name: string;
  role: string;
  ip: string;
  location: string;
  status: "Online" | "Offline";
  service: "Apache" | "Nginx";
  serviceStatus: "Running" | "Stopped";
  diskUsed: number;
  diskTotal: number;
};

const servers: Server[] = [
  {
    name: "web-prod-01",
    role: "Public web host",
    ip: "10.12.4.21",
    location: "Mumbai, IN",
    status: "Online",
    service: "Nginx",
    serviceStatus: "Running",
    diskUsed: 68,
    diskTotal: 500,
  },
  {
    name: "api-prod-01",
    role: "API reverse proxy",
    ip: "10.12.4.22",
    location: "Mumbai, IN",
    status: "Online",
    service: "Apache",
    serviceStatus: "Running",
    diskUsed: 74,
    diskTotal: 500,
  },
  {
    name: "app-stg-01",
    role: "Staging application",
    ip: "10.12.8.15",
    location: "Pune, IN",
    status: "Online",
    service: "Nginx",
    serviceStatus: "Running",
    diskUsed: 43,
    diskTotal: 250,
  },
  {
    name: "app-stg-02",
    role: "Staging application",
    ip: "10.12.8.16",
    location: "Pune, IN",
    status: "Offline",
    service: "Apache",
    serviceStatus: "Stopped",
    diskUsed: 51,
    diskTotal: 250,
  },
  {
    name: "worker-01",
    role: "Background worker host",
    ip: "10.12.9.31",
    location: "Chennai, IN",
    status: "Online",
    service: "Nginx",
    serviceStatus: "Running",
    diskUsed: 59,
    diskTotal: 400,
  },
  {
    name: "backup-01",
    role: "Backup node",
    ip: "10.12.10.10",
    location: "Hyderabad, IN",
    status: "Offline",
    service: "Apache",
    serviceStatus: "Stopped",
    diskUsed: 82,
    diskTotal: 1000,
  },
];

const statusStyles = {
  Online:
    "border-success-200 bg-success-50 text-success-700 dark:border-success-800/50 dark:bg-success-500/10 dark:text-success-400",
  Offline:
    "border-error-200 bg-error-50 text-error-700 dark:border-error-800/50 dark:bg-error-500/10 dark:text-error-400",
} as const;

const serviceStyles = {
  Running:
    "border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300",
  Stopped:
    "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300",
} as const;

function formatDiskUsage(used: number, total: number) {
  return `${used} / ${total} GB`;
}

function getUsageBarClass(percent: number) {
  if (percent >= 80) return "bg-error-500";
  if (percent >= 60) return "bg-warning-500";
  return "bg-success-500";
}

export default function Servers() {
  const totalServers = servers.length;
  const onlineServers = servers.filter((server) => server.status === "Online").length;
  const runningServices = servers.filter(
    (server) => server.serviceStatus === "Running",
  ).length;
  const averageDiskUsage = Math.round(
    servers.reduce(
      (sum, server) => sum + (server.diskUsed / server.diskTotal) * 100,
      0,
    ) / totalServers,
  );

  return (
    <>
      <PageMeta
        title="Servers | SynoHub"
        description="Monitor server availability, web server status, IP address, and disk usage in SynoHub."
      />

      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Servers" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total servers", value: totalServers.toString() },
            { label: "Online", value: `${onlineServers}/${totalServers}` },
            { label: "Web services running", value: runningServices.toString() },
            { label: "Avg. disk usage", value: `${averageDiskUsage}%` },
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

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {servers.map((server) => {
            const diskPercent = Math.round((server.diskUsed / server.diskTotal) * 100);

            return (
              <article
                key={server.name}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs transition hover:-translate-y-0.5 hover:shadow-theme-md dark:border-gray-800 dark:bg-white/[0.03]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-400">
                      <ServerRackIcon className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        {server.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {server.role}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[server.status]}`}
                  >
                    {server.status}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50">
                    <p className="text-gray-500 dark:text-gray-400">IP Address</p>
                    <p className="mt-1 font-medium text-gray-800 dark:text-white/90">
                      {server.ip}
                    </p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50">
                    <p className="text-gray-500 dark:text-gray-400">Location</p>
                    <p className="mt-1 font-medium text-gray-800 dark:text-white/90">
                      {server.location}
                    </p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50">
                    <p className="text-gray-500 dark:text-gray-400">Web server</p>
                    <p className="mt-1 font-medium text-gray-800 dark:text-white/90">
                      {server.service}
                    </p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50">
                    <p className="text-gray-500 dark:text-gray-400">Service status</p>
                    <span
                      className={`mt-1 inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${serviceStyles[server.serviceStatus]}`}
                    >
                      {server.serviceStatus}
                    </span>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Disk usage
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {formatDiskUsage(server.diskUsed, server.diskTotal)}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-gray-200 dark:bg-gray-800">
                    <div
                      className={`h-2.5 rounded-full ${getUsageBarClass(diskPercent)}`}
                      style={{ width: `${diskPercent}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{diskPercent}% used</span>
                    <span>
                      {server.diskTotal - server.diskUsed} GB free
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </>
  );
}
