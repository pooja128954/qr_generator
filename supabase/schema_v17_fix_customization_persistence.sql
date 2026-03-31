-- Migration to fix QR customization persistence
-- Add missing columns for advanced styling and transformations

ALTER TABLE public.qr_codes 
ADD COLUMN IF NOT EXISTS body_type TEXT DEFAULT 'square',
ADD COLUMN IF NOT EXISTS eye_frame_type TEXT DEFAULT 'square',
ADD COLUMN IF NOT EXISTS eye_ball_type TEXT DEFAULT 'square',
ADD COLUMN IF NOT EXISTS color_mode TEXT DEFAULT 'single',
ADD COLUMN IF NOT EXISTS gradient_color1 TEXT DEFAULT '#6366f1',
ADD COLUMN IF NOT EXISTS gradient_color2 TEXT DEFAULT '#ec4899',
ADD COLUMN IF NOT EXISTS gradient_angle INTEGER DEFAULT 45,
ADD COLUMN IF NOT EXISTS qr_scale NUMERIC DEFAULT 1,
ADD COLUMN IF NOT EXISTS shape_scale NUMERIC DEFAULT 1,
ADD COLUMN IF NOT EXISTS qr_offset_x NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS qr_offset_y NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS shape_offset_x NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS shape_offset_y NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS active_template TEXT DEFAULT NULL;

-- Note: After running this, remember to "Reload Schema Cache" in Supabase API settings
-- if you are seeing 400 Bad Request errors in the frontend.
