const URL_BASE="https://pnlmxtsvmlyaywbgzhht.supabase.co";
const KEY="sb_publishable_-weL94RHO6GwLlBAT5TKgw_Cc1k6tA0";
export type PublicTrack={id:string;owner_id:string;title:string;artist:string;audio_path:string;artwork_path:string|null;audio_bytes:number;created_at:string};
async function parse(r:Response){if(!r.ok){let msg="HTTP "+r.status;try{const j=await r.json();msg=j.msg||j.message||j.error_description||j.error||msg}catch{}throw new Error(msg)}return r}
async function json<T>(endpoint:string,token:string,options:RequestInit={}):Promise<T>{const r=await parse(await fetch(URL_BASE+endpoint,{...options,headers:{"apikey":KEY,"Authorization":"Bearer "+token,"Content-Type":"application/json",...(options.headers||{})}}));if(r.status===204)return undefined as T;return r.json()}
function path(name:string){return name.split("/").map(encodeURIComponent).join("/")}
export const communityApi={
 async auth(email:string,password:string,signup:boolean):Promise<{access_token:string;refresh_token:string;expires_at?:number;user:{id:string;email?:string}}>{const endpoint=signup?"/auth/v1/signup":"/auth/v1/token?grant_type=password";const r=await parse(await fetch(URL_BASE+endpoint,{method:"POST",headers:{"apikey":KEY,"Content-Type":"application/json"},body:JSON.stringify({email,password})}));return r.json()},
 async profile(token:string){const arr=await json<Array<{nickname:string}>>("/rest/v1/amusic_profiles?select=nickname&limit=1",token);return arr[0]||null},
 async list(token:string){return json<PublicTrack[]>("/rest/v1/amusic_public_tracks?select=id,owner_id,title,artist,audio_path,artwork_path,audio_bytes,created_at&is_visible=eq.true&order=created_at.desc&limit=100",token)},
 async download(token:string,audioPath:string){const response=await parse(await fetch(URL_BASE+"/storage/v1/object/authenticated/amusic-community-audio/"+path(audioPath),{headers:{"apikey":KEY,"Authorization":"Bearer "+token}}));return response.blob()},
 async publish(token:string,owner:string,file:File,title:string,artist:string){
 const name=file.name.toLowerCase();
 const mime=name.endsWith(".mp3")?"audio/mpeg":name.endsWith(".m4a")?"audio/mp4":name.endsWith(".aac")?"audio/aac":"";
 if(!mime)throw Error("Дозволені лише MP3, M4A та AAC");
 if(file.size>25*1024*1024||file.size<=0)throw Error("Розмір аудіо має бути від 1 байта до 25 МБ");
 if(!title.trim()||title.length>200||!artist.trim()||artist.length>100)throw Error("Перевір назву і виконавця");
 const audioPath=owner+"/"+crypto.randomUUID()+"."+name.split(".").pop();
 await parse(await fetch(URL_BASE+"/storage/v1/object/amusic-community-audio/"+path(audioPath),{method:"POST",headers:{"apikey":KEY,"Authorization":"Bearer "+token,"Content-Type":mime,"x-upsert":"false"},body:file}));
 try{
   await json("/rest/v1/amusic_public_tracks",token,{method:"POST",headers:{"Prefer":"return=minimal"},body:JSON.stringify({owner_id:owner,title:title.trim(),artist:artist.trim(),audio_path:audioPath,artwork_path:null,mime_type:mime,audio_bytes:file.size,rights_confirmed:true,is_visible:true})});
 }catch(err){
   await fetch(URL_BASE+"/storage/v1/object/amusic-community-audio/"+path(audioPath),{method:"DELETE",headers:{"apikey":KEY,"Authorization":"Bearer "+token}}).catch(()=>{});
   throw err;
 }
 }
};
