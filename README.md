Recruitment Management System
A comprehensive recruitment management system built with React, TypeScript, and Tailwind CSS. This system includes candidate management, job posting, interview scheduling, team management, time tracking, and email notifications.

🚀 Features
Dashboard: Live metrics and analytics
Candidate Management: Add, edit, and track candidates through the recruitment pipeline
Job Management: Create and manage job postings with detailed requirements
Interview Management: Schedule interviews with L1/L2 rounds and status tracking
Team Management: Manage team members and their targets
Time Tracking: Employee clock-in/out system with reporting
Email Notifications: Automated emails for all recruitment workflow changes
User Management: Role-based access control (Admin, Manager, Recruiter)
Export Features: Export data to CSV/Excel formats
🛠️ Technology Stack
Frontend: React 18, TypeScript, Vite
UI Components: Shadcn/ui, Tailwind CSS
Icons: Lucide React
Notifications: Sonner
State Management: React Hooks, Context API
Data Storage: localStorage (for demo), MySQL (for production)
Authentication: Custom JWT-based auth system
📁 Project Structure
src/
├── components/           # React components
│   ├── ui/              # Shadcn/ui components
│   ├── CandidateManagement.tsx
│   ├── JobManagement.tsx
│   ├── InterviewManagement.tsx
│   ├── TeamManagement.tsx
│   ├── TimeTracking.tsx
│   ├── UserManagement.tsx
│   ├── EmailLogsManagement.tsx
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── Navbar.tsx
│   └── Sidebar.tsx
├── contexts/            # React contexts
│   └── AuthContext.tsx
├── hooks/              # Custom hooks
│   └── useEmailNotifications.ts
├── utils/              # Utility functions
│   └── emailService.ts
├── pages/              # Page components
│   ├── Index.tsx
│   └── NotFound.tsx
└── lib/                # Library configurations
    └── utils.ts
🚀 Deployment to Hostinger with MySQL
Prerequisites
Hostinger hosting account with cPanel access
MySQL database access
Visual Studio Code
Node.js 18+ installed locally
Git installed
Step 1: Prepare Your Local Environment
Clone/Download the project (if not already done):

# If using Git
git clone <your-repo-url>
cd recruitment-management-system

# Or download and extract the ZIP file
Install dependencies:

npm install
# or
pnpm install
Build the project:

npm run build
# or
pnpm run build
Step 2: Set Up MySQL Database on Hostinger
Access cPanel:

Log into your Hostinger account
Go to cPanel dashboard
Create MySQL Database:

Find “MySQL Databases” in cPanel
Create a new database (e.g., recruitment_db)
Create a database user with full privileges
Note down: database name, username, password, and host
Create Database Tables:

-- Users table
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'recruiter') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jobs table
CREATE TABLE jobs (
  id VARCHAR(36) PRIMARY KEY,
  requirement_shared_date DATE,
  job_code VARCHAR(100) UNIQUE NOT NULL,
  client VARCHAR(255) NOT NULL,
  skill_type VARCHAR(100),
  skill VARCHAR(255) NOT NULL,
  client_spoc VARCHAR(255),
  budget VARCHAR(100),
  culminant_spoc VARCHAR(255),
  team_lead VARCHAR(255),
  principle_consultant VARCHAR(255),
  week_day_week_end VARCHAR(100),
  work_location VARCHAR(255),
  open_position INT,
  status VARCHAR(50) DEFAULT 'Open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Candidates table
CREATE TABLE candidates (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  mobile VARCHAR(20),
  job_code VARCHAR(100),
  client VARCHAR(255),
  location VARCHAR(255),
  skill VARCHAR(255),
  experience VARCHAR(100),
  current_ctc VARCHAR(100),
  expected_ctc VARCHAR(100),
  notice_period VARCHAR(100),
  recruiter VARCHAR(255),
  status VARCHAR(100) DEFAULT 'New',
  status1 VARCHAR(100),
  date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_code) REFERENCES jobs(job_code)
);

-- Interviews table
CREATE TABLE interviews (
  id VARCHAR(36) PRIMARY KEY,
  candidate_id VARCHAR(36),
  candidate_name VARCHAR(255),
  candidate_email VARCHAR(255),
  candidate_mobile VARCHAR(20),
  job_code VARCHAR(100),
  client VARCHAR(255),
  location VARCHAR(255),
  skill VARCHAR(255),
  interview_date DATE,
  interview_time TIME,
  interview_type ENUM('Phone', 'Video', 'In-Person'),
  interviewer VARCHAR(255),
  status ENUM('Scheduled', 'L1 Scheduled', 'L2 Scheduled', 'Shortlisted', 'Completed', 'Cancelled', 'Rescheduled'),
  notes TEXT,
  recruiter VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id)
);

