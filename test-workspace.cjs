const assert=require('node:assert/strict'),M=require('./workspace-model.js');
function check(items){assert.equal(items.length,4);for(const p of items){assert.ok(p.x>=0&&p.x+p.w<=12);assert.ok(p.w>=M.specs[p.id].w);assert.ok(p.h>=M.specs[p.id].h);for(const q of items)if(q!==p)assert.equal(M.overlap(p,q),false,`${p.id} overlaps ${q.id}`)}}
check(M.defaults());
let rows=M.place(M.defaults(),'strategy',{x:0,y:0,w:12,h:32});check(rows);assert.equal(rows.find(p=>p.id==='strategy').y,0);
rows=M.place(rows,'table',{x:0,y:0,w:8,h:20});check(rows);assert.equal(rows.find(p=>p.id==='table').y,0);
rows=M.place(rows,'history',{x:8,y:0,w:4,h:15});check(rows);assert.equal(rows.find(p=>p.id==='history').x,8);
const persisted=JSON.parse(JSON.stringify(rows));check(M.safeLayout(persisted));assert.deepEqual(M.safeLayout(persisted),rows);
check(M.safeLayout([{id:'stats',x:-400,y:-5,w:0,h:NaN},{id:'table',x:99,y:0,w:100,h:999}]));
assert.deepEqual(M.normalize(null),M.defaults());
for(let i=0;i<80;i++){const id=Object.keys(M.specs)[i%4];rows=M.place(rows,id,{x:i%10,y:i%20,w:4+i%9,h:6+i%30});check(rows)}
console.log('OK: panel movement, resizing, minimum dimensions, collision displacement, invalid storage, layout round trip.');
