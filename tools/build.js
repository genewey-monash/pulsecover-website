// Generates static HTML pages into /public from bodies below (shared <head>, scripts).
const fs = require('fs'), path = require('path');
const out = path.join(__dirname, '..', 'public');
const head = (title, desc) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} | PulseCover</title><meta name="description" content="${desc}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@400;500;700&family=Noto+Sans+Tamil:wght@400;500;700&display=swap" rel="stylesheet">
<script>(function(){try{var th=localStorage.getItem('pc_theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');document.documentElement.dataset.theme=th}catch(e){document.documentElement.dataset.theme='light'}})()</script><link rel="icon" type="image/png" href="/img/favicon.png"><link rel="stylesheet" href="/css/style.css"></head><body>`;
const tail = (js = '') => `<script src="/js/i18n.js"></script><script src="/js/i18n2.js"></script><script src="/js/i18n3.js"></script><script src="/js/i18n4.js"></script><script src="/js/i18n5.js"></script><script src="/js/icons.js"></script><script src="/js/app.js"></script><script src="/js/ui.js"></script>${js ? `<script>${js}</script>` : ''}</body></html>`;
const pages = {};
const D = (k) => `data-i18n="${k}"`;

pages['index'] = [`Wearable-based life & health insurance`, `Insurance priced on how you live. Link your wearable, get a fair premium.`, `
<main>
<section class="hero"><div class="wrap grid"><div>
 <span class="eyebrow" ${D('home.eyebrow')}></span>
 <h1 ${D('home.h1')}></h1><p class="lead" ${D('home.sub')}></p>
 <div class="cta"><a class="btn" href="/calculator" ${D('home.cta1')}></a><a class="btn ghost" href="/how-pricing-works" ${D('home.cta2')}></a></div></div>
 <div class="phone"><div class="scr"><div class="pill">PulseCover</div><div class="ring" style="--p:82"><i>82<small ${D('calc.score')}></small></i></div>
 <div class="bars"><div class="b"><div class="t"><span ${D('comp.steps')}></span><b>9,240</b></div><div class="tr"><i style="width:100%"></i></div></div>
 <div class="b"><div class="t"><span ${D('comp.exercise')}></span><b>132 min</b></div><div class="tr"><i style="width:88%"></i></div></div>
 <div class="b"><div class="t"><span ${D('comp.sleep')}></span><b>7.4 h</b></div><div class="tr"><i style="width:100%"></i></div></div></div>
 <p style="margin:14px 0 0;font-weight:700;color:var(--navy)"><span ${D('calc.yours')}></span>: RM 531.00</p></div></div></div></section>
<div class="wrap"><div class="stats">
 <div class="stat"><b>RM600</b><span ${D('home.stat1')}></span></div><div class="stat"><b>±15%</b><span ${D('home.stat2')}></span></div>
 <div class="stat"><b>3</b><span ${D('home.stat3')}></span></div><div class="stat"><b>16+</b><span ${D('home.stat4')}></span></div></div></div>
<section class="sec"><div class="wrap center"><h2 ${D('home.problem.h')}></h2><p class="lead" ${D('home.problem.p')}></p></div></section>
<section class="sec alt"><div class="wrap"><h2 class="center" ${D('home.steps.h')}></h2><div class="cards c4" style="margin-top:28px">
 ${[1,2,3,4].map(i=>`<div class="card"><div class="ico">${i}</div><h3 ${D('home.s'+i+'.h')}></h3><p ${D('home.s'+i+'.p')}></p></div>`).join('')}</div></div></section>
<section class="sec"><div class="wrap"><h2 ${D('home.why.h')}></h2><p class="lead" ${D('home.why.p')}></p><div class="cards c3" style="margin-top:24px">
 ${[1,2,3].map(i=>`<div class="card quote"><h3 ${D('home.c'+i+'.h')}></h3><p ${D('home.c'+i+'.p')}></p></div>`).join('')}</div></div></section>
<section class="sec dark"><div class="wrap center"><h2 ${D('home.who.h')}></h2><p class="lead" style="color:#cbd6e4" ${D('home.who.p')}></p>
 <div class="cta" style="justify-content:center"><a class="btn" href="/apply" ${D('nav.apply')}></a><a class="btn ghost" style="color:#fff;border-color:#fff" href="/business" ${D('nav.sme')}></a></div></div></section>
<section class="sec"><div class="wrap center"><h2 ${D('home.waitlist.h')}></h2><p class="lead" ${D('home.waitlist.p')}></p>
 <form id="wl" style="max-width:440px;margin:18px auto 0;display:flex;gap:10px"><input type="email" required data-i18n-ph="field.email" id="wlemail"><button class="btn" ${D('home.waitlist.btn')}></button></form><div id="wlm" class="msg" style="max-width:440px;margin:12px auto"></div></div></section>
</main>`, `
document.getElementById('wl').onsubmit=async e=>{e.preventDefault();const m=document.getElementById('wlm');try{await PC.api('/waitlist',{email:document.getElementById('wlemail').value,lang:PC.lang});PC.msg(m,PC.t('home.waitlist.ok'),true);e.target.reset()}catch(x){PC.msg(m,x.message)}}`];

pages['calculator'] = [`Premium calculator`, `See how your daily habits change your yearly premium.`, `
<main><section class="sec"><div class="wrap"><h1 ${D('calc.h1')}></h1><p class="lead" ${D('calc.sub')}></p>
<div class="calc" style="margin-top:28px"><div class="card">
 <div class="rng"><label ${D('calc.steps')}></label><b id="v_steps"></b></div><input type="range" id="steps" min="0" max="20000" step="250" value="7500">
 <div class="rng"><label ${D('calc.exercise')}></label><b id="v_exercise"></b></div><input type="range" id="exerciseMin" min="0" max="400" step="5" value="100">
 <div class="rng"><label ${D('calc.sleep')}></label><b id="v_sleep"></b></div><input type="range" id="sleepHours" min="3" max="11" step="0.25" value="7.5">
 <div class="rng"><label ${D('calc.hr')}></label><b id="v_hr"></b></div><input type="range" id="restingHr" min="40" max="100" step="1" value="66">
 <label class="check"><input type="checkbox" id="appSub"><span ${D('calc.sub.opt')}></span></label>
 <p style="font-size:.85rem;color:var(--mute);margin-top:14px" ${D('calc.note')}></p></div>
