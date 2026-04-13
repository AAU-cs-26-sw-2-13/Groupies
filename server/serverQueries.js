import { query } from "../database/pool.js";
import { pool } from "../database/pool.js";
//Constants
const pagesLoaded = 10;


const sqlGetPopularGroups = `
SELECT 	grp.id,
		grp.host_user_id,
        grp.about,
        grp.max_members,
        grp.date_start_at,
        grp.date_end_at,
        grp.title,
        grp.destination,
        grp.picture,
        concat(u.name_first, " ", u.name_last) AS host_name,
        json_arrayagg(gt.tag_id) AS tags,
        (SELECT COUNT(id) FROM group_relations WHERE group_id = grp.id AND follower = 1) AS followers,
        (SELECT COUNT(id) FROM \`groups\`) AS total_groups
FROM\`groups\` AS grp
LEFT JOIN users AS u 
	ON grp.host_user_id = u.id
LEFT JOIN group_tags AS gt 
	ON grp.id = gt.group_id
GROUP BY grp.id
ORDER BY followers DESC
LIMIT ?, 10;
`


const sqlGetPopularUsers = `
SELECT 
    u.id,
    u.name_first,
    u.name_last,
    u.country,
    u.gender,
    u.age,
    u.picture,
    JSON_ARRAYAGG(p.preference_id) AS preferences,
    (SELECT COUNT(id) FROM user_relations WHERE target_user_id = u.id) AS followers
FROM users u
LEFT JOIN user_prefs p 
    ON u.id = p.user_id
GROUP BY u.id
ORDER BY followers DESC
LIMIT 0,10;
`
//for now equal to getPopularUsers for testing the routing and HTML listeners work until i get the query right.
const sqlGetSimilarUsers = `SELECT 
    u.id,
    u.name_first,
    u.name_last,
    u.country,
    u.gender,
    u.age,
    u.picture,
    JSON_ARRAYAGG(p.preference_id) AS preferences,

    (SELECT COUNT(*) FROM user_relations WHERE user_id = u.id) AS followers,
    (    
		(
    SELECT COUNT(*) FROM user_prefs AS a
    INNER JOIN user_prefs AS b ON a.preference_id = b.preference_id AND b.user_id = u.id
    WHERE a.user_id = ?
    )     /    (
    SELECT COUNT(*) FROM (
    SELECT preference_id FROM user_prefs WHERE user_id = ?
    UNION 
    SELECT preference_id FROM user_prefs WHERE user_id = u.id
    ) Count
    )    )
    AS Jaccard
FROM users AS u
LEFT JOIN user_prefs p 
 ON u.id = p.user_id
GROUP BY u.id
ORDER BY Jaccard DESC, followers DESC 
LIMIT 0, 100;
`
//[jsonData.user_id, jsonData.user_id, ]

const sqlJaccardSortedGroups = `
SELECT 	grp.id,
		grp.host_user_id,
        grp.about,
        grp.max_members,
        grp.date_start_at,
        grp.date_end_at,
        grp.title,
        grp.destination,
        grp.picture,
        concat(u.name_first, " ", u.name_last) AS host_name,
        json_arrayagg(gt.tag_id) AS tags,
        (
        (
        SELECT COUNT(preference_id) FROM user_prefs
		INNER JOIN group_tags ON tag_id = preference_id AND group_id = grp.id
		WHERE user_id = ?
        )/ (
        SELECT COUNT(*) 
		FROM(
		SELECT preference_id FROM user_prefs WHERE user_id = ?
		UNION
		SELECT tag_id FROM group_tags WHERE group_id = grp.id) Count
        )) AS Jaccard,
        (SELECT COUNT(id) FROM \`groups\`) AS total_groups
FROM \`groups\` AS grp
LEFT JOIN users AS u 
	ON grp.host_user_id = u.id
LEFT JOIN group_tags AS gt 
	ON grp.id = gt.group_id
GROUP BY grp.id
ORDER BY Jaccard DESC
LIMIT ?, ?;
`

