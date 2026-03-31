import { useState } from "react";
import {
  useAdminUsers,
  useUpdateUserPlan,
  useToggleUserDisabled,
} from "@/hooks/useAdmin";
import {
  UserX,
  UserCheck,
  Shield,
  AlertTriangle,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import type { PlanType } from "@/lib/database.types";

export default function ControlsSection() {
  const [search, setSearch] = useState("");
  const { data: users } = useAdminUsers(search);
  const updatePlan = useUpdateUserPlan();
  const toggleDisabled = useToggleUserDisabled();

  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("economic");

  const handleQuickDisable = async (
    userId: string,
    name: string,
    disabled: boolean
  ) => {
    try {
      await toggleDisabled.mutateAsync({ userId, disabled: !disabled });
      toast.success(
        disabled
          ? `${name} has been enabled`
          : `${name} has been disabled`
      );
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleBulkPlanChange = async () => {
    if (!selectedUser) {
      toast.error("Select a user first");
      return;
    }
    try {
      await updatePlan.mutateAsync({
        userId: selectedUser,
        plan: selectedPlan,
      });
      toast.success("Plan updated successfully");
      setSelectedUser(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      <div className="bg-amber-500/[0.08] border border-amber-500/20 rounded-2xl p-5 flex items-start gap-4">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold text-amber-300">
            Admin Power Tools
          </h3>
          <p className="text-[12px] text-amber-400/70 mt-1">
            These controls directly modify user accounts and data. Use with
            caution — actions may be irreversible.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Plan Change */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Change User Plan
          </h3>
          <p className="text-[11px] text-muted-foreground mb-5">
            Manually upgrade or downgrade a user's subscription
          </p>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search user..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-accent border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            {search && (users || []).length > 0 && (
              <div className="max-h-[200px] overflow-y-auto border border-border rounded-xl">
                {(users || []).slice(0, 10).map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setSelectedUser(u.id);
                      setSearch(u.full_name || u.id.slice(0, 8));
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-accent transition-colors border-b border-border last:border-0 ${
                      selectedUser === u.id
                        ? "bg-primary/20 text-primary"
                        : "text-foreground"
                    }`}
                  >
                    <span className="font-medium">
                      {u.full_name || "Unnamed"}
                    </span>
                    <span className="text-[11px] text-muted-foreground ml-2 capitalize">
                      ({u.plan})
                    </span>
                  </button>
                ))}
              </div>
            )}

            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value as PlanType)}
              className="w-full bg-accent border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            >
              <option value="trial">Trial</option>
              <option value="economic">Economic</option>
              <option value="premium">Premium</option>
              <option value="elegant">Elegant</option>
            </select>

            <button
              onClick={handleBulkPlanChange}
              disabled={!selectedUser || updatePlan.isPending}
              className="w-full bg-primary hover:bg-primary text-foreground py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
            >
              {updatePlan.isPending ? "Updating..." : "Update Plan"}
            </button>
          </div>
        </div>

        {/* Quick Disable/Enable */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
            <UserX className="w-4 h-4 text-orange-400" />
            Enable / Disable Users
          </h3>
          <p className="text-[11px] text-muted-foreground mb-5">
            Quickly toggle user access
          </p>

          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {(users || [])
              .filter((u) => !u.is_admin)
              .slice(0, 20)
              .map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-accent transition-colors border border-border"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-foreground font-medium truncate">
                      {u.full_name || "Unnamed"}
                    </p>
                    <p className="text-[11px] text-muted-foreground capitalize">
                      {u.plan} ·{" "}
                      {u.disabled ? (
                        <span className="text-red-400">Disabled</span>
                      ) : (
                        <span className="text-emerald-400">Active</span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleQuickDisable(
                        u.id,
                        u.full_name || "User",
                        u.disabled
                      )
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                      u.disabled
                        ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                        : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                    }`}
                  >
                    {u.disabled ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        Enable
                      </>
                    ) : (
                      <>
                        <UserX className="w-3.5 h-3.5" />
                        Disable
                      </>
                    )}
                  </button>
                </div>
              ))}

            {(users || []).filter((u) => !u.is_admin).length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-8">
                No non-admin users found
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
