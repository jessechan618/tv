/* YinLove stream page v13.4 — GitHub Pages friendly + Vercel status API
   - Exclusive Twitch/Kick players (no double player)
   - Autoplay (Twitch muted + play(); Kick ?autoplay=true)
   - Twitch chat always visible on the right
   - Theme switcher + Full mode layout
   - Live status dots (every 30s), explicit colors: live=green, offline=red, unknown=gray
   - FIXED: correct status URL (single ?user_login=...), endpoint baked in for GH Pages
*/
(function(){
  const el  = (s, root=document)=>root.querySelector(s);
  const els = (s, root=document)=>Array.from(root.querySelectorAll(s));

  const APP_VERSION = "13.4";
  const TWITCH_ID = "yinlove";
  const KICK_ID   = "yinlove";

  // Use your Vercel function so GH Pages can fetch cross-origin
  const TWITCH_STATUS_API = "https://tv-8lo9ovk82-jessechan618s-projects.vercel.app/api/twitch-status";

  let twitchPlayer = null;
  let statusTimer  = null;

  // ----- Chat (always Twitch) -----
  function twitchChatSrc(){
    const parent = location.hostname || "localhost";
    return `https://www.twitch.tv/embed/${encodeURIComponent(TWITCH_ID)}/chat?parent=${encodeURIComponent(parent)}&darkpopout`;
  }

  // ----- Dot helper (explicit colors + data-status for CSS) -----
  function setDotStatus(which, status){
    // which: "twitch" or "kick"; status: "live" | "offline" | "unknown"
    const id = which === "twitch" ? "#dot-twitch" : "#dot-kick";
    const dot = document.querySelector(id);
    if(!dot) return;
    dot.setAttribute("data-status", status);
    // Inline fallback (in case of CSS caching)
    if(status === "live"){
      dot.style.background = "#10b981"; // green
    }else if(status === "offline"){
      dot.style.background = "#ef4444"; // red
    }else{
      dot.style.background = "#6b7280"; // gray
    }
  }

  // ----- Exclusive players (robust) -----
  function showTwitch(){
    const mount = el("#twitch-embed");
    const kickFrame = el("#kickFrame");
    if(!mount || !kickFrame) return;

    // Hide Kick fully
    kickFrame.hidden = true;
    kickFrame.style.display = "none";
    try { kickFrame.src = "about:blank"; } catch {}

    // Show Twitch container
    mount.hidden = false;
    mount.style.display = "block";

    if(twitchPlayer){
      try{
        twitchPlayer.setChannel(TWITCH_ID);
        twitchPlayer.setMuted(true);
        twitchPlayer.play();
      }catch{}
    }else{
      try{
        twitchPlayer = new Twitch.Player("twitch-embed", {
          width: "100%",
          height: "100%",
          channel: TWITCH_ID,
          parent: [location.hostname || "localhost"],
          muted: true,
          autoplay: true
        });
      }catch(e){
        console.warn("[YinLove] Twitch embed init failed:", e);
      }
    }
  }

  function showKick(){
    const mount = el("#twitch-embed");
    const kickFrame = el("#kickFrame");
    if(!mount || !kickFrame) return;

    // Pause/hide Twitch
    if(twitchPlayer){
      try{ twitchPlayer.pause(); }catch{}
    }
    mount.hidden = true;
    mount.style.display = "none";

    // Show Kick strictly inside the frame
    const src = `https://player.kick.com/${encodeURIComponent(KICK_ID)}?autoplay=true`;
    if(kickFrame.src !== src) kickFrame.src = src;
    kickFrame.hidden = false;
    kickFrame.style.display = "block";
  }

  function setProvider(p){
    els('[data-provider="twitch"]').forEach(btn=>btn.setAttribute("aria-pressed", String(p==="twitch")));
    els('[data-provider="kick"]').forEach(btn=>btn.setAttribute("aria-pressed", String(p==="kick")));
    const label = el(".provider-label");
    if(p==="twitch"){
      showTwitch();
      if(label) label.textContent = "Twitch";
    }else{
      showKick();
      if(label) label.textContent = "Kick";
    }
    computeStageHeight();
  }

  // ----- Live Detection -----
  async function isKickLive(){
    try{
      const r = await fetch(`https://kick.com/api/v2/channels/${encodeURIComponent(KICK_ID)}`);
      if(!r.ok) return "unknown";
      const j = await r.json();
      return j && j.livestream ? "live" : "offline";
    }catch{
      return "unknown";
    }
  }

  async function isTwitchLive(){
    try{
      // IMPORTANT: only one ?user_login, no duplicates
      const r = await fetch(`${TWITCH_STATUS_API}?user_login=${encodeURIComponent(TWITCH_ID)}`, {
        cache: "no-store",
        mode: "cors"
      });
      if(!r.ok) return "unknown";
      const j = await r.json();
      if (j && j.live === true)  return "live";
      if (j && j.live === false) return "offline";
      return "unknown";
    }catch{
      return "unknown";
    }
  }

  async function refreshLiveDots(){
    try{
      const [kick, twitch] = await Promise.all([isKickLive(), isTwitchLive()]);
      console.log("[YinLove v"+APP_VERSION+"] status:", {kick, twitch});
      setDotStatus("kick",   (kick   === "live" ? "live" : (kick   === "offline" ? "offline" : "unknown")));
      setDotStatus("twitch", (twitch === "live" ? "live" : (twitch === "offline" ? "offline" : "unknown")));
    }catch(e){
      console.warn("[YinLove] status check failed:", e);
      setDotStatus("kick", "unknown");
      setDotStatus("twitch", "unknown");
    }
  }

  // ----- Layout sizing (no scrollbars, full-mode aware) -----
  function updateTopbarHeightVar(){
    const tb = el("#topbar");
    const h = tb ? Math.round(tb.getBoundingClientRect().height) : 56;
    document.documentElement.style.setProperty("--topbar-h", h + "px");
  }

  function computeStageHeight(){
    const topbar = el("#topbar");
    const stageHeader = document.querySelector(".stage-header");
    const footer = document.querySelector(".footer");
    const layout = document.querySelector(".layout");
    const vp = (window.visualViewport && window.visualViewport.height) || window.innerHeight;
    const tb = topbar ? Math.round(topbar.getBoundingClientRect().height) : 56;
    const sh = (document.body.classList.contains("full")) ? 0 :
               (stageHeader ? Math.round(stageHeader.getBoundingClientRect().height) : 40);
    const ft = (document.body.classList.contains("full")) ? 0 :
               (footer ? Math.round(footer.getBoundingClientRect().height) : 0);
    let padV = 0;
    if (layout) {
      const cs = getComputedStyle(layout);
      padV = Math.round(parseFloat(cs.paddingTop || "0") + parseFloat(cs.paddingBottom || "0"));
    }
    const buffer = 4;
    const available = Math.max(400, vp - tb - sh - ft - padV - buffer);
    document.documentElement.style.setProperty("--stage-h", available + "px");
  }

  function setFullMode(on){
    document.body.classList.toggle("full", !!on);
    document.documentElement.classList.toggle("full-root", !!on);
    const fullBtn = document.getElementById("btnToggleFull");
    if(fullBtn) fullBtn.setAttribute("aria-pressed", String(!!on));
    updateTopbarHeightVar();
    computeStageHeight();
  }

  // ----- Theme -----
  const themes = ["", "theme-violet", "theme-emerald", "theme-rose"];
  function applySavedTheme(){
    const saved = localStorage.getItem("theme") || "";
    document.documentElement.classList.remove("theme-violet","theme-emerald","theme-rose");
    if(saved) document.documentElement.classList.add(saved);
  }
  function cycleTheme(){
    const saved = localStorage.getItem("theme") || "";
    const idx = themes.indexOf(saved);
    const next = themes[(idx+1) % themes.length];
    localStorage.setItem("theme", next);
    applySavedTheme();
  }

  // ----- Boot -----
  document.addEventListener("DOMContentLoaded", async ()=>{
    // Chat always Twitch
    const chat = el("#chatFrame");
    if(chat) chat.src = twitchChatSrc();

    // Buttons
    els('.iconbtn[data-provider="twitch"]').forEach(btn => btn.addEventListener("click", (e)=>{ e.preventDefault(); setProvider("twitch"); }));
    els('.iconbtn[data-provider="kick"]').forEach(btn   => btn.addEventListener("click", (e)=>{ e.preventDefault(); setProvider("kick"); }));
    const fullBtn = document.getElementById('btnToggleFull');
    if(fullBtn) fullBtn.addEventListener("click", (e)=>{ e.preventDefault(); setFullMode(fullBtn.getAttribute("aria-pressed")!=="true"); });
    const themeBtn = document.getElementById("btnTheme");
    if(themeBtn) themeBtn.addEventListener("click", (e)=>{ e.preventDefault(); cycleTheme(); });

    // Initial theme + layout
    applySavedTheme();
    updateTopbarHeightVar();
    computeStageHeight();
    window.addEventListener("resize", ()=>{ updateTopbarHeightVar(); computeStageHeight(); });

    // Default to Twitch visible (exclusive)
    setProvider("twitch");

    // Live dots now and every 30s (no auto-switch)
    await refreshLiveDots();
    statusTimer = setInterval(refreshLiveDots, 30 * 1000);
  });
})();
