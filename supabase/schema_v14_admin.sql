-- ============================================================
-- ScanovaX — Schema V14: Admin Panel
-- Run this ENTIRE file in the Supabase SQL Editor
-- ============================================================

-- 1. Add admin flag and disabled flag to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS disabled BOOLEAN DEFAULT FALSE;

-- 2. Create activity_logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Admin can read all activity logs
DROP POLICY IF EXISTS "Admins can read activity logs" ON public.activity_logs;
CREATE POLICY "Admins can read activity logs" ON public.activity_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- System can insert activity logs
DROP POLICY IF EXISTS "System can insert activity logs" ON public.activity_logs;
CREATE POLICY "System can insert activity logs" ON public.activity_logs
  FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_event_type ON public.activity_logs(event_type);

-- ============================================================
-- 3. Admin RLS Policies  
-- These ADD to existing policies (OR logic in Postgres RLS)
-- ============================================================

-- Admin can read ALL profiles
DROP POLICY IF EXISTS "admin_read_all_profiles" ON public.profiles;
CREATE POLICY "admin_read_all_profiles" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Admin can UPDATE any profile (change plans, disable users)
DROP POLICY IF EXISTS "admin_update_any_profile" ON public.profiles;
CREATE POLICY "admin_update_any_profile" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Admin can read ALL QR codes
DROP POLICY IF EXISTS "admin_read_all_qr_codes" ON public.qr_codes;
CREATE POLICY "admin_read_all_qr_codes" ON public.qr_codes
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Admin can DELETE any QR code
DROP POLICY IF EXISTS "admin_delete_any_qr_code" ON public.qr_codes;
CREATE POLICY "admin_delete_any_qr_code" ON public.qr_codes
  FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Admin can read ALL scan events
DROP POLICY IF EXISTS "admin_read_all_scan_events" ON public.scan_events;
CREATE POLICY "admin_read_all_scan_events" ON public.scan_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    OR EXISTS (
      SELECT 1 FROM public.qr_codes
      WHERE qr_codes.id = scan_events.qr_code_id
        AND qr_codes.user_id = auth.uid()
    )
  );

-- Admin can read ALL lead captures
DROP POLICY IF EXISTS "admin_read_all_leads" ON public.lead_captures;
CREATE POLICY "admin_read_all_leads" ON public.lead_captures
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    OR EXISTS (
      SELECT 1 FROM public.qr_codes
      WHERE public.qr_codes.id = public.lead_captures.qr_code_id
        AND public.qr_codes.user_id = auth.uid()
    )
  );

-- ============================================================
-- 4. Auto-logging triggers
-- ============================================================

-- Log new user registrations
CREATE OR REPLACE FUNCTION public.log_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.activity_logs (event_type, user_id, metadata)
  VALUES ('user_registered', NEW.id, jsonb_build_object('name', NEW.full_name, 'plan', NEW.plan));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created_log ON public.profiles;
CREATE TRIGGER on_profile_created_log
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_new_user();

-- Log QR code creations
CREATE OR REPLACE FUNCTION public.log_qr_created()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.activity_logs (event_type, user_id, metadata)
  VALUES ('qr_created', NEW.user_id, jsonb_build_object('qr_id', NEW.id, 'name', NEW.name, 'type', NEW.type));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_qr_created_log ON public.qr_codes;
CREATE TRIGGER on_qr_created_log
  AFTER INSERT ON public.qr_codes
  FOR EACH ROW EXECUTE FUNCTION public.log_qr_created();

-- Log plan changes
CREATE OR REPLACE FUNCTION public.log_plan_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF OLD.plan IS DISTINCT FROM NEW.plan THEN
    INSERT INTO public.activity_logs (event_type, user_id, metadata)
    VALUES ('plan_changed', NEW.id, jsonb_build_object('old_plan', OLD.plan, 'new_plan', NEW.plan));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_plan_changed_log ON public.profiles;
CREATE TRIGGER on_plan_changed_log
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_plan_change();

-- ============================================================
-- 5. IMPORTANT: Set yourself as admin
-- Replace YOUR-UUID with your actual user id from
-- Supabase Dashboard → Authentication → Users
-- ============================================================
-- UPDATE public.profiles SET is_admin = true WHERE id = 'YOUR-UUID-HERE';
