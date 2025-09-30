/* YinLove stream page v2: always show Twitch chat, full-mode toggle */
(function(){
  const el = (s, root=document)=>root.querySelector(s);
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
    el('.chip[data-provider="twitch"]').setAttribute("aria-pressed", String(p==="twitch"));
    el('.chip[data-provider="kick"]').setAttribute("aria-pressed", String(p==="kick"));
    if(p==="twitch"){
      player.src = twitchPlayerSrc();
      label.textContent = "Twitch";
    }else{
      player.src = kickPlayerSrc();
      label.textContent = "Kick";
    }
  }

  function setFullMode(on){
    document.body.classList.toggle("full", !!on);
    el("#btnToggleFull").setAttribute("aria-pressed", String(!!on));
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    // Load Twitch chat immediately and always
    el("#chatFrame").src = twitchChatSrc();

    // Buttons
    el('.chip[data-provider="twitch"]').addEventListener("click", ()=>setProvider("twitch"));
    el('.chip[data-provider="kick"]').addEventListener("click", ()=>setProvider("kick"));
    el('#btnToggleFull').addEventListener("click", ()=>{
      const pressed = el('#btnToggleFull').getAttribute("aria-pressed")==="true";
      setFullMode(!pressed);
    });

    // Default to Twitch
    setProvider("twitch");
  });
})();