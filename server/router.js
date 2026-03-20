import bcrypt from "bcrypt"; //for password hashing purposes
import crypto from "node:crypto";

import path, { relative } from "path"
import { fileResponse, queryResponse } from "./server.js";

import { registerUserToDB, loginUser, getLoginSession, logout } 
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
                }
                break;
            }
            break;
        }
        case "GET": {
            let pathElements = url.pathname.split("/")
            //Routing to different paths
            switch (pathElements[1]) {
                case "": {
                    fileResponse(res, "html/index.html")
                    break;
                }
                //Server wants current user, check for active session for user from browser session cookie
                case "me":
                    await getLoginSession (req, res);
                    break;
                //Fallback to file response
                default: {
                    fileResponse(res, url.pathname)
                    break;
                }
            }
        }
    }
}