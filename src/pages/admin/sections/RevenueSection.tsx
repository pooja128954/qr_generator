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
import { DollarSign, TrendingUp, Percent, IndianRupee } from "lucide-react";

const PLAN_COLORS: Record<string, string> = {
  trial: "#f59e0b",
  economic: "#22c55e",
  premium: "#3b82f6",
  elegant: "#a855f7",
};

export default function RevenueSection() {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-2xl p-5 h-[120px] animate-pulse"
          />
        ))}
      </div>
    );
  }

  // Calculate revenue
  const revenueByPlan = (stats?.planBreakdown || [])
    .filter((p) => p.plan !== "trial")
    .map((p) => {
      const config = PLANS[p.plan as keyof typeof PLANS];
      return {
        plan: p.plan.charAt(0).toUpperCase() + p.plan.slice(1),
        key: p.plan,
        users: p.count,
        revenue: (config?.price || 0) * p.count,
        price: config?.price || 0,
      };
    });

  const totalRevenue = revenueByPlan.reduce((acc, p) => acc + p.revenue, 0);
  const paidUsers = revenueByPlan.reduce((acc, p) => acc + p.users, 0);
  const totalUsers = stats?.totalUsers || 1;
  const conversionRate = Math.round((paidUsers / totalUsers) * 100);
  const avgRevPerUser = paidUsers > 0 ? Math.round(totalRevenue / paidUsers) : 0;

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 hover:border-border transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center mb-3">
            <IndianRupee className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            ₹{totalRevenue.toLocaleString()}
          </p>
          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mt-1">
            Total Monthly Revenue
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 hover:border-border transition-all">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">{paidUsers}</p>
          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mt-1">
            Paying Customers
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 hover:border-border transition-all">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mb-3">
            <Percent className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">{conversionRate}%</p>
          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mt-1">
            Conversion Rate
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 hover:border-border transition-all">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center mb-3">
            <DollarSign className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            ₹{avgRevPerUser.toLocaleString()}
          </p>
          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mt-1">
            Avg Revenue / User
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Plan Chart */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-1">
            Revenue by Plan
          </h3>
          <p className="text-[11px] text-muted-foreground mb-6">
            Monthly revenue contribution per tier
          </p>

          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByPlan} barCategoryGap="30%">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />
                <XAxis
                  dataKey="plan"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a", fontSize: 10 }}
                  tickFormatter={(v) => `₹${v}`}
                />
                <Tooltip
                  contentStyle={{
                    background: "#1a1a2e",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                  itemStyle={{ color: "#fff" }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]}
                />
                <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
                  {revenueByPlan.map((entry, i) => (
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

        {/* Revenue Breakdown Table */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-1">
            Detailed Breakdown
          </h3>
          <p className="text-[11px] text-muted-foreground mb-6">
            Revenue analysis per plan tier
          </p>

          <div className="space-y-1">
            <div className="grid grid-cols-4 gap-4 px-3 py-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Plan
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">
                Price
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">
                Users
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">
                Revenue
              </span>
            </div>

            {revenueByPlan.map((p) => (
              <div
                key={p.key}
                className="grid grid-cols-4 gap-4 px-3 py-3 rounded-xl hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: PLAN_COLORS[p.key] || "#6b7280" }}
                  />
                  <span className="text-sm text-foreground font-medium">
                    {p.plan}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground text-right">
                  ₹{p.price}
                </span>
                <span className="text-sm text-foreground text-right font-medium">
                  {p.users}
                </span>
                <span className="text-sm text-emerald-400 text-right font-bold">
                  ₹{p.revenue.toLocaleString()}
                </span>
              </div>
            ))}

            <div className="border-t border-border mt-2 pt-3">
              <div className="grid grid-cols-4 gap-4 px-3 py-2">
                <span className="text-sm text-foreground font-bold">Total</span>
                <span />
                <span className="text-sm text-foreground text-right font-bold">
                  {paidUsers}
                </span>
                <span className="text-sm text-emerald-400 text-right font-bold">
                  ₹{totalRevenue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Trial row */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between px-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: PLAN_COLORS.trial }}
                />
                <span className="text-sm text-muted-foreground">Trial users</span>
              </div>
              <span className="text-sm text-amber-400 font-medium">
                {stats?.trialUsers || 0} users (₹0)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
