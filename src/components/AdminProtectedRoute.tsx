import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAdminCheck } from "@/hooks/useAdmin";
import { ShieldX, Loader2 } from "lucide-react";

export default function AdminProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useAdminCheck();

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          <p className="text-zinc-500 text-sm font-medium tracking-wider uppercase">
            Verifying access...
          </p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/dteqraadmin" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <ShieldX className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-zinc-400 text-sm mb-8">
            Your account does not have administrator privileges. Contact the
            system administrator for access.
          </p>
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-zinc-800 text-white rounded-xl text-sm font-medium hover:bg-zinc-700 transition-colors"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
