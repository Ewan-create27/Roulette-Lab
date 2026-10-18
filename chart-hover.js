/* Exact per-turn inspection; observations preserve the last series of played bets. */
(function(){
  const svg=document.getElementById('chart');
  const wrap=document.createElement('div');wrap.className='chart-interactive';
  svg.before(wrap);wrap.append(svg);
  const tip=document.createElement('div');tip.className='chart-tooltip';tip.id='chartTooltip';tip.hidden=true;tip.setAttribute('role','status');wrap.append(tip);
  svg.setAttribute('tabindex','0');svg.setAttribute('role','group');
  svg.setAttribute('aria-label','Évolution du capital. Survolez ou touchez pour inspecter un tour. Au clavier, utilisez les flèches gauche et droite.');
  const hint=document.createElement('p');hint.className='chart-help';hint.textContent='Survolez ou touchez la courbe pour inspecter les pertes · ← → au clavier';wrap.after(hint);
  let selected=null,y=v=>v,cache=[],source=null;
  function prepare(Y){
    y=Y;
    if(source!==history){source=history;cache=[];selected=null;tip.hidden=true;}
    for(let i=cache.length;i<history.length;i++){
      const r=history[i],prev=cache[i-1]||{count:0,loss:0};
      cache.push(r.stake>0?(r.net<0?{count:prev.count+1,loss:prev.loss-r.net}:{count:0,loss:0}):{...prev});
    }
  }
  function refresh(){
    svg.querySelector('.chart-inspection')?.remove();
    if(selected===null){tip.hidden=true;return;}
    selected=Math.max(0,Math.min(points.length-1,selected));
    const r=history[selected-1],series=cache[selected-1]||{count:0,loss:0},capital=points[selected];
    const x=10+selected*980/Math.max(1,points.length-1),cy=y(capital);
    const ns='http://www.w3.org/2000/svg',g=document.createElementNS(ns,'g');g.setAttribute('class','chart-inspection');
    const line=document.createElementNS(ns,'path');line.setAttribute('d',`M${x} 25V170`);line.setAttribute('stroke','#d4b779');line.setAttribute('stroke-dasharray','3 4');g.append(line);
    const dot=document.createElementNS(ns,'circle');dot.setAttribute('cx',x);dot.setAttribute('cy',cy);dot.setAttribute('r','4');dot.setAttribute('fill','#d4b779');g.append(dot);svg.append(g);
    tip.innerHTML=`<strong>${selected?'Tour '+selected+' · Numéro '+r.result:'Départ de la session'}</strong><dl><dt>Capital</dt><dd>${fmt(capital)} cr.</dd><dt>Perte du tour</dt><dd>${fmt(Math.max(0,-(r?.net||0)))} cr.</dd><dt>Mises perdantes consécutives</dt><dd>${series.count}</dd><dt>Perte cumulée de la série</dt><dd>${fmt(series.loss)} cr.</dd></dl><small>${r?.stake===0?'Observation sans mise · série conservée.':'Une mise gagnante ou neutre remet la série à zéro.'}</small>`;
    tip.hidden=false;
    // SVG coordinates account for letterboxing, global zoom and responsive layouts.
    const matrix=svg.getScreenCTM();if(!matrix)return;const pt=svg.createSVGPoint();pt.x=x;pt.y=cy;const screen=pt.matrixTransform(matrix);const box=wrap.getBoundingClientRect(),scale=box.width/wrap.offsetWidth||1;
    tip.style.left=Math.max(0,Math.min(wrap.clientWidth-tip.offsetWidth,(screen.x-box.left)/scale+12))+'px';
    tip.style.top=Math.max(0,(screen.y-box.top)/scale-tip.offsetHeight-12)+'px';
  }
  function inspect(e){const matrix=svg.getScreenCTM();if(!matrix)return;const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const local=p.matrixTransform(matrix.inverse());selected=Math.round(Math.max(0,Math.min(1,(local.x-10)/980))*(points.length-1));refresh();}
  svg.addEventListener('pointermove',inspect);svg.addEventListener('pointerdown',inspect);
  svg.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'){selected=null;refresh();}});
  svg.addEventListener('focus',()=>{selected=points.length-1;refresh();});
  svg.addEventListener('blur',()=>{selected=null;refresh();});
  svg.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End','Escape'].includes(e.key))return;e.preventDefault();if(e.key==='Escape')selected=null;else if(e.key==='Home')selected=0;else if(e.key==='End')selected=points.length-1;else selected=(selected??points.length-1)+(e.key==='ArrowRight'?1:-1);refresh();});
  window.addEventListener('resize',refresh);window.addEventListener('workspace:resize',refresh);
  window.ChartHover={prepare,refresh};chart();
})();
