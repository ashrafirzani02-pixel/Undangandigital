const DB_NAME="vowinvite-media", STORE="assets";
function openDB(){return new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,1);req.onupgradeneeded=()=>req.result.createObjectStore(STORE,{keyPath:"id"});req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
export function listMedia(){return openDB().then(db=>new Promise((resolve,reject)=>{const req=db.transaction(STORE).objectStore(STORE).getAll();req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>reject(req.error);}));}
export function saveMedia(item){return openDB().then(db=>new Promise((resolve,reject)=>{const req=db.transaction(STORE,"readwrite").objectStore(STORE).put(item);req.onsuccess=()=>resolve(item);req.onerror=()=>reject(req.error);}));}
export function deleteMedia(id){return openDB().then(db=>new Promise((resolve,reject)=>{const req=db.transaction(STORE,"readwrite").objectStore(STORE).delete(id);req.onsuccess=()=>resolve();req.onerror=()=>reject(req.error);}));}
