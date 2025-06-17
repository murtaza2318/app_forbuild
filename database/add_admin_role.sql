-- Add role column to profiles table for admin access control
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'customer';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Update existing admin user (replace with actual admin email)
-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@barbershop.com';

-- You can run this to make a specific user admin:
-- UPDATE profiles SET role = 'admin' WHERE id = 'USER_ID_HERE';

-- Or update by email:
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com';