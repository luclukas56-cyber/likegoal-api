import fs from 'node:fs/promises';
import {GAMES, INVITES} from '../src/config.js';

const file=new URL('../data/stats.json',import.meta.url);
let saved={};
try{saved=JSON.parse(await fs.readFile(file,'utf8'));}catch{}
async function json(url){
  const response=await fetch(url,{signal:AbortSignal.timeout(12000),headers:{Accept:'application/json','User-Agent':'luc-lukas-stats (+https://luc-lukas.com)'}});
  if(!response.ok)throw new Error(`${new URL(url).hostname}: HTTP ${response.status}`);
  return response.json();
}
async function games(){
  const ids=GAMES.map(game=>game.universeId).join(',');
  const [stats,images]=await Promise.all([
    json('https://games.roblox.com/v1/games?universeIds='+ids),
    json(`https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=${ids}&countPerUniverse=1&defaults=true&size=768x432&format=Png&isCircular=false`).catch(()=>({data:[]}))
  ]);
  const games=GAMES.map(game=>{
    const item=stats.data?.find(item=>item.id===game.universeId);
    if(!item||!Number.isFinite(item.playing)||item.playing<0||!Number.isFinite(item.visits)||item.visits<0)throw new Error('Incomplete Roblox response');
    const image=images.data?.find(item=>item.universeId===game.universeId)?.thumbnails?.find(item=>item.state==='Completed')?.imageUrl;
    return {...game,image:image||game.image,playing:item.playing,visits:item.visits,fallbackImage:game.image,url:`https://www.roblox.com/games/${game.placeId}/${game.slug}`};
  });
  return {games,totalPlayers:games.reduce((sum,g)=>sum+g.playing,0),totalVisits:games.reduce((sum,g)=>sum+g.visits,0)};
}
async function discord(){
  const entries=await Promise.allSettled(Object.entries(INVITES).map(async([key,code])=>{
    const data=await json(`https://discord.com/api/v10/invites/${code}?with_counts=true&with_expiration=true`);
    if(!data.guild||!Number.isFinite(data.approximate_member_count))throw new Error('Incomplete Discord response');
    return [key,{name:data.guild.name,icon:data.guild.icon?`https://cdn.discordapp.com/icons/${data.guild.id}/${data.guild.icon}.png?size=128`:null,members:data.approximate_member_count,online:data.approximate_presence_count,url:`https://discord.gg/${code}`,updatedAt:new Date().toISOString()}];
  }));
  const communities=Object.fromEntries(entries.filter(entry=>entry.status==='fulfilled').map(entry=>entry.value));
  if(!Object.keys(communities).length)throw new Error('Discord unavailable');
  return {communities:{...saved.discord?.data?.communities,...communities},partial:Object.keys(communities).length<Object.keys(INVITES).length};
}
for(const[name,load]of Object.entries({games,discord})){
  try{saved[name]={data:await load(),status:'live',updatedAt:new Date().toISOString()};console.log(`${name}: refreshed ${saved[name].updatedAt}`);}
  catch(error){console.warn(`${name}: ${error.message}; retaining last successful timestamp`);if(saved[name])saved[name].status='stale';}
}
if(!Object.values(saved).some(record=>record.status==='live'))throw new Error('No source could be refreshed; server snapshots remain unchanged.');
await fs.mkdir(new URL('../data/',import.meta.url),{recursive:true});
await fs.writeFile(file,JSON.stringify(saved,null,2)+'\n');
