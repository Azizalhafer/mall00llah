-- Database schema for the Hospital Outbreak Investigation Dashboard

-- Users table (for login and permissions)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL CHECK(role IN ('admin', 'investigator', 'viewer')), -- Example roles
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Outbreaks table
CREATE TABLE IF NOT EXISTS outbreaks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, -- e.g., "MRSA Outbreak - ICU Ward A"
    description TEXT,
    pathogen TEXT, -- Causative agent
    start_date DATE,
    end_date DATE, -- Null if ongoing
    status TEXT NOT NULL CHECK(status IN ('active', 'monitoring', 'closed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Locations table (e.g., wards, rooms within the hospital)
CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE, -- e.g., "ICU Ward A", "Room 301"
    type TEXT, -- e.g., "Ward", "Room", "Operating Theater"
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Case Definitions table
CREATE TABLE IF NOT EXISTS case_definitions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    outbreak_id INTEGER NOT NULL,
    name TEXT NOT NULL, -- e.g., "Confirmed Case", "Suspected Case"
    criteria TEXT NOT NULL, -- Detailed definition criteria
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (outbreak_id) REFERENCES outbreaks(id) ON DELETE CASCADE
);

-- Cases table (Line List)
CREATE TABLE IF NOT EXISTS cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    outbreak_id INTEGER NOT NULL,
    case_definition_id INTEGER, -- Link to the definition used
    patient_mrn TEXT, -- Medical Record Number
    patient_name TEXT,
    date_of_birth DATE,
    gender TEXT CHECK(gender IN ('male', 'female', 'other')),
    admission_date DATE,
    symptom_onset_date DATE,
    diagnosis_date DATE,
    lab_result TEXT,
    lab_result_date DATE,
    location_id INTEGER, -- Location where the case was identified/exposed
    outcome TEXT CHECK(outcome IN ('recovered', 'deceased', 'transferred', 'ongoing')),
    notes TEXT,
    reported_to_seha BOOLEAN DEFAULT FALSE, -- Flag for Seha platform reporting
    seha_report_id TEXT, -- ID from Seha platform if reported
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (outbreak_id) REFERENCES outbreaks(id) ON DELETE CASCADE,
    FOREIGN KEY (case_definition_id) REFERENCES case_definitions(id) ON DELETE SET NULL,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
);

-- Control Actions table
CREATE TABLE IF NOT EXISTS control_actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    outbreak_id INTEGER NOT NULL,
    action_type TEXT NOT NULL, -- e.g., "Isolation", "Cleaning", "Hand Hygiene Campaign", "Staff Screening"
    description TEXT NOT NULL,
    start_date DATE,
    completion_date DATE,
    responsible_person TEXT,
    status TEXT NOT NULL CHECK(status IN ('planned', 'in_progress', 'completed', 'cancelled')),
    effectiveness_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (outbreak_id) REFERENCES outbreaks(id) ON DELETE CASCADE
);

-- Reports table (for generated reports)
CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    outbreak_id INTEGER,
    report_type TEXT NOT NULL, -- e.g., "Line List Export", "Epi Curve PDF", "Seha Summary"
    generation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    generated_by_user_id INTEGER,
    file_path TEXT, -- Path to the generated file (PDF/Excel)
    notes TEXT,
    FOREIGN KEY (outbreak_id) REFERENCES outbreaks(id) ON DELETE SET NULL,
    FOREIGN KEY (generated_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Settings table (for application-wide settings)
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alert_type TEXT NOT NULL, -- e.g., "New High-Priority Case", "Threshold Exceeded"
    message TEXT NOT NULL,
    related_outbreak_id INTEGER,
    related_case_id INTEGER,
    status TEXT NOT NULL CHECK(status IN ('new', 'acknowledged', 'resolved')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMP,
    resolved_at TIMESTAMP,
    FOREIGN KEY (related_outbreak_id) REFERENCES outbreaks(id) ON DELETE SET NULL,
    FOREIGN KEY (related_case_id) REFERENCES cases(id) ON DELETE SET NULL
);

-- Create indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_cases_outbreak_id ON cases(outbreak_id);
CREATE INDEX IF NOT EXISTS idx_cases_symptom_onset_date ON cases(symptom_onset_date);
CREATE INDEX IF NOT EXISTS idx_control_actions_outbreak_id ON control_actions(outbreak_id);
CREATE INDEX IF NOT EXISTS idx_case_definitions_outbreak_id ON case_definitions(outbreak_id);

-- Add initial settings if needed
-- INSERT INTO settings (key, value, description) VALUES ('seha_api_endpoint', '', 'API Endpoint for Seha Platform Integration');
-- INSERT INTO settings (key, value, description) VALUES ('default_case_definition', 'Suspected Case', 'Default definition for new cases');

