/* ════════════════════════════════════════════════════════════════
   PULSE — Logique de l'application (état, moteur de séance, écrans).
   Les données de référence (exercices, fiches, poses) sont dans data.js,
   chargé avant ce fichier.
   ════════════════════════════════════════════════════════════════ */

/* ════════ TIME ENGINE ════════ */
function setDuration(ex){
  if(!ex||!ex.r)return 35;
  const r=ex.r.toLowerCase();
  if(r.includes('min'))return(parseInt(ex.r)||15)*60;
  if(ex.timed)return parseInt(ex.r)||25;
  if(r.includes('s')&&!r.includes('saut')&&!r.includes('serie'))return parseInt(ex.r)||25;
  const reps=parseInt(ex.r)||10;
  if(r.includes('saut'))return Math.max(15,reps*0.8);
  if(ex.n&&ex.n.includes('Burpee'))return reps*5;
  if(ex.n&&ex.n.includes('Mountain'))return reps*2;
  if(ex.n&&ex.n.includes('Roue'))return reps*4;
  if(ex.n&&ex.n.includes('Inchworm'))return reps*5;
  return Math.max(20,reps*2.5);
}
function exBlockSec(ex,rest){const sd=setDuration(ex);return(ex.sets||2)*sd+Math.max(0,(ex.sets||2)-1)*Math.min(rest,90);}
function rawSessionSec(exs,rest){
  if(!exs||!exs.length)return 0;
  const macExs=exs.filter(e=>e.r?.includes('min'));
  const regExs=exs.filter(e=>!e.r?.includes('min'));
  if(regExs.length>=2&&regExs.every(e=>e.sets===regExs[0].sets)){
    const rounds=regExs[0].sets||1;
    const oneCircuit=regExs.reduce((s,e)=>s+setDuration(e),0)+(regExs.length>1?(regExs.length-1)*8:0);
    const macTime=macExs.reduce((s,e)=>s+setDuration(e),0);
    return 60+rounds*oneCircuit+(rounds-1)*Math.min(rest,90)+macTime;
  }
  return 60+(exs.length-1)*25+exs.reduce((s,e)=>s+exBlockSec(e,rest),0);
}
function getTimeFactor(){const h=S.timeHistory||[];if(h.length<2)return 1.18;const r=h.slice(-8);return Math.max(0.7,Math.min(2.2,r.reduce((s,v)=>s+v,0)/r.length));}
function recordTimeRatio(planned,actual){if(!planned||!actual)return;if(!S.timeHistory)S.timeHistory=[];S.timeHistory.push(Math.max(0.5,Math.min(3,actual/planned)));if(S.timeHistory.length>15)S.timeHistory.shift();}
function estimateMinutes(exs,rest){return Math.round(rawSessionSec(exs,rest)*getTimeFactor()/60);}
function jumpTotal(ex){const m=/^(\d+)\s*Sauts/.exec(ex?.r||'');return m?(ex.sets||1)*parseInt(m[1]):null;}

function fitToTime(srcExs,targetMin,rest,diffVal,minRounds){
  if(!srcExs||!srcExs.length)return[];
  const targetSec=targetMin*60/getTimeFactor();
  const df=0.5+diffVal*0.18;
  const scale=(ex)=>{
    const e=JSON.parse(JSON.stringify(ex));
    e.sets=1;
    if(!e.r?.includes('min')){
      if(e.r&&e.n&&e.n.includes('Sauts'))e.r=Math.round((parseInt(e.r)||50)*df)+' Sauts';
      else if(e.r&&!e.timed&&e.r.includes('-')){const pts=e.r.split('-');e.r=Math.max(4,Math.round(parseInt(pts[0])*df))+'-'+Math.max(6,Math.round(parseInt(pts[1])*df));}
    }
    e._sd=setDuration(e);
    return e;
  };
  const allScaled=srcExs.map(scale);
  const macExs=allScaled.filter(e=>e.r?.includes('min'));
  const regExs=allScaled.filter(e=>!e.r?.includes('min'));
  const oneCircuitSec=(exList)=>exList.reduce((s,e)=>s+e._sd,0)+(exList.length>1?(exList.length-1)*8:0);
  const macTimeSec=macExs.reduce((s,e)=>s+e._sd,0);
  const totalSec=(exList,rounds)=>60+rounds*oneCircuitSec(exList)+(rounds-1)*Math.min(rest,90)+macTimeSec;
  let best=null,bestDiff=Infinity;
  const maxEx=Math.min(8,regExs.length),minEx=Math.min(4,regExs.length);
  const roundsFloor=Math.max(2,Math.min(8,minRounds||2));
  const maxCircuitSec=oneCircuitSec(regExs.slice(0,maxEx))||1;
  const roundsCeil=Math.max(8,Math.min(15,Math.ceil((targetSec-60-macTimeSec)/(maxCircuitSec+Math.min(rest,90)))+1));
  for(let n=maxEx;n>=minEx;n--){
    const exList=regExs.slice(0,n);
    for(let r=roundsCeil;r>=roundsFloor;r--){
      const d=Math.abs(totalSec(exList,r)-targetSec);
      if(d<bestDiff){bestDiff=d;best={exList,rounds:r};}
    }
  }
  if(!best){const fallback=regExs.slice(0,Math.max(4,Math.min(8,regExs.length)));return fallback.map(e=>({...e,sets:Math.max(3,roundsFloor)})).concat(macExs.map(e=>({...e,sets:1})));}
  return best.exList.map(e=>({...e,sets:best.rounds})).concat(macExs.map(e=>({...e,sets:1})));
}
function interleaveExs(exs){const push=exs.filter(e=>e.z==='y'||e.z==='w'||e.z==='b'||e.z==='p'),rest=exs.filter(e=>['g','c','h','j'].includes(e.z)),out=[];const mx=Math.max(push.length,rest.length);for(let i=0;i<mx;i++){if(i<rest.length)out.push(rest[i]);if(i<push.length)out.push(push[i]);}return out;}
function sessionGroups(exs){const g=new Set(['base']);(exs||[]).forEach(ex=>{if(['y','w','b','p'].includes(ex.z))g.add('push');if(ex.z==='g'||ex.z==='h')g.add('core');if(ex.z==='j'||ex.z==='h')g.add('legs');if(ex.z==='c'||ex.z==='h')g.add('cardio');});return g;}
function buildWarmup(exs){const g=sessionGroups(exs);const steps=[];if(WU_POOL.base.length)steps.push(WU_POOL.base[0]);['push','core','legs','cardio'].forEach(k=>{if(g.has(k)&&WU_POOL[k]?.length)steps.push(WU_POOL[k][0]);});return steps.length?steps:[...WU];}
function buildCooldown(exs){const g=sessionGroups(exs);const steps=[];if(CD_POOL.base.length)steps.push(CD_POOL.base[0]);['push','core','legs','cardio'].forEach(k=>{if(g.has(k)&&CD_POOL[k]?.length)steps.push(CD_POOL[k][0]);});return steps;}
function zoneColor(z){return (ZONE[z]&&ZONE[z].c)||'#fff';}

/* ════════ STATE ════════ */
let S={
  name:'ATHLETE',level:1,xp:0,streak:0,bestStreak:0,lastWO:null,totalWO:0,totalReps:0,totalJumps:0,
  rPecs:0,rTri:0,rSh:0,rPull:0,rAbs:0,rCardio:0,rFullBody:0,rLegs:0,
  posture:'knees',uDays:{},genMode:'norm',fitTime:0,matSessions:0,chDone:0,varModes:[],amrapSessions:0,
  ucfg:{freq:3,wks:4,obj:'muscle',sessionDur:30,sets:3,rj:50,acc:['mat','board','ab_wheel','jump_rope','bands','legs'],machines:[]},
  genTime:10,amrapTime:5,amrapDiff:3,diff:3,
  gcfg:{acc:['mat','board','ab_wheel','jump_rope','bands','legs'],amrapAcc:['mat','board','ab_wheel','jump_rope','bands','legs']},
  uprog:null,badges:{},hist:[],wch:null,wstats:{wk:'',sess:0,reps:0,jumps:0,long:0,amrap:0},wxp:{},theme:'dark',amrapH:[],
  lastExport:null,timeHistory:[],hideDemo:{},exSeen:{},demoAuto:true,ratings:[],
  exCount:{},prAmrapRounds:0,prWeekReps:0,prWeekJumps:0,prLongestSession:0,
  onboarded:false,profile:{level:'debutant',masteredBase:false,limitations:{wrist:false,knee:false,back:false},weight:null,targetWeight:null}
};
const DEF=JSON.parse(JSON.stringify(S));
let AW=null,PW=null,restSec=60,diff=3,restInt=null,woStart=null,liveInt=null,wl=null;
let wuStep=0,wuInt=null,wuTL=0,wuCB=null,wuSteps=[],wuLabel='ÉCHAUFFEMENT';
let aExs=[],aCurrentEx=0,aR=0,aTL=0,aMainInt=null,aSubInt=null,aTransInt=null,aStart=null,aEndAt=0;
let achTipTimer=null,genPWExs=null,amrapSeed=0;
const TQ=[];let tShowing=false;
let onbStep=0;

window.onload=()=>{
  load();checkStreak();applyTheme();renderHUD();syncUI();syncPrefUI();initCh();checkFatigue();renderCh();
  if(S.uprog)renderProg();
  document.getElementById('inp-name').value=S.name==='ATHLETE'?'':S.name;
  document.addEventListener('gesturestart',e=>e.preventDefault());
  checkSaveReminder();updSaveDisplay();genPreviewUpdate();updateSyncGate();
  if(!S.onboarded)openOnboarding();
};