<div class="result"><h3 ${D('calc.score')}></h3><div class="big" id="r_score">-</div><span id="r_badge" class="badge neu"></span>
 <div style="margin-top:14px" class="row"><span ${D('calc.base')}></span><b id="r_base"></b></div>
 <div class="row"><span ${D('calc.adj')}></span><b id="r_adj"></b></div>
 <div class="row"><span ${D('calc.yours')}></span><b id="r_total" style="font-size:1.3rem"></b></div>
 <div class="row"><span ${D('calc.permonth')}></span><b id="r_month"></b></div>
 <div class="row" style="border:0"><span id="r_savlbl"></span><b id="r_sav"></b></div>
 <h3 style="margin-top:18px;font-size:1rem" ${D('calc.breakdown')}></h3><div class="bars" id="bars"></div>
 <a class="btn" style="width:100%;margin-top:18px" id="applybtn" href="/apply" ${D('calc.cta')}></a></div></div>
<div class="card" style="margin-top:24px"><h3 ${D('calc.formula.h')}></h3><p ${D('calc.formula.p')}></p></div></div></section></main>`, `
const ids=['steps','exerciseMin','sleepHours','restingHr'];let timer,last;
function vals(){const g=i=>+document.getElementById(i).value;return{steps:g('steps'),exerciseMin:g('exerciseMin'),sleepHours:g('sleepHours'),restingHr:g('restingHr'),appSubscription:document.getElementById('appSub').checked}}
function labels(v){document.getElementById('v_steps').textContent=v.steps.toLocaleString();document.getElementById('v_exercise').textContent=v.exerciseMin+' min';document.getElementById('v_sleep').textContent=v.sleepHours+' h';document.getElementById('v_hr').textContent=v.restingHr+' bpm'}
function paint(){if(!last)return;const q=last;document.getElementById('r_score').textContent=q.score+' / 100';
 const adj=q.adjustmentPct,b=document.getElementById('r_badge');b.textContent=(adj>0?'+':'')+adj+'%';b.className='badge '+(adj<0?'good':adj>0?'up':'neu');
 document.getElementById('r_base').textContent='RM '+PC.fmt(q.base);document.getElementById('r_adj').textContent=(adj>0?'+':'')+adj+'%';
 document.getElementById('r_total').textContent='RM '+PC.fmt(q.totalAnnual)+PC.t('common.year');document.getElementById('r_month').textContent='RM '+PC.fmt(q.monthlyPremium+(q.appSubscriptionAnnual/12))+PC.t('common.month');
 document.getElementById('r_savlbl').textContent=q.savings>=0?PC.t('calc.saved'):PC.t('calc.extra');document.getElementById('r_sav').textContent='RM '+PC.fmt(Math.abs(q.savings));
 document.getElementById('bars').innerHTML=Object.entries(q.components).map(([k,v])=>'<div class="b"><div class="t"><span>'+PC.t('comp.'+k)+'</span><span>'+v+'</span></div><div class="tr"><i style="width:'+v+'%"></i></div></div>').join('');
 const v=vals();document.getElementById('applybtn').href='/apply?steps='+v.steps+'&ex='+v.exerciseMin+'&sl='+v.sleepHours+'&hr='+v.restingHr;}
