import path, { relative } from "path"
import { fileResponse } from "./server.js";

export {createRespons} 



function createRespons(req, res){
    let baseURL = 'http://' + req.headers.host+"/";    //https://github.com/nodejs/node/issues/12682
    let url=new URL(req.url, baseURL);
    console.log(req.method)
    
    switch(req.method){
        case "GET": {
            console.log("WehaveGet")
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