const sqlGetPreferences = `
SELECT
    *
FROM preferences
ORDER BY id
`

const sqlGetGroupInfoQuery = `
SELECT grp.created_at, grp.title, grp.destination, grp.about, 
	   grp.date_end_at, grp.date_start_at, grp.picture, grp.max_members,
       (SELECT COUNT(id) FROM group_relations WHERE group_id = ? AND member = 1) AS member_count,
       CONCAT(u.name_first, " ",u.name_last) as host_name
FROM \`groups\` as grp
LEFT JOIN users as u ON u.id = grp.host_user_id
WHERE grp.id = ?;
`

const getProfileGroupsQuery = `
SELECT 	grp.id,
	   grp.date_start_at,
	   grp.title,
       grp.picture,
	   CONCAT(hu.name_first, " ",hu.name_last) AS host_name,
	   (SELECT COUNT(id) FROM group_relations WHERE group_id = grp.id AND member = 1) AS member_count
FROM \`groups\` grp
JOIN group_relations as grp_r ON grp.id = grp_r.group_id AND grp_r.user_id = ? AND member = 1 AND date_end_at < NOW()
LEFT JOIN users as hu ON hu.id = grp.host_user_id;
`

const getOwnProfileInfoQuery = `
SELECT u.name_first, u.name_last, u.email, u.country, u.gender, u.age, u.bio, u.picture, u.id,
	   (SELECT COUNT(id) FROM user_relations WHERE target_user_id = ? AND follow_value = 1) as follower_count,
       (SELECT COUNT(id) FROM user_relations WHERE user_id = ? AND follow_value = 1) as following_count,
       JSON_ARRAYAGG(p.preference_id) AS preferences
FROM users as u
LEFT JOIN user_prefs p ON u.id = p.user_id
WHERE u.id = ?
`

const getProfileInfoQuery = `
SELECT u.id, u.name_first, u.name_last, u.country, u.gender, u.age, u.bio, u.picture,
	   (SELECT COUNT(id) FROM user_relations WHERE target_user_id = ? AND follow_value = 1) as follower_count,
       (SELECT COUNT(id) FROM user_relations WHERE user_id = ? AND follow_value = 1) as following_count,
       JSON_ARRAYAGG(p.preference_id) AS preferences
FROM users as u
LEFT JOIN user_prefs p ON u.id = p.user_id
WHERE u.id = ?
`

const getUserContactsQuery = `
SELECT
DISTINCT
u.id,
u.picture,
concat(u.name_first, " ", u.name_last) AS contact_name
FROM users u
JOIN chat_users cu ON u.id = CASE
WHEN cu.sender_id = ? THEN cu.target_id
WHEN cu.target_id = ? THEN cu.sender_id
END

`
const getUserChatHistoryQuery = `SELECT sender_id, target_id, chat_text FROM chat_users 
WHERE (sender_id = ? AND target_id = ?) OR (sender_id = ? AND target_id = ?)
ORDER BY created_at;`

const getGroupChatHistoryQuery = `SELECT sender_id, CONCAT(u.name_first, " ",u.name_last) AS sender_name, chat_text FROM chat_groups cg
JOIN users u ON u.id = sender_id
WHERE target_id = ?
ORDER BY cg.created_at;`

const getGroupContactsQuery = `SELECT *  FROM \`groups\` g
JOIN group_relations gr ON g.id = gr.group_id
WHERE gr.user_id = ? AND member = 1;`




export async function queryPopularUsers() {
    let queryResponse = await query(sqlGetPopularUsers);
    return queryResponse
}

export async function querySimilarUsers(params) {
    let queryResponse = await query(sqlGetSimilarUsers, params);
    return queryResponse;
}

export async function queryPopularGroups(params) {
    let queryResponse = await query(sqlGetPopularGroups, params);
    return queryResponse;
}

export async function queryJaccardSortedGroups(params) {
    let queryResponse = await query(sqlJaccardSortedGroups, params);
    return queryResponse;
}