async function run(){const v=vals();labels(v);try{last=await PC.api('/quote',v);paint()}catch(e){}}
ids.concat('appSub').forEach(i=>document.getElementById(i).addEventListener('input',()=>{labels(vals());clearTimeout(timer);timer=setTimeout(run,120)}));
window.addEventListener('pc:lang',paint);run();`];

const rules = (n) => [1,2,3,4,5,6].map(i=>`<div class="card"><div class="ico">${i}</div><h3 ${D('how.r'+i+'.h')}></h3><p ${D('how.r'+i+'.p')}></p></div>`).join('');
pages['how-pricing-works'] = [`How pricing works`, `Every pricing rule published in plain language.`, `
<main><section class="sec"><div class="wrap"><h1 ${D('how.h1')}></h1><p class="lead" ${D('how.sub')}></p><div class="cards c2" style="margin-top:28px">${rules()}</div>
<div class="cta"><a class="btn" href="/calculator" ${D('how.try')}></a></div></div></section></main>`, ''];

const cmpRows = [['f1',['yes','partial','no']],['f2',['pc','aia','flat']],['f3',['pc','aia','flat']],['f4',['pc','aia','flat']],['f5',['yes','no','no']],['f6',['yes','partial','partial']],['f7',['yes','partial','no']]];
const cell = (v, f, who) => v==='yes'?`<span ${D('cmp.yes')}></span>`:v==='no'?`<span ${D('cmp.no')}></span>`:v==='partial'?`<span ${D('cmp.partial')}></span>`:`<span ${D('cmp.'+who+'.'+f)}></span>`;
pages['compare'] = [`Compare`, `PulseCover versus AIA Vitality and flat-rate insurance.`, `
<main><section class="sec"><div class="wrap"><h1 ${D('cmp.h1')}></h1><p class="lead" ${D('cmp.sub')}></p><div class="scroll" style="margin-top:28px"><table class="tbl"><thead><tr><th></th><th>PulseCover</th><th>AIA Vitality</th><th ${D('cmp.flat')}></th></tr></thead><tbody>
${cmpRows.map(([f,v])=>`<tr><td ${D('cmp.'+f)}></td><td class="hl">${cell(v[0],f,'pc')}</td><td>${cell(v[1],f,'aia')}</td><td>${cell(v[2],f,'flat')}</td></tr>`).join('')}
</tbody></table></div><p style="margin-top:18px;font-size:.88rem;color:var(--mute)" ${D('cmp.note')}></p>
<div class="cta"><a class="btn" href="/calculator" ${D('home.cta1')}></a></div></div></section></main>`, ''];

pages['account'] = [`Account`, `Log in or create your PulseCover account.`, `
<main><section class="sec"><div class="wrap" style="max-width:520px"><h1 ${D('acc.h1')}></h1>
<div class="card" id="loginbox"><h3 ${D('acc.login')}></h3><form id="lf"><label ${D('field.email')}></label><input type="email" id="le" required autocomplete="email"><label ${D('field.password')}></label><input type="password" id="lp" required autocomplete="current-password"><div id="lm" class="msg"></div><button class="btn" style="margin-top:16px;width:100%" ${D('acc.login')}></button></form>
<p style="margin:16px 0 0"><span ${D('acc.new')}></span> <a href="#" id="toreg" ${D('acc.register')}></a></p></div>
<div class="card" id="regbox" style="display:none"><h3 ${D('acc.register')}></h3><form id="rf"><label ${D('field.name')}></label><input id="rn" required autocomplete="name"><label ${D('field.email')}></label><input type="email" id="re" required autocomplete="email"><label ${D('field.dob')}></label><input type="date" id="rd" required><p style="font-size:.8rem;color:var(--mute);margin:4px 0 0" ${D('acc.minage')}></p><label ${D('field.password')}></label><input type="password" id="rp" required minlength="8" autocomplete="new-password"><label ${D('field.referral')}></label><input id="rr"><div id="rm" class="msg"></div><button class="btn" style="margin-top:16px;width:100%" ${D('acc.register')}></button></form>
<p style="margin:16px 0 0"><span ${D('acc.have')}></span> <a href="#" id="tolog" ${D('acc.login')}></a></p></div></div></section></main>`, `
const q=new URLSearchParams(location.search);const next=q.get('next')&&q.get('next').startsWith('/')?q.get('next'):'/dashboard';
if(q.get('ref')){document.getElementById('rr').value=q.get('ref');show(true)}
function show(r){document.getElementById('loginbox').style.display=r?'none':'';document.getElementById('regbox').style.display=r?'':'none'}
document.getElementById('toreg').onclick=e=>{e.preventDefault();show(true)};document.getElementById('tolog').onclick=e=>{e.preventDefault();show(false)};
document.getElementById('rd').max=new Date().toISOString().slice(0,10);
PC.ready.then(()=>{if(PC.user)location.href=next});
document.getElementById('lf').onsubmit=async e=>{e.preventDefault();const m=document.getElementById('lm');try{await PC.api('/login',{email:le.value,password:lp.value});location.href=next}catch(x){PC.msg(m,x.message)}};
document.getElementById('rf').onsubmit=async e=>{e.preventDefault();const m=document.getElementById('rm');try{await PC.api('/register',{name:rn.value,email:re.value,dob:rd.value,password:rp.value,referral:rr.value,lang:PC.lang});location.href=next}catch(x){PC.msg(m,x.message)}};`];

pages['apply'] = [`Get covered`, `Apply for PulseCover in four steps.`, `
<main><section class="sec"><div class="wrap" style="max-width:820px"><h1 ${D('apply.h1')}></h1><p class="lead" ${D('apply.sub')}></p>
<div id="gate" class="card" style="display:none"><p ${D('apply.login.first')}></p><a class="btn" href="/account?next=/apply" ${D('nav.login')}></a></div>
<div id="have" class="card" style="display:none"><p ${D('apply.have')}></p><a class="btn" href="/dashboard" ${D('apply.done.go')}></a></div>
<div id="flow" style="display:none"><div class="steps" id="stepbar"><span ${D('apply.step1')}></span><span ${D('apply.step2')}></span><span ${D('apply.step3')}></span><span ${D('apply.step4')}></span></div>
<div class="card" id="s1"><h3 ${D('apply.dev')}></h3><div class="devs" id="devs"></div><p style="color:var(--mute);font-size:.9rem;margin-top:14px" ${D('apply.dev.note')}></p>
 <div class="rowf"><div><label ${D('calc.steps')}></label><input type="number" id="a_steps" value="7500" min="0" max="100000"></div><div><label ${D('calc.exercise')}></label><input type="number" id="a_ex" value="100" min="0" max="3000"></div>
 <div><label ${D('calc.sleep')}></label><input type="number" id="a_sl" value="7.5" step="0.25" min="0" max="24"></div><div><label ${D('calc.hr')}></label><input type="number" id="a_hr" value="66" min="30" max="200"></div></div>
 <label class="check"><input type="checkbox" id="a_sub"><span ${D('calc.sub.opt')}></span></label>
 <div class="msg" id="m1"></div><div class="cta"><button class="btn" id="n1" ${D('apply.next')}></button></div></div>
<div class="card" id="s2" style="display:none"><div style="text-align:center"><div class="ring" id="a_ring" style="--p:0"><i><span id="a_score">0</span><small ${D('calc.score')}></small></i></div>
 <div class="row" style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--line)"><span ${D('calc.base')}></span><b id="a_base"></b></div>
 <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--line)"><span ${D('calc.adj')}></span><b id="a_adj"></b></div>
 <div style="display:flex;justify-content:space-between;padding:8px 0"><span ${D('calc.yours')}></span><b id="a_tot" style="font-size:1.4rem;color:var(--navy)"></b></div></div>
 <p style="font-size:.85rem;color:var(--mute)" ${D('calc.note')}></p><div class="cta"><button class="btn ghost" data-back="1" ${D('apply.back')}></button><button class="btn" id="n2" ${D('apply.next')}></button></div></div>
