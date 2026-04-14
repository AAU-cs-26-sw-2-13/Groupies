import { parseJSON } from "./authentication.js"
import { queryFollowUser, queryUnfollowUser } from "../serverQueries.js";

export async function followUser (req, res) {
    try {
        const body = await parseJSON(req);
        const { userId, activeUserId } = body;

        await queryFollowUser (userId, activeUserId);
        res.statusCode = 200;
        res.end();

    } catch (error) {
        console.error("Error in followUser:", error);
        res.statusCode = 500;
        res.end();
    }
}

export  async function unfollowUser (req, res) {
    try {
        const body = await parseJSON(req);
        const { userId, activeUserId } = body;

        await queryUnfollowUser (userId, activeUserId);

        res.statusCode = 200;
        res.end();
    } catch (error) {
        console.error("Error in unfollowUser", error);
        res.statusCode = 500;
        res.end();
    }
}
