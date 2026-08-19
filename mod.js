/* Galaxy UI - Radial Menu + Themes */
(() => {
    "use strict";
    if (window.__GalaxyUI?.destroy) window.__GalaxyUI.destroy();

    const themes = {
        gaming: {name:"Gaming", blue:"#00eaff", green:"#7dff4d", glow:"#00d9ff"},
        hacker: {name:"Hacker", blue:"#00ff66", green:"#7cff00", glow:"#00ff55"},
        cyber: {name:"Cyber", blue:"#9b5cff", green:"#00eaff", glow:"#9b5cff"},
        ice: {name:"Ice", blue:"#8be9ff", green:"#d8fbff", glow:"#5bdcff"},
        neon: {name:"Neon", blue:"#ff3bd4", green:"#fff04a", glow:"#ff3bd4"}
    };

    const Galaxy = {open:false,angle:0,speed:.10,paused:false,raf:0,ui:null,wheel:null,center:null,buttons:[],current:"main",theme:localStorage.getItem("galaxy_theme")||"gaming"};
    const CATEGORIES=["Combat","Movement","Render","Player","Utility","World","Visual","Settings"];
    const MODULES={Combat:["KillAura","Reach","Velocity","Critical"],Movement:["AutoSprint","Sprint","Speed","Step"],Render:["Crosshair","Zoom","FPS","CPS"],Player:["FastPlace","AutoTool","Keystrokes","Perspective"],Utility:["Translator","Recorder","Optimizer","Chat"],World:["Coordinates","Time","Biome","Map"],Visual:["FullBright","Particles","Nametags","HitEffect"],Settings:["Theme","Animation","Scale","Keybind"]};
    const esc=v=>String(v).replace(/[&<>\'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));

    function applyTheme(){
        const t=themes[Galaxy.theme]||themes.gaming;
        Galaxy.ui.style.setProperty("--theme-blue",t.blue);
        Galaxy.ui.style.setProperty("--theme-green",t.green);
        Galaxy.ui.style.setProperty("--theme-glow",t.glow);
        Galaxy.ui.dataset.theme=Galaxy.theme;
        localStorage.setItem("galaxy_theme",Galaxy.theme);
    }

    function createUI(){
        const root=document.createElement("div"); root.id="galaxy-ui";
        root.innerHTML=`<div id="galaxy-overlay"></div><div id="galaxy-wheel"><div id="galaxy-ring"></div><div id="galaxy-buttons"></div><div id="galaxy-center"><span id="galaxy-center-text">Galaxy</span></div></div>`;
        document.body.appendChild(root); Galaxy.ui=root; Galaxy.wheel=root.querySelector("#galaxy-wheel"); Galaxy.center=root.querySelector("#galaxy-center");
        Galaxy.center.addEventListener("click",()=>Galaxy.current==="main"?close():showMain());
        applyTheme();
    }
    function clearButtons(){Galaxy.ui.querySelector("#galaxy-buttons").replaceChildren();Galaxy.buttons.length=0;}
    function resumeRotation(){
        Galaxy.paused=false;
        Galaxy.wheel.classList.remove("galaxy-wheel-hover");
        // 戻るボタンの上にカーソルが残っていても、いったん回転を再開する
        requestAnimationFrame(()=>{
            if(Galaxy.open) Galaxy.paused=false;
        });
    }
    function createRadialButtons(items,back=false){
        clearButtons(); const c=Galaxy.ui.querySelector("#galaxy-buttons"),list=back?[...items,"← 戻る"]:items,r=205,step=Math.PI*2/list.length;
        list.forEach((name,i)=>{
            const b=document.createElement("button"); b.type="button"; b.className="galaxy-button"; b.dataset.module=name;b.dataset.enabled="false";
            const a=-Math.PI/2+step*i;b.style.left=`calc(50% + ${Math.cos(a)*r}px)`;b.style.top=`calc(50% + ${Math.sin(a)*r}px)`;b.innerHTML=`<span class="galaxy-label">${esc(name)}</span>`;
            b.addEventListener("mouseenter",()=>{if(!b.dataset.returnButton){Galaxy.paused=true;Galaxy.wheel.classList.add("galaxy-wheel-hover")}});
            b.addEventListener("mouseleave",()=>{Galaxy.paused=false;Galaxy.wheel.classList.remove("galaxy-wheel-hover")});
            if(name==="← 戻る") b.dataset.returnButton="true";
            b.addEventListener("click",e=>{e.stopPropagation();if(name==="← 戻る"){resumeRotation();return showMain();}if(Galaxy.current==="main")return showCategory(name);if(name==="Theme")return showThemes();toggleModule(b,name)});
            c.appendChild(b);Galaxy.buttons.push(b);
        });
    }
    function showMain(){Galaxy.current="main";createRadialButtons(CATEGORIES);resumeRotation()}
    function showCategory(category){Galaxy.current=category;createRadialButtons(MODULES[category]||[],true)}
    function showThemes(){
        Galaxy.current="theme"; clearButtons(); const list=Object.keys(themes).map(k=>themes[k].name),c=Galaxy.ui.querySelector("#galaxy-buttons"),r=205,step=Math.PI*2/list.length;
        list.forEach((name,i)=>{const key=Object.keys(themes)[i],b=document.createElement("button");b.type="button";b.className="galaxy-button";b.dataset.theme=key;const a=-Math.PI/2+step*i;b.style.left=`calc(50% + ${Math.cos(a)*r}px)`;b.style.top=`calc(50% + ${Math.sin(a)*r}px)`;b.innerHTML=`<span class="galaxy-label">${esc(name)}</span>`;b.classList.toggle("active",key===Galaxy.theme);b.onclick=e=>{e.stopPropagation();Galaxy.theme=key;applyTheme();showThemes()};c.appendChild(b);Galaxy.buttons.push(b);b.onmouseenter=()=>{Galaxy.paused=true};b.onmouseleave=()=>{Galaxy.paused=false}});
    }
    function toggleModule(b,name){const on=b.dataset.enabled==="true";b.dataset.enabled=String(!on);b.classList.toggle("active",!on);console.log(`[Galaxy] ${name}: ${!on?"ON":"OFF"}`)}
    function setOpen(v){Galaxy.open=v;Galaxy.ui.classList.toggle("show",v);if(!v){Galaxy.paused=false;Galaxy.wheel.classList.remove("galaxy-wheel-hover")}}
    const open=()=>setOpen(true),close=()=>setOpen(false),toggle=()=>setOpen(!Galaxy.open);
    function animate(){if(Galaxy.open&&!Galaxy.paused)Galaxy.angle+=Galaxy.speed;Galaxy.wheel.style.transform=`translate(-50%,-50%) rotate(${Galaxy.angle}deg)`;Galaxy.buttons.forEach(b=>{const l=b.querySelector(".galaxy-label");if(l)l.style.transform=`translate(-50%,-50% rotate(${-Galaxy.angle}deg)`});const t=Galaxy.center.querySelector("#galaxy-center-text");if(t)t.style.transform=`translate(-50%,-50%) rotate(${-Galaxy.angle}deg)`;Galaxy.raf=requestAnimationFrame(animate)}
    function key(e){if(e.code!=="AltRight"||e.repeat)return;e.preventDefault();e.stopPropagation();toggle()}
    function destroy(){cancelAnimationFrame(Galaxy.raf);document.removeEventListener("keydown",key,true);Galaxy.ui?.remove();delete window.__GalaxyUI}
    function init(){createUI();showMain();document.addEventListener("keydown",key,true);Galaxy.raf=requestAnimationFrame(animate);window.__GalaxyUI={open,close,toggle,showMain,showCategory,showThemes,destroy,setTheme(k){if(themes[k]){Galaxy.theme=k;applyTheme()}},themes,state:Galaxy};console.log("%c[Galaxy UI] Loaded%c 右Altで開閉 / Themeでテーマ変更","color:#6fdfff;font-weight:bold","color:inherit")}
    if(document.body)init();else window.addEventListener("DOMContentLoaded",init,{once:true});
})();
