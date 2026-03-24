import {queryResponse} from "../server.js"
import { getAllUsers, getAllGroups, jaccardSorted, getGroupMembers} from "../serverQueries.js";

//Page variables
let activePage = 1;

export function loadDiscovery (req, res) {
    let data = ""
    req.on('data', chunk => {
        data += chunk.toString()
    })
    req.on('end', () => {
        let jsonData = JSON.parse(data)
        if (jsonData.user_id !==null) {
            console.log("User Found, query is " + jsonData.query)
            switch(jsonData.query){
                case "users": {
                    queryResponse(res, getAllUsers);
                    break
                }
                case "groups": {
                    queryResponse(res, jaccardSorted, [jsonData.user_id,jsonData.user_id , 0, 10]);
                    break
                }
            }
        }else {
           switch(jsonData.query){
                case "users": {
                    console.log("Got users")
                    queryResponse(res, getAllUsers);
                    break
                }
                case "groups": {
                    queryResponse(res, getAllGroups);
                    break;
                }
                case "groupMembers": {
                    queryResponse(res, () => getGroupMembers(jsonData.groupId));
                    break;
                }
            }
        }
    })
}

