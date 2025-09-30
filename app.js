/* YinLove stream page v10: live detection + themes */
(function(){
  const el = (s, root=document)=>root.querySelector(s);
  const els = (s, root=document)=>Array.from(root.querySelectorAll(s));

  const TWITCH_ID = "yinlove";
  const KICK_ID = "yinlove";
  const store = {
    theme: "theme",
    twitchClientId: "tw.client_id",
    twitchToken: "tw.token"
  };

  let twitchPlayer = null;
  let currentProvider = "twitch";

  function twitchChatSrc(){
    const parent = location.hostname || "localhost";
    return `https://www.twitch.tv/embed/${encodeURIComponent(TWITCH_ID)}/chat?parent=${encodeURIComponent(parent)}&darkpopout`;
  }
  function mountTwitch(){
    const mount = el("#twitch-embed");
    const kickFrame = el("#kickFrame");
    if(!mount) return;
    mount.hidden = false;
    kickFrame.hidden = true;
    if(twitchPlayer){
      twitchPlayer.setChannel(TWITCH_ID);
      return;
    }
    twitchPlayer = new Twitch.Player("twitch-embed", {
      width: "100%",
      height: "100%",
      channel: TWITCH_ID,
      parent: [location.hostname || "localhost"],
      muted: true,
      autoplay: true
    });
  }
  function mountKick(){
    const mount = el("#twitch-embed");
    const kickFrame = el("#kickFrame");
    const src = `https://player.kick.com/${encodeURIComponent(KICK_ID)}?autoplay=true`;
    kickFrame.src = src;
    kickFrame.hidden = false;
    mount.hidden = true;
  }

  function setProvider(p){
    currentProvider = p;
    els('[data-provider="twitch"]').forEach(btn=>btn.setAttribute("aria-pressed", String(p==="twitch")));
    els('[data-provider="kick"]').forEach(btn=>btn.setAttribute("aria-pressed", String(p==="kick")));
    const label = el(".provider-label");
    if(p==="twitch"){
      mountTwitch();
      if(label) label.textContent = "Twitch";
    }else{
      mountKick();
      if(label) label.textContent = "Kick";
    }
    computeStageHeight();
  }

  // ---- Live Detection ----
  async function isKickLive(){
    try{
      const r = await fetch(`https://kick.com/api/v2/channels/${encodeURIComponent(KICK_ID)}`);
      if(!r.ok) return false;
      const j = await r.json();
      return !!(j && j.livestream);
    }catch{ return false; }
  }
  async function isTwitchLiveViaAPI(){
    const clientId = localStorage.getItem(store.twitchClientId);
    const token = localStorage.getItem(store.twitchToken);
    if(!clientId || !token) return null; // unknown
    try{
      const r = await fetch(`https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(TWITCH_ID)}`, {
        headers: { "Client-ID": clientId, "Authorization": token }
      });
      if(!r.ok){ return null; }
      const j = await r.json();
      return Array.isArray(j.data) && j.data.length > 0;
    }catch{ return null; }
  }
  async function autoSelectProvider(){
    const [kickLive, twitchLive] = await Promise.all([isKickLive(), isTwitchLiveViaAPI()]);
    if(kickLive){ setProvider("kick"); return; }
    if(twitchLive === true){ setProvider("twitch"); return; }
    // unknown or both offline -> prefer Kick if user requested, else Twitch default
    setProvider("twitch");
  }

  // ---- Layout sizing ----
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
    const fullBtn = el("#btnToggleFull");
    if(fullBtn) fullBtn.setAttribute("aria-pressed", String(!!on));
    updateTopbarHeightVar();
    computeStageHeight();
  }

  // ---- Theme ----
  const themes = ["", "theme-violet", "theme-emerald", "theme-rose"];
  function applySavedTheme(){
    const saved = localStorage.getItem(store.theme) || "";
    document.documentElement.classList.remove("theme-violet","theme-emerald","theme-rose");
    if(saved) document.documentElement.classList.add(saved);
  }
  function cycleTheme(){
    const saved = localStorage.getItem(store.theme) || "";
    const idx = themes.indexOf(saved);
    const next = themes[(idx+1) % themes.length];
    localStorage.setItem(store.theme, next);
    applySavedTheme();
  }

  // ---- Settings (Twitch API) ----
  function openSettings(){
    const dlg = el("#dlgSettings");
    el("#twClientId").value = localStorage.getItem(store.twitchClientId) || "";
    el("#twToken").value = localStorage.getItem(store.twitchToken) || "";
    dlg.showModal();
  }
  function saveSettings(){
    const id = el("#twClientId").value.trim();
    let token = el("#twToken").value.trim();
    // convenience: if user pasted just the token without "Bearer ", add it
    if(token && !/^Bearer\\s/i.test(token)){ token = "Bearer " + token; }
    if(id) localStorage.setItem(store.twitchClientId, id); else localStorage.removeItem(store.twitchClientId);
    if(token) localStorage.setItem(store.twitchToken, token); else localStorage.removeItem(store.twitchToken);
  }

  document.addEventListener("DOMContentLoaded", async ()=>{
    // Chat always Twitch
    const chat = el("#chatFrame");
    if(chat) chat.src = twitchChatSrc();

    // Buttons
    els('.iconbtn[data-provider="twitch"]').forEach(btn=>btn.addEventListener("click", (e)=>{ e.preventDefault(); setProvider("twitch"); }));
    els('.iconbtn[data-provider="kick"]').forEach(btn=>btn.addEventListener("click", (e)=>{ e.preventDefault(); setProvider("kick"); }));
    const fullBtn = el('#btnToggleFull');
    if(fullBtn) fullBtn.addEventListener("click", (e)=>{ e.preventDefault(); setFullMode(fullBtn.getAttribute("aria-pressed")!=="true"); });

    const themeBtn = el("#btnTheme");
    if(themeBtn) themeBtn.addEventListener("click", (e)=>{ e.preventDefault(); cycleTheme(); });

    const settingsBtn = el("#btnSettings");
    const dlg = el("#dlgSettings");
    if(settingsBtn && dlg){
      settingsBtn.addEventListener("click", (e)=>{ e.preventDefault(); openSettings(); });
      el("#btnSettingsSave").addEventListener("click", ()=>{ saveSettings(); dlg.close(); autoSelectProvider(); });
    }

    // Initial theme + layout
    applySavedTheme();
    updateTopbarHeightVar();
    computeStageHeight();
    window.addEventListener("resize", ()=>{ updateTopbarHeightVar(); computeStageHeight(); });

    // Default mount Twitch so there's something while we check live
    setProvider("twitch");
    // Try to auto-select based on live status (Kick first priority)
    autoSelectProvider();
  });
})();