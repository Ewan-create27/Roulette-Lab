const assert=require('node:assert/strict'),S=require('./stats-model');
const s=S.create(10000);
let capital=10000;
for(const [net,stake,end] of [[-100,100,false],[-200,200,false],[0,0,false],[150,100,false],[-50,50,true],[0,100,false]]){
 capital+=net;S.add(s,{net,stake,capital,cycleEnded:end,betDetails:stake?[{net}]:[]});
}
assert.equal(s.maxStreak,2);assert.equal(s.maxStreakLoss,300);assert.equal(s.maxLoss,200);assert.equal(s.drawdown,300);assert.equal(s.drawdownPct,.03);
assert.equal(s.played,5);assert.equal(s.observed,1);assert.equal(s.wins,1);assert.equal(s.losses,3);assert.equal(s.neutral,1);assert.equal(s.streak,0);
assert.equal(s.stake,550);assert.equal(s.capital,9800);assert.equal(s.mean,-.4);assert.ok(Math.abs(s.m2/s.played-1.34)<1e-12);assert.equal(s.cycles,1);assert.equal(s.cycleTurns,5);
const mixed=S.create(10000);S.add(mixed,{net:-100,stake:300,capital:9900,betDetails:[{net:100},{net:-200}]});assert.equal(mixed.wins,0);assert.equal(mixed.winningBets,1);assert.equal(mixed.bets,2);
const empty=S.create(0);assert.equal(empty.played,0);S.add(empty,{stake:0,net:0,capital:0});assert.equal(empty.drawdownPct,0);
console.log('OK: loss streaks, observations, net mixed bets, drawdown, population variance, cycle durations and empty sessions.');
