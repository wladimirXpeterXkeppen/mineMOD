/* mineMOD Sonnet integration bridge
 * Utility modules are registered only inside the Utility submenu.
 * Music Player, FPS Booster, and Ad Blocker are injected immediately when Utility opens.
 */
(()=>{
  "use strict";

  const install=()=>{
    const ui=window.__GalaxyUI;
    if(!ui?.showCategory||ui.showCategory.__mineModIntegrated)return false;

    const original=ui.showCategory;
    const timerKey="__mineModUtilityObserver";

    const isUtility=()=>ui.state?.current==="Utility";

    const addUtility=()=>{
      if(!isUtility())return false;

      const G=ui.state;
      const host=G.ui?.querySelector("#galaxy-buttons");
      if(!host)return false;

      const extras=[
        ["Music Player",()=>window.__MineModMP3?.open?.()],
        ["FPS Booster",()=>window.__MineModFPSBooster?.openFull?.()||window.__MineModFPSBooster?.setDisplay?.("full")],
        ["Ad Blocker",()=>window.__SonnetAdBypass?.toggle?.()]
      ];

      const existing=[...host.querySelectorAll(".galaxy-button")];
      const missing=extras.filter(([name])=>!host.querySelector(`[data-module="${name}"]`));
      if(!missing.length)return true;

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

      return true;
    };

    ui.showCategory=function(category){
      original(category);
      if(category==="Utility"){
        /* Inject in the same turn as the submenu is created. */
        addUtility();
      }
    };

    ui.showCategory.__mineModIntegrated=true;
    ui.showCategory.__fpsPatched=true;
    ui.showCategory.__original=original;

    /*
     * Watch only the actual Utility button container.
     * IMPORTANT: do not call addUtility during startup while the main menu is open.
     */
    const observer=new MutationObserver(()=>{
      if(isUtility())addUtility();
    });

    const startObserver=()=>{
      const host=ui.state?.ui?.querySelector("#galaxy-buttons");
      if(!host)return false;

      observer.observe(host,{childList:true});

      /* No initial injection here: main-menu buttons must remain untouched. */
      if(isUtility())addUtility();

      window[timerKey]={observer};
      return true;
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
