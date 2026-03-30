import {queryResponse} from "../server.js"
import { getPopularUsers, getSimilarUsers, getPopularGroups, getJaccardSortedGroups, getGroupMembers} from "../serverQueries.js";

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
                    await queryResponse(res, getPopularUsers);
                    break;
                }
                case "similar users": {
                    await queryResponse(res, getSimilarUsers, [jsonData.user_id, jsonData.user_id]);
                    console.log("IN THE SIMILAR USERS LIST CASE");
                    if (!queryResponse) console.log("No queryResponse in similar users case");
                    console.log(queryResponse);
                    console.table(queryResponse);
                    break;
                }
                case "groups": {
                    queryResponse(res, getJaccardSortedGroups, [jsonData.user_id,jsonData.user_id , jsonData.offset, 10]);
                    console.log(`getJaccardSortedGroups for active user with id: ${jsonData.user_id}`);
                    console.table(queryResponse);
                    break;
                }
            }
        }else { //Else display most popular users/groups
           switch(jsonData.query){
                case "users": {
                    console.log("Got users ordered by # followers");
                    queryResponse(res, getPopularUsers);
                    break;
                }
                case "groups": {
                    console.log(jsonData)
                    queryResponse(res, getPopularGroups, [jsonData.offset]);
                    break;
                }
            }
        }
    })
}