/* ════════ PERSISTENCE ════════ */
function migrateState(p){
  if(!p.ucfg)p.ucfg={freq:p.cfg?.freq||3,wks:p.cfg?.wks||4,obj:p.cfg?.obj||'muscle',sessionDur:30,sets:p.cfg?.sets||3,rj:p.cfg?.rj||50,acc:(p.cfg?.acc||['board','ab_wheel','jump_rope','bands']).concat(['mat']),machines:p.mcfg?.types||[]};
  if(p.ucfg.obj==='weight')p.ucfg.obj='cardio';
  if(!p.uDays)p.uDays={...p.cDays||{},...p.cMDays||{}};
  if(!p.gcfg)p.gcfg={acc:['mat','board','ab_wheel','jump_rope','bands']};
  if(!p.gcfg.amrapAcc)p.gcfg.amrapAcc=[...(p.gcfg.acc||['mat','board','ab_wheel','jump_rope','bands'])];
  if(!p.wstats)p.wstats={wk:'',sess:0,reps:0,jumps:0,long:0,amrap:0};
  if(!p.wxp)p.wxp={};if(!p.badges)p.badges={};if(!p.hist)p.hist=[];if(!p.amrapH)p.amrapH=[];
  if(!Array.isArray(p.varModes))p.varModes=[];
  if(!p.amrapSessions)p.amrapSessions=(p.amrapH||[]).length;
  if(!p.chDone)p.chDone=0;if(!p.timeHistory)p.timeHistory=[];if(!p.hideDemo)p.hideDemo={};if(!p.exSeen)p.exSeen={};
  if(typeof p.demoAuto!=='boolean')p.demoAuto=true;
  if(!Array.isArray(p.ratings))p.ratings=[];
  if(!p.rLegs)p.rLegs=0;if(!p.rPull)p.rPull=0;
  if(p.ucfg&&!p.ucfg.acc.includes('legs'))p.ucfg.acc.push('legs');
  if(p.gcfg){if(!p.gcfg.acc.includes('legs'))p.gcfg.acc.push('legs');if(p.gcfg.amrapAcc&&!p.gcfg.amrapAcc.includes('legs'))p.gcfg.amrapAcc.push('legs');}
  if(!p.exCount)p.exCount={};
  if(!p.bestStreak)p.bestStreak=p.streak||0;
  if(!p.prAmrapRounds)p.prAmrapRounds=0;if(!p.prWeekReps)p.prWeekReps=0;if(!p.prWeekJumps)p.prWeekJumps=0;if(!p.prLongestSession)p.prLongestSession=0;
  if(typeof p.onboarded!=='boolean')p.onboarded=!!(p.totalWO||p.uprog);// utilisateur déjà actif avant la mise à jour : pas d'onboarding forcé
  if(!p.profile)p.profile={level:'debutant',masteredBase:false,limitations:{wrist:false,knee:false,back:false},weight:null,targetWeight:null};
  if(!p.profile.limitations)p.profile.limitations={wrist:false,knee:false,back:false};
  if(typeof p.profile.masteredBase!=='boolean')p.profile.masteredBase=false;
  if(!p.posture)p.posture='knees';
  return p;
}
function normalizeState(p){return {...DEF,...migrateState(p||{})};}
function load(){
  let raw=localStorage.getItem('pulse1');
  if(!raw){const legacy=localStorage.getItem('cp2');if(legacy)raw=legacy;}
  if(!raw)return;
  try{S=normalizeState(JSON.parse(raw));}catch(e){}
}
function save(){localStorage.setItem('pulse1',JSON.stringify(S));if(window.Cloud&&window.Cloud.push)window.Cloud.push(S);renderHUD();}
async function reqWL(){if(!('wakeLock'in navigator))return;try{wl=await navigator.wakeLock.request('screen');}catch(e){}}
function relWL(){if(wl){wl.release();wl=null;}}
function togSound(){S.sound=S.sound===false;save();document.getElementById('snd-tsw').classList.toggle('on',S.sound!==false);if(S.sound!==false)beep(880,90);}
function togVib(){S.vibrate=S.vibrate===false;save();document.getElementById('vib-tsw').classList.toggle('on',S.vibrate!==false);if(S.vibrate!==false)buzz(60);}
function syncPrefUI(){const m={'demo-tsw':S.demoAuto!==false,'snd-tsw':S.sound!==false,'vib-tsw':S.vibrate!==false,'mastered-tsw':!!S.profile.masteredBase};Object.entries(m).forEach(([id,on])=>{const e=document.getElementById(id);if(e)e.classList.toggle('on',on);});
  ['wrist','knee','back'].forEach(k=>{const el=document.getElementById('limit-'+k);if(el)el.classList.toggle('on',!!S.profile.limitations[k]);});
  ['debutant','intermediaire','avance'].forEach(k=>{const el=document.getElementById('lvl-'+k);if(el)el.classList.toggle('active',S.profile.level===k);});
  const w=document.getElementById('inp-weight'),tw=document.getElementById('inp-tweight');if(w)w.value=S.profile.weight||'';if(tw)tw.value=S.profile.targetWeight||'';
  updWeightDelta();
}
function togTheme(){S.theme=S.theme==='dark'?'light':'dark';applyTheme();save();}
function applyTheme(){if(S.theme==='light'){document.body.classList.add('light');document.getElementById('tsw').classList.add('on');}else{document.body.classList.remove('light');document.getElementById('tsw').classList.remove('on');}}
function checkSaveReminder(){if(S.totalWO<1)return;const d=S.lastExport?Math.floor((Date.now()-new Date(S.lastExport))/86400000):999;if(d>=60)setTimeout(()=>document.getElementById('save-popup').classList.add('show'),2500);}
function updSaveDisplay(){const el=document.getElementById('last-save-display');if(!el)return;if(!S.lastExport){el.innerText='Jamais';return;}const d=new Date(S.lastExport);el.innerText=`${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;}
let _ac=null;
function beep(f=880,d=80,v=.12){if(S.sound===false)return;try{if(!_ac)_ac=new(window.AudioContext||window.webkitAudioContext)();if(_ac.state==='suspended')_ac.resume();const o=_ac.createOscillator(),g=_ac.createGain();o.connect(g);g.connect(_ac.destination);o.frequency.value=f;g.gain.setValueAtTime(v,_ac.currentTime);g.gain.exponentialRampToValueAtTime(.0001,_ac.currentTime+d/1000);o.start();o.stop(_ac.currentTime+d/1000);}catch(e){}}
function buzz(p){if(S.vibrate===false)return;if(navigator.vibrate)navigator.vibrate(p);}

/* ════════ GAMIFICATION ════════ */
function chkBadges(){const u=k=>{if(!S.badges[k]){S.badges[k]=Date.now();qT(k);}};if(S.totalWO>=1)u('first_blood');if(S.totalWO>=10)u('ten');if(S.totalWO>=50)u('fifty');if(S.totalWO>=100)u('hundred');if(S.totalJumps>=100)u('j100');if(S.totalJumps>=1000)u('j1k');if(S.totalJumps>=10000)u('j10k');if(S.totalReps>=5000)u('r5k');if(S.totalReps>=20000)u('r20k');if(S.level>=3)u('l3');if(S.level>=5)u('l5');if(S.level>=10){u('l10');u('bonus');}if(S.level>=20)u('l20');if(S.level>=30)u('l30');if(S.streak>=5)u('s5');if(S.streak>=7)u('s7');if(S.streak>=10)u('s10');if(S.streak>=30)u('s30');if((S.amrapSessions||0)>=1)u('amrap');if((S.amrapSessions||0)>=10)u('amrap10');if((S.matSessions||0)>=5)u('mat');if((S.matSessions||0)>=20)u('mat20');if(S.chDone>=1)u('ch');if(S.chDone>=3)u('ch3');if(S.xp>=1000)u('xp1k');if(S.xp>=10000)u('xp10k');if((S.varModes||[]).length>=3)u('variety');if((S.amrapH||[]).some(a=>a.time>=30))u('amrap30');if((S.hist||[]).some(h=>h.time>=60))u('long60');const h=new Date().getHours();if(h<8&&S.totalWO>0)u('early');if(h>=22&&S.totalWO>0)u('night');}
function qT(k){TQ.push(k);if(!tShowing)nextT();}
function nextT(){if(!TQ.length){tShowing=false;return;}tShowing=true;const k=TQ.shift(),b=BADGES[k];if(!b){nextT();return;}const c=document.getElementById('toasts'),el=document.createElement('div');el.className='toast';el.innerHTML=`<div class="ti">${b.i}</div><div><div class="te">BADGE DÉBLOQUÉ</div><div class="tn">${b.n}</div><div class="td">${b.d}</div></div>`;c.appendChild(el);requestAnimationFrame(()=>el.classList.add('show'));setTimeout(()=>{el.classList.remove('show');setTimeout(()=>{el.remove();nextT();},500);},3200);}
function showAchTooltip(k){const b=BADGES[k];if(!b)return;const u=!!S.badges[k];document.getElementById('att-icon').innerText=b.i;document.getElementById('att-name').innerText=b.n;const st=document.getElementById('att-status');st.className='att-status '+(u?'atts-done':'atts-lock');st.innerText=u?'Débloqué':'Verrouillé';document.getElementById('att-desc').innerText=u?b.d:'Pour débloquer : '+b.d;document.getElementById('ach-tooltip').classList.add('show');clearTimeout(achTipTimer);achTipTimer=setTimeout(()=>document.getElementById('ach-tooltip').classList.remove('show'),3200);}
function renderAch(){const g=document.getElementById('ach-grid');if(!g)return;g.innerHTML='';Object.entries(BADGES).forEach(([k,b])=>{const d=document.createElement('div');d.className='ach'+(S.badges[k]?' on':'');d.innerHTML=`<span class="ach-icon">${b.i}</span><div class="ach-name">${b.n}</div>`;d.onclick=()=>showAchTooltip(k);g.appendChild(d);});}

function wkKey(){const d=new Date(),y=d.getFullYear(),s=new Date(y,0,1),w=Math.ceil(((d-s)/86400000+s.getDay()+1)/7);return`${y}-W${w}`;}
function initCh(){const wk=wkKey();if(S.wstats.wk!==wk)S.wstats={wk,sess:0,reps:0,jumps:0,long:0,amrap:0};if(!S.wch||S.wch.wk!==wk){const seed=parseInt(wk.replace(/\D/g,''))%CH_TPL.length,t=CH_TPL[seed];S.wch={...t,wk,p:0,done:false,ba:false};}syncCh();}
function syncCh(){if(!S.wch)return;const c=S.wch,w=S.wstats;if(c.t==='sess')c.p=w.sess;if(c.t==='reps')c.p=w.reps;if(c.t==='jumps')c.p=w.jumps;if(c.t==='long')c.p=w.long;if(c.t==='amrap')c.p=w.amrap;}
function checkCh(){if(!S.wch||S.wch.done)return;syncCh();if(S.wch.p>=S.wch.v){S.wch.done=true;if(!S.wch.ba){S.wch.ba=true;S.xp+=100;addWkXP(100);S.chDone=(S.chDone||0)+1;setTimeout(()=>qT('ch'),1500);}}}
function renderCh(){const a=document.getElementById('ch-area');if(!S.wch){a.innerHTML='';return;}const c=S.wch,pct=Math.min(100,Math.round(c.p/c.v*100)),days=7-new Date().getDay()||7,col=c.done?'var(--cg)':'var(--cy)';a.innerHTML=`<div class="ch-card ${c.done?'done':''}"><div class="ch-top"><span class="ptag" style="color:${col}">DÉFI DE LA SEMAINE</span><span style="font-size:11px;font-weight:800;color:var(--tmut)">${c.done?'COMPLÉTÉ':'J-'+days}</span></div><div class="ch-desc">${c.d}</div><div class="ch-row"><div class="pbar" style="flex:1"><div class="pbar-fill" style="width:${pct}%;background:${col}"></div></div><span class="ch-count" style="color:${col}">${c.p}/${c.v}</span></div><div class="ch-reward">${c.done?'+100 XP OBTENU !':'Récompense : +100 XP'}</div></div>`;}
function updWS(type,data,dur){const wk=wkKey();if(S.wstats.wk!==wk)S.wstats={wk,sess:0,reps:0,jumps:0,long:0,amrap:0};S.wstats.sess++;if(data.r)S.wstats.reps+=data.r;if(data.j)S.wstats.jumps+=data.j;if(dur>=20)S.wstats.long++;if(type==='amrap')S.wstats.amrap++;if(S.wstats.reps>(S.prWeekReps||0))S.prWeekReps=S.wstats.reps;if(S.wstats.jumps>(S.prWeekJumps||0))S.prWeekJumps=S.wstats.jumps;}
// La série compte des JOURS d'entraînement consécutifs, pas des séances.
function bumpStreak(){
  const today=new Date();today.setHours(0,0,0,0);
  const last=S.lastWO?new Date(S.lastWO):null;
  if(!last){S.streak=1;S.bestStreak=Math.max(S.bestStreak||0,1);return;}
  last.setHours(0,0,0,0);
  const d=Math.round((today-last)/86400000);
  if(d<=0)return;
  // Exactement un jour de repos après une belle série : on félicite, on ne punit pas.
  if(d===2&&(S.streak||0)>=5&&!S.badges.restday){S.badges.restday=Date.now();qT('restday');}
  S.streak=(d===1)?(S.streak||0)+1:1;
  S.bestStreak=Math.max(S.bestStreak||0,S.streak);
}
function checkStreak(){if(!S.lastWO||!S.streak)return;const last=new Date(S.lastWO);last.setHours(0,0,0,0);const today=new Date();today.setHours(0,0,0,0);if(Math.round((today-last)/86400000)>1){S.streak=0;save();}}
function addWkXP(v){const wk=wkKey();if(!S.wxp)S.wxp={};S.wxp[wk]=Math.max(0,(S.wxp[wk]||0)+v);}
function checkFatigue(){if((S.streak||0)<5||!S.lastWO)return;if(Math.floor((Date.now()-new Date(S.lastWO))/86400000)<=1)document.getElementById('fatigue-b').style.display='flex';}

/* ════════ DÉBLOCAGE PAR COMPÉTENCE ════════
   Les mouvements avancés se débloquent par la pratique du mouvement de base
   (nombre de séries validées), pas par un niveau XP global. */
function isUnlocked(k){const u=EX[k]&&EX[k].unlock;if(!u)return true;if(S.profile?.masteredBase)return true;return (S.exCount[u.req]||0)>=u.min;}
const BANNED_BY_LIMIT={wrist:['pseudo','archer','diamond','ab_wheel'],knee:['mat_jumpsquat','mat_burpee'],back:['mat_superman','mat_legraise','ab_wheel']};
function applyLimits(keys){
  const lim=S.profile?.limitations||{};
  const banned=new Set();
  Object.keys(BANNED_BY_LIMIT).forEach(l=>{if(lim[l])BANNED_BY_LIMIT[l].forEach(k=>banned.add(k));});
  return banned.size?keys.filter(k=>!banned.has(k)):keys;
}
function eqFor(k){if(k.startsWith('board_')||['archer','pike','pseudo','diamond'].includes(k))return'board';if(['mat_squat','mat_jumpsquat','mat_lunge','mat_wallsit','mat_calf'].includes(k))return'legs';if(k.startsWith('mat_'))return'mat';return null;}
function renderUnlocks(){
  const box=document.getElementById('unlocks-list');if(!box)return;
  const locked=Object.keys(EX).filter(k=>EX[k].unlock&&!isUnlocked(k));
  const visible=locked.filter(k=>{const eq=eqFor(k);return !eq||S.ucfg.acc.includes(eq);});
  if(!visible.length){box.innerHTML='<div style="font-size:13px;color:var(--tmut);text-align:center;padding:8px">Tous les mouvements accessibles sont débloqués. Continue comme ça !</div>';return;}
  box.innerHTML=visible.map(k=>{
    const ex=EX[k],u=ex.unlock,have=S.exCount[u.req]||0,pct=Math.min(100,Math.round(have/u.min*100)),base=EX[u.req];
    return`<div class="unlock-card mt"><div class="unlock-t">🔒 ${ex.n}</div><div class="unlock-d">Encore ${Math.max(0,u.min-have)} série(s) de ${base?base.n:u.req}</div><div class="pbar"><div class="pbar-fill" style="width:${pct}%;background:var(--cp)"></div></div></div>`;
  }).join('');
}
function togMastered(){S.profile.masteredBase=!S.profile.masteredBase;save();document.getElementById('mastered-tsw').classList.toggle('on',S.profile.masteredBase);renderUnlocks();}
function togLimit(l){S.profile.limitations[l]=!S.profile.limitations[l];save();document.getElementById('limit-'+l).classList.toggle('on',S.profile.limitations[l]);}
function setDeclaredLevel(l){S.profile.level=l;save();['debutant','intermediaire','avance'].forEach(k=>document.getElementById('lvl-'+k).classList.toggle('active',k===l));}
function chWeight(v){S.profile.weight=v?parseFloat(v):null;save();updWeightDelta();}
function chTargetWeight(v){S.profile.targetWeight=v?parseFloat(v):null;save();updWeightDelta();}
function updWeightDelta(){
  const el=document.getElementById('weight-delta');if(!el)return;
  const w=S.profile.weight,t=S.profile.targetWeight;
  if(!w||!t){el.innerText='';return;}
  const d=Math.round((t-w)*10)/10;
  el.innerText=d===0?'🎯 Objectif atteint !':(d>0?`Objectif : +${d} kg`:`Objectif : ${d} kg`);
}

/* ════════ CONFIG (Profil / Programme) ════════ */
function setObj(m){S.ucfg.obj=m;['muscle','cardio','other'].forEach(x=>document.getElementById('ob-'+x).classList.toggle('active',x===m));save();}
function setPosture(m){S.posture=m;document.getElementById('pb-knees').classList.toggle('active',m==='knees');document.getElementById('pb-feet').classList.toggle('active',m!=='knees');save();}
function setDur(d){S.ucfg.sessionDur=d;document.querySelectorAll('#dur-row .fb').forEach(b=>b.classList.toggle('active',b.innerText.startsWith(d+' ')));save();}
function setFreq(f){S.ucfg.freq=f;document.querySelectorAll('#freq-row .fb').forEach(b=>b.classList.toggle('active',parseInt(b.innerText)===f));save();}
function adjW(a){S.ucfg.wks=Math.max(1,Math.min(12,(S.ucfg.wks||4)+a));document.getElementById('disp-fw').innerText=S.ucfg.wks;save();}
function togE(id){const cb=document.getElementById('e-'+id);cb.checked=!cb.checked;cb.closest('.acc-item').classList.toggle('on',cb.checked);const isMac=id.startsWith('mac_');if(isMac){if(cb.checked){if(!S.ucfg.machines.includes(id))S.ucfg.machines.push(id);}else S.ucfg.machines=S.ucfg.machines.filter(m=>m!==id);}else{if(cb.checked){if(!S.ucfg.acc.includes(id))S.ucfg.acc.push(id);}else S.ucfg.acc=S.ucfg.acc.filter(a=>a!==id);}document.getElementById('rj-box').style.display=S.ucfg.acc.includes('jump_rope')?'flex':'none';document.getElementById('posture-block').style.display=S.ucfg.acc.includes('board')?'block':'none';save();}
function togGA(id){const cb=document.getElementById('ga-'+id);cb.checked=!cb.checked;cb.closest('.acc-item').classList.toggle('on',cb.checked);if(cb.checked){if(!S.gcfg.acc.includes(id))S.gcfg.acc.push(id);}else S.gcfg.acc=S.gcfg.acc.filter(a=>a!==id);save();genPreviewUpdate();}
function togAmrapAcc(id){const cb=document.getElementById('aa-'+id);cb.checked=!cb.checked;cb.closest('.acc-item').classList.toggle('on',cb.checked);if(cb.checked){if(!S.gcfg.amrapAcc.includes(id))S.gcfg.amrapAcc.push(id);}else S.gcfg.amrapAcc=S.gcfg.amrapAcc.filter(a=>a!==id);save();updAmrapPreview();}
function syncUI(){const o=S.ucfg.obj||'muscle';['muscle','cardio','other'].forEach(m=>document.getElementById('ob-'+m).classList.toggle('active',m===o));document.querySelectorAll('#freq-row .fb').forEach(b=>b.classList.toggle('active',parseInt(b.innerText)===S.ucfg.freq));document.querySelectorAll('#dur-row .fb').forEach(b=>b.classList.toggle('active',b.innerText.startsWith((S.ucfg.sessionDur||30)+' ')));['mat','board','ab_wheel','jump_rope','bands','legs'].forEach(id=>{const cb=document.getElementById('e-'+id);if(cb){cb.checked=S.ucfg.acc.includes(id);cb.closest('.acc-item').classList.toggle('on',cb.checked);}const gc=document.getElementById('ga-'+id);if(gc){gc.checked=(S.gcfg.acc||[]).includes(id);gc.closest('.acc-item').classList.toggle('on',gc.checked);}const aa=document.getElementById('aa-'+id);if(aa){aa.checked=(S.gcfg.amrapAcc||[]).includes(id);aa.closest('.acc-item').classList.toggle('on',aa.checked);}});['mac_bike','mac_elliptical','mac_treadmill'].forEach(id=>{const cb=document.getElementById('e-'+id);if(cb){cb.checked=(S.ucfg.machines||[]).includes(id);cb.closest('.acc-item').classList.toggle('on',cb.checked);}const gc=document.getElementById('ga-'+id);if(gc){gc.checked=(S.gcfg.acc||[]).includes(id);gc.closest('.acc-item').classList.toggle('on',gc.checked);}});document.getElementById('inp-rj').value=S.ucfg.rj||50;document.getElementById('disp-fw').innerText=S.ucfg.wks||4;document.getElementById('rj-box').style.display=S.ucfg.acc.includes('jump_rope')?'flex':'none';document.getElementById('posture-block').style.display=S.ucfg.acc.includes('board')?'block':'none';document.getElementById('pb-knees').classList.toggle('active',S.posture==='knees');document.getElementById('pb-feet').classList.toggle('active',S.posture!=='knees');}

/* ════════ ONBOARDING ════════ */
function openOnboarding(){onbStep=0;renderOnbStep();document.getElementById('onb-ov').style.display='flex';}
function renderOnbStep(){
  document.querySelectorAll('.onb-panel').forEach((el,i)=>el.style.display=i===onbStep?'block':'none');
  document.querySelectorAll('.onb-dot').forEach((d,i)=>d.classList.toggle('on',i===onbStep));
  const back=document.getElementById('onb-back');if(back)back.style.display=onbStep===0?'none':'inline-block';
  const next=document.getElementById('onb-next');if(next)next.innerText=onbStep===3?'C\'EST PARTI !':'SUIVANT →';
}
function onbBack(){if(onbStep>0){onbStep--;renderOnbStep();}}
function onbNext(){
  if(onbStep<3){onbStep++;renderOnbStep();return;}
  finishOnboarding();
}
function onbSetLevel(l){
  S.profile.level=l;
  document.querySelectorAll('.lvl-card').forEach(c=>c.classList.toggle('active',c.dataset.lvl===l));
  S.posture=l==='debutant'?'knees':'feet';
  if(l==='avance')S.profile.masteredBase=true;
}
function onbSetObj(m){S.ucfg.obj=m;document.querySelectorAll('#onb-obj .pb').forEach(b=>b.classList.toggle('active',b.dataset.obj===m));}
function onbTogE(id){
  const on=S.ucfg.acc.includes(id);
  if(on)S.ucfg.acc=S.ucfg.acc.filter(a=>a!==id);else S.ucfg.acc.push(id);
  document.getElementById('onb-e-'+id).classList.toggle('on',!on);
}
function finishOnboarding(){
  const nameInp=document.getElementById('onb-name');
  if(nameInp&&nameInp.value.trim())S.name=nameInp.value.trim();
  S.onboarded=true;save();
  document.getElementById('onb-ov').style.display='none';
  document.getElementById('inp-name').value=S.name==='ATHLETE'?'':S.name;
  syncUI();syncPrefUI();
  genUnified();
  flashToast('👋','BIENVENUE',S.name==='ATHLETE'?'Ton profil est prêt':`Prêt(e), ${S.name} ?`,'Ton premier programme vient d\'être généré.');
}

/* ════════ GÉNÉRATION DE PROGRAMME ════════ */
function buildPool(){
  const{acc,machines}=S.ucfg;const p={push:[],core:[],hiit:[],machine:[],rope:[],pull:[],mobility:[],legs:[]};
  if(acc.includes('board')){
    p.push.push('board_pecs','board_standard','board_shoulders','board_triceps');
    ['archer','pike','pseudo','diamond'].forEach(k=>{if(isUnlocked(k))p.push.push(k);});
  }
  if(acc.includes('mat')){
    p.core.push('mat_plank','mat_crunch','mat_bicycle','mat_legraise','mat_superman','mat_glute','mat_russian');
    ['mat_hollow','mat_splank'].forEach(k=>{if(isUnlocked(k))p.core.push(k);});
    p.hiit.push('mat_mountain');
    ['mat_burpee'].forEach(k=>{if(isUnlocked(k))p.hiit.push(k);});
    if(isUnlocked('mat_inchworm'))p.hiit.push('mat_inchworm');
    p.mobility.push('mat_superman','mat_glute');
  }
  // Le bas du corps ne demande aucun matériel, mais reste soumis à la case
  // "Jambes" : sinon le générateur proposait des squats même décochée.
  if(acc.includes('legs')){
    p.legs.push('mat_squat','mat_lunge','mat_wallsit','mat_calf');p.mobility.push('mat_lunge');
    if(isUnlocked('mat_jumpsquat')){p.legs.push('mat_jumpsquat');p.hiit.push('mat_jumpsquat');}
  }
  if(acc.includes('ab_wheel')){p.core.push('ab_wheel');p.pull.push('ab_wheel');}
  if(acc.includes('jump_rope')){p.rope.push('jump_rope');p.hiit.push('jump_rope');}
  if(acc.includes('bands')){p.push.push('bands');p.pull.push('band_row','band_facepull');p.mobility.push('bands');}
  (machines||[]).forEach(m=>{if(EX[m])p.machine.push(m);});
  Object.keys(p).forEach(g=>{p[g]=applyLimits(p[g]);});
  return p;
}
function pickKeys(pool,groups,n,used){const order=[...groups].sort(()=>0.5-Math.random());const out=[];for(const g of order){const av=(pool[g]||[]).filter(k=>!used.has(k)&&EX[k]);av.sort(()=>0.5-Math.random());const take=Math.ceil(n/order.length);av.slice(0,take).forEach(k=>{if(out.length<n){out.push(k);used.add(k);}});}if(out.length<n){const all=Object.values(pool).flat().filter(k=>!used.has(k)&&EX[k]).sort(()=>0.5-Math.random());for(const k of all){if(out.length>=n)break;out.push(k);used.add(k);}}return out;}

function genUnified(){
  const{freq,wks,obj,sessionDur,sets,rj}=S.ucfg;
  if(!S.ucfg.acc.length&&!S.ucfg.machines.length){flashToast('🛠️','ÉQUIPEMENT','Aucun matériel sélectionné','Coche au moins un équipement (ou une machine) pour générer un plan.');return;}
  if(S.uprog&&Object.keys(S.uDays||{}).length&&!confirm('Un programme est en cours ('+Object.keys(S.uDays).length+' séance(s) validée(s)). Le remplacer ?'))return;
  const pool=buildPool();const hasMac=(S.ucfg.machines||[]).length>0;
  const defRest=obj==='cardio'?35:obj==='muscle'?75:60;
  const df=obj==='cardio'?1.3:obj==='muscle'?1:0.9;
  const stypes={force:{icon:'💪',label:'Force',g:['push','pull']},core:{icon:'🎯',label:'Core',g:['core','pull']},legs:{icon:'🦵',label:'Bas du corps',g:['legs','core']},hiit:{icon:'🔥',label:'HIIT',g:['hiit','legs','push','core']},cardio:{icon:'❤️',label:'Cardio',g:hasMac?['machine','rope','hiit']:['rope','hiit','legs']},full:{icon:'⚡',label:'Full Body',g:hasMac?['push','legs','core','machine']:['push','legs','core']},mobility:{icon:'🌊',label:'Mobilité',g:['mobility','core']}};
  // Séquences d'archétypes : le bas du corps revient à intervalle régulier (pas de déficit jambes).
  const arcSeq={muscle:['force','core','legs','hiit','full','core','force','legs'],cardio:['hiit','cardio','legs','hiit','core','cardio','full','legs'],other:['force','core','legs','hiit','full','mobility','cardio','legs']}[obj]||['force','core','legs','full'];
  let days={},ctr=1;
  for(let w=1;w<=wks;w++){
    const dl=w%4===0&&w>1,ov=Math.floor((w-1)/4),wInBlock=dl?0:(w-1)%4;
    for(let d=1;d<=freq;d++){
      const arch=arcSeq[(ctr-1)%arcSeq.length];const st=stypes[arch]||stypes.full;
      const used=new Set();
      const keys=pickKeys(pool,st.g,8,used);
      const rawExs=keys.filter(k=>EX[k]).map(k=>{
        const ex={...EX[k]};ex.sets=dl?2:sets;
        if(k==='jump_rope'){let j=(rj||50)+(dl?0:ov*10);if(dl)j=Math.round(j*0.7);else j=Math.round(j*df);ex.r=j+' Sauts';}
        else if(!dl&&ex.r&&ex.r.includes('-')){const pts=ex.r.split('-');const lo=Math.round(parseInt(pts[0])*df)+ov,hi=Math.round(parseInt(pts[1])*df)+ov;ex.r=`${Math.max(3,lo)}-${Math.max(lo+1,hi)}`;}
        ex.dl=dl;return ex;
      });
      const interleaved=interleaveExs(rawExs);
      const targMin=dl?Math.round(sessionDur*0.7):sessionDur;
      const fitted=fitToTime(interleaved,targMin,defRest,3,dl?2:(sets||3)+wInBlock);
      days[ctr.toString()]={n:`${st.icon} ${st.label}${dl?' (Deload)':''}`,sub:`S${w}J${d}${dl?' R':''}`,icon:st.icon,label:st.label,exs:fitted,dl,w,defRest,planDur:targMin};
      ctr++;
    }
  }
  const objLabel={muscle:'Muscle',cardio:'Cardio',other:'Forme'}[obj]||'Forme';
  S.uprog={title:`Programme ${objLabel}`,ac:obj==='muscle'?'var(--cb)':obj==='cardio'?'var(--cp)':'var(--cg)',tag:`PROGRAMME PULSE // ${wks} SEM. // ${freq}x/SEM.`,desc:`Séances ~${sessionDur}min. Exercices variés. Semaine de récupération auto toutes les 4 semaines.`,days};
  S.uDays={};save();
  switchTab('plans');
  renderProg();
}

