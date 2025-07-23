# CareCompanion Setup Guide

## Quick Setup Steps

### 1. Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Wait for the project to be ready (2-3 minutes)

### 2. Get Your Credentials
1. Go to your project settings → API
2. Copy your **Project URL** (looks like: `https://abcdefgh.supabase.co`)
3. Copy your **anon/public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 3. Configure Environment
1. Create a `.env` file in your project root:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Set Up Database
1. Go to your Supabase project → SQL Editor
2. Copy and paste this SQL to create the database schema:

```sql
-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create users table
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('caregiver', 'family', 'admin')) DEFAULT 'caregiver',
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patients table
CREATE TABLE patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  medical_record_number TEXT UNIQUE,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  diagnosis TEXT[],
  allergies TEXT[],
  status TEXT CHECK (status IN ('active', 'inactive', 'discharged')) DEFAULT 'active',
  assigned_caregiver_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES users(id),
  category TEXT CHECK (category IN ('medication', 'vitals', 'exercise', 'meal', 'hygiene', 'social', 'other')) DEFAULT 'other',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  estimated_duration INTEGER,
  recurring_pattern TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medications table
CREATE TABLE medications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  instructions TEXT,
  prescriber TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  next_dose_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medication_logs table
CREATE TABLE medication_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('taken', 'missed', 'snooze')) NOT NULL,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  logged_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public read access for patients" ON patients FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert patients" ON patients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update patients" ON patients FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Public read access for tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert tasks" ON tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update tasks" ON tasks FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Public read access for medications" ON medications FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert medications" ON medications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update medications" ON medications FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Public read access for medication_logs" ON medication_logs FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert medication_logs" ON medication_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Insert demo users (these will be created when they first sign up)
-- The auth.users table is managed by Supabase Auth

-- Insert demo patients
INSERT INTO patients (id, full_name, date_of_birth, medical_record_number, emergency_contact_name, emergency_contact_phone, diagnosis, allergies) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'John Doe', '1935-03-15', 'MRN001', 'Jane Doe', '+1-555-0101', ARRAY['Alzheimer''s Disease', 'Hypertension'], ARRAY['Penicillin']),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Mary Wilson', '1940-07-22', 'MRN002', 'Robert Wilson', '+1-555-0102', ARRAY['Dementia', 'Diabetes Type 2'], ARRAY['Shellfish']);

-- Insert sample tasks for this week
INSERT INTO tasks (title, description, patient_id, category, priority, scheduled_date, scheduled_time, status) VALUES
  ('Morning Medication', 'Administer morning medications', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'medication', 'high', CURRENT_DATE, '08:00:00', 'pending'),
  ('Vital Signs Check', 'Check blood pressure and temperature', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'vitals', 'medium', CURRENT_DATE, '09:00:00', 'completed'),
  ('Physical Therapy', '30-minute walking exercise', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'exercise', 'medium', CURRENT_DATE, '10:30:00', 'pending'),
  ('Lunch Preparation', 'Prepare and assist with lunch', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'meal', 'high', CURRENT_DATE, '12:00:00', 'pending'),
  ('Evening Medication', 'Administer evening medications', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'medication', 'high', CURRENT_DATE, '18:00:00', 'pending');

-- Insert sample medications
INSERT INTO medications (patient_id, name, dosage, frequency, instructions, prescriber, start_date, next_dose_time, is_active) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Donepezil', '10mg', 'once daily', 'Take with evening meal', 'Dr. Smith', '2024-01-01', NOW() + INTERVAL '2 hours', true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Lisinopril', '5mg', 'once daily', 'Take in morning', 'Dr. Johnson', '2024-01-01', NOW() + INTERVAL '8 hours', true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Metformin', '500mg', 'twice daily', 'Take with meals', 'Dr. Wilson', '2024-01-01', NOW() + INTERVAL '4 hours', true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Memantine', '20mg', 'once daily', 'Take with food', 'Dr. Smith', '2024-01-01', NOW() + INTERVAL '6 hours', true);
```

3. Click "Run" to execute the SQL

### 5. Create Demo User Accounts
1. Go to Authentication → Users in your Supabase dashboard
2. Click "Add user" and create these accounts:
   - **Email:** admin@demo.com, **Password:** demo123
   - **Email:** caregiver@demo.com, **Password:** demo123  
   - **Email:** family@demo.com, **Password:** demo123

3. After creating each user, note their UUID and run this SQL:
```sql
-- Replace the UUIDs with the actual user IDs from the auth.users table
INSERT INTO users (id, email, full_name, role, phone) VALUES
  ('user-id-from-auth-table', 'admin@demo.com', 'Admin User', 'admin', '+1-555-0001'),
  ('user-id-from-auth-table', 'caregiver@demo.com', 'Sarah Johnson', 'caregiver', '+1-555-0002'),
  ('user-id-from-auth-table', 'family@demo.com', 'Michael Smith', 'family', '+1-555-0003');
```

### 6. Test the Application
1. Restart your development server: `npm run dev`
2. The login page should now show "Connected to Supabase"
3. Try logging in with: caregiver@demo.com / demo123

## Troubleshooting

### "Failed to fetch" error
- Check your .env file exists and has correct values
- Verify your Supabase project URL and key
- Make sure you restarted the dev server after creating .env

### "Invalid API key" error
- Double-check your anon key from Supabase settings
- Make sure you copied the full key (it's very long)

### "Table doesn't exist" error
- Run the SQL schema in your Supabase SQL editor
- Check that all tables were created successfully

### Login fails with correct credentials
- Verify the user exists in Authentication → Users
- Check that the user record exists in your custom users table
- Ensure RLS policies allow the operation

## Need Help?
If you're still having issues:
1. Check the browser console for detailed error messages
2. Verify all steps were completed exactly as described
3. Try creating a fresh Supabase project if problems persist