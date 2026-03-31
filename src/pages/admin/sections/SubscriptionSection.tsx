import { useAdminStats } from "@/hooks/useAdmin";
import { PLANS } from "@/lib/plans";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const PLAN_COLORS: Record<string, string> = {
  trial: "#f59e0b",
  economic: "#22c55e",
  premium: "#3b82f6",
  elegant: "#a855f7",
};

export default function SubscriptionSection() {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-2xl p-5 h-24 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const chartData = (stats?.planBreakdown || []).map((p) => ({
    name: p.plan.charAt(0).toUpperCase() + p.plan.slice(1),
    users: p.count,
    key: p.plan,
    price: PLANS[p.plan as keyof typeof PLANS]?.price || 0,
  }));

  const paidUsers =
    (stats?.planBreakdown || [])
      .filter((p) => p.plan !== "trial")
      .reduce((acc, p) => acc + p.count, 0) || 0;

  const conversionRate =
    stats?.totalUsers && stats.totalUsers > 0
      ? Math.round((paidUsers / stats.totalUsers) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Plan Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(["trial", "economic", "premium", "elegant"] as const).map((plan) => {
          const count =
            stats?.planBreakdown.find((p) => p.plan === plan)?.count || 0;
          const config = PLANS[plan];
          return (
            <div
              key={plan}
              className="bg-card border border-border rounded-2xl p-5 hover:border-border transition-all"
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: PLAN_COLORS[plan] }}
                />
                <span className="text-sm font-semibold text-foreground capitalize">
                  {plan}
                </span>
              </div>
              <p className="text-3xl font-bold text-foreground">{count}</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {config.price > 0 ? `₹${config.price}/mo` : "Free"}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-1">
            Users by Plan
          </h3>
          <p className="text-[11px] text-muted-foreground mb-6">
            Distribution across subscription tiers
          </p>

          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barCategoryGap="30%">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#1a1a2e",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="users" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={PLAN_COLORS[entry.key] || "#6b7280"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion Metrics */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-1">
            Conversion Metrics
          </h3>
          <p className="text-[11px] text-muted-foreground mb-6">
            Trial to paid conversion analysis
          </p>

          <div className="space-y-5">
            <div className="text-center py-4">
              <p className="text-5xl font-bold bg-primary bg-clip-text text-transparent">
                {conversionRate}%
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Trial → Paid Conversion
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2.5 border-b border-border">
                <span className="text-sm text-muted-foreground">
                  Total Users
                </span>
                <span className="text-sm font-bold text-foreground">
                  {stats?.totalUsers || 0}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-border">
                <span className="text-sm text-muted-foreground">Paid Users</span>
                <span className="text-sm font-bold text-emerald-400">
                  {paidUsers}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-border">
                <span className="text-sm text-muted-foreground">
                  Trial Users
                </span>
                <span className="text-sm font-bold text-amber-400">
                  {stats?.trialUsers || 0}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-sm text-muted-foreground">
                  Expired Trials
                </span>
                <span className="text-sm font-bold text-red-400">
                  {stats?.expiredTrials || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
