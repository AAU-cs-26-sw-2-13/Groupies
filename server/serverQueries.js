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
    (SELECT COUNT(id) FROM user_relations WHERE user_id = u.id) AS followers
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
       (SELECT COUNT(id) FROM group_relations WHERE group_id = 37 AND member = 1) AS member_count,
       CONCAT(u.name_first, " ",u.name_last) as host_name
FROM \`groups\` as grp
LEFT JOIN users as u ON u.id = grp.host_user_id
WHERE grp.id = ?;
`

export async function queryPopularUsers() {
    let queryResponse = await query(sqlGetPopularUsers);
    return queryResponse;
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

export async function queryGroupInfo(groupId) {
    let queryResponse = await query(sqlGetGroupInfoQuery, groupId)
    return queryResponse[0]
}

export async function queryAllPreferences() {
    let queryResponse = await query(sqlGetPreferences)
    return queryResponse
}