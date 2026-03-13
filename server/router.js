import bcrypt from "bcrypt"; //for password hashing purposes
import crypto from "node:crypto";

import path, { relative } from "path"
import { fileResponse, queryResponse } from "./server.js";
import { parseJSON, setSessionCookie, getSession } from "./routerHelpers.js"
import { getAllUsers } from "./serverQueries.js";
export { createResponse }

async function createResponse(req, res) {
    let baseURL = 'http://' + req.headers.host + "/";    //https://github.com/nodejs/node/issues/12682
    let url = new URL(req.url, baseURL);

    switch (req.method) {
                case "GET": {
            let pathElements = url.pathname.split("/")
            //Routing to different paths
            switch (pathElements[1]) {
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
        case "POST": {
            let pathElements = url.pathname.split("/")
            
            switch (pathElements[1]) {
                case "": {
                    //Load discovery feed
                    let data = ""
                    req.on('data', chunk => {
                        data += chunk.toString()
                    })
                 req.on('end', () => {
                        let jsonData = JSON.parse(data)

                        if (jsonData.sessionId === "empty") {
                            if (jsonData.query === "users") {
                                queryResponse(res, getAllUsers)
                            }
                        }
                    })
                }
                case "api": {
                    switch (pathElements[2]) {
                        case "auth": {
                            if (pathElements.length >= 3) {
                                switch (pathElements[3]) {
                                    //The server sent a register request, we must check username is unique, hash a password and insert to db
                                    case "register": {
                                        const body = await parseJSON(req);
                                        const { username, password, firstname, lastname, email, country, age, bio, picture } = body;

                                        /* check if username AND password were received in JSON */
                                        if (!username || !password) {
                                            res.writeHead(400, { "Content-Type": "application/json" });
                                            return res.end(JSON.stringify({ error: "Username and Password req." }))
                                        }
                                        /* query the username/password */
                                        const exists = await query("SELECT id FROM users WHERE username=?", [username]);
                                        if (exists.length) { //if already taken, reject
                                            res.writeHead(400, { "Content-Type": "application/json" });
                                            return res.end(JSON.stringify({ error: "Username already taken!" }));
                                        }
                                        /* If username and password received and username unique, hash a password and query insert user */
                                        const hash = await bcrypt.hash(password, 12);
                                        await query("INSERT INTO users (username, password_hash, name)", [username, hash, name || null]);

                                        console.log(`✓ User registered: ${username}`); //Debug log
                                        res.writeHead(201, { "Content-Type": "application/json" }); //registration completed message
                                        return res.end(JSON.stringify({ status: "registered" }));
                                    }
                                    //The server sent a login request, we must check login is valid and create a login session
                                    case "login": {
                                        const body = await parseJSON(req);
                                        const { username, password } = body;
                                        //check the username exists
                                        const rows = await query("SELECT id, password_hash FROM users WHERE username=?", [username]);
                                        if (!rows.length) {
                                            res.writeHead(401, { "Content-Type": "application/json" });
                                            return res.end(JSON.stringify({ error: "Wrong username!" }));
                                        }
                                        //User exists, so compare the password hash in db with the password entered in login form
                                        const user = rows[0];
                                        const ok = await bcrypt.compare(password, user.password_hash); //check the password match
                                        if (!ok) {
                                            res.writeHead(401, { "Content-Type": "application/json" });
                                            return res.end(JSON.stringify({ error: "Wrong password!" }));
                                        }
                                        // Create session
                                        const sid = crypto.randomUUID(); //set a pseudorandom RNG key for the session id
                                        const ttl = 60 * 60 * 24 * 7; // 7 dage
                                        const expires = new Date(Date.now() + ttl * 1000); //for cookie expiration from Date.now
                                        // query to insert session id into database
                                        await query(
                                            "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)",
                                            [sid, user.id, expires]
                                        );
                                        setSessionCookie(res, sid, ttl); //set the browser cookie with the session id and a 7 day expiration
                                        res.writeHead(200, { "Content-Type": "application/json" });
                                        return res.end(JSON.stringify({ status: "logged_in :)" }));
                                    }
                                    /* //The server sent a getCurrentUser request for an action that requires a session (must be logged in), 
                                    // we must query the session and get the session id, user id from users table. 
                                    // This is provided the session exists and the expiration is > now */
                                    case "me": {
                                        const session = await getSession(req);
                                        if (!session) {
                                            res.writeHead(401, { "Content-Type": "application/json" });
                                            return res.end(JSON.stringify({ error: "Not logged in yet" }));
                                        }

                                        res.writeHead(200, { "Content-Type": "application/json" });
                                        return res.end(JSON.stringify({
                                            user_id: session.user_id,
                                            username: session.username,
                                            name: session.name
                                        }));

                                    }
                                    case "logout": {
                                        const cookie = req.headers.cookie || "";
                                        const m = cookie.match(/sid=([^;]+)/);
                                        if (m) {
                                            await query("DELETE FROM sessions WHERE id=?", [m[1]]);
                                        }
                                        res.setHeader("Set-Cookie", "sid=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax");
                                        res.writeHead(200, { "Content-Type": "application/json" });
                                        return res.end(JSON.stringify({ status: "logged_out" }));
                                    }
                                }
                            }
                        }
                        case "pref": {
                            const session = await getSession(req);
                            if (!session) {
                                res.writeHead(401, { "Content-Type": "application/json" });
                                return res.end(JSON.stringify({ error: "Not logged in yet" }));
                            }

                            const body = await parseJSON(req);
                            const preferenceName = String(body.preferenceName || "").trim();

                            if (!preferenceName) {
                                //handle no preference received
                            }


                                res.writeHead(200, { "Content-Type": "application/json" });
                            return res.end(JSON.stringify({
                                status: "enabled",
                                value: 1,
                                preferenceName,
                                user_id: session.user_id
                            }));
                        }
                    }
                }
                    break;
            }
        }
    }
}