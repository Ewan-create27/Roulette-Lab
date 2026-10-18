(function(root){
const specs={stats:{w:4,h:4},table:{w:5,h:10},strategy:{w:3,h:10},history:{w:4,h:6}};
function defaults(){return [{id:'stats',x:0,y:0,w:12,h:5},{id:'table',x:0,y:5,w:8,h:22},{id:'strategy',x:8,y:5,w:4,h:30},{id:'history',x:0,y:27,w:8,h:8}]}
function overlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function clamp(n,min,max,fallback){return Number.isFinite(n)?Math.max(min,Math.min(max,Math.round(n))):fallback}
function normalize(saved){const def=defaults();if(!Array.isArray(saved))return def;return def.map(d=>{const p=saved.find(x=>x?.id===d.id);if(!p)return d;const w=clamp(p.w,specs[d.id].w,12,d.w);return {id:d.id,w,h:clamp(p.h,specs[d.id].h,80,d.h),x:clamp(p.x,0,12-w,d.x),y:clamp(p.y,0,200,d.y)}})}
function place(layout,id,patch){const items=normalize(layout),item=items.find(p=>p.id===id);if(!item)return items;const fixed=normalize(items.map(p=>p.id===id?{...p,...patch}:p)).find(p=>p.id===id);const placed=[fixed];for(const p of items.filter(p=>p.id!==id).sort((a,b)=>a.y-b.y||a.x-b.x)){while(placed.some(q=>overlap(p,q)))p.y=Math.max(...placed.filter(q=>overlap(p,q)).map(q=>q.y+q.h));placed.push(p)}return items.map(p=>placed.find(q=>q.id===p.id))}
function safeLayout(saved){let items=normalize(saved);for(const id of Object.keys(specs))items=place(items,id,{});return items}
const api={specs,defaults,normalize,overlap,place,safeLayout};if(typeof module!=='undefined')module.exports=api;else root.WorkspaceModel=api;
})(globalThis);
