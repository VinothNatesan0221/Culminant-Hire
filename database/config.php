<?php
/**
 * Database Configuration for Hostinger MySQL
 * Recruitment Management System
 */

// Database configuration
define('DB_HOST', 'localhost'); // Usually 'localhost' for Hostinger
define('DB_NAME', 'u157741827_ats'); // Replace with your actual database name
define('DB_USER', 'u157741827_ats_user'); // Replace with your MySQL username
define('DB_PASS', 'CuLmInAnT@123'); // Replace with your MySQL password
define('DB_CHARSET', 'utf8mb4');

// Database connection class
class Database {
    private $host = DB_HOST;
    private $db_name = DB_NAME;
    private $username = DB_USER;
    private $password = DB_PASS;
    private $charset = DB_CHARSET;
    private $pdo;

    public function connect() {
        $this->pdo = null;
        
        try {
            $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=" . $this->charset;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            
            $this->pdo = new PDO($dsn, $this->username, $this->password, $options);
            
        } catch(PDOException $e) {
            echo "Connection Error: " . $e->getMessage();
        }
        
        return $this->pdo;
    }
}

// Create global database connection
$database = new Database();
$pdo = $database->connect();

// Test connection function
function testConnection() {
    $database = new Database();
    $db = $database->connect();
    
    if ($db) {
        echo "✅ Database connection successful!<br>";
        
        // Test query
        try {
            $stmt = $db->query("SELECT COUNT(*) as user_count FROM users");
            $result = $stmt->fetch();
            echo "✅ Users table accessible. Current user count: " . $result['user_count'] . "<br>";
        } catch (PDOException $e) {
            echo "❌ Error accessing users table: " . $e->getMessage() . "<br>";
        }
    } else {
        echo "❌ Database connection failed!<br>";
    }
}

// Uncomment the line below to test connection
// testConnection();
?>