<div class="card" id="s3" style="display:none"><label ${D('apply.cover')}></label><select id="a_cover"><option value="50000">RM 50,000</option><option value="100000" selected>RM 100,000</option><option value="250000">RM 250,000</option><option value="500000">RM 500,000</option></select>
 <label ${D('apply.ben')}></label><input id="a_ben" maxlength="100"><label ${D('apply.guardian')}></label><input id="a_guard" maxlength="100"><div class="msg" id="m3"></div><div class="cta"><button class="btn ghost" data-back="2" ${D('apply.back')}></button><button class="btn" id="n3" ${D('apply.next')}></button></div></div>
<div class="card" id="s4" style="display:none"><label class="check"><input type="checkbox" id="c1"><span ${D('apply.consent1')}></span></label><label class="check"><input type="checkbox" id="c2"><span ${D('apply.consent2')}></span></label>
 <div class="msg" id="m4"></div><div class="cta"><button class="btn ghost" data-back="3" ${D('apply.back')}></button><button class="btn" id="n4" ${D('apply.confirm')}></button></div></div>
<div class="card" id="done" style="display:none;text-align:center"><div class="ico" style="margin:0 auto 14px">&#10003;</div><h2 ${D('apply.done.h')}></h2><p><span ${D('apply.done.p')}></span> <b id="polno"></b></p><a class="btn" href="/dashboard" ${D('apply.done.go')}></a></div></div></div></section></main>`, `
const DEV=[['fitbit','Fitbit'],['garmin','Garmin'],['whoop','Whoop'],['healthconnect',null,'apply.dev.hc'],['manual',null,'apply.dev.manual']];let device='healthconnect',step=1,quote=null;
function drawDevs(){document.getElementById('devs').innerHTML=DEV.map(d=>'<div class="dev '+(d[0]===device?'sel':'')+'" data-d="'+d[0]+'">'+(d[1]||PC.t(d[2]))+'</div>').join('');document.querySelectorAll('.dev').forEach(e=>e.onclick=()=>{device=e.dataset.d;drawDevs()})}
function go(n){step=n;[1,2,3,4].forEach(i=>document.getElementById('s'+i).style.display=i===n?'':'none');document.querySelectorAll('#stepbar span').forEach((s,i)=>s.className=i+1===n?'on':i+1<n?'done':'');scrollTo({top:0,behavior:'smooth'})}
const mets=()=>({steps:+a_steps.value,exerciseMin:+a_ex.value,sleepHours:+a_sl.value,restingHr:+a_hr.value,appSubscription:a_sub.checked});
const p=new URLSearchParams(location.search);if(p.get('steps')){a_steps.value=p.get('steps');a_ex.value=p.get('ex');a_sl.value=p.get('sl');a_hr.value=p.get('hr')}
function showQuote(){const q=quote;a_score.textContent=q.score;a_ring.style.setProperty('--p',q.score);a_base.textContent='RM '+PC.fmt(q.base);a_adj.textContent=(q.adjustmentPct>0?'+':'')+q.adjustmentPct+'%';a_tot.textContent='RM '+PC.fmt(q.totalAnnual)+PC.t('common.year')}
PC.ready.then(async()=>{drawDevs();if(!PC.user){gate.style.display='';return}
 try{const d=await PC.api('/dashboard');if(d.policy){have.style.display='';return}}catch(e){}
 flow.style.display='';go(1)});
window.addEventListener('pc:lang',()=>{drawDevs();if(quote)showQuote()});
n1.onclick=async()=>{try{quote=await PC.api('/quote',mets());showQuote();go(2)}catch(e){PC.msg(m1,e.message)}};
n2.onclick=()=>go(3);document.querySelectorAll('[data-back]').forEach(b=>b.onclick=()=>go(+b.dataset.back));
n3.onclick=()=>{if(a_ben.value.trim().length<2)return PC.msg(m3,PC.t('common.required')+': '+PC.t('apply.ben'));go(4)};
n4.onclick=async()=>{if(!c1.checked||!c2.checked)return PC.msg(m4,PC.t('common.required'));n4.disabled=true;
 try{const r=await PC.api('/apply',{...mets(),device,cover:+a_cover.value,beneficiary:a_ben.value,guardian:a_guard.value,consentData:true,consentTerms:true});
  [1,2,3,4].forEach(i=>document.getElementById('s'+i).style.display='none');stepbar.style.display='none';polno.textContent=r.number;done.style.display=''}
 catch(e){PC.msg(m4,e.message);n4.disabled=false}};`];

pages['dashboard'] = [`My dashboard`, `Your policy, health score and projected premium.`, `
<main><section class="sec"><div class="wrap"><h1><span ${D('dash.h1')}></span>, <span id="who"></span></h1>
<div id="nop" class="card" style="display:none"><p ${D('dash.nopolicy')}></p><a class="btn" href="/apply" ${D('nav.apply')}></a></div>
<div id="main" style="display:none"><div class="kpi">
 <div class="card"><span ${D('dash.policy')}></span><b id="k_pol"></b></div><div class="card"><span ${D('dash.premium')}></span><b id="k_prem"></b></div>
 <div class="card"><span ${D('dash.score30')}></span><b id="k_score"></b></div><div class="card"><span ${D('dash.projected')}></span><b id="k_proj"></b></div></div>
