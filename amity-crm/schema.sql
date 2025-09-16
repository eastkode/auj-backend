-- Roles
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

-- Permissions
CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description VARCHAR(255)
);

-- Role Permissions
CREATE TABLE role_permissions (
  role_id INTEGER NOT NULL REFERENCES roles(id),
  permission_id INTEGER NOT NULL REFERENCES permissions(id),
  PRIMARY KEY(role_id, permission_id)
);

-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  role_id INTEGER NOT NULL REFERENCES roles(id),
  name VARCHAR(150),
  email VARCHAR(150) UNIQUE,
  phone VARCHAR(20),
  password_hash VARCHAR(255),
  area_assigned VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Login History
CREATE TABLE login_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  ip VARCHAR(45),
  user_agent TEXT,
  action VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leads
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  form_no VARCHAR(50) UNIQUE,
  first_name VARCHAR(120),
  last_name VARCHAR(120),
  email VARCHAR(150),
  phone VARCHAR(20),
  dob DATE,
  gender VARCHAR(10),
  correspondence_address TEXT,
  permanent_address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(20),
  country VARCHAR(100) DEFAULT 'INDIA',
  course_applied VARCHAR(150),
  hostel_opted BOOLEAN DEFAULT false,
  hostel_type VARCHAR(50),
  admission_category VARCHAR(50),
  nationality VARCHAR(100),
  passport VARCHAR(10),
  form_stage VARCHAR(50) DEFAULT 'form_submitted',
  assigned_to INTEGER REFERENCES users(id),
  created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  raw_form_data TEXT,
  room_allocated VARCHAR(50),
  scholarship_eligible BOOLEAN DEFAULT false,
  scholarship_amount DECIMAL(12,2),
  hostel_fee_paid BOOLEAN DEFAULT false,
  hostel_fee_amount DECIMAL(12,2),
  transaction_number VARCHAR(50)
);

-- Entrance Calls
CREATE TABLE entrance_calls (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL REFERENCES leads(id),
  called_by INTEGER REFERENCES users(id),
  call_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  note TEXT,
  status VARCHAR(20) DEFAULT 'interested' CHECK (status IN ('coming','not_coming','interested'))
);

-- Entrance Results
CREATE TABLE entrance_results (
  id SERIAL PRIMARY KEY,
  form_no VARCHAR(50),
  result VARCHAR(20) CHECK (result IN ('selected','not_selected','waitlisted')),
  uploaded_by INTEGER REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id),
  amount DECIMAL(12,2),
  payment_type VARCHAR(10) CHECK (payment_type IN ('part','full')),
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  transaction_id VARCHAR(200),
  recorded_by INTEGER REFERENCES users(id)
);

-- Scholarships
CREATE TABLE scholarships (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id),
  scholarship_type VARCHAR(150),
  amount DECIMAL(12,2),
  status VARCHAR(20) DEFAULT 'sent_to_hq' CHECK (status IN ('sent_to_hq','approved','rejected')),
  notes TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP,
  processed_by INTEGER REFERENCES users(id)
);

-- Course Change Requests
CREATE TABLE course_change_requests (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id),
  previous_course VARCHAR(150),
  requested_course VARCHAR(150),
  status VARCHAR(20) DEFAULT 'sent_to_hq' CHECK (status IN ('sent_to_hq','approved','rejected')),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP,
  processed_by INTEGER REFERENCES users(id)
);

-- Insert initial data
INSERT INTO roles (name) VALUES ('Super Admin'), ('Admin'), ('User');
INSERT INTO permissions (slug, description) VALUES
('manage_users', 'Create, edit, delete users'),
('view_all_leads', 'View all leads'),
('manage_leads', 'Full CRUD on leads'),
('upload_results', 'Upload entrance results'),
('manage_payments', 'Record and manage payments'),
('manage_scholarships', 'Approve or reject scholarships'),
('manage_course_changes', 'Approve or reject course changes'),
('manage_hostel', 'Allocate hostel rooms'),
('manage_fees_calling', 'Access fees calling for selected students'),
('view_audit_logs', 'View login history and audit logs');

-- Super Admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;

-- Admin gets most permissions except view_audit_logs
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions WHERE slug != 'view_audit_logs';

-- User gets permissions for forms and fees
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions WHERE slug IN ('manage_leads', 'manage_payments');

-- Default Super Admin user (password: admin123)
INSERT INTO users (role_id, name, email, phone, password_hash, area_assigned, is_active) VALUES
(1, 'Super Admin', 'admin@amity.com', '1234567890', '$2y$10$example.hash.here', 'HQ', true);

-- Courses
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  fee DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
