const assert=require('node:assert/strict'),J=require('./journal-model.js');
const r={sessionId:'s1',timestamp:'2026-10-12T00:00:00Z',turn:1,cycle:1,step:1,route:'E1/B2',condition:'3 rouges',kind:'bet',result:'00',color:'Zero',multiplier:1.5,lossesBefore:1,capitalBefore:100000,stake:300,returned:0,net:-300,capital:99700,cycleBefore:-200,cycleNet:-500,nextStep:2,cycleEnded:false,closedCycleNet:null,betDetails:[{key:'red',label:'Rouge',amount:100,returned:0,net:-100},{key:'odd',label:'Impair',amount:200,returned:0,net:-200}]};
const sessions={s1:{name:'=HYPERLINK("x")',mode:'us'}};
const tours=J.turnRows([r],sessions),bets=J.betRows([r],sessions);assert.equal(tours.length,2);assert.equal(bets.length,3);assert.equal(tours[0].length,tours[1].length);assert.ok(tours[1].includes('00 (double zero)'));assert.equal(bets[1].length,bets[0].length);assert.equal(bets[2][11],'2,00');
const csv=J.csv(tours);assert.ok(csv.startsWith('\uFEFF'));assert.ok(csv.includes('"-3,00"'));assert.ok(!csv.includes("'-3,00"));assert.ok(csv.includes("'=HYPERLINK"));
assert.equal(J.betRows([{...r,kind:'wait',betDetails:[],stake:0,returned:0,net:0}],sessions).length,2);
const many=Array.from({length:160},(_,i)=>({...r,turn:i+1}));assert.equal(J.turnRows(many,sessions).length,161);assert.equal(J.betRows(many,sessions).length,321);
console.log('OK: complete export beyond UI page, per-bet rows, no-bet rounds, negative Excel numbers, double-zero distinction, formula escaping.');
