-- Fix appointment_time column in appointments table
-- Run this in Supabase SQL Editor

-- 1. First, check the current column definition
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'appointments' AND column_name = 'appointment_time';

-- 2. Update any null values to a default time (9:00 AM)
UPDATE appointments 
SET appointment_time = '09:00' 
WHERE appointment_time IS NULL;

-- 3. Now we can safely add the NOT NULL constraint
ALTER TABLE appointments 
ALTER COLUMN appointment_time SET NOT NULL;

-- 4. Add a check constraint to ensure valid time format
ALTER TABLE appointments 
ADD CONSTRAINT valid_appointment_time 
CHECK (appointment_time >= '09:00' AND appointment_time <= '17:30');

-- 5. Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_time 
ON appointments(appointment_time);

-- 6. Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'appointments' AND column_name = 'appointment_time'; 