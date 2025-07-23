# CareCompanion - Home Health Aide App

A comprehensive PWA (Progressive Web App) designed for home-health aides caring for seniors with Alzheimer's/dementia. Built with React, Tailwind CSS, and Supabase for HIPAA-compliant data management.

## 🏥 Features

### Core Modules
- **Daily Activity Scheduler** - Drag-and-drop calendar with recurring tasks
- **Medication Manager** - Automated reminders with escalation alerts
- **Home Chores & Safety Checks** - Customizable checklists with photo evidence
- **Secure Notes & Observations** - Rich-text notes with voice-to-text
- **Chat & File-Share** - End-to-end encrypted messaging
- **Analytics & Reporting** - Adherence tracking and trend analysis
- **Onboarding & Help Hub** - Guided tours and FAQ chatbot

### User Roles
1. **Caregiver/Aide** - Create tasks, log medications, add notes
2. **Family Member** - View schedules, receive alerts, send messages
3. **Supervisor/Admin** - Manage users, edit templates, export reports

### Compliance & Accessibility
- WCAG 2.1 AA compliant
- HIPAA-compliant data storage
- Row-level security for patient data
- Full audit logging
- Multi-language support (English/Spanish)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Environment Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd care-companion
npm install
```

2. **Environment Variables**
Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# SendGrid (for notifications)
VITE_SENDGRID_API_KEY=your_sendgrid_api_key

# App Configuration
VITE_APP_NAME=CareCompanion
VITE_APP_VERSION=1.0.0
```

3. **Database Setup**

Run the following SQL in your Supabase SQL editor:

```sql
-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create custom tables
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
  estimated_duration INTEGER, -- in minutes
  recurring_pattern TEXT, -- daily, weekly, monthly, etc.
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE medications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL, -- "once daily", "twice daily", etc.
  instructions TEXT,
  prescriber TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  next_dose_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

CREATE TABLE checklists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('safety', 'hygiene', 'vitals', 'environment', 'other')) DEFAULT 'other',
  items JSONB NOT NULL, -- Array of checklist items
  is_template BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE checklist_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_id UUID REFERENCES checklists(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  completed_by UUID REFERENCES users(id),
  completed_items JSONB NOT NULL,
  notes TEXT,
  photos TEXT[], -- Array of photo URLs
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  tags TEXT[],
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5),
  appetite_rating INTEGER CHECK (appetite_rating >= 1 AND appetite_rating <= 5),
  is_private BOOLEAN DEFAULT false,
  attachments TEXT[], -- Array of file URLs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES users(id),
  patient_id UUID REFERENCES patients(id),
  content TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'image', 'file')) DEFAULT 'text',
  file_url TEXT,
  is_encrypted BOOLEAN DEFAULT true,
  read_by JSONB DEFAULT '[]', -- Array of user IDs who have read the message
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON users FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Caregivers can view assigned patients" ON patients FOR SELECT USING (
  assigned_caregiver_id = auth.uid() OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Insert seed data
INSERT INTO users (id, email, full_name, role, phone) VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin@demo.com', 'Admin User', 'admin', '+1-555-0001'),
  ('22222222-2222-2222-2222-222222222222', 'caregiver@demo.com', 'Sarah Johnson', 'caregiver', '+1-555-0002'),
  ('33333333-3333-3333-3333-333333333333', 'family@demo.com', 'Michael Smith', 'family', '+1-555-0003');

INSERT INTO patients (id, full_name, date_of_birth, medical_record_number, emergency_contact_name, emergency_contact_phone, diagnosis, allergies, assigned_caregiver_id) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'John Doe', '1935-03-15', 'MRN001', 'Jane Doe', '+1-555-0101', ARRAY['Alzheimer''s Disease', 'Hypertension'], ARRAY['Penicillin'], '22222222-2222-2222-2222-222222222222'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Mary Wilson', '1940-07-22', 'MRN002', 'Robert Wilson', '+1-555-0102', ARRAY['Dementia', 'Diabetes Type 2'], ARRAY['Shellfish'], '22222222-2222-2222-2222-222222222222');

-- Insert sample tasks for this week
INSERT INTO tasks (title, description, patient_id, assigned_to, category, priority, scheduled_date, scheduled_time, status) VALUES
  ('Morning Medication', 'Administer morning medications', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'medication', 'high', CURRENT_DATE, '08:00:00', 'pending'),
  ('Vital Signs Check', 'Check blood pressure and temperature', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'vitals', 'medium', CURRENT_DATE, '09:00:00', 'completed'),
  ('Physical Therapy', '30-minute walking exercise', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'exercise', 'medium', CURRENT_DATE, '10:30:00', 'pending'),
  ('Lunch Preparation', 'Prepare and assist with lunch', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'meal', 'high', CURRENT_DATE, '12:00:00', 'pending'),
  ('Evening Medication', 'Administer evening medications', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'medication', 'high', CURRENT_DATE, '18:00:00', 'pending');

-- Insert sample medications
INSERT INTO medications (patient_id, name, dosage, frequency, instructions, prescriber, start_date, next_dose_time, is_active) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Donepezil', '10mg', 'once daily', 'Take with evening meal', 'Dr. Smith', '2024-01-01', NOW() + INTERVAL '2 hours', true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Lisinopril', '5mg', 'once daily', 'Take in morning', 'Dr. Johnson', '2024-01-01', NOW() + INTERVAL '8 hours', true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Metformin', '500mg', 'twice daily', 'Take with meals', 'Dr. Wilson', '2024-01-01', NOW() + INTERVAL '4 hours', true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Memantine', '20mg', 'once daily', 'Take with food', 'Dr. Smith', '2024-01-01', NOW() + INTERVAL '6 hours', true);
```

