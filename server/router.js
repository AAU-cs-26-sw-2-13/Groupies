import bcrypt from "bcrypt"; //for password hashing purposes
import crypto from "node:crypto";

import path, { relative } from "path"
import { fileResponse, queryResponse} from "./server.js";
import {getGroupMembers} from "./serverQueries.js"

import { registerUserToDB, loginUser, getLoginSession, logout, registerPreferences } 
from "./router APIs/authentication.js"

import { loadDiscovery, regPreferences } from "./router APIs/pageRouting.js"
export { createResponse }

async function createResponse(req, res) {
    let baseURL = 'http://' + req.headers.host + "/";    //https://github.com/nodejs/node/issues/12682
    let url = new URL(req.url, baseURL);

    switch (req.method) {
        case "POST": {
            let pathElements = url.pathname.split("/");
            switch (pathElements[1]) {
                case "": loadDiscovery(req, res);
                    break;
                case "api": {
                    switch (pathElements[2]) {
                        case "auth": {
                            if (pathElements.length >= 3) {
                                switch (pathElements[3]) {
                                    //The server sent a register request, we must check username is unique, hash a password and insert to db
                                    case "register": await registerUserToDB(req, res);
                                        break;
                                    case "regPrefs": await registerPreferences(req, res);
                                        break;
                                    //The server sent a login request, we must check login is valid and create a login session  
                                    case "login": await loginUser(req, res);
                                        break;
                                    //logout request received, log the user out (delete session in DB)
                                    case "logout": await logout(req, res);
                                        break;
                                }
                            }
                            break;
                        }
                        case "pref": await setUserPreferences(req, res);
                            break;
                    }
                    break;
                }
                case "groupMembers": {
                    let data = "";
                    req.on('data', chunk => {
                        data += chunk.toString();
                    })
                    req.on('end', () => {
                        let jsonData = JSON.parse(data);
                        queryResponse(res, () => queryGroupMembers(jsonData.groupId));
                    })
                    break;
                }
                case "regPrefs": await regPreferences(req, res);
                    break;
            }
            break;
        }
        case "GET": {
            let pathElements = url.pathname.split("/")
            //Routing to different paths
            switch (pathElements[1]) {
                case "": {
                    fileResponse(res, "html/index.html");
                    break;
                }
                case "group": {
                    if(pathElements[2]==="groupInfo"){
                        queryResponse(res, queryGroupInfo, url.searchParams.get("id"))
                    }else{
                        fileResponse(res, "html/group.html");  
                    }
                    break;
                }
                case "profile": {
                    if(pathElements[2]==="profileInfo"){
                        queryResponse(res, queryProfileInfo, url.searchParams.get("id"))
                    }else{
                        fileResponse(res, "html/profile.html");  
                    }
                    break;
                }
                case "group": {
                    fileResponse(res, "html/group.html")
                    break
                }
                //Server wants current user, check for active session for user from browser session cookie
                case "me":
                    await getLoginSession(req, res);
                    break;
                case "images": {
                    console.log("Image request received...")
                    handleImage(req, res, pathElements, decodeURIComponent(url.pathname));
                    break;
                }
                case "prefs": {
                    try {
                        await queryResponse(res, queryAllPreferences);
                    } catch (error) {
                        console.error(error);
                    }
                    break;
                //Fallback to file response
                default: {
                    fileResponse(res, url.pathname);
                    break;
                }
            }
        }
    }
}