function renderProg(){
  const c=document.getElementById('unified-prog');c.innerHTML='';
  const empty=document.getElementById('plans-empty');
  if(!S.uprog){if(empty)empty.style.display='block';return;}
  if(empty)empty.style.display='none';
  const prog=S.uprog,track=S.uDays;let done=0;const tot=Object.keys(prog.days).length;Object.keys(prog.days).forEach(d=>{if(track['u-d'+d])done++;});const pct=tot?Math.round(done/tot*100):0;const card=document.createElement('div');card.className='prog-card';card.style.setProperty('--ac',prog.ac);const nextId=Object.keys(prog.days).find(id=>!track['u-d'+id]);
  let dH='';Object.entries(prog.days).forEach(([id,day])=>{const key='u-d'+id,isDone=!!track[key],isDl=!!day.dl,isNext=id===nextId;let cls='day-btn'+(isDl?' dl':'')+(isNext?' nxt':'');let bg='';if(isDone){cls+=' done';bg=`<span class="day-badge bd">FAIT</span>`;}else if(isNext){bg=`<span class="day-badge bn">PROCHAINE</span>`;}else if(isDl){bg=`<span class="day-badge bdl">RÉCUP.</span>`;}else{bg=`<span class="day-badge bn" style="background:var(--tmut)">DISPO</span>`;}const nEx=day.exs?day.exs.length:0;dH+=`<div class="${cls}" onclick="openPW('${id}','u')">${bg}<div class="day-type">${day.icon||'⚡'}</div><div class="dtitle">${day.label||'Séance'}</div><div class="dsub">${day.sub} ~${day.planDur||'?'}min</div></div>`;});
  card.innerHTML=`<div class="ptag">${prog.tag}</div><div class="ptitle">${prog.title}</div><div class="pdesc">${prog.desc}</div><div class="pprog"><div class="pprog-top"><span class="plabel">Progression</span><span class="pcount">${done}/${tot}</span></div><div class="pbar"><div class="pbar-fill" style="width:${pct}%"></div></div></div><div class="days-grid">${dH}</div><button class="toggle-btn mt" style="width:100%;font-size:12px" onclick="switchTab('settings')">⚙️ MODIFIER MON PROFIL</button><button class="toggle-btn mt" style="width:100%;font-size:12px;color:var(--cr);border-color:var(--cr)" onclick="resetProg()">🚫 ABANDONNER CE PROGRAMME</button>`;
  c.appendChild(card);
}
function resetProg(){if(!confirm('Abandonner ce programme et en créer un nouveau ?'))return;S.uprog=null;S.uDays={};const p=document.getElementById('unified-prog');if(p)p.innerHTML='';save();renderProg();}

