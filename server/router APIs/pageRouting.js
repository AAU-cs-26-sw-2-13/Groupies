import {queryResponse, fileResponse} from "../server.js"
import { getAllUsers, getAllGroups, jaccardSorted, getGroupMembers, getUserContacts} from "../serverQueries.js";

export function loadDiscovery (req, res) {
    let data = ""
    req.on('data', chunk => {
        data += chunk.toString()
    })
    req.on('end', () => {
        let jsonData = JSON.parse(data)
        if (jsonData.user_id !==null) {
            switch(jsonData.query){
                case "users": {
                    queryResponse(res, getAllUsers);
                    break
                }
                case "groups": {
                    queryResponse(res, jaccardSorted, [jsonData.user_id,jsonData.user_id , jsonData.offset, 10]);
                    break
                }
            }
        }else {
           switch(jsonData.query){
                case "users": {
                    queryResponse(res, getAllUsers);
                    break
                }
                case "groups": {
                    queryResponse(res, getAllGroups, [jsonData.offset]);
                    break;
                }
            }
        }
    })
}

export function loadChat(req, res) {
    console.log("Load Chat")
    fileResponse(res, "html/chat.html")
}