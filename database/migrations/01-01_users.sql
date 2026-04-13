CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name_first VARCHAR(50) NOT NULL,
  name_last VARCHAR(50) NOT NULL,
  email VARCHAR(50) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,  
  country VARCHAR(2),
  gender ENUM('male', 'female', 'other','undefined') NOT NULL DEFAULT 'undefined',
  dob DATE,
  bio TEXT,
  picture VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users(name_first, name_last, email, password_hash, country, gender, dob, bio, picture) VALUES
('John', 'Software', 'admin', '$2b$12$AkolFVdSCbw5hygxfGvCfe7UuRGt1rUQqtK2rlhkIXCx6./QrrfDe', 'DK', 'male', '2003-04-20', 'I like to travel', "\\images\\profilePictures\\johnSoftware.webp");

INSERT INTO users(name_first, name_last, email, password_hash, country, gender, dob, bio, picture) VALUES
('Bob', 'Software', 'admin2', '$2b$12$AkolFVdSCbw5hygxfGvCfe7UuRGt1rUQqtK2rlhkIXCx6./QrrfDe', 'DK', 'male', '1999-06-07', 'I like to travel', "\\images\\profilePictures\\johnSoftware.webp")