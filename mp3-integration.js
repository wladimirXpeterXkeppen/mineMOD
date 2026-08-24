/* mineMOD MP3 integration - Utility menu + Right Shift */
(()=>{
  "use strict";
  const boot=()=>{
    const ui=window.__GalaxyUI, features=window.__SonnetFeatures;
    if(!ui||!features||!window.__MineModMP3){setTimeout(boot,50);return}

    // Use Right Shift as the global Radial UI keybind.
    features.data.ui.keybind="ShiftRight";
    features.save();

    const originalShowCategory=ui.showCategory;
    if(!ui.__mp3Wrapped){
      ui.showCategory=function(category){
        originalShowCategory(category);
        if(category!=="Utility")return;
        const state=ui.state;
        const container=ui.state.ui?.querySelector?.("#galaxy-buttons") || document.querySelector("#galaxy-buttons");
        if(!container)return;
        document.querySelectorAll(".minemod-mp3-menu-button").forEach(x=>x.remove());
        // Recalculate the two Utility buttons so they sit opposite each other.
        const existing=[...container.querySelectorAll(".galaxy-button")];
        existing.forEach((b,i)=>b._baseAngle=-Math.PI/2+(Math.PI*2/2)*i);
        const b=document.createElement("button");
        b.type="button";b.className="galaxy-button minemod-mp3-menu-button";b.dataset.module="Music Player";b.dataset.enabled="false";
        b.innerHTML='<span class="galaxy-label">Music Player</span>';
        b._baseAngle=Math.PI/2;
        b.addEventListener("mouseenter",()=>{state.paused=true;state.wheel?.classList.add("galaxy-wheel-hover")});
        b.addEventListener("mouseleave",()=>{state.paused=false;state.wheel?.classList.remove("galaxy-wheel-hover")});
        b.addEventListener("click",e=>{e.stopPropagation();window.__MineModMP3.open()});
        container.appendChild(b);state.buttons.push(b);
        // Let the existing animation reveal the new button.
        b.style.setProperty("--orbit-x","0px");b.style.setProperty("--orbit-y","0px");
        ui.__mp3Button=b;
      };
      ui.__mp3Wrapped=true;
    }

    window.__MineModMP3Integration={destroy(){
      document.querySelectorAll(".minemod-mp3-menu-button").forEach(x=>x.remove());
    }};
    console.log("[mineMOD] MP3 Player integrated / Right Shift enabled");
  };
  boot();
})();
