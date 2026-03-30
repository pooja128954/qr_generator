import { motion } from "framer-motion";
import { User, Mail, Calendar, QrCode, LogOut, KeyRound, Trash2, Activity } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Link, useNavigate } from "react-router-dom";
import { usePlan } from "@/hooks/usePlan";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/context/AuthContext";

const ease = [0.16, 1, 0.3, 1] as const;

import { useQrCodes } from "@/hooks/useQrCodes";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const { plan, effectivePlan, isTrial, trialDaysLeft, isTrialExpired, limits } = usePlan();
  const { data: profile } = useProfile();
  const { user } = useAuth();
  const { codes } = useQrCodes();
  const navigate = useNavigate();

  const createdDate = profile?.created_at ? new Date(profile.created_at) : new Date();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/dashboard/profile`,
      });
      if (error) throw error;
      toast.success("Password reset email sent! Check your inbox.");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
      >
        <h1 className="text-2xl font-semibold mb-1">Profile</h1>
        <p className="text-sm text-muted-foreground mb-8">Manage your account details and current plan.</p>

        {isTrial && !isTrialExpired && (
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="font-medium text-primary mb-0.5">Trial Active – {trialDaysLeft} days left</p>
            </div>
            <Link to="/#pricing" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              Upgrade Plan
            </Link>
          </div>
        )}

        {isTrialExpired && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="font-medium text-destructive mb-0.5">Trial Expired</p>
            </div>
            <Link to="/#pricing" className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              Upgrade Plan
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-6 mb-6">
          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-lg">{profile?.full_name || "User"}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider
                    ${effectivePlan === 'elegant' ? 'bg-purple-100 text-purple-700' :
                      effectivePlan === 'premium' ? 'bg-blue-100 text-blue-700' :
                        isTrial ? 'bg-amber-100 text-amber-700' :
                          'bg-green-100 text-green-700'
                    }`}>
                    {isTrial && !isTrialExpired ? 'Premium Trial' : effectivePlan} Plan
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t border-border">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="label-caps text-muted-foreground mb-0.5">Email</p>
                <p className="text-sm">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="label-caps text-muted-foreground mb-0.5">Member Since</p>
                <p className="text-sm">{createdDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
              </div>
            </div>
          </div>
        </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
              <Activity className="w-5 h-5 text-muted-foreground" /> Usage Stats
            </h2>
            <p className="text-sm text-muted-foreground mb-6">Your plan limits and current usage.</p>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium">QR Codes Created</span>
                  <span className="text-muted-foreground">{codes.length} / {limits.qrLimit === Infinity ? "Unlimited" : limits.qrLimit}</span>
                </div>
                {limits.qrLimit !== Infinity && (
                  <div className="w-full h-2 bg-accent rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (codes.length / limits.qrLimit) * 100)}%` }}
                      className={`h-full rounded-full ${codes.length >= limits.qrLimit ? 'bg-destructive' : 'bg-primary'}`}
                    />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium">Monthly Scans</span>
                  <span className="text-muted-foreground">{(profile?.monthly_scan_count || 0).toLocaleString()} / {limits.scanLimit === Infinity ? "Unlimited" : (limits.scanLimit ?? 0).toLocaleString()}</span>
                </div>
                {limits.scanLimit !== Infinity && (
                  <div className="w-full h-2 bg-accent rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, ((profile?.monthly_scan_count || 0) / limits.scanLimit) * 100)}%` }}
                      className={`h-full rounded-full ${(profile?.monthly_scan_count || 0) >= limits.scanLimit ? 'bg-destructive' : 'bg-primary'}`}
                    />
                  </div>
                )}
              </div>
            </div>

            {effectivePlan === 'economic' && (
              <div className="mt-6 pt-6 border-t border-border">
                <Link to="/#pricing" className="w-full bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex justify-center">
                  Upgrade Plan for More Limits
                </Link>
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-muted-foreground" /> Account Settings
            </h2>
            <p className="text-sm text-muted-foreground mb-6">Manage your security and sessions.</p>

            <div className="space-y-3">
              <button
                onClick={handleResetPassword}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition-colors text-sm font-medium"
              >
                Change Password
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition-colors text-sm font-medium"
              >
                Sign Out <LogOut className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