<div class="dgrid"><div>
 <div class="card"><h3 ${D('dash.trend')}></h3><canvas id="chart" width="700" height="260"></canvas><p id="nodata" style="display:none;color:var(--mute)" ${D('dash.nodata')}></p>
  <div class="cta" style="margin-top:12px"><button class="btn sm" id="sync" ${D('dash.sync')}></button></div><div class="msg" id="sm"></div>
  <details style="margin-top:14px"><summary ${D('dash.sync.manual')}></summary><div class="rowf"><div><label ${D('dash.steps')}></label><input type="number" id="m_s" value="8000"></div><div><label ${D('dash.exercise')}></label><input type="number" id="m_e" value="30"></div><div><label ${D('dash.sleep')}></label><input type="number" step="0.25" id="m_sl" value="7.5"></div><div><label ${D('dash.hr')}></label><input type="number" id="m_h" value="65"></div></div><button class="btn sm" style="margin-top:12px" id="msave" ${D('dash.save')}></button></details></div>
 <div class="card" style="margin-top:18px"><h3 ${D('dash.myclaims')}></h3><div id="cl"></div><a class="btn sm" href="/claims" ${D('dash.newclaim')}></a></div></div>
<div><div class="card"><h3 ${D('dash.pause.h')}></h3><p ${D('dash.pause.p')}></p><div id="pausedmsg" class="pill" style="display:none"></div>
 <div class="rowf"><div><label ${D('dash.pause.days')}></label><input type="number" id="pdays" value="14" min="1" max="60"></div><div><label>&nbsp;</label><select id="preason"><option value="illness">Illness</option><option value="injury">Injury</option><option value="travel">Travel</option><option value="pregnancy">Pregnancy</option><option value="other">Other</option></select></div></div><button class="btn sm" style="margin-top:12px" id="pbtn" ${D('dash.pause.btn')}></button><div class="msg" id="pm"></div></div>
 <div class="card" style="margin-top:18px"><h3 ${D('dash.ref.h')}></h3><p ${D('dash.ref.p')}></p><p><span ${D('dash.ref.code')}></span>: <b id="rcode"></b> &middot; <span ${D('dash.ref.count')}></span>: <b id="rcount"></b> <span id="medal"></span></p><button class="btn sm" id="copy" ${D('dash.ref.copy')}></button>
  <h3 style="margin-top:18px;font-size:1rem" ${D('dash.board')}></h3><ul class="board" id="board" style="list-style:none;padding:0;margin:0"></ul><p style="font-size:.82rem;color:var(--mute);margin-top:10px" ${D('dash.milestone')}></p></div>
 <p style="margin-top:18px"><a href="#" id="lo" ${D('nav.logout')}></a></p></div></div></div></div></section></main>`, `
let D;
function chart(){const c=document.getElementById('chart'),x=c.getContext('2d'),W=c.width,H=c.height;x.clearRect(0,0,W,H);const m=(D.metrics||[]).slice(-30);
 document.getElementById('nodata').style.display=m.length?'none':'';c.style.display=m.length?'':'none';if(!m.length)return;
 x.strokeStyle='#e3e9f0';x.fillStyle='#5b6b80';x.font='12px Inter,sans-serif';for(let i=0;i<=4;i++){const y=20+(H-50)*i/4;x.beginPath();x.moveTo(40,y);x.lineTo(W-10,y);x.stroke();x.fillText(100-i*25,8,y+4)}
 const px=i=>40+(W-60)*(m.length===1?.5:i/(m.length-1)),py=s=>20+(H-50)*(1-s/100);
 x.strokeStyle='#0fb5a6';x.lineWidth=3;x.beginPath();m.forEach((p,i)=>i?x.lineTo(px(i),py(p.score)):x.moveTo(px(i),py(p.score)));x.stroke();
 x.fillStyle='#0fb5a6';m.forEach((p,i)=>{x.beginPath();x.arc(px(i),py(p.score),4,0,7);x.fill()});
 x.fillStyle='#5b6b80';x.fillText(m[0].day.slice(5),40,H-10);x.fillText(m[m.length-1].day.slice(5),W-50,H-10)}
function paint(){if(!D)return;const p=D.policy;who.textContent=D.user.name.split(' ')[0];if(!p){nop.style.display='';main.style.display='none';return}
 nop.style.display='none';main.style.display='';k_pol.textContent=p.number;k_prem.textContent='RM '+PC.fmt(p.premium)+PC.t('common.year');k_score.textContent=D.score30==null?'-':D.score30;
 k_proj.textContent='RM '+PC.fmt(D.projected.annualPremium)+' ('+(D.projected.adjustmentPct>0?'+':'')+D.projected.adjustmentPct+'%)';
 if(D.paused){pausedmsg.style.display='';pausedmsg.textContent=PC.t('dash.paused')+' '+D.paused}else pausedmsg.style.display='none';
 rcode.textContent=D.user.refcode;rcount.textContent=D.referrals;medal.textContent=D.referrals>=25?'\\u{1F947}':D.referrals>=10?'\\u{1F948}':D.referrals>=3?'\\u{1F949}':'';
 board.innerHTML=D.ranking.length?D.ranking.map((r,i)=>'<li><span>'+(i+1)+'. '+PC.esc(r.name)+'</span><b>'+r.count+'</b></li>').join(''):'<li style="color:var(--mute)">-</li>';
 cl.innerHTML=D.claims.length?D.claims.slice(0,3).map(c=>'<p><b>'+PC.esc(c.number)+'</b> &middot; RM '+PC.fmt(c.amount)+' &middot; <span class="pill">'+PC.t('cl.s.'+c.status)+'</span></p>').join(''):(form.style.display==='none'?'':'<div class="empty"><p>'+PC.t('cl.none')+'</p></div>');chart()}
