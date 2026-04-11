import { queryGroupLeave } from "../serverQueries.js";
import { parseJSON } from "./authentication.js"

export async function deleteGroupRelation (req, res) {
    try {
        const body = await parseJSON(req);
        const { userId, groupId } = body;

        await queryGroupLeave(userId, groupId);
        res.statusCode = 200;
        res.end();

    } catch (error) {
        console.error("Error in deleteGroupRelation:", error);
        res.statusCode = 500;
        res.end();
    }
}