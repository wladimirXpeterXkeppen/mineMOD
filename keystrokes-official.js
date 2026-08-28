/* mineMOD — Keystrokes official-compatible rebuild */
(()=>{
  "use strict";
  const ID="mf-keystrokes";
  const STORE="sonnet-settings-v1";
  const VERSION="official-ks-v3";
  const DEFAULTS={
    x:20,y:100,size:1,theme:"default",
    showSpace:true,showLMB:true,showRMB:true,showCPS:true,
    rgb:false,editPosition:false,scale:10,
    border:false,borderThickness:.1,borderColour:"#ffffff",
    pressedBG:"rgba(255,255,255,.6)",pressedText:"#000000",
    shadow:false,arrows:false,layout:"wasd",
    keys:{shift:"ShiftLeft",crouch:"KeyC"}
  };
  const layouts={
    wasd:`<div class="row"><div class="key shift-key" data-shift>SHF</div><div class="key" data-key="KeyW">W</div><div class="key crouch-key" data-crouch>C</div></div><div class="row"><div class="key" data-key="KeyA">A</div><div class="key" data-key="KeyS">S</div><div class="key" data-key="KeyD">D</div></div><div class="row mouse-row"><div class="key wide cps" data-key="LMB">LMB<br><span class="cps-disp" data-cps="L">0</span></div><div class="key wide cps" data-key="RMB">RMB<br><span class="cps-disp" data-cps="R">0</span></div></div><div class="row space-row"><div class="key space" data-key="Space">_______</div></div>`,
    compact:`<div class="row"><div class="key" data-key="KeyW">W</div></div><div class="row"><div class="key" data-key="KeyA">A</div><div class="key" data-key="KeyS">S</div><div class="key" data-key="KeyD">D</div></div><div class="row mouse-row"><div class="key wide cps" data-key="LMB">LMB<br><span class="cps-disp" data-cps="L">0</span></div><div class="key wide cps" data-key="RMB">RMB<br><span class="cps-disp" data-cps="R">0</span></div></div>`,
    full:`<div class="row"><div class="key shift-key" data-shift>SHF</div><div class="key" data-key="KeyW">W</div><div class="key crouch-key" data-crouch>C</div></div><div class="row"><div class="key" data-key="KeyA">A</div><div class="key" data-key="KeyS">S</div><div class="key" data-key="KeyD">D</div></div><div class="row mouse-row"><div class="key wide cps" data-key="LMB">LMB<br><span class="cps-disp" data-cps="L">0</span></div><div class="key wide cps" data-key="RMB">RMB<br><span class="cps-disp" data-cps="R">0</span></div></div><div class="row space-row"><div class="key space" data-key="Space">SPACE</div></div><div class="row"><div class="key" data-key="Digit1">1</div><div class="key" data-key="Digit2">2</div><div class="key" data-key="Digit3">3</div><div class="key" data-key="Digit4">4</div></div>`,
    mouse_only:`<div class="row mouse-row"><div class="key wide cps" data-key="LMB">LMB<br><span class="cps-disp" data-cps="L">0</span></div><div class="key wide cps" data-key="RMB">RMB<br><span class="cps-disp" data-cps="R">0</span></div></div>`,
    arrows:`<div class="row"><div class="key" data-key="ArrowUp">↑</div></div><div class="row"><div class="key" data-key="ArrowLeft">←</div><div class="key" data-key="ArrowDown">↓</div><div class="key" data-key="ArrowRight">→</div></div><div class="row mouse-row"><div class="key wide cps" data-key="LMB">LMB<br><span class="cps-disp" data-cps="L">0</span></div><div class="key wide cps" data-key="RMB">RMB<br><span class="cps-disp" data-cps="R">0</span></div></div>`,
    cps_big:`<div class="row"><div class="key extra-wide tall cps" data-key="LMB">LEFT<br><span class="cps-disp" data-cps="L">0</span></div><div class="key extra-wide tall cps" data-key="RMB">RIGHT<br><span class="cps-disp" data-cps="R">0</span></div></div>`,
    wasd_no_mouse:`<div class="row"><div class="key" data-key="KeyW">W</div></div><div class="row"><div class="key" data-key="KeyA">A</div><div class="key" data-key="KeyS">S</div><div class="key" data-key="KeyD">D</div></div>`,
    pvp_pro:`<div class="row"><div class="key shift-key" data-shift>SHF</div><div class="key" data-key="KeyW">W</div><div class="key crouch-key" data-crouch>C</div></div><div class="row"><div class="key" data-key="KeyA">A</div><div class="key" data-key="KeyS">S</div><div class="key" data-key="KeyD">D</div></div><div class="row mouse-row"><div class="key wide cps" data-key="LMB">LMB<br><span class="cps-disp" data-cps="L">0</span></div><div class="key wide cps" data-key="RMB">RMB<br><span class="cps-disp" data-cps="R">0</span></div></div>`,
    hotbar:`<div class="row">${[1,2,3,4,5].map(n=>`<div class="key" data-key="Digit${n}">${n}</div>`).join("")}</div>`,
    survival:`<div class="row"><div class="key shift-key" data-shift>SHF</div><div class="key" data-key="KeyW">W</div><div class="key crouch-key" data-crouch>C</div></div><div class="row"><div class="key" data-key="KeyA">A</div><div class="key" data-key="KeyS">S</div><div class="key" data-key="KeyD">D</div></div><div class="row"><div class="key space" data-key="Space">SPACE</div></div><div class="row">${[1,2,3,4,5].map(n=>`<div class="key" data-key="Digit${n}">${n}</div>`).join("")}</div><div class="row">${[6,7,8,9].map(n=>`<div class="key" data-key="Digit${n}">${n}</div>`).join("")}</div><div class="row mouse-row"><div class="key wide cps" data-key="LMB">LMB<br><span class="cps-disp" data-cps="L">0</span></div><div class="key wide cps" data-key="RMB">RMB<br><span class="cps-disp" data-cps="R">0</span></div></div>`,
    minimal_dot:`<div class="row"><div class="key" data-key="KeyW">W</div><div class="key" data-key="KeyA">A</div><div class="key" data-key="KeyS">S</div><div class="key" data-key="KeyD">D</div></div>`,
    space_wasd:`<div class="row"><div class="key" data-key="KeyW">W</div></div><div class="row"><div class="key" data-key="KeyA">A</div><div class="key" data-key="KeyS">S</div><div class="key" data-key="KeyD">D</div></div><div class="row"><div class="key space" data-key="Space">SPACE</div></div>`,
    fps_only:`<div class="row"><div class="key" data-key="KeyW">W</div></div>`,
    three_key:`<div class="row"><div class="key" data-key="KeyA">A</div><div class="key" data-key="KeyW">W</div><div class="key" data-key="KeyD">D</div></div>`,
    full_plus_slots:`<div class="row"><div class="key shift-key" data-shift>SHF</div><div class="key" data-key="KeyW">W</div><div class="key crouch-key" data-crouch>C</div></div><div class="row"><div class="key" data-key="KeyA">A</div><div class="key" data-key="KeyS">S</div><div class="key" data-key="KeyD">D</div></div><div class="row"><div class="key space" data-key="Space">SPACE</div></div><div class="row">${[1,2,3,4,5].map(n=>`<div class="key" data-key="Digit${n}">${n}</div>`).join("")}</div><div class="row">${[6,7,8,9].map(n=>`<div class="key" data-key="Digit${n}">${n}</div>`).join("")}</div><div class="row mouse-row"><div class="key wide cps" data-key="LMB">LMB<br><span class="cps-disp" data-cps="L">0</span></div><div class="key wide cps" data-key="RMB">RMB<br><span class="cps-disp" data-cps="R">0</span></div></div>`
  };

  const css=document.createElement("style");
  css.textContent=`
#${ID}{position:fixed;top:100px;left:20px;display:flex;flex-direction:column;gap:4px;font-family:'Product Sans',Arial,sans-serif;user-select:none;transform-origin:top left;z-index:2147483646;pointer-events:none}
#${ID} .key-container{display:flex;flex-direction:column;gap:4px}
#${ID} .row{display:flex;gap:4px;justify-content:center}
#${ID} .key{width:45px;height:45px;background:rgba(0,0,0,.5);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:4px;font-weight:bold;transition:background .05s,transform .05s;font-size:16px;border:1px solid rgba(255,255,255,.1);box-sizing:border-box;line-height:1.1}
#${ID} .key.active{background:var(--mf-pressed-bg,rgba(255,255,255,.6))!important;color:var(--mf-pressed-text,#000)!important;transform:scale(.95)}
#${ID} .wide{width:70px}.space{width:144px!important;height:25px!important}.tall{height:70px!important}.extra-wide{width:100px!important}
#${ID} .ks-cps,#${ID} .cps-disp{font-size:10px;font-weight:normal;margin-top:2px;opacity:.8}
#${ID}[data-theme="celestar"] .key{background:linear-gradient(135deg,rgba(0,207,255,.12),rgba(123,47,255,.12));border-color:rgba(0,207,255,.35)}
#${ID}[data-theme="neon"] .key{background:rgba(0,0,0,.7);border-color:#ff00ff;color:#ff00ff;box-shadow:0 0 12px rgba(255,0,255,.4)}
#${ID}[data-theme="glass"] .key{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.2);backdrop-filter:blur(16px)}
#${ID}[data-theme="dark"] .key{background:rgba(0,0,0,.9);border-color:rgba(255,255,255,.06)}
#${ID}[data-theme="space"] .key{background:linear-gradient(135deg,rgba(4,8,28,.9),rgba(10,4,40,.9));border-color:rgba(0,207,255,.4);color:#a0dfff}
#${ID}[data-theme="cyberpunk"] .key{background:rgba(10,0,20,.92);border-color:#ff00ff;color:#ff88ff;border-radius:2px}
#${ID}[data-theme="ember"] .key{background:linear-gradient(135deg,rgba(30,8,0,.9),rgba(20,5,0,.9));border-color:rgba(255,80,0,.5);color:#ffaa66}
#${ID}[data-theme="frost"] .key{background:linear-gradient(135deg,rgba(200,240,255,.1),rgba(150,210,255,.06));border-color:rgba(180,230,255,.35);color:#c8f0ff}
#${ID}[data-theme="military"] .key{background:rgba(10,20,8,.9);border-color:rgba(60,120,40,.5);color:#88cc66}
#${ID}[data-theme="rainbow"] .key{animation:mfksRainbow 6s linear infinite;border-color:transparent}
@keyframes mfksRainbow{0%{background:rgba(255,0,0,.5)}16%{background:rgba(255,127,0,.5)}32%{background:rgba(255,255,0,.5)}48%{background:rgba(0,255,0,.5)}64%{background:rgba(0,0,255,.5)}80%{background:rgba(139,0,255,.5)}100%{background:rgba(255,0,0,.5)}}
#${ID}.ks-rgb .key{color:var(--ks-rgb-color,#fff);border-color:var(--ks-rgb-color,rgba(255,255,255,.1));text-shadow:0 0 5px var(--ks-rgb-color,transparent);box-shadow:inset 0 0 5px var(--ks-rgb-color,transparent),0 0 5px var(--ks-rgb-color,transparent)}
#${ID}.ks-rgb .key.active{background:var(--ks-rgb-color,rgba(255,255,255,.6))!important;color:#000!important}
#${ID}.ks-shadow .key{box-shadow:0 3px 12px rgba(0,0,0,.35)}
#${ID}.ks-edit{pointer-events:auto;cursor:move;outline:1px dashed rgba(255,255,255,.5)}
`;
  document.head.appendChild(css);

  function load(){
    let d={};try{d=JSON.parse(localStorage.getItem(STORE)||"{}")}catch{}
    const old=d.keystrokes||{};
    if(d.keystrokesVersion!==VERSION){
      d.keystrokes={...DEFAULTS,keys:{...DEFAULTS.keys}};
      d.keystrokesVersion=VERSION;
      localStorage.setItem(STORE,JSON.stringify(d));
    }else{
      d.keystrokes={...DEFAULTS,...old,keys:{...DEFAULTS.keys,...(old.keys||{})}};
    }
    d.modules={Keystrokes:true,...(d.modules||{})};
    return d;
  }
  function save(d){localStorage.setItem(STORE,JSON.stringify(d))}

  let ui=null;
  const held=new Set();
  const L=[],R=[];
  let drag=false,dx=0,dy=0;

  function create(){
    if(ui)return;
    ui=document.createElement("div");ui.id=ID;
    const inner=document.createElement("div");inner.className="key-container";ui.appendChild(inner);
    document.body.appendChild(ui);
    render();
  }

  function render(){
    create();
    const d=load(),s=d.keystrokes;
    const inner=ui.querySelector(".key-container");
    inner.innerHTML=layouts[s.layout]||layouts.wasd;
    ui.style.left=(Number.isFinite(+s.x)?s.x:20)+"px";
    ui.style.top=(Number.isFinite(+s.y)?s.y:100)+"px";
    ui.style.transform=`scale(${Math.max(.1,(+s.scale||10)/10)})`;
    ui.dataset.theme=s.theme||"default";
    ui.classList.toggle("ks-rgb",!!s.rgb);
    ui.classList.toggle("ks-shadow",!!s.shadow);
    ui.classList.toggle("ks-edit",!!s.editPosition);
    ui.style.setProperty("--mf-pressed-bg",s.pressedBG||"rgba(255,255,255,.6)");
    ui.style.setProperty("--mf-pressed-text",s.pressedText||"#000");
    if(s.border){ui.querySelectorAll(".key").forEach(e=>{e.style.borderWidth=Math.max(0,+s.borderThickness||.1)*10+"px";e.style.borderColor=s.borderColour||"#fff"})}
    const space=ui.querySelector(".space-row");if(space)space.style.display=s.showSpace?"flex":"none";
    ui.querySelectorAll('[data-key="LMB"]').forEach(e=>e.style.display=s.showLMB?"flex":"none");
    ui.querySelectorAll('[data-key="RMB"]').forEach(e=>e.style.display=s.showRMB?"flex":"none");
    ui.querySelectorAll(".mouse-row").forEach(e=>e.style.display=(s.showLMB||s.showRMB)?"flex":"none");
    ui.querySelectorAll(".cps-disp").forEach(e=>e.style.display=s.showCPS?"block":"none");
    if(s.arrows&&s.layout==="wasd"){
      const map={KeyW:"↑",KeyA:"←",KeyS:"↓",KeyD:"→"};
      for(const [c,t] of Object.entries(map)){const e=ui.querySelector(`[data-key="${c}"]`);if(e)e.textContent=t}
    }
    for(const code of held)ui.querySelectorAll(`[data-key="${code}"]`).forEach(e=>e.classList.add("active"));
  }

  window.addEventListener("keydown",e=>{
    const d=load();if(!d.modules.Keystrokes)return;
    held.add(e.code);
    if(e.code===d.keystrokes.keys.shift)ui?.querySelectorAll("[data-shift]").forEach(x=>x.classList.add("active"));
    if(e.code===d.keystrokes.keys.crouch)ui?.querySelectorAll("[data-crouch]").forEach(x=>x.classList.add("active"));
    ui?.querySelectorAll(`[data-key="${e.code}"]`).forEach(x=>x.classList.add("active"));
  },true);

  window.addEventListener("keyup",e=>{
    held.delete(e.code);
    ui?.querySelectorAll(`[data-key="${e.code}"]`).forEach(x=>x.classList.remove("active"));
    const d=load();
    if(e.code===d.keystrokes.keys.shift)ui?.querySelectorAll("[data-shift]").forEach(x=>x.classList.remove("active"));
    if(e.code===d.keystrokes.keys.crouch)ui?.querySelectorAll("[data-crouch]").forEach(x=>x.classList.remove("active"));
  },true);

  window.addEventListener("mousedown",e=>{
    const d=load();if(!d.modules.Keystrokes)return;
    const now=performance.now();
    if(e.button===0){L.push(now);ui?.querySelectorAll('[data-key="LMB"]').forEach(x=>x.classList.add("active"));}
    if(e.button===2){R.push(now);ui?.querySelectorAll('[data-key="RMB"]').forEach(x=>x.classList.add("active"));}
    if(d.keystrokes.editPosition&&ui?.contains(e.target)){drag=true;dx=e.clientX-ui.offsetLeft;dy=e.clientY-ui.offsetTop;}
  },true);

  window.addEventListener("mouseup",e=>{
    if(e.button===0)ui?.querySelectorAll('[data-key="LMB"]').forEach(x=>x.classList.remove("active"));
    if(e.button===2)ui?.querySelectorAll('[data-key="RMB"]').forEach(x=>x.classList.remove("active"));
    drag=false;
  },true);

  window.addEventListener("mousemove",e=>{
    if(!drag||!ui)return;
    const d=load();
    d.keystrokes.x=e.clientX-dx;d.keystrokes.y=e.clientY-dy;
    ui.style.left=d.keystrokes.x+"px";ui.style.top=d.keystrokes.y+"px";save(d);
  },true);

  function tick(){
    const now=performance.now();
    while(L.length&&L[0]<now-1000)L.shift();
    while(R.length&&R[0]<now-1000)R.shift();
    ui?.querySelectorAll('[data-cps="L"]').forEach(e=>e.textContent=L.length);
    ui?.querySelectorAll('[data-cps="R"]').forEach(e=>e.textContent=R.length);
    const d=load();
    if(ui){
      ui.style.display=d.modules.Keystrokes?"flex":"none";
      if(d.keystrokes.rgb)ui.style.setProperty("--ks-rgb-color",`hsl(${(Date.now()/10*1.2)%360},100%,65%)`);
      else ui.style.removeProperty("--ks-rgb-color");
    }
    requestAnimationFrame(tick);
  }

  window.__MineModKeystrokes={open(){openSettings()},render,getState:()=>load().keystrokes,reset(){const d=load();d.keystrokes={...DEFAULTS,keys:{...DEFAULTS.keys}};d.keystrokesVersion=VERSION;save(d);render()}};

  function openSettings(){
    document.getElementById("sonnet-ks-settings")?.remove();
    const d=load(),s=d.keystrokes,p=document.createElement("div");p.id="sonnet-ks-settings";
    /* settings are intentionally delegated to the existing mineMOD UI when available */
    const msg=document.createElement("div");msg.textContent="Keystrokes settings are available through the existing module settings. Right-click Keystrokes to open them.";p.appendChild(msg);document.body.appendChild(p);
  }

  create();
  requestAnimationFrame(tick);
})();
