export default async function handler(req, res) {
  const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,OPTIONS", "Access-Control-Allow-Headers": "Content-Type,Authorization,Client-ID" };
  if (req.method === "OPTIONS") return res.status(204).set(CORS).send();

  if (req.method !== "GET") return res.status(405).json({ error: "Method Not Allowed" });
  const user_login = (req.query.user_login || "yinlove").toString();
  const clientId = process.env.TWITCH_CLIENT_ID;
  const appToken = process.env.TWITCH_APP_ACCESS_TOKEN;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId) return res.status(500).set(CORS).json({ live: null, error: "Missing TWITCH_CLIENT_ID" });

  let token = appToken;
  try{
    if (!token && clientSecret) {
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
        token = j.access_token ? `Bearer ${j.access_token}` : null;
      }
    }
  }catch(e){}

  if (!token) return res.status(200).set(CORS).json({ live: null, source: "twitch", reason: "no_token" });

  try{
    const tr = await fetch(`https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(user_login)}`, {
      headers: { "Client-ID": clientId, "Authorization": token }
    });
    if (!tr.ok) return res.status(200).set(CORS).json({ live: null, source: "twitch", reason: "bad_response" });
    const j = await tr.json();
    const live = Array.isArray(j.data) && j.data.length > 0;
    return res.status(200).set(CORS).json({ live, source: "twitch" });
  }catch(e){
    return res.status(200).set(CORS).json({ live: null, source: "twitch", reason: "fetch_error" });
  }
}
