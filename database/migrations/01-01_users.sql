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
  picture VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users(name_first, name_last, email, password_hash, country, gender, age, bio) VALUES
('John', 'Software', 'admin', '$2b$12$AkolFVdSCbw5hygxfGvCfe7UuRGt1rUQqtK2rlhkIXCx6./QrrfDe', 'DK', 'male', 25, 'I like to travel')