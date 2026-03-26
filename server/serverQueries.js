import { query } from "../database/pool.js";
import { pool } from "../database/pool.js";
//Constants
const pagesLoaded = 10;


const defaultGroups = `
SELECT 	grp.id,
		grp.host_user_id,
        grp.about,
        grp.max_members,
        grp.date_start_at,
        grp.date_end_at,
        grp.title,
        grp.destination,
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


const sqlGetAllUsers = `
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
/*
SELECT 	u.id,
		concat(name_first," ",name_last) AS full_name,
        u.age,
        u.gender,
        json_arrayagg(up.preference_id) AS preferences
        
FROM users AS u
JOIN user_prefs AS up
ON u.id = up.user_id
group by u.id;

*/

const Jaccard = `
SELECT 	grp.id,
		grp.host_user_id,
        grp.about,
        grp.max_members,
        grp.date_start_at,
        grp.date_end_at,
        grp.title,
        grp.destination,
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

export async function getAllUsers(){
    let queryResponse =  await query(sqlGetAllUsers)
    return queryResponse
}

export async function getAllGroups(params){
    let queryResponse =  await query(defaultGroups, params)
    return queryResponse
}

export async function jaccardSorted(params){
    let queryResponse =  await query(Jaccard, params)
    return queryResponse
}


export async function getGroupMembers(groupId){
    return query(`
        SELECT u.id, u.name_first, u.name_last, u.age, u.country, u.gender,
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

export async function getAllPreferences(){
    let queryResponse = await query(sqlGetPreferences)
    return queryResponse
}

export async function getGroupTags(groupId){
    return query(`
        SELECT gt.id, gt.group_id, gt.tag_id, gt.tag_value
        FROM group_tags gt
        WHERE gt.group_id = ?
         `, [groupId])
}

export async function addTripToDB(host_user_id, title, destination, about, date_start_at, date_end_at, max_members){ 
let result = await query("INSERT INTO `groups` (host_user_id, title, destination, about, date_start_at, date_end_at, max_members) VALUES (?,?,?,?,?,?,?)", [host_user_id,title,destination,about,date_start_at,date_end_at,max_members])
let groupID = result.insertId    
await query("INSERT INTO group_relations (user_id, group_id, follower,member,organizer) VALUES (?,?,1,1,1)" , [host_user_id, groupID])
}       
