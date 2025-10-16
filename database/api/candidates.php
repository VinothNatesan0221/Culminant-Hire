<?php
require_once __DIR__ . '/config.php';

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');
/**
 * Candidates API for Recruitment Management System
 * Hostinger MySQL Backend
 */

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

class CandidatesAPI {
    private $db;
    
    public function __construct() {
        $database = new Database();
        $this->db = $database->connect();
    }
    
    public function getAllCandidates() {
        try {
            $stmt = $this->db->query("
                SELECT c.*, u1.name as recruiter_name, u2.name as am_name 
                FROM candidates c 
                LEFT JOIN users u1 ON c.recruiter_id = u1.id 
                LEFT JOIN users u2 ON c.am_id = u2.id 
                ORDER BY c.created_at DESC
            ");
            $candidates = $stmt->fetchAll();
            
            return ['success' => true, 'data' => $candidates];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        }
    }
    
    public function getCandidate($id) {
        try {
            $stmt = $this->db->prepare("
                SELECT c.*, u1.name as recruiter_name, u2.name as am_name 
                FROM candidates c 
                LEFT JOIN users u1 ON c.recruiter_id = u1.id 
                LEFT JOIN users u2 ON c.am_id = u2.id 
                WHERE c.id = ?
            ");
            $stmt->execute([$id]);
            $candidate = $stmt->fetch();
            
            if ($candidate) {
                return ['success' => true, 'data' => $candidate];
            } else {
                return ['success' => false, 'message' => 'Candidate not found'];
            }
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        }
    }
    
    public function createCandidate($data) {
        try {
            $stmt = $this->db->prepare("
                INSERT INTO candidates (
                    name, email, mobile, current_location, work_location, 
                    education, total_experience, relevant_experience, 
                    current_ctc, expected_ctc, notice_period, current_company, 
                    skill, source, status, status_details, remarks, 
                    recruiter_id, am_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $data['name'], $data['email'], $data['mobile'],
                $data['current_location'] ?? '', $data['work_location'] ?? '',
                $data['education'] ?? '', $data['total_experience'] ?? '',
                $data['relevant_experience'] ?? '', $data['current_ctc'] ?? '',
                $data['expected_ctc'] ?? '', $data['notice_period'] ?? '',
                $data['current_company'] ?? '', $data['skill'] ?? '',
                $data['source'] ?? '', $data['status'] ?? 'new',
                $data['status_details'] ?? '', $data['remarks'] ?? '',
                $data['recruiter_id'] ?? null, $data['am_id'] ?? null
            ]);
            
            $candidateId = $this->db->lastInsertId();
            
            return [
                'success' => true, 
                'message' => 'Candidate created successfully',
                'candidate_id' => $candidateId
            ];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        }
    }
    
    public function updateCandidate($id, $data) {
        try {
            $fields = [];
            $values = [];
            
            foreach ($data as $key => $value) {
                if ($key !== 'id') {
                    $fields[] = "$key = ?";
                    $values[] = $value;
                }
            }
            
            $values[] = $id;
            
            $stmt = $this->db->prepare("UPDATE candidates SET " . implode(', ', $fields) . " WHERE id = ?");
            $stmt->execute($values);
            
            return ['success' => true, 'message' => 'Candidate updated successfully'];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        }
    }
    
    public function deleteCandidate($id) {
        try {
            $stmt = $this->db->prepare("DELETE FROM candidates WHERE id = ?");
            $stmt->execute([$id]);
            
            return ['success' => true, 'message' => 'Candidate deleted successfully'];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        }
    }
    
    public function searchCandidates($query) {
        try {
            $searchTerm = "%$query%";
            $stmt = $this->db->prepare("
                SELECT c.*, u1.name as recruiter_name, u2.name as am_name 
                FROM candidates c 
                LEFT JOIN users u1 ON c.recruiter_id = u1.id 
                LEFT JOIN users u2 ON c.am_id = u2.id 
                WHERE c.name LIKE ? OR c.email LIKE ? OR c.skill LIKE ? OR c.current_company LIKE ?
                ORDER BY c.created_at DESC
            ");
            $stmt->execute([$searchTerm, $searchTerm, $searchTerm, $searchTerm]);
            $candidates = $stmt->fetchAll();
            
            return ['success' => true, 'data' => $candidates];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        }
    }
}

// Handle API requests
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

$candidatesAPI = new CandidatesAPI();

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            echo json_encode($candidatesAPI->getCandidate($_GET['id']));
        } elseif (isset($_GET['search'])) {
            echo json_encode($candidatesAPI->searchCandidates($_GET['search']));
        } else {
            echo json_encode($candidatesAPI->getAllCandidates());
        }
        break;
        
    case 'POST':
        echo json_encode($candidatesAPI->createCandidate($input));
        break;
        
    case 'PUT':
        $id = $input['id'] ?? null;
        if ($id) {
            echo json_encode($candidatesAPI->updateCandidate($id, $input));
        } else {
            echo json_encode(['success' => false, 'message' => 'ID required for update']);
        }
        break;
        
    case 'DELETE':
        $id = $input['id'] ?? $_GET['id'] ?? null;
        if ($id) {
            echo json_encode($candidatesAPI->deleteCandidate($id));
        } else {
            echo json_encode(['success' => false, 'message' => 'ID required for delete']);
        }
        break;
        
    default:
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>