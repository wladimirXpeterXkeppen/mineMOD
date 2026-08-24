/* mineMOD FPS Booster - integrated utility module */
(()=>{
  "use strict";
  if(window.__MineModFPSBooster?.destroy)window.__MineModFPSBooster.destroy();

  const S={enabled:true,mode:"performance",level:2,display:"compact",raf:0,last:performance.now(),samples:[],fps:0,patched:false,origGetContext:HTMLCanvasElement.prototype.getContext};
  const MODES={adaptive:"Adaptive",balanced:"Balanced",performance:"Performance",ultra:"Ultra"};

  function webgl(){
    if(S.patched)return;
    const original=S.origGetContext;
    HTMLCanvasElement.prototype.getContext=function(type,attrs){
      if(type==="webgl"||type==="webgl2")attrs=Object.assign({},attrs||{},{antialias:false,powerPreference:"high-performance",preserveDrawingBuffer:false});
      return original.call(this,type,attrs);
    };
    S.patched=true;
  }

  function style(){
    if(document.getElementById("minemod-fps-style"))return;
    const st=document.createElement("style");st.id="minemod-fps-style";st.textContent=`
#minemod-fps-panel{position:fixed;top:10px;right:10px;z-index:2147483647;color:#fff;font:12px Arial,sans-serif;user-select:none}
#minemod-fps-panel.compact{padding:5px 9px;border-radius:7px;background:rgba(4,10,20,.75);border:1px solid rgba(0,220,255,.3);cursor:pointer}
#minemod-fps-panel.full{width:225px;padding:13px;border-radius:12px;background:rgba(4,10,20,.95);border:1px solid rgba(0,220,255,.4);box-shadow:0 0 22px rgba(0,220,255,.18)}
#minemod-fps-panel .dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:#ffd166;margin-right:5px}
#minemod-fps-panel.ultra .dot{background:#ff5c6c}#minemod-fps-panel.full .title{color:#00eaff;font-weight:800;font-size:14px;margin-bottom:9px}
#minemod-fps-panel.full .row{display:flex;justify-content:space-between;margin:5px 0;color:#cfefff}
#minemod-fps-panel.full button{width:100%;margin-top:7px;padding:7px;border-radius:7px;border:1px solid rgba(0,220,255,.35);background:rgba(0,220,255,.08);color:#fff;cursor:pointer}
#minemod-fps-panel.full button:hover{background:rgba(0,220,255,.18);border-color:#00eaff}
#minemod-fps-panel .hint{margin-top:8px;color:#7893a3;font-size:10px;text-align:center}
`;
    document.head.appendChild(st);
  }

  function panel(){
    if(document.getElementById("minemod-fps-panel"))return;
    const p=document.createElement("div");p.id="minemod-fps-panel";document.body.appendChild(p);
    p.onclick=()=>{if(S.display==="compact")setDisplay("full")};render();
  }
  function render(){
    const p=document.getElementById("minemod-fps-panel");if(!p)return;
    const name=MODES[S.mode]||"Performance";
    p.className=(S.display==="compact"?"compact ":"full ")+(S.level>=3?"ultra":"performance");
    if(S.display==="compact"){p.innerHTML=`<span class="dot"></span>${name}`;return}
    p.innerHTML=`<div class="title">mineMOD FPS Booster</div><div class="row"><span>FPS</span><b>${Math.round(S.fps||0)}</b></div><div class="row"><span>Target</span><b>60 FPS</b></div><div class="row"><span>Mode</span><b>${name}</b></div><div class="row"><span>Power Level</span><b>${S.level}/3</b></div><div class="row"><span>Booster</span><b>${S.enabled?"ON":"OFF"}</b></div><button data-a="mode">Change Mode</button><button data-a="display">Compact Display</button><button data-a="power">${S.enabled?"Disable Booster":"Enable Booster"}</button><div class="hint">Compact表示をクリックすると再表示</div>`;
    p.querySelector('[data-a="mode"]').onclick=e=>{e.stopPropagation();cycle()};
    p.querySelector('[data-a="display"]').onclick=e=>{e.stopPropagation();setDisplay("compact")};
    p.querySelector('[data-a="power"]').onclick=e=>{e.stopPropagation();S.enabled=!S.enabled;apply(S.mode)};
  }
  function setDisplay(v){S.display=v==="full"?"full":"compact";render()}
  function level(n){S.level=Math.max(0,Math.min(3,n));document.documentElement.classList.remove("mm-fps-1","mm-fps-2","mm-fps-3");if(S.enabled&&S.level)document.documentElement.classList.add("mm-fps-"+S.level);render()}
  function apply(m){if(!MODES[m])m="performance";S.mode=m;S.enabled=true;if(m==="adaptive")level(2);else if(m==="balanced")level(1);else if(m==="performance")level(2);else level(3)}
  function cycle(){const k=Object.keys(MODES),i=k.indexOf(S.mode);apply(k[(i+1)%k.length])}

  function utilityButton(){
    const G=window.__GalaxyUI?.state;if(!G||!G.ui||G.current!=="Utility")return;
    const host=G.ui.querySelector("#galaxy-buttons");if(!host||host.querySelector('[data-module="FPS Booster"]'))return;
    const old=G.buttons.slice();const count=old.length+1;
    old.forEach((b,i)=>b._baseAngle=-Math.PI/2+(Math.PI*2/count)*i);
    const b=document.createElement("button");b.type="button";b.className="galaxy-button";b.dataset.module="FPS Booster";b.dataset.enabled="true";b.innerHTML='<span class="galaxy-label">FPS Booster</span>';b._baseAngle=-Math.PI/2+(Math.PI*2/count)*old.length;
    b.addEventListener("mouseenter",()=>{G.paused=true});b.addEventListener("mouseleave",()=>{G.paused=false});
    b.addEventListener("click",e=>{e.stopPropagation();setDisplay("full")});
    host.appendChild(b);G.buttons.push(b);
  }

  function patchUtility(){
    const G=window.__GalaxyUI;if(!G?.showCategory||G.showCategory.__fpsPatched)return;
    const original=G.showCategory;
    G.showCategory=function(category){original(category);if(category==="Utility")setTimeout(utilityButton,0)};
    G.showCategory.__fpsPatched=true;G.showCategory.__original=original;
  }

  function loop(now){const dt=now-S.last;S.last=now;if(dt>0&&dt<1000){S.samples.push(1000/dt);if(S.samples.length>30)S.samples.shift()}if(S.samples.length>=10)S.fps=S.samples.reduce((a,b)=>a+b,0)/S.samples.length;if(S.mode==="adaptive"&&S.samples.length>=10){if(S.fps<43&&S.level<3)level(S.level+1);else if(S.fps<50&&S.level<2)level(S.level+1);else if(S.fps<56&&S.level<1)level(S.level+1);else if(S.fps>59.5&&S.level>0)level(S.level-1)}if(S.display==="full"&&Math.round(now)%250<17)render();S.raf=requestAnimationFrame(loop)}

  function destroy(){cancelAnimationFrame(S.raf);if(S.patched)HTMLCanvasElement.prototype.getContext=S.origGetContext;document.getElementById("minemod-fps-style")?.remove();document.getElementById("minemod-fps-panel")?.remove();document.documentElement.classList.remove("mm-fps-1","mm-fps-2","mm-fps-3");delete window.__MineModFPSBooster}

  webgl();style();panel();apply("performance");patchUtility();S.raf=requestAnimationFrame(loop);
  window.__MineModFPSBooster={state:S,modes:MODES,destroy,setMode:apply,setLevel:level,setDisplay,cycle};
  console.log("[mineMOD FPS Booster] integrated; modes: Adaptive/Balanced/Performance/Ultra");
})();
