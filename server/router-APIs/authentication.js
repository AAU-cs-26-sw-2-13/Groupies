import { query } from '../../database/pool.js'
import bcrypt from "bcrypt"; //password hashing
import busboy from 'busboy'; //HTML form data parser
import fs from "fs"
import path from 'path';

// Helper functions for the authentication functions
export async function parseJSON(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch {
        resolve({});
      }
    });
  });
}

export async function setSessionCookie(res, sid, maxAgeSec) { //sets the session cookie when logging in with a valid username/password
  const cookie = [
    `sid=${sid}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${maxAgeSec}`
  ].join("; ");
  res.setHeader("Set-Cookie", cookie);
}

export async function getSession(req) { //get the session for the user
  const cookie = req.headers.cookie || "";
  const m = cookie.match(/sid=([^;]+)/); 
  if (!m) return null;

  const sid = m[1];
  //select the session IDs and match the session id to the user where s.id= [sid], which is saved in browser cookies.
  const rows = await query(` 
    SELECT s.id, u.id AS user_id, CONCAT(u.name_first, " ", u.name_last) AS full_name, expires_at, u.picture
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.id = ? AND s.expires_at > NOW();
    `
  , sid);//provided the session id exists and not expired, in the contrary case login/registration is needed
  
  return rows[0] || null;
}

// -----  function registerUserToDB: Input validate, check uniqueness, hash password and insert user to. ------
export async function registerUserToDB(req, res) {
  //Allowed image file types
  const fileTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
  ];
  try {
    let userData = {}
    await new Promise((resolve, reject) => {
      //Uses busboy to parse the data
      const bb = busboy({headers: req.headers})
      
      //Takes the readable stream from the request and gives it to busboy as a writeable stream
      req.pipe(bb)

      //When a file is loaded
      bb.on('file', async (name, file, info) => {
        //Array for reading chunks from the file
        const extension = info.mimeType.split('/')[1];
        userData.imageType = extension
        const chunks = [];

        //When new chunks comes, push it to the chunk array.
        file.on('data', async (chunk) => {
          chunks.push(chunk);
        });

        file.on('close',async () => {
          userData["picture"] = Buffer.concat(chunks);
        });
      })
      bb.on('field',async (fieldname, value) => {
        userData[fieldname]=value
      })
      bb.on('close', resolve)
      bb.on('error', reject)
    })
    if(!fileTypes.includes("image/"+userData.imageType)){
      throw "Invalid file type"
    }
    if(userData.country.length !== 2){
      throw "Invalid country"
    }
    if(!userData.password || !userData.firstName || !userData.lastName || !userData.gender || !userData.email || !userData.dob || !userData.bio || !userData.picture){
      const e = "Missing Requirement";
      throw e
    }else{
      // query the username/password 
      const exists = await query("SELECT id FROM users WHERE email=?", [userData.email]);
      if (exists.length) { //if already taken, reject
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Email already in use!" }));
      }

      //Create the user
      const hash = await bcrypt.hash(userData.password, 12);
      let userCreationResult = await query("INSERT INTO users (email, password_hash, name_first, name_last, country, gender, dob, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [userData.email, hash, userData.firstName || null, userData.lastName, userData.country, userData.gender, userData.dob, userData.bio || null])

      //Make the prefrences
      let prefsArray = userData.preferences.split(",")
      let rowsToInsert = prefsArray.map(pref => [userCreationResult.insertId, pref, 1])
      if(prefsArray.length > 0){
        await query("INSERT INTO user_prefs (user_id, preference_id, preference_value) VALUES ?", [rowsToInsert])
      }

      //Create image
      let newImagePath = path.join(process.cwd(), "database", "uploads", "images", "profilePictures", `${userCreationResult.insertId}.${userData.imageType}`);
      fs.writeFile(newImagePath, userData.picture, (err)=>{
        if(err){
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Coult not create image!" }));
        }
      })

      //Update the picture path of the user
      await query("UPDATE users SET picture=? WHERE id=?", [path.join("/","images","profilePictures", `${userCreationResult.insertId}.${userData.imageType}`), userCreationResult.insertId]);
      
      //Logs the user in
      // Create session
      const sid = crypto.randomUUID(); //set a pseudorandom RNG key for the session id
      const ttl = 60 * 60 * 24 * 7; // 7 dage
      const expires = new Date(Date.now() + ttl * 1000); //for cookie expiration from Date.now
      // query to insert session id into database
      await query(
        "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)",
        [sid, userCreationResult.insertId, expires]
      );
      setSessionCookie(res, sid, ttl); //set the browser cookie with the session id and a 7 day expiration

      res.writeHead(201, { "Content-Type": "application/json" }); 
      return res.end(JSON.stringify({ status: "registered" }));
    }
  }
  catch (e) {
    res.writeHead(400, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: e }));
  }
}