/* ════════ MODALE PRÉ-SÉANCE ════════ */
function openPW(dayId,tp){
  PW={dayId,tp,_src:null,aExs:[]};
  let name,exs,defRest,planDur;
  if(tp==='u'){
    const day=S.uprog.days[dayId];name=day.n;exs=day.exs;defRest=day.defRest||60;planDur=day.planDur||S.ucfg.sessionDur||30;
    document.getElementById('pw-tag').innerText=S.uprog.tag;document.getElementById('pw-tag').style.color=S.uprog.ac;
  }else{
    exs=genPWExs||buildGenExsList();name='Séance libre';defRest=45;planDur=S.genTime;
    document.getElementById('pw-tag').innerText='SÉANCE LIBRE // '+planDur+' MIN';document.getElementById('pw-tag').style.color='var(--cb)';
  }
  document.getElementById('pw-name').innerText=name;
  const estMin=estimateMinutes(exs,defRest);
  const adv=Math.max(planDur,Math.min(Math.round(planDur*1.1),estMin));
  document.getElementById('pw-adv').innerText=adv;
  document.getElementById('pw-time').value=adv;
  selRest(defRest);PW._src=exs;selDiff(S.diff||3);setRestHint(defRest);
  document.getElementById('pw-modal').classList.add('open');
}
function updPW(){
  if(!PW||!PW._src)return;
  const avail=parseInt(document.getElementById('pw-time').value)||30;
  const isDeload=PW._src.some(e=>e.dl);
  PW.aExs=fitToTime(PW._src,avail,restSec,diff,isDeload?2:(S.ucfg.sets||3));
  const list=document.getElementById('pw-exos');list.innerHTML='';
  const estSec=rawSessionSec(PW.aExs,restSec)*getTimeFactor();
  const estMin=Math.round(estSec/60);
  const diff_pct=Math.round((estMin/avail-1)*100);
  const estEl=document.getElementById('pw-est');
  if(estEl){
    const col=Math.abs(diff_pct)<=8?'var(--cg)':diff_pct>8?'var(--cr)':'var(--cb)';
    estEl.innerHTML=`<span style="color:${col}">~${estMin} min</span>${Math.abs(diff_pct)>8?`<span style="font-size:11px;color:var(--tmut);margin-left:5px">${diff_pct>0?'+':''}${diff_pct}%</span>`:''}`;
  }
  PW.aExs.forEach(ex=>{
    const dot=zoneColor(ex.z);
    const exSec=exBlockSec(ex,restSec);const exMin=exSec>=60?Math.round(exSec/60*10)/10+'min':Math.round(exSec)+'s';
    const jt=jumpTotal(ex);
    const r=document.createElement('div');r.className='exo-row';
    const dk=exKeyOf(ex);
    r.innerHTML=`<div class="exo-dot" style="background:${dot}"></div><div class="exo-name">${ex.n}</div><div class="exo-meta">${ex.sets}x${ex.r} <span style="color:var(--tmut);font-size:11px">~${exMin}</span>${jt?`<div style="font-size:11px;color:var(--tmut);margin-top:2px">Total : ${jt} sauts</div>`:''}</div>${dk?`<button class="info-b" style="margin-left:8px" aria-label="Voir le mouvement" onclick="openDemo('${dk}')">i</button>`:''}`;
    list.appendChild(r);
  });
}
function setRestHint(sec){const h=document.getElementById('pw-rest-hint');if(!h)return;const why=sec>=75?'force / hypertrophie : laisse le système nerveux récupérer':sec<=35?'circuit cardio : garde le cœur haut':'polyvalent : bon compromis force / densité';h.innerText=sec+'s recommandé — '+why+'.';}
function selRest(s){restSec=s;document.querySelectorAll('.rbt').forEach(b=>b.classList.toggle('active',parseInt(b.dataset.s)===s));if(PW&&PW._src)updPW();}
function selDiff(d){diff=d;S.diff=d;save();document.querySelectorAll('.dbt').forEach(b=>b.classList.toggle('active',parseInt(b.dataset.d)===d));updPW();}
function chTime(a){const i=document.getElementById('pw-time');i.value=Math.max(5,Math.min(180,(parseInt(i.value)||30)+a));updPW();}
function closePWModal(e){if(e.target===document.getElementById('pw-modal'))document.getElementById('pw-modal').classList.remove('open');}
function confirmStart(){const plannedTime=parseInt(document.getElementById('pw-time').value)||30;document.getElementById('pw-modal').classList.remove('open');startWU(()=>beginWO(PW.dayId,PW.tp,plannedTime),buildWarmup(PW.aExs||[]));}

/* ════════ ÉCHAUFFEMENT ════════ */
function startWU(cb,steps){wuCB=cb;wuStep=0;wuSteps=steps&&steps.length?steps:WU;wuLabel='ÉCHAUFFEMENT';const sk=document.querySelector('.wu-skip');if(sk)sk.innerText="PASSER L'ÉCHAUFFEMENT";document.getElementById('wu-ov').style.display='flex';showWU(0);}
function showWU(i){if(i>=wuSteps.length){wuSkipAll();return;}const s=wuSteps[i];document.getElementById('wu-step').innerText=`${wuLabel} ${i+1}/${wuSteps.length}`;document.getElementById('wu-name').innerText=s.n;document.getElementById('wu-tip').innerText=s.t;wuTL=s.s;document.getElementById('wu-num').innerText=wuTL;updRing(s.s,s.s);clearInterval(wuInt);const wend=Date.now()+s.s*1000;wuInt=setInterval(()=>{const t=Math.max(0,Math.ceil((wend-Date.now())/1000));const c=document.getElementById('wu-num');if(!c){clearInterval(wuInt);return;}if(t!==wuTL){wuTL=t;c.innerText=t;if(t>0&&t<=3)beep(660,50);}updRing(t,s.s);if(t<=0){clearInterval(wuInt);beep(880,120);wuStep++;setTimeout(()=>showWU(wuStep),400);}},200);document.getElementById('wu-next').innerText=i<wuSteps.length-1?'SUIVANT →':(wuLabel==='ÉCHAUFFEMENT'?'COMMENCER !':'TERMINER !');}
function updRing(cur,tot){const c=2*Math.PI*56,off=c*(1-cur/tot);document.getElementById('wu-ring').style.strokeDashoffset=off;}
function wuNext(){clearInterval(wuInt);wuStep++;showWU(wuStep);}
function wuSkipAll(){clearInterval(wuInt);document.getElementById('wu-ov').style.display='none';if(wuCB){wuCB();wuCB=null;}}
function startCD(cb,exs){const steps=buildCooldown(exs||[]);if(!steps.length){if(cb)cb();return;}wuCB=cb;wuStep=0;wuSteps=steps;wuLabel='RETOUR AU CALME';const sk=document.querySelector('.wu-skip');if(sk)sk.innerText='PASSER LE RETOUR AU CALME';document.getElementById('wu-ov').style.display='flex';showWU(0);}

