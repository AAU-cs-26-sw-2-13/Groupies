// this file is used to run all the files in the /migrations/ folder to initialize the tables on the server with columns
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { query } from "../database/pool.js";

dotenv.config(); // ← Configure process.env to the .env settings

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  console.log("Using DB:", process.env.MYSQL_DATABASE);

  const dir = path.join(__dirname, "migrations");
  const files = (await fs.readdir(dir)) /* Read the files in the migrations directory */
    .filter(f => f.endsWith(".sql"))
    .sort();

  console.log("Found migration files:", files);

  for (const file of files) { /* For each migration file, read the statement of the file and run the query */
    const full = path.join(dir, file);
    const sql = await fs.readFile(full, "utf-8");

    // simpel split – fint til 1 statement per fil
    const statements = sql
      .split(/;\s*$/m)
      .map(s => s.trim())
      .filter(Boolean);

    console.log(`→ Running ${file} (${statements.length} stmt)`);
    for (const stmt of statements) {
      await query(stmt); /* Query the statement to the db server using the pool credentials */
    }
  }

  console.log("✓ Migrations completed");
  process.exit(0);
}

migrate().catch(err => {
  console.error("Migration error:", err);
  process.exit(1);
});