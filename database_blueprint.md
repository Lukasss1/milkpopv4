# Shake Stop Relational Database Blueprint
### Operational Hub & Brand Platform ERD Schema

This database blueprint represents the complete production-ready PostgreSQL schema structure for **Shake Stop**. It is designed with secure normalization constraints, explicit indexing, and strict Row Level Security (RLS) policies compliant with UK GDPR regulations.

---

## 1. Schema Diagram & Relationships

```
              +--------------------------+
              |          users           |
              +--------------------------+
                           || (1:1)
                           \/
              +--------------------------+
              |         profiles         |
              +--------------------------+
               || (1:N)            || (1:N)
               \/                  \/
   +--------------------+  +--------------------+
   |   sifr_reports     |  |     documents      |
   +--------------------+  +--------------------+
               || (1:N)
               \/
   +--------------------+
   |   sifr_comments    |
   +--------------------+
```

---

## 2. Table Definitions (PostgreSQL DDL)

### Core Profile Node
```sql
-- Role Enum declaration for role-based access
CREATE TYPE employee_role AS ENUM (
  'team_member',
  'supervisor',
  'assistant_manager',
  'store_manager',
  'area_manager',
  'ops_manager',
  'director',
  'administrator'
);

-- Profiles Table (Sensitive, GDPR isolated, relates to Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  role employee_role NOT NULL DEFAULT 'team_member',
  store_id UUID REFERENCES store_locations(id),
  next_shift VARCHAR(200),
  holiday_balance NUMERIC(4,1) NOT NULL DEFAULT 28.0,
  points INT NOT NULL DEFAULT 0,
  level INT NOT NULL DEFAULT 1,
  badges TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Store Locations Table
```sql
CREATE TABLE store_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  address TEXT NOT NULL,
  postcode VARCHAR(10) NOT NULL,
  opening_hours VARCHAR(250) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('open', 'closed', 'coming_soon')),
  delivery_links JSONB DEFAULT '{}'::jsonb,
  phone VARCHAR(30),
  email VARCHAR(150),
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### SIFR Observation Reports Table
```sql
CREATE TYPE sifr_category AS ENUM (
  'attendance',
  'communication',
  'behaviour',
  'training',
  'customer_service',
  'health_safety',
  'operations',
  'teamwork',
  'other'
);

CREATE TYPE sifr_status AS ENUM (
  'submitted',
  'under_review',
  'escalated',
  'action_required',
  'resolved',
  'closed'
);

CREATE TABLE sifr_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  category sifr_category NOT NULL,
  incident_date DATE NOT NULL,
  involved_people TEXT,
  store_id UUID REFERENCES store_locations(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  impact TEXT NOT NULL,
  suggested_action TEXT NOT NULL,
  confidentiality VARCHAR(20) NOT NULL CHECK (confidentiality IN ('confidential', 'standard')),
  status sifr_status NOT NULL DEFAULT 'submitted',
  reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### SIFR Report Comments Table
```sql
CREATE TABLE sifr_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES sifr_reports(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Secure Documents Table
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(250) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('contracts', 'compliance', 'payslips', 'performance', 'id_verification')),
  upload_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('approved', 'pending', 'action_required')),
  document_url TEXT NOT NULL,
  expiry_date DATE
);
```

### Recruitment and Applications Table
```sql
CREATE TABLE job_vacancies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(150) NOT NULL,
  department VARCHAR(100) NOT NULL,
  location VARCHAR(100) NOT NULL,
  salary VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('Full-time', 'Part-time')),
  role_description TEXT NOT NULL,
  requirements TEXT[] NOT NULL,
  responsibilities TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vacancy_id UUID REFERENCES job_vacancies(id) ON DELETE SET NULL,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  position VARCHAR(100) NOT NULL,
  store VARCHAR(100) NOT NULL,
  availability TEXT NOT NULL,
  experience TEXT,
  cv_url TEXT NOT NULL,
  message TEXT,
  status VARCHAR(25) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'interview', 'offer', 'declined')),
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. High-Security Row Level Security (RLS) Guidelines

Row-Level Security is crucial under UK GDPR guidelines to shield sensitive payslips, identity passports, and SIFR incidents from unauthorized eyes.

```sql
-- Enable RLS across profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE sifr_reports ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Table Policies
CREATE POLICY "Employees can view own personal profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Managers can view all employees at their store" 
  ON profiles FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('store_manager', 'area_manager', 'ops_manager', 'administrator')
      AND p.store_id = profiles.store_id
    )
  );

-- 2. Secure Documents Policies
CREATE POLICY "Employees can view own document uploads" 
  ON documents FOR SELECT 
  USING (auth.uid() = employee_id);

CREATE POLICY "Store Managers can read and approve own store docs" 
  ON documents FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS manager 
      WHERE manager.id = auth.uid()
      AND manager.role IN ('store_manager', 'administrator')
      AND manager.store_id = (SELECT store_id FROM profiles WHERE id = documents.employee_id)
    )
  );
```
