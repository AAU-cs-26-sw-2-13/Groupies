import {queryResponse, fileResponse} from "../server.js"
import { getAllUsers, getAllGroups, jaccardSorted, getGroupMembers, getUserContacts, getUserChatHistory, getGroupContacs,getGroupChatHistory} from "../serverQueries.js";

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

export function loadChat(req, res, pathElements, searchParams) {
    console.log(pathElements)
    switch(pathElements[2]){
        //All logic for users
        case "getUserContacs": {
            let userId = searchParams.get("ownUser")
            if(userId){
                queryResponse(res, getUserContacts,[userId, userId])
                return
            }else{
                res.statusCode = 400
                res.end('\n');
            }
            return
            break;
        }
        case "getGroupContacs": {
            let userId = searchParams.get("ownUser")
            if(userId){
                queryResponse(res, getGroupContacs,[userId])
                return
            }else{
                res.statusCode = 400
                res.end('\n');
            }
            return
            break;
        }
        case "users":{
            switch(pathElements[3]){
                case "getChatHistory":{
                    let userId = searchParams.get("ownUser")
                    let otherChatterId = searchParams.get("chatUser")
                    if(userId && otherChatterId){
                        queryResponse(res, getUserChatHistory,[userId, otherChatterId, otherChatterId, userId])
                        return
                    }else{
                        res.statusCode = 400
                        res.end('\n');
                    }
                    break
                }
            }
            break
        }
        case "groups":{
            switch(pathElements[3]){
                case "getChatHistory":{
                    let userId = searchParams.get("ownUser")
                    let otherChatterId = searchParams.get("chatUser")
                    if(userId && otherChatterId){
                        queryResponse(res, getGroupChatHistory,[otherChatterId])
                        return
                    }else{
                        res.statusCode = 400
                        res.end('\n');
                    }
                    break
                }
            }
        }
    }
    console.log("GetFile")
    fileResponse(res, "html/chat.html");
}