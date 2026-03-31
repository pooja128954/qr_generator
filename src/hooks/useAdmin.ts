import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import type { PlanType } from "@/lib/database.types";

// ─── Admin Check ─────────────────────────────────────────────
export function useAdminCheck() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["admin_check", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      if (error) return false;
      return (data as any)?.is_admin === true;
    },
  });
}

// ─── Overview Stats ──────────────────────────────────────────
export interface AdminStats {
  totalUsers: number;
  activeUsers7d: number;
  totalQrCodes: number;
  totalScans: number;
  totalLeads: number;
  planBreakdown: { plan: string; count: number }[];
  trialUsers: number;
  expiredTrials: number;
}

export function useAdminStats() {
  const { user } = useAuth();

  return useQuery<AdminStats>({
    queryKey: ["admin_stats"],
    enabled: !!user,
    staleTime: 30_000,
    queryFn: async () => {
      // Fetch all profiles
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("id, plan, trial_end_date, created_at");
      if (pErr) throw pErr;

      const allProfiles = (profiles as any[]) || [];
      const totalUsers = allProfiles.length;

      // Active users: created or have scans in last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const activeUsers7d = allProfiles.filter(
        (p) => new Date(p.created_at) >= sevenDaysAgo
      ).length;

      // Plan breakdown
      const planMap: Record<string, number> = {};
      let trialUsers = 0;
      let expiredTrials = 0;
      allProfiles.forEach((p) => {
        const plan = p.plan || "economic";
        planMap[plan] = (planMap[plan] || 0) + 1;
        if (plan === "trial") {
          trialUsers++;
          if (p.trial_end_date && new Date(p.trial_end_date) < new Date()) {
            expiredTrials++;
          }
        }
      });
      const planBreakdown = Object.entries(planMap).map(([plan, count]) => ({
        plan,
        count,
      }));

      // Total QR codes
      const { count: totalQrCodes } = await supabase
        .from("qr_codes")
        .select("id", { count: "exact", head: true });

      // Total scans from scan_events
      const { count: totalScans } = await supabase
        .from("scan_events")
        .select("id", { count: "exact", head: true });

      // Total leads
      let totalLeads = 0;
      try {
        const { count } = await (supabase as any)
          .from("lead_captures")
          .select("id", { count: "exact", head: true });
        totalLeads = count || 0;
      } catch {
        totalLeads = 0;
      }

      return {
        totalUsers,
        activeUsers7d,
        totalQrCodes: totalQrCodes || 0,
        totalScans: totalScans || 0,
        totalLeads,
        planBreakdown,
        trialUsers,
        expiredTrials,
      };
    },
  });
}

// ─── All Users ───────────────────────────────────────────────
export interface AdminUser {
  id: string;
  full_name: string | null;
  plan: PlanType;
  trial_end_date: string | null;
  trial_start_date: string | null;
  created_at: string;
  is_admin: boolean;
  disabled: boolean;
  monthly_scan_count: number;
  email?: string;
  qr_count?: number;
}

export function useAdminUsers(search?: string, planFilter?: string) {
  const { user } = useAuth();

  return useQuery<AdminUser[]>({
    queryKey: ["admin_users", search, planFilter],
    enabled: !!user,
    staleTime: 15_000,
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (planFilter && planFilter !== "all") {
        query = query.eq("plan", planFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      let users = (data as any[]) || [];

      // Get emails from auth metadata via user object
      // We'll fetch QR counts for each user
      const userIds = users.map((u) => u.id);

      // Get QR count per user
      const { data: qrCodes } = await supabase
        .from("qr_codes")
        .select("user_id")
        .in("user_id", userIds);

      const qrCountMap: Record<string, number> = {};
      (qrCodes as any[] || []).forEach((qr) => {
        qrCountMap[qr.user_id] = (qrCountMap[qr.user_id] || 0) + 1;
      });

      users = users.map((u) => ({
        ...u,
        qr_count: qrCountMap[u.id] || 0,
      }));

      // Client-side search filter
      if (search) {
        const s = search.toLowerCase();
        users = users.filter(
          (u) =>
            (u.full_name || "").toLowerCase().includes(s) ||
            (u.id || "").toLowerCase().includes(s)
        );
      }

      return users as AdminUser[];
    },
  });
}

// ─── Update User Plan ────────────────────────────────────────
export function useUpdateUserPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      plan,
    }: {
      userId: string;
      plan: PlanType;
    }) => {
      const updateData: any = { plan };

      // If changing to trial, set trial dates
      if (plan === "trial") {
        const now = new Date();
        const end = new Date(now);
        end.setDate(end.getDate() + 3);
        updateData.trial_start_date = now.toISOString();
        updateData.trial_end_date = end.toISOString();
      }

      const { error } = await (supabase as any)
        .from("profiles")
        .update(updateData)
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
      queryClient.invalidateQueries({ queryKey: ["admin_stats"] });
    },
  });
}

