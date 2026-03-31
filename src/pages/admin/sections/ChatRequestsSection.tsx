import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { MessageSquare, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { Database } from "@/lib/database.types";

type ChatRequest = Database["public"]["Tables"]["chat_requests"]["Row"];

export default function ChatRequestsSection() {
  const [requests, setRequests] = useState<ChatRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("chat_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load chat requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    // Subscribe to new requests instantly
    const channel = supabase
      .channel("chat_requests_all")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_requests" },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAccept = async (req: ChatRequest) => {
    const toastId = toast.loading("Accepting request...");
    try {
      const { error } = await (supabase as any)
        .from("chat_requests")
        .update({ status: "accepted" })
        .eq("id", req.id);

      if (error) throw error;
      
      toast.success("Request accepted! Opening WhatsApp...", { id: toastId });
      fetchRequests();
      
      // Open WhatsApp to connect with the user natively
      window.open(`https://wa.me/${req.phone}`, '_blank');
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to accept request.", { id: toastId });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Chat Requests</h2>
          <p className="text-sm text-muted-foreground">
            Manage incoming WhatsApp connection requests from the chatbot.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full">
          <MessageSquare className="w-4 h-4" />
          <span className="text-sm font-semibold">{requests.filter(r => r.status === 'pending').length} Pending</span>
        </div>
      </div>

      <div className="bg-card border border-border flex flex-col rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Date & Time</th>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Phone Number</th>
                <th className="px-6 py-4 font-semibold">Message</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      Loading requests...
                    </div>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    <MessageSquare className="w-8 h-8 opacity-20 mx-auto mb-2" />
                    No chat requests yet.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
                      {format(new Date(req.created_at), "MMM d, h:mm a")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-sm">
                      {req.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium font-mono text-sm text-muted-foreground">
                      {req.phone}
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-[250px] truncate text-muted-foreground text-xs bg-muted/50 px-2 py-1 rounded inline-block">
                        {req.message || "No message"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {req.status === "pending" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 uppercase tracking-wider">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-500/10 text-green-500 uppercase tracking-wider">
                          <CheckCircle className="w-3 h-3" />
                          Accepted
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {req.status === "pending" && (
                        <button
                          onClick={() => handleAccept(req)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all"
                        >
                          Accept & Chat
                        </button>
                      )}
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
