(function(root){
const red=[1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
function pockets(mode){return mode==='eu'?['0',...Array.from({length:36},(_,i)=>String(i+1))]:['0','00',...Array.from({length:36},(_,i)=>String(i+1))]}
function numbers(key){const [type,val]=key.split(':');if(type==='n')return [val];if(type==='group')return val.split(',');let ns=Array.from({length:36},(_,i)=>i+1);if(key==='red')ns=red;if(key==='black')ns=ns.filter(n=>!red.includes(n));if(key==='even')ns=ns.filter(n=>n%2===0);if(key==='odd')ns=ns.filter(n=>n%2);if(key==='low')ns=ns.filter(n=>n<=18);if(key==='high')ns=ns.filter(n=>n>=19);if(type==='dozen')ns=ns.filter(n=>n>12*(+val-1)&&n<=12*+val);if(type==='col')ns=ns.filter(n=>(n-1)%3===+val-1);return ns.map(String)}
function payout(key){return 36/numbers(key).length}
function cost(bets){return Object.values(bets).reduce((a,b)=>a+b,0)}
function scaled(bets,factor,losses){const out={};for(const [k,v]of Object.entries(bets)){const x=Math.round(v*Math.pow(factor,losses));if(!Number.isSafeInteger(x)||x<1)throw Error('La progression dépasse la limite de calcul.');out[k]=x}return out}
function affordablePlan(plan,capital,enabled){
if(plan.kind!=='blocked'||!enabled||!Number.isSafeInteger(capital)||capital<=0)return plan;
const entries=Object.entries(plan.bets),total=entries.reduce((a,[,v])=>a+BigInt(v),0n),budget=BigInt(capital);
const parts=entries.map(([key,v],i)=>({key,i,value:Number(BigInt(v)*budget/total),remainder:BigInt(v)*budget%total}));
let left=capital-parts.reduce((a,p)=>a+p.value,0);
const ranked=[...parts].sort((a,b)=>a.remainder===b.remainder?a.i-b.i:a.remainder>b.remainder?-1:1);
for(let i=0;i<left;i++)ranked[i].value++;
return {...plan,kind:'bet',allIn:true,plannedStake:cost(plan.bets),bets:Object.fromEntries(parts.filter(p=>p.value>0).map(p=>[p.key,p.value]))};
}
function settle(bets,result){let returned=0;for(const [key,value]of Object.entries(bets))if(numbers(key).includes(String(result)))returned+=value*payout(key);return {stake:cost(bets),returned,net:returned-cost(bets)}}
function next(state,bets,result,length){const r=settle(bets,result);const cycleNet=state.cycleNet+r.net;const recovered=cycleNet>=0;return {...state,capital:state.capital+r.net,cycleNet:recovered?0:cycleNet,losses:recovered?0:state.losses+(r.net<0?1:0),step:recovered?0:(state.step+1)%length,cycles:state.cycles+(recovered?1:0),turns:state.turns+1,last:r,recovered}}
function defaultConfig(){return {action:'bet',observeTurns:1,join:'all',rules:[],routes:[],exitWhen:'recovered',onExit:0,onContinue:-1}}
function matches(result,target){return target==='zero'?result==='0'||result==='00':numbers(target).includes(String(result))}
function ruleMet(rule,results){const n=Number(rule.window);if(results.length<n)return false;const recent=results.slice(-n);const count=recent.filter(v=>matches(String(v),rule.target)).length;return rule.kind==='streak'?count===n:rule.kind==='absent'?count===0:count>=Number(rule.count)}
function conditionMet(config,results){if(!config.rules.length)return true;return config.join==='any'?config.rules.some(r=>ruleMet(r,results)):config.rules.every(r=>ruleMet(r,results))}
function normalizeConfig(c){return {...defaultConfig(),...c,routes:c.routes||[]}}
function validConfig(c,mode,length=30){
const targets=['red','black','zero','even','odd','low','high','dozen:1','dozen:2','dozen:3','col:1','col:2','col:3',...pockets(mode).map(n=>'n:'+n)];
const validRules=o=>o&&['all','any'].includes(o.join)&&Array.isArray(o.rules)&&o.rules.length<=5&&o.rules.every(r=>['streak','absent','frequency'].includes(r.kind)&&targets.includes(r.target)&&Number.isInteger(r.window)&&r.window>=1&&r.window<=100&&Number.isInteger(r.count)&&r.count>=1&&r.count<=r.window);
if(!c)return false;c=normalizeConfig(c);const dest=n=>Number.isInteger(n)&&n>=0&&n<length;
const validBets=b=>{if(!b||typeof b!=='object'||Array.isArray(b))return false;return Object.entries(b).every(([k,v])=>{const keyOK=targets.includes(k)&&k!=='zero'||/^group:/.test(k)&&numbers(k).every(n=>pockets(mode).includes(n));return Number.isSafeInteger(v)&&v>0&&keyOK})&&Number.isSafeInteger(cost(b))};
return ['bet','observe','router','adaptive'].includes(c.action)&&Number.isInteger(c.observeTurns)&&c.observeTurns>=1&&c.observeTurns<=100&&validRules(c)&&['recovered','win','never'].includes(c.exitWhen)&&dest(c.onExit)&&(c.onContinue===-1||dest(c.onContinue))&&Array.isArray(c.routes)&&c.routes.length<=8&&c.routes.every(r=>validRules(r)&&(c.action==='adaptive'?validBets(r.bets):dest(r.to)));
}
function planTurn(state,steps,configs,results,factor,allIn=false){
let step=state.step;const visited=new Set(),path=[];
while(true){
if(visited.has(step))throw Error('Boucle de déclencheurs sans tirage : dirigez une branche vers une étape de mise ou d’observation.');visited.add(step);
const config=configs[step];if(!config)throw Error('Étape de destination introuvable.');
if(config.action==='router'){
const index=config.routes.findIndex(r=>conditionMet(r,results));
if(index<0)return {kind:'wait',bets:{},step,path};
path.push({step,branch:index});step=config.routes[index].to;continue;
}
if(config.action==='adaptive'){const index=config.routes.findIndex(r=>conditionMet(r,results));if(index<0)return {kind:'wait',bets:{},step,path};path.push({step,branch:index});const bets=scaled(config.routes[index].bets,factor,state.losses);return affordablePlan({kind:cost(bets)>state.capital?'blocked':'bet',bets,step,path,variant:index},state.capital,allIn);}
if(config.action==='observe')return {kind:'observe',bets:{},step,path};
if(!conditionMet(config,results))return {kind:'wait',bets:{},step,path};
const bets=scaled(steps[step],factor,state.losses);return affordablePlan({kind:cost(bets)>state.capital?'blocked':'bet',bets,step,path},state.capital,allIn);
}}
function resolveTurn(state,plan,result,length,config){
if(plan.kind==='blocked')throw Error('Capital insuffisant');
state={...state,step:plan.step??state.step};config=normalizeConfig(config);
const nextStep=config.onContinue===-1?(state.step+1)%length:config.onContinue;
if(plan.kind==='bet'){
const r=settle(plan.bets,result),cycleNet=state.cycleNet+r.net;
const ended=config.exitWhen==='recovered'?cycleNet>=0:config.exitWhen==='win'?r.net>0:false;
return {...state,finished:!!plan.allIn,capital:state.capital+r.net,cycleNet:ended?0:cycleNet,losses:ended?0:state.losses+(r.net<0?1:0),step:ended?config.onExit:nextStep,cycles:state.cycles+(ended?1:0),turns:state.turns+1,last:r,recovered:ended&&cycleNet>=0,cycleEnded:ended,closedCycleNet:ended?cycleNet:null,observeProgress:0,played:(state.played||0)+1};
}
const progress=(state.observeProgress||0)+1,advance=plan.kind==='observe'&&progress>=config.observeTurns;
return {...state,turns:state.turns+1,observed:(state.observed||0)+1,recovered:false,cycleEnded:false,closedCycleNet:null,last:{stake:0,returned:0,net:0},step:advance?nextStep:state.step,observeProgress:plan.kind==='observe'&&!advance?progress:0};
}
function draw(mode){const list=pockets(mode),limit=Math.floor(4294967296/list.length)*list.length;let a=new Uint32Array(1);do{root.crypto.getRandomValues(a)}while(a[0]>=limit);return list[a[0]%list.length]}
const api={affordablePlan,red,pockets,numbers,payout,cost,scaled,settle,next,draw,defaultConfig,normalizeConfig,matches,ruleMet,conditionMet,validConfig,planTurn,resolveTurn};if(typeof module!=='undefined')module.exports=api;else root.Roulette=api;
})(globalThis);