// ─── Toggle User Disabled ────────────────────────────────────
export function useToggleUserDisabled() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      disabled,
    }: {
      userId: string;
      disabled: boolean;
    }) => {
      const { error } = await (supabase as any)
        .from("profiles")
        .update({ disabled })
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
    },
  });
}

// ─── All QR Codes (Platform-wide) ───────────────────────────
export interface AdminQrCode {
  id: string;
  user_id: string;
  name: string;
  type: string;
  content: string;
  status: "active" | "paused";
  scan_count: number;
  created_at: string;
  owner_name?: string;
}

export function useAdminQrCodes(search?: string, filter?: string) {
  const { user } = useAuth();

  return useQuery<AdminQrCode[]>({
    queryKey: ["admin_qr_codes", search, filter],
    enabled: !!user,
    staleTime: 15_000,
    queryFn: async () => {
      let query = supabase
        .from("qr_codes")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter === "active") query = query.eq("status", "active");
      if (filter === "paused") query = query.eq("status", "paused");
      if (filter === "dead") query = query.eq("scan_count", 0);
      if (filter === "high") query = query.gte("scan_count", 10);

      const { data, error } = await query;
      if (error) throw error;

      let codes = (data as any[]) || [];

      // Get owner names
      const userIds = [...new Set(codes.map((c) => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      const nameMap: Record<string, string> = {};
      (profiles as any[] || []).forEach((p) => {
        nameMap[p.id] = p.full_name || "Unknown";
      });

      codes = codes.map((c) => ({
        ...c,
        owner_name: nameMap[c.user_id] || "Unknown",
      }));

      if (search) {
        const s = search.toLowerCase();
        codes = codes.filter(
          (c) =>
            c.name.toLowerCase().includes(s) ||
            (c.owner_name || "").toLowerCase().includes(s) ||
            c.content.toLowerCase().includes(s)
        );
      }

      return codes as AdminQrCode[];
    },
  });
}

// ─── Delete QR Code (Admin) ─────────────────────────────────
export function useAdminDeleteQr() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (qrId: string) => {
      const { error } = await supabase
        .from("qr_codes")
        .delete()
        .eq("id", qrId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_qr_codes"] });
      queryClient.invalidateQueries({ queryKey: ["admin_stats"] });
    },
  });
}

// ─── Global Scan Analytics ──────────────────────────────────
export interface DailyScanData {
  date: string;
  scans: number;
}

export function useAdminScanTrend(days = 14) {
  const { user } = useAuth();

  return useQuery<DailyScanData[]>({
    queryKey: ["admin_scan_trend", days],
    enabled: !!user,
    staleTime: 60_000,
    queryFn: async () => {
      const since = new Date();
      since.setDate(since.getDate() - days);

      const { data, error } = await supabase
        .from("scan_events")
        .select("scanned_at")
        .gte("scanned_at", since.toISOString())
        .order("scanned_at", { ascending: true });

      if (error) throw error;

      const dayMap: Record<string, number> = {};
      for (let i = 0; i < days; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (days - 1 - i));
        const key = d.toISOString().split("T")[0];
        dayMap[key] = 0;
      }

      ((data as any[]) || []).forEach((ev) => {
        const key = new Date(ev.scanned_at).toISOString().split("T")[0];
        if (dayMap[key] !== undefined) dayMap[key]++;
      });

      return Object.entries(dayMap).map(([date, scans]) => ({ date, scans }));
    },
  });
}

// ─── Top Performing QR Codes ─────────────────────────────────
export function useAdminTopQrCodes(limit = 10) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["admin_top_qr", limit],
    enabled: !!user,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("qr_codes")
        .select("id, name, scan_count, user_id")
        .order("scan_count", { ascending: false })
        .limit(limit);

      if (error) throw error;

      const userIds = [...new Set((data as any[]).map((d) => d.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      const nameMap: Record<string, string> = {};
      (profiles as any[] || []).forEach((p) => {
        nameMap[p.id] = p.full_name || "Unknown";
      });

      return (data as any[]).map((qr) => ({
        ...qr,
        owner_name: nameMap[qr.user_id] || "Unknown",
      }));
    },
  });
}

