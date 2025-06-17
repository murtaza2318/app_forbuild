-- COMPLETE FIX WITH DATA MIGRATION
-- Run this ENTIRE script in Supabase SQL Editor

-- STEP 1: Add missing columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID;

-- STEP 2: Update default values for new columns
UPDATE products SET is_active = true WHERE is_active IS NULL;
UPDATE barbers SET is_active = true WHERE is_active IS NULL;
UPDATE appointments SET total_amount = 0 WHERE total_amount IS NULL;

-- STEP 3: Copy customer_id to user_id (THIS IS THE KEY FIX)
UPDATE appointments SET user_id = customer_id WHERE customer_id IS NOT NULL AND user_id IS NULL;
UPDATE orders SET user_id = customer_id WHERE customer_id IS NOT NULL AND user_id IS NULL;

-- STEP 4: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_barbers_is_active ON barbers(is_active);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- STEP 5: Verify the fix worked (uncomment to check)
-- SELECT 'appointments' as table_name, COUNT(*) as total_records, COUNT(user_id) as records_with_user_id FROM appointments
-- UNION ALL
-- SELECT 'orders' as table_name, COUNT(*) as total_records, COUNT(user_id) as records_with_user_id FROM orders;