-- COPY CUSTOMER_ID TO USER_ID - Fix the missing user_id issue
-- Run this in Supabase SQL Editor

-- 1. First, let's see what columns exist in each table
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'appointments';
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'orders';

-- 2. Fix appointments table - copy customer_id to user_id
UPDATE appointments 
SET user_id = customer_id 
WHERE customer_id IS NOT NULL;

-- 3. Fix orders table - copy customer_id to user_id  
UPDATE orders 
SET user_id = customer_id 
WHERE customer_id IS NOT NULL;

-- 4. Verify the data was copied correctly
-- SELECT COUNT(*) as appointments_with_user_id FROM appointments WHERE user_id IS NOT NULL;
-- SELECT COUNT(*) as orders_with_user_id FROM orders WHERE user_id IS NOT NULL;

-- 5. Optional: Check a few records to make sure they match
-- SELECT customer_id, user_id FROM appointments LIMIT 5;
-- SELECT customer_id, user_id FROM orders LIMIT 5;