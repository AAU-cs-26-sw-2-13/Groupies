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
  const rows = await query( //select the session IDs and match the session id to the user where s.id= [sid], which is saved in browser cookies.
    "SELECT s.id, u.id AS user_id, u.username, u.name " +
    "FROM sessions s JOIN users u ON u.id = s.user_id " +
    "WHERE s.id=? AND s.expires_at > NOW()", //provided the session id exists and not expired, in the contrary case login/registration is needed
    [sid]
  );
  return rows[0] || null;
}

// -----  function registerUserToDB: Input validate, check uniqueness, hash password and insert user to. ------
export async function registerUserToDB(req, res) {
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

// -----  function loginUser: Check user credentials, create session and set session cookie. ------
export async function loginUser(req, res) {
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
      username: session.username,
      name: session.name
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