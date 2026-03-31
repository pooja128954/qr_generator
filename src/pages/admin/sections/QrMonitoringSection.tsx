import { useState } from "react";
import { Search, Trash2, ExternalLink } from "lucide-react";
import { useAdminQrCodes, useAdminDeleteQr } from "@/hooks/useAdmin";
import { toast } from "sonner";

export default function QrMonitoringSection() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const { data: qrCodes, isLoading } = useAdminQrCodes(search, filter);
  const deleteQr = useAdminDeleteQr();

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete QR code "${name}"? This cannot be undone.`)) return;
    try {
      await deleteQr.mutateAsync(id);
      toast.success("QR code deleted");
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
            placeholder="Search QR codes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer min-w-[160px]"
        >
          <option value="all">All QR Codes</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="high">High Traffic (10+)</option>
          <option value="dead">Dead (0 scans)</option>
        </select>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Showing{" "}
        <span className="text-foreground font-bold">
          {qrCodes?.length || 0}
        </span>{" "}
        QR codes
      </p>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-5 py-3.5">
                  QR Code
                </th>
                <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-5 py-3.5">
                  Owner
                </th>
                <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-5 py-3.5">
                  Type
                </th>
                <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-5 py-3.5">
                  Status
                </th>
                <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-5 py-3.5">
                  Scans
                </th>
                <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-5 py-3.5">
                  Created
                </th>
                <th className="text-right text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-5 py-3.5">
                  Actions
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
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="w-20 h-4 bg-accent rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (qrCodes || []).length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center text-muted-foreground text-sm py-12"
                  >
                    No QR codes found
                  </td>
                </tr>
              ) : (
                (qrCodes || []).map((qr) => (
                  <tr
                    key={qr.id}
                    className="border-b border-border hover:bg-accent transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                          {qr.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                          {qr.content.slice(0, 40)}
                          {qr.content.length > 40 ? "..." : ""}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-foreground">
                        {qr.owner_name}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[11px] bg-accent text-muted-foreground px-2 py-1 rounded-md uppercase font-bold tracking-wider">
                        {qr.type}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-sm font-medium ${
                          qr.status === "active"
                            ? "text-emerald-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        {qr.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-sm font-bold ${
                          qr.scan_count > 10
                            ? "text-primary"
                            : qr.scan_count === 0
                            ? "text-muted-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {qr.scan_count.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-muted-foreground">
                        {new Date(qr.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`/r/${qr.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg text-muted-foreground hover:text-blue-400 hover:bg-blue-500/[0.06] transition-all"
                          title="Preview"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(qr.id, qr.name)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/[0.06] transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
