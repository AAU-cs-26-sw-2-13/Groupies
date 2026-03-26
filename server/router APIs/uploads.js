import {guessMimeType } from "../server.js"
const uploads = path.join(process.cwd(), "database", "uploads");
import path from "path"
import fs from "fs";

export function handleImage(req, res, APIPath, userPath){
    let fileCOunt = 0;
    switch(APIPath[2]){
        case "groupPictures":{
            let sanitiedPath = securePath(userPath)
            fs.readFile(sanitiedPath, (err,data)=>{
                if(err) {
                    res.statusCode = 404;
                    res.end('\n')
                }else{
                    res.statusCode = 200;
                    res.setHeader('Content-Type', guessMimeType(sanitiedPath));
                    res.end(data);
                }
            } )
            break;
        }
    }
}

function securePath(userPath){
    //Valider stien - fjenr \0 tegn
    if (userPath.indexOf('\0') !== -1) {
        return undefined;
    }
    userPath = path.normalize(userPath).replace(/^(\.\.(\/|\\|$))+/, '');
    let p = path.join(uploads, userPath)
    return p;

}