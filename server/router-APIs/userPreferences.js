import { query } from "../../database/pool.js";
import { parseJSON } from "./authentication.js"
import { queryUpdateUserPreferences } from "../serverQueries.js"

export async function setUserPreferences(req, res) {
    try {
        const body = await parseJSON(req);
        const { user_id, preferenceList } = body;

        // Validation: Ensure we have data and it's an array
        if (!user_id || !Array.isArray(preferenceList)) {
            res.writeHead(400, { "Content-type": "application/json" });
            return res.end(JSON.stringify({ status: "error", message: "Missing data" }));
        }

        await queryUpdateUserPreferences(user_id, preferenceList); //query the db with an update with the array of preferences to save

        res.writeHead(200, { "Content-type": "application/json" });
        return res.end(JSON.stringify({
            status: "success",
            message: `${preferenceList.length} preferences added`,
            added: preferenceList
        }));

    } catch (error) {
        console.error("Database error in setUserPreferences:", error);
        res.writeHead(500, { "Content-type": "application/json" });
        return res.end(JSON.stringify({ status: "error", message: "Server database error" }));
    }
}