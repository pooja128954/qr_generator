import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  QrCode,
  ScrollText,
  Contact,
  Settings,
  DollarSign,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  MessageSquare,
} from "lucide-react";

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "users", label: "Users", icon: Users },
  { id: "subscriptions", label: "Subscriptions", icon: CreditCard },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "qr-codes", label: "QR Codes", icon: QrCode },
  { id: "logs", label: "Activity Logs", icon: ScrollText },
  { id: "leads", label: "Lead Data", icon: Contact },
  { id: "chat-requests", label: "Chat Requests", icon: MessageSquare },
  { id: "controls", label: "Controls", icon: Settings },
  { id: "revenue", label: "Revenue", icon: DollarSign },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function AdminLayout({
  children,
  activeSection,
  onSectionChange,
}: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/dteqraadmin");
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? "w-[72px]" : "w-[260px]"
        } border-r border-border flex flex-col transition-all duration-300 ease-out shrink-0 bg-card`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-border shrink-0">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <Shield className="w-5 h-5 text-foreground" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="font-bold text-sm tracking-tight text-foreground">
                ScanovaX
              </span>
              <span className="block text-[10px] text-primary font-semibold tracking-widest uppercase">
                Admin
              </span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                  ${
                    isActive
                      ? "bg-primary/20 text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon
                  className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  }`}
                />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-border p-2 space-y-1">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-red-400 hover:bg-red-500/[0.06] transition-all"
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-3 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-xs">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-6 border-b border-border shrink-0 bg-background/80 backdrop-blur-xl">
          <div>
            <h2 className="text-sm font-semibold text-foreground capitalize">
              {navItems.find((n) => n.id === activeSection)?.label || "Admin"}
            </h2>
            <p className="text-[11px] text-muted-foreground">
              ScanovaX Administration Panel
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-primary/20 text-primary px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
              Admin
            </span>
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