export async function queryGroupMembers(groupId) {
    return query(`
        SELECT u.id, u.picture, u.name_first, u.name_last, u.age, u.country, u.gender,
               gr.organizer, gr.member,
        JSON_ARRAYAGG(p.preference_id) AS preferences
        FROM group_relations gr
        JOIN users u ON u.id = gr.user_id
        LEFT JOIN user_prefs p 
         ON gr.user_id = p.user_id
        WHERE gr.group_id = ? AND gr.member = 1
        GROUP BY gr.id
    `, [groupId])
}

export async function getGroupTags(groupId){
    return query(`
        SELECT gt.id, gt.group_id, gt.tag_id, gt.tag_value
        FROM group_tags gt
        WHERE gt.group_id = ?
         `, [groupId])
}

export async function queryGroupInfo(groupId) {
    const normalizedGroupId = Array.isArray(groupId) ? groupId[0] : groupId;
    let queryResponse = await query(sqlGetGroupInfoQuery, [normalizedGroupId, normalizedGroupId])
    return queryResponse[0]
}

export async function queryProfileInfo(userId) {
    const normalizedUserId = Array.isArray(userId) ? userId[0] : userId;
    let queryResponse = await query(getProfileInfoQuery, [normalizedUserId, normalizedUserId, normalizedUserId])
    let queryResponseGroups = await query(getProfileGroupsQuery, [normalizedUserId]) // Past groups
    queryResponse[0].groups = queryResponseGroups;
    return queryResponse[0]
}

export async function queryOwnProfileInfo(userId) {
    const normalizedUserId = Array.isArray(userId) ? userId[0] : userId;
    let queryResponse = await query(getOwnProfileInfoQuery, [normalizedUserId, normalizedUserId, normalizedUserId])
    let queryResponseGroups = await query(getProfileGroupsQuery, [normalizedUserId]) // Past groups
    queryResponse[0].groups = queryResponseGroups;
    return queryResponse[0]
}

export async function queryAllPreferences() {
    let queryResponse = await query(sqlGetPreferences)
    return queryResponse
}

export async function getUserContacts(params) {
    let queryResponse = await query(getUserContactsQuery, params)
    return queryResponse
}

export async function getUserChatHistory(params) {
    let queryResponse = await query(getUserChatHistoryQuery, params)
    return queryResponse
}

export async function getGroupChatHistory(params) {
    let queryResponse = await query(getGroupChatHistoryQuery, params)
    return queryResponse
}

export async function getGroupContacs(params) {
    let queryResponse = await query(getGroupContactsQuery, params)
    return queryResponse
}
export async function queryUpdateUserPreferences(user_id, preferenceList) {
    try {
        // Clear existing prefs first to avoid duplicates
        await query('DELETE FROM user_prefs WHERE user_id = ?', [user_id]);
        //for each preference in the list insert a row in the db.
        if (preferenceList && preferenceList.length > 0) {
            for (let pref of preferenceList) {
                await query(
                    'INSERT INTO user_prefs (user_id, preference_id, preference_value) VALUES (?, ?, ?)',
                    [user_id, pref, 1]
                );
            }
        }
        return { success: true };
    } catch (e) {
        console.error("Database error in updateUserPreferences:", e);
        throw e;
    }
}
     
export async function addTripToDB(host_user_id, title, destination, about, date_start_at, date_end_at, picturePath, max_members, group_openess, tags_list){ 
let result = await query("INSERT INTO `groups` (host_user_id, title, destination, about, date_start_at, date_end_at, picture, max_members, group_openess) VALUES (?,?,?,?,?,?,?,?,?)", [host_user_id,title,destination,about,date_start_at,date_end_at,picturePath,max_members,group_openess])
let groupID = result.insertId    
await query("INSERT INTO group_relations (user_id, group_id, follower,member,organizer) VALUES (?,?,1,1,1)" , [host_user_id, groupID])
if(tags_list && tags_list.length > 0){
        for(let tag of tags_list){
            await query("INSERT INTO group_tags (group_id, tag_id, tag_value) VALUES (?,?,?)", [groupID, tag, 1])
        }
    }
}       
 
