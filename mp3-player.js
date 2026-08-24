/* mineMOD MP3 Player - local files, playlist, shuffle/repeat */
(()=>{
  "use strict";
  if(window.__MineModMP3?.destroy) window.__MineModMP3.destroy();

  const state={files:[],index:-1,shuffle:false,repeat:"off",volume:0.8,open:false};
  let audio=null, root=null, objectUrls=[];
  const listeners=[];

  const css=`
  #minemod-mp3{position:fixed;right:20px;bottom:20px;width:min(390px,92vw);z-index:2147483646;color:#fff;background:linear-gradient(145deg,rgba(14,23,38,.97),rgba(3,8,17,.96));border:1px solid rgba(0,234,255,.38);border-radius:16px;box-shadow:0 0 35px rgba(0,217,255,.18),inset 0 1px rgba(255,255,255,.08);backdrop-filter:blur(18px);font:13px Inter,"Segoe UI",Arial,sans-serif;overflow:hidden;display:none}
  #minemod-mp3.open{display:block;animation:minemod-mp3-in .18s ease-out}
  @keyframes minemod-mp3-in{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:none}}
  #minemod-mp3 .mp3-head{height:46px;display:flex;align-items:center;padding:0 14px;border-bottom:1px solid rgba(255,255,255,.08)}
  #minemod-mp3 .mp3-title{font-weight:800;color:#00eaff;letter-spacing:.4px;flex:1}
  #minemod-mp3 button{color:#fff;background:rgba(0,207,255,.08);border:1px solid rgba(0,207,255,.22);border-radius:8px;cursor:pointer;padding:6px 9px;font:inherit}
  #minemod-mp3 button:hover{background:rgba(0,207,255,.18);border-color:rgba(0,234,255,.55)}
  #minemod-mp3 .mp3-head button{border:0;background:transparent;font-size:18px;padding:3px 7px}
  #minemod-mp3 .mp3-body{padding:12px 14px}
  #minemod-mp3 .mp3-now{padding:10px 11px;border-radius:11px;background:rgba(255,255,255,.045);margin-bottom:10px}
  #minemod-mp3 .mp3-name{font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  #minemod-mp3 .mp3-time{display:flex;justify-content:space-between;color:#91a6b8;font-size:11px;margin-top:5px}
  #minemod-mp3 input[type=range]{width:100%;accent-color:#00cfff;cursor:pointer}
  #minemod-mp3 .mp3-controls{display:flex;justify-content:center;align-items:center;gap:7px;margin:9px 0}
  #minemod-mp3 .mp3-controls .main{width:44px;height:38px;border-radius:11px;font-size:17px}
  #minemod-mp3 .mp3-options{display:flex;gap:6px;align-items:center;margin-bottom:10px}
  #minemod-mp3 .mp3-options button{font-size:11px;padding:5px 7px}
  #minemod-mp3 .mp3-options .on{color:#00eaff;border-color:#00eaff;background:rgba(0,234,255,.14)}
  #minemod-mp3 .mp3-volume{display:flex;align-items:center;gap:8px;flex:1;color:#91a6b8}.mp3-volume input{flex:1}
  #minemod-mp3 .mp3-list{max-height:190px;overflow:auto;border-top:1px solid rgba(255,255,255,.07);margin:0 -14px;padding:5px 8px}
  #minemod-mp3 .mp3-item{display:flex;align-items:center;gap:8px;padding:8px 7px;border-radius:8px;cursor:pointer;color:#c9d5df}
  #minemod-mp3 .mp3-item:hover{background:rgba(0,207,255,.08)}
  #minemod-mp3 .mp3-item.current{background:rgba(0,207,255,.14);color:#fff}.mp3-num{width:20px;color:#668094;text-align:center}.mp3-item-name{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  #minemod-mp3 .mp3-bottom{display:flex;gap:7px;margin-top:10px}.mp3-file{display:none}
  `;
  const style=document.createElement("style");style.id="minemod-mp3-style";style.textContent=css;document.head.appendChild(style);

  function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function build(){
    root=document.createElement("div");root.id="minemod-mp3";root.innerHTML=`
      <div class="mp3-head"><div class="mp3-title">♫ MP3 Player</div><button data-a="close">×</button></div>
      <div class="mp3-body">
        <div class="mp3-now"><div class="mp3-name">No track selected</div><input class="mp3-progress" type="range" min="0" max="100" value="0"><div class="mp3-time"><span class="cur">0:00</span><span class="dur">0:00</span></div></div>
        <div class="mp3-controls"><button data-a="prev">⏮</button><button class="main" data-a="play">▶</button><button data-a="next">⏭</button></div>
        <div class="mp3-options"><button data-a="shuffle">Shuffle</button><button data-a="repeat">Repeat: Off</button><div class="mp3-volume">🔊 <input class="volume" type="range" min="0" max="1" step="0.01" value=".8"></div></div>
        <div class="mp3-list"></div>
        <div class="mp3-bottom"><button data-a="add">＋ Add MP3</button><input class="mp3-file" type="file" accept="audio/mpeg,audio/mp3,audio/*" multiple><button data-a="clear">Clear</button></div>
      </div>`;
    document.body.appendChild(root);
    root.addEventListener("click",e=>{const a=e.target.closest("[data-a]")?.dataset.a;if(!a)return;({close:()=>toggle(false),add:()=>root.querySelector(".mp3-file").click(),clear:clear,play:playPause,prev:prev,next:next,shuffle:toggleShuffle,repeat:toggleRepeat}[a]||(()=>{}))()});
    root.querySelector(".mp3-file").addEventListener("change",e=>addFiles([...e.target.files]));
    root.querySelector(".mp3-progress").addEventListener("input",e=>{if(audio?.duration)audio.currentTime=audio.duration*(+e.target.value/100)});
    root.querySelector(".volume").addEventListener("input",e=>{state.volume=+e.target.value;if(audio)audio.volume=state.volume});
  }
  function makeAudio(){audio=new Audio();audio.volume=state.volume;audio.preload="metadata";audio.addEventListener("timeupdate",renderProgress);audio.addEventListener("loadedmetadata",renderProgress);audio.addEventListener("ended",onEnded);}
  function addFiles(files){for(const f of files){if(!f.type.startsWith("audio/")&&!/\.mp3$/i.test(f.name))continue;const url=URL.createObjectURL(f);objectUrls.push(url);state.files.push({name:f.name,url})}if(state.index<0&&state.files.length)select(0);renderList()}
  function select(i,autoplay=true){if(!state.files[i])return;state.index=i;audio.src=state.files[i].url;audio.load();render();if(autoplay)audio.play().catch(()=>{})}
  function playPause(){if(!state.files.length)return;if(state.index<0)return select(0,true);if(audio.paused)audio.play().catch(()=>{});else audio.pause();render()}
  function prev(){if(!state.files.length)return;select((state.index-1+state.files.length)%state.files.length,true)}
  function next(){if(!state.files.length)return;select((state.index+1)%state.files.length,true)}
  function onEnded(){if(state.repeat==="one"){audio.currentTime=0;audio.play().catch(()=>{});return}if(state.shuffle&&state.files.length>1){let n;do n=Math.floor(Math.random()*state.files.length);while(n===state.index);select(n,true);return}if(state.index<state.files.length-1)next();else if(state.repeat==="all")select(0,true);else render()}
  function toggleShuffle(){state.shuffle=!state.shuffle;render()}
  function toggleRepeat(){state.repeat=state.repeat==="off"?"all":state.repeat==="all"?"one":"off";render()}
  function clear(){state.files=[];state.index=-1;objectUrls.forEach(URL.revokeObjectURL);objectUrls=[];if(audio){audio.pause();audio.removeAttribute("src");audio.load()}render()}
  function fmt(s){if(!Number.isFinite(s))return "0:00";return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,"0")}`}
  function renderProgress(){if(!root)return;const p=root.querySelector(".mp3-progress");p.value=audio?.duration?audio.currentTime/audio.duration*100:0;root.querySelector(".cur").textContent=fmt(audio?.currentTime||0);root.querySelector(".dur").textContent=fmt(audio?.duration||0);root.querySelector("[data-a=play]").textContent=audio&&!audio.paused?"⏸":"▶"}
  function renderList(){if(!root)return;root.querySelector(".mp3-list").innerHTML=state.files.map((f,i)=>`<div class="mp3-item ${i===state.index?"current":""}" data-index="${i}"><span class="mp3-num">${i+1}</span><span class="mp3-item-name">${esc(f.name)}</span></div>`).join("");root.querySelectorAll(".mp3-item").forEach(x=>x.onclick=()=>select(+x.dataset.index,true))}
  function render(){if(!root)return;const name=root.querySelector(".mp3-name");name.textContent=state.files[state.index]?.name||"No track selected";root.querySelector("[data-a=shuffle]").classList.toggle("on",state.shuffle);root.querySelector("[data-a=repeat]").classList.toggle("on",state.repeat!=="off");root.querySelector("[data-a=repeat]").textContent=`Repeat: ${state.repeat==="all"?"All":state.repeat==="one"?"One":"Off"}`;renderList();renderProgress()}
  function toggle(v){state.open=v??!state.open;root.classList.toggle("open",state.open)}
  function open(){toggle(true)}
  function destroy(){audio?.pause();objectUrls.forEach(URL.revokeObjectURL);root?.remove();style.remove();listeners.forEach(x=>x());delete window.__MineModMP3}
  build();makeAudio();render();
  window.__MineModMP3={open,close:()=>toggle(false),toggle,addFiles,clear,destroy,state};
})();
