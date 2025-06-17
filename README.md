# BarberApp React Native

A React Native mobile application for barber shop management, converted from the original React web application.

## Features

- **Authentication**: User registration and login with Supabase
- **Home Dashboard**: Overview of upcoming appointments and quick actions
- **Booking System**: Schedule appointments with available barbers
- **Shop**: Browse and purchase hair care products
- **Membership Plans**: Premium membership with discounts
- **Profile Management**: Update user information
- **Appointments**: View and manage bookings
- **Order History**: Track product purchases

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **React Navigation** for navigation
- **Supabase** for backend services
- **React Query** for data fetching
- **React Native Paper** for UI components
- **React Hook Form** for form handling
- **Zod** for validation

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android development)

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd newbarber-rn
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Supabase**
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Update `src/services/supabase.ts` with your Supabase URL and anon key:
   ```typescript
   const supabaseUrl = 'YOUR_SUPABASE_URL';
   const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
   ```

4. **Set up database tables**
   Create the following tables in your Supabase database:

   ```sql
   -- Profiles table
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users ON DELETE CASCADE,
     full_name TEXT,
     phone TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     PRIMARY KEY (id)
   );

   -- Barbers table
   CREATE TABLE barbers (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     email TEXT UNIQUE,
     phone TEXT,
     specialties TEXT[],
     is_active BOOLEAN DEFAULT true,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Services table
   CREATE TABLE services (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     description TEXT,
     duration INTEGER NOT NULL,
     price DECIMAL(10,2) NOT NULL,
     category TEXT,
     is_active BOOLEAN DEFAULT true,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Appointments table
   CREATE TABLE appointments (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     customer_id UUID REFERENCES auth.users(id),
     barber_id UUID REFERENCES barbers(id),
     service_id UUID REFERENCES services(id),
     appointment_date DATE NOT NULL,
     appointment_time TIME NOT NULL,
     status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Products table
   CREATE TABLE products (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     description TEXT,
     price DECIMAL(10,2) NOT NULL,
     category TEXT,
     stock_quantity INTEGER DEFAULT 0,
     image_url TEXT,
     is_active BOOLEAN DEFAULT true,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Orders table
   CREATE TABLE orders (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     customer_id UUID REFERENCES auth.users(id),
     total_amount DECIMAL(10,2) NOT NULL,
     status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Order items table
   CREATE TABLE order_items (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     order_id UUID REFERENCES orders(id),
     product_id UUID REFERENCES products(id),
     quantity INTEGER NOT NULL,
     price DECIMAL(10,2) NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

5. **Set up Row Level Security (RLS)**
   Enable RLS and create policies for each table to ensure users can only access their own data.

6. **Start the development server**
   ```bash
   npm start
   ```

7. **Run on device/simulator**
   - For iOS: Press `i` in the terminal or scan QR code with Camera app
   - For Android: Press `a` in the terminal or scan QR code with Expo Go app
   - For web: Press `w` in the terminal

## Project Structure

```
src/
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
├── navigation/         # Navigation configuration
├── screens/           # Screen components
├── services/          # API and external services
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## Key Differences from Web Version

1. **Navigation**: Uses React Navigation instead of React Router
2. **UI Components**: Uses React Native Paper instead of Shadcn/ui
3. **Styling**: Uses React Native StyleSheet instead of Tailwind CSS
4. **Platform-specific**: Optimized for mobile devices with touch interactions
5. **Icons**: Uses Expo Vector Icons instead of Lucide React

## Development Notes

- The app uses Expo for easier development and deployment
- All screens are responsive and optimized for mobile devices
- Authentication state is managed globally using React Context
- Data fetching is handled with React Query for caching and synchronization
- Forms use React Hook Form with Zod validation

## Building for Production

1. **Build for iOS**
   ```bash
   expo build:ios
   ```

2. **Build for Android**
   ```bash
   expo build:android
   ```

3. **Create standalone app**
   ```bash
   expo build:web
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on both iOS and Android
5. Submit a pull request

## License

This project is licensed under the MIT License.# app_forbuild
