/* YinLove stream page v6: wider video */
(function(){
  const el = (s, root=document)=>root.querySelector(s);
  const els = (s, root=document)=>Array.from(root.querySelectorAll(s));
  const TWITCH_ID = "yinlove";
  const KICK_ID = "yinlove";

  function twitchPlayerSrc(){
    const parent = location.hostname || "localhost";
    return `https://player.twitch.tv/?channel=${encodeURIComponent(TWITCH_ID)}&parent=${encodeURIComponent(parent)}&muted=true`;
  }
  function twitchChatSrc(){
    const parent = location.hostname || "localhost";
    return `https://www.twitch.tv/embed/${encodeURIComponent(TWITCH_ID)}/chat?parent=${encodeURIComponent(parent)}&darkpopout`;
  }
  function kickPlayerSrc(){
    return `https://player.kick.com/${encodeURIComponent(KICK_ID)}?autoplay=true`;
  }

  function setProvider(p){
    const player = el("#playerFrame");
    const label = el(".provider-label");
    els('[data-provider="twitch"]').forEach(btn=>btn.setAttribute("aria-pressed", String(p==="twitch")));
    els('[data-provider="kick"]').forEach(btn=>btn.setAttribute("aria-pressed", String(p==="kick")));
    if(p==="twitch"){
      player.src = twitchPlayerSrc();
      if(label) label.textContent = "Twitch";
    }else{
      player.src = kickPlayerSrc();
      if(label) label.textContent = "Kick";
    }
  }

  function setFullMode(on){
    document.body.classList.toggle("full", !!on);
    document.documentElement.classList.toggle("full-root", !!on);
    el("#btnToggleFull").setAttribute("aria-pressed", String(!!on));
    updateTopbarHeightVar();
  }

  function updateTopbarHeightVar(){
    const tb = el("#topbar");
    const h = tb ? tb.getBoundingClientRect().height : 56;
    document.documentElement.style.setProperty("--topbar-h", h + "px");
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    el("#chatFrame").src = twitchChatSrc();

    // Buttons
    els('.iconbtn[data-provider="twitch"]').forEach(btn=>btn.addEventListener("click", ()=>setProvider("twitch")));
    els('.iconbtn[data-provider="kick"]').forEach(btn=>btn.addEventListener("click", ()=>setProvider("kick")));
    el('#btnToggleFull').addEventListener("click", ()=>{
      const pressed = el('#btnToggleFull').getAttribute("aria-pressed")==="true";
      setFullMode(!pressed);
    });
    els('.stage .links .iconbtn[data-provider="twitch"]').forEach(btn=>btn.addEventListener("click", ()=>setProvider("twitch")));
    els('.stage .links .iconbtn[data-provider="kick"]').forEach(btn=>btn.addEventListener("click", ()=>setProvider("kick")));

    setProvider("twitch");
    updateTopbarHeightVar();
    window.addEventListener("resize", updateTopbarHeightVar);
  });
})();