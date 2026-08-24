/* mineMOD MP3 Persistence - keep uploaded local audio across reloads */
(()=>{
  "use strict";
  const DB_NAME="mineMOD-local-audio";
  const DB_VERSION=1;
  const STORE="tracks";
  const openDB=()=>new Promise((resolve,reject)=>{
    if(!window.indexedDB)return reject(new Error("IndexedDB unavailable"));
    const req=indexedDB.open(DB_NAME,DB_VERSION);
    req.onupgradeneeded=()=>{
      const db=req.result;
      if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:"id",autoIncrement:true});
    };
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error||new Error("IndexedDB open failed"));
  });
  const getAll=db=>new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,"readonly"),req=tx.objectStore(STORE).getAll();
    req.onsuccess=()=>resolve(req.result||[]);
    req.onerror=()=>reject(req.error);
  });
  const addRecords=(db,files)=>new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,"readwrite"),store=tx.objectStore(STORE);
    files.forEach((file,index)=>store.add({name:file.name,type:file.type||"audio/mpeg",blob:file,order:Date.now()+index}));
    tx.oncomplete=resolve;
    tx.onerror=()=>reject(tx.error||new Error("IndexedDB write failed"));
  });
  const clearRecords=db=>new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,"readwrite");
    tx.objectStore(STORE).clear();
    tx.oncomplete=resolve;
    tx.onerror=()=>reject(tx.error||new Error("IndexedDB clear failed"));
  });

  const install=async()=>{
    const player=window.__MineModMP3;
    if(!player?.addFiles||player.__persistent)return false;
    const originalAdd=player.addFiles;
    const originalClear=player.clear;
    let db;
    try{db=await openDB();}catch(e){console.warn("[mineMOD MP3] persistence unavailable",e);return true;}

    player.addFiles=function(files){
      const accepted=(files||[]).filter(f=>f&&(f.type==="audio/mpeg"||String(f.type||"").startsWith("audio/")||/\.mp3$/i.test(f.name)));
      if(accepted.length)addRecords(db,accepted).catch(e=>console.warn("[mineMOD MP3] save failed",e));
      return originalAdd.call(player,files);
    };
    player.clear=function(){
      clearRecords(db).catch(e=>console.warn("[mineMOD MP3] clear failed",e));
      return originalClear.call(player);
    };
    player.__persistent=true;
    player.persistence={async reload(){
      const rows=await getAll(db);
      const files=rows.sort((a,b)=>(a.order||0)-(b.order||0)).map(r=>new File([r.blob],r.name,{type:r.type||"audio/mpeg"}));
      if(files.length)originalAdd.call(player,files);
      return files.length;
    },clear:()=>clearRecords(db)};

    try{await navigator.storage?.persist?.();}catch{}
    try{await player.persistence.reload();}catch(e){console.warn("[mineMOD MP3] restore failed",e)}
    return true;
  };

  if(!install()){
    const timer=setInterval(async()=>{
      if(await install())clearInterval(timer);
    },25);
    setTimeout(()=>clearInterval(timer),5000);
  }
})();
