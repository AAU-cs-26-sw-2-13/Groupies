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
  try {
    console.log(req.headers)
    //Uses busboy to parse the data
    let userData = {}
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
    bb.on('close', async ()=>{
      if(!userData.password || !userData.firstName || !userData.lastName || !userData.gender || !userData.email || !userData.age || !userData.bio || !userData.picture){
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
        let userCreationResult = await query("INSERT INTO users (email, password_hash, name_first, name_last, country, gender, age, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [userData.email, hash, userData.firstName || null, userData.lastName, userData.country, userData.gender, userData.age, userData.bio || null])
        
        //Create image
        let newImagePath = path.join(process.cwd(), "database", "uploads", "images", "profilePictures", `${userCreationResult.insertId}.${userData.imageType}`);
        fs.writeFile(newImagePath, userData.picture, (err)=>{
          if(err){
            throw(err)
          }
        })

        //Update the picture path of the user
        await query("UPDATE users SET picture=? WHERE id=?", [path.join("/","images","profilePictures", `${userCreationResult.insertId}.${userData.imageType}`), userCreationResult.insertId]);
        
        //registration completed message
        res.writeHead(201, { "Content-Type": "application/json" }); 
        return res.end(JSON.stringify({ status: "registered" }));
      }
    })

    


    /*
    const { password, firstName, lastName, gender, email, country, age, bio, picture } = body;
    
    
    
    /* check if username AND password were received in JSON 
    if (!password || !email) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Email and Password req." }))
    }
    /* query the username/password 
    const exists = await query("SELECT id FROM users WHERE email=?", [email]);
    if (exists.length) { //if already taken, reject
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Email already in use!" }));
    }
    /* If username and password received and username unique, hash a password and query insert user 
    const hash = await bcrypt.hash(password, 12);
    await query("INSERT INTO users (email, password_hash, name_first, name_last, country, gender, age, bio, picture) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
       [email, hash, firstName || null, lastName, country, gender, age, bio || null, picture || null]);

    console.log(`✓ User registered: ${email}`); //Debug log
    res.writeHead(201, { "Content-Type": "application/json" }); //registration completed message
    return res.end(JSON.stringify({ status: "registered" }));*/
    } catch (e) {
      console.error(e);
    }
}

// -----  function registerPreferences
export async function registerPreferences(req, res){
  try {
    const body = await parseJSON(req);
    const { preference, email } = body;

    const user = await query("SELECT id FROM users WHERE email=?", [email]);
    if(!user || user.length ===0){
      res.writeHead(404, { "Content-Type": "application/json"});
      return res.end(JSON.stringify({status: "User not found"}));
    }

    for (let v of preference){
      await query(`
        INSERT INTO user_prefs (user_id, preference_id, preference_value) 
        VALUES (?, ?, 1)
        ON DUPLICATE KEY UPDATE
          preference_value = IF(preference_value = 1, 0, 1)`,
        [user[0].id, v]
      );
    }
    res.writeHead(201, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({status: "Preferences Added"}));
  } catch(e) {
    console.error(e);
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
  console.log(`Login recorded: ${email} , ${password} , ${sid}`)
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
    const user = rows[0];

    // Sanitize input
    const body = await parseJSON(req);
    
    let { firstname, lastname, email, password, dob, bio, picture } = body;
    firstname = sanitize(String(body.name_first));
    lastname = sanitize(String(body.name_last));
    email = sanitize(String(body.email));
    password = sanitize(String(body.password));
    bio = sanitize(String(body.bio));
    
    const hash = await bcrypt.hash(password, 12);
    await query(`UPDATE users
        SET name_first = ?,
          name_last = ?,
          email = ?,
          password_hash = ?,
          bio = ?
        WHERE id = ?
        `, [firstname, lastname, email, hash, bio, session.user_id])
    console.log("✓ Updated user in db");

    res.statusCode = 200;
    res.setHeader('content-type', 'text/plain')
    res.end('Updated\n');
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Internal server error" }));
  }
}

function sanitize (str) {
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