async function load(){try{D=await PC.api('/dashboard');paint()}catch(e){if(e.status===401)location.href='/account?next=/dashboard'}}
PC.ready.then(load);window.addEventListener('pc:lang',paint);
sync.onclick=async()=>{try{const r=await PC.api('/sync',{});PC.msg(sm,PC.t('dash.synced')+': '+r.steps+' / '+r.exerciseMin+' / '+r.sleepHours+' / '+r.restingHr,true);load()}catch(e){PC.msg(sm,e.message)}};
msave.onclick=async()=>{try{await PC.api('/sync',{manual:true,steps:+m_s.value,exerciseMin:+m_e.value,sleepHours:+m_sl.value,restingHr:+m_h.value});PC.msg(sm,PC.t('dash.synced'),true);load()}catch(e){PC.msg(sm,e.message)}};
pbtn.onclick=async()=>{try{await PC.api('/pause',{days:+pdays.value,reason:preason.value});PC.msg(pm,PC.t('dash.synced'),true);load()}catch(e){PC.msg(pm,e.message)}};
copy.onclick=()=>{const u=location.origin+'/account?ref='+D.user.refcode;(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).catch(()=>{}).finally(()=>{copy.textContent=PC.t('dash.ref.copied');setTimeout(()=>copy.textContent=PC.t('dash.ref.copy'),1500)})};
lo.onclick=e=>{e.preventDefault();PC.logout()};`];

pages['claims'] = [`Claims`, `File and track a claim online.`, `
<main><section class="sec"><div class="wrap" style="max-width:860px"><h1 ${D('cl.h1')}></h1><p class="lead" ${D('cl.sub')}></p>
<div id="need" class="card" style="display:none"><p ${D('cl.need')}></p><a class="btn" href="/apply" ${D('nav.apply')}></a></div>
<div id="gate" class="card" style="display:none"><p ${D('apply.login.first')}></p><a class="btn" href="/account?next=/claims" ${D('nav.login')}></a></div>
<div class="card" id="form" style="display:none"><label ${D('cl.type')}></label><select id="c_type"><option value="hospitalisation" data-i18n-opt="cl.t.hospitalisation"></option><option value="outpatient" data-i18n-opt="cl.t.outpatient"></option><option value="critical_illness" data-i18n-opt="cl.t.critical_illness"></option><option value="accident" data-i18n-opt="cl.t.accident"></option><option value="death" data-i18n-opt="cl.t.death"></option></select>
<div class="rowf"><div><label ${D('cl.amount')}></label><input type="number" id="c_amt" min="1" step="0.01"></div><div><label ${D('cl.date')}></label><input type="date" id="c_date"></div></div>
<label ${D('cl.desc')}></label><textarea id="c_desc" rows="4" maxlength="2000"></textarea><div class="msg" id="cm"></div><button class="btn" style="margin-top:14px" id="csub" ${D('cl.submit')}></button></div>
<h2 style="margin-top:36px" ${D('cl.track')}></h2><div id="list"></div></div></section></main>`, `
let claims=[];
const SEQ=['received','review','approved','paid'];
function paint(){const l=document.getElementById('list');if(!PC.user)return;l.innerHTML=claims.length?claims.map(c=>'<div class="card" style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px"><b>'+PC.esc(c.number)+' &middot; '+PC.t('cl.t.'+c.type)+'</b><span class="pill">'+PC.t('cl.s.'+c.status)+'</span></div><p style="margin:6px 0">RM '+PC.fmt(c.amount)+' &middot; '+PC.esc(c.incident_date)+'</p><ul class="tl">'+c.events.map(e=>'<li>'+PC.t('cl.s.'+e.status)+' &middot; '+e.created.slice(0,16).replace('T',' ')+'</li>').join('')+'</ul></div>').join(''):'<p style="color:var(--mute)">'+PC.t('cl.none')+'</p>'}
async function load(){try{claims=await PC.api('/claims');paint()}catch(e){}}
PC.ready.then(async()=>{if(!PC.user){gate.style.display='';return}c_date.max=new Date().toISOString().slice(0,10);
 try{const d=await PC.api('/dashboard');if(!d.policy){need.style.display='';return}}catch(e){}form.style.display='';load()});
