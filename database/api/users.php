<?php
require_once __DIR__ . '/config.php';

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');
// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/config.php';

function sendResponse($success, $data = null, $message = '') {
    echo json_encode([
        'success' => $success,
        'data' => $data,
        'message' => $message
    ]);
    exit;
}

function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? $_GET['action'] ?? '';

    switch ($action) {
        case 'getAll':
            $stmt = $pdo->query("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC");
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            sendResponse(true, $users);
            break;

        case 'create':
            $name = $input['name'] ?? '';
            $email = $input['email'] ?? '';
            $password = $input['password'] ?? '';
            $role = $input['role'] ?? 'recruiter';

            if (empty($name) || empty($email) || empty($password)) {
                sendResponse(false, null, 'Name, email, and password are required');
            }

            // Check if email already exists
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                sendResponse(false, null, 'Email already exists');
            }

            // Create user
            $hashedPassword = hashPassword($password);
            $stmt = $pdo->prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)");
            $stmt->execute([$name, $email, $hashedPassword, $role]);

            $userId = $pdo->lastInsertId();
            $stmt = $pdo->prepare("SELECT id, name, email, role, created_at FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            sendResponse(true, $user, 'User created successfully');
            break;

        case 'update':
            $id = $input['id'] ?? '';
            $name = $input['name'] ?? '';
            $email = $input['email'] ?? '';
            $password = $input['password'] ?? '';
            $role = $input['role'] ?? '';

            if (empty($id)) {
                sendResponse(false, null, 'User ID is required');
            }

            $updateFields = [];
            $params = [];

            if (!empty($name)) {
                $updateFields[] = "name = ?";
                $params[] = $name;
            }
            if (!empty($email)) {
                $updateFields[] = "email = ?";
                $params[] = $email;
            }
            if (!empty($password)) {
                $updateFields[] = "password_hash = ?";
                $params[] = hashPassword($password);
            }
            if (!empty($role)) {
                $updateFields[] = "role = ?";
                $params[] = $role;
            }

            if (empty($updateFields)) {
                sendResponse(false, null, 'No fields to update');
            }

            $params[] = $id;
            $sql = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);

            sendResponse(true, null, 'User updated successfully');
            break;

        case 'delete':
            $id = $input['id'] ?? '';

            if (empty($id)) {
                sendResponse(false, null, 'User ID is required');
            }

            $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$id]);

            sendResponse(true, null, 'User deleted successfully');
            break;

        default:
            sendResponse(false, null, 'Invalid action');
    }

} catch (Exception $e) {
    sendResponse(false, null, 'Database error: ' . $e->getMessage());
}
?>