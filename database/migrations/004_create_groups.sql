CREATE TABLE IF NOT EXISTS `groups` (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    host_user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    title VARCHAR(200) NOT NULL,
    destination VARCHAR(200),
    group_description TEXT, 
    date_start DATETIME, 
    date_end_at DATETIME,
    picture BLOB
);