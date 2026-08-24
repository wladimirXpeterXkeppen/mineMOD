/* mineMOD FPS Booster - modular performance controls */
(()=>{
  "use strict";
  if(window.__MineModFPSBooster?.destroy)window.__MineModFPSBooster.destroy();

  const S={
    enabled:true,mode:"performance",level:2,display:"compact",raf:0,last:performance.now(),samples:[],fps:0,frames:0,
    webgl:2,effects:2,timerGuard:0,consoleMute:false,performanceCleanup:false,
    patchedWebgl:false,patchedTimer:false,patchedConsole:false,
    origGetContext:HTMLCanvasElement.prototype.getContext,
    origSetInterval:window.setInterval,
    origConsole:{log:console.log,warn:console.warn,error:console.error,info:console.info,debug:console.debug}
  };
  const MODES={adaptive:"Adaptive",balanced:"Balanced",performance:"Performance",ultra:"Ultra"};
  const LEVELS=["OFF","LIGHT","MEDIUM","STRONG"];
  const PRESETS={
    adaptive:{webgl:2,effects:1,timerGuard:0,consoleMute:false},
    balanced:{webgl:1,effects:1,timerGuard:0,consoleMute:false},
    performance:{webgl:2,effects:2,timerGuard:0,consoleMute:false},
    ultra:{webgl:3,effects:3,timerGuard:1,consoleMute:true}
  };

  function style(){
    if(document.getElementById("minemod-fps-style"))return;
    const st=document.createElement("style");st.id="minemod-fps-style";st.textContent=`
#minemod-fps-panel{position:fixed;top:10px;right:10px;z-index:2147483647;color:#fff;font:12px Arial,sans-serif;user-select:none}
#minemod-fps-panel.compact{padding:5px 9px;border-radius:7px;background:rgba(4,10,20,.75);border:1px solid rgba(0,220,255,.3);cursor:pointer}
#minemod-fps-panel.full{width:300px;padding:13px;border-radius:12px;background:rgba(4,10,20,.95);border:1px solid rgba(0,220,255,.4);box-shadow:0 0 22px rgba(0,220,255,.18);cursor:default}
#minemod-fps-panel .dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:#ffd166;margin-right:5px}
#minemod-fps-panel.ultra .dot{background:#ff5c6c}
#minemod-fps-panel.full .title{color:#00eaff;font-weight:800;font-size:14px;margin-bottom:9px}
#minemod-fps-panel.full .row{display:flex;justify-content:space-between;margin:5px 0;color:#cfefff}
#minemod-fps-panel.full button{width:100%;margin-top:7px;padding:7px;border-radius:7px;border:1px solid rgba(0,220,255,.35);background:rgba(0,220,255,.08);color:#fff;cursor:pointer}
#minemod-fps-panel.full button:hover{background:rgba(0,220,255,.18);border-color:#00eaff}
#minemod-fps-panel .advanced{margin-top:10px;padding-top:9px;border-top:1px solid rgba(0,220,255,.15)}
#minemod-fps-panel .advanced-title{color:#8db9c9;font-size:11px;margin-bottom:6px}
#minemod-fps-panel .toggle{display:grid;grid-template-columns:1fr 112px;align-items:center;gap:8px;padding:5px 2px;color:#d8edf5}
#minemod-fps-panel .toggle small{display:block;color:#6f8996;font-size:9px;margin-top:2px}
#minemod-fps-panel .level{width:112px;padding:5px;border-radius:6px;border:1px solid #16415b;background:#07101d;color:#fff;cursor:pointer}
#minemod-fps-panel .level:hover{border-color:#00eaff;background:#0b1a28}
#minemod-fps-panel .hint{margin-top:8px;color:#7893a3;font-size:10px;text-align:center}
html.mm-fps-1 canvas{image-rendering:auto}
html.mm-fps-2 canvas{image-rendering:auto}
html.mm-fps-3 canvas{image-rendering:pixelated!important}
html.mm-fps-effects-1 *{text-shadow:none!important}
html.mm-fps-effects-2 *{box-shadow:none!important;text-shadow:none!important}
html.mm-fps-effects-3 *{box-shadow:none!important;text-shadow:none!important;animation:none!important;transition:none!important}
`;
    document.head.appendChild(st);
  }

  function webgl(level){
    level=Math.max(0,Math.min(3,Number(level)||0));S.webgl=level;
    if(level>0&&!S.patchedWebgl){
      const original=S.origGetContext;
      HTMLCanvasElement.prototype.getContext=function(type,attrs){
        if(type==="webgl"||type==="webgl2"){
          attrs=Object.assign({},attrs||{});
          if(level>=1)attrs.antialias=false;
          if(level>=2)attrs.powerPreference="high-performance";
          if(level>=3)attrs.preserveDrawingBuffer=false;
        }
        return original.call(this,type,attrs);
      };
      S.patchedWebgl=true;
    }else if(level===0&&S.patchedWebgl){HTMLCanvasElement.prototype.getContext=S.origGetContext;S.patchedWebgl=false}
  }

  function effects(level){
    level=Math.max(0,Math.min(3,Number(level)||0));S.effects=level;
    document.documentElement.classList.remove("mm-fps-effects-1","mm-fps-effects-2","mm-fps-effects-3");
    if(level)document.documentElement.classList.add("mm-fps-effects-"+level);
  }

  function timerGuard(level){
    level=Math.max(0,Math.min(3,Number(level)||0));S.timerGuard=level;
    if(level>0&&!S.patchedTimer){
      const original=S.origSetInterval;
      window.setInterval=function(f,d,...a){
        const n=Number(d)||0;
        const min=level===1?50:level===2?100:250;
        return original.call(this,f,Math.max(min,n),...a);
      };
      S.patchedTimer=true;
    }else if(level===0&&S.patchedTimer){window.setInterval=S.origSetInterval;S.patchedTimer=false}
  }

  function consoleMute(on){
    S.consoleMute=!!on;
    if(on&&!S.patchedConsole){
      const noop=function(){};
      console.log=console.warn=console.error=console.info=console.debug=noop;
      S.patchedConsole=true;
    }else if(!on&&S.patchedConsole){Object.assign(console,S.origConsole);S.patchedConsole=false}
  }

  function performanceCleanup(){
    try{performance.clearMeasures();performance.clearMarks();}catch{}
    try{console.clear();}catch{}
  }

  function setOption(name,value){
    if(name==="webgl")webgl(value);
    else if(name==="effects")effects(value);
    else if(name==="timerGuard")timerGuard(value);
    else if(name==="consoleMute")consoleMute(value);
    else if(name==="performanceCleanup"&&value)performanceCleanup();
    render();
  }

  function optionButton(name,label,desc,value){
    return `<div class="toggle"><span>${label}<small>${desc}</small></span><button class="level" data-opt="${name}" data-value="${value}">${LEVELS[value]||"ON"}</button></div>`;
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
    if(S.display==="compact"){p.innerHTML=`<span class="dot"></span>${name} · ${Math.round(S.fps||0)} FPS`;return}
    p.innerHTML=`
      <div class="title">mineMOD FPS Booster</div>
      <div class="row"><span>FPS</span><b>${Math.round(S.fps||0)}</b></div>
      <div class="row"><span>Target</span><b>60 FPS</b></div>
      <div class="row"><span>Mode</span><b>${name}</b></div>
      <div class="row"><span>Power Level</span><b>${S.level}/3</b></div>
      <div class="row"><span>Booster</span><b>${S.enabled?"ON":"OFF"}</b></div>
      <button data-a="mode">Change Mode</button>
      <button data-a="display">Compact Display</button>
      <button data-a="power">${S.enabled?"Disable Booster":"Enable Booster"}</button>
      <div class="advanced">
        <div class="advanced-title">Advanced Performance Controls</div>
        ${optionButton("webgl","WebGL optimization","GPU context settings",S.webgl)}
        ${optionButton("effects","Visual effects reduction","UI effects",S.effects)}
        ${optionButton("timerGuard","Timer guard","minimum interval",S.timerGuard)}
        <div class="toggle"><span>Console mute<small>logs off</small></span><button class="level" data-opt="consoleMute" data-value="${S.consoleMute?1:0}">${S.consoleMute?"ON":"OFF"}</button></div>
        <div class="toggle"><span>Performance cleanup<small>one-shot</small></span><button class="level" data-opt="performanceCleanup" data-value="0">RUN</button></div>
      </div>
      <div class="hint">各項目をクリックして OFF / LIGHT / MEDIUM / STRONG を切替</div>`;
    p.querySelector('[data-a="mode"]').onclick=e=>{e.stopPropagation();cycle()};
    p.querySelector('[data-a="display"]').onclick=e=>{e.stopPropagation();setDisplay("compact")};
    p.querySelector('[data-a="power"]').onclick=e=>{e.stopPropagation();S.enabled=!S.enabled;if(!S.enabled){webgl(0);effects(0);timerGuard(0);consoleMute(false)}else apply(S.mode)};
    p.querySelectorAll('[data-opt]').forEach(b=>b.onclick=e=>{
      e.stopPropagation();
      const n=b.dataset.opt;
      if(n==="consoleMute"){consoleMute(!S.consoleMute)}
      else if(n==="performanceCleanup"){performanceCleanup()}
      else {const v=(Number(b.dataset.value)+1)%4;setOption(n,v)}
    });
  }

  function setDisplay(v){S.display=v==="full"?"full":"compact";render()}
  function level(n){S.level=Math.max(0,Math.min(3,n));document.documentElement.classList.remove("mm-fps-1","mm-fps-2","mm-fps-3");if(S.enabled&&S.level)document.documentElement.classList.add("mm-fps-"+S.level);render()}

  function apply(m){
    if(!MODES[m])m="performance";
    S.mode=m;S.enabled=true;
    const p=PRESETS[m]||PRESETS.performance;
    webgl(p.webgl);effects(p.effects);timerGuard(p.timerGuard);consoleMute(p.consoleMute);
    if(m==="adaptive")level(2);else if(m==="balanced")level(1);else if(m==="performance")level(2);else level(3);
  }

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

  function loop(now){
    const dt=now-S.last;S.last=now;S.frames++;
    if(dt>0&&dt<1000){S.samples.push(1000/dt);if(S.samples.length>30)S.samples.shift()}
    if(S.samples.length>=10)S.fps=S.samples.reduce((a,b)=>a+b,0)/S.samples.length;
    if(S.mode==="adaptive"&&S.samples.length>=10){if(S.fps<43&&S.level<3)level(S.level+1);else if(S.fps<50&&S.level<2)level(S.level+1);else if(S.fps<56&&S.level<1)level(S.level+1);else if(S.fps>59.5&&S.level>0)level(S.level-1)}
    if((S.frames%30)===0&&window.__GalaxyUI?.state?.current==="Utility")utilityButton();
    if(S.display==="full"&&S.frames%15===0)render();
    S.raf=requestAnimationFrame(loop);
  }

  function destroy(){
    cancelAnimationFrame(S.raf);
    if(S.patchedWebgl)HTMLCanvasElement.prototype.getContext=S.origGetContext;
    if(S.patchedTimer)window.setInterval=S.origSetInterval;
    if(S.patchedConsole)Object.assign(console,S.origConsole);
    document.getElementById("minemod-fps-style")?.remove();
    document.getElementById("minemod-fps-panel")?.remove();
    document.documentElement.classList.remove("mm-fps-1","mm-fps-2","mm-fps-3","mm-fps-effects-1","mm-fps-effects-2","mm-fps-effects-3");
    delete window.__MineModFPSBooster;
  }

  style();panel();apply("performance");patchUtility();S.raf=requestAnimationFrame(loop);
  window.__MineModFPSBooster={state:S,modes:MODES,destroy,setMode:apply,setLevel:level,setDisplay,setOption,cycle};
  console.log("[mineMOD FPS Booster] per-feature power levels loaded");
})();
