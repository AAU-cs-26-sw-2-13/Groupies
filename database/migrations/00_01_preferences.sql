CREATE TABLE IF NOT EXISTS preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    preference_id VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO preferences(preference_id)
VALUES ('Skiing'), ('Hiking'), ('Sightseeing'), ('Nightlife'), ('Beaches');