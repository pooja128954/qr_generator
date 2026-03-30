-- ============================================================
-- ScanovaX — Schema V12: Fix Anonymous Scan Tracking
-- ============================================================
-- ROOT CAUSE: RLS on qr_codes blocks anonymous (unauthenticated)
-- users from SELECTing QR data. When friends scan the QR code,
-- the Redirect page can't fetch the QR row → returns early →
-- increment_scan RPC is NEVER called → analytics stay at 0.
-- ============================================================

-- 1. CRITICAL FIX: Allow anonymous users to READ qr_codes
-- This is necessary for the /r/:qrId redirect page to work.
-- The data exposed (name, type, content/URL) is not sensitive
-- since QR codes are shared publicly by design.

DROP POLICY IF EXISTS "qr_codes: anon select for redirect" ON public.qr_codes;
CREATE POLICY "qr_codes: anon select for redirect" ON public.qr_codes
  FOR SELECT
  TO anon
  USING (status = 'active');

-- 2. Ensure scan_events has all required columns
-- The increment_scan function writes to these columns.
-- If they don't exist, the INSERT inside the function will fail.
ALTER TABLE public.scan_events ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'Unknown';
ALTER TABLE public.scan_events ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Unknown';
ALTER TABLE public.scan_events ADD COLUMN IF NOT EXISTS ip_address TEXT DEFAULT 'Unknown';
ALTER TABLE public.scan_events ADD COLUMN IF NOT EXISTS user_identifier TEXT DEFAULT 'Anonymous';
ALTER TABLE public.scan_events ADD COLUMN IF NOT EXISTS scanner_email TEXT;

-- 3. Ensure profiles has monthly_scan_count
-- The increment_scan function updates this column.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS monthly_scan_count INTEGER DEFAULT 0;

-- 4. Ensure qr_codes has lead_capture_enabled and logo_url
ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS lead_capture_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 5. Ensure lead_captures table exists
CREATE TABLE IF NOT EXISTS public.lead_captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  city TEXT DEFAULT 'Unknown',
  country TEXT DEFAULT 'Unknown',
  device_type TEXT DEFAULT 'desktop',
  ip_address TEXT DEFAULT 'Unknown',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_captures ENABLE ROW LEVEL SECURITY;

-- Lead captures: owner of the QR code can read
DROP POLICY IF EXISTS "lead_captures: select by qr owner" ON public.lead_captures;
CREATE POLICY "lead_captures: select by qr owner" ON public.lead_captures
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.qr_codes
      WHERE qr_codes.id = lead_captures.qr_code_id
      AND qr_codes.user_id = auth.uid()
    )
  );

-- Lead captures: anyone can insert (anonymous scanners fill the form)
DROP POLICY IF EXISTS "lead_captures: anon insert" ON public.lead_captures;
CREATE POLICY "lead_captures: anon insert" ON public.lead_captures
  FOR INSERT WITH CHECK (true);

-- 6. Drop ALL existing versions of increment_scan (different signatures from prior migrations)
DROP FUNCTION IF EXISTS public.increment_scan(uuid, text, text, text, text, text);
DROP FUNCTION IF EXISTS public.increment_scan(uuid, text, text, text, text, text, text);
DROP FUNCTION IF EXISTS public.increment_scan(uuid, text, text, text, text, text, text, text);

-- Recreate the DEFINITIVE increment_scan function
-- SECURITY DEFINER bypasses RLS so it can always update qr_codes and insert scan_events
CREATE OR REPLACE FUNCTION public.increment_scan(
  target_qr_id uuid,
  scanner_email text DEFAULT NULL,
  device_type text DEFAULT 'desktop',
  country text DEFAULT 'Unknown',
  state text DEFAULT 'Unknown',
  city text DEFAULT 'Unknown',
  ip_address text DEFAULT 'Unknown',
  user_identifier text DEFAULT 'Anonymous'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- A. Always increment the master scan counter on the QR code
  UPDATE public.qr_codes
  SET scan_count = COALESCE(scan_count, 0) + 1
  WHERE id = target_qr_id;

  -- B. Always increment the user's monthly scan counter
  UPDATE public.profiles 
  SET monthly_scan_count = COALESCE(monthly_scan_count, 0) + 1 
  WHERE id = (SELECT user_id FROM public.qr_codes WHERE id = target_qr_id);

  -- C. Always log the scan event (no dedup — every scan gets a row)
  INSERT INTO public.scan_events (
    qr_code_id,
    scanner_email,
    device_type,
    country,
    state,
    city,
    ip_address,
    user_identifier,
    scanned_at
  )
  VALUES (
    target_qr_id,
    scanner_email,
    device_type,
    country,
    state,
    city,
    ip_address,
    user_identifier,
    now()
  );
END;
$$;

-- 7. CRITICAL: Grant execute permission to anonymous users
-- Without this, unauthenticated scanners cannot call the RPC.
GRANT EXECUTE ON FUNCTION public.increment_scan TO anon, authenticated;

-- 8. Verify: Ensure the anon insert policy on scan_events exists
DROP POLICY IF EXISTS "scan_events: insert anon" ON public.scan_events;
CREATE POLICY "scan_events: insert anon" ON public.scan_events
  FOR INSERT WITH CHECK (true);

-- Done! After running this, anonymous QR scans will:
-- 1. Successfully fetch the QR code data (anon SELECT policy)
-- 2. Call increment_scan RPC (GRANT EXECUTE to anon)
-- 3. Increment scan_count on qr_codes (SECURITY DEFINER)
-- 4. Insert a row into scan_events (SECURITY DEFINER)
