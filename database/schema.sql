-- Recruitment Management System Database Schema for Hostinger MySQL
-- Created for production deployment

-- Create database (uncomment if needed)
-- CREATE DATABASE IF NOT EXISTS recruitment_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE recruitment_system;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'recruiter', 'manager', 'user') DEFAULT 'user',
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    client VARCHAR(255) NOT NULL,
    client_spoc VARCHAR(255),
    work_location VARCHAR(255),
    skill VARCHAR(500),
    job_category VARCHAR(100),
    description TEXT,
    requirements TEXT,
    salary_range VARCHAR(100),
    status ENUM('active', 'inactive', 'closed') DEFAULT 'active',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_job_code (job_code),
    INDEX idx_status (status),
    INDEX idx_client (client)
);

-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    current_location VARCHAR(255),
    work_location VARCHAR(255),
    education VARCHAR(500),
    total_experience VARCHAR(20),
    relevant_experience VARCHAR(20),
    current_ctc VARCHAR(50),
    expected_ctc VARCHAR(50),
    notice_period VARCHAR(50),
    current_company VARCHAR(255),
    skill VARCHAR(500),
    source VARCHAR(100),
    status ENUM('new', 'processed', 'not_interested', 'no_response', 'selected', 'rejected') DEFAULT 'new',
    status_details VARCHAR(255),
    remarks TEXT,
    resume_path VARCHAR(500),
    recruiter_id INT,
    am_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (recruiter_id) REFERENCES users(id),
    FOREIGN KEY (am_id) REFERENCES users(id),
    INDEX idx_email (email),
    INDEX idx_mobile (mobile),
    INDEX idx_status (status),
    INDEX idx_recruiter (recruiter_id)
);

-- Job Applications table (linking candidates to jobs)
CREATE TABLE IF NOT EXISTS job_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    candidate_id INT NOT NULL,
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('applied', 'screening', 'interview', 'selected', 'rejected', 'on_hold') DEFAULT 'applied',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    UNIQUE KEY unique_application (job_id, candidate_id),
    INDEX idx_job_candidate (job_id, candidate_id),
    INDEX idx_status (status)
);

-- Interviews table
CREATE TABLE IF NOT EXISTS interviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    candidate_name VARCHAR(255) NOT NULL,
    interviewer VARCHAR(255) NOT NULL,
    interview_date DATETIME NOT NULL,
    interview_type ENUM('phone', 'video', 'in_person', 'technical', 'hr') DEFAULT 'video',
    status ENUM('scheduled', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
    feedback TEXT,
    rating INT CHECK (rating >= 1 AND rating <= 10),
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES job_applications(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_interview_date (interview_date),
    INDEX idx_status (status),
    INDEX idx_candidate (candidate_name)
);

-- Team Members table
CREATE TABLE IF NOT EXISTS team_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100),
    hire_date DATE,
    target_this_month INT DEFAULT 0,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_status (status),
    INDEX idx_role (role)
);

-- Time Tracking table
CREATE TABLE IF NOT EXISTS time_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    clock_in_time DATETIME,
    clock_out_time DATETIME,
    total_hours DECIMAL(4,2) DEFAULT 0,
    status ENUM('clocked_in', 'clocked_out') DEFAULT 'clocked_in',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_user_date (user_id, date),
    INDEX idx_date (date),
    INDEX idx_user_date (user_id, date)
);

-- Email Logs table
CREATE TABLE IF NOT EXISTS email_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('sent', 'failed', 'pending') DEFAULT 'pending',
    sent_by INT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT,
    FOREIGN KEY (sent_by) REFERENCES users(id),
    INDEX idx_recipient (recipient_email),
    INDEX idx_status (status),
    INDEX idx_sent_at (sent_at)
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type ENUM('general', 'urgent', 'celebration', 'policy') DEFAULT 'general',
    target_audience ENUM('all', 'recruiters', 'managers', 'admins') DEFAULT 'all',
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_type (type),
    INDEX idx_active (is_active),
    INDEX idx_created_at (created_at)
);

-- User Roles and Permissions table
CREATE TABLE IF NOT EXISTS user_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    permission VARCHAR(100) NOT NULL,
    granted_by INT,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES users(id),
    UNIQUE KEY unique_user_permission (user_id, permission),
    INDEX idx_user_permission (user_id, permission)
);

-- Insert default admin user
INSERT INTO users (email, name, role, password_hash) VALUES 
('admin@admin.com', 'Admin User', 'admin', '$2b$10$rQZ8kHp0rQZ8kHp0rQZ8kOqGqGqGqGqGqGqGqGqGqGqGqGqGqGqGq')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insert sample job categories and default data
INSERT INTO jobs (job_code, title, client, work_location, skill, job_category, status, created_by) VALUES
('KAPR25-009', 'Network Engineer', 'HCL', 'Noida/Bangalore', 'Network, Cisco, CCNA', 'Network Engineering', 'active', 1),
('KAPR25-010', 'Java Developer', 'TCS', 'Hyderabad', 'Java, Spring Boot, Microservices', 'Software Development', 'active', 1),
('KAPR25-011', 'Data Scientist', 'Infosys', 'Pune', 'Python, Machine Learning, SQL', 'Data Science', 'active', 1)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- Insert default permissions for admin
INSERT INTO user_permissions (user_id, permission, granted_by) VALUES
(1, 'dashboard', 1),
(1, 'candidates', 1),
(1, 'jobs', 1),
(1, 'interviews', 1),
(1, 'team', 1),
(1, 'users', 1),
(1, 'timetracking', 1),
(1, 'reports', 1),
(1, 'roles', 1),
(1, 'announcements', 1),
(1, 'emails', 1)
ON DUPLICATE KEY UPDATE permission = VALUES(permission);