/* Sonnet UI - smooth radial orbit */
(() => {
    "use strict";
    if (window.__GalaxyUI?.destroy) window.__GalaxyUI.destroy();

    const themes={gaming:{name:"Gaming",blue:"#00eaff",green:"#7dff4d",glow:"#00d9ff"},hacker:{name:"Hacker",blue:"#00ff66",green:"#7cff00",glow:"#00ff55"},cyber:{name:"Cyber",blue:"#9b5cff",green:"#00eaff",glow:"#9b5cff"},ice:{name:"Ice",blue:"#8be9ff",green:"#d8fbff",glow:"#5bdcff"},neon:{name:"Neon",blue:"#ff3bd4",green:"#fff04a",glow:"#ff3bd4"}};
    const CATEGORIES=["Combat","Movement","Render","Player","Utility","World","Visual","Settings"];
    const MODULES={Combat:["KillAura","Reach","Velocity","Critical"],Movement:["AutoSprint","Sprint","Speed","Step"],Render:["Crosshair","Zoom","FPS","CPS"],Player:["FastPlace","AutoTool","Keystrokes","Perspective"],Utility:["Translator","Recorder","Optimizer","Chat"],World:["Coordinates","Time","Biome","Map"],Visual:["FullBright","Particles","Nametags","HitEffect"],Settings:["Theme","Animation","Scale","Keybind"]};
    const Galaxy={open:false,angle:0,speed:.10,paused:false,raf:0,ui:null,wheel:null,center:null,centerText:null,logo:null,buttons:[],current:"main",theme:localStorage.getItem("galaxy_theme")||"gaming",anim:null,closingTimer:null,radius:205};
    const esc=v=>String(v).replace(/[&<>\'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));

    function applyTheme(){const t=themes[Galaxy.theme]||themes.gaming;Galaxy.ui.style.setProperty("--theme-blue",t.blue);Galaxy.ui.style.setProperty("--theme-green",t.green);Galaxy.ui.style.setProperty("--theme-glow",t.glow);Galaxy.ui.dataset.theme=Galaxy.theme;localStorage.setItem("galaxy_theme",Galaxy.theme)}

    function createUI(){
        const root=document.createElement("div");root.id="galaxy-ui";
        root.innerHTML=`<div id="galaxy-overlay"></div><div id="galaxy-wheel"><div id="galaxy-ring"></div><div id="galaxy-buttons"></div></div><div id="galaxy-center"><div id="galaxy-center-logo" aria-label="Sonnet"><span></span><i></i><b></b></div><span id="galaxy-center-text"></span></div>`;
        document.body.appendChild(root);Galaxy.ui=root;Galaxy.wheel=root.querySelector("#galaxy-wheel");Galaxy.center=root.querySelector("#galaxy-center");Galaxy.centerText=root.querySelector("#galaxy-center-text");Galaxy.logo=root.querySelector("#galaxy-center-logo");
        Galaxy.center.addEventListener("click",()=>Galaxy.current==="main"?close():showMain());applyTheme();
    }

    function clearButtons(){Galaxy.ui.querySelector("#galaxy-buttons").replaceChildren();Galaxy.buttons.length=0}
    function resumeRotation(){Galaxy.paused=false;Galaxy.wheel.classList.remove("galaxy-wheel-hover")}
    function setCenter(title,isMain=false){Galaxy.centerText.textContent=isMain?"":title;Galaxy.ui.classList.toggle("sub-center",!isMain)}

    function addButton(name,i,count,handler){
        const b=document.createElement("button");b.type="button";b.className="galaxy-button";b.dataset.module=name;b.dataset.enabled="false";
        b.innerHTML=`<span class="galaxy-label">${esc(name)}</span>`;
        b._slot=i;b._count=count;b._baseAngle=-Math.PI/2+(Math.PI*2/count)*i;
        b.addEventListener("mouseenter",()=>{Galaxy.paused=true;Galaxy.wheel.classList.add("galaxy-wheel-hover")});
        b.addEventListener("mouseleave",()=>{Galaxy.paused=false;Galaxy.wheel.classList.remove("galaxy-wheel-hover")});
        b.addEventListener("click",e=>{e.stopPropagation();handler(b,name)});
        Galaxy.ui.querySelector("#galaxy-buttons").appendChild(b);Galaxy.buttons.push(b);
    }

    function createRadialButtons(items){
        clearButtons();items.forEach((name,i)=>addButton(name,i,items.length,(b,n)=>{if(Galaxy.current==="main")showCategory(n);else if(n==="Theme")showThemes();else toggleModule(b,n)}));
    }

    function showMain(){Galaxy.current="main";setCenter("",true);createRadialButtons(CATEGORIES);resumeRotation()}
    function showCategory(category){Galaxy.current=category;setCenter(category,false);createRadialButtons(MODULES[category]||[]);resumeRotation()}
    function showThemes(){
        Galaxy.current="theme";setCenter("Theme",false);clearButtons();
        const keys=Object.keys(themes);keys.forEach((key,i)=>addButton(themes[key].name,i,keys.length,(b)=>{Galaxy.theme=key;applyTheme();showThemes()}));
        Galaxy.buttons.forEach((b,i)=>{b.dataset.theme=keys[i];b.classList.toggle("active",keys[i]===Galaxy.theme)});resumeRotation();
    }

    function toggleModule(b,name){const on=b.dataset.enabled==="true";b.dataset.enabled=String(!on);b.classList.toggle("active",!on);console.log(`[Sonnet] ${name}: ${!on?"ON":"OFF"}`)}

    function beginOpenMotion(){Galaxy.anim={type:"open",start:performance.now(),duration:1150,startRadius:0,endRadius:205,startSpeed:7.5,endSpeed:.10};Galaxy.radius=0}
    function beginCloseMotion(){Galaxy.anim={type:"close",start:performance.now(),duration:720,startRadius:Galaxy.radius,endRadius:0,startSpeed:.10,endSpeed:7.0}}

    function setOpen(v){
        if(v===Galaxy.open)return;
        if(v){
            if(Galaxy.closingTimer){clearTimeout(Galaxy.closingTimer);Galaxy.closingTimer=null}
            Galaxy.open=true;Galaxy.ui.classList.remove("closing");Galaxy.ui.classList.add("show");resumeRotation();beginOpenMotion();
        }else{
            Galaxy.open=false;Galaxy.ui.classList.remove("show");Galaxy.ui.classList.add("closing");resumeRotation();beginCloseMotion();
            Galaxy.closingTimer=setTimeout(()=>{if(!Galaxy.open){Galaxy.ui.classList.remove("closing");Galaxy.anim=null;Galaxy.radius=0}},760);
        }
    }
    const open=()=>setOpen(true),close=()=>setOpen(false),toggle=()=>setOpen(!Galaxy.open);

    function smoothstep(t){return t*t*(3-2*t)}
    function easeOutCubic(t){return 1-Math.pow(1-t,3)}

    function animate(now){
        if(Galaxy.anim&&!Galaxy.paused){
            const a=Galaxy.anim,p=Math.min(1,(now-a.start)/a.duration),q=smoothstep(p);
            Galaxy.radius=a.startRadius+(a.endRadius-a.startRadius)*q;
            const speed=a.startSpeed+(a.endSpeed-a.startSpeed)*easeOutCubic(p);
            Galaxy.speed=speed;
            Galaxy.angle+=speed;
            if(p>=1){Galaxy.anim=null;Galaxy.radius=a.endRadius;Galaxy.speed=.10}
        }else if(Galaxy.open&&!Galaxy.paused){
            Galaxy.angle+=Galaxy.speed;
        }

        // サブピクセルのleft/top更新による微細なプルプルを防ぐため、
        // ボタンは全て50%基準のtranslate3dで位置を動かす。
        // wheel自体は回転させないので、文字も絶対に回転しない。
        Galaxy.buttons.forEach(b=>{
            const angle=b._baseAngle+Galaxy.angle*Math.PI/180;
            const x=Math.cos(angle)*Galaxy.radius;
            const y=Math.sin(angle)*Galaxy.radius;
            b.style.setProperty("--orbit-x",`${x.toFixed(3)}px`);
            b.style.setProperty("--orbit-y",`${y.toFixed(3)}px`);
        });
        Galaxy.raf=requestAnimationFrame(animate);
    }

    function key(e){if(e.code!=="AltRight"||e.repeat)return;e.preventDefault();e.stopPropagation();toggle()}
    function destroy(){cancelAnimationFrame(Galaxy.raf);if(Galaxy.closingTimer)clearTimeout(Galaxy.closingTimer);document.removeEventListener("keydown",key,true);Galaxy.ui?.remove();delete window.__GalaxyUI}
    function init(){createUI();showMain();document.addEventListener("keydown",key,true);Galaxy.raf=requestAnimationFrame(animate);window.__GalaxyUI={open,close,toggle,showMain,showCategory,showThemes,destroy,setTheme(k){if(themes[k]){Galaxy.theme=k;applyTheme()}},themes,state:Galaxy};console.log("%c[Sonnet UI] Loaded%c 右Altで開閉 / 中央クリックで戻る","color:#6fdfff;font-weight:bold","color:inherit")}
    if(document.body)init();else window.addEventListener("DOMContentLoaded",init,{once:true});
})();
