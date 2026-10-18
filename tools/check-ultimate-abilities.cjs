const fs=require('fs'),vm=require('vm'),assert=require('assert');
const e={window:null,Math,performance:{now:()=>0},requestAnimationFrame:()=>1,cancelAnimationFrame(){},console};e.window=e;vm.createContext(e);
for(const f of ['evolution-rules','ultimate-abilities'])vm.runInContext(fs.readFileSync('v3/'+f+'.js','utf8'),e);
const U=e.ShowdownUltimates;const close=(a,b)=>assert(Math.abs(a-b)<1e-9,`${a} != ${b}`);
const unit=(type,level=4,team='blue',id=1,x=.5,y=.5)=>({type,level,team,id,x,y,hp:100,maxHp:100,dmg:100,stun:0,burrow:0,armor:0,dodge:0,guard:0,shell:0,ward:0,action:'attack',knock:0});
for(const level of [1,2,3])for(const type of Object.keys(U.specs)){
 const a=unit(type,level),t=unit('mole',level,'red',2);assert.equal(U.rank(a),0);assert.equal(U.outgoing(a,t,100,[a,t],30),100);assert.equal(U.incoming(t,100,[a,t],30),100);assert.equal(U.afterHit(a,t,100,[a,t],30).length,0);assert.equal(U.honk(a,[a,t],30).length,0);assert.equal(a.ultimateTick,undefined);
}
for(const level of [4,5]){
 const rank=level===5?2:1,mole=unit('mole',level);assert.equal(U.incoming(mole,100,[mole],30),rank===2?50:65);
 const knight=unit('knight',level),ally=unit('goose',1,'blue',2,.55);assert.equal(U.incoming(ally,100,[knight,ally],30),rank===2?70:80);ally.x=.9;assert.equal(U.incoming(ally,100,[knight,ally],45),100);
 const sniper=unit('sniper',level),t=unit('mole',1,'red',2,.6),behind=unit('turtle',1,'red',3,.68),side=unit('turtle',1,'red',4,.68,.7);t.armor=.5;assert.equal(U.armor(t,sniper),rank===2?0:.2);
 let hits=U.afterHit(sniper,t,100,[sniper,t,behind,side],30);assert.equal(hits.length,1);assert.equal(hits[0].target.id,3);close(hits[0].damage,rank===2?80:55);
 sniper.action='buttstroke';assert.equal(U.armor(t,sniper),.5);
 const dragon=unit('dragon',level);dragon.action='fire';U.afterHit(dragon,t,100,[dragon,t],30);let burn=0;for(let i=0;i<90;i++)burn+=U.burn(t);assert(Math.abs(burn-(rank===2?75:45))<1e-10);assert.equal(U.burn(t),0);
 U.afterHit(dragon,t,100,[dragon,t],45);t.burrow=90;for(let i=0;i<90;i++)assert.equal(U.burn(t),0);t.burrow=0;
 const assassin=unit('assassin',level);assassin.action='backstab';t.hp=30;assert.equal(U.outgoing(assassin,t,100,[assassin,t],30),rank===2?220.00000000000003:180);t.hp=90;assert.equal(U.outgoing(assassin,t,100,[assassin,t],50),100);
 t.hp=74;assert.equal(U.outgoing(assassin,t,100,[assassin,t],61),rank===2?220.00000000000003:100,'L5 Execution triggers below 75%; L4 remains below 40%');
 t.hp=75;assert.equal(U.outgoing(assassin,t,100,[assassin,t],75),100,'75% boundary is strictly below');
 t.hp=40;assert.equal(U.outgoing(assassin,t,100,[assassin,t],89),rank===2?220.00000000000003:100,'L4 40% boundary unchanged');
 const beetank=unit('beetank',level);beetank.action='horn';for(let i=0;i<(rank===2?2:3)-1;i++)assert.equal(U.afterHit(beetank,t,100,[beetank,t,behind],i*20).length,0);hits=U.afterHit(beetank,t,100,[beetank,t,behind],60);close(hits[0].damage,rank===2?55.00000000000001:35);assert.equal(behind.stun,rank===2?20:12);
 const turtle=unit('turtle',level,'red',8,.51),attacker=unit('knight',1);hits=U.afterHit(attacker,turtle,40,[attacker,turtle],30);assert.equal(hits.length,1);close(hits[0].damage,rank===2?18:12);
 attacker.x=turtle.x+.095;hits=U.afterHit(attacker,turtle,40,[attacker,turtle],45);assert.equal(hits.length,1,'close collision-edge attacker should trigger Ricochet');close(hits[0].damage,rank===2?18:12);
 attacker.x=turtle.x+.101;assert.equal(U.afterHit(attacker,turtle,40,[attacker,turtle],50).length,0,'outside 0.10 Ricochet radius must preserve ranged counterplay');
 const goblin=unit('goblin',level),pack=Array.from({length:8},(_,i)=>unit('goblin',1,'blue',i+2,.52));assert.equal(U.outgoing(goblin,t,100,[goblin,...pack],30),rank===2?220.00000000000003:160);
 const barbarian=unit('barbarian',level);barbarian.action='axe_swing';const crowd=Array.from({length:8},(_,i)=>unit('goose',1,'red',i+10,.62,.5+i*.002));hits=U.afterHit(barbarian,t,100,[barbarian,t,...crowd],30);assert.equal(hits.length,rank===2?5:3);assert(hits.every(h=>Math.abs(h.damage-(rank===2?100:58))<1e-9),'premium Cleave physical secondary damage');
 assert(hits.every(h=>h.target.stun===(rank===2?12:8)),'premium Cleave stagger on real splash victims');

 const twinMole=unit('mole',5,'blue',100,.2,.5);twinMole.action='erupt';
 const primaryMole=unit('knight',1,'red',101,.5,.5);
 const f1=unit('goblin',1,'red',102,.56,.5),f2=unit('goblin',1,'red',103,.68,.54);
 const f3=unit('goblin',1,'red',104,.75,.5),back=unit('goblin',1,'red',105,.4,.5);
 hits=U.afterHit(twinMole,primaryMole,40,[twinMole,primaryMole,f3,f2,back,f1],99);
 assert.equal(hits.length,2);assert.equal(hits.map(h=>h.target.id).join(','),'102,103');
 assert(hits.every(h=>Math.abs(h.damage-62)<1e-9),'Twin L5 physical source contract');
 assert.equal(f1.stun,3);assert.equal(f2.stun,3);assert.equal(f3.stun,0);assert.equal(back.stun,0);
 assert.equal(twinMole.ultimateKind,'fissure');
 const oldMole=unit('mole',4,'blue',106,.2,.5);oldMole.action='erupt';
 assert.equal(U.afterHit(oldMole,primaryMole,40,[oldMole,primaryMole,f1,f2],100).length,0);
 const goose=unit('goose',level);hits=U.honk(goose,[goose,t],30);
 close(hits[0].damage,rank===2?110:75);assert.equal(t.stun,rank===2?64:44);
 const direct=unit('knight',1,'red',45,rank===2?.73:.68),echo=unit('goblin',1,'red',46,rank===2?.86:.77);
 const two=U.honk(goose,[goose,direct,echo],31);
 assert.equal(two.length,2,'Impact must hit a primary and a physically different echo target');
 close(two.find(x=>x.target.id===45).damage,rank===2?110:75);
 close(two.find(x=>x.target.id===46).damage,rank===2?83:60);
 assert.equal(direct.stun,rank===2?64:44,'primary stun should remain powerful');
 assert.equal(echo.stun,4,'Impact echo must only briefly stagger a secondary foe');
}
// The actual core damage path applies resistance, reflection and splash once.
let src=fs.readFileSync('v3/legacy-sim-core.js','utf8');src=src.replace('window.LegacySimCore={','window.TestCombat={hurt,step,setUnits:v=>{units=v;bastions=v.filter(u=>u.type==="knight"&&ultimate.rank(u))},getUnits:()=>units};window.LegacySimCore={');vm.runInContext(src,e);
let mole=unit('mole',4,'red',2),a=unit('sniper',1);e.TestCombat.setUnits([a,mole]);e.TestCombat.hurt(mole,100,a);assert.equal(mole.hp,35);
let x=unit('turtle',4,'blue'),y=unit('turtle',5,'red',2,.51);e.TestCombat.setUnits([x,y]);e.TestCombat.hurt(y,20,x);assert.equal(y.hp,80);assert.equal(x.hp,91,'reflection does not reflect recursively');
let sniper=unit('sniper',4),target=unit('goose',1,'red',2,.6),behind=unit('goose',1,'red',3,.68);e.TestCombat.setUnits([sniper,target,behind]);e.TestCombat.hurt(target,20,sniper);assert.equal(target.hp,80);close(behind.hp,45);assert.equal(sniper.ultimateKind,'pierce');
console.log('PASS: ten role-specific L4 abilities and stronger L5 variants; no L1–3 abilities; actual resistance/reflection/piercing paths, finite splash and burrow-safe burns');

let knight=unit('knight',4),ally=unit('goose',1,'blue',2,.55),enemy=unit('sniper',1,'red',3,.6);e.TestCombat.setUnits([knight,ally,enemy]);e.TestCombat.hurt(ally,100,enemy);assert.equal(ally.hp,20,'actual Bastion protection uses prepared roster');
