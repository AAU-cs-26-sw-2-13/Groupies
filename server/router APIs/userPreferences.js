export async function setUserPreference(req, res) {
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