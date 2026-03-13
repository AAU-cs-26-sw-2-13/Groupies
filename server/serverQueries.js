import { query } from "../database/pool.js";
import { pool } from "../database/pool.js";
const defaultGroups = `
SELECT * FROM \`groups\`
`

const sqlGetAllUsers = `
SELECT * FROM users
`

export async function getAllUsers(){
    let queryResponse =  await query(sqlGetAllUsers)
    return queryResponse
}