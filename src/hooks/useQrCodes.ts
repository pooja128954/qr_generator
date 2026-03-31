import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { usePlan } from "@/hooks/usePlan";
import { toast } from "sonner";
import type { Database } from "@/lib/database.types";

export type QrCode = Database["public"]["Tables"]["qr_codes"]["Row"];
export type QrCodeInsert = Omit<
  Database["public"]["Tables"]["qr_codes"]["Insert"],
  "user_id"
>;

export function useQrCodes() {
  const { user } = useAuth();
  const { limits } = usePlan();
  const queryClient = useQueryClient();

  const { data: codes = [], isLoading } = useQuery({
    queryKey: ["qr_codes", user?.id, limits.analytics],
    enabled: !!user,
    staleTime: 0,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      if (!user) return [];

      // Get QR codes
      const { data: qrCodes, error: qrError } = await (supabase as any)
        .from("qr_codes")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (qrError) throw qrError;

      const ids = (qrCodes as any[] | null)?.map((qr) => qr.id) ?? [];
      let hitsByQrId: Record<string, number> = {};

      if (ids.length > 0) {
        let scansQuery = (supabase as any)
          .from("scan_events")
          .select("qr_code_id")
          .in("qr_code_id", ids);

        if (limits.analytics === "basic") {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          scansQuery = scansQuery.gte("scanned_at", sevenDaysAgo.toISOString());
        }

        const { data: events, error: eventsError } = await scansQuery as unknown as {
          data: { qr_code_id: string | null }[] | null;
          error: any;
        };

        if (eventsError) {
          console.error("[MyCodes] Scan events fetch error:", eventsError);
        } else {
          hitsByQrId = (events ?? []).reduce((acc, ev) => {
            if (!ev.qr_code_id) return acc;
            acc[ev.qr_code_id] = (acc[ev.qr_code_id] ?? 0) + 1;
            return acc;
          }, {} as Record<string, number>);
        }
      }

      // Keep My Codes aligned with Analytics hit counting logic.
      return (qrCodes as any[]).map(qr => ({
        ...qr,
        scan_count: Number(hitsByQrId[qr.id] ?? qr.scan_count ?? 0)
      })) as QrCode[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: QrCodeInsert) => {
      if (!user) throw new Error("Not logged in");
      const { error } = await (supabase as any)
        .from("qr_codes")
        .insert({ ...payload, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qr_codes", user?.id] });
      toast.success("Your QRs are saved in My QR codes!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<QrCodeInsert> }) => {
      const { error } = await (supabase as any).from("qr_codes").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qr_codes", user?.id] });
      toast.success("QR code updated!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("qr_codes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qr_codes", user?.id] });
      toast.success("QR code deleted.");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "active" | "paused";
    }) => {
      const { error } = await (supabase as any)
        .from("qr_codes")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qr_codes", user?.id] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const createQrCode = useCallback(
    async (payload: QrCodeInsert) => {
      return await createMutation.mutateAsync(payload);
    },
    [createMutation]
  );

  const deleteQrCode = useCallback(
    async (id: string) => {
      return await deleteMutation.mutateAsync(id);
    },
    [deleteMutation]
  );

  const updateQrCodeStatus = useCallback(
    async (id: string, status: "active" | "paused") => {
      return await updateStatusMutation.mutateAsync({ id, status });
    },
    [updateStatusMutation]
  );

  const updateQrCode = useCallback(
    async (id: string, payload: Partial<QrCodeInsert>) => {
      return await updateMutation.mutateAsync({ id, payload });
    },
    [updateMutation]
  );

  return {
    codes,
    isLoading,
    createQrCode,
    isCreating: createMutation.isPending,
    deleteQrCode,
    isDeleting: deleteMutation.isPending,
    updateQrCodeStatus,
    updateQrCode,
  };
}
