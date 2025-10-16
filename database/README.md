Hostinger MySQL Database Setup Guide
Recruitment Management System
This directory contains all the necessary files to set up your recruitment management system with Hostinger MySQL database.

📁 Files Overview
1. schema.sql
Complete database schema with all tables:

users - User accounts and authentication
jobs - Job postings and requirements
candidates - Candidate information and profiles
job_applications - Links candidates to jobs
interviews - Interview scheduling and feedback
team_members - Team management
time_entries - Time tracking system
email_logs - Email notification logs
announcements - System announcements
user_permissions - Role-based access control
2. config.php
Database connection configuration for Hostinger MySQL

3. api/auth.php
Authentication API endpoints:

Login functionality
User registration
Permission management
4. api/candidates.php
Candidates management API:

CRUD operations for candidates
Search functionality
Advanced filtering
🚀 Hostinger Setup Instructions
Step 1: Access Hostinger Control Panel
Login to your Hostinger account
Go to Hosting → Manage
Navigate to Databases → MySQL Databases
Step 2: Create Database
Click Create Database
Enter database name: recruitment_system
Create a database user with full privileges
Note down:
Database name
Username
Password
Host (usually localhost)
Step 3: Import Database Schema
Go to phpMyAdmin in your Hostinger control panel
Select your database
Click Import tab
Upload the schema.sql file
Click Go to execute
Step 4: Configure Database Connection
Open config.php
Update the following constants:
define('DB_HOST', 'localhost'); // Your MySQL host
define('DB_NAME', 'your_database_name'); // Your database name
define('DB_USER', 'your_username'); // Your MySQL username
define('DB_PASS', 'your_password'); // Your MySQL password
Step 5: Upload Files to Hostinger
Access File Manager in Hostinger control panel
Navigate to public_html directory
Create a folder named api
Upload all files:
config.php → public_html/api/
auth.php → public_html/api/
candidates.php → public_html/api/
Step 6: Test Connection
Create a test file test.php:
<?php
require_once 'api/config.php';
testConnection();
?>
Visit https://yourdomain.com/test.php
You should see: “✅ Database connection successful!”
🔧 API Endpoints
Authentication
POST /api/auth.php - Login/Register
{
  "action": "login",
  "email": "admin@admin.com",
  "password": "admin123"
}
Candidates
GET /api/candidates.php - Get all candidates
GET /api/candidates.php?id=1 - Get specific candidate
POST /api/candidates.php - Create candidate
PUT /api/candidates.php - Update candidate
DELETE /api/candidates.php - Delete candidate
🔑 Default Login Credentials
Admin: admin@admin.com / admin123
Regular Users: Use password123 for any created users
📝 Frontend Integration
Update your React app’s API calls to point to your Hostinger domain:

const API_BASE_URL = 'https://yourdomain.com/api';

// Example login function
const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'login',
      email,
      password
    })
  });
  return response.json();
};
🛡️ Security Considerations
Change default passwords immediately after setup
Use HTTPS for all API communications
Implement proper password hashing (update auth.php)
Add rate limiting for API endpoints
Validate and sanitize all input data
Use environment variables for sensitive configuration
📊 Database Backup
Regular backup is recommended:

Go to phpMyAdmin
Select your database
Click Export
Choose Quick export method
Download the SQL file
🆘 Troubleshooting
Connection Issues
Verify database credentials in config.php
Check if database user has proper privileges
Ensure database exists and is accessible
API Errors
Check PHP error logs in Hostinger control panel
Verify file permissions (644 for PHP files)
Test individual endpoints with tools like Postman
CORS Issues
Headers are already configured in API files
If issues persist, contact Hostinger support
📞 Support
For Hostinger-specific issues:

Check Hostinger Knowledge Base
Contact Hostinger Support
Use Hostinger Community Forums
Your recruitment management system is now ready for production deployment on Hostinger! 🎉