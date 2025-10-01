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
  function showTwitch(){
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
      }catch(e){}
    }
  }
  function showKick(){
    const mount=el("#twitch-embed");
    const kickFrame=el("#kickFrame");
    if(!mount||!kickFrame)return;
    if(twitchPlayer){try{twitchPlayer.pause();}catch{}}
    mount.hidden=true;
    mount.style.display="none";
    const src=`https://player.kick.com/${encodeURIComponent(KICK_ID)}?autoplay=true`;
    if(kickFrame.src!==src){kickFrame.src=src;}
    kickFrame.hidden=false;
    kickFrame.style.display="block";
  }
  function setProvider(p){
    els('[data-provider="twitch"]').forEach(btn=>btn.setAttribute("aria-pressed",String(p==="twitch")));
    els('[data-provider="kick"]').forEach(btn=>btn.setAttribute("aria-pressed",String(p==="kick")));
    const label=el(".provider-label");
    if(p==="twitch"){showTwitch();if(label)label.textContent="Twitch";}
    else{showKick();if(label)label.textContent="Kick";}
    computeStageHeight();
  }
  async function isKickLive(){
    try{
      const r=await fetch(`https://kick.com/api/v2/channels/${encodeURIComponent(KICK_ID)}`);
      if(!r.ok)return"unknown";
      const j=await r.json();
      return j&&j.livestream?"live":"offline";
    }catch{return"unknown";}
  }
  const TWITCH_STATUS_API = "/api/twitch-status";
  async function isTwitchLive(){
    try{
      const r=await fetch(`${TWITCH_STATUS_API}?user_login=${encodeURIComponent(TWITCH_ID)}`,{cache:"no-store",mode:"cors",credentials:"omit"});
      if(!r.ok)return"unknown";
      const j=await r.json();
      if(j&&j.live===true)return"live";
      if(j&&j.live===false)return"offline";
      return"unknown";
    }catch{return"unknown";}
  }
  async function refreshLiveDots(){
    try{
      const[kick,twitch]=await Promise.all([isKickLive(),isTwitchLive()]);
      console.log("[YinLove v"+APP_VERSION+"] status:",{kick,twitch});
      setDotStatus("kick",kick==="live"?"live":(kick==="offline"?"offline":"unknown"));
      setDotStatus("twitch",twitch==="live"?"live":(twitch==="offline"?"offline":"unknown"));
    }catch(e){
      console.warn("[YinLove] status check failed:",e);
      setDotStatus("kick","unknown");
      setDotStatus("twitch","unknown");
    }
  }
  function updateTopbarHeightVar(){
    const tb=el("#topbar");
    const h=tb?Math.round(tb.getBoundingClientRect().height):56;
    document.documentElement.style.setProperty("--topbar-h",h+"px");
  }
  function computeStageHeight(){
    const topbar=el("#topbar");
    const stageHeader=document.querySelector(".stage-header");
    const footer=document.querySelector(".footer");
    const layout=document.querySelector(".layout");
    const vp=(window.visualViewport&&window.visualViewport.height)||window.innerHeight;
    const tb=topbar?Math.round(topbar.getBoundingClientRect().height):56;
    const sh=(document.body.classList.contains("full"))?0:(stageHeader?Math.round(stageHeader.getBoundingClientRect().height):40);
    const ft=(document.body.classList.contains("full"))?0:(footer?Math.round(footer.getBoundingClientRect().height):0);
    let padV=0;
    if(layout){
      const cs=getComputedStyle(layout);
      padV=Math.round(parseFloat(cs.paddingTop||"0")+parseFloat(cs.paddingBottom||"0"));
    }
    const buffer=4;
    const available=Math.max(400,vp-tb-sh-ft-padV-buffer);
    document.documentElement.style.setProperty("--stage-h",available+"px");
  }
  function setFullMode(on){
    document.body.classList.toggle("full",!!on);
    document.documentElement.classList.toggle("full-root",!!on);
    const fullBtn=document.getElementById("btnToggleFull");
    if(fullBtn)fullBtn.setAttribute("aria-pressed",String(!!on));
    updateTopbarHeightVar();
    computeStageHeight();
  }
  const themes=["","theme-violet","theme-emerald","theme-rose"];
  function applySavedTheme(){
    const saved=localStorage.getItem("theme")||"";
    document.documentElement.classList.remove("theme-violet","theme-emerald","theme-rose");
    if(saved)document.documentElement.classList.add(saved);
  }
  function cycleTheme(){
    const saved=localStorage.getItem("theme")||"";
    const idx=themes.indexOf(saved);
    const next=themes[(idx+1)%themes.length];
    localStorage.setItem("theme",next);
    applySavedTheme();
  }
  document.addEventListener("DOMContentLoaded",async()=>{
    const chat=el("#chatFrame");
    if(chat)chat.src=twitchChatSrc();
    els('.iconbtn[data-provider="twitch"]').forEach(btn=>btn.addEventListener("click",e=>{e.preventDefault();setProvider("twitch");}));
    els('.iconbtn[data-provider="kick"]').forEach(btn=>btn.addEventListener("click",e=>{e.preventDefault();setProvider("kick");}));
    const fullBtn=document.getElementById("btnToggleFull");
    if(fullBtn)fullBtn.addEventListener("click",e=>{e.preventDefault();setFullMode(fullBtn.getAttribute("aria-pressed")!=="true");});
    const themeBtn=document.getElementById("btnTheme");
    if(themeBtn)themeBtn.addEventListener("click",e=>{e.preventDefault();cycleTheme();});
    applySavedTheme();
    updateTopbarHeightVar();
    computeStageHeight();
    window.addEventListener("resize",()=>{updateTopbarHeightVar();computeStageHeight();});
    setProvider("twitch");
    await refreshLiveDots();
    statusTimer=setInterval(refreshLiveDots,30*1000);
  });
})();




