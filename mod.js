/* Sonnet UI - Radial Menu + Themes */
(() => {
    "use strict";
    if (window.__GalaxyUI?.destroy) window.__GalaxyUI.destroy();
    const themes={gaming:{name:"Gaming",blue:"#00eaff",green:"#7dff4d",glow:"#00d9ff"},hacker:{name:"Hacker",blue:"#00ff66",green:"#7cff00",glow:"#00ff55"},cyber:{name:"Cyber",blue:"#9b5cff",green:"#00eaff",glow:"#9b5cff"},ice:{name:"Ice",blue:"#8be9ff",green:"#d8fbff",glow:"#5bdcff"},neon:{name:"Neon",blue:"#ff3bd4",green:"#fff04a",glow:"#ff3bd4"}};
    const Galaxy={open:false,angle:0,speed:.10,paused:false,raf:0,ui:null,wheel:null,center:null,centerText:null,logo:null,buttons:[],current:"main",theme:localStorage.getItem("galaxy_theme")||"gaming",anim:null};
    const CATEGORIES=["Combat","Movement","Render","Player","Utility","World","Visual","Settings"];
    const MODULES={Combat:["KillAura","Reach","Velocity","Critical"],Movement:["AutoSprint","Sprint","Speed","Step"],Render:["Crosshair","Zoom","FPS","CPS"],Player:["FastPlace","AutoTool","Keystrokes","Perspective"],Utility:["Translator","Recorder","Optimizer","Chat"],World:["Coordinates","Time","Biome","Map"],Visual:["FullBright","Particles","Nametags","HitEffect"],Settings:["Theme","Animation","Scale","Keybind"]};
    const esc=v=>String(v).replace(/[&<>\'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
    function applyTheme(){const t=themes[Galaxy.theme]||themes.gaming;Galaxy.ui.style.setProperty("--theme-blue",t.blue);Galaxy.ui.style.setProperty("--theme-green",t.green);Galaxy.ui.style.setProperty("--theme-glow",t.glow);Galaxy.ui.dataset.theme=Galaxy.theme;localStorage.setItem("galaxy_theme",Galaxy.theme)}
    function createUI(){const root=document.createElement("div");root.id="galaxy-ui";root.innerHTML=`<div id="galaxy-overlay"></div><div id="galaxy-wheel"><div id="galaxy-ring"></div><div id="galaxy-buttons"></div></div><div id="galaxy-center"><div id="galaxy-center-logo" aria-label="Sonnet"><span></span><i></i><b></b></div><span id="galaxy-center-text"></span></div>`;document.body.appendChild(root);Galaxy.ui=root;Galaxy.wheel=root.querySelector("#galaxy-wheel");Galaxy.center=root.querySelector("#galaxy-center");Galaxy.centerText=root.querySelector("#galaxy-center-text");Galaxy.logo=root.querySelector("#galaxy-center-logo");Galaxy.center.addEventListener("click",()=>Galaxy.current==="main"?close():showMain());applyTheme()}
    function clearButtons(){Galaxy.ui.querySelector("#galaxy-buttons").replaceChildren();Galaxy.buttons.length=0}
    function resumeRotation(){Galaxy.paused=false;Galaxy.wheel.classList.remove("galaxy-wheel-hover")}
    function setCenter(title,isMain=false){Galaxy.centerText.textContent=isMain?"":title;Galaxy.ui.classList.toggle("sub-center",!isMain)}
    function createRadialButtons(items){clearButtons();const c=Galaxy.ui.querySelector("#galaxy-buttons"),r=205,step=Math.PI*2/items.length;items.forEach((name,i)=>{const b=document.createElement("button");b.type="button";b.className="galaxy-button";b.dataset.module=name;b.dataset.enabled="false";const a=-Math.PI/2+step*i;b.style.left=`calc(50% + ${Math.cos(a)*r}px)`;b.style.top=`calc(50% + ${Math.sin(a)*r}px)`;b.innerHTML=`<span class="galaxy-label">${esc(name)}</span>`;b.addEventListener("mouseenter",()=>{Galaxy.paused=true;Galaxy.wheel.classList.add("galaxy-wheel-hover")});b.addEventListener("mouseleave",()=>{Galaxy.paused=false;Galaxy.wheel.classList.remove("galaxy-wheel-hover")});b.addEventListener("click",e=>{e.stopPropagation();if(Galaxy.current==="main"){showCategory(name);return}if(name==="Theme"){showThemes();return}toggleModule(b,name)});c.appendChild(b);Galaxy.buttons.push(b)})}
    function showMain(){Galaxy.current="main";setCenter("",true);createRadialButtons(CATEGORIES);resumeRotation()}
    function showCategory(category){Galaxy.current=category;setCenter(category,false);createRadialButtons(MODULES[category]||[]);resumeRotation()}
    function showThemes(){Galaxy.current="theme";setCenter("Theme",false);clearButtons();const keys=Object.keys(themes),c=Galaxy.ui.querySelector("#galaxy-buttons"),r=205,step=Math.PI*2/keys.length;keys.forEach((key,i)=>{const name=themes[key].name,b=document.createElement("button");b.type="button";b.className="galaxy-button";b.dataset.theme=key;const a=-Math.PI/2+step*i;b.style.left=`calc(50% + ${Math.cos(a)*r}px)`;b.style.top=`calc(50% + ${Math.sin(a)*r}px)`;b.innerHTML=`<span class="galaxy-label">${esc(name)}</span>`;b.classList.toggle("active",key===Galaxy.theme);b.onclick=e=>{e.stopPropagation();Galaxy.theme=key;applyTheme();showThemes()};b.onmouseenter=()=>{Galaxy.paused=true;Galaxy.wheel.classList.add("galaxy-wheel-hover")};b.onmouseleave=()=>{Galaxy.paused=false;Galaxy.wheel.classList.remove("galaxy-wheel-hover")};c.appendChild(b);Galaxy.buttons.push(b)});resumeRotation()}
    function toggleModule(b,name){const on=b.dataset.enabled==="true";b.dataset.enabled=String(!on);b.classList.toggle("active",!on);console.log(`[Sonnet] ${name}: ${!on?"ON":"OFF"}`)}
    function beginOpenMotion(){Galaxy.anim={type:"open",start:performance.now(),duration:1050,fromSpeed:2.8,toSpeed:.10};Galaxy.wheel.style.setProperty("--wheel-scale",".05")}
    function beginCloseMotion(){Galaxy.anim={type:"close",start:performance.now(),duration:650,fromSpeed:.10,toSpeed:2.4}}
    function setOpen(v){
        if(v===Galaxy.open)return;
        if(v){
            Galaxy.open=true;
            Galaxy.ui.classList.remove("closing");
            Galaxy.ui.classList.add("show");
            resumeRotation();
            beginOpenMotion();
        }else{
            Galaxy.open=false;
            Galaxy.ui.classList.remove("show");
            Galaxy.ui.classList.add("closing");
            resumeRotation();
            beginCloseMotion();
            window.setTimeout(()=>{if(!Galaxy.open){Galaxy.ui.classList.remove("closing");Galaxy.anim=null;Galaxy.wheel.style.setProperty("--wheel-scale",".05")}},680);
        }
    }
    const open=()=>setOpen(true),close=()=>setOpen(false),toggle=()=>setOpen(!Galaxy.open);
    function animate(now){
        if(Galaxy.anim){
            const p=Math.min(1,(now-Galaxy.anim.start)/Galaxy.anim.duration);
            const ease=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
            if(Galaxy.anim.type==="open"){
                const speed=Galaxy.anim.toSpeed+(Galaxy.anim.fromSpeed-Galaxy.anim.toSpeed)*Math.pow(1-p,2.6);
                Galaxy.speed=speed;
                Galaxy.wheel.style.setProperty("--wheel-scale",String(.05+.95*ease));
                if(p>=1){Galaxy.anim=null;Galaxy.speed=.10;Galaxy.wheel.style.setProperty("--wheel-scale","1")}
            }else{
                const speed=Galaxy.anim.fromSpeed+(Galaxy.anim.toSpeed-Galaxy.anim.fromSpeed)*Math.pow(p,1.8);
                Galaxy.speed=speed;
                Galaxy.wheel.style.setProperty("--wheel-scale",String(1-.95*ease));
                if(p>=1){Galaxy.anim=null;Galaxy.speed=.10}
            }
        }
        if(Galaxy.open&&!Galaxy.paused)Galaxy.angle+=Galaxy.speed;
        Galaxy.wheel.style.setProperty("--rotation",`${Galaxy.angle}deg`);
        Galaxy.buttons.forEach(b=>{const l=b.querySelector(".galaxy-label");if(l)l.style.transform=`translate(-50%,-50%) rotate(${-Galaxy.angle}deg)`});
        Galaxy.raf=requestAnimationFrame(animate)
    }
    function key(e){if(e.code!=="AltRight"||e.repeat)return;e.preventDefault();e.stopPropagation();toggle()}
    function destroy(){cancelAnimationFrame(Galaxy.raf);document.removeEventListener("keydown",key,true);Galaxy.ui?.remove();delete window.__GalaxyUI}
    function init(){createUI();showMain();document.addEventListener("keydown",key,true);Galaxy.raf=requestAnimationFrame(animate);window.__GalaxyUI={open,close,toggle,showMain,showCategory,showThemes,destroy,setTheme(k){if(themes[k]){Galaxy.theme=k;applyTheme()}},themes,state:Galaxy};console.log("%c[Sonnet UI] Loaded%c 右Altで開閉 / 中央クリックで戻る","color:#6fdfff;font-weight:bold","color:inherit")}
    if(document.body)init();else window.addEventListener("DOMContentLoaded",init,{once:true});
})();
