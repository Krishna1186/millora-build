
-- Add preview_url column to projects table for storing CAD preview file paths
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS preview_url text;
