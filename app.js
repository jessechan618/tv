(function(){
  const el=(s,root=document)=>root.querySelector(s);
  const els=(s,root=document)=>Array.from(root.querySelectorAll(s));
  const TWITCH_ID="yinlove";
  const KICK_ID="yinlove";
  let twitchPlayer=null;
  let statusTimer=null;
  const APP_VERSION="17.0";
  function setDotStatus(which,status){
    const id=which==="twitch"?"#dot-twitch":"#dot-kick";
    const dot=document.querySelector(id);
    if(!dot)return;
    dot.setAttribute("data-status",status);
    if(status==="live"){dot.style.background="#10b981";}
    else if(status==="offline"){dot.style.background="#ef4444";}
    else{dot.style.background="#6b7280";}
  }
  function twitchChatSrc(){
    const parent=location.hostname||"localhost";
    return `https://www.twitch.tv/embed/${encodeURIComponent(TWITCH_ID)}/chat?parent=${encodeURIComponent(parent)}&darkpopout`;
  }
  \1
  try {
    if (typeof twitchPlayer !== 'undefined' && twitchPlayer && twitchPlayer.play) {
      try { twitchPlayer.setMuted(true); } catch(e){}
      try { twitchPlayer.play(); } catch(e){}
    }
    // If using iframe fallback
    var tIframe = document.getElementById('twitchFrame') || document.querySelector('#twitch-embed iframe');
    if (tIframe) {
      try {
        var u = new URL(tIframe.src, location.href);
        u.searchParams.set('autoplay', 'true');
        u.searchParams.set('muted', 'true');
        tIframe.src = u.toString();
      } catch(e){}
    }
  } catch(e){} 
const mount=el("#twitch-embed");
    const kickFrame=el("#kickFrame");
    if(!mount||!kickFrame)return;
    kickFrame.hidden=true;
    kickFrame.style.display="none";
    try{kickFrame.src="about:blank";}catch{}
    mount.hidden=false;
    mount.style.display="block";
    if(twitchPlayer){
      try{
        twitchPlayer.setMuted(true);
        twitchPlayer.play();
        twitchPlayer.setChannel(TWITCH_ID);
      }catch{}
    }else{
      try{
        twitchPlayer=new Twitch.Player("twitch-embed",{
          width:"100%",
          height:"100%",
          channel:TWITCH_ID,
          parent:[location.hostname||"localhost"],
          muted:true,
          autoplay:true
        });
      
      try{
        if (twitchPlayer && twitchPlayer.addEventListener){
          twitchPlayer.addEventListener(Twitch.Player.READY, function(){
            try{ twitchPlayer.setMuted(true); twitchPlayer.play(); }catch(e){}
          });
        }
      }catch(e){}}catch(e){}
    }
  }
  function showKick(){
    } catch(e){}
  });
});


// ---- Kick reminder toast logic (first-load only) ----
let _kickToastTimer = null;
function showKickNotice(force = false){
  try{
    const el = document.getElementById("kickToast");
    if (!el) return;
    const KEY = "kickNoticeSeenAt";
    const now = Date.now();
    const last = +(localStorage.getItem(KEY) || 0);
    // Only show once per 24h unless forced
    if (!force && (now - last) < 24*60*60*1000) return;

    el.classList.remove("hidden");

    const closeBtn = el.querySelector(".toast-close");
    if (closeBtn && !closeBtn.dataset.bound){
      closeBtn.addEventListener("click", () => { el.classList.add("hidden"); }, { once: true });
      closeBtn.dataset.bound = "1";
    }

    if (_kickToastTimer) clearTimeout(_kickToastTimer);
    _kickToastTimer = setTimeout(() => { el.classList.add("hidden"); }, 8000);

    localStorage.setItem(KEY, String(now));
  }catch(e){}
}

// Show once on first load
document.addEventListener("DOMContentLoaded", function(){
  try { showKickNotice(false); } catch(e){}
});
