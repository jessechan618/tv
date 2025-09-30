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
    
    computeStageHeight();
  }

  function setFullMode(on){
    document.body.classList.toggle("full", !!on);
    document.documentElement.classList.toggle("full-root", !!on);
    const fullBtn = el("#btnToggleFull");
    if(fullBtn) fullBtn.setAttribute("aria-pressed", String(!!on));
    updateTopbarHeightVar();
    computeStageHeight();
  }

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
    const sh = stageHeader ? Math.round(stageHeader.getBoundingClientRect().height) : 40;
    const ft = footer ? Math.round(footer.getBoundingClientRect().height) : 0;

    let padV = 0;
    if (layout) {
      const cs = getComputedStyle(layout);
      padV = Math.round(parseFloat(cs.paddingTop || "0") + parseFloat(cs.paddingBottom || "0"));
    }

    const buffer = 4;
    const available = Math.max(400, vp - tb - sh - ft - padV - buffer);
    document.documentElement.style.setProperty("--stage-h", available + "px");
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    
    const chat = el("#chatFrame");
    if(chat) chat.src = twitchChatSrc();

    
    els('.iconbtn[data-provider="twitch"]').forEach(btn=>{
      btn.addEventListener("click", (e)=>{
        e.preventDefault();
        setProvider("twitch");
      });
    });
    els('.iconbtn[data-provider="kick"]').forEach(btn=>{
      btn.addEventListener("click", (e)=>{
        e.preventDefault();
        setProvider("kick");
      });
    });

    
    const fullBtn = el('#btnToggleFull');
    if(fullBtn){
      fullBtn.addEventListener("click", (e)=>{
        e.preventDefault();
        const pressed = fullBtn.getAttribute("aria-pressed")==="true";
        setFullMode(!pressed);
      });
    }

    
    setProvider("twitch");
    updateTopbarHeightVar();
    computeStageHeight();

    
    window.addEventListener("resize", ()=>{
      updateTopbarHeightVar();
      computeStageHeight();
    });
  });
})();