/* ════════ SÉANCE (PLAYER) ════════ */
function beginWO(dayId,tp,plannedTime){AW={id:tp==='u'?'u-d'+dayId:'gen-'+Date.now(),tp,title:document.getElementById('pw-name').innerText,exs:JSON.parse(JSON.stringify(PW.aExs)),reps:0,jumps:0,muscle:{y:0,w:0,b:0,p:0,g:0,c:0,h:0,j:0},plannedTime:plannedTime||30};woStart=Date.now();reqWL();showPlayer();startLiveT();autoDemo(AW.exs);}
function startLiveT(){clearInterval(liveInt);liveInt=setInterval(()=>{const e=Math.floor((Date.now()-woStart)/1000),m=String(Math.floor(e/60)).padStart(2,'0'),s=String(e%60).padStart(2,'0'),el=document.getElementById('live-t');if(el)el.innerText=`${m}:${s}`;},1000);}
function lockNav(on){const n=document.querySelector('.nav');if(n)n.classList.toggle('locked',!!on);}
function showPlayer(){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById('sc-player').classList.add('active');lockNav(true);document.getElementById('wp-title').innerText=AW.title.toUpperCase();renderPlayer();}
function renderPlayer(){
  const c=document.getElementById('ex-container');c.innerHTML='';
  if(!AW||!AW.exs||!AW.exs.length)return;
  const rounds=Math.max(...AW.exs.map(e=>e.sets||1));
  let tot=0,done=0;
  AW.exs.forEach(ex=>{tot+=ex.sets;if(ex.cs)done+=Object.values(ex.cs).filter(Boolean).length;});
  document.getElementById('gfill').style.width=tot?`${done/tot*100}%`:'0%';
  document.getElementById('glbl').innerText=`${done} / ${tot}`;
  for(let r=0;r<rounds;r++){
    const exsInRound=AW.exs.filter(e=>r<(e.sets||1));
    const rdone=exsInRound.every(ex=>ex.cs&&ex.cs[r]);
    const rcnt=exsInRound.filter(ex=>ex.cs&&ex.cs[r]).length;
    const isMachine=exsInRound.length===1&&exsInRound[0].r?.includes('min');
    const col=rdone?'var(--cg)':'var(--cb)';
    const bl=document.createElement('div');bl.className='ex-block';bl.id='rnd-'+r;
    bl.innerHTML=`<div class="ex-hdr" style="margin-bottom:8px"><div style="flex:1"><span class="zone ${rdone?'zg':'zb'}">${isMachine?'CARDIO':('CIRCUIT '+(r+1)+' / '+rounds)}</span><div class="pbar" style="margin-top:6px"><div class="pbar-fill" style="width:${exsInRound.length?rcnt/exsInRound.length*100:0}%;background:${col}"></div></div></div></div><div class="sets" id="rsg-${r}" style="margin-top:8px"></div>`;
    c.appendChild(bl);
    const sg=document.getElementById('rsg-'+r);
    exsInRound.forEach(ex=>{
      const ei=AW.exs.indexOf(ex);
      const iD=ex.cs&&ex.cs[r];
      const isMat=ex.n&&['Planche','Mountain','Crunch','Burpee','Superman','Pont','Russian','Hollow','Inchworm','Élévation'].some(k=>ex.n.includes(k));
      const useFeet=S.posture==='feet'||!S.ucfg.acc.includes('board')||isMat;
      const exN=ex.n+(!useFeet&&ex.z!=='g'&&ex.z!=='p'?' (Genoux)':'');
      const tip=useFeet?ex.tf:ex.tk;
      const dot=zoneColor(ex.z);
      const row=document.createElement('div');row.className='srow'+(iD?' done':'');
      let tx=0,ty=0,sw=false,tapped=false;
      row.addEventListener('touchstart',e=>{if(e.target.closest('.info-b'))return;tx=e.touches[0].clientX;ty=e.touches[0].clientY;sw=false;tapped=false;},{passive:true});
      row.addEventListener('touchmove',e=>{const dx=e.touches[0].clientX-tx,dy=e.touches[0].clientY-ty;if(Math.abs(dx)>15&&Math.abs(dx)>Math.abs(dy)){sw=true;row.classList.toggle('sw',dx>0&&!iD);row.classList.toggle('swu',dx<0&&iD);}},{passive:true});
      row.addEventListener('touchend',e=>{if(e.target.closest('.info-b'))return;const dx=e.changedTouches[0].clientX-tx;row.classList.remove('sw','swu');tapped=true;if(sw&&Math.abs(dx)>50){if(dx>0&&!ex.cs?.[r])togSet(ei,r,ex.r,ex.z,bl);else if(dx<0&&ex.cs?.[r])togSet(ei,r,ex.r,ex.z,bl);}else if(!sw)togSet(ei,r,ex.r,ex.z,bl);});
      row.addEventListener('click',e=>{if(e.target.closest('.info-b'))return;if(tapped){tapped=false;return;}if(!sw)togSet(ei,r,ex.r,ex.z,bl);});
      const dk=exKeyOf(ex);
      row.innerHTML=`<span class="snum" style="display:flex;align-items:flex-start;gap:7px;flex:1;min-width:0"><span style="width:8px;height:8px;border-radius:50%;background:${dot};flex-shrink:0;margin-top:4px;display:inline-block"></span><span style="display:flex;flex-direction:column;min-width:0;overflow:hidden"><span style="font-size:13px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${exN}</span>${tip?`<span style="font-size:11px;color:var(--tmut);margin-top:1px;font-style:italic;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${tip}</span>`:''}</span></span><span class="sreps" style="white-space:nowrap;flex-shrink:0;margin:0 8px">${ex.r}</span>${dk?`<button class="info-b" style="margin-right:2px" aria-label="Voir le mouvement" onclick="event.stopPropagation();openDemo('${dk}')">i</button>`:''}<div class="schk"></div>`;
      sg.appendChild(row);
    });
  }
}
function togSet(ei,si,reps,z,bl){
  const ex=AW.exs[ei];if(!ex.cs)ex.cs={};
  const n=parseInt(reps)||0,isJ=reps&&reps.toLowerCase().includes('saut');
  let armRest=false;
  if(!ex.cs[si]){
    ex.cs[si]=true;AW.reps+=n;if(isJ)AW.jumps=(AW.jumps||0)+n;AW.muscle[z]=(AW.muscle[z]||0)+n;S.xp+=5;addWkXP(5);
    if(ex.k)S.exCount[ex.k]=(S.exCount[ex.k]||0)+1;
    buzz(40);beep(660,60);
    const roundComplete=AW.exs.filter(e=>si<(e.sets||1)).every(e=>e.cs&&e.cs[si]);
    if(restSec>0&&roundComplete)armRest=true;
  }else{
    ex.cs[si]=false;AW.reps=Math.max(0,AW.reps-n);if(isJ)AW.jumps=Math.max(0,(AW.jumps||0)-n);AW.muscle[z]=Math.max(0,(AW.muscle[z]||0)-n);S.xp=Math.max(0,S.xp-5);addWkXP(-5);
    if(ex.k)S.exCount[ex.k]=Math.max(0,(S.exCount[ex.k]||0)-1);
    stopRest();
  }
  save();renderPlayer();
  if(armRest)startRest(restSec,document.getElementById('rnd-'+si));
}
function startRest(sec,bl){stopRest();if(!bl)return;const el=document.createElement('div');el.className='rest-t';el.id='rt';el.innerHTML=`<div><div class="rl">REPOS CIRCUIT</div><div class="rcd" id="rc">${sec}</div></div><div class="rpw"><div class="rl">Circuit suivant...</div><div class="rpb"><div class="rpbf" id="rf" style="width:100%"></div></div></div><button class="rskip" onclick="stopRest()">PASSER</button>`;bl.appendChild(el);const end=Date.now()+sec*1000;let last=sec;restInt=setInterval(()=>{const t=Math.max(0,Math.ceil((end-Date.now())/1000));const rc=document.getElementById('rc'),rf=document.getElementById('rf');if(!rc){clearInterval(restInt);return;}if(t!==last){rc.innerText=t;last=t;if(t>0&&t<=3)beep(660,50);}if(rf)rf.style.width=`${t/sec*100}%`;if(t<=0){buzz([50,50,50]);beep(440,120);stopRest();}},200);}
function stopRest(){clearInterval(restInt);const el=document.getElementById('rt');if(el)el.remove();}
function reqExit(){document.getElementById('exit-ov').classList.add('open');}
function closeExit(){document.getElementById('exit-ov').classList.remove('open');}
function doExit(){document.getElementById('exit-ov').classList.remove('open');AW=null;clearInterval(liveInt);stopRest();relWL();lockNav(false);switchTab('plans');}

/* ════════ FIN DE SÉANCE ════════ */
function finishWorkout(){if(!AW)return;
  const el=Math.max(1,Math.round((Date.now()-woStart)/60000));
  const totSets=AW.exs.reduce((a,ex)=>a+(ex.sets||1),0);
  const doneSets=AW.exs.reduce((a,ex)=>a+Object.values(ex.cs||{}).filter(Boolean).length,0);
  const ratio=totSets?doneSets/totSets:0;
  if(!doneSets&&!confirm("Aucune série validée. Enregistrer quand même cette séance ?"))return;
  const xpB=Math.max(5,Math.round(40*diff*ratio));
  const finishedTp=AW.tp;const plannedTime=AW.plannedTime||el;
  recordTimeRatio(plannedTime,el);
  const didJumpRope=AW.exs.some(ex=>ex.r&&ex.r.toLowerCase().includes('saut')&&Object.values(ex.cs||{}).some(Boolean));
  const woExs=AW.exs.slice();
  const prevLongest=S.prLongestSession||0,prevWeekReps=S.prWeekReps||0,prevWeekJumps=S.prWeekJumps||0;
  S.xp+=xpB;bumpStreak();S.lastWO=new Date().toISOString();S.level=Math.floor(S.xp/100)+1;
  const wk=wkKey();if(!S.wxp)S.wxp={};S.wxp[wk]=(S.wxp[wk]||0)+xpB;
  if(ratio>=0.5)S.uDays[AW.id]=true;S.totalWO+=1;S.totalReps+=AW.reps;S.totalJumps+=(AW.jumps||0);S.fitTime+=el;
  S.rPecs+=AW.muscle.y;S.rSh+=AW.muscle.w;S.rTri+=AW.muscle.b;S.rPull=(S.rPull||0)+(AW.muscle.p||0);S.rAbs+=(AW.muscle.g||0);S.rCardio+=(AW.muscle.c||0);S.rFullBody+=(AW.muscle.h||0);S.rLegs=(S.rLegs||0)+(AW.muscle.j||0);
  const hasMat=AW.exs.some(ex=>['Planche','Mountain','Crunch','Burpee','Superman','Pont','Russian','Hollow','Inchworm','Élévation'].some(k=>ex.n&&ex.n.includes(k))&&Object.values(ex.cs||{}).some(Boolean));
  if(hasMat)S.matSessions=(S.matSessions||0)+1;
  if(!Array.isArray(S.varModes))S.varModes=[];
  if(!S.varModes.includes(finishedTp==='gen'?'gen':'fitness'))S.varModes.push(finishedTp==='gen'?'gen':'fitness');
  if(S.totalWO%3===0&&S.ucfg.acc.includes('jump_rope')&&didJumpRope)S.ucfg.rj=Math.min(200,(S.ucfg.rj||50)+10);
  if(S.totalWO%8===0&&(S.ucfg.sets||3)<5)S.ucfg.sets=(S.ucfg.sets||3)+1;
  updWS('f',{r:AW.reps,j:AW.jumps||0},el);checkCh();
  if(el>(S.prLongestSession||0))S.prLongestSession=el;
  const prLines=[];
  if(el>prevLongest&&prevLongest>0)prLines.push('⏱️ Séance la plus longue : '+el+' min');
  if(S.prWeekReps>prevWeekReps&&prevWeekReps>0)prLines.push('📈 Meilleure semaine : '+S.prWeekReps+' répétitions');
  S.hist.unshift({date:new Date().toISOString(),tp:finishedTp==='gen'?'gen':'f',title:AW.title,reps:AW.reps,time:el,xp:xpB});if(S.hist.length>30)S.hist.pop();
  const doneReps=S.hist[0].reps;
  save();chkBadges();clearInterval(liveInt);stopRest();relWL();
  const completedSets=doneSets;
  AW=null;lockNav(false);
  startCD(()=>{
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById('sc-done').classList.add('active');
    document.getElementById('done-reps').innerText=doneReps;document.getElementById('done-rlbl').innerText='REPS';
    document.getElementById('done-sets').innerText=completedSets;document.getElementById('done-time').innerText=el;
    document.getElementById('done-xp').innerText='+'+xpB+' XP';
    const pb=document.getElementById('done-prbanner');if(pb)pb.innerHTML=prLines.length?`<div class="pr-banner">🏆<div>${prLines.join('<br>')}</div></div>`:'';
    const tdiff=el-plannedTime;
    document.getElementById('done-sub').innerText=(ratio<0.5?'Séance partielle ('+Math.round(ratio*100)+'%) — non validée au programme':(S.streak>=10?'En feu !':S.streak>=5?'Belle série !':'Continue comme ça !'))+(Math.abs(tdiff)>3?(tdiff>0?' ('+tdiff+'min de plus)':' ('+Math.abs(tdiff)+'min de moins)'):'');
    document.getElementById('done-back').onclick=()=>switchTab(finishedTp==='gen'?'generator':'plans');
    document.querySelectorAll('.r-btn').forEach(b=>b.classList.remove('sel'));
    renderCh();renderProg();beep(880,250);
  },woExs);
}
function rateWO(v){
  document.querySelectorAll('.r-btn').forEach((b,i)=>b.classList.toggle('sel',i===v-1));
  if(!Array.isArray(S.ratings))S.ratings=[];
  S.ratings.push({d:new Date().toISOString(),v});if(S.ratings.length>20)S.ratings.shift();
  if(S.hist&&S.hist[0])S.hist[0].rate=v;
  save();coachFeedback();
}
function coachFeedback(){
  const r=(S.ratings||[]).slice(-3).map(x=>x.v);if(r.length<3)return;
  if(r.every(x=>x<=2))flashToast('😴','CONSEIL COACH','Baisse la charge','3 séances dures d\'affilée : prends un jour de repos ou descends d\'un cran de difficulté.');
  else if(r.every(x=>x>=4)&&(S.diff||3)<5)flashToast('💪','CONSEIL COACH','Monte d\'un cran','3 séances faciles : passe la difficulté à '+((S.diff||3)+1)+'.');
}

