CREATE TABLE IF NOT EXISTS group_activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  group_id INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  about TEXT,
  date_start_at DATETIME, 
  date_end_at DATETIME,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  FOREIGN KEY (group_id) REFERENCES `groups`(id) ON DELETE CASCADE
);