// db/pool.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

/* Takes the settings from .env to create a "pool" of credentials */
export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper to run the SQL queries to the server through the pool.
export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}