/* ════════ SÉANCE LIBRE (générateur) ════════ */
function buildGenExsList(){
  const acc=S.gcfg.acc||[];const{rj,sets}=S.ucfg;
  const keyMap={mat:['mat_plank','mat_mountain','mat_crunch','mat_bicycle','mat_glute','mat_superman','mat_burpee','mat_legraise','mat_russian','mat_hollow'],board:['board_pecs','board_standard','board_triceps','board_shoulders'],legs:['mat_squat','mat_lunge','mat_wallsit','mat_calf'],ab_wheel:['ab_wheel'],jump_rope:['jump_rope'],bands:['bands','band_row','band_facepull'],mac_bike:['mac_bike'],mac_elliptical:['mac_elliptical'],mac_treadmill:['mac_treadmill']};
  const allKeys=[];acc.forEach(a=>{(keyMap[a]||[]).forEach(k=>{if(EX[k]&&!allKeys.includes(k)&&isUnlocked(k))allKeys.push(k);});});
  let keys=applyLimits(allKeys);
  if(!keys.length)keys.push('board_standard','mat_crunch');
  const shuffled=[...keys].sort(()=>0.5-Math.random());const exs=shuffled.map(k=>{const ex={...EX[k]};ex.sets=k.startsWith('mac_')?1:(sets||3);if(k==='jump_rope')ex.r=(rj||50)+' Sauts';return ex;});return interleaveExs(exs);
}
function genPreviewUpdate(){
  const pool=buildGenExsList();
  genPWExs=fitToTime(pool,S.genTime,restSec||45,diff||3,S.ucfg.sets||3);
  const prev=document.getElementById('gen-preview-list'),wrap=document.getElementById('gen-preview');if(!prev||!wrap)return;
  wrap.style.display='block';
  const est=estimateMinutes(genPWExs,restSec||45);
  prev.innerHTML=`<div style="font-size:11px;font-weight:800;color:var(--cb);margin-bottom:8px">Durée estimée : ~${est} min</div>`+genPWExs.map(ex=>{const dot=zoneColor(ex.z);const jt=jumpTotal(ex);const dk=exKeyOf(ex);return`<div style="font-size:13px;font-weight:700;padding:5px 0;border-bottom:1px solid var(--bd)"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><span style="flex:1;min-width:0;display:flex;align-items:center;gap:7px"><span style="width:8px;height:8px;border-radius:50%;background:${dot};flex-shrink:0"></span>${ex.n}</span><span style="color:var(--tmut);white-space:nowrap">${ex.sets}x${ex.r}</span>${dk?`<button class="info-b" aria-label="Voir le mouvement" onclick="openDemo('${dk}')">i</button>`:''}</div>${jt?`<div style="font-size:11px;font-weight:600;color:var(--tmut);text-align:right;margin-top:2px">Total : ${jt} sauts</div>`:''}</div>`;}).join('');
}
function regenSession(){genPWExs=null;genPreviewUpdate();}
function setGT(t){S.genTime=t;[10,20,30,40,50,60].forEach(x=>{const el=document.getElementById('gt-'+x);if(el)el.classList.toggle('active',x===t);});save();genPreviewUpdate();}
function openGenModal(){if(!genPWExs)genPreviewUpdate();PW={tp:'gen',dayId:null,_src:JSON.parse(JSON.stringify(genPWExs)),aExs:[]};document.getElementById('pw-tag').innerText='SÉANCE LIBRE // '+S.genTime+' MIN';document.getElementById('pw-tag').style.color='var(--cb)';document.getElementById('pw-name').innerText='Séance libre';document.getElementById('pw-adv').innerText=S.genTime;document.getElementById('pw-time').value=S.genTime;selRest(45);setRestHint(45);selDiff(S.diff||3);document.getElementById('pw-modal').classList.add('open');}

/* ════════ AMRAP ════════ */
function setMode(m){S.genMode=m;document.getElementById('mb-norm').classList.toggle('active',m==='norm');document.getElementById('mb-amrap').classList.toggle('active',m==='amrap');document.getElementById('norm-cfg').style.display=m==='norm'?'block':'none';document.getElementById('amrap-cfg').style.display=m==='amrap'?'block':'none';if(m==='amrap'){updAmrapPreview();spawnAmrapBubbles();}save();}
function spawnAmrapBubbles(){const c=document.getElementById('amrap-bubbles');if(!c||c.childElementCount)return;const cols=[['#ffb347','#ff8a3d'],['#ff8a3d','#ff5d3d'],['#ff6a4d','#fb7185'],['#fb7185','#ff3d6d']];let h='';for(let i=0;i<10;i++){const[c1,c2]=cols[i%cols.length],s=14+Math.random()*22;h+=`<span style="--bx:${Math.random()*100}%;--bs:${s}px;--bd:${7+Math.random()*6}s;--bdl:${(-Math.random()*12).toFixed(2)}s;--bc1:${c1};--bc2:${c2}"></span>`;}c.innerHTML=h;}
function setAT(t){S.amrapTime=t;document.querySelectorAll('.at').forEach(b=>b.classList.toggle('active',b.id==='at-'+t));save();}
function setADiff(d){S.amrapDiff=d;document.querySelectorAll('#amrap-diff-row .dbt').forEach((b,i)=>b.classList.toggle('active',i===d-1));save();updAmrapPreview();}
function regenAmrap(){amrapSeed=(amrapSeed+1)%99;updAmrapPreview();}
function updAmrapPreview(){
  const acc=applyLimits(S.gcfg?.amrapAcc||[]);const dm=[0,.6,.8,1,1.3,1.6][S.amrapDiff||3];
  const pools={mat:[{k:'mat_plank',timed:true,base:30},{k:'mat_mountain',timed:false,base:20},{k:'mat_crunch',timed:false,base:20},{k:'mat_glute',timed:false,base:15},{k:'mat_hollow',timed:true,base:20},{k:'mat_russian',timed:false,base:16}],board:[{k:'board_standard',timed:false,base:10},{k:'board_pecs',timed:false,base:10},{k:'board_triceps',timed:false,base:8},{k:'board_shoulders',timed:false,base:8}],ab_wheel:[{k:'ab_wheel',timed:false,base:8}],jump_rope:[{k:'jump_rope',timed:false,base:30}],bands:[{k:'bands',timed:false,base:12},{k:'band_row',timed:false,base:12},{k:'band_facepull',timed:false,base:14}],legs:[{k:'mat_squat',timed:false,base:15},{k:'mat_lunge',timed:false,base:12},{k:'mat_wallsit',timed:true,base:30}]};
  const chosen=[];
  acc.forEach(a=>{const pool=(pools[a]||[]).filter(e=>isUnlocked(e.k));if(!pool.length)return;const idx=(amrapSeed+acc.indexOf(a))%pool.length;const ex=pool[idx];const src=EX[ex.k]||{};const val=Math.max(ex.timed?8:3,Math.round(ex.base*dm));chosen.push({k:ex.k,n:src.n||ex.k,t:(S.posture==='knees'&&src.tk)?src.tk:(src.tf||''),timed:ex.timed,dur:ex.timed?val:0,repsStr:val+(ex.timed?'s':(ex.k==='jump_rope'?' sauts':' reps'))});});
  if(!chosen.length)chosen.push({k:'board_standard',n:EX.board_standard.n,t:EX.board_standard.tf,timed:false,dur:0,repsStr:Math.max(3,Math.round(10*dm))+' reps'});
  S._amrapExs=chosen;
  const el=document.getElementById('amrap-preview');if(el)el.innerHTML=chosen.map(e=>`• ${e.n} — ${e.repsStr}`).join('<br>');
}
function amrapZones(){return (S._amrapExs||[]).map(e=>EX[e.k]||{z:'h'});}
function launchAmrap(){
  const exs=(S._amrapExs&&S._amrapExs.length)?S._amrapExs:[];
  startWU(()=>runAmrap(exs),buildWarmup(amrapZones()));
}
function runAmrap(exs){
  aExs=exs.length?exs:[{k:'board_standard',n:'Pompes Standard',t:'Corps droit',timed:false,dur:0,repsStr:'10 reps'}];
  aCurrentEx=0;aR=0;aTL=(S.amrapTime||5)*60;aStart=Date.now();
  clearInterval(aMainInt);clearInterval(aSubInt);clearInterval(aTransInt);
  document.getElementById('amrap-ov').classList.add('open');reqWL();updACD();
  showAmrapTrans('PRÊT ?',aExs[0]?.n||'',3,()=>{startAmrapMain();showAEx(0);});
}
function showAmrapTrans(title,sub,sec,cb){const ov=document.getElementById('a-trans-ov');ov.style.display='flex';document.getElementById('atl').innerText=title;document.getElementById('atn').innerText=sub||'';let t=sec;document.getElementById('atcd').innerText=t;clearInterval(aTransInt);aTransInt=setInterval(()=>{t--;document.getElementById('atcd').innerText=t;if(t<=0){clearInterval(aTransInt);ov.style.display='none';if(cb)cb();}},1000);}
function startAmrapMain(){clearInterval(aMainInt);aEndAt=Date.now()+aTL*1000;aMainInt=setInterval(()=>{const t=Math.max(0,Math.ceil((aEndAt-Date.now())/1000));if(t===aTL)return;aTL=t;updACD();if(t>0&&t<=3)beep(660,60);if(t<=0){clearInterval(aMainInt);clearInterval(aSubInt);clearInterval(aTransInt);aEnd();}},200);}
function updACD(){const m=String(Math.floor(aTL/60)).padStart(2,'0'),s=String(aTL%60).padStart(2,'0');const el=document.getElementById('a-cd');if(el)el.innerText=`${m}:${s}`;}
function showAEx(idx){aCurrentEx=idx;const ex=aExs[idx];const tot=aExs.length;const ib=document.getElementById('a-info');if(ib)ib.style.display=(ex.k&&DEMO[ex.k])?'flex':'none';
  document.getElementById('a-exnum').innerText=`EXERCICE ${idx+1} / ${tot}`;document.getElementById('a-exo').innerText=ex.n;document.getElementById('a-tip').innerText=ex.t;document.getElementById('a-reps').innerText=ex.repsStr;const btn=document.getElementById('a-main-btn');if(ex.timed){document.getElementById('a-subtimer').style.display='block';btn.innerHTML='<div style="font-size:22px">⏭️</div><div>PASSER</div>';startASubTimer(ex.dur);}else{document.getElementById('a-subtimer').style.display='none';btn.innerHTML='<div style="font-size:28px">✅</div><div>FAIT !</div>';}}
function startASubTimer(sec){clearInterval(aSubInt);let t=sec;const circ=2*Math.PI*47;document.getElementById('a-sub-cd').innerText=t;document.getElementById('a-sub-ring').style.strokeDashoffset='0';const sEnd=Date.now()+sec*1000;aSubInt=setInterval(()=>{const nt=Math.max(0,Math.ceil((sEnd-Date.now())/1000));const cd=document.getElementById('a-sub-cd'),ring=document.getElementById('a-sub-ring');if(!cd){clearInterval(aSubInt);return;}if(nt!==t){t=nt;cd.innerText=t;if(t>0&&t<=3)beep(660,60);}if(ring)ring.style.strokeDashoffset=circ*(1-t/sec);if(t<=0){clearInterval(aSubInt);buzz([50,50,50]);beep(880,150);aNextEx();}},200);}
function aNextEx(){clearInterval(aSubInt);const nextIdx=(aCurrentEx+1)%aExs.length;const isNewRound=nextIdx===0;if(isNewRound){aR++;const rc=document.getElementById('a-rc');if(rc)rc.innerText=aR;buzz([100,50,100]);beep(880,200);}showAmrapTrans(isNewRound?`ROUND ${aR} !`:'SUIVANT',aExs[nextIdx]?.n||'',isNewRound?3:1,()=>showAEx(nextIdx));}
function aEnd(){
  clearInterval(aMainInt);clearInterval(aSubInt);clearInterval(aTransInt);relWL();
  document.getElementById('amrap-ov').classList.remove('open');document.getElementById('a-trans-ov').style.display='none';
  const elapsedSec=aStart?Math.round((Date.now()-aStart)/1000):((S.amrapTime||5)*60-Math.max(0,aTL));
  if(aR===0&&elapsedSec<60){flashToast('⏱️','SESSION TROP COURTE','Non enregistrée','Termine au moins un round (ou 1 minute) pour valider un AMRAP.');switchTab('generator');return;}
  const mins=Math.max(1,Math.round(elapsedSec/60));
  const xp=Math.round(10+aR*10+(S.amrapDiff||3)*5);
  const prevAmrapPR=S.prAmrapRounds||0;
  S.xp+=xp;bumpStreak();S.level=Math.floor(S.xp/100)+1;S.lastWO=new Date().toISOString();
  S.amrapSessions=(S.amrapSessions||0)+1;addWkXP(xp);
  if(!S.amrapH)S.amrapH=[];S.amrapH.unshift({date:new Date().toISOString(),rounds:aR,time:mins,xp,diff:S.amrapDiff||3});
  S.hist.unshift({date:new Date().toISOString(),tp:'amrap',title:`AMRAP ${mins}min`,reps:aR,time:mins,xp});if(S.hist.length>30)S.hist.pop();
  if(!Array.isArray(S.varModes))S.varModes=[];if(!S.varModes.includes('amrap'))S.varModes.push('amrap');
  const prLines=[];
  if(aR>prevAmrapPR&&prevAmrapPR>0)prLines.push('🏆 Nouveau record : '+aR+' rounds !');
  S.prAmrapRounds=Math.max(S.prAmrapRounds||0,aR);
  updWS('amrap',{},mins);checkCh();save();chkBadges();renderCh();
  const rounds=aR,nEx=aExs.length,zones=aExs.map(e=>EX[e.k]||{z:'h'});
  startCD(()=>{
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById('sc-done').classList.add('active');
    document.getElementById('done-reps').innerText=rounds;document.getElementById('done-rlbl').innerText='ROUNDS';
    document.getElementById('done-sets').innerText=rounds*nEx;document.getElementById('done-time').innerText=mins;
    document.getElementById('done-xp').innerText='+'+xp+' XP';
    const pb=document.getElementById('done-prbanner');if(pb)pb.innerHTML=prLines.length?`<div class="pr-banner">🏆<div>${prLines.join('<br>')}</div></div>`:'';
    document.getElementById('done-sub').innerText=`${rounds} rounds en ${mins}min — Diff.${S.amrapDiff||3}/5`;
    document.getElementById('done-back').onclick=()=>switchTab('generator');
    document.querySelectorAll('.r-btn').forEach(b=>b.classList.remove('sel'));beep(880,300);
  },zones);
}

