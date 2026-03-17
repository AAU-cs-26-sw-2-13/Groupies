import { query } from "../database/pool.js";
import { pool } from "../database/pool.js";
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
ORDER BY follower_count DESC;
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
    JSON_ARRAYAGG(p.preference_id) AS preferences
FROM users u
LEFT JOIN user_prefs p 
    ON u.id = p.user_id
GROUP BY u.id
ORDER BY u.id;
`

export async function getAllUsers(){
    let queryResponse =  await query(sqlGetAllUsers)
    return queryResponse
}

export async function getAllGroups(){
    let queryResponse =  await query(defaultGroups)
    return queryResponse
}