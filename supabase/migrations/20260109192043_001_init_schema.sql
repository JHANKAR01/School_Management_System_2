/*
  # Project Sovereign - Core Schema Initialization
  
  1. New Tables
    - schools: Multi-tenant setup with configuration
    - users: Authentication with role-based access
    - user_roles: Define role capabilities
    - students: Student profiles linked to users
    - teachers: Teacher profiles linked to users
    - classes: School classes/grades
    - class_sections: Subdivisions of classes
    - subjects: School subjects
    - fee_heads: Fee categories (Tuition, Library, etc)
    - fee_structures: Class-wise fee configuration
    - invoices: Fee bills generated for students
    - transactions: Payment records with UTR tracking
    - exams: School exams configuration
    - exam_results: Student exam marks and grades
    - attendance_records: Student attendance tracking
    - feature_flags: Per-school module toggles
  
  2. Security
    - Enable RLS on all tables
    - Create policies for school-level data isolation
    - Create super admin bypass for global operations
  
  3. Important Notes
    - All data is filtered by school_id except for super admin operations
    - Users are linked to schools via user.school_id
    - Students linked to parents via parent_phone matching
    - Transactions support UPI payments with UTR verification
*/

-- Schools (Tenants)
CREATE TABLE IF NOT EXISTS schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  domain text,
  address text,
  phone text,
  email text,
  principal_name text,
  principal_phone text,
  established_year integer,
  affiliation text,
  settings_json jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  subscription_status text DEFAULT 'trial',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Roles
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  permissions jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- Users (All roles)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  auth_id uuid,
  phone text NOT NULL,
  email text,
  first_name text,
  last_name text,
  role text NOT NULL,
  password_hash text,
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(school_id, phone)
);

-- Classes
CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  numeric_order integer,
  description text,
  academic_year text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(school_id, numeric_order, academic_year)
);

-- Class Sections
CREATE TABLE IF NOT EXISTS class_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  name text NOT NULL,
  section_teacher_id uuid REFERENCES users(id) ON DELETE SET NULL,
  capacity integer,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(class_id, name)
);

-- Subjects
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(school_id, name)
);

-- Students
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  class_section_id uuid REFERENCES class_sections(id) ON DELETE SET NULL,
  admission_number text UNIQUE,
  roll_number text,
  date_of_birth date,
  gender text,
  photo_url text,
  father_name text,
  father_phone text,
  mother_name text,
  mother_phone text,
  guardian_name text,
  guardian_phone text,
  address text,
  blood_group text,
  is_active boolean DEFAULT true,
  admission_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(school_id, admission_number)
);

-- Teachers
CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  employee_id text UNIQUE,
  date_of_birth date,
  gender text,
  qualification text,
  experience_years integer,
  specialization text,
  phone_personal text,
  address text,
  joining_date date,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Teacher-Class-Subject Mapping
CREATE TABLE IF NOT EXISTS teacher_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  class_section_id uuid NOT NULL REFERENCES class_sections(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  is_primary_teacher boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(teacher_id, class_section_id, subject_id)
);

-- Fee Heads (Tuition, Library, Transport, etc)
CREATE TABLE IF NOT EXISTS fee_heads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  display_order integer,
  created_at timestamptz DEFAULT now(),
  UNIQUE(school_id, name)
);

-- Fee Structures (Class-wise fee configuration)
CREATE TABLE IF NOT EXISTS fee_structures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  fee_head_id uuid NOT NULL REFERENCES fee_heads(id) ON DELETE CASCADE,
  amount numeric(10, 2) NOT NULL,
  installment_count integer DEFAULT 1,
  due_date_json jsonb,
  is_active boolean DEFAULT true,
  academic_year text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(school_id, class_id, fee_head_id, academic_year)
);

-- Sibling Discounts
CREATE TABLE IF NOT EXISTS fee_discounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  discount_type text NOT NULL,
  discount_percentage numeric(5, 2),
  discount_amount numeric(10, 2),
  applicable_to_fee_head_id uuid REFERENCES fee_heads(id) ON DELETE SET NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Invoices (Fee bills)
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  invoice_number text UNIQUE,
  academic_year text,
  total_amount numeric(10, 2) NOT NULL,
  discount_amount numeric(10, 2) DEFAULT 0,
  net_amount numeric(10, 2) NOT NULL,
  due_date date NOT NULL,
  status text DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(school_id, invoice_number)
);

-- Invoice Items (Line items per fee head)
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  fee_head_id uuid NOT NULL REFERENCES fee_heads(id) ON DELETE CASCADE,
  amount numeric(10, 2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Transactions (Payment records with UPI)
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  payment_method text NOT NULL,
  amount numeric(10, 2) NOT NULL,
  utr_number text,
  upi_reference_id text,
  payment_date timestamptz,
  status text DEFAULT 'pending',
  verification_status text DEFAULT 'unverified',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Exams
CREATE TABLE IF NOT EXISTS exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  exam_type text,
  academic_year text,
  start_date date,
  end_date date,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(school_id, name, academic_year)
);