/* ════════ PROGRÈS ════════ */
function renderHUD(){document.getElementById('h-name').innerText=(S.name||'ATHLETE').toUpperCase();document.getElementById('h-lnum').innerText=S.level;document.getElementById('h-lname').innerText=getLN(S.level);document.getElementById('h-streak').innerText=S.streak;document.getElementById('h-xp').innerText=S.xp;const cl=(S.level-1)*100,nl=S.level*100,pct=Math.min(100,Math.round((S.xp-cl)/(nl-cl)*100));document.getElementById('h-xpbar').style.width=pct+'%';const fi=document.getElementById('h-fire');if(fi){fi.className=S.streak>=5?'fire-hot':'';fi.textContent=S.streak>=10?'🔥🔥':'🔥';}[['s-fw',S.totalWO],['s-amw',S.amrapSessions||0],['s-reps',S.totalReps],['s-jumps',S.totalJumps||0]].forEach(([id,v])=>{const el=document.getElementById(id);if(el)el.innerText=v;});const el=document.getElementById('s-total');if(el)el.innerText=(S.fitTime||0)+' MIN';const nl2=document.getElementById('s-nlvl');if(nl2)nl2.innerText=`${Math.max(0,S.level*100-S.xp)} XP pour niveau ${S.level+1}`;}
function renderRecap(){const wk=wkKey(),ws=S.wstats||{},wxp=S.wxp?.[wk]||0;[['rs-sess',ws.sess||0],['rs-reps',ws.reps||0],['rs-jumps',ws.jumps||0],['rs-xp',wxp]].forEach(([id,v])=>{const el=document.getElementById(id);if(el)el.innerText=v;});}
function renderXPChart(){const el=document.getElementById('xp-chart');if(!el)return;const now=new Date(),wk=wkKey();const weeks=[];for(let i=7;i>=0;i--){const d=new Date(now);d.setDate(d.getDate()-i*7);const y=d.getFullYear(),start=new Date(y,0,1),w=Math.ceil(((d-start)/86400000+start.getDay()+1)/7);weeks.push(`${y}-W${w}`);}const vals=weeks.map(w=>(S.wxp||{})[w]||0),max=Math.max(...vals,1),W=300,H=80,pad=6,bw=Math.floor((W-pad*2)/8)-3;let bars='';weeks.forEach((w,i)=>{const x=pad+i*(bw+3),h=Math.max(2,Math.round(vals[i]/max*(H-16))),y=H-h-4,cur=w===wk,col=cur?'#ff5a36':'#2a2033';bars+=`<rect x="${x}" y="${y}" width="${bw}" height="${h}" rx="3" fill="${col}"/>${vals[i]>0?`<text x="${x+bw/2}" y="${y-3}" text-anchor="middle" font-size="9" fill="${cur?'#ff5a36':'#6b6f7a'}" font-weight="700">${vals[i]}</text>`:''}`});el.innerHTML=`<svg viewBox="0 0 ${W} ${H}" style="overflow:visible;width:100%">${bars}</svg>`;}
function renderMuscleChart(){
  const el=document.getElementById('mu-chart');if(!el)return;
  const vals={y:S.rPecs||0,w:S.rSh||0,b:S.rTri||0,p:S.rPull||0,g:S.rAbs||0,c:S.rCardio||0,h:S.rFullBody||0,j:S.rLegs||0};
  const tot=Object.values(vals).reduce((a,b)=>a+b,0);
  if(tot===0){el.innerHTML='<div style="text-align:center;color:var(--tmut);font-size:13px;padding:12px">Lance une séance pour voir tes statistiques !</div>';return;}
  const data=Object.keys(vals).filter(k=>vals[k]>0).map(k=>({v:vals[k],c:ZONE[k].c,l:ZONE[k].l}));
  const cx=75,cy=60,r=50;let svg=`<svg viewBox="0 0 260 ${20+data.length*25}" style="overflow:visible;width:100%">`,cur=0;
  data.forEach(d=>{const a=d.v/tot,s=cur*Math.PI*2-Math.PI/2,e=(cur+a)*Math.PI*2-Math.PI/2,x1=cx+r*Math.cos(s),y1=cy+r*Math.sin(s),x2=cx+r*Math.cos(e),y2=cy+r*Math.sin(e),big=a>0.5?1:0;svg+=`<path d="M${cx},${cy} L${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${big} 1 ${x2.toFixed(1)},${y2.toFixed(1)} Z" fill="${d.c}" opacity="0.9"/>`;cur+=a;});
  svg+=`<circle cx="${cx}" cy="${cy}" r="25" fill="var(--bg)"/><text x="${cx}" y="${cy+4}" text-anchor="middle" font-size="10" font-weight="800" fill="var(--tm)">${tot}</text>`;
  data.forEach((d,li)=>{const pct=Math.round(d.v/tot*100);svg+=`<rect x="160" y="${10+li*25}" width="10" height="10" rx="2" fill="${d.c}"/><text x="176" y="${20+li*25}" font-size="13" fill="${d.c}" font-weight="800">${d.l} — ${pct}%</text>`;});
  svg+='</svg>';el.innerHTML=svg;
}
function renderPR(){
  const el=document.getElementById('pr-grid');if(!el)return;
  const rows=[
    ['🏆',S.prAmrapRounds||0,'Meilleur AMRAP (rounds)'],
    ['🔥',S.bestStreak||0,'Plus longue série (jours)'],
    ['📈',S.prWeekReps||0,'Meilleure semaine (reps)'],
    ['⏱️',S.prLongestSession||0,'Séance la plus longue (min)']
  ];
  el.innerHTML=rows.map(([i,v,l])=>`<div class="scard"><div style="font-size:20px">${i}</div><div class="sval">${v}</div><div class="hud-name" style="margin-top:2px">${l}</div></div>`).join('');
}
function renderHist(){const c=document.getElementById('hist-list');if(!c)return;const h=S.hist||[];if(!h.length){c.innerHTML='<div style="font-size:13px;color:var(--tmut);text-align:center;padding:10px">Aucune séance enregistrée</div>';return;}const tpCls={f:'hbf',amrap:'hba',gen:'hbg'};const tpLbl={f:'Programme',amrap:'AMRAP',gen:'Libre'};c.innerHTML=h.map(s=>{const d=new Date(s.date),ds=`${d.getDate()}/${d.getMonth()+1} ${d.getHours()}h${String(d.getMinutes()).padStart(2,'0')}`,tc=tpCls[s.tp]||'hbf',tl=tpLbl[s.tp]||'Programme',sc=s.tp==='amrap'?`${s.reps} rounds`:`${s.reps} reps - ${s.time}min`;return`<div class="hist"><div class="hl"><div class="ht">${s.title}</div><div class="hd">${ds}</div></div><div style="text-align:right"><div class="hbt ${tc}">${tl}</div><div class="hs">${sc} +${s.xp}XP</div></div></div>`;}).join('');}

/* ════════ NAVIGATION ════════ */
function switchTab(id){if(AW){flashToast('🏋️','SÉANCE EN COURS','Termine ou annule','Utilise ANNULER en haut à gauche pour quitter la séance.');return;}lockNav(false);if(pendingCloud&&!AW){const _d=pendingCloud;pendingCloud=null;if(window.__applyCloudData)window.__applyCloudData(_d);}document.getElementById('ach-tooltip').classList.remove('show');document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.querySelectorAll('.ni').forEach(n=>n.classList.remove('active'));window.scrollTo({top:0,behavior:'instant'});requestAnimationFrame(()=>document.getElementById('sc-'+id).classList.add('active'));const nb=document.getElementById('ni-'+id);if(nb)nb.classList.add('active');if(id==='plans'){renderProg();}if(id==='stats'){renderHUD();renderRecap();renderXPChart();renderMuscleChart();renderPR();renderAch();renderHist();}if(id==='generator'){genPreviewUpdate();if(S.genMode==='amrap'){setMode('amrap');updAmrapPreview();}}if(id==='settings'){document.getElementById('s-sets').value=S.ucfg.sets||3;document.getElementById('s-rj').value=S.ucfg.rj||50;updSaveDisplay();updateSyncGate();syncPrefUI();syncUI();renderUnlocks();}}

function chName(v){S.name=v.trim()||'ATHLETE';save();updateSyncGate();}
function exportJSON(){S.lastExport=new Date().toISOString();save();const a=document.createElement('a');a.href='data:text/json;charset=utf-8,'+encodeURIComponent(JSON.stringify(S));a.download='pulse_save.json';a.click();updSaveDisplay();}
function importJSON(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{try{S=normalizeState(JSON.parse(ev.target.result));save();location.reload();}catch(err){alert("Erreur de fichier.");}};r.readAsText(f);}
async function resetAll(){if(confirm('Réinitialiser définitivement toutes les données ?')){try{if(window.Cloud&&window.Cloud.deleteRemote)await window.Cloud.deleteRemote();}catch(e){}localStorage.removeItem('pulse1');localStorage.removeItem('cp2');location.reload();}}

/* ════════ FICHES MOUVEMENT ════════
   Chaque exercice est démontré par le même mannequin vectoriel — un seul
   style visuel, cohérent et disponible hors-ligne pour tous les exercices. */
function renderDemoStage(key){const z=EX[key]&&EX[key].z;document.getElementById('demo-stage').innerHTML=animSVG(DEMO[key].a,z,zoneColor(z));}

