<?php

/**
 * Authentication API for Recruitment Management System
 * Hostinger MySQL Backend
 */

// Add CORS headers to allow cross-origin requests
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config.php';

class AuthAPI
{
    private $db;

    public function __construct()
    {
        $database = new Database();
        $this->db = $database->connect();
    }

    public function login($email, $password)
    {
        try {
            // Get user by email
            $stmt = $this->db->prepare("SELECT id, email, name, role, password_hash, is_active FROM users WHERE email = ? AND is_active = 1");
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            if (!$user) {
                return ['success' => false, 'message' => 'User not found'];
            }

            // For demo purposes, we'll use simple password comparison
            // In production, use password_verify() with hashed passwords
            if ($password === 'admin123' && $email === 'admin@admin.com') {
                // Get user permissions
                $permStmt = $this->db->prepare("SELECT permission FROM user_permissions WHERE user_id = ?");
                $permStmt->execute([$user['id']]);
                $permissions = $permStmt->fetchAll(PDO::FETCH_COLUMN);

                // Create session token (in production, use JWT)
                $token = bin2hex(random_bytes(32));

                return [
                    'success' => true,
                    'user' => [
                        'id' => $user['id'],
                        'email' => $user['email'],
                        'name' => $user['name'],
                        'role' => $user['role']
                    ],
                    'permissions' => $permissions,
                    'token' => $token
                ];
            } elseif ($password === 'password123') {
                // Default password for regular users
                $permStmt = $this->db->prepare("SELECT permission FROM user_permissions WHERE user_id = ?");
                $permStmt->execute([$user['id']]);
                $permissions = $permStmt->fetchAll(PDO::FETCH_COLUMN);

                $token = bin2hex(random_bytes(32));

                return [
                    'success' => true,
                    'user' => [
                        'id' => $user['id'],
                        'email' => $user['email'],
                        'name' => $user['name'],
                        'role' => $user['role']
                    ],
                    'permissions' => $permissions,
                    'token' => $token
                ];
            }

            return ['success' => false, 'message' => 'Invalid credentials'];

        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        }
    }

    public function register($email, $name, $password, $role = 'user')
    {
        try {
            // Check if user already exists
            $stmt = $this->db->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$email]);

            if ($stmt->fetch()) {
                return ['success' => false, 'message' => 'User already exists'];
            }

            // Hash password (for demo, we'll store plain text - use password_hash() in production)
            $password_hash = password_hash($password, PASSWORD_DEFAULT);

            // Insert new user
            $stmt = $this->db->prepare("INSERT INTO users (email, name, role, password_hash) VALUES (?, ?, ?, ?)");
            $stmt->execute([$email, $name, $role, $password_hash]);

            $userId = $this->db->lastInsertId();

            // Add default permissions based on role
            $defaultPermissions = $this->getDefaultPermissions($role);
            foreach ($defaultPermissions as $permission) {
                $permStmt = $this->db->prepare("INSERT INTO user_permissions (user_id, permission, granted_by) VALUES (?, ?, 1)");
                $permStmt->execute([$userId, $permission]);
            }

            return [
                'success' => true,
                'message' => 'User created successfully',
                'user_id' => $userId
            ];

        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        }
    }

    private function getDefaultPermissions($role)
    {
        switch ($role) {
            case 'admin':
                return ['dashboard', 'candidates', 'jobs', 'interviews', 'team', 'users', 'timetracking', 'reports', 'roles', 'announcements', 'emails'];
            case 'manager':
                return ['dashboard', 'candidates', 'jobs', 'interviews', 'team', 'timetracking', 'reports'];
            case 'recruiter':
                return ['dashboard', 'candidates', 'jobs', 'interviews', 'timetracking'];
            default:
                return ['dashboard', 'candidates', 'timetracking'];
        }
    }
}

// Handle API requests
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

$auth = new AuthAPI();

switch ($method) {
    case 'POST':
        $action = $input['action'] ?? '';

        switch ($action) {
            case 'login':
                $email = $input['email'] ?? '';
                $password = $input['password'] ?? '';
                echo json_encode($auth->login($email, $password));
                break;

            case 'register':
                $email = $input['email'] ?? '';
                $name = $input['name'] ?? '';
                $password = $input['password'] ?? '';
                $role = $input['role'] ?? 'user';
                echo json_encode($auth->register($email, $name, $password, $role));
                break;

            default:
                echo json_encode(['success' => false, 'message' => 'Invalid action']);
        }
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
