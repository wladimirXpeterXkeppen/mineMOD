/* mineMOD MP3 integration — unified menu bridge
 * The MP3 player itself remains in mp3-player.js, while this file is only the
 * compatibility bridge that registers it in Sonnet's radial menu.
 */
(()=>{
  "use strict";
  const boot=()=>{
    const ui=window.__GalaxyUI;
    const mp3=window.__MineModMP3;
    const features=window.__SonnetFeatures;
    if(!ui||!mp3||!features){setTimeout(boot,50);return}

    // Right Shift is the only menu hotkey.
    features.data.ui.keybind="ShiftRight";
    features.save();

    // Register Music Player whenever Utility is rendered.
    const originalShowCategory=ui.showCategory;
    const originalShowMain=ui.showMain;
    const register=()=>{
      const container=document.querySelector("#galaxy-buttons");
      const title=document.querySelector("#galaxy-center-text");
      if(!container||title?.textContent!=="Utility")return;
      if(container.querySelector('[data-module="Music Player"]'))return;

      const buttons=[...container.querySelectorAll(".galaxy-button")];
      const total=buttons.length+1;
      buttons.forEach((b,i)=>b._baseAngle=-Math.PI/2+(Math.PI*2/total)*i);

      const b=document.createElement("button");
      b.type="button";
      b.className="galaxy-button";
      b.dataset.module="Music Player";
      b.dataset.enabled="false";
      b.innerHTML='<span class="galaxy-label">Music Player</span>';
      b._baseAngle=-Math.PI/2+(Math.PI*2/total)*(total-1);
      b.addEventListener("mouseenter",()=>{ui.state.paused=true;ui.state.wheel?.classList.add("galaxy-wheel-hover")});
      b.addEventListener("mouseleave",()=>{ui.state.paused=false;ui.state.wheel?.classList.remove("galaxy-wheel-hover")});
      b.addEventListener("click",e=>{e.stopPropagation();mp3.open()});
      container.appendChild(b);
      ui.state.buttons.push(b);
    };

    ui.showCategory=(category)=>{
      originalShowCategory(category);
      if(category==="Utility")requestAnimationFrame(register);
    };
    ui.showMain=()=>originalShowMain();

    const observer=new MutationObserver(register);
    observer.observe(document.body,{childList:true,subtree:true});
    register();

    window.__MineModMP3Integration={destroy(){
      observer.disconnect();
      document.querySelectorAll('#galaxy-buttons [data-module="Music Player"]').forEach(x=>x.remove());
    }};
    console.log("[mineMOD] Music Player registered in Utility / Right Shift enabled");
  };
  boot();
})();