let demoQ=[],demoI=0,demoKey=null;
function exKeyOf(ex){if(!ex)return null;if(ex.k&&DEMO[ex.k])return ex.k;const n=(ex.n||'').toLowerCase();return Object.keys(DEMO).find(k=>(EX[k]?.n||'').toLowerCase()===n)||null;}
function openDemo(key,queue){
  const d=DEMO[key];if(!d)return;
  demoKey=key;demoQ=queue||[key];demoI=Math.max(0,demoQ.indexOf(key));
  const ex=EX[key]||{};
  document.getElementById('demo-step').innerText=demoQ.length>1?`NOUVEAU MOUVEMENT ${demoI+1} / ${demoQ.length}`:'COMMENT FAIRE';
  document.getElementById('demo-name').innerText=ex.n||key;
  const zl=ZONE[ex.z]?ZONE[ex.z].l:'';
  document.getElementById('demo-mus').innerHTML=`<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${zoneColor(ex.z)};margin-right:6px;vertical-align:middle"></span>${zl?`<b style="color:${zoneColor(ex.z)}">${zl}</b> — `:''}${d.m}`;
  document.getElementById('demo-name').dataset.k=key;
  renderDemoStage(key);
  document.getElementById('demo-board').innerHTML=boardBlock(d.bd);
  document.getElementById('demo-cues').innerHTML=d.c.map((t,i)=>`<div class="demo-li"><b>${i+1}.</b><span>${t}</span></div>`).join('');
  document.getElementById('demo-err').innerHTML=d.e.map(t=>`<div class="demo-li err"><b>×</b><span>${t}</span></div>`).join('');
  document.getElementById('demo-br').innerHTML=`<b>Respiration :</b> ${d.b}`;
  document.getElementById('demo-easy').innerHTML=`<b>↓</b><span>${d.x}</span>`;
  document.getElementById('demo-cta').innerText=demoI<demoQ.length-1?'SUIVANT →':"C'EST COMPRIS";
  document.getElementById('demo-mute').style.display='block';
  document.getElementById('demo-ov').classList.add('open');
}
function demoNext(){if(demoI<demoQ.length-1){openDemo(demoQ[demoI+1],demoQ);return;}closeDemo();}
function closeDemo(){document.getElementById('demo-ov').classList.remove('open');demoQ=[];demoKey=null;}
function demoMute(){if(demoKey){if(!S.hideDemo)S.hideDemo={};S.hideDemo[demoKey]=true;save();flashToast('🔇','FICHE MASQUÉE',(EX[demoKey]?.n)||'Exercice','Elle ne s\'ouvrira plus toute seule. Le bouton (i) reste disponible.');}demoNext();}
function autoDemo(exs){
  if(S.demoAuto===false)return;
  const q=[];
  (exs||[]).forEach(ex=>{const k=exKeyOf(ex);if(k&&!q.includes(k)&&!S.exSeen?.[k]&&!S.hideDemo?.[k])q.push(k);});
  if(!q.length)return;
  if(!S.exSeen)S.exSeen={};q.forEach(k=>S.exSeen[k]=Date.now());save();
  setTimeout(()=>openDemo(q[0],q),350);
}
function resetDemos(){S.hideDemo={};S.exSeen={};S.demoAuto=true;save();flashToast('👁️','FICHES','Réactivées','Les fiches des mouvements réapparaîtront.');const t=document.getElementById('demo-tsw');if(t)t.classList.add('on');}
function togDemoAuto(){S.demoAuto=S.demoAuto===false;save();document.getElementById('demo-tsw').classList.toggle('on',S.demoAuto!==false);}
function openBoardGuide(){
  const legend=['y','w','b','o'].map(c=>`<span class="blg on" style="color:${BCOL[c]}"><i style="background:${BCOL[c]}"></i>${BLBL[c]}</span>`).join('');
  document.getElementById('demo-step').innerText='GUIDE';
  document.getElementById('demo-name').innerText='Planche Push-Up';
  document.getElementById('demo-mus').innerText='Code couleur des repères';
  document.getElementById('demo-name').dataset.k='';
  document.getElementById('demo-stage').innerHTML=boardSVG(null);
  document.getElementById('demo-board').innerHTML=`<div class="demo-sec"><div class="board-legend">${legend}</div></div>`;
  document.getElementById('demo-cues').innerHTML=[
    'Chaque poignée se fixe sur DEUX trous adjacents : les repères vont par paires. Enfonce les deux ergots à fond et vérifie qu\'ils ne bougent plus avant de charger.',
    'JAUNE, colonne verticale côté poignées : pectoraux. 3 trous disponibles = 2 paires possibles (haute ou basse) pour varier légèrement l\'angle.',
    'BLANC, arc en haut du disque (seule paire possible) : épaules. Mains devant les épaules, bassin haut.',
    'ORANGE, arc en bas du disque (seule paire possible) : triceps. Coudes serrés le long du corps.',
    'BLEU, colonne verticale côté charnière (seule paire possible) : dos et arrière d\'épaule, en prise inversée.',
    'Sur la colonne jaune, alterne entre la paire haute et la paire basse d\'une séance à l\'autre pour varier l\'angle de travail.'
  ].map((t,i)=>`<div class="demo-li"><b>${i+1}.</b><span>${t}</span></div>`).join('');
  document.getElementById('demo-err').innerHTML=`<div class="demo-li err"><b>×</b><span>Ne bloque jamais un coude en hyperextension en haut du mouvement.</span></div><div class="demo-li err"><b>×</b><span>Poignets froids : fais toujours la mobilité des poignets avant.</span></div><div class="demo-li err"><b>×</b><span>Une poignée enfoncée sur un seul trou : elle pivote sous la charge et tu chutes.</span></div>`;
  document.getElementById('demo-br').innerHTML='<b>Règle simple :</b> chaque couleur cible un groupe différent — jaune pectoraux, blanc épaules, orange triceps, bleu dos. Choisis la couleur du muscle que tu veux travailler, pas juste l\'écart des mains.';
  document.getElementById('demo-easy').innerHTML='<b>↓</b><span>Débutant : reste sur les repères jaunes et blancs, sur les genoux, avant de passer aux positions serrées.</span>';
  document.getElementById('demo-cta').innerText="C'EST COMPRIS";
  demoQ=[];demoI=0;demoKey=null;
  document.getElementById('demo-mute').style.display='none';
  document.getElementById('demo-ov').classList.add('open');
}

/* ════════ PONT CLOUD (Firebase) ════════
   L'app démarre toujours depuis localStorage ; la synchro cloud se greffe
   par-dessus via ces fonctions window.__* et l'objet window.Cloud (module ESM). */
let pendingCloud=null;
function rerenderAll(){applyTheme();renderHUD();syncUI();syncPrefUI();initCh();checkFatigue();renderCh();renderProg();const ni=document.getElementById('inp-name');if(ni)ni.value=S.name==='ATHLETE'?'':S.name;updSaveDisplay();genPreviewUpdate();const ss=document.getElementById('s-sets');if(ss)ss.value=S.ucfg.sets||3;const rj=document.getElementById('s-rj');if(rj)rj.value=S.ucfg.rj||50;}
function mergeHist(a,b){const arr=[...(a||[]),...(b||[])];const seen=new Set(),out=[];for(const it of arr){const k=(it&&it.date!=null)?String(it.date):JSON.stringify(it);if(seen.has(k))continue;seen.add(k);out.push(it);}out.sort((x,y)=>new Date(y.date||0)-new Date(x.date||0));return out;}
function mergeData(cloud){
  if(!cloud||typeof cloud!=='object')return normalizeState(S);
  const l=normalizeState(S), c=normalizeState(cloud), m={...l,...c};
  ['level','xp','streak','bestStreak','totalWO','totalReps','totalJumps','fitTime','matSessions','chDone','amrapSessions','rPecs','rTri','rSh','rPull','rAbs','rCardio','rFullBody','rLegs','prAmrapRounds','prWeekReps','prWeekJumps','prLongestSession'].forEach(k=>{m[k]=Math.max(Number(l[k])||0,Number(c[k])||0);});
  m.badges={...(l.badges||{}),...(c.badges||{})};
  m.exCount={...(l.exCount||{})};Object.entries(c.exCount||{}).forEach(([k,v])=>{m.exCount[k]=Math.max(m.exCount[k]||0,v||0);});
  const wkeys={...(l.wxp||{}),...(c.wxp||{})};m.wxp={};Object.keys(wkeys).forEach(k=>m.wxp[k]=Math.max((l.wxp||{})[k]||0,(c.wxp||{})[k]||0));
  m.hist=mergeHist(l.hist,c.hist).slice(0,30);
  m.amrapH=mergeHist(l.amrapH,c.amrapH);
  m.timeHistory=((l.timeHistory||[]).length>=(c.timeHistory||[]).length?l.timeHistory:c.timeHistory)||[];
  m.varModes=[...new Set([...(l.varModes||[]),...(c.varModes||[])])];
  const base=(Number(l.totalWO)||0)>=(Number(c.totalWO)||0)?l:c;
  m.uprog=base.uprog;m.uDays=base.uDays;m.ucfg=base.ucfg;m.gcfg=base.gcfg;m.posture=base.posture;m.profile=base.profile;m.onboarded=l.onboarded||c.onboarded;
  m.name=(l.name&&l.name!=='ATHLETE')?l.name:(c.name||l.name);
  m.theme=l.theme||c.theme;
  m.lastWO=[l.lastWO,c.lastWO].filter(Boolean).sort().slice(-1)[0]||null;
  m.lastExport=[l.lastExport,c.lastExport].filter(Boolean).sort().slice(-1)[0]||null;
  return m;
}
window.__getLocalData=()=>S;
window.__mergeData=(cloud)=>mergeData(cloud);
window.__applyCloudData=(d)=>{if(AW){pendingCloud=d;return;}S=normalizeState(d);localStorage.setItem('pulse1',JSON.stringify(S));rerenderAll();};
window.__onAuthChange=(user,status)=>updateSyncUI(user,status);
function hasPseudo(){const n=(S.name||'').trim();return n.length>=2&&n.toUpperCase()!=='ATHLETE';}
function flashToast(icon,eyebrow,title,desc){const c=document.getElementById('toasts');if(!c)return;const el=document.createElement('div');el.className='toast';el.innerHTML=`<div class="ti">${icon}</div><div><div class="te">${eyebrow}</div><div class="tn">${title}</div><div class="td">${desc}</div></div>`;c.appendChild(el);requestAnimationFrame(()=>el.classList.add('show'));setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.remove(),500);},3200);}
function updateSyncGate(){const btn=document.getElementById('sync-btn'),gate=document.getElementById('sync-gate');const signedIn=!!(cloudUI&&cloudUI.user);const ok=signedIn||hasPseudo();if(btn){btn.disabled=!ok;btn.style.opacity=ok?'':'.45';btn.style.cursor=ok?'':'not-allowed';}if(gate)gate.style.display=(!signedIn&&!hasPseudo())?'block':'none';}
function cloudToggle(){
  if(!window.Cloud){alert('Synchro indisponible.');return;}
  if(window.Cloud.isSignedIn&&window.Cloud.isSignedIn()){window.Cloud.signOut();return;}
  if(!hasPseudo()){
    const inp=document.getElementById('inp-name');
    if(inp){inp.focus();inp.scrollIntoView({behavior:'smooth',block:'center'});}
    flashToast('⚠️','PSEUDO REQUIS','Choisis un pseudo',"Renseigne ton pseudo (Profil) pour t'identifier dans le cloud.");
    updateSyncGate();
    return;
  }
  window.Cloud.signIn();
}
let cloudUI={user:null,status:'offline'},cloudMeta={by:null,at:null};
const CLOUD_COL={offline:'var(--tmut)',synced:'var(--cg)',saving:'var(--cy)',error:'var(--cr)'};
const CLOUD_TXT={offline:'Hors ligne',synced:'Synchronisé',saving:'Enregistrement...',error:'Erreur de synchro'};
function fmtCloudDate(t){const d=new Date(t),p=n=>String(n).padStart(2,'0');return `${p(d.getDate())}/${p(d.getMonth()+1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;}
function updateSyncUI(user,status){
  cloudUI={user,status:user?(status||'synced'):(status==='error'?'error':'offline')};
  const col=CLOUD_COL[cloudUI.status]||'var(--tmut)';
  const chip=document.getElementById('cloud-chip');if(chip){chip.style.color=col;chip.classList.toggle('on',!!user);}
  const st=document.getElementById('sync-status'),btn=document.getElementById('sync-btn'),us=document.getElementById('sync-user'),usPhoto=document.getElementById('sync-user-photo'),usEmail=document.getElementById('sync-user-email');
  if(btn)btn.innerText=user?'SE DÉCONNECTER':'SE CONNECTER AVEC GOOGLE';
  if(us){
    if(user){
      us.style.display='flex';usEmail.innerText=user.email||user.displayName||'';
      if(user.photoURL){usPhoto.src=user.photoURL;usPhoto.style.display='block';}else{usPhoto.style.display='none';}
    }else{us.style.display='none';usEmail.innerText='';usPhoto.style.display='none';usPhoto.src='';}
  }
  if(st){st.innerText=user?(CLOUD_TXT[cloudUI.status]||'Synchronisé'):(status==='error'?'Erreur':'Hors ligne');st.style.color=col;}
  renderCloudModal();
  updateSyncGate();
}
function renderCloudModal(){
  const s=cloudUI.status,dot=document.getElementById('cm-dot');if(!dot)return;
  dot.style.background=CLOUD_COL[s]||'var(--tmut)';
  document.getElementById('cm-status').innerText=cloudUI.user?(CLOUD_TXT[s]||'Synchronisé'):(s==='error'?'Erreur':'Hors ligne');
  const conn=document.getElementById('cm-conn-wrap'),mod=document.getElementById('cm-mod-wrap'),hint=document.getElementById('cm-hint');
  if(cloudUI.user){
    conn.style.display='flex';document.getElementById('cm-email').innerText=cloudUI.user.email||cloudUI.user.displayName||'';
    const cmPhoto=document.getElementById('cm-photo');
    if(cloudUI.user.photoURL){cmPhoto.src=cloudUI.user.photoURL;cmPhoto.style.display='block';}else{cmPhoto.style.display='none';cmPhoto.src='';}
    hint.style.display='none';
    if(cloudMeta.at){mod.style.display='block';document.getElementById('cm-by').innerText=cloudMeta.by||S.name||'—';document.getElementById('cm-at').innerText='· '+fmtCloudDate(cloudMeta.at);}
    else mod.style.display='none';
  }else{conn.style.display='none';mod.style.display='none';hint.style.display='block';}
}
function openCloudModal(){renderCloudModal();document.getElementById('cloud-ov').classList.add('open');}
function closeCloudModal(){document.getElementById('cloud-ov').classList.remove('open');}
window.__onSyncMeta=(by,at)=>{cloudMeta={by,at};renderCloudModal();};
