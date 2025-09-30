export default async function handler(req, res) {
  const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization,Client-ID"
  };

  if (req.method === "OPTIONS") {
    return res.status(204).set(CORS).send();
  }
  if (req.method !== "GET") {
    return res.status(405).set(CORS).json({ error: "Method Not Allowed" });
  }

  const user_login = (req.query.user_login || "yinlove").toString().trim();
  const clientId   = process.env.TWITCH_CLIENT_ID;
  let   token      = process.env.TWITCH_APP_ACCESS_TOKEN; // e.g. "Bearer abc..."
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId) {
    // Don’t leak a 401 to the browser; return 200 with a neutral payload (and CORS).
    return res.status(200).set(CORS).json({ live: null, source: "twitch", reason: "missing_client_id" });
  }

  // If no Bearer token provided, try to obtain one with client credentials flow
  if (!token && clientSecret) {
    try {
      const r = await fetch("https://id.twitch.tv/oauth2/token", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "client_credentials"
        })
      });
      if (r.ok) {
        const j = await r.json();
        if (j && j.access_token) token = `Bearer ${j.access_token}`;
      }
    } catch {}
  }

  if (!token) {
    // Still no token — return neutral payload, not a 401 (so browsers won’t show auth dialogs)
    return res.status(200).set(CORS).json({ live: null, source: "twitch", reason: "no_token" });
  }

  try {
    const tr = await fetch(`https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(user_login)}`, {
      headers: { "Client-ID": clientId, "Authorization": token }
    });

    // If Twitch returns 401/403 etc, don’t forward that status code to the browser
    if (!tr.ok) {
      const text = await tr.text().catch(() => "");
      return res.status(200).set(CORS).json({ live: null, source: "twitch", reason: "bad_response", status: tr.status, details: text.slice(0, 200) });
    }

    const data = await tr.json();
    const live = Array.isArray(data?.data) && data.data.length > 0;
    return res.status(200).set(CORS).json({ live, source: "twitch" });
  } catch (e) {
    return res.status(200).set(CORS).json({ live: null, source: "twitch", reason: "fetch_error" });
  }
}
