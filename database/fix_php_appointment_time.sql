-- Fix appointment_time column for PHP website
-- Run this in your MySQL database

-- 1. First check the current column definition
SHOW COLUMNS FROM appointments WHERE Field = 'appointment_time';

-- 2. Update any null values to a default time
UPDATE appointments 
SET appointment_time = '09:00:00' 
WHERE appointment_time IS NULL;

-- 3. Modify the column to ensure it's TIME type and NOT NULL
ALTER TABLE appointments 
MODIFY COLUMN appointment_time TIME NOT NULL;

-- 4. Add a check constraint for valid time range (MySQL 8.0+)
ALTER TABLE appointments 
ADD CONSTRAINT valid_appointment_time 
CHECK (appointment_time >= '09:00:00' AND appointment_time <= '17:30:00');

-- 5. Create an index for better performance
CREATE INDEX idx_appointments_time ON appointments(appointment_time);

-- 6. Verify the changes
SHOW COLUMNS FROM appointments WHERE Field = 'appointment_time'; 