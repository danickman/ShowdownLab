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
function draftChoices(s,counts){
  const own=Object.keys(s.armies.blue).filter(t=>s.armies.blue[t]>0),all=Object.keys(counts),round=s.round;
  const reinforce=all[(round*3+s.blueLives)%all.length],mult=own[(round+s.redLives)%own.length]||reinforce;
  const candidates=own.filter(t=>canUpgrade(s.levels.blue[t]||1));
  const up=candidates[(round*2+1)%candidates.length],amount=(counts[reinforce]||2)+Math.max(0,s.redLives-s.blueLives);
  const choices=[{kind:'add',type:reinforce,amount},{kind:'mult',type:mult,mult:2}];
  if(up)choices.push({kind:'up',type:up,amount:1,level:normalize((s.levels.blue[up]||1)+1)});
  return choices;
}
window.ShowdownEvolution=Object.freeze({MAX_LEVEL,STEP,normalize,multiplier,tier,accent,label,canUpgrade,draftChoices});
})();
