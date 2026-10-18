const assert=require('node:assert/strict'),R=require('./engine'),J=require('./journal-model');
const state={capital:101,step:0,losses:0,cycleNet:0,cycles:0,turns:0};const configs=[R.defaultConfig()],steps=[{red:200,black:100}];
assert.equal(R.planTurn(state,steps,configs,[],1,false).kind,'blocked');
const p=R.planTurn(state,steps,configs,[],1,true);assert.equal(p.allIn,true);assert.deepEqual(p.bets,{red:67,black:34});assert.equal(R.cost(p.bets),101);
for(const result of ['1','2','0']){const next=R.resolveTurn(state,p,result,1,configs[0]);assert.equal(next.finished,true);assert.ok(next.capital>=0);assert.equal(next.last.stake,101);}
assert.equal(R.planTurn({...state,capital:0},steps,configs,[],1,true).kind,'blocked');assert.equal(R.planTurn({...state,capital:300},steps,configs,[],1,true).allIn,undefined);
assert.deepEqual(R.affordablePlan({kind:'blocked',bets:{red:100,black:100,even:100}},1,true).bets,{red:1});
for(let capital=1;capital<1000;capital++){const p=R.affordablePlan({kind:'blocked',bets:{red:3333,black:2222,even:1111}},capital,true);assert.equal(R.cost(p.bets),capital);assert.ok(Object.values(p.bets).every(v=>Number.isSafeInteger(v)&&v>0));}
const adaptive=[{...R.defaultConfig(),action:'adaptive',routes:[{join:'all',rules:[],bets:{odd:500}}]}];assert.equal(R.planTurn(state,[{}],adaptive,[],1.5,true).bets.odd,101);
assert.equal(J.outcome({kind:'bet',allIn:true}),'All-in final');
console.log('OK: opt-in, proportional cent allocation, exact funds, zero capital, ordinary affordable bets, adaptive branches and terminal win/loss outcomes.');
