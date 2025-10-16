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
            $stmt = $pdo->query("SELECT * FROM jobs ORDER BY created_at DESC");
            $jobs = $stmt->fetchAll(PDO::FETCH_ASSOC);
            sendResponse(true, $jobs);
            break;

        case 'create':
            $jobCode = $input['jobCode'] ?? '';
            $client = $input['client'] ?? '';
            $skill = $input['skill'] ?? '';
            $workLocation = $input['workLocation'] ?? '';
            $openPosition = $input['openPosition'] ?? 1;
            $teamLead = $input['teamLead'] ?? '';
            $principleConsultant = $input['principleConsultant'] ?? '';
            $budget = $input['budget'] ?? '';
            $createdBy = $input['createdBy'] ?? '';

            if (empty($jobCode) || empty($client) || empty($skill)) {
                sendResponse(false, null, 'Job code, client, and skill are required');
            }

            $stmt = $pdo->prepare("INSERT INTO jobs (job_code, client, skill, work_location, open_position, team_lead, principle_consultant, budget, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$jobCode, $client, $skill, $workLocation, $openPosition, $teamLead, $principleConsultant, $budget, $createdBy]);

            $jobId = $pdo->lastInsertId();
            $stmt = $pdo->prepare("SELECT * FROM jobs WHERE id = ?");
            $stmt->execute([$jobId]);
            $job = $stmt->fetch(PDO::FETCH_ASSOC);

            sendResponse(true, $job, 'Job created successfully');
            break;

        case 'update':
            $id = $input['id'] ?? '';

            if (empty($id)) {
                sendResponse(false, null, 'Job ID is required');
            }

            $updateFields = [];
            $params = [];

            $fields = ['jobCode' => 'job_code', 'client' => 'client', 'skill' => 'skill',
                      'workLocation' => 'work_location', 'openPosition' => 'open_position',
                      'teamLead' => 'team_lead', 'principleConsultant' => 'principle_consultant',
                      'budget' => 'budget'];

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
            $sql = "UPDATE jobs SET " . implode(', ', $updateFields) . " WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);

            sendResponse(true, null, 'Job updated successfully');
            break;

        case 'delete':
            $id = $input['id'] ?? '';

            if (empty($id)) {
                sendResponse(false, null, 'Job ID is required');
            }

            $stmt = $pdo->prepare("DELETE FROM jobs WHERE id = ?");
            $stmt->execute([$id]);

            sendResponse(true, null, 'Job deleted successfully');
            break;

        default:
            sendResponse(false, null, 'Invalid action');
    }

} catch (Exception $e) {
    sendResponse(false, null, 'Database error: ' . $e->getMessage());
}
