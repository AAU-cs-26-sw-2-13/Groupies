import bcrypt from "bcrypt"; //for password hashing purposes
import crypto from "node:crypto";

import path, { relative } from "path"
import { fileResponse, queryResponse} from "./server.js";
import {getGroupMembers, getGroupTags, addTripToDB} from "./serverQueries.js"
import {handleImage } from "./router APIs/uploads.js"

import { registerUserToDB, loginUser, getLoginSession, logout, parseJSON } 
from "./router APIs/authentication.js"
import { loadDiscovery } from "./router APIs/pageRouting.js"
export { createResponse }

async function createResponse(req, res) {
    let baseURL = 'http://' + req.headers.host + "/";    //https://github.com/nodejs/node/issues/12682
    let url = new URL(req.url, baseURL);

    switch (req.method) {
        case "POST": {
            let pathElements = url.pathname.split("/")
            switch (pathElements[1]) {
                case "": await loadDiscovery(req, res);
                break;
                case "api": {
                    switch (pathElements[2]) {
                        case "auth": {
                            if (pathElements.length >= 3) {
                                switch (pathElements[3]) {
                                    //The server sent a register request, we must check username is unique, hash a password and insert to db
                                    case "register": await registerUserToDB(req, res);
                                        break;
                                    //The server sent a login request, we must check login is valid and create a login session  
                                    case "login": await loginUser(req, res);
                                        break;
                                    //logout request received, log the user out (delete session in DB)
                                    case "logout": await logout (req, res); 
                                        break;
                                }
                            }
                            break;
                        }
                        case "pref": await setUserPreference (req,res);
                        break;
                    }
                    break;
                }
                 case "groupMembers":{
                    let data = ""
                    req.on('data', chunk => {
                        data += chunk.toString()
                    })
                    req.on('end', () => {
                        let jsonData = JSON.parse(data)
                        queryResponse(res, () => getGroupMembers(jsonData.groupId));
                    })
                    break;
                }
                 case "groupTags":{
                    let data = ""
                    req.on('data', chunk => {
                        data += chunk.toString()
                    })
                    req.on('end', () => {
                        let jsonData = JSON.parse(data)
                        queryResponse(res, () => getGroupTags(jsonData.groupId));
                    })
                    break;
                }
                case "createTrip": {
                     const body = await parseJSON(req);
                    await addTripToDB(body.host_user_id,body.title,body.destination,body.about,body.date_start_at,body.date_end_at,body.max_members);
                    res.writeHead(200, {"Content-Type": "application/json"})
                    res.end(JSON.stringify({status: "created"}))
                break;
                }
            }
            break;
        }
        case "GET": {
            let pathElements = url.pathname.split("/")
            console.log(pathElements)
            //Routing to different paths
            switch (pathElements[1]) {
                case "": {
                    fileResponse(res, "html/index.html")
                    break;
                }
                case "group": {
                    fileResponse(res, "html/group.html")
                    break
                }
                //Server wants current user, check for active session for user from browser session cookie
                case "me":
                    await getLoginSession (req, res);
                    break;
                case "images":{
                    handleImage(req, res, pathElements, decodeURIComponent(url.pathname))
                    break;
                }
                //Fallback to file response
                default: {
                    fileResponse(res, url.pathname)
                    break;
                }
            }
        }
    }
}