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

function sendResponse($success, $data = null, $message = '')
{
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
            $stmt = $pdo->query("SELECT * FROM interviews ORDER BY interview_date DESC, interview_time DESC");
            $interviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
            sendResponse(true, $interviews);
            break;

        case 'create':
            $candidateId = $input['candidateId'] ?? '';
            $candidateName = $input['candidateName'] ?? '';
            $jobCode = $input['jobCode'] ?? '';
            $client = $input['client'] ?? '';
            $interviewDate = $input['interviewDate'] ?? '';
            $interviewTime = $input['interviewTime'] ?? '';
            $interviewType = $input['interviewType'] ?? '';
            $interviewer = $input['interviewer'] ?? '';
            $candidateMobile = $input['candidateMobile'] ?? '';
            $candidateEmail = $input['candidateEmail'] ?? '';
            $status = $input['status'] ?? 'Scheduled';
            $notes = $input['notes'] ?? '';
            $scheduledBy = $input['scheduledBy'] ?? '';

            if (empty($candidateId) || empty($candidateName) || empty($jobCode) || empty($interviewDate)) {
                sendResponse(false, null, 'Candidate ID, name, job code, and interview date are required');
            }

            $stmt = $pdo->prepare("INSERT INTO interviews (candidate_id, candidate_name, job_code, client, interview_date, interview_time, interview_type, interviewer, candidate_mobile, candidate_email, status, notes, scheduled_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$candidateId, $candidateName, $jobCode, $client, $interviewDate, $interviewTime, $interviewType, $interviewer, $candidateMobile, $candidateEmail, $status, $notes, $scheduledBy]);

            $interviewId = $pdo->lastInsertId();
            $stmt = $pdo->prepare("SELECT * FROM interviews WHERE id = ?");
            $stmt->execute([$interviewId]);
            $interview = $stmt->fetch(PDO::FETCH_ASSOC);

            sendResponse(true, $interview, 'Interview scheduled successfully');
            break;

        case 'update':
            $id = $input['id'] ?? '';

            if (empty($id)) {
                sendResponse(false, null, 'Interview ID is required');
            }

            $updateFields = [];
            $params = [];

            $fields = ['candidateId' => 'candidate_id', 'candidateName' => 'candidate_name',
                      'jobCode' => 'job_code', 'client' => 'client', 'interviewDate' => 'interview_date',
                      'interviewTime' => 'interview_time', 'interviewType' => 'interview_type',
                      'interviewer' => 'interviewer', 'candidateMobile' => 'candidate_mobile',
                      'candidateEmail' => 'candidate_email', 'status' => 'status', 'notes' => 'notes'];

            foreach ($fields as $inputKey => $dbField) {
                if (isset($input[$inputKey]) && $input[$inputKey] !== '') {
                    $updateFields[] = "$dbField = ?";
                    $params[] = $input[$inputKey];
                }
            }

            if (empty($updateFields)) {
                sendResponse(false, null, 'No fields to update');
            }

            $params[] = $id;
            $sql = "UPDATE interviews SET " . implode(', ', $updateFields) . " WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);

            sendResponse(true, null, 'Interview updated successfully');
            break;

        case 'delete':
            $id = $input['id'] ?? '';

            if (empty($id)) {
                sendResponse(false, null, 'Interview ID is required');
            }

            $stmt = $pdo->prepare("DELETE FROM interviews WHERE id = ?");
            $stmt->execute([$id]);

            sendResponse(true, null, 'Interview deleted successfully');
            break;

        default:
            sendResponse(false, null, 'Invalid action');
    }

} catch (Exception $e) {
    sendResponse(false, null, 'Database error: ' . $e->getMessage());
}
