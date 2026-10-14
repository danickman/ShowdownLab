(()=>{'use strict';
// Squad levels are match progression; collection Mastery remains independent.
const MAX_LEVEL=5,STEP=1.4;
const normalize=value=>Math.max(1,Math.min(MAX_LEVEL,Math.floor(Number(value)||1)));
const multiplier=level=>STEP**(normalize(level)-1);
const tier=level=>normalize(level)>=4?'ultimate':normalize(level)>=2?'evolved':'base';
const accent=level=>[3,5].includes(normalize(level));
const names=['','Base','Evolved','Tempered','Ultimate','Ascended'];
const label=level=>names[normalize(level)];
const canUpgrade=level=>normalize(level)<MAX_LEVEL;
// Soft combined-army ×2 eligibility. The simulation/Lab is intentionally uncapped.
const MULTIPLY_POPULATION_LIMIT=120;
const population=s=>['blue','red'].reduce((sum,team)=>sum+Object.values(s.armies?.[team]||{}).reduce((n,v)=>n+Math.max(0,Math.floor(Number(v)||0)),0),0);
function canMultiply(s,team,type,mult=2){
 const count=Math.max(0,Math.floor(Number(s.armies?.[team]?.[type])||0));
 const extra=Math.max(0,Math.round(count*Math.max(1.25,Number(mult)||2))-count);
 return count>0&&population(s)<MULTIPLY_POPULATION_LIMIT&&population(s)+extra<=MULTIPLY_POPULATION_LIMIT;
}
// An opt-in intermission disruption affects the *next* battle only.
function disruptionOffer(s,team='blue'){
 const foe=team==='blue'?'red':'blue';
 const army=s.armies?.[foe]||{},levels=s.levels?.[foe]||{};
 const grown=Object.keys(army).filter(type=>army[type]>0&&(levels[type]||1)>1)
  .sort((a,b)=>(levels[b]||1)-(levels[a]||1)||(army[b]||0)-(army[a]||0)||a.localeCompare(b));
 const packed=Object.keys(army).filter(type=>army[type]>=4)
  .sort((a,b)=>(army[b]||0)-(army[a]||0)||a.localeCompare(b));
 const jam=grown.length?{kind:'disrupt',effect:'jam',type:grown[0],amount:1}:null;
 const thin=packed.length?{kind:'disrupt',effect:'thin',type:packed[0],amount:Math.min(3,Math.max(1,Math.floor(army[packed[0]]*.15)))}:null;
 const behind=(team==='blue'?s.blueLives:s.redLives)<(team==='blue'?s.redLives:s.blueLives);
 return behind?jam||thin:((s.round||1)%2===0?thin||jam:jam||thin);
}
function draftChoices(s,counts){
  const own=Object.keys(s.armies.blue).filter(t=>s.armies.blue[t]>0),all=Object.keys(counts),round=s.round;
  const reinforce=all[(round*3+s.blueLives)%all.length],mult=own[(round+s.redLives)%own.length]||reinforce;
  const candidates=own.filter(t=>canUpgrade(s.levels.blue[t]||1));
  const up=candidates[(round*2+1)%candidates.length],amount=(counts[reinforce]||2)+Math.max(0,s.redLives-s.blueLives);
  // Preserve three meaningful choices: after the population reaches the ×2
  // threshold, favor a distinct evolution or a small specialist reinforcement.
  const secondUp=candidates.find(type=>type!==up);
  const specialist=all.find((type,i)=>i>=(round+s.redLives)%all.length&&type!==reinforce)||all.find(type=>type!==reinforce)||reinforce;
  const disruption=disruptionOffer(s,'blue');
  const alternate=canMultiply(s,'blue',mult,2)?{kind:'mult',type:mult,mult:2}:
    disruption&&((s.round||1)%3!==0||!secondUp)?disruption:
    secondUp?{kind:'up',type:secondUp,amount:1,level:normalize((s.levels.blue[secondUp]||1)+1),specialist:true}:
    {kind:'add',type:specialist,amount:Math.min(2,counts[specialist]||2),specialist:true};
  const choices=[{kind:'add',type:reinforce,amount},alternate];
  if(up)choices.push({kind:'up',type:up,amount:1,level:normalize((s.levels.blue[up]||1)+1)});
  return choices;
}
window.ShowdownEvolution=Object.freeze({MAX_LEVEL,STEP,normalize,multiplier,tier,accent,label,canUpgrade,population,canMultiply,MULTIPLY_POPULATION_LIMIT,disruptionOffer,draftChoices});
})();
