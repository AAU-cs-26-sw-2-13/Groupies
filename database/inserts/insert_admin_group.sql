-- Delete existing
DELETE FROM `group_relations` WHERE id = 999 OR id = 1001 OR id = 1002 OR id = 1003;
DELETE FROM `group_activities` WHERE id = 1;
DELETE FROM `groups` WHERE id = 142; 

-- 1. Insert into groups
INSERT INTO `groups` (
    id, host_user_id, created_at, title, destination, 
    about, date_start_at, date_end_at, picture, 
    max_members, group_openess
) VALUES (
    142, 1, '2026-04-10 16:19:33', 'John and Bobs trip to Madrid', 'Madrid', 
    '', '2026-04-11 00:00:00', '2026-04-17 00:00:00', '/images/groupPictures/GettyImages-1588291549.webp', 
    8, b'1'
);

-- 2. Insert into group_relations
INSERT INTO `group_relations` (
    id, user_id, group_id, follower, member, organizer, member_at
) VALUES 
(1003, 6, 142, b'1', b'1', b'0', NULL),
(1002, 5, 142, b'1', b'1', b'0', NULL),
(1001, 2, 142, b'1', b'1', b'0', NULL),
(999, 1, 142, b'1', b'1', b'1', NULL);

-- 3. Insert into group_activities
INSERT INTO `group_activities` (
    id, user_id, group_id, title, about, date_start_at, date_end_at
) VALUES (
    1, 889, 142, 'ultra', 
    'curto vereor asperiores demulceo tardus summa toties asperiores varietas strenuus aurum auctor tertius repellendus vita sit speciosus', 
    '2027-02-14 10:00:00', '2027-02-14 12:00:00'
);

-- 4 Insert into group_tags
INSERT INTO `group_tags` (
    group_id, tag_id, tag_value
) VALUES 
(142, "skiing", b'1'),
(142, "hiking", b'1')