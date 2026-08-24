/* mineMOD Sonnet integration bridge
 * Utility modules are registered synchronously with Sonnet UI.
 * Music Player and FPS Booster never wait for a timer to appear.
 */
(()=>{
  "use strict";
  const install=()=>{
    const ui=window.__GalaxyUI;
    if(!ui?.showCategory||ui.showCategory.__mineModIntegrated)return false;
    const original=ui.showCategory;
    const addUtility=()=>{
      const G=ui.state;
      const host=G.ui?.querySelector("#galaxy-buttons");
      if(!host)return;
      const extras=[
        ["Music Player",()=>window.__MineModMP3?.open?.()],
        ["FPS Booster",()=>window.__MineModFPSBooster?.openFull?.()||window.__MineModFPSBooster?.setDisplay?.("full")]
      ];
      const existing=[...host.querySelectorAll(".galaxy-button")];
      const missing=extras.filter(([name])=>!host.querySelector(`[data-module="${name}"]`));
      if(!missing.length)return;
      const total=existing.length+missing.length;
      existing.forEach((b,i)=>b._baseAngle=-Math.PI/2+(Math.PI*2/total)*i);
      missing.forEach(([name,handler],j)=>{
        const b=document.createElement("button");
        b.type="button";
        b.className="galaxy-button";
        b.dataset.module=name;
        b.dataset.enabled="false";
        b.innerHTML=`<span class="galaxy-label">${name}</span>`;
        b._baseAngle=-Math.PI/2+(Math.PI*2/total)*(existing.length+j);
        b.addEventListener("mouseenter",()=>{G.paused=true;G.wheel?.classList.add("galaxy-wheel-hover")});
        b.addEventListener("mouseleave",()=>{G.paused=false;G.wheel?.classList.remove("galaxy-wheel-hover")});
        b.addEventListener("click",e=>{e.stopPropagation();handler()});
        host.appendChild(b);
        G.buttons.push(b);
      });
    };
    ui.showCategory=function(category){
      original(category);
      if(category==="Utility")addUtility();
    };
    ui.showCategory.__mineModIntegrated=true;
    ui.showCategory.__fpsPatched=true;
    ui.showCategory.__original=original;
    return true;
  };
  if(!install()){
    queueMicrotask(()=>install());
  }
})();
