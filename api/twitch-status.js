export default async function handler(req, res) {
  const channel = req.query.channel || req.query.user_login || req.query.login;

  if (!channel) {
    return res.status(400).json({ error: "Channel parameter is required. Use ?channel= or ?user_login=" });
  }

  try {
    // Get OAuth token from Twitch
    const tokenResponse = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: "vqn10zwyexdipvjr6p8fx7x63un9yt",
        client_secret: "yvk214nwpp8obo9xub1lzo8f5rrxxz",
        grant_type: "client_credentials",
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) {
      return res.status(502).json({ error: "Failed to obtain Twitch token", details: tokenData });
    }
    const accessToken = tokenData.access_token;

    // Get user ID from Twitch
    const userResponse = await fetch(`https://api.twitch.tv/helix/users?login=${encodeURIComponent(channel)}`, {
      headers: {
        "Client-ID": "vqn10zwyexdipvjr6p8fx7x63un9yt",
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    const userData = await userResponse.json();
    if (!userResponse.ok || !userData.data || userData.data.length === 0) {
      return res.status(404).json({ error: "Twitch channel not found", details: userData });
    }

    const userId = userData.data[0].id;

    // Get stream info
    const streamResponse = await fetch(`https://api.twitch.tv/helix/streams?user_id=${encodeURIComponent(userId)}`, {
      headers: {
        "Client-ID": "vqn10zwyexdipvjr6p8fx7x63un9yt",
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    const streamData = await streamResponse.json();
    if (!streamResponse.ok) {
      return res.status(502).json({ error: "Failed to fetch Twitch stream", details: streamData });
    }

    const isLive = Array.isArray(streamData.data) && streamData.data.length > 0;
    const viewerCount = isLive ? (streamData.data[0].viewer_count || 0) : 0;

    res.status(200).json({
      channel,
      live: isLive,
      viewers: viewerCount,
      raw: streamData,
    });
  } catch (error) {
    console.error("Twitch API Error:", error);
    res.status(500).json({ error: "Failed to fetch Twitch data" });
  }
}
