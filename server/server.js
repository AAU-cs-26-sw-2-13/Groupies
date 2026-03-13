import http from "http"
import path from "path"
import fs from "fs"

export {fileResponse}

import {createRespons} from "./router.js"

const hostname = 'localhost';
const port = 3000;

const server = http.createServer((req, res) => {
   
    createRespons(req, res)
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

const publicResources="frontend/";
const cwd = process.cwd()

function sanitizePath(userPath){
    //Valider stien - fjenr \0 tegn
    if (userPath.indexOf('\0') !== -1) {
        return undefined;
    }
    userPath = path.normalize(userPath).replace(/^(\.\.(\/|\\|$))+/, '');
    let p = path.join(publicResources, userPath)
    return p;
}

function guessMimeType(fileName){
  const fileExtension=fileName.split('.').pop().toLowerCase();
  const ext2Mime ={ //Aught to check with IANA spec
    "txt": "text/txt",
    "html": "text/html",
    "ico": "image/ico", // CHECK x-icon vs image/vnd.microsoft.icon
    "js": "text/javascript",
    "json": "application/json", 
    "css": 'text/css',
    "png": 'image/png',
    "jpg": 'image/jpeg',
    "wav": 'audio/wav',
    "mp3": 'audio/mpeg',
    "svg": 'image/svg+xml',
    "pdf": 'application/pdf',
    "doc": 'application/msword',
    "docx": 'application/msword'
   };
    //incomplete
  return (ext2Mime[fileExtension]||"text/plain");
}

function fileResponse(res, userPath){
    let sanitizedPath = sanitizePath(userPath)
    fs.readFile(sanitizedPath, (err,data)=>{
        if(err) {
            res.statusCode = 404;
            res.end('\n')
        }else{
            res.statusCode = 200;
            res.setHeader('Content-Type', guessMimeType(sanitizedPath));
            res.write(data);
            res.end('\n');
        }
    } )
}
 export async function queryResponse(res, queryFunction){
    let response = await queryFunction()
    if(response){
        res.statusCode = 200;
        res.setHeader('Content-Type', "application/json")
        res.write(JSON.stringify(response))
        res.end()
    }
}



