/* mineMOD - Screen Color Filter / 3 presets */
(()=>{
  "use strict";
  const KEY="minemod-color-filter-v1";
  const DEFAULT={brightness:100,contrast:100,saturation:100};
  let saved;
  try{saved=JSON.parse(localStorage.getItem(KEY)||"null")}catch{saved=null}
  const state={
    enabled:true,
    current:0,
    presets:Array.isArray(saved?.presets)&&saved.presets.length===3?saved.presets.map(p=>({...DEFAULT,...p})):Array.from({length:3},()=>({...DEFAULT}))
  };
  const persist=()=>localStorage.setItem(KEY,JSON.stringify({presets:state.presets}));
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,Number(n)||0));

  let overlay=null,panel=null;
  function ensureStyle(){
    if(document.getElementById("mm-color-style"))return;
    const s=document.createElement("style");s.id="mm-color-style";
    s.textContent=`#mm-color-overlay{position:fixed;inset:0;z-index:2147483640;pointer-events:none;background:transparent;backdrop-filter:none;-webkit-backdrop-filter:none}#mm-color-panel{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:2147483647;width:min(420px,88vw);padding:18px;border-radius:15px;background:rgba(4,8,20,.97);border:1px solid rgba(0,207,255,.35);box-shadow:0 0 40px rgba(0,207,255,.25);color:#fff;font:13px Arial,sans-serif}#mm-color-panel h3{margin:0 0 14px;color:#00cfff}#mm-color-panel .close{float:right;border:0;background:transparent;color:#fff;font-size:20px;cursor:pointer}#mm-color-panel .cf-row{display:grid;grid-template-columns:90px 1fr 52px;gap:9px;align-items:center;margin:11px 0}#mm-color-panel input[type=range]{width:100%}#mm-color-panel .cf-value{color:#8be9ff;text-align:right}#mm-color-panel .cf-presets{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:15px}#mm-color-panel button{padding:7px;border-radius:7px;border:1px solid rgba(0,207,255,.3);background:#071321;color:#fff;cursor:pointer}#mm-color-panel button:hover{background:rgba(0,207,255,.16);border-color:#00cfff}#mm-color-panel .selected{border-color:#00cfff;background:rgba(0,207,255,.12)}#mm-color-panel .cf-hint{margin-top:12px;text-align:center;color:#7893a3;font-size:11px}`;
    document.head.appendChild(s);
  }
  function apply(p){
    ensureStyle();
    if(!overlay){overlay=document.createElement("div");overlay.id="mm-color-overlay";document.body.appendChild(overlay)}
    const b=clamp(p.brightness,50,150),c=clamp(p.contrast,50,150),sat=clamp(p.saturation,0,200);
    overlay.style.backdropFilter=`brightness(${b}%) contrast(${c}%) saturate(${sat}%)`;
    overlay.style.webkitBackdropFilter=`brightness(${b}%) contrast(${c}%) saturate(${sat}%)`;
    overlay.dataset.preset=String(state.current+1);
  }
  function setValue(key,value){state.presets[state.current][key]=clamp(value,key==="saturation"?0:50,150);apply(state.presets[state.current]);renderPanel()}
  function savePreset(){persist();flash("保存しました")}
  function flash(text){if(!panel)return;const h=panel.querySelector(".cf-hint");if(h){const old=h.textContent;h.textContent=text;setTimeout(()=>{if(h.textContent===text)h.textContent=old},900)}}
  function switchPreset(i){state.current=i;apply(state.presets[i]);renderPanel()}
  function renderPanel(){
    if(!panel)return;
    const p=state.presets[state.current];
    panel.innerHTML=`<button class="close" id="mm-cf-close">×</button><h3>🎨 Screen Color</h3><div class="cf-row"><span>Brightness</span><input id="mm-cf-b" type="range" min="50" max="150" value="${p.brightness}"><span class="cf-value" id="mm-cf-bv">${p.brightness}%</span></div><div class="cf-row"><span>Contrast</span><input id="mm-cf-c" type="range" min="50" max="150" value="${p.contrast}"><span class="cf-value" id="mm-cf-cv">${p.contrast}%</span></div><div class="cf-row"><span>Saturation</span><input id="mm-cf-s" type="range" min="0" max="200" value="${p.saturation}"><span class="cf-value" id="mm-cf-sv">${p.saturation}%</span></div><div class="cf-presets">${[0,1,2].map(i=>`<button class="${i===state.current?"selected":""}" data-preset="${i}">Preset ${i+1}</button>`).join("")}</div><button id="mm-cf-save" style="width:100%;margin-top:8px">Save Preset ${state.current+1}</button><div class="cf-hint">「/」で保存した3プリセットを順番に切替</div>`;
    panel.querySelector("#mm-cf-close").onclick=()=>panel.remove();
    const bind=(id,key,vId)=>{const el=panel.querySelector(id),v=panel.querySelector(vId);el.oninput=e=>{const n=+e.target.value;state.presets[state.current][key]=n;v.textContent=n+"%";apply(state.presets[state.current])}};
    bind("#mm-cf-b","brightness","#mm-cf-bv");bind("#mm-cf-c","contrast","#mm-cf-cv");bind("#mm-cf-s","saturation","#mm-cf-sv");
    panel.querySelectorAll("[data-preset]").forEach(b=>b.onclick=()=>switchPreset(+b.dataset.preset));
    panel.querySelector("#mm-cf-save").onclick=savePreset;
  }
  function openPanel(){ensureStyle();panel=document.getElementById("mm-color-panel")||document.createElement("div");panel.id="mm-color-panel";document.body.appendChild(panel);renderPanel()}

  // The slash key cycles Preset 1 -> 2 -> 3 -> 1. Inputs/chat are ignored.
  document.addEventListener("keydown",e=>{
    if(e.key!=="/"||e.repeat)return;
    const t=e.target;if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.isContentEditable))return;
    e.preventDefault();e.stopPropagation();switchPreset((state.current+1)%3);
  },true);

  // Add "Screen Color" to the existing Visual submenu without replacing the existing modules.
  function patchGalaxy(){
    const G=window.__GalaxyUI;
    if(!G?.showCategory||G.showCategory.__colorPatched)return;
    const original=G.showCategory;
    G.showCategory=function(category){
      original(category);
      if(category!=="Visual")return;
      setTimeout(()=>{
        const host=G.ui?.querySelector?.("#galaxy-buttons");
        if(!host||host.querySelector('[data-module="Screen Color"]'))return;
        const buttons=G.buttons||[];const count=buttons.length+1;
        buttons.forEach((b,i)=>{b._baseAngle=-Math.PI/2+(Math.PI*2/count)*i});
        const b=document.createElement("button");b.type="button";b.className="galaxy-button";b.dataset.module="Screen Color";b.dataset.enabled="true";b.innerHTML='<span class="galaxy-label">Screen Color</span>';b._baseAngle=-Math.PI/2+(Math.PI*2/count)*(count-1);b.addEventListener("mouseenter",()=>{G.paused=true});b.addEventListener("mouseleave",()=>{G.paused=false});b.addEventListener("click",e=>{e.stopPropagation();openPanel()});host.appendChild(b);G.buttons.push(b);
      },0);
    };
    G.showCategory.__colorPatched=true;
  }
  ensureStyle();apply(state.presets[0]);
  const timer=setInterval(()=>{patchGalaxy();if(window.__GalaxyUI?.showCategory?.__colorPatched)clearInterval(timer)},100);
  window.__MineModColorFilter={state,apply,switchPreset,openPanel,savePreset};
})();
