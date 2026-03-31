CREATE TABLE IF NOT EXISTS user_prefs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  preference_id VARCHAR(50) NOT NULL,
  preference_value BIT NOT NULL DEFAULT 1,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (preference_id) REFERENCES preferences(preference_id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_pref (user_id, preference_id)
);