// -----  function loginUser: Check user credentials, create session and set session cookie. ------
export async function loginUser(req, res) {
  const body = await parseJSON(req);
  let { email, password } = body;
  //Sanitize inputs for bad/malicious characters
  email = sanitize(String(email));
  password = sanitize(String(password));
  //check the username exists
  const rows = await query("SELECT id, password_hash FROM users WHERE email=?", [email]);
  if (!rows.length) {
    res.writeHead(401, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Wrong email!" }));
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

export async function getLoginSession(req, res) {
  try {
    const session = await getSession(req);
    if (!session) {
      res.writeHead(401, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Not logged in yet" }));
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({
      user_id: session.user_id,
      username: session.full_name,
      picture: session.picture
    }));
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Internal server error" }));
  }
}

export async function logout(req, res) {
  const cookie = req.headers.cookie || "";
  const m = cookie.match(/sid=([^;]+)/);
  if (m) {
    await query("DELETE FROM sessions WHERE id=?", [m[1]]);
  }
  res.setHeader("Set-Cookie", "sid=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax");
  res.writeHead(200, { "Content-Type": "application/json" });
  return res.end(JSON.stringify({ status: "logged_out" }));
}

export async function editUser(req, res) {
  try {
    // Make sure user is logged in
    const session = await getSession(req);
    if (!session) {
      res.writeHead(401, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Not logged in yet" }));
    }

  // Find user in db
    const rows = await query("SELECT * FROM users WHERE id=?", [session.user_id]);
    if (!rows.length) {
      res.writeHead(401, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Wrong user" }));
    }

    //Uses busboy to parse the data
    let userData = {}
    
    const bb = busboy({headers: req.headers})
    //Takes the readable stream from the request and gives it to busboy as a writeable stream
    req.pipe(bb)
    
    //When a file is loaded
    bb.on('file', async (name, file, info) => {
      console.log("Reading file")
      //Array for reading chunks from the file
      const extension = info.mimeType.split('/')[1];
      userData.imageType = extension
      const chunks = [];

      //When new chunks comes, push it to the chunk array.
      file.on('data', async (chunk) => {
        chunks.push(chunk);
      });

      file.on('close',async () => {
        userData["picture"] = Buffer.concat(chunks);
      });
    })
    bb.on('field',async (fieldname, value) => {
      userData[fieldname]=value
    })
    bb.on('close', async ()=>{
      const firstname = sanitize(String(userData.firstname));
      const lastname = sanitize(String(userData.lastname));
      const email = sanitize(String(userData.email));
      const password = sanitize(String(userData.password));
      const bio = sanitize(String(userData.bio));
      const dob = sanitize(String(userData.dob));

      const exists = await query("SELECT id FROM users WHERE email=?", [userData.email]);
      if (exists.length && session.user_id != exists[0].id) { //if already taken, reject
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Email already in use!" }));
      }

      const hash = (userData.password) ? await bcrypt.hash(password, 12) : rows[0].password_hash;
      await query(`UPDATE users
        SET name_first = ?,
          name_last = ?,
          email = ?,
          password_hash = ?,
          bio = ?,
          dob = ?,
          gender = ?
        WHERE id = ?
        `, [firstname, lastname, email, hash, bio, dob, userData.gender, session.user_id])
      console.log("✓ Updated user profile in db");

      if (userData["picture"].length > 0) {
        //Create image
        let newImagePath = path.join(process.cwd(), "database", "uploads", "images", "profilePictures", `${session.user_id}.${userData.imageType}`);
        fs.writeFile(newImagePath, userData.picture, (err)=>{
          if(err){
            throw(err)
          }
        })

        //Update the picture path of the user
        await query("UPDATE users SET picture=? WHERE id=?", [path.join("/","images","profilePictures", `${session.user_id}.${userData.imageType}`), session.user_id]);
        console.log("✓ Updated user profile picture");
      }

      res.statusCode = 200;
      res.setHeader('content-type', 'text/plain')
      res.end('Updated\n');
    })
    } catch (e) {
      console.error(e);
    }
}

export function sanitize (str) {
  str = str
  .replace(/\//g,"")
  .replace(/\\/g,"")
  .replace(/\.\./g,"")
  .replace(/</g,"")
  .replace(/>/g,"")
  .replace(/'/g,"")
  .replace(/"/g,"")
  .replace(/&/g,"");
  return str.trim();
}