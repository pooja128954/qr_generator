import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import OverviewSection from "./sections/OverviewSection";
import UserManagementSection from "./sections/UserManagementSection";
import SubscriptionSection from "./sections/SubscriptionSection";
import GlobalAnalyticsSection from "./sections/GlobalAnalyticsSection";
import QrMonitoringSection from "./sections/QrMonitoringSection";
import ActivityLogsSection from "./sections/ActivityLogsSection";
import LeadsSection from "./sections/LeadsSection";
import ControlsSection from "./sections/ControlsSection";
import RevenueSection from "./sections/RevenueSection";

const SECTIONS: Record<string, React.ComponentType> = {
  overview: OverviewSection,
  users: UserManagementSection,
  subscriptions: SubscriptionSection,
  analytics: GlobalAnalyticsSection,
  "qr-codes": QrMonitoringSection,
  logs: ActivityLogsSection,
  leads: LeadsSection,
  controls: ControlsSection,
  revenue: RevenueSection,
};

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const ActiveComponent = SECTIONS[activeSection] || OverviewSection;

  return (
    <AdminLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
    >
      <ActiveComponent />
    </AdminLayout>
  );
}
