-- Update guest role permissions
-- Run this SQL in your Supabase SQL Editor

-- Update existing guest role with proper permissions
UPDATE roles 
SET 
  permissions = '["chatbot", "chatbot:access", "chatbot:chat", "guests", "guests:view", "my_bookings"]'::jsonb,
  description = 'Guest user with access to chatbot and guest services',
  updated_at = NOW()
WHERE name = 'guest';

-- Verify the role was updated
SELECT name, display_name, description, permissions FROM roles WHERE name = 'guest';
