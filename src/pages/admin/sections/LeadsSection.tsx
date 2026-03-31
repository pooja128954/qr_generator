import { useState } from "react";
import { Search, Download, Mail, Phone, MapPin } from "lucide-react";
import { useAdminLeads } from "@/hooks/useAdmin";
import { toast } from "sonner";

export default function LeadsSection() {
  const [search, setSearch] = useState("");
  const { data: leads, isLoading } = useAdminLeads(search);

  const handleExportCSV = () => {
    if (!leads || leads.length === 0) {
      toast.error("No leads to export");
      return;
    }

    const headers = [
      "Name",
      "Email",
      "Phone",
      "QR Code",
      "Owner",
      "City",
      "Country",
      "Device",
      "Date",
    ];
    const rows = leads.map((l) => [
      l.name,
      l.email,
      l.phone || "",
      l.qr_name || "",
      l.owner_name || "",
      l.city || "",
      l.country || "",
      l.device_type || "",
      new Date(l.created_at).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scanovax-leads-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Leads exported!");
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search leads by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary text-foreground rounded-xl text-sm font-semibold transition-all shadow-lg shadow-primary/20"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Showing{" "}
        <span className="text-foreground font-bold">
          {leads?.length || 0}
        </span>{" "}
        captured leads
      </p>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-5 py-3.5">
                  Lead
                </th>
                <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-5 py-3.5">
                  Contact
                </th>
                <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-5 py-3.5">
                  QR Code
                </th>
                <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-5 py-3.5">
                  Owner
                </th>
                <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-5 py-3.5">
                  Location
                </th>
                <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-5 py-3.5">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr
                    key={i}
                    className="border-b border-border animate-pulse"
                  >
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="w-24 h-4 bg-accent rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (leads || []).length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center text-muted-foreground text-sm py-12"
                  >
                    No leads captured yet
                  </td>
                </tr>
              ) : (
                (leads || []).map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-border hover:bg-accent transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-foreground">
                        {lead.name}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm text-foreground">
                            {lead.email}
                          </span>
                        </div>
                        {lead.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {lead.phone}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-foreground">
                        {lead.qr_name}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-muted-foreground">
                        {lead.owner_name}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {[lead.city, lead.country]
                            .filter(Boolean)
                            .join(", ") || "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-muted-foreground">
                        {new Date(lead.created_at).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