setInterval(fetchViewers, 30000); // refresh every 30s
fetchViewers();





if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    fetchViewers();
    setInterval(fetchViewers, 30000);
  });
} else {
  fetchViewers();
  setInterval(fetchViewers, 30000);
}


function setTotalCount(total){
  var el = document.getElementById("totalCount");
  if (el) el.textContent = String(total);
}


let _fvInFlight = false; let _kickZeroStrikes = 0; let _kickLast = {v:0, t:0};
async function fetchViewers() {
  if (_fvInFlight) return; _fvInFlight = true;
  try {
    const twitchRes = await fetch("/api/twitch-status?user_login=yinlove");
    const twitchData = await twitchRes.json();
    const kickRes = await fetch("/api/kick-status?channel=yinlove");
    const kickData = await kickRes.json();

    let twitchViewers = (twitchData && typeof twitchData.viewers === "number") ? twitchData.viewers : 0;
    let kickViewers = (kickData && typeof kickData.viewers === "number") ? kickData.viewers : 0;
    
    // Smooth Kick viewer count: avoid brief 0 blips
    try {
      const now = Date.now();
      if (kickViewers > 0) {
        _kickZeroStrikes = 0;
        _kickLast = { v: kickViewers, t: now };
      } else {
        _kickZeroStrikes++;
        const recent = (now - _kickLast.t) < 20000; // 20s window
        if (_kickZeroStrikes < 2 && recent && _kickLast.v > 0) {
          // keep last non-zero instead of flashing to 0
          kickViewers = _kickLast.v;
        }
      }
    } catch(e) { /* no-op */ }

    const totalViewers = twitchViewers + kickViewers;

    var tc = document.getElementById("totalCount");
    // Update live/offline chip
    var chip = document.getElementById("liveChip");
    var liveText = document.getElementById("liveText");
    var isLive = (twitchViewers > 0) || (kickViewers > 0);
    if (chip){
      chip.classList.toggle("live", isLive);
      chip.classList.toggle("offline", !isLive);
    }
    if (liveText){
      liveText.textContent = isLive ? "Live" : "Offline";
    }

if (tc) tc.textContent = String(totalViewers);
    var tCount = document.getElementById("twitchCount"); if (tCount) tCount.textContent = String(twitchViewers);
    var kCount = document.getElementById("kickCount"); if (kCount) kCount.textContent = String(kickViewers);

    var tTxt = document.getElementById("twitchViewers"); if (tTxt) tTxt.innerText = `Twitch: ${twitchViewers}`;
    var kTxt = document.getElementById("kickViewers"); if (kTxt) kTxt.innerText = `Kick: ${kickViewers}`;
    var totTxt = document.getElementById("totalViewers");
    if (totTxt && !totTxt.querySelector('svg')) { totTxt.innerText = `Total Viewers: ${totalViewers}`; }
  } catch (err) { console.error("Error fetching viewers", err); }
}

(function(){
  function onReady(fn){ if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  onReady(function(){ fetchViewers(); setInterval(fetchViewers, 30000); });
})();