-- Team Members table
CREATE TABLE team_members (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  mobile VARCHAR(20),
  role VARCHAR(100),
  joining_date DATE,
  target_this_month INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Time Entries table
CREATE TABLE time_entries (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  user_name VARCHAR(255),
  clock_in_time TIMESTAMP,
  clock_out_time TIMESTAMP NULL,
  date DATE,
  total_hours DECIMAL(5,2) NULL,
  status ENUM('clocked-in', 'clocked-out'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Email Logs table
CREATE TABLE email_logs (
  id VARCHAR(36) PRIMARY KEY,
  recipients JSON,
  subject VARCHAR(500),
  body TEXT,
  status VARCHAR(50) DEFAULT 'sent',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT INTO users (id, name, email, password, role) VALUES 
('admin-001', 'Admin User', 'admin@company.com', '$2b$10$hash_here', 'admin');
Step 3: Create Backend API (PHP)
Create API folder structure in your project:

api/
├── config/
│   └── database.php
├── models/
│   ├── User.php
│   ├── Job.php
│   ├── Candidate.php
│   └── Interview.php
├── controllers/
│   ├── AuthController.php
│   ├── JobController.php
│   ├── CandidateController.php
│   └── InterviewController.php
└── index.php
Create database configuration (api/config/database.php):

<?php
class Database {
    private $host = "localhost"; // Hostinger MySQL host
    private $db_name = "your_database_name";
    private $username = "your_db_username";
    private $password = "your_db_password";
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->exec("set names utf8");
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }
        return $this->conn;
    }
}
?>
Create main API router (api/index.php):

<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

require_once 'config/database.php';
require_once 'controllers/AuthController.php';
require_once 'controllers/JobController.php';
require_once 'controllers/CandidateController.php';
require_once 'controllers/InterviewController.php';

$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$path_segments = explode('/', trim($path, '/'));

$database = new Database();
$db = $database->getConnection();

// Route handling
switch($path_segments[1]) {
    case 'auth':
        $controller = new AuthController($db);
        break;
    case 'jobs':
        $controller = new JobController($db);
        break;
    case 'candidates':
        $controller = new CandidateController($db);
        break;
    case 'interviews':
        $controller = new InterviewController($db);
        break;
    default:
        http_response_code(404);
        echo json_encode(['message' => 'Endpoint not found']);
        exit;
}

$controller->handleRequest();
?>
Step 4: Update Frontend for Production
Create environment configuration (src/config/api.ts):

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-domain.com/api' 
  : 'http://localhost/api';

export const API_ENDPOINTS = {
  AUTH: `${API_BASE_URL}/auth`,
  JOBS: `${API_BASE_URL}/jobs`,
  CANDIDATES: `${API_BASE_URL}/candidates`,
  INTERVIEWS: `${API_BASE_URL}/interviews`,
  TEAM: `${API_BASE_URL}/team`,
  TIME_TRACKING: `${API_BASE_URL}/time-tracking`,
  EMAIL_LOGS: `${API_BASE_URL}/email-logs`
};
Update data services to use API instead of localStorage:

// src/services/apiService.ts
import { API_ENDPOINTS } from '../config/api';

class ApiService {
  async get(endpoint: string) {
    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.json();
  }

  async post(endpoint: string, data: any) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  // Add PUT, DELETE methods as needed
}

export const apiService = new ApiService();
Step 5: Deploy to Hostinger
Prepare files for upload:

# Build the React app
npm run build

# Your files should be organized as:
# dist/ (React build files)
# api/ (PHP backend files)
Upload via cPanel File Manager:

Go to cPanel → File Manager
Navigate to public_html/your-subdomain/ (or main domain folder)
Upload the dist folder contents to the root
Upload the api folder to the root
Set proper permissions (755 for folders, 644 for files)
Alternative: Upload via FTP/SFTP:

# Using FileZilla or similar FTP client
# Connect to your Hostinger FTP
# Upload dist/ contents to public_html/
# Upload api/ folder to public_html/api/
Step 6: Configure Hostinger Settings
Set up subdomain (if using subdomain):

Go to cPanel → Subdomains
Create subdomain (e.g., recruitment.yourdomain.com)
Point to the correct folder
Configure .htaccess for React Router:

# Create .htaccess in your domain root
RewriteEngine On
RewriteBase /

# Handle Angular/React Router
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# API routes
RewriteRule ^api/(.*)$ api/index.php [QSA,L]
Update database credentials:

Edit api/config/database.php
Use your Hostinger MySQL credentials
Step 7: Test Your Deployment
Test the website:

Visit your domain/subdomain
Check if the login page loads
Test user authentication
Test API endpoints:

Check browser network tab for API calls
Verify database connections
Test CRUD operations
Common issues and fixes:

CORS errors: Ensure proper headers in PHP
404 errors: Check .htaccess configuration
Database connection: Verify MySQL credentials
File permissions: Set correct chmod permissions
Step 8: Set Up Email Notifications (Optional)
Configure SMTP in Hostinger:

Use Hostinger’s SMTP settings
Update email service to use real SMTP instead of simulation
Update email configuration:

// In your email service
$mail = new PHPMailer(true);
$mail->isSMTP();
$mail->Host = 'smtp.hostinger.com';
$mail->SMTPAuth = true;
$mail->Username = 'your-email@yourdomain.com';
$mail->Password = 'your-email-password';
$mail->SMTPSecure = 'tls';
$mail->Port = 587;
🔧 Development Setup
For local development:

Install dependencies:

npm install
Start development server:

npm run dev
Build for production:

npm run build
📝 Default Login Credentials
Admin: admin@company.com / admin123
Manager: manager@company.com / manager123
Recruiter: recruiter@company.com / recruiter123
🐛 Troubleshooting
Common Issues:
Build errors: Check Node.js version (18+)
Database connection: Verify MySQL credentials
CORS issues: Check API headers
File upload issues: Check folder permissions
Email not working: Verify SMTP settings
Debug Steps:
Check browser console for JavaScript errors
Check network tab for failed API calls
Check server error logs in cPanel
Verify database table structure
Test API endpoints directly
📞 Support
For deployment issues:

Check Hostinger documentation
Contact Hostinger support for server-related issues
Review error logs in cPanel
🔄 Updates and Maintenance
Regular backups: Backup database and files regularly
Security updates: Keep dependencies updated
Performance monitoring: Monitor server performance
SSL certificate: Ensure HTTPS is enabled
Note: This system is designed for small to medium-scale recruitment operations. For enterprise use, consider additional security measures, caching, and performance optimizations.

