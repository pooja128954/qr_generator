import {
  Users,
  QrCode,
  Scan,
  UserCheck,
  TrendingUp,
  Contact,
} from "lucide-react";
import { useAdminStats } from "@/hooks/useAdmin";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { PLANS } from "@/lib/plans";

const PLAN_COLORS: Record<string, string> = {
  trial: "#f59e0b",
  economic: "#22c55e",
  premium: "#3b82f6",
  elegant: "#a855f7",
};

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: string | number;
  icon: any;
  color: string;
  sub?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 hover:border-border transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <TrendingUp className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
      <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mt-1">
        {label}
      </p>
      {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

export default function OverviewSection() {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-2xl p-5 h-[130px] animate-pulse"
            >
              <div className="w-10 h-10 bg-accent rounded-xl mb-4" />
              <div className="w-20 h-6 bg-accent rounded mb-2" />
              <div className="w-16 h-3 bg-accent rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const estimatedRevenue =
    stats?.planBreakdown.reduce((acc, p) => {
      const planKey = p.plan as keyof typeof PLANS;
      const price = PLANS[planKey]?.price || 0;
      return acc + price * p.count;
    }, 0) || 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          label="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          color="bg-primary/20 text-primary"
        />
        <StatCard
          label="Active (7d)"
          value={stats?.activeUsers7d || 0}
          icon={UserCheck}
          color="bg-emerald-500/15 text-emerald-400"
          sub={`${stats?.totalUsers ? Math.round(((stats?.activeUsers7d || 0) / stats.totalUsers) * 100) : 0}% of total`}
        />
        <StatCard
          label="QR Codes"
          value={(stats?.totalQrCodes || 0).toLocaleString()}
          icon={QrCode}
          color="bg-blue-500/15 text-blue-400"
        />
        <StatCard
          label="Total Scans"
          value={(stats?.totalScans || 0).toLocaleString()}
          icon={Scan}
          color="bg-amber-500/15 text-amber-400"
        />
        <StatCard
          label="Leads Captured"
          value={(stats?.totalLeads || 0).toLocaleString()}
          icon={Contact}
          color="bg-pink-500/15 text-pink-400"
        />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Plan Distribution */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-1">
            Plan Distribution
          </h3>
          <p className="text-[11px] text-muted-foreground mb-4">
            Users by subscription tier
          </p>

          <div className="flex items-center gap-6">
            <div className="w-[160px] h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.planBreakdown || []}
                    dataKey="count"
                    nameKey="plan"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    strokeWidth={0}
                  >
                    {(stats?.planBreakdown || []).map((entry, i) => (
                      <Cell
                        key={i}
                        fill={PLAN_COLORS[entry.plan] || "#6b7280"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#1a1a2e",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      fontSize: "12px",
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 flex-1">
              {(stats?.planBreakdown || []).map((p) => (
                <div key={p.plan} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        background: PLAN_COLORS[p.plan] || "#6b7280",
                      }}
                    />
                    <span className="text-sm text-foreground capitalize">
                      {p.plan}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {p.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-1">
            Business Snapshot
          </h3>
          <p className="text-[11px] text-muted-foreground mb-4">
            Key metrics at a glance
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-sm text-muted-foreground">Trial Users</span>
              <span className="text-sm font-bold text-amber-400">
                {stats?.trialUsers || 0}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-sm text-muted-foreground">Expired Trials</span>
              <span className="text-sm font-bold text-red-400">
                {stats?.expiredTrials || 0}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-sm text-muted-foreground">
                Avg QR / User
              </span>
              <span className="text-sm font-bold text-blue-400">
                {stats?.totalUsers
                  ? (
                      (stats.totalQrCodes || 0) / stats.totalUsers
                    ).toFixed(1)
                  : "0"}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-muted-foreground">
                Est. Monthly Revenue
              </span>
              <span className="text-sm font-bold text-emerald-400">
                ₹{estimatedRevenue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
