CREATE TABLE IF NOT EXISTS `groups` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    host_user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    title VARCHAR(100) NOT NULL,
    destination VARCHAR(200),
    about TEXT, 
    date_start_at DATETIME, 
    date_end_at DATETIME,
    picture BLOB
);