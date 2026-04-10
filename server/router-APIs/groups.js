import { queryGroupLeave } from "../serverQueries.js";
import { parseJSON } from "./authentication.js"

export async function deleteGroupRelation (req, res) {
    try {
        const body = await parseJSON(req);
        const { userId, groupId } = body;
        queryGroupLeave(userId, groupId);
    } catch (error) {
        console.error(error);
    }
    res.statusCode = 200;
    return;
}