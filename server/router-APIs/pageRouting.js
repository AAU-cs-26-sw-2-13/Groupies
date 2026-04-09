import {queryResponse, fileResponse} from "../server.js"
import { queryPopularUsers, querySimilarUsers, queryPopularGroups, queryJaccardSortedGroups, queryGroupMembers, queryAllPreferences, getUserContacts, getUserChatHistory, getGroupContacs,getGroupChatHistory} from "../serverQueries.js";


//Page variables
let activePage = 1;

export function loadDiscovery (req, res) {
    let data = ""
    req.on('data', chunk => {
        data += chunk.toString()
    })
    req.on('end', async () => {
        let jsonData = JSON.parse(data);
        if (jsonData.user_id !==null) { //If there is a login token (so we have an active user ID and want to tailor the items to the user)
            console.log(`User found w id: ${jsonData.user_id}, query is for: "${jsonData.query}"`);
            switch(jsonData.query){
                case "users": {
                    await queryResponse(res, queryPopularUsers);
                    break;
                }
                case "similar users": {
                    await queryResponse(res, querySimilarUsers, [jsonData.user_id, jsonData.user_id]);
                    console.log("IN THE SIMILAR USERS LIST CASE");
                    if (!queryResponse) console.log("No queryResponse in similar users case");
                    break;
                }
                case "groups": {
                    queryResponse(res, queryJaccardSortedGroups, [jsonData.user_id,jsonData.user_id , jsonData.offset, 10]);
                    break;
                }
            }
        } else { //Else display most popular users/groups
            console.log(`No user login found, query is for: "${jsonData.query}"`);
            switch(jsonData.query){
                case "users": {
                    queryResponse(res, queryPopularUsers);
                    break;
                }
                case "groups": {
                    queryResponse(res, queryPopularGroups, [jsonData.offset]);
                    break;
                }
            }
        }
    })
}

export function regPreferences(req, res){
    let data = "";
    req.on('data', chunk => {
        data += chunk.toString()
    })
    req.on('end', () => {
        queryResponse(res, queryAllPreferences);
    })
}

