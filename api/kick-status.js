export default async function handler(req, res) {
  const { channel } = req.query;

  if (!channel) {
    return res.status(400).json({ error: "Channel parameter is required" });
  }

  try {
    const response = await fetch(`https://kick.com/api/v2/channels/${channel}`);
    const data = await response.json();

    const viewerCount = data.livestream ? data.livestream.viewer_count : 0;

    res.status(200).json({ viewers: viewerCount });
  } catch (error) {
    console.error("Kick API Error:", error);
    res.status(500).json({ error: "Failed to fetch Kick data" });
  }
}
