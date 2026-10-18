const assert=require('node:assert/strict'),G=require('./graph-model.js'),R=require('./engine.js');
const rule={kind:'streak',target:'red',window:2,count:1};
const configs=[{...R.defaultConfig(),action:'router',routes:[{join:'all',rules:[rule],to:1}]},{...R.defaultConfig(),exitWhen:'win',onContinue:2},{...R.defaultConfig(),action:'observe',observeTurns:2,onContinue:0}];
const es=G.edges(configs);assert.equal(es.find(e=>e.id==='0:route:0').to,1);assert.equal(es.find(e=>e.id==='0:wait').fixed,true);assert.equal(es.find(e=>e.id==='1:exit').to,0);assert.equal(es.find(e=>e.id==='1:continue').to,2);assert.equal(es.find(e=>e.id==='2:continue').to,0);
assert.throws(()=>G.connect(configs,es.find(e=>e.id==='0:wait'),1),/boucle/);
assert.throws(()=>G.connect(configs,es[0],9),/invalide/);
G.connect(configs,es.find(e=>e.id==='1:continue'),1);assert.equal(configs[1].onContinue,1);assert.equal(G.edges(configs).find(e=>e.id==='1:continue').to,1);
G.connect(configs,es.find(e=>e.id==='0:route:0'),2);assert.equal(configs[0].routes[0].to,2);
// The drawn connection must be the same destination that the simulator executes.
let st={capital:10000,step:0,losses:0};let plan=R.planTurn(st,[{},{black:100},{}],configs,['1','3'],1.5);assert.equal(plan.step,2);assert.equal(plan.kind,'observe');
// Inserting an observation step reroutes the chosen edge and preserves its old destination.
const edge=G.edges(configs).find(e=>e.id==='0:route:0'),old=edge.to;
configs.push({...R.defaultConfig(),action:'observe',onContinue:old});G.connect(configs,edge,3);
assert.equal(configs[0].routes[0].to,3);assert.equal(configs[3].onContinue,old);assert.equal(R.planTurn(st,[{},{black:100},{},{}],configs,['1','3'],1.5).step,3);
// Saving/reloading and moving blocks never rewrites sequence semantics.
const before=JSON.stringify(configs),positions=G.positions([{x:900,y:70},{x:-1,y:Infinity}],4);assert.equal(positions.length,4);assert.deepEqual(positions[0],{x:900,y:70});assert.equal(JSON.stringify(configs),before);assert.equal(JSON.parse(JSON.stringify({configs,diagram:{positions}})).configs[0].routes[0].to,3);
const withCondition={...R.defaultConfig(),rules:[rule]};assert.ok(G.edges([withCondition]).some(e=>e.kind==='wait'));assert.equal(G.edges([{...R.defaultConfig(),exitWhen:'never'}]).some(e=>e.kind==='exit'),false);
console.log('OK: diagram edges match engine, self-loops, reconnection, fixed wait loops, insertion, position persistence.');
const adaptiveGraph={...R.defaultConfig(),action:'adaptive',routes:[{join:'all',rules:[],bets:{odd:100},to:0}]};
const adaptiveEdges=G.edges([adaptiveGraph]);assert.equal(adaptiveEdges.filter(e=>e.kind==='route').length,0);assert.ok(adaptiveEdges.some(e=>e.kind==='wait'));assert.ok(adaptiveEdges.some(e=>e.kind==='exit'));
const savedBends=G.bends({'0:wait':{x:700,y:300},'0:exit':{x:800,y:50},bad:{x:2,y:3},'1:continue':{x:NaN,y:4}});assert.deepEqual(Object.keys(savedBends),['0:wait','0:exit']);
assert.deepEqual(G.bends(JSON.parse(JSON.stringify(savedBends))),savedBends);
const path=G.bentPath(100,200,300,400,{x:800,y:90},false);assert.ok(path.startsWith('M 100 200'));assert.ok(path.endsWith('300 400'));assert.ok(path.includes('800 90'));
const moved=G.bentPath(120,220,330,450,{x:800,y:90},true);assert.ok(moved.startsWith('M 120 220'));assert.ok(moved.endsWith('330 450'));assert.ok(moved.includes('800 90'));
console.log('OK: adaptive graph uses shared outputs; editable arrow waypoints preserve endpoints and persist.');
