const assert=require('node:assert/strict');const R=require('./engine.js');
assert.equal(R.settle({'n:10':100},'10').net,3500);
assert.equal(R.settle({red:100},'0').net,-100);
assert.equal(R.settle({black:100},'00').net,-100);
assert.equal(R.settle({'n:00':100},'0').net,-100);
assert.equal(R.settle({'n:00':100},'00').net,3500);
for(const [k,n,p] of [['group:1,2','2',18],['group:1,2,3','3',12],['group:1,2,4,5','4',9],['group:1,2,3,4,5,6','6',6],['dozen:2','24',3],['col:3','36',3],['even','2',2]])assert.equal(R.settle({[k]:100},n).returned,p*100);
let s={capital:10000,cycleNet:0,losses:0,step:0,cycles:0,turns:0};s=R.next(s,{red:1000},'2',3);assert.equal(s.capital,9000);assert.equal(s.losses,1);assert.equal(s.step,1);
s=R.next(s,{red:500},'1',3);assert.equal(s.cycleNet,-500);assert.equal(s.losses,1);assert.equal(s.step,2);
s=R.next(s,{red:500},'1',3);assert.equal(s.cycleNet,0);assert.equal(s.losses,0);assert.equal(s.step,0);assert.equal(s.cycles,1);
assert.deepEqual(R.scaled({red:100,'n:3':200},1.5,2),{red:225,'n:3':450});
assert.equal(R.settle({red:100,black:100},'1').net,0);
for(const mode of ['eu','us']){const expected=mode==='eu'?-100/37:-200/38;for(const key of ['n:1','red','black','odd','even','dozen:1','col:2','group:1,2','group:1,2,3','group:1,2,4,5','group:1,2,3,4,5,6']){const mean=R.pockets(mode).reduce((s,n)=>s+R.settle({[key]:100},n).net,0)/R.pockets(mode).length;assert.ok(Math.abs(mean-expected)<1e-8)}}
console.log('OK: payouts, zeros, mixed bets, partial recovery, cycle reset, progression and expected return.');
const c={...R.defaultConfig(),rules:[{kind:'streak',target:'red',window:3,count:1}]};
assert.equal(R.conditionMet(c,['1','3']),false);
assert.equal(R.conditionMet(c,['1','3','5']),true);
assert.equal(R.conditionMet(c,['1','0','5']),false);
assert.equal(R.conditionMet(c,['1','00','5']),false);
assert.equal(R.matches('0','even'),false);assert.equal(R.matches('00','black'),false);
const freq={...c,rules:[{kind:'frequency',target:'red',window:4,count:3}]};
assert.equal(R.conditionMet(freq,['1','2','3','5']),true);
assert.equal(R.conditionMet(freq,['1','2','4','5']),false);
const absent={...c,rules:[{kind:'absent',target:'n:10',window:3,count:1}]};
assert.equal(R.conditionMet(absent,['1','2']),false);
assert.equal(R.conditionMet(absent,['10','1','2','3']),true);
assert.equal(R.conditionMet(absent,['1','10','3']),false);
const both={...c,rules:[...c.rules,{kind:'streak',target:'odd',window:3,count:1}]};
assert.equal(R.conditionMet(both,['1','3','12']),false);
assert.equal(R.conditionMet({...both,join:'any'},['1','3','12']),true);
let st={capital:10000,cycleNet:0,losses:0,step:0,cycles:0,turns:0,observed:0,played:0};let results=[];
for(const n of ['1','3','5']){const plan=R.planTurn(st,[{black:100}],[c],results,1.5);assert.equal(plan.kind,'wait');st=R.resolveTurn(st,plan,n,1,c);results.push(n);assert.equal(st.capital,10000);assert.equal(st.cycles,0);assert.equal(st.step,0)}
let plan=R.planTurn(st,[{black:100}],[c],results,1.5);assert.equal(plan.kind,'bet');st=R.resolveTurn(st,plan,'7',1,c);results.push('7');assert.equal(st.capital,9900);assert.equal(st.losses,1);assert.equal(st.played,1);assert.equal(st.observed,3);
plan=R.planTurn(st,[{black:100}],[c],results,1.5);assert.equal(plan.bets.black,150);st=R.resolveTurn(st,plan,'2',1,c);results.push('2');assert.equal(st.capital,10050);assert.equal(st.cycles,1);assert.equal(st.losses,0);
assert.equal(R.planTurn(st,[{black:100}],[c],results,1.5).kind,'wait');
const obs={...R.defaultConfig(),action:'observe',observeTurns:2};
st={capital:9000,cycleNet:-1000,losses:2,step:0,cycles:0,turns:4};
for(let i=0;i<2;i++){plan=R.planTurn(st,[{}, {black:100}],[obs,c],[],1.5);assert.equal(plan.kind,'observe');st=R.resolveTurn(st,plan,'0',2,obs);assert.equal(st.capital,9000);assert.equal(st.cycleNet,-1000);assert.equal(st.losses,2);assert.equal(st.cycles,0);assert.equal(st.step,i===0?0:1)}
assert.equal(R.planTurn({...st,step:0,capital:50},[{black:100}],[c],['1','3','5'],1.5).kind,'blocked');
assert.equal(R.planTurn({...st,step:0,capital:50},[{black:100}],[c],[],1.5).kind,'wait');
assert.equal(R.validConfig(c,'eu'),true);assert.equal(R.validConfig({...c,rules:[{kind:'streak',target:'n:00',window:3,count:1}]},'eu'),false);
console.log('OK: prior-turn signals, insufficient history, zero interruptions, AND/OR, frequency, absence, no-stake accounting, observation advancement, progression, affordability.');
// Branching and loops: no routing transition consumes a random draw.
const branchRule=target=>({join:'all',rules:[{kind:'streak',target,window:2,count:1}]});
const router={...R.defaultConfig(),action:'router',routes:[{...branchRule('red'),to:1},{...branchRule('even'),to:2}]};
const graph=[router,{...R.defaultConfig(),exitWhen:'win',onContinue:2},{...R.defaultConfig(),exitWhen:'win',onContinue:1}];
const graphBets=[{},{black:100},{odd:100}];
let gs={capital:10000,cycleNet:0,losses:0,step:0,cycles:0,turns:0,played:0,observed:0};
assert.equal(R.planTurn(gs,graphBets,graph,[],1.5).kind,'wait');
let gp=R.planTurn(gs,graphBets,graph,['1','3'],1.5);assert.equal(gp.kind,'bet');assert.equal(gp.step,1);assert.deepEqual(gp.bets,{black:100});assert.deepEqual(gp.path,[{step:0,branch:0}]);
// A loss at E2 moves to E3 without rechecking E1. A further loss returns to E2.
gs=R.resolveTurn(gs,gp,'5',3,graph[gp.step]);assert.equal(gs.step,2);assert.equal(gs.turns,1);
gp=R.planTurn(gs,graphBets,graph,['1','3','5'],1.5);assert.equal(gp.step,2);assert.deepEqual(gp.bets,{odd:150});
gs=R.resolveTurn(gs,gp,'12',3,graph[gp.step]);assert.equal(gs.step,1);
gp=R.planTurn(gs,graphBets,graph,['1','3','5','12'],1.5);assert.deepEqual(gp.bets,{black:225});
// Gain may finish below the original cycle capital; losses must remain in capital.
gs=R.resolveTurn(gs,gp,'2',3,graph[gp.step]);assert.equal(gs.step,0);assert.equal(gs.cycleEnded,true);assert.equal(gs.closedCycleNet,-25);assert.equal(gs.capital,9975);assert.equal(gs.losses,0);
// Last two results, 12 then 2, trigger odd on the very next spin.
gp=R.planTurn(gs,graphBets,graph,['1','3','5','12','2'],1.5);assert.equal(gp.kind,'bet');assert.equal(gp.step,2);assert.deepEqual(gp.bets,{odd:100});assert.equal(gs.turns,3);
// The user's explicit example: a winning red, preceded by an even result.
const redGraph=[router,{...R.defaultConfig(),exitWhen:'win'},{...R.defaultConfig(),exitWhen:'win'}];
let redState={...gs,step:1};const redPlan={kind:'bet',step:1,bets:{red:100}};
redState=R.resolveTurn(redState,redPlan,'12',3,redGraph[1]);
const immediate=R.planTurn(redState,[{},{red:100},{odd:100}],redGraph,['2','12'],1.5);assert.equal(immediate.kind,'bet');assert.equal(immediate.step,2);
// Simultaneous signals: order is deterministic, never both wagers merged.
assert.equal(R.planTurn({...gs,step:0},graphBets,graph,['12','18'],1.5).step,1);
const reverse={...router,routes:[router.routes[1],router.routes[0]]};assert.equal(R.planTurn({...gs,step:0},graphBets,[reverse,...graph.slice(1)],['12','18'],1.5).step,2);
// Recovery exit preserves a partial gain and keeps looping.
const recover={...R.defaultConfig(),onContinue:1};
const partial=R.resolveTurn({...gs,cycleNet:-1000,losses:2,step:1},{kind:'bet',step:1,bets:{red:100}},'1',3,recover);assert.equal(partial.cycleEnded,false);assert.equal(partial.cycleNet,-900);assert.equal(partial.step,1);
const noExit={...R.defaultConfig(),exitWhen:'never',onContinue:1};assert.equal(R.resolveTurn(gs,{kind:'bet',step:1,bets:{red:100}},'1',3,noExit).step,1);
// Detect zero-draw router loops and missing destinations, rather than hanging.
const badRouter={...router,routes:[{join:'all',rules:[],to:0}]};assert.throws(()=>R.planTurn({...gs,step:0},graphBets,[badRouter,...graph.slice(1)],[],1.5),/Boucle/);
assert.equal(R.validConfig({...router,routes:[{...branchRule('red'),to:8}]},'eu',3),false);
assert.equal(graph.every(c=>R.validConfig(c,'eu',3)),true);
assert.deepEqual(R.normalizeConfig({action:'bet',observeTurns:1,join:'all',rules:[]}),R.defaultConfig());
assert.deepEqual(JSON.parse(JSON.stringify(graph)),graph);
console.log('OK: branches, priority conflicts, 2↔3 loop, win vs recovery exits, immediate reuse of ending draw, no phantom turns, legacy defaults, invalid graphs.');
// Different conditional wagers within one step; priority is explicit, not probabilistic.
const adaptive={...R.defaultConfig(),action:'adaptive',exitWhen:'win',onExit:0,onContinue:1,routes:[{join:'all',rules:[{kind:'streak',target:'even',window:5,count:1}],bets:{odd:200},to:0},{join:'all',rules:[{kind:'streak',target:'red',window:3,count:1}],bets:{black:100},to:0}]};
const as={capital:10000,cycleNet:0,losses:0,step:0,cycles:0,turns:0,played:0,observed:0};
assert.equal(R.validConfig(adaptive,'eu',2),true);
const bothSignals=['2','4','12','18','30'];
let ap=R.planTurn(as,[{}, {red:100}],[adaptive,R.defaultConfig()],bothSignals,1.5);
assert.equal(ap.step,0);assert.equal(ap.variant,0);assert.deepEqual(ap.bets,{odd:200});assert.equal(ap.path[0].branch,0);
let after=R.resolveTurn(as,ap,'1',2,adaptive);assert.equal(after.step,0);assert.equal(after.capital,10200);assert.equal(after.turns,1);assert.equal(after.cycleEnded,true);
// Same-step re-entry immediately rechecks all branches with the ending result.
ap=R.planTurn(after,[{}, {red:100}],[adaptive,R.defaultConfig()],[...bothSignals,'1'],1.5);assert.equal(ap.step,0);assert.equal(ap.variant,1);assert.deepEqual(ap.bets,{black:100});
after=R.resolveTurn(after,ap,'3',2,adaptive);assert.equal(after.step,1);assert.equal(after.losses,1);assert.equal(after.capital,10100);
// Reordering changes which eligible consequence is selected, never combines both.
const swapped={...adaptive,routes:[adaptive.routes[1],adaptive.routes[0]]};assert.deepEqual(R.planTurn(as,[{},{}],[swapped,R.defaultConfig()],bothSignals,1.5).bets,{black:100});
assert.equal(R.planTurn(as,[{},{}],[adaptive,R.defaultConfig()],['2','4'],1.5).kind,'wait');
assert.equal(R.planTurn(as,[{},{}],[adaptive,R.defaultConfig()],['0','00','2'],1.5).kind,'wait');
assert.equal(R.planTurn({...as,capital:150},[{},{}],[adaptive,R.defaultConfig()],bothSignals,1.5).kind,'blocked');
assert.deepEqual(R.planTurn({...as,losses:2},[{},{}],[adaptive,R.defaultConfig()],bothSignals,1.5).bets,{odd:450});
assert.equal(R.validConfig({...adaptive,routes:[{...adaptive.routes[0],bets:{odd:-100}}]},'eu',2),false);
assert.equal(R.validConfig(JSON.parse(JSON.stringify(adaptive)),'eu',2),true);
console.log('OK: same-step conditional bets, first matching priority, outcome destinations, immediate restart, progression, funds, save validation.');
