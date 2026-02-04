
-- Create storage bucket for project files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-files', 'project-files', true);

-- Create storage policy for project files
CREATE POLICY "Users can upload their own project files" ON storage.objects
FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own project files" ON storage.objects
FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own project files" ON storage.objects
FOR UPDATE USING (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own project files" ON storage.objects
FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Update the existing projects table to include all necessary fields
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create RLS policies for projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own projects" ON projects
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON projects
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Manufacturers can view projects matching their expertise" ON projects
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'manufacturer'
    AND (
      profiles.type_of_manufacturing IS NULL 
      OR projects.manufacturing_type = ANY(string_to_array(profiles.type_of_manufacturing, ','))
    )
  )
);

-- Create project_bids table for manufacturer bids
CREATE TABLE IF NOT EXISTS project_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  manufacturer_id UUID REFERENCES auth.users(id),
  bid_amount DECIMAL(10,2),
  estimated_delivery_days INTEGER,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE project_bids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Manufacturers can view their own bids" ON project_bids
FOR SELECT USING (auth.uid() = manufacturer_id);

CREATE POLICY "Manufacturers can insert bids" ON project_bids
FOR INSERT WITH CHECK (auth.uid() = manufacturer_id);

CREATE POLICY "Project owners can view bids on their projects" ON project_bids
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_bids.project_id 
    AND projects.user_id = auth.uid()
  )
);
