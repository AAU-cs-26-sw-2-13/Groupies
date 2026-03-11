-- Ensure one row per (user_id, preference_id) before adding uniqueness.
DELETE up_old
FROM user_preferences up_old
JOIN user_preferences up_new
  ON up_old.user_id = up_new.user_id
 AND up_old.preference_id = up_new.preference_id
 AND up_old.id < up_new.id;

SET @has_unique_idx := (
  SELECT COUNT(1)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'user_preferences'
    AND index_name = 'uniq_user_preference'
);

SET @create_unique_sql := IF(
  @has_unique_idx = 0,
  'ALTER TABLE user_preferences ADD UNIQUE KEY uniq_user_preference (user_id, preference_id)',
  'SELECT 1'
);

PREPARE stmt FROM @create_unique_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
