/* mineMOD MP3 integration - Utility menu + Right Shift */
(()=>{
  "use strict";
  const boot=()=>{
    const ui=window.__GalaxyUI, features=window.__SonnetFeatures;
    if(!ui||!features||!window.__MineModMP3){setTimeout(boot,50);return}

    features.data.ui.keybind="ShiftRight";
    features.save();

    const addMusicButton=()=>{
      const container=document.querySelector("#galaxy-buttons");
      if(!container)return;
      const center=document.querySelector("#galaxy-center-text");
      if(!center||center.textContent!=="Utility")return;
      if(container.querySelector(".minemod-mp3-menu-button"))return;

      const existing=[...container.querySelectorAll(".galaxy-button:not(.minemod-mp3-menu-button)")];
      const total=existing.length+1;
      existing.forEach((b,i)=>b._baseAngle=-Math.PI/2+(Math.PI*2/total)*i);

      const b=document.createElement("button");
      b.type="button";
      b.className="galaxy-button minemod-mp3-menu-button";
      b.dataset.module="Music Player";
      b.dataset.enabled="false";
      b.innerHTML='<span class="galaxy-label">Music Player</span>';
      b._baseAngle=-Math.PI/2+(Math.PI*2/total)*(total-1);
      b.addEventListener("mouseenter",()=>{ui.state.paused=true;ui.state.wheel?.classList.add("galaxy-wheel-hover")});
      b.addEventListener("mouseleave",()=>{ui.state.paused=false;ui.state.wheel?.classList.remove("galaxy-wheel-hover")});
      b.addEventListener("click",e=>{e.stopPropagation();window.__MineModMP3.open()});
      container.appendChild(b);
      ui.state.buttons.push(b);
    };

    const observer=new MutationObserver(addMusicButton);
    observer.observe(document.body,{childList:true,subtree:true});
    addMusicButton();

    window.__MineModMP3Integration={destroy(){
      observer.disconnect();
      document.querySelectorAll(".minemod-mp3-menu-button").forEach(x=>x.remove());
    }};
    console.log("[mineMOD] MP3 Player integrated / Right Shift enabled");
  };
  boot();
})();
