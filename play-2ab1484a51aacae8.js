(async()=>{'use strict';const root=document.querySelector('#app');if(!((location.hostname==='eenglishandcats.github.io'&&location.pathname.startsWith('/romance-oge-play/'))||location.hostname==='127.0.0.1'||location.hostname==='localhost')){root.innerHTML='<section style="padding:32px"><h1>Романтика ОГЭ</h1><p>Открой игру на официальном сайте.</p><a href="https://eenglishandcats.github.io/romance-oge-play/">Перейти к игре</a></section>';return;}const a='GKHtXxVNF7rFfngHR4S1iv8CA0GCqjmxlqwG2M8zil0=',b='sXWkXij9woAjPOaCPpvzi1Mce0KFatCdYJUOKnEnqqw=';const raw=Uint8Array.from(atob(a),(v,i)=>v.charCodeAt(0)^atob(b).charCodeAt(i));const key=await crypto.subtle.importKey('raw',raw,'AES-GCM',false,['decrypt']);async function read(url,options={}){const r=await fetch(url,{cache:'default',...options});if(!r.ok)throw Error('HTTP '+r.status);const bytes=new Uint8Array(await r.arrayBuffer());return crypto.subtle.decrypt({name:'AES-GCM',iv:bytes.slice(0,12)},key,bytes.slice(12));}try{const data=JSON.parse(new TextDecoder().decode(await read('media/1e55899595b36ca88ab29a7b8ba6.bin')));const style=document.createElement('style');style.textContent=data.css;document.head.append(style);const pending=new Map(),urls=new Map(),prefix='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=#';
const art={},namesByFile=new Map(),controllers=new Map();let warmWanted=new Set();
for(const [name,file] of Object.entries(data.art)){
 art[name]=prefix+file;
 if(!namesByFile.has(file))namesByFile.set(file,[]);
 namesByFile.get(file).push(name);
}
function ensure(file){
 if(controllers.get(file)?.signal.aborted)pending.delete(file);
 if(!pending.has(file)){const controller=new AbortController();controllers.set(file,controller);const job=read(file,{signal:controller.signal}).then(async bytes=>{
  const url=URL.createObjectURL(new Blob([bytes],{type:'image/webp'}));
  const preview=new Image();preview.src=url;
  try{await preview.decode();}catch{URL.revokeObjectURL(url);throw Error('Image decode failed');}
  urls.set(file,url);
  for(const name of namesByFile.get(file)||[]){art[name]=url;if(typeof ART!=='undefined')ART[name]=url;}
  return url;
 }).catch(e=>{if(pending.get(file)===job)pending.delete(file);throw e;}).finally(()=>{if(controllers.get(file)===controller)controllers.delete(file);});pending.set(file,job);}
 return pending.get(file);
}
// Warm only the current/next two scenes, never the entire story or catalog.
globalThis.preloadStoryArt=names=>{
 const files=[...new Set(names.map(name=>data.art[name]).filter(Boolean))];
 warmWanted=new Set(files.slice(0,3));let chain=Promise.resolve();for(const file of warmWanted)chain=chain.then(()=>{if(warmWanted.has(file))return ensure(file);}).catch(()=>{});
};
async function load(img){
 const src=img.getAttribute('src');if(!src?.startsWith(prefix))return;
 const file=src.slice(prefix.length);if(!namesByFile.has(file))return;
 try{
  const url=urls.get(file)||await ensure(file);
  if(img.isConnected&&img.getAttribute('src')===src){img.src=url;img.dataset.decoded='1';}
 }catch{
  if(!img.isConnected)return;img.dataset.artError='1';
  const note=document.createElement('button');note.className='art-retry';note.textContent='Загрузить иллюстрацию';
  note.onclick=()=>{note.remove();load(img);};if(!document.querySelector('.art-retry'))root.append(note);
 }
}
const lazy=new IntersectionObserver(entries=>{for(const x of entries)if(x.isIntersecting){lazy.unobserve(x.target);load(x.target);}},{rootMargin:'150px'});
function scan(node){
 if(node.nodeType!==1)return;
 for(const img of [...(node.matches('img')?[node]:[]),...node.querySelectorAll('img')]){
  if(img.getAttribute('loading')==='lazy')lazy.observe(img);else load(img);
 }
}
function cancelUnused(){
 if(root.querySelector('.catalog-hub,.profile-heading'))warmWanted.clear();
 const wanted=new Set(warmWanted);
 for(const img of root.querySelectorAll('img')){const src=img.getAttribute('src')||'';if(src.startsWith(prefix))wanted.add(src.slice(prefix.length));}
 for(const [file,controller] of controllers)if(!wanted.has(file))controller.abort();
}
new MutationObserver(records=>{for(const r of records)for(const node of r.addedNodes)scan(node);cancelUnused();}).observe(root,{childList:true,subtree:true});
window.addEventListener('pagehide',event=>{if(!event.persisted)for(const url of urls.values())URL.revokeObjectURL(url);});
const script=document.createElement('script');script.textContent='const ART='+JSON.stringify(art)+';\n'+data.code;document.body.append(script);}catch{root.innerHTML='<section style="padding:32px;color:#44264f"><h1>Не получилось загрузить игру</h1><p>Проверь интернет и обнови страницу.</p><button onclick="location.reload()">Попробовать ещё раз</button></section>';}})().catch(()=>{document.querySelector('#app').innerHTML='<p style="padding:30px">Открой игру в современном браузере по защищённой ссылке HTTPS.</p>';});