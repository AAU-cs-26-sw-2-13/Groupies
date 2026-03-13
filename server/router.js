import path, { relative } from "path"
import { fileResponse, queryResponse } from "./server.js";
import {parseJSON} from "./routerHelpers.js"
import { getAllUsers } from "./serverQueries.js";
export {createResponse} 



function createResponse(req, res){
    let baseURL = 'http://' + req.headers.host+"/";    //https://github.com/nodejs/node/issues/12682
    let url=new URL(req.url, baseURL);
    
    switch(req.method){
        case "POST":{
            let pathElements = url.pathname.split("/")
            switch (pathElements[1]){
                case "":{
                    //Load discovery feed
                    let data = ""
                    req.on('data', chunk => {
                        data += chunk.toString()
                    })
                    req.on('end', ()=>{
                        let jsonData = JSON.parse(data)
                        if (jsonData.sessionId === "empty"){
                            if(jsonData.query = "users"){
                                queryResponse(res, getAllUsers)
                            }
                        }
                    })
                }
            }
            break

        }
        case "GET": {
            let pathElements = url.pathname.split("/")
            //Routing to different paths
            switch(pathElements[1]){
                case "": {
                    fileResponse(res, "html/index.html")
                    break;
                }
                default: {
                    fileResponse(res, url.pathname)
                    break;
                }
            }
        }
    }
}