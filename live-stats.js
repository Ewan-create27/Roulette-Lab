(()=>{
 const panel=document.createElement('details');panel.className='live-stats';panel.open=true;
 panel.innerHTML='<summary>Analyse en direct <span>Session en cours · mise à jour à chaque tour</span></summary><div class="live-stats-grid"></div><p class="fineprint">Un tour misé regroupe toutes les mises du même tirage : il est gagnant si son résultat net est positif. Les observations sans mise préservent les séries ; un tour misé gagnant ou neutre les termine. Variance descriptive des résultats nets par tour misé (division par N), en crédits².</p>';
 document.querySelector('.journal-section').before(panel);
 const grid=panel.querySelector('.live-stats-grid');let source,stats,processed=0;
 const number=n=>n.toLocaleString('fr-FR',{maximumFractionDigits:2}),money=n=>fmt(n)+' cr.',ratio=(a,b)=>b?number(a/b*100)+' %':'—',average=(a,b)=>b?money(a/b):'—';
 function render(){
  if(source!==history||stats.initial!==readInitial()){source=history;stats=SimulationStats.create(readInitial());processed=0;}
  for(;processed<history.length;processed++)SimulationStats.add(stats,history[processed]);
  const s=stats,net=s.capital-s.initial,variance=s.played?Math.max(0,s.m2/s.played):null;
  const cards=[
   ['Pire série perdante',s.maxStreak+' tours', 'Actuelle : '+s.streak+' · tours misés'],
   ['Perte maximale d’une série',money(s.maxStreakLoss),'Somme des pertes consécutives'],
   ['Plus forte perte sur un tour',money(s.maxLoss),'Résultat net, toutes mises réunies'],
   ['Repli maximal du capital',money(s.drawdown),'Depuis un sommet précédent · max. '+ratio(s.drawdownPct,1)],
   ['Tours gagnants / tours misés',ratio(s.wins,s.played),s.wins+' gagnants / '+s.played+' misés'],
   ['Tours gagnants / observations seules',ratio(s.wins,s.observed),s.wins+' / '+s.observed+' sans mise · peut dépasser 100 %'],
   ['Tours gagnants / tous les tirages',ratio(s.wins,s.turns),s.wins+' / '+s.turns+' tirages, observations incluses'],
   ['Fréquence de mise',ratio(s.played,s.turns),s.played+' misés · '+s.observed+' observés'],
   ['Mises individuelles gagnantes',ratio(s.winningBets,s.bets),s.winningBets+' / '+s.bets+' paris posés'],
   ['Résultat net de la session',money(net),'Rendement du capital initial : '+ratio(net,s.initial)],
   ['Résultat moyen / tour misé',s.played?number(s.mean)+' cr.':'—',s.losses+' perdants · '+s.neutral+' neutres'],
   ['Résultat moyen / tirage',average(net,s.turns),'Tous les tours, observations incluses'],
   ['Variance des résultats nets',variance===null?'—':number(variance)+' cr.²','Par tour misé · dispersion observée'],
   ['Écart-type des résultats nets',variance===null?'—':number(Math.sqrt(variance))+' cr.','Racine carrée de la variance'],
   ['Total misé',money(s.stake),'Résultat net / total misé : '+ratio(net,s.stake)],
   ['Mise moyenne / maximale',average(s.stake,s.played)+' / '+money(s.maxStake),'Total engagé par tour misé'],
   ['Gain moyen / perte moyenne',average(s.gains,s.wins)+' / '+average(s.lost,s.losses),'Résultats nets des tours gagnants / perdants'],
   ['Rapport gains / pertes',s.lost?number(s.gains/s.lost):'—','Gains nets cumulés / pertes nettes cumulées'],
   ['Capital minimal / maximal',money(s.min)+' / '+money(s.peak),'Capital initial inclus'],
   ['Durée moyenne d’un cycle',s.cycles?number(s.cycleTurns/s.cycles)+' tours':'—',s.cycles+' terminés · maximum '+s.maxCycleTurns+' tours']
  ];
  grid.innerHTML=cards.map(([label,value,detail])=>'<div class="live-stat"><span>'+label+'</span><strong>'+value+'</strong><small>'+detail+'</small></div>').join('');
 }
 window.LiveStats={render};render();
})();
