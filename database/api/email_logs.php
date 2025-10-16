<?php
require_once __DIR__ . '/config.php';

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
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

try {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? $_GET['action'] ?? '';

    switch ($action) {
        case 'getAll':
            $stmt = $pdo->query("SELECT * FROM email_logs ORDER BY sent_at DESC");
            $emailLogs = $stmt->fetchAll(PDO::FETCH_ASSOC);
            sendResponse(true, $emailLogs);
            break;

        case 'create':
            $recipientEmail = $input['recipientEmail'] ?? '';
            $recipientName = $input['recipientName'] ?? '';
            $subject = $input['subject'] ?? '';
            $message = $input['message'] ?? '';
            $status = $input['status'] ?? 'sent';
            $sentBy = $input['sentBy'] ?? '';

            if (empty($recipientEmail) || empty($subject)) {
                sendResponse(false, null, 'Recipient email and subject are required');
            }

            $stmt = $pdo->prepare("INSERT INTO email_logs (recipient_email, recipient_name, subject, message, status, sent_by) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$recipientEmail, $recipientName, $subject, $message, $status, $sentBy]);

            $logId = $pdo->lastInsertId();
            $stmt = $pdo->prepare("SELECT * FROM email_logs WHERE id = ?");
            $stmt->execute([$logId]);
            $emailLog = $stmt->fetch(PDO::FETCH_ASSOC);

            sendResponse(true, $emailLog, 'Email log created successfully');
            break;

        default:
            sendResponse(false, null, 'Invalid action');
    }

} catch (Exception $e) {
    sendResponse(false, null, 'Database error: ' . $e->getMessage());
}
?>