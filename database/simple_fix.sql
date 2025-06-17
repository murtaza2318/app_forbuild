-- SIMPLE DATABASE FIX - Run this in Supabase SQL Editor
-- This fixes the immediate errors you're seeing

-- 1. Add missing is_active column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Add missing is_active column to barbers table  
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 3. Add missing total_amount column to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) DEFAULT 0;

-- 4. Add user_id column to orders table (without foreign key for now)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID;

-- 5. Update existing records to have default values
UPDATE products SET is_active = true WHERE is_active IS NULL;
UPDATE barbers SET is_active = true WHERE is_active IS NULL;
UPDATE appointments SET total_amount = 0 WHERE total_amount IS NULL;