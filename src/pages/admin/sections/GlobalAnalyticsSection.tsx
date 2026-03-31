import {
  useAdminScanTrend,
  useAdminTopQrCodes,
  useAdminTopUsers,
  useAdminGeoStats,
} from "@/hooks/useAdmin";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Globe, Smartphone, Monitor } from "lucide-react";

export default function GlobalAnalyticsSection() {
  const { data: trend, isLoading: trendLoading } = useAdminScanTrend(14);
  const { data: topQr, isLoading: topQrLoading } = useAdminTopQrCodes(8);
  const { data: topUsers, isLoading: topUsersLoading } = useAdminTopUsers(8);
  const { data: geo, isLoading: geoLoading } = useAdminGeoStats();

  return (
    <div className="space-y-6">
      {/* Scan Trend Chart */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-1">
          Platform Scan Trend
        </h3>
        <p className="text-[11px] text-muted-foreground mb-6">
          Daily scans across all users — last 14 days
        </p>

        <div className="h-[260px]">
          {trendLoading ? (
            <div className="w-full h-full bg-accent rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend || []}>
                <defs>
                  <linearGradient
                    id="scanGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="100%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a", fontSize: 10 }}
                  tickFormatter={(v) =>
                    new Date(v).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })
                  }
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a", fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#1a1a2e",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                  labelFormatter={(v) =>
                    new Date(v).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  }
                />
                <Area
                  type="monotone"
                  dataKey="scans"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#scanGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top QR Codes */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-1">
            Top QR Codes
          </h3>
          <p className="text-[11px] text-muted-foreground mb-4">
            Highest scanned across platform
          </p>

          <div className="space-y-2">
            {topQrLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 bg-accent rounded-lg animate-pulse"
                />
              ))
            ) : (topQr || []).length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">
                No QR codes yet
              </p>
            ) : (
              (topQr || []).map((qr: any, i: number) => (
                <div
                  key={qr.id}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-accent transition-colors"
                >
                  <span className="text-[11px] font-bold text-muted-foreground w-5">
                    #{i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground font-medium truncate">
                      {qr.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      by {qr.owner_name}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-primary">
                    {(qr.scan_count || 0).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Users */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-1">
            Top Users
          </h3>
          <p className="text-[11px] text-muted-foreground mb-4">
            Users generating most scans
          </p>

          <div className="space-y-2">
            {topUsersLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 bg-accent rounded-lg animate-pulse"
                />
              ))
            ) : (topUsers || []).length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">
                No data yet
              </p>
            ) : (
              (topUsers || []).map((u: any, i: number) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-accent transition-colors"
                >
                  <span className="text-[11px] font-bold text-muted-foreground w-5">
                    #{i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground font-medium truncate">
                      {u.full_name}
                    </p>
                    <p className="text-[11px] text-muted-foreground capitalize">
                      {u.plan} plan
                    </p>
                  </div>
                  <span className="text-sm font-bold text-emerald-400">
                    {u.totalScans.toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Geo & Device Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Countries */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" />
            Top Countries
          </h3>
          <p className="text-[11px] text-muted-foreground mb-4">
            Geographic distribution of scans
          </p>

          <div className="space-y-3">
            {geoLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 bg-accent rounded-lg animate-pulse"
                />
              ))
            ) : (
              (geo?.countries || []).map((c: any) => {
                const pct =
                  geo?.totalEvents
                    ? Math.round((c.count / geo.totalEvents) * 100)
                    : 0;
                return (
                  <div key={c.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground">{c.name}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {c.count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-accent rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-primary rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Device Split */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-1">
            Device Split
          </h3>
          <p className="text-[11px] text-muted-foreground mb-6">
            Mobile vs Desktop scan distribution
          </p>

          <div className="flex items-center gap-6 justify-center py-6">
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-3 mx-auto">
                <Smartphone className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {geo?.mobilePct || 0}%
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">Mobile</p>
            </div>
            <div className="w-px h-20 bg-accent" />
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mb-3 mx-auto">
                <Monitor className="w-8 h-8 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {geo?.desktopPct || 0}%
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">Desktop</p>
            </div>
          </div>

          <div className="w-full h-3 bg-accent rounded-full overflow-hidden flex">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${geo?.mobilePct || 0}%` }}
            />
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${geo?.desktopPct || 0}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
