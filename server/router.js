//JS module imports
import { fileResponse, queryResponse } from "./server.js";
import { queryGroupMembers, queryGroupInfo, queryProfileInfo, queryAllPreferences } from "./serverQueries.js";
import { handleImage } from "./router APIs/uploads.js";
import { registerUserToDB, loginUser, getLoginSession, logout } from "./router APIs/authentication.js";
import { loadDiscovery } from "./router APIs/pageRouting.js";
import { el } from "@faker-js/faker";

/**
 * CreateResponse takes the request received on the server listener and switches on the request url.
 *  POST paths: (some of these are actually for data responses but are POST requests in order to get the cookies from the browser easily)
 *      - "":  User post request was made, make JSON responses with the data from DB for users, groups according to the request parameters
 *      - "api":  Some api call in the POST case is made. Either "auth" or "pref" is next.
 *             .  This can be register/login/logout. Switch the specific one and make query to DB
 *      - "pref":  query db with a new preference for a user.
 *      - "groupMembers": query db for members of a group
 *  GET paths: 
 *      - "": This serves the front page (Discover page)
 *      - "group": The 
 *      - "me": for purposes of requesting the user object from the db from a query on the sessions made with the session id with the browser cookie
 *              this handles serving content specific to the user ("logged in")
 *      - "images":
 *      - defaults to server a fileresponse corresponding to the url of the request
 */
export async function createResponse(req, res) {
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
                        case "pref": await setUserPreference(req, res);
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
            }
            break;
        }
        case "GET": {
            let pathElements = url.pathname.split("/");
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
                //Server wants current user, check for active session for user from browser session cookie
                case "me":
                    await getLoginSession(req, res);
                    break;
                case "images": {
                    console.log("NeedImage")
                    handleImage(req, res, pathElements, decodeURIComponent(url.pathname));
                    break;
                }
                //Fallback to file response
                default: {
                    fileResponse(res, url.pathname);
                    break;
                }
            }
        }
    }
}