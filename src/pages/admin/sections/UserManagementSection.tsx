import { useState } from "react";
import {
  Search,
  ChevronDown,
  UserX,
  UserCheck,
  Crown,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import {
  useAdminUsers,
  useUpdateUserPlan,
  useToggleUserDisabled,
  type AdminUser,
} from "@/hooks/useAdmin";
import type { PlanType } from "@/lib/database.types";
import { toast } from "sonner";

const PLAN_BADGES: Record<string, { bg: string; text: string }> = {
  trial: { bg: "bg-amber-500/15", text: "text-amber-400" },
  economic: { bg: "bg-emerald-500/15", text: "text-emerald-400" },
  premium: { bg: "bg-blue-500/15", text: "text-blue-400" },
  elegant: { bg: "bg-primary/20", text: "text-primary" },
};

function getUserStatus(user: AdminUser): {
  label: string;
  color: string;
} {
  if (user.disabled) return { label: "Disabled", color: "text-red-400" };
  if (user.plan === "trial") {
    if (
      user.trial_end_date &&
      new Date(user.trial_end_date) < new Date()
    ) {
      return { label: "Trial Expired", color: "text-orange-400" };
    }
    return { label: "Trial Active", color: "text-amber-400" };
  }
  return { label: "Active", color: "text-emerald-400" };
}

export default function UserManagementSection() {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const { data: users, isLoading } = useAdminUsers(search, planFilter);
  const updatePlan = useUpdateUserPlan();
  const toggleDisabled = useToggleUserDisabled();

  const handlePlanChange = async (userId: string, plan: PlanType) => {
    try {
      await updatePlan.mutateAsync({ userId, plan });
      toast.success(`Plan updated to ${plan}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleToggleDisabled = async (
    userId: string,
    currentDisabled: boolean
  ) => {
    try {
      await toggleDisabled.mutateAsync({
        userId,
        disabled: !currentDisabled,
      });
      toast.success(
        currentDisabled ? "User enabled" : "User disabled"
      );
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer min-w-[150px]"
        >
          <option value="all">All Plans</option>
          <option value="trial">Trial</option>
          <option value="economic">Economic</option>
          <option value="premium">Premium</option>
          <option value="elegant">Elegant</option>
        </select>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
        <span>
          Showing{" "}
          <span className="text-foreground font-bold">{users?.length || 0}</span>{" "}
          users
        </span>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-5 py-3.5">
                  User
                </th>
                <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-5 py-3.5">
                  Plan
                </th>
                <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-5 py-3.5">
                  Status
                </th>
                <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-5 py-3.5">
                  QR Codes
                </th>
                <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-5 py-3.5">
                  Scans
                </th>
                <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-5 py-3.5">
                  Joined
                </th>
                <th className="text-right text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-5 py-3.5">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr
                    key={i}
                    className="border-b border-border animate-pulse"
                  >
                    <td className="px-5 py-4">
                      <div className="w-32 h-4 bg-accent rounded" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="w-20 h-5 bg-accent rounded-full" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="w-16 h-4 bg-accent rounded" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="w-8 h-4 bg-accent rounded" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="w-12 h-4 bg-accent rounded" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="w-20 h-4 bg-accent rounded" />
                    </td>
                    <td className="px-5 py-4" />
                  </tr>
                ))
              ) : users?.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center text-muted-foreground text-sm py-12"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                users?.map((user) => {
                  const status = getUserStatus(user);
                  const badge = PLAN_BADGES[user.plan] || PLAN_BADGES.economic;
                  const isExpanded = expandedUser === user.id;

                  return (
                    <tr
                      key={user.id}
                      className="border-b border-border hover:bg-accent transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {user.full_name || "Unnamed"}
                            {user.is_admin && (
                              <Crown className="inline w-3.5 h-3.5 text-amber-400 ml-1.5" />
                            )}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                            {user.id.slice(0, 8)}...
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${badge.bg} ${badge.text}`}
                        >
                          {user.plan}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-sm font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-foreground">
                          {user.qr_count || 0}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-foreground">
                          {(user.monthly_scan_count || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "2-digit",
                            }
                          )}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1 relative">
                          <button
                            onClick={() =>
                              setExpandedUser(isExpanded ? null : user.id)
                            }
                            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {isExpanded && (
                            <div className="absolute right-0 top-10 z-50 bg-popover border border-border rounded-xl shadow-2xl py-2 min-w-[180px]">
                              <p className="px-3 py-1.5 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                                Change Plan
                              </p>
                              {(
                                [
                                  "trial",
                                  "economic",
                                  "premium",
                                  "elegant",
                                ] as PlanType[]
                              ).map((p) => (
                                <button
                                  key={p}
                                  onClick={() => {
                                    handlePlanChange(user.id, p);
                                    setExpandedUser(null);
                                  }}
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors capitalize ${
                                    user.plan === p
                                      ? "text-primary font-medium"
                                      : "text-foreground"
                                  }`}
                                >
                                  {p}
                                  {user.plan === p && " ✓"}
                                </button>
                              ))}
                              <div className="border-t border-border my-1" />
                              <button
                                onClick={() => {
                                  handleToggleDisabled(
                                    user.id,
                                    user.disabled
                                  );
                                  setExpandedUser(null);
                                }}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors flex items-center gap-2 ${
                                  user.disabled
                                    ? "text-emerald-400"
                                    : "text-orange-400"
                                }`}
                              >
                                {user.disabled ? (
                                  <>
                                    <UserCheck className="w-3.5 h-3.5" />
                                    Enable User
                                  </>
                                ) : (
                                  <>
                                    <UserX className="w-3.5 h-3.5" />
                                    Disable User
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