window.addEventListener('pc:lang',paint);
csub.onclick=async()=>{csub.disabled=true;try{const r=await PC.api('/claims',{type:c_type.value,amount:+c_amt.value,incidentDate:c_date.value,description:c_desc.value});PC.msg(cm,PC.t('cl.done')+' '+r.number,true);c_amt.value='';c_desc.value='';load()}catch(e){PC.msg(cm,e.message)}csub.disabled=false};`];

pages['business'] = [`For business`, `Group wearable-linked health and life benefit for SMEs.`, `
<main><section class="sec"><div class="wrap"><h1 ${D('sme.h1')}></h1><p class="lead" ${D('sme.sub')}></p>
<div class="cards c3" style="margin:28px 0">${[1,2,3].map(i=>`<div class="card"><div class="ico">${i}</div><h3 ${D('sme.b'+i+'.h')}></h3><p ${D('sme.b'+i+'.p')}></p></div>`).join('')}</div>
<div class="calc"><div class="card"><h3 ${D('sme.calc.h')}></h3><div class="rng"><label ${D('sme.employees')}></label><b id="ve"></b></div><input type="range" id="emp" min="1" max="500" value="25">
<div class="rng"><label ${D('sme.avg')}></label><b id="va"></b></div><input type="range" id="avg" min="0" max="100" value="60"></div>
<div class="result"><div class="row"><span ${D('sme.per')}></span><b id="s_per"></b></div><div class="row"><span ${D('sme.total')}></span><b id="s_tot" style="font-size:1.4rem"></b></div><div class="row"><span ${D('calc.adj')}></span><b id="s_adj"></b></div><div class="row"><span ${D('sme.bulk')}></span><b id="s_bulk"></b></div><div class="row" style="border:0"><span ${D('sme.save')}></span><b id="s_sav"></b></div></div></div>
<div class="card" style="margin-top:24px;max-width:720px"><h3 ${D('sme.enquiry.h')}></h3><form id="ef"><div class="rowf"><div><label ${D('sme.company')}></label><input id="e_co" required></div><div><label ${D('sme.contact')}></label><input id="e_ct" required></div><div><label ${D('field.email')}></label><input id="e_em" type="email" required></div><div><label ${D('field.phone')}></label><input id="e_ph"></div></div><label ${D('field.message')}></label><textarea id="e_ms" rows="3"></textarea><div class="msg" id="em"></div><button class="btn" style="margin-top:14px" ${D('sme.send')}></button></form><p style="margin-top:16px;color:var(--mute);font-size:.9rem" ${D('sme.assoc')}></p></div></div></section></main>`, `
let q,t;function paint(){if(!q)return;s_per.textContent='RM '+PC.fmt(q.perEmployeeAnnual);s_tot.textContent='RM '+PC.fmt(q.totalAnnual);s_adj.textContent=(q.adjustmentPct>0?'+':'')+q.adjustmentPct+'%';s_bulk.textContent=q.bulkDiscountPct+'%';s_sav.textContent='RM '+PC.fmt(q.savingsVsFlat)}
async function run(){ve.textContent=emp.value;va.textContent=avg.value;try{q=await PC.api('/sme/quote',{employees:+emp.value,avgScore:+avg.value});paint()}catch(e){}}
[emp,avg].forEach(e=>e.oninput=()=>{ve.textContent=emp.value;va.textContent=avg.value;clearTimeout(t);t=setTimeout(run,120)});run();window.addEventListener('pc:lang',paint);
ef.onsubmit=async e=>{e.preventDefault();try{await PC.api('/sme/enquiry',{company:e_co.value,contact:e_ct.value,email:e_em.value,phone:e_ph.value,employees:+emp.value,avgScore:+avg.value,message:e_ms.value,lang:PC.lang});PC.thanks('sme',{name:e_ct.value,email:e_em.value})}catch(x){PC.msg(em,x.message)}}`];

const fixed=[['CEO',8000],['CTO',9000],['Lead Software Engineer',9000],['Backend Developer',6000],['Frontend Developer',6000],['Customer Support Rep',3500],['Head of Marketing',6000],['Head of Compliance',7000],['Legal retainer',1500],['Office rent (KL)',4000],['Cloud services',3000],['Dev tools',800],['Security software',700],['Other SaaS',500],['Payment gateway (fixed)',300],['Regulatory costs',2000],['Branding & PR',3000]];
pages['investors'] = [`Investors`, `Market evidence, business model and Year 1 financials for PulseCover.`, `
<main><section class="sec"><div class="wrap"><h1 ${D('inv.h1')}></h1><p class="lead" ${D('inv.sub')}></p>
<h2 style="margin-top:36px" ${D('inv.market')}></h2><div class="cards c4"><div class="card"><div class="ico">$</div><b style="font-size:1.6rem;color:var(--navy)">USD 41.2m</b><p ${D('inv.m1')}></p></div><div class="card"><div class="ico">$</div><b style="font-size:1.6rem;color:var(--navy)">USD 556.0m</b><p ${D('inv.m2')}></p></div><div class="card"><div class="ico">%</div><b style="font-size:1.6rem;color:var(--navy)">32.5%</b><p ${D('inv.m3')}></p></div><div class="card"><div class="ico">#</div><b style="font-size:1.6rem;color:var(--navy)">30,000 / 3m+</b><p ${D('inv.m4')}></p></div></div>
<h2 style="margin-top:36px" ${D('inv.seg')}></h2><div class="cards c2"><div class="card"><p ${D('inv.seg1')}></p></div><div class="card"><p ${D('inv.seg2')}></p></div></div>
<h2 style="margin-top:36px" ${D('inv.model')}></h2><div class="card"><p ${D('inv.model.p')}></p></div>
<h2 style="margin-top:36px" ${D('inv.fin')}></h2><div class="kpi" id="fin"></div><div class="card"><p ${D('inv.be.p')}></p></div>
<div class="card" style="margin-top:18px"><h3 ${D('inv.cap')}></h3><canvas id="fc" width="900" height="420" style="height:auto"></canvas><p style="color:var(--mute);margin:8px 0 0" ${D('inv.team')}></p></div>
<div class="card" style="margin-top:18px"><h3 ${D('inv.be')}></h3><canvas id="bc" width="900" height="300" style="height:auto"></canvas></div>
<h2 style="margin-top:36px" ${D('inv.risks')}></h2><div class="cards c3"><div class="card"><p ${D('inv.risk1')}></p></div><div class="card"><p ${D('inv.risk2')}></p></div><div class="card"><p ${D('inv.risk3')}></p></div></div>
<h2 style="margin-top:36px" ${D('inv.sources')}></h2><div class="card"><p style="font-size:.9rem">IMARC Group (2025), Malaysia insurtech market. PIDM (2026), Protection gaps among Malaysian consumers. World Bank (2026), Cost drivers in Malaysia's medical and health insurance/takaful sector. Surendran (2026), The Edge Malaysia, AIA Vitality. AIA Malaysia (2026). Carrier Management (2025), 22% avoid filing claims. Soli&ntilde;o-Fernandez et al. (2019), BMC Public Health. Holzapfel et al. (2024), Journal of Risk and Insurance. &Sacute;liwi&nacute;ski &amp; Kury&lstrok;owicz (2021). Meyliana et al. (2019). MOSTI (2021), SUPER Roadmap 2021-2030.</p></div></div></section></main>`, `
const FIX=${JSON.stringify(fixed)};let F;
function bar(cv,items,fmt,color){const x=cv.getContext('2d'),W=cv.width,H=cv.height;x.clearRect(0,0,W,H);const max=Math.max(...items.map(i=>i[1])),lh=H/items.length;x.font='14px Inter,sans-serif';
 items.forEach((it,i)=>{const y=i*lh+4,bw=(W-280)*it[1]/max;x.fillStyle='#10243e';x.fillText(it[0],0,y+lh/2+2);x.fillStyle=it[2]||color;x.fillRect(220,y+2,Math.max(2,bw),lh-10);x.fillStyle='#5b6b80';x.fillText(fmt(it[1]),226+bw,y+lh/2+2)})}