-- Exam Subjects (Link exams to subjects with max marks)
CREATE TABLE IF NOT EXISTS exam_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  max_marks numeric(5, 2) NOT NULL,
  passing_marks numeric(5, 2),
  weightage numeric(5, 2) DEFAULT 100,
  created_at timestamptz DEFAULT now(),
  UNIQUE(exam_id, subject_id)
);

-- Exam Results
CREATE TABLE IF NOT EXISTS exam_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  exam_id uuid NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  marks_obtained numeric(5, 2),
  grade text,
  percentage numeric(5, 2),
  is_passed boolean,
  remarks text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id, exam_id, subject_id)
);

-- Attendance Records
CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_section_id uuid NOT NULL REFERENCES class_sections(id) ON DELETE CASCADE,
  attendance_date date NOT NULL,
  status text NOT NULL,
  marked_by_teacher_id uuid REFERENCES teachers(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(school_id, student_id, attendance_date)
);

-- Staff Attendance
CREATE TABLE IF NOT EXISTS staff_attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  attendance_date date NOT NULL,
  check_in_time timestamptz,
  check_out_time timestamptz,
  status text NOT NULL,
  location_latitude numeric(10, 8),
  location_longitude numeric(11, 8),
  is_mock_location boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(school_id, teacher_id, attendance_date)
);

-- Feature Flags
CREATE TABLE IF NOT EXISTS feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  flag_name text NOT NULL,
  is_enabled boolean DEFAULT false,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(school_id, flag_name)
);

-- Enable RLS on all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_heads ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Schools (Super Admin only)
CREATE POLICY "Super admin can view all schools"
  ON schools FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Super admin can insert schools"
  ON schools FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Super admin can update schools"
  ON schools FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'super_admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'super_admin');

-- RLS Policies for Users (School isolation)
CREATE POLICY "School members can view school users"
  ON users FOR SELECT
  TO authenticated
  USING (
    school_id = (
      SELECT school_id FROM users WHERE id = auth.uid()
    )
    OR auth.jwt() ->> 'role' = 'super_admin'
  );

CREATE POLICY "School admin can insert users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    school_id = (
      SELECT school_id FROM users WHERE id = auth.uid()
    )
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('school_admin', 'super_admin')
  );

-- RLS Policies for Students
CREATE POLICY "Users can view students in their school"
  ON students FOR SELECT
  TO authenticated
  USING (
    school_id = (
      SELECT school_id FROM users WHERE id = auth.uid()
    )
    OR auth.jwt() ->> 'role' = 'super_admin'
  );

-- RLS Policies for Teachers
CREATE POLICY "Users can view teachers in their school"
  ON teachers FOR SELECT
  TO authenticated
  USING (
    school_id = (
      SELECT school_id FROM users WHERE id = auth.uid()
    )
    OR auth.jwt() ->> 'role' = 'super_admin'
  );

-- RLS Policies for Invoices
CREATE POLICY "School members can view invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (
    school_id = (
      SELECT school_id FROM users WHERE id = auth.uid()
    )
    OR auth.jwt() ->> 'role' = 'super_admin'
  );

-- RLS Policies for Transactions
CREATE POLICY "School members can view transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (
    school_id = (
      SELECT school_id FROM users WHERE id = auth.uid()
    )
    OR auth.jwt() ->> 'role' = 'super_admin'
  );

-- RLS Policies for Attendance
CREATE POLICY "School members can view attendance"
  ON attendance_records FOR SELECT
  TO authenticated
  USING (
    school_id = (
      SELECT school_id FROM users WHERE id = auth.uid()
    )
    OR auth.jwt() ->> 'role' = 'super_admin'
  );

-- Create indexes for performance
CREATE INDEX idx_users_school_id ON users(school_id);
CREATE INDEX idx_students_school_id ON students(school_id);
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_teachers_school_id ON teachers(school_id);
CREATE INDEX idx_teachers_user_id ON teachers(user_id);
CREATE INDEX idx_classes_school_id ON classes(school_id);
CREATE INDEX idx_class_sections_class_id ON class_sections(class_id);
CREATE INDEX idx_invoices_school_id ON invoices(school_id);
CREATE INDEX idx_invoices_student_id ON invoices(student_id);
CREATE INDEX idx_transactions_school_id ON transactions(school_id);
CREATE INDEX idx_transactions_invoice_id ON transactions(invoice_id);
CREATE INDEX idx_attendance_school_id ON attendance_records(school_id);
CREATE INDEX idx_attendance_student_id ON attendance_records(student_id);
CREATE INDEX idx_attendance_date ON attendance_records(attendance_date);
CREATE INDEX idx_exams_school_id ON exams(school_id);
CREATE INDEX idx_exam_results_school_id ON exam_results(school_id);
