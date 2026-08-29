(()=>{
"use strict";
function boot(){
 const G=window.__GalaxyUI;
 if(!G?.showCategory||!G?.ui){setTimeout(boot,100);return}
 if(G.showCategory.__screenColorMenuPatched)return;
 const original=G.showCategory;
 G.showCategory=function(category){
   original(category);
   if(category!=="Visual")return;
   setTimeout(()=>{
     const host=G.ui?.querySelector("#galaxy-buttons");
     if(!host||host.querySelector('[data-module="Screen Color"]'))return;
     const buttons=[...host.querySelectorAll(".galaxy-button")];
     const b=document.createElement("button");
     b.type="button";b.className="galaxy-button";b.dataset.module="Screen Color";b.dataset.enabled="true";
     b.innerHTML='<span class="galaxy-label">Screen Color</span>';
     host.appendChild(b);
     const all=[...host.querySelectorAll(".galaxy-button")];
     const count=all.length;
     all.forEach((x,i)=>{x._baseAngle=-Math.PI/2+(Math.PI*2/count)*i});
     b.addEventListener("mouseenter",()=>{G.paused=true;G.wheel?.classList.add("galaxy-wheel-hover")});
     b.addEventListener("mouseleave",()=>{G.paused=false;G.wheel?.classList.remove("galaxy-wheel-hover")});
     b.addEventListener("click",e=>{e.stopPropagation();window.__MineModScreenColor?.open?.()});
     G.buttons.push(b);
   },0);
 };
 G.showCategory.__screenColorMenuPatched=true;
}
boot();
})();
