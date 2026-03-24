import {queryResponse} from "../server.js"
import { getAllUsers, getAllGroups, getGroupMembers, getGroupTags } from "../serverQueries.js";

export function loadDiscovery (req, res) {
    let data = ""
    req.on('data', chunk => {
        data += chunk.toString()
    })
    req.on('end', () => {
        let jsonData = JSON.parse(data)
        if (jsonData.sessionId === "empty") {
            if (jsonData.query === "users") {
                queryResponse(res, getAllUsers);
            } else if (jsonData.query === "groups") {
                queryResponse(res, getAllGroups);
            }
            else if (jsonData.query === "groupMembers") {
                queryResponse(res, () => getGroupMembers(jsonData.groupId));
            }
             else if (jsonData.query === "groupTags") {
                queryResponse(res, () => getGroupTags(jsonData.groupId));
            }
        }
    })
}

