(function(root){
function create(initial){return {initial,capital:initial,peak:initial,min:initial,turns:0,played:0,observed:0,wins:0,losses:0,neutral:0,streak:0,maxStreak:0,streakLoss:0,maxStreakLoss:0,maxLoss:0,maxWin:0,drawdown:0,drawdownPct:0,stake:0,maxStake:0,gains:0,lost:0,mean:0,m2:0,bets:0,winningBets:0,cycles:0,cycleTurns:0,maxCycleTurns:0,lastCycleEnd:0};}
function add(s,r){
 s.turns++;s.capital=r.capital;s.peak=Math.max(s.peak,r.capital);s.min=Math.min(s.min,r.capital);
 const dd=s.peak-r.capital;s.drawdown=Math.max(s.drawdown,dd);s.drawdownPct=Math.max(s.drawdownPct,s.peak>0?dd/s.peak:0);
 if(r.stake>0){
  s.played++;s.stake+=r.stake;s.maxStake=Math.max(s.maxStake,r.stake);s.maxLoss=Math.max(s.maxLoss,-r.net);s.maxWin=Math.max(s.maxWin,r.net);
  if(r.net<0){s.losses++;s.streak++;s.streakLoss-=r.net;s.lost-=r.net;}else{s.streak=0;s.streakLoss=0;if(r.net>0){s.wins++;s.gains+=r.net;}else s.neutral++;}
  s.maxStreak=Math.max(s.maxStreak,s.streak);s.maxStreakLoss=Math.max(s.maxStreakLoss,s.streakLoss);
  const value=r.net/100,delta=value-s.mean;s.mean+=delta/s.played;s.m2+=delta*(value-s.mean);
  for(const b of r.betDetails||[]){s.bets++;if(b.net>0)s.winningBets++;}
 }else s.observed++;
 if(r.cycleEnded){const duration=s.turns-s.lastCycleEnd;s.cycles++;s.cycleTurns+=duration;s.maxCycleTurns=Math.max(s.maxCycleTurns,duration);s.lastCycleEnd=s.turns;}
 return s;
}
const api={create,add};if(typeof module==='object'&&module.exports)module.exports=api;else root.SimulationStats=api;
})(typeof window!=='undefined'?window:globalThis);
