(()=>{
"use strict";
if(window.__MineModDebug?.destroy)window.__MineModDebug.destroy();
const state={open:false,last:performance.now(),frames:0,fps:0,frameMs:0,history:[],raf:0};
const el=document.createElement("div");el.id="minemod-debug";document.body.appendChild(el);
const st=document.createElement("style");st.id="minemod-debug-style";st.textContent=`#minemod-debug{position:fixed;left:8px;top:8px;z-index:2147483647;display:none;color:#fff;background:rgba(0,0,0,.68);padding:8px 10px;font:12px/1.35 monospace;white-space:pre;pointer-events:none;text-shadow:1px 1px #000;max-width:55vw;backdrop-filter:blur(2px)}#minemod-debug .title{font-weight:bold;margin-bottom:4px}#minemod-debug .dim{opacity:.78}`;document.head.appendChild(st);
function game(){const c=document.querySelector("canvas");const gl=c?.getContext?.("webgl2",{preserveDrawingBuffer:false})||c?.getContext?.("webgl",{preserveDrawingBuffer:false});return {canvas:c,gl}}
function update(now){const dt=now-state.last;state.last=now;state.frameMs=dt;state.frames++;if(dt>0&&dt<1000){state.history.push(1000/dt);if(state.history.length>30)state.history.shift();state.fps=state.history.reduce((a,b)=>a+b,0)/state.history.length}if(state.open)render();state.raf=requestAnimationFrame(update)}
function render(){const {canvas,gl}=game();const mem=performance.memory;const nav=navigator;const w=innerWidth,h=innerHeight;const dpr=devicePixelRatio||1;let renderer="Unavailable",vendor="Unavailable";if(gl){vendor=gl.getParameter(gl.VENDOR)||vendor;renderer=gl.getParameter(gl.RENDERER)||renderer}const now=new Date();const lines=["mineMOD Debug",`FPS: ${state.fps.toFixed(0)}  (${state.frameMs.toFixed(1)} ms)`,`Window: ${w} × ${h}  DPR: ${dpr.toFixed(2)}`,`Canvas: ${canvas?`${canvas.width} × ${canvas.height}`:"none"}`,`WebGL: ${gl?"active":"not detected"}`,`Renderer: ${renderer}`,`Vendor: ${vendor}`,`JS Heap: ${mem?`${(mem.usedJSHeapSize/1048576).toFixed(1)} / ${(mem.jsHeapSizeLimit/1048576).toFixed(0)} MB`:"unavailable"}`,`Online: ${nav.onLine?"yes":"no"}`,`Time: ${now.toLocaleTimeString()}`,"","Keyboard: F3 toggle debug","/ = Screen Color preset cycle"];el.textContent=lines.join("\n")}
function toggle(){state.open=!state.open;el.style.display=state.open?"block":"none";if(state.open)render()}
function key(e){if(e.key==="F3"){e.preventDefault();toggle()}}
document.addEventListener("keydown",key,true);state.raf=requestAnimationFrame(update);
window.__MineModDebug={state,toggle,open:()=>{state.open=true;el.style.display="block";render()},close:()=>{state.open=false;el.style.display="none"},destroy(){cancelAnimationFrame(state.raf);document.removeEventListener("keydown",key,true);el.remove();st.remove();delete window.__MineModDebug}};
})();
