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