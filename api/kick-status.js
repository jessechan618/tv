export default async function handler(req, res) {
  const { channel } = req.query;
  if (!channel) {
    return res.status(400).json({ error: "Channel parameter is required" });
  }
  try {
    const r = await fetch(`https://kick.com/api/v2/channels/${encodeURIComponent(channel)}`, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; YinLoveBot/1.0; +https://yinlove.vercel.app)"
      },
      cache: "no-store"
    });
    const text = await r.text();
    if (!r.ok) {
      return res.status(r.status).json({ error: "Kick API error", status: r.status, body: text.slice(0,200) });
    }
    let data;
    try { data = JSON.parse(text); } catch (e) {
      return res.status(502).json({ error: "Kick API non-JSON", sample: text.slice(0,140) });
    }
    const live = !!(data.livestream && data.livestream.is_live !== false);
    const viewerCount = (live && data.livestream && typeof data.livestream.viewer_count === "number")
      ? data.livestream.viewer_count
      : 0;
    res.status(200).json({ viewers: viewerCount, live });
  } catch (error) {
    console.error("Kick API Error:", error);
    res.status(500).json({ error: "Failed to fetch Kick data" });
  }
}