function paint(){if(!F)return;fin.innerHTML=[['inv.rev','RM '+PC.fmt(F.revenue,0)],['inv.cost','RM '+PC.fmt(F.totalCost,0)],['inv.profit','RM '+PC.fmt(F.profit,0)],['inv.be',PC.fmt(F.breakevenPolicies,0)]].map(r=>'<div class="card"><span>'+PC.t(r[0])+'</span><b>'+r[1]+'</b></div>').join('')+'<div class="card"><span>'+PC.t('inv.fixed')+'</span><b>RM '+PC.fmt(F.fixedAnnual,0)+'</b></div><div class="card"><span>'+PC.t('inv.var')+'</span><b>RM '+PC.fmt(F.variableMonthly*12,0)+'</b></div><div class="card"><span>'+PC.t('inv.cm')+'</span><b>RM '+PC.fmt(F.contributionMargin)+'</b></div>';
 bar(fc,FIX.map(r=>[r[0],r[1]*12]),v=>PC.fmt(v,0),'#0fb5a6');
 bar(bc,[[PC.t('inv.rev'),F.revenue,'#0fb5a6'],[PC.t('inv.cost'),F.totalCost,'#13315c'],[PC.t('inv.fixed'),F.fixedAnnual,'#8aa0b8']],v=>PC.fmt(v,0),'#0fb5a6')}
PC.api('/financials').then(f=>{F=f;paint()});window.addEventListener('pc:lang',paint);`];

const prv=[1,2,3,4,5].map(i=>`<div class="card"><div class="ico">${i}</div><h3 ${D('prv.'+i+'h')}></h3><p ${D('prv.'+i+'p')}></p></div>`).join('');
pages['privacy'] = [`Privacy & data`, `How PulseCover collects, uses and protects wearable data.`, `<main><section class="sec"><div class="wrap"><h1 ${D('prv.h1')}></h1><p class="lead" ${D('prv.sub')}></p><div class="cards c2" style="margin-top:28px">${prv}</div></div></section></main>`, ''];
pages['faq'] = [`FAQ`, `Answers to common questions about PulseCover.`, `<main><section class="sec"><div class="wrap" style="max-width:820px"><h1 ${D('faq.h1')}></h1>${[1,2,3,4,5,6,7,8,9].map(i=>`<details id="faq${i}"><summary ${D('faq.q'+i)}></summary><p ${D('faq.a'+i)}></p></details>`).join('')}</div></section></main>`, ''];
pages['contact'] = [`Contact`, `Get in touch with the PulseCover team.`, `
<main><section class="sec"><div class="wrap"><h1 ${D('ct.h1')}></h1><p class="lead" ${D('ct.sub')}></p><div class="calc" style="margin-top:28px"><div class="card"><form id="cf"><label ${D('field.name')}></label><input id="c_n" required><label ${D('field.email')}></label><input type="email" id="c_e" required><label ${D('ct.topic')}></label><select id="c_t"><option value="general" data-i18n-opt="ct.t1"></option><option value="claims" data-i18n-opt="ct.t2"></option><option value="business" data-i18n-opt="ct.t3"></option><option value="partnerships" data-i18n-opt="ct.t4"></option><option value="press" data-i18n-opt="ct.t5"></option></select><label ${D('field.message')}></label><textarea id="c_m" rows="5" required></textarea><div class="msg" id="cm"></div><button class="btn" style="margin-top:14px" ${D('ct.send')}></button></form></div>
<div class="card"><h3 ${D('ct.details')}></h3><p>hello@pulsecover.example</p><p>+60 3-0000 0000</p><p ${D('ct.address')}></p><div class="soc dark"><a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" title="Facebook"><img src="/img/social/facebook.svg" alt="" width="18" height="18"></a><a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram"><img src="/img/social/instagram.svg" alt="" width="18" height="18"></a><a href="https://x.com/" target="_blank" rel="noopener noreferrer" aria-label="X" title="X"><img src="/img/social/x.svg" alt="" width="18" height="18"></a><a href="https://t.me/" target="_blank" rel="noopener noreferrer" aria-label="Telegram" title="Telegram"><img src="/img/social/telegram.svg" alt="" width="18" height="18"></a><a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn"><img src="/img/social/linkedin.svg" alt="" width="18" height="18"></a><a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" aria-label="YouTube" title="YouTube"><img src="/img/social/youtube.svg" alt="" width="18" height="18"></a></div></div></div></div></section></main>`, `
cf.onsubmit=async e=>{e.preventDefault();try{await PC.api('/contact',{name:c_n.value,email:c_e.value,topic:c_t.value,message:c_m.value,lang:PC.lang});PC.thanks('ct',{name:c_n.value,email:c_e.value})}catch(x){PC.msg(cm,x.message)}}`];
pages['404'] = [`Not found`, `Page not found`, `<main><section class="sec"><div class="wrap center"><h1 ${D('nf.h')}></h1><p class="lead" ${D('nf.p')}></p><a class="btn" href="/" ${D('nav.home')}></a></div></section></main>`, ''];

require('./pages2')(pages, D);
require('./pages3')(pages, D);
require('./pages4')(pages, D);
require('./pages5')(pages, D);
for (const [name, [title, desc, body, js]] of Object.entries(pages))
  fs.writeFileSync(path.join(out, name + '.html'), head(title, desc) + body + tail(js));
console.log('built', Object.keys(pages).length, 'pages');
