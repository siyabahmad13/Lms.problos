/**
 * Cloudflare D1 Relational Schema & Deployment Helper
 * Compatible with wrangler.toml and Cloudflare Pages Functions
 */

export const CLOUDFLARE_D1_SCHEMA_SQL = `-- Problos LMS Cloudflare D1 Relational Database Schema
-- Run via: npx wrangler d1 execute problos-db --file=./schema.sql

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK(role IN ('admin', 'learner')),
  avatar TEXT,
  password_hash TEXT,
  must_change_password INTEGER DEFAULT 0,
  temporary_password_active INTEGER DEFAULT 0,
  account_active INTEGER DEFAULT 1,
  assigned_track_ids TEXT DEFAULT '[]', -- JSON array
  enrolled_course_ids TEXT DEFAULT '[]', -- JSON array
  excluded_course_ids TEXT DEFAULT '[]', -- JSON array
  access_expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tracks table
CREATE TABLE IF NOT EXISTS tracks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  thumbnail TEXT,
  category TEXT,
  course_ids TEXT DEFAULT '[]', -- JSON array
  is_published INTEGER DEFAULT 1,
  is_archived INTEGER DEFAULT 0,
  estimated_hours INTEGER DEFAULT 40,
  level TEXT CHECK(level IN ('Beginner', 'Intermediate', 'Advanced')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  track_id TEXT REFERENCES tracks(id),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  thumbnail TEXT,
  instructor_name TEXT,
  instructor_title TEXT,
  is_published INTEGER DEFAULT 1,
  is_archived INTEGER DEFAULT 0,
  status TEXT CHECK(status IN ('draft', 'published', 'archived')),
  weeks_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id),
  week_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  deadline TEXT,
  max_marks INTEGER DEFAULT 100,
  allow_late_submission INTEGER DEFAULT 1,
  assigned_intern_ids TEXT DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Submissions table
CREATE TABLE IF NOT EXISTS task_submissions (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id),
  course_id TEXT NOT NULL REFERENCES courses(id),
  learner_id TEXT NOT NULL REFERENCES users(id),
  learner_name TEXT NOT NULL,
  learner_email TEXT NOT NULL,
  current_status TEXT CHECK(current_status IN ('pending', 'approved', 'revision_requested', 'rejected')),
  latest_marks INTEGER,
  latest_feedback TEXT,
  attempts_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Learner Progress table
CREATE TABLE IF NOT EXISTS learner_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  course_id TEXT NOT NULL REFERENCES courses(id),
  completed_lesson_ids TEXT NOT NULL DEFAULT '[]',
  current_lesson_id TEXT,
  last_accessed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT
);

-- Certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id TEXT PRIMARY KEY, -- e.g. PRB-2026-WD-0481
  recipient_id TEXT NOT NULL REFERENCES users(id),
  recipient_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  course_or_track_title TEXT NOT NULL,
  type TEXT CHECK(type IN ('course', 'track')),
  issue_date TEXT NOT NULL,
  issuer_name TEXT NOT NULL,
  issuer_title TEXT NOT NULL,
  certificate_file_url TEXT,
  grade_or_marks TEXT,
  is_revoked INTEGER DEFAULT 0,
  revoked_at TEXT,
  revocation_reason TEXT
);

-- Activity Logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  admin_id TEXT NOT NULL,
  admin_name TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  target_type TEXT NOT NULL,
  target_id TEXT
);

-- Unlock Overrides table
CREATE TABLE IF NOT EXISTS unlock_overrides (
  id TEXT PRIMARY KEY,
  learner_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  week_id TEXT NOT NULL,
  granted_by TEXT NOT NULL,
  granted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reason TEXT
);

-- Indexes for high performance
CREATE INDEX IF NOT EXISTS idx_submissions_learner ON task_submissions(learner_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_course ON learner_progress(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_certs_recipient ON certificates(recipient_id);
`;

export interface CloudflareDeploymentConfig {
  d1DatabaseName: string;
  d1Binding: string;
  workersRoute: string;
  pagesBranch: string;
  isLiveEdgeConnected: boolean;
}

export const CLOUDFLARE_CONFIG: CloudflareDeploymentConfig = {
  d1DatabaseName: 'problos-production-d1',
  d1Binding: 'DB',
  workersRoute: 'api.lms.problos.com/*',
  pagesBranch: 'main',
  isLiveEdgeConnected: false, // Transparent status indicator
};
