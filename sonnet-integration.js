/* mineMOD Sonnet integration bridge
 * Utility modules are registered synchronously with Sonnet UI.
 * Music Player, FPS Booster, and Ad Blocker are injected as soon as Utility exists.
 */
(()=>{
  "use strict";

  const install=()=>{
    const ui=window.__GalaxyUI;
    if(!ui?.showCategory||ui.showCategory.__mineModIntegrated)return false;

    const original=ui.showCategory;
    const timerKey="__mineModUtilityObserver";

    const addUtility=()=>{
      const G=ui.state;
      const host=G.ui?.querySelector("#galaxy-buttons");
      if(!host)return;

      const extras=[
        ["Music Player",()=>window.__MineModMP3?.open?.()],
        ["FPS Booster",()=>window.__MineModFPSBooster?.openFull?.()||window.__MineModFPSBooster?.setDisplay?.("full")],
        ["Ad Blocker",()=>window.__SonnetAdBypass?.toggle?.()]
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
        b.dataset.enabled=name==="Ad Blocker"?String(!!window.__SonnetAdBypass?.isEnabled?.()):"false";
        b.classList.toggle("active",name==="Ad Blocker"&&!!window.__SonnetAdBypass?.isEnabled?.());
        b.innerHTML=`<span class="galaxy-label">${name}</span>`;
        b._baseAngle=-Math.PI/2+(Math.PI*2/total)*(existing.length+j);

        b.addEventListener("mouseenter",()=>{
          G.paused=true;
          G.wheel?.classList.add("galaxy-wheel-hover");
        });
        b.addEventListener("mouseleave",()=>{
          G.paused=false;
          G.wheel?.classList.remove("galaxy-wheel-hover");
        });
        b.addEventListener("click",e=>{
          e.stopPropagation();
          handler();
          if(name==="Ad Blocker"){
            const on=!!window.__SonnetAdBypass?.isEnabled?.();
            b.dataset.enabled=String(on);
            b.classList.toggle("active",on);
          }
        });

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

    /*
     * Fix the late FPS button:
     * observe the actual radial-button container instead of waiting for a timer.
     */
    const observer=new MutationObserver(()=>{
      if(ui.state?.current==="Utility")addUtility();
    });

    const startObserver=()=>{
      const host=ui.state?.ui?.querySelector("#galaxy-buttons");
      if(host){
        observer.observe(host,{childList:true});
        addUtility();
        window[timerKey]={observer};
        return true;
      }
      return false;
    };

    if(!startObserver()){
      const boot=new MutationObserver(()=>{
        if(startObserver())boot.disconnect();
      });
      boot.observe(document.body,{childList:true,subtree:true});
      window[timerKey]={observer:boot};
    }

    return true;
  };

  const retry=()=>{
    if(install())return;
    requestAnimationFrame(retry);
  };

  retry();
})();
