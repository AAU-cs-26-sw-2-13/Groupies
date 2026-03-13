import path, { relative } from "path"
import { fileResponse, queryResponse } from "./server.js";
import { getAllUsers, getAllGroups} from "./serverQueries.js";

export {createRespons} 



function createRespons(req, res){
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
                            if(jsonData.query === "users"){
                                console.log(jsonData.query)
                                queryResponse(res, getAllUsers)
                            }else if (jsonData.query === "groups"){
                                console.log(jsonData.query)
                                queryResponse(res, getAllGroups)
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