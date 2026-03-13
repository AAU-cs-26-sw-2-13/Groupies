import { query } from "../database/pool.js";
import { pool } from "../database/pool.js";
const defaultGroups = `
SELECT gp.*, hn.name_first, hn.name_last
FROM \`groups\` gp
JOIN users hn ON gp.host_user_id = hn.id;
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
    p.preference_id,
    p.preference_value
FROM users u
LEFT JOIN user_prefs p 
    ON u.id = p.user_id
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