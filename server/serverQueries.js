import { query } from "../database/pool.js";
import { pool } from "../database/pool.js";
//Constants
const pagesLoaded = 10;


const defaultGroups = `
SELECT 
    gp.*, 
    hn.name_first, 
    hn.name_last,
    COUNT(DISTINCT gr.user_id) AS follower_count,
    JSON_ARRAYAGG(p.tag_id) AS tags
FROM \`groups\` gp
JOIN users hn 
    ON gp.host_user_id = hn.id
LEFT JOIN group_relations gr 
    ON gp.id = gr.group_id 
    AND gr.follower = 1
LEFT JOIN group_tags p
    ON gp.id = p.group_id
GROUP BY gp.id
ORDER BY follower_count DESC
LIMIT 10;
`

/*SELECT 	grp.id,
		grp.host_user_id,
        grp.title,
        grp.destination,
        concat(u.name_first, " ", u.name_last) AS host_name,
        json_arrayagg(gt.tag_id) AS tags,
        COUNT(distinct gr.user_id) AS followers
FROM `groups` AS grp
LEFT JOIN users AS u 
	ON grp.host_user_id = u.id
LEFT JOIN group_tags AS gt 
	ON grp.id = gt.group_id
LEFT JOIN group_relations AS gr
	ON grp.id = gr.group_id AND gr.follower = 1
GROUP BY grp.id
ORDER BY followers DESC;

 */

const sqlGetAllUsers = `
SELECT 
    u.id,
    u.name_first,
    u.name_last,
    u.country,
    u.gender,
    u.age,
    u.picture,
    JSON_ARRAYAGG(p.preference_id) AS preferences
FROM users u
LEFT JOIN user_prefs p 
    ON u.id = p.user_id
GROUP BY u.id
ORDER BY u.id
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
        COUNT(distinct gr.user_id) AS followers
FROM \`groups\` AS grp
LEFT JOIN users AS u 
	ON grp.host_user_id = u.id
LEFT JOIN group_tags AS gt 
	ON grp.id = gt.group_id
LEFT JOIN group_relations AS gr
	ON grp.id = gr.group_id AND gr.follower = 1
GROUP BY grp.id
ORDER BY Jaccard DESC
LIMIT ?, ?;
`

export async function getAllUsers(){
    let queryResponse =  await query(sqlGetAllUsers)
    return queryResponse
}

export async function getAllGroups(){
    let queryResponse =  await query(defaultGroups)
    return queryResponse
}