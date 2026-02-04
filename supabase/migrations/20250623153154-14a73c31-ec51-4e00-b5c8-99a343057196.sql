
-- Update the existing chat_messages table to add receiver_id column
ALTER TABLE public.chat_messages 
ADD COLUMN IF NOT EXISTS receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add is_read column for message read status
ALTER TABLE public.chat_messages 
ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT false;

-- Add updated_at column
ALTER TABLE public.chat_messages 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update their sent messages" ON public.chat_messages;

-- Create new RLS policies for the updated table structure
CREATE POLICY "Users can view their own messages" ON public.chat_messages
FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);

CREATE POLICY "Users can send messages" ON public.chat_messages
FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can update their sent messages" ON public.chat_messages
FOR UPDATE USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);

-- Create additional indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_chat_messages_receiver_id ON public.chat_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_is_read ON public.chat_messages(is_read);

-- Function to get unread message count for a user
CREATE OR REPLACE FUNCTION get_unread_message_count(user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER 
    FROM public.chat_messages 
    WHERE receiver_id = user_id AND is_read = false
  );
END;
$$;
