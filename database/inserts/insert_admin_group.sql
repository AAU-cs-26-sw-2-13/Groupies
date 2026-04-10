-- Delete existing
DELETE FROM `group_activities` WHERE id = 1;
DELETE FROM `groups` WHERE id = 142; 

-- 1. Insert into groups
INSERT INTO `groups` (
    id, host_user_id, created_at, title, destination, 
    about, date_start_at, date_end_at, picture, 
    max_members, group_openess
) VALUES (
    142, 1, '2026-04-10 16:19:33', 'John and Bobs trip to Madrid', 'Madrid', 
    '', '2026-04-11 00:00:00', '2026-04-17 00:00:00', '../img/a39d59c0-83f8-439a-b872-cd9e2a2656b2.jpg', 
    8, b'1'
);

-- 2. Insert into group_relations
INSERT INTO `group_relations` (
    id, user_id, group_id, follower, member, organizer, member_at
) VALUES 
(765, 5, 142, b'1', b'1', b'0', NULL),
(764, 4, 142, b'1', b'1', b'0', NULL),
(763, 3, 142, b'1', b'1', b'0', NULL),
(761, 2, 142, b'1', b'1', b'0', NULL),
(760, 1, 142, b'1', b'1', b'1', NULL);

-- 3. Insert into group_activities
INSERT INTO `group_activities` (
    id, user_id, group_id, title, about, date_start_at, date_end_at
) VALUES (
    1, 889, 142, 'ultra', 
    'curto vereor asperiores demulceo tardus summa toties asperiores varietas strenuus aurum auctor tertius repellendus vita sit speciosus', 
    '2027-02-14 10:00:00', '2027-02-14 12:00:00'
);