4. **Start Development Server**
```bash
npm run dev
```

## 🔐 Demo Accounts

Use these credentials to test different user roles:

- **Admin**: admin@demo.com / demo123
- **Caregiver**: caregiver@demo.com / demo123  
- **Family Member**: family@demo.com / demo123

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18, Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **State Management**: React Context API
- **Routing**: React Router v6 (HashRouter for PWA)
- **Icons**: React Icons (Feather Icons)
- **Notifications**: React Hot Toast
- **Drag & Drop**: React DnD
- **Charts**: ECharts

### Folder Structure
```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout components (Sidebar, Header)
│   └── common/         # Reusable UI components
├── contexts/           # React Context providers
├── pages/              # Page components
├── lib/                # Utilities and configurations
├── hooks/              # Custom React hooks
└── styles/             # Global styles and Tailwind config
```

### Database Schema
- **users** - User accounts and roles
- **patients** - Patient information and medical records
- **tasks** - Daily activities and care tasks
- **medications** - Medication schedules and tracking
- **medication_logs** - Medication administration records
- **checklists** - Safety and care checklists
- **notes** - Care observations and notes
- **messages** - Secure communication
- **audit_log** - Full audit trail for compliance

## 🔒 Security & Compliance

### HIPAA Compliance
- End-to-end encryption for sensitive data
- Row-level security (RLS) for data isolation
- Complete audit logging of all actions
- Secure authentication with Supabase Auth
- Data retention and deletion policies

### Accessibility (WCAG 2.1 AA)
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Large touch targets (44px minimum)
- Descriptive alt text for images
- Focus management and indicators

## 📱 PWA Features

The app is configured as a Progressive Web App with:
- Offline functionality
- App-like experience on mobile devices
- Push notifications for medication reminders
- Home screen installation
- Background sync for data updates

## 🚀 Deployment

### Netlify Deployment

1. **Build Configuration**
```toml
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. **Environment Variables**
Set these in Netlify dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SENDGRID_API_KEY`

3. **Deploy**
```bash
# Build for production
npm run build

# Deploy to Netlify (with Netlify CLI)
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### CI/CD Pipeline

The app includes GitHub Actions workflow for:
- Automated testing on pull requests
- Preview deployments for feature branches
- Production deployment on main branch
- Lighthouse performance audits

## 📊 Monitoring & Analytics

### Health Monitoring
- Application performance monitoring
- Error tracking and alerting
- User activity analytics
- Medication adherence reporting
- Care quality metrics

### Reporting Features
- Weekly care summaries (PDF export)
- Medication adherence reports
- Task completion analytics
- Trend analysis and insights
- Custom date range reports

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm test             # Run tests
```

### Code Quality
- ESLint configuration for React best practices
- Prettier for code formatting
- Husky for pre-commit hooks
- Conventional commits for changelog generation

### Testing Strategy
- Unit tests with Jest and React Testing Library
- Integration tests for critical user flows
- E2E tests with Playwright
- Accessibility testing with axe-core

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Email: support@carecompanion.app
- Documentation: [docs.carecompanion.app](https://docs.carecompanion.app)

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core scheduling and medication management
- ✅ User authentication and role-based access
- ✅ Basic reporting and analytics

### Phase 2 (Q2 2024)
- 🔄 Advanced checklists and safety monitoring
- 🔄 Real-time messaging and file sharing
- 🔄 Mobile app (React Native)

### Phase 3 (Q3 2024)
- 📅 AI-powered care recommendations
- 📅 Integration with medical devices
- 📅 Telehealth video consultations

### Phase 4 (Q4 2024)
- 📅 Advanced analytics and predictive insights
- 📅 Multi-language support expansion
- 📅 Enterprise features and API access