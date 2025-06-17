# Admin Setup Guide

## 🔧 Setting Up Admin Access

### 1. Database Setup

First, you need to add the `role` column to your `profiles` table in Supabase:

```sql
-- Add role column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'customer';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
```

### 2. Create Admin User

You can make any user an admin by updating their role in the database:

#### Option A: Update by Email
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-admin-email@example.com';
```

#### Option B: Update by User ID
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'USER_ID_HERE';
```

### 3. Admin Features

Once a user has the `admin` role, they will see:

#### Mobile App (React Native)
- **Admin Tab**: Special admin tab in bottom navigation
- **Admin Dashboard**: Overview with statistics
- **Services Management**: Add, edit, and manage services
- **Quick Actions**: Links to various admin functions

#### Web App
- **Full Admin Panel**: Complete admin interface at `/admin`
- **Appointments Management**: View and manage all appointments
- **Customers Management**: View customer list and details
- **Products Management**: Add, edit, and manage products
- **Services Management**: Full CRUD operations for services

## 📱 Admin Features in Mobile App

### Dashboard Overview
- Total appointments count
- Total customers count
- Total products count
- Total orders count
- Total services count

### Services Management
- View all services
- Add new services
- Edit existing services
- Enable/disable services
- Set pricing and duration

### Quick Actions
- Navigate to appointments
- Manage products
- View customers
- Access order history
- Generate reports (coming soon)

## 🌐 Admin Features in Web App

### Complete Admin Panel
- **Dashboard**: Statistics and overview
- **Appointments Table**: 
  - View all appointments
  - Filter by status, date, barber
  - Update appointment status
  - Cancel appointments

- **Customers Table**:
  - View all registered customers
  - Search and filter customers
  - View customer details and history

- **Products Table**:
  - Add new products
  - Edit product details
  - Manage inventory
  - Set pricing and categories

- **Services Management**:
  - Full CRUD operations
  - Category management
  - Pricing and duration settings

## 🔐 Security Notes

- Only users with `role = 'admin'` can access admin features
- Admin tab only appears for admin users
- All admin operations require authentication
- Role checking is done on both client and server side

## 🚀 Getting Started

1. **Run the SQL migration** in your Supabase dashboard
2. **Update a user's role** to 'admin' using SQL
3. **Login with the admin user** in the mobile app
4. **Access admin features** via the Admin tab

## 📋 Admin User Management

### Creating Multiple Admins
```sql
-- Make multiple users admin
UPDATE profiles 
SET role = 'admin' 
WHERE email IN (
  'admin1@example.com',
  'admin2@example.com',
  'manager@example.com'
);
```

### Removing Admin Access
```sql
-- Remove admin access
UPDATE profiles 
SET role = 'customer' 
WHERE email = 'former-admin@example.com';
```

### Checking Admin Users
```sql
-- View all admin users
SELECT id, email, full_name, role, created_at 
FROM profiles 
WHERE role = 'admin';
```

## 🎯 Recommended Workflow

1. **Use Web Admin Panel** for:
   - Complex data management
   - Bulk operations
   - Detailed reporting
   - Initial setup

2. **Use Mobile Admin** for:
   - Quick overview
   - On-the-go management
   - Basic statistics
   - Emergency updates

## 📞 Support

If you need help setting up admin access:
1. Check the SQL migration ran successfully
2. Verify the user's role is set to 'admin'
3. Restart the mobile app after role changes
4. Check console logs for any errors