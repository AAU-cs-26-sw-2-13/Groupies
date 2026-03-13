CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name_first VARCHAR(50) NOT NULL,
  name_last VARCHAR(50) NOT NULL,
  email VARCHAR(50) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,  
  country VARCHAR(2),
  gender ENUM('male', 'female', 'undefined') NOT NULL DEFAULT 'undefined',
  age INT,
  bio TEXT,
  picture BLOB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);