// ─── Top Users by Scans ─────────────────────────────────────
export function useAdminTopUsers(limit = 10) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["admin_top_users", limit],
    enabled: !!user,
    staleTime: 30_000,
    queryFn: async () => {
      const { data: qrCodes, error } = await supabase
        .from("qr_codes")
        .select("user_id, scan_count");
      if (error) throw error;

      const userScans: Record<string, number> = {};
      ((qrCodes as any[]) || []).forEach((qr) => {
        userScans[qr.user_id] =
          (userScans[qr.user_id] || 0) + (qr.scan_count || 0);
      });

      const sorted = Object.entries(userScans)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit);

      const userIds = sorted.map(([id]) => id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, plan")
        .in("id", userIds);

      const profileMap: Record<string, any> = {};
      (profiles as any[] || []).forEach((p) => {
        profileMap[p.id] = p;
      });

      return sorted.map(([id, totalScans]) => ({
        id,
        full_name: profileMap[id]?.full_name || "Unknown",
        plan: profileMap[id]?.plan || "economic",
        totalScans,
      }));
    },
  });
}

// ─── Activity Logs ──────────────────────────────────────────
export interface ActivityLog {
  id: string;
  event_type: string;
  user_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export function useAdminLogs(eventFilter?: string, limit = 50) {
  const { user } = useAuth();

  return useQuery<ActivityLog[]>({
    queryKey: ["admin_logs", eventFilter, limit],
    enabled: !!user,
    staleTime: 10_000,
    refetchInterval: 30_000,
    queryFn: async () => {
      let query = (supabase as any)
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (eventFilter && eventFilter !== "all") {
        query = query.eq("event_type", eventFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as ActivityLog[];
    },
  });
}

// ─── All Leads ──────────────────────────────────────────────
export interface AdminLead {
  id: string;
  qr_code_id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  country: string | null;
  device_type: string | null;
  created_at: string;
  qr_name?: string;
  owner_name?: string;
}

export function useAdminLeads(search?: string, qrFilter?: string) {
  const { user } = useAuth();

  return useQuery<AdminLead[]>({
    queryKey: ["admin_leads", search, qrFilter],
    enabled: !!user,
    staleTime: 15_000,
    queryFn: async () => {
      let query = (supabase as any)
        .from("lead_captures")
        .select(
          `*, qr_codes!inner(name, user_id)`
        )
        .order("created_at", { ascending: false })
        .limit(200);

      if (qrFilter) {
        query = query.eq("qr_code_id", qrFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      let leads = (data || []).map((l: any) => ({
        id: l.id,
        qr_code_id: l.qr_code_id,
        name: l.name,
        email: l.email,
        phone: l.phone,
        city: l.city,
        country: l.country,
        device_type: l.device_type,
        created_at: l.created_at,
        qr_name: l.qr_codes?.name || "Unknown",
        owner_id: l.qr_codes?.user_id,
      }));

      // Get owner names
      const ownerIds = [...new Set(leads.map((l: any) => l.owner_id).filter(Boolean))];
      if (ownerIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", ownerIds as string[]);

        const nameMap: Record<string, string> = {};
        (profiles as any[] || []).forEach((p) => {
          nameMap[p.id] = p.full_name || "Unknown";
        });

        leads = leads.map((l: any) => ({
          ...l,
          owner_name: nameMap[l.owner_id] || "Unknown",
        }));
      }

      if (search) {
        const s = search.toLowerCase();
        leads = leads.filter(
          (l: any) =>
            l.name.toLowerCase().includes(s) ||
            l.email.toLowerCase().includes(s) ||
            (l.phone || "").toLowerCase().includes(s) ||
            (l.qr_name || "").toLowerCase().includes(s)
        );
      }

      return leads as AdminLead[];
    },
  });
}

// ─── Global Geo Stats ───────────────────────────────────────
export function useAdminGeoStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["admin_geo_stats"],
    enabled: !!user,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scan_events")
        .select("country, device_type");
      if (error) throw error;

      const events = (data as any[]) || [];

      // Country breakdown
      const countryMap: Record<string, number> = {};
      let mobile = 0;
      let desktop = 0;

      events.forEach((e) => {
        const c = e.country || "Unknown";
        countryMap[c] = (countryMap[c] || 0) + 1;
        if (e.device_type === "mobile") mobile++;
        else desktop++;
      });

      const countries = Object.entries(countryMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const total = events.length || 1;

      return {
        countries,
        mobilePct: Math.round((mobile / total) * 100),
        desktopPct: Math.round((desktop / total) * 100),
        totalEvents: events.length,
      };
    },
  });
}
