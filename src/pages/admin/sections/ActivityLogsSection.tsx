import { useState } from "react";
import { useAdminLogs, type ActivityLog } from "@/hooks/useAdmin";
import {
  UserPlus,
  QrCode,
  ArrowUpDown,
  RefreshCw,
} from "lucide-react";

const EVENT_CONFIG: Record<
  string,
  { icon: any; color: string; bg: string; label: string }
> = {
  user_registered: {
    icon: UserPlus,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    label: "New User",
  },
  qr_created: {
    icon: QrCode,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    label: "QR Created",
  },
  plan_changed: {
    icon: ArrowUpDown,
    color: "text-primary",
    bg: "bg-primary/20",
    label: "Plan Changed",
  },
};

function formatEventDescription(log: ActivityLog): string {
  const meta = log.metadata || {};
  switch (log.event_type) {
    case "user_registered":
      return `${meta.name || "New user"} registered with ${meta.plan || "trial"} plan`;
    case "qr_created":
      return `QR "${meta.name || "Unnamed"}" created (${meta.type || "url"})`;
    case "plan_changed":
      return `Plan changed from ${meta.old_plan || "?"} → ${meta.new_plan || "?"}`;
    default:
      return log.event_type;
  }
}

function timeAgo(date: string): string {
  const now = new Date().getTime();
  const then = new Date(date).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export default function ActivityLogsSection() {
  const [eventFilter, setEventFilter] = useState("all");
  const { data: logs, isLoading, refetch } = useAdminLogs(eventFilter, 100);

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <select
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
          className="bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer min-w-[180px]"
        >
          <option value="all">All Events</option>
          <option value="user_registered">New Registrations</option>
          <option value="qr_created">QR Creations</option>
          <option value="plan_changed">Plan Changes</option>
        </select>

        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground hover:border-border transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Activity Feed */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 animate-pulse"
              >
                <div className="w-9 h-9 bg-accent rounded-xl shrink-0" />
                <div className="flex-1">
                  <div className="w-48 h-4 bg-accent rounded mb-1.5" />
                  <div className="w-24 h-3 bg-accent rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (logs || []).length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-sm">
              No activity logs yet. Events will appear here as users interact
              with the platform.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {(logs || []).map((log) => {
              const config = EVENT_CONFIG[log.event_type] || {
                icon: RefreshCw,
                color: "text-muted-foreground",
                bg: "bg-zinc-500/10",
                label: log.event_type,
              };
              const Icon = config.icon;

              return (
                <div
                  key={log.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-accent transition-colors"
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${config.bg}`}
                  >
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      {formatEventDescription(log)}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${config.color}`}
                      >
                        {config.label}
                      </span>
                      {log.user_id && (
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {log.user_id.slice(0, 8)}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    {timeAgo(log.created_at)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
