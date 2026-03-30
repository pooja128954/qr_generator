-- ============================================================
-- ScanovaX — Schema V8 Lead Capture & Advanced Analytics
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Add lead_capture_enabled to qr_codes
ALTER TABLE public.qr_codes 
ADD COLUMN IF NOT EXISTS lead_capture_enabled BOOLEAN DEFAULT FALSE;

-- 2. Create the lead_captures table for detailed form data
CREATE TABLE IF NOT EXISTS public.lead_captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id UUID REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  city TEXT DEFAULT 'Unknown',
  country TEXT DEFAULT 'Unknown',
  device_type TEXT DEFAULT 'desktop',
  ip_address TEXT DEFAULT 'Unknown',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Owner of the QR code
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Enable RLS on lead_captures
ALTER TABLE public.lead_captures ENABLE ROW LEVEL SECURITY;

-- 4. Policies for lead_captures
-- Anyone can insert a lead (public scanner)
DROP POLICY IF EXISTS "Public can insert leads" ON public.lead_captures;
CREATE POLICY "Public can insert leads" ON public.lead_captures
  FOR INSERT WITH CHECK (true);

-- Only the owner of the QR code can select their leads
DROP POLICY IF EXISTS "Users can view their own leads" ON public.lead_captures;
CREATE POLICY "Users can view their own leads" ON public.lead_captures
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.qr_codes 
      WHERE public.qr_codes.id = public.lead_captures.qr_code_id 
      AND public.qr_codes.user_id = auth.uid()
    )
  );

-- 5. Add index for performance
CREATE INDEX IF NOT EXISTS idx_lead_captures_qr_code_id ON public.lead_captures(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_lead_captures_user_id ON public.lead_captures(user_id);
