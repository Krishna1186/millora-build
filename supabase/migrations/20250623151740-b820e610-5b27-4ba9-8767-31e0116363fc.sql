
-- First, let's ensure the bids table has all necessary columns and proper foreign key relationships
ALTER TABLE public.bids 
ADD COLUMN IF NOT EXISTS expected_delivery_date DATE;

-- Ensure proper foreign key constraints exist
DO $$ 
BEGIN
    -- Check if foreign key to projects exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'bids_project_id_fkey' 
        AND table_name = 'bids'
    ) THEN
        ALTER TABLE public.bids 
        ADD CONSTRAINT bids_project_id_fkey 
        FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
    END IF;

    -- Check if foreign key to profiles exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'bids_manufacturer_id_fkey' 
        AND table_name = 'bids'
    ) THEN
        ALTER TABLE public.bids 
        ADD CONSTRAINT bids_manufacturer_id_fkey 
        FOREIGN KEY (manufacturer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Enable RLS policies for bids table
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Manufacturers can manage their own bids" ON public.bids;
DROP POLICY IF EXISTS "Project owners can view bids on their projects" ON public.bids;

-- Policy: Manufacturers can view and insert their own bids
CREATE POLICY "Manufacturers can manage their own bids" ON public.bids
FOR ALL USING (
  manufacturer_id = auth.uid() AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'manufacturer')
);

-- Policy: Project owners can view bids on their projects
CREATE POLICY "Project owners can view bids on their projects" ON public.bids
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = bids.project_id 
    AND projects.user_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bids_project_id ON public.bids(project_id);
CREATE INDEX IF NOT EXISTS idx_bids_manufacturer_id ON public.bids(manufacturer_id);

-- Ensure profiles table has proper RLS policies for manufacturers
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
FOR SELECT USING (true);

-- Allow users to update their own profiles
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);
