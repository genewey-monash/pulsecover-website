// v3 overrides: wearable-first / risk-rating positioning. Runs after pages2.js.
module.exports = (pages, D) => {
  const arrow = '<div class="farrow"><svg viewBox="0 0 46 24" width="46" height="24"><path d="M2 12h38M31 4l9 8-9 8" fill="none" stroke="#B71234" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></div>';
  const node = (ic, n, mid) => `<div class="fnode${mid ? ' mid' : ''}">${mid ? '<video class="logoanim" src="/img/logo-animated.mp4" autoplay muted loop playsinline preload="metadata" aria-label="PulseCover logo animation"></video>' : `<div class="ico" data-ic="${ic}"></div>`}<h3 ${D('flow.' + n + '.h')}></h3><p ${D('flow.' + n + '.p')}></p></div>`;
  const flow = `<div class="flow">${node('watch', 1)}${arrow}${node('badge', 2, true)}${arrow}${node('shield', 3)}</div><p class="center" style="color:var(--mute);max-width:640px;margin:14px auto 0" ${D('flow.note')}></p>`;
  const pills = '<div class="pills"><span class="pv"><i></i>Google Health Connect</span><span class="pv"><i></i>Fitbit</span><span class="pv"><i></i>Garmin</span><span class="pv"><i></i>Whoop</span></div>';
  const BANDS = [['Ap', 'A+', '90–100', '−12% to −15%'], ['A', 'A', '75–89', '−7.5% to −11.7%'], ['B', 'B', '60–74', '−3% to −7.2%'], ['C', 'C', '40–59', '−2.7% to +3%'], ['D', 'D', '25–39', '+3.3% to +7.5%'], ['E', 'E', '0–24', '+7.8% to +15%']];
  const bands = `<div class="scroll"><table class="tbl"><thead><tr><th ${D('rate.grade')}></th><th ${D('rate.score')}></th><th ${D('rate.meaning')}></th><th ${D('rate.effect')}></th></tr></thead><tbody>${BANDS.map(([c, g, s, e]) => `<tr><td><span class="gr ${c}">${g}</span></td><td>${s}</td><td ${D('grade.' + g)}></td><td>${e}</td></tr>`).join('')}</tbody></table></div>`;
  const vsRows = [1, 2, 3, 4, 5, 6].map((i) => `<tr><td ${D('vs.r' + i)}></td><td class="tr" ${D('vs.r' + i + '.t')}></td><td class="pc" ${D('vs.r' + i + '.p')}></td></tr>`).join('');
  const vs = `<div class="scroll"><table class="vs"><thead><tr><th></th><th ${D('vs.col.trad')}></th><th class="pc" ${D('vs.col.pc')}></th></tr></thead><tbody>${vsRows}</tbody></table></div>`;

const ages = `<section class="sec alt"><div class="wrap"><div class="center"><h2 ${D('home.who.h')}></h2><p class="lead" ${D('home.who.p')}></p></div><div class="cards c2" style="margin-top:28px"><figure class="fig"><img class="photo" src="/img/senior-walk.jpg" alt="A man in his sixties walking on a jogging track at sunrise wearing a fitness band" width="1200" height="896" loading="lazy"><figcaption ${D('ages.1')}></figcaption></figure><figure class="fig"><img class="photo" src="/img/teen-guardian.jpg" alt="A mother and her teenage son looking at a phone together at the kitchen table" width="1200" height="896" loading="lazy"><figcaption ${D('ages.2')}></figcaption></figure></div></div></section>\n\n`;
  // ---------------- HOME ----------------
  let [it, id, ib, ij] = pages['index'];
  const heroCta = '<div class="cta"><a class="btn" href="/connect" data-i18n="home.cta1"></a><a class="btn ghost" href="/how-pricing-works" data-i18n="home.cta2"></a></div>';
  ib = ib.replace(/<div class="cta"><a class="btn" href="\/calculator"[^>]*><\/a><a class="btn ghost" href="\/how-pricing-works"[^>]*><\/a><\/div>/, heroCta);
  // replace the "problem" + "steps" sections with flow, connect strip, vs table and rating bands
  ib = ib.replace(/<section class="sec"><div class="wrap center"><h2 data-i18n="home\.problem\.h">[\s\S]*?<\/section>\n\n/, `<section class="sec white" id="how"><div class="wrap center"><span class="kicker" ${D('nav.how')}></span><h2 ${D('flow.h')}></h2>${flow}<h3 style="margin-top:34px" ${D('home.conn.h')}></h3><p class="lead" ${D('home.conn.p')}></p>${pills}<p class="center" style="margin-top:22px"><a class="btn" href="/connect" ${D('home.cta1')}></a></p></div></section>

<section class="sec alt"><div class="wrap"><div class="center"><h2 ${D('vs.h')}></h2><p class="lead" ${D('vs.sub')}></p></div><div style="margin-top:28px">${vs}</div></div></section>

<section class="sec white"><div class="wrap"><div class="center"><span class="kicker" ${D('mega.rating')}></span><h2 ${D('rate.h')}></h2><p class="lead" ${D('rate.sub')}></p></div><div style="margin-top:28px;max-width:860px;margin-left:auto;margin-right:auto">${bands}</div></div></section>

`);
  // remove the old 4-step "how it works" section (replaced by the flow)
  ib = ib.replace(/<section class="sec alt"><div class="wrap"><h2 class="center" data-i18n="home\.steps\.h">[\s\S]*?<\/section>\n\n/, '');
  ib = ib.replace('<section class="sec dark">', ages + '<section class="sec dark">');
  pages['index'] = [it, id, ib, ij];

  // ---------------- CONNECT ----------------
  pages['connect'] = ['Connect your wearable', 'Connect Fitbit, Garmin, Whoop or Google Health Connect to get your PulseCover Risk Rating.', `
<main>
<section class="sec" style="padding:48px 0 24px"><div class="wrap"><div class="cards c2" style="align-items:center;gap:40px"><div><span class="kicker" ${D('nav.connect')}></span><h1 ${D('connect.h1')}></h1><p class="lead" ${D('connect.sub')}></p>
<div class="devrow" id="devrow"></div><div id="cres"></div><div class="msg" id="cmsg"></div></div>
<img class="photo" src="/img/connect-wrist.jpg" alt="A wrist wearing a plain smartwatch beside a phone showing a ring graphic" width="1200" height="896"></div></div></section>
<section class="sec alt"><div class="wrap"><div class="cards c3">${[1, 2, 3].map((i) => `<div class="card"><div class="ico">${i}</div><h3 ${D('connect.s' + i)}></h3></div>`).join('')}</div></div></section>
<section class="sec white"><div class="wrap"><div class="cards c2"><div class="card"><h3 ${D('connect.allow.h')}></h3><ul class="perm">${[1, 2, 3, 4].map((i) => `<li ${D('connect.a' + i)}></li>`).join('')}</ul></div><div class="card"><h3 ${D('connect.never.h')}></h3><ul class="perm no">${[1, 2, 3].map((i) => `<li ${D('connect.n' + i)}></li>`).join('')}</ul></div></div>
<div class="card" style="margin-top:20px"><p ${D('connect.hc')}></p></div><p style="margin-top:16px;color:var(--mute);font-size:.88rem" ${D('connect.demo')}></p></div></section>
<section class="sec"><div class="wrap center"><h2 ${D('flow.h')}></h2>${flow}</div></section>
</main>`, `
function ics(){document.querySelectorAll('[data-ic]').forEach(e=>e.innerHTML=PC_ICON(e.dataset.ic))}ics();
let conn=[];
function row(){document.getElementById('devrow').innerHTML=Object.entries(PC.providers).map(([k,n])=>'<button class="devbtn'+(conn.includes(k)?' on':'')+'" data-p="'+k+'">'+n+'<small>'+(conn.includes(k)?PC.t('connect.connected'):PC.t('connect.cta'))+'</small></button>').join('');
 document.querySelectorAll('.devbtn').forEach(b=>b.onclick=async()=>{try{const r=await PC.connect(b.dataset.p);if(!conn.includes(b.dataset.p))conn.push(b.dataset.p);row();show(r)}catch(e){if(e.message!=='cancel')PC.msg(cmsg,e.message)}})}
function show(r){const q=r.quote;document.getElementById('cres').innerHTML='<div class="card" style="margin-top:8px"><p style="margin:0 0 6px"><b>&#10003; '+PC.t('connect.connected')+' &middot; '+r.days+' '+PC.t('apply.connected.n')+'</b></p><p style="margin:0 0 10px">'+PC.t('rate.h')+': <span class="gr '+(q.grade==='A+'?'Ap':q.grade)+'">'+q.grade+'</span> &middot; '+PC.t('rate.score')+' '+q.score+'/100</p><a class="btn sm" href="/apply">'+PC.t('plan.apply')+' &rarr;</a></div>'}
PC.ready.then(async()=>{if(!PC.user){document.getElementById('devrow').style.display='block';document.getElementById('devrow').innerHTML='<p style="width:100%;color:var(--mute)">'+PC.t('connect.login')+'</p><a class="btn" href="/account?next=/connect">'+PC.t('nav.login')+'</a>';return}
 try{const d=await PC.api('/dashboard');conn=d.connections.map(c=>c.provider)}catch(e){}row()});
window.addEventListener('pc:lang',()=>{if(PC.user)row()});`];

  // ---------------- HOW PRICING WORKS ----------------
  let [ht, hd, hb, hj] = pages['how-pricing-works'];
  hb = hb.replace('<div class="cards c2" style="margin-top:28px">', `${flow}<div class="cards c2" style="margin-top:34px">`);
  hb = hb.replace('<div class="cta"><a class="btn" href="/calculator"', `<h2 style="margin-top:44px" ${D('rate.bands')}></h2>${bands}<div class="cards c2" style="margin-top:26px"><div class="card"><div class="ico" data-ic="sync"></div><h3 ${D('how.sum.h')}></h3><p ${D('how.sum.p')}></p></div><div class="card"><div class="ico" data-ic="lock"></div><h3 ${D('how.never.h')}></h3><p ${D('how.never.p')}></p></div></div><div class="cta"><a class="btn" href="/calculator"`);
  hj = `function ics(){document.querySelectorAll('[data-ic]').forEach(e=>e.innerHTML=PC_ICON(e.dataset.ic))}ics();`;
  pages['how-pricing-works'] = [ht, hd, hb, hj];

  // ---------------- COMPARE: two wearable rows ----------------
  let [pt, pd, pb, pj] = pages['compare'];
  pb = pb.replace('</tbody>', ['f8', 'f9'].map((f) => `<tr><td ${D('cmp.' + f)}></td><td class="hl"><span ${D('cmp.pc.' + f)}></span></td><td><span ${D('cmp.aia.' + f)}></span></td><td><span ${D('cmp.flat.' + f)}></span></td></tr>`).join('') + '</tbody>');
  pages['compare'] = [pt, pd, pb, pj];

  // ---------------- CALCULATOR: connect CTA + grade ----------------
  let [ct, cd, cb, cj] = pages['calculator'];
  cb = cb.replace('<p style="font-size:.85rem;color:var(--mute);margin-top:14px" data-i18n="calc.note"></p>', `<p style="font-size:.85rem;color:var(--mute);margin-top:14px" ${D('calc.note')}></p><div class="card" style="margin-top:14px;background:var(--gold-t);border-color:#f2dca6"><p style="color:var(--ink);margin:0 0 10px;font-weight:600" ${D('calc.connect')}></p><a class="btn sm" href="/connect" ${D('calc.connect.btn')}></a></div>`);
  cj = cj.replace("document.getElementById('r_score').textContent=q.score+' / 100';", "document.getElementById('r_score').textContent=q.score+' / 100  ('+q.grade+')';");
  pages['calculator'] = [ct, cd, cb, cj];

  // ---------------- APPLY (connect-first) ----------------
  pages['apply'] = ['Get covered', 'Connect your wearable, get your Risk Rating and a quote, then apply.', `
<main><section class="sec"><div class="wrap" style="max-width:860px"><h1 ${D('apply.h1')}></h1><p class="lead" ${D('apply.sub')}></p>
<div id="gate" class="card" style="display:none"><p ${D('apply.login.first')}></p><a class="btn" href="/account?next=/apply" ${D('nav.login')}></a></div>
<div id="have" class="card" style="display:none"><p ${D('apply.have')}></p><a class="btn" href="/dashboard" ${D('apply.done.go')}></a></div>
<div id="flow" style="display:none"><div class="steps" id="stepbar"><span ${D('apply.step1')}></span><span ${D('apply.step2')}></span><span ${D('apply.step3')}></span><span ${D('apply.step4')}></span></div>
<div class="card" id="s1"><h3 ${D('apply.plan')}></h3><div class="devs planpick" id="plansel"></div>
 <h3 style="margin-top:24px" ${D('apply.connect.h')}></h3><p style="color:var(--mute)" ${D('apply.connect.p')}></p><div class="devrow" id="devrow"></div><div id="cstate"></div>
 <details style="margin-top:16px"><summary ${D('apply.manual.h')}></summary><div class="rowf"><div><label ${D('calc.steps')}></label><input type="number" id="a_steps" value="7500" min="0" max="100000"></div><div><label ${D('calc.exercise')}></label><input type="number" id="a_ex" value="100" min="0" max="3000"></div><div><label ${D('calc.sleep')}></label><input type="number" id="a_sl" value="7.5" step="0.25" min="0" max="24"></div><div><label ${D('calc.hr')}></label><input type="number" id="a_hr" value="66" min="30" max="200"></div></div></details>
 <label class="check"><input type="checkbox" id="a_sub"><span ${D('calc.sub.opt')}></span></label><div class="msg" id="m1"></div><div class="cta"><button class="btn" id="n1" ${D('apply.next')}></button></div></div>
<div class="card" id="s2" style="display:none"><div style="text-align:center"><p style="margin:0;color:var(--mute)" ${D('apply.quote.rating')}></p><div class="ring" id="a_ring" style="--p:0"><i><span id="a_score">0</span><small id="a_grade"></small></i></div></div>
 <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--line)"><span ${D('calc.base')}></span><b id="a_base"></b></div>
 <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--line)"><span ${D('calc.adj')}></span><b id="a_adj"></b></div>
 <div style="display:flex;justify-content:space-between;padding:8px 0"><span ${D('calc.yours')}></span><b id="a_tot" style="font-size:1.4rem"></b></div>
 <div class="card" style="background:var(--gold-t);border-color:#f2dca6;margin-top:10px"><p style="color:var(--ink);margin:0" ${D('apply.sendins')}></p></div>
 <div class="cta"><button class="btn ghost" data-back="1" ${D('apply.back')}></button><button class="btn" id="n2" ${D('apply.next')}></button></div></div>
<div class="card" id="s3" style="display:none"><label ${D('apply.ben')}></label><input id="a_ben" maxlength="100"><label ${D('apply.guardian')}></label><input id="a_guard" maxlength="100"><div class="msg" id="m3"></div><div class="cta"><button class="btn ghost" data-back="2" ${D('apply.back')}></button><button class="btn" id="n3" ${D('apply.next')}></button></div></div>
<div class="card" id="s4" style="display:none"><label class="check"><input type="checkbox" id="c1"><span ${D('apply.consent1')}></span></label><label class="check"><input type="checkbox" id="c2"><span ${D('apply.consent2')}></span></label><div class="msg" id="m4"></div><div class="cta"><button class="btn ghost" data-back="3" ${D('apply.back')}></button><button class="btn" id="n4" ${D('apply.confirm')}></button></div></div>
<div class="card" id="done" style="display:none;text-align:center"><div class="ico" style="margin:0 auto 14px">&#10003;</div><h2 ${D('apply.done.h')}></h2><p><span ${D('apply.done.p')}></span> <b id="polno"></b></p><a class="btn" href="/dashboard" ${D('apply.done.go')}></a></div></div></div></section></main>`, `
let PLANS=[],plan=new URLSearchParams(location.search).get('plan')||'A',conn=[],days=0,quote=null,step=1;
function drawPlansel(){document.getElementById('plansel').innerHTML=PLANS.map(p=>'<div class="dev '+(p.id===plan?'sel':'')+'" data-p="'+p.id+'">'+PC.planName(p.id)+'<br><small style="font-weight:400">RM '+p.base+PC.t('common.year')+'</small></div>').join('');document.querySelectorAll('#plansel [data-p]').forEach(e=>e.onclick=()=>{plan=e.dataset.p;drawPlansel()})}
function drawDevs(){document.getElementById('devrow').innerHTML=Object.entries(PC.providers).map(([k,n])=>'<button class="devbtn'+(conn.includes(k)?' on':'')+'" data-d="'+k+'">'+n+'<small>'+(conn.includes(k)?PC.t('connect.connected'):PC.t('connect.cta'))+'</small></button>').join('');
 document.querySelectorAll('[data-d]').forEach(b=>b.onclick=async()=>{try{const r=await PC.connect(b.dataset.d,plan);if(!conn.includes(b.dataset.d))conn.push(b.dataset.d);days=r.days;drawDevs();cs()}catch(e){if(e.message!=='cancel')PC.msg(m1,e.message)}})}
function cs(){document.getElementById('cstate').innerHTML=days?'<p class="msg ok" style="display:block">&#10003; '+days+' '+PC.t('apply.connected.n')+'</p>':''}
function go(n){step=n;[1,2,3,4].forEach(i=>document.getElementById('s'+i).style.display=i===n?'':'none');document.querySelectorAll('#stepbar span').forEach((s,i)=>s.className=i+1===n?'on':i+1<n?'done':'');scrollTo({top:0,behavior:'smooth'})}
const mets=()=>({steps:+a_steps.value,exerciseMin:+a_ex.value,sleepHours:+a_sl.value,restingHr:+a_hr.value,appSubscription:a_sub.checked,plan});
function showQuote(){const q=quote;a_score.textContent=q.score;a_grade.textContent=PC.t('rate.grade')+' '+q.grade+' - '+PC.t('grade.'+q.grade);a_ring.style.setProperty('--p',q.score);a_base.textContent='RM '+PC.fmt(q.base);a_adj.textContent=(q.adjustmentPct>0?'+':'')+q.adjustmentPct+'%';a_tot.textContent='RM '+PC.fmt(q.totalAnnual)+PC.t('common.year')}
PC.ready.then(async()=>{PLANS=await PC.api('/plans');if(!PLANS.find(p=>p.id===plan))plan='A';drawPlansel();if(!PC.user){gate.style.display='';return}
 try{const d=await PC.api('/dashboard');if(d.policy){have.style.display='';return}conn=d.connections.map(c=>c.provider);days=d.metrics.length}catch(e){}
 drawDevs();cs();flow.style.display='';go(1)});
window.addEventListener('pc:lang',()=>{if(PLANS.length){drawPlansel();drawDevs();cs();if(quote)showQuote()}});
n1.onclick=async()=>{try{quote=days>=7?(await PC.api('/my-quote',{plan,appSubscription:a_sub.checked})).quote:await PC.api('/quote',mets());showQuote();go(2)}catch(e){PC.msg(m1,e.message)}};
n2.onclick=()=>go(3);document.querySelectorAll('[data-back]').forEach(b=>b.onclick=()=>go(+b.dataset.back));
n3.onclick=()=>{if(a_ben.value.trim().length<2)return PC.msg(m3,PC.t('common.required')+': '+PC.t('apply.ben'));go(4)};
n4.onclick=async()=>{if(!c1.checked||!c2.checked)return PC.msg(m4,PC.t('common.required'));n4.disabled=true;
 try{const r=await PC.api('/apply',{...mets(),device:conn[0]||'manual',beneficiary:a_ben.value,guardian:a_guard.value,consentData:true,consentTerms:true});
  [1,2,3,4].forEach(i=>document.getElementById('s'+i).style.display='none');stepbar.style.display='none';polno.textContent=r.number;done.style.display=''}
 catch(e){PC.msg(m4,e.message);n4.disabled=false}};`];

  // ---------------- DASHBOARD ----------------
  pages['dashboard'] = ['My dashboard', 'Your policy, connected devices, weekly summary and PulseCover Risk Rating.', `
<main><section class="sec"><div class="wrap"><h1><span ${D('dash.h1')}></span>, <span id="who"></span></h1>
<div id="nop" class="card" style="display:none"><p ${D('dash.nopolicy')}></p><a class="btn" href="/connect" ${D('nav.connect')}></a> <a class="btn ghost" href="/apply" ${D('nav.apply')}></a></div>
<div id="main" style="display:none"><div class="kpi">
 <div class="card"><span ${D('dash.policy')}></span><b id="k_pol" style="font-size:1.1rem"></b></div><div class="card"><span ${D('dash.premium')}></span><b id="k_prem"></b></div>
 <div class="card"><span ${D('dash.rating')}</span><b id="k_score"></b></div><div class="card"><span ${D('dash.projected')}></span><b id="k_proj"></b></div></div>
<div class="card" style="margin-bottom:20px"><h3 ${D('dash.pipe.h')}></h3><div class="pipe" id="pipe"></div></div>
<div class="dgrid"><div>
 <div class="card"><h3 ${D('dash.devices')}></h3><div id="devs"></div><div class="devrow" id="devrow" style="margin-top:10px"></div><div class="msg" id="sm"></div></div>
 <div class="card" style="margin-top:18px"><h3 ${D('dash.weekly')}></h3><p style="color:var(--mute);font-size:.9rem" ${D('dash.summ.note')}></p><canvas id="chart" width="700" height="240"></canvas><p id="nodata" style="display:none;color:var(--mute)" ${D('dash.nodata')}></p><div class="scroll"><table class="wk" id="wk"></table></div>
  <div class="cta" style="margin-top:12px"><button class="btn sm" id="sync" ${D('dash.refresh')}></button></div></div>
 <div class="card" style="margin-top:18px"><h3 ${D('dash.myclaims')}></h3><div id="cl"></div><a class="btn sm" href="/claims" ${D('dash.newclaim')}></a></div></div>
<div><div class="card"><h3 ${D('dash.pause.h')}></h3><p ${D('dash.pause.p')}></p><div id="pausedmsg" class="pill" style="display:none"></div>
 <div class="rowf"><div><label ${D('dash.pause.days')}></label><input type="number" id="pdays" value="14" min="1" max="60"></div><div><label>&nbsp;</label><select id="preason"><option value="illness">Illness</option><option value="injury">Injury</option><option value="travel">Travel</option><option value="pregnancy">Pregnancy</option><option value="other">Other</option></select></div></div><button class="btn sm" style="margin-top:12px" id="pbtn" ${D('dash.pause.btn')}></button><div class="msg" id="pm"></div></div>
 <div class="card" style="margin-top:18px"><h3 ${D('dash.ref.h')}></h3><p ${D('dash.ref.p')}></p><p><span ${D('dash.ref.code')}></span>: <b id="rcode"></b> &middot; <span ${D('dash.ref.count')}></span>: <b id="rcount"></b> <span id="medal"></span></p><button class="btn sm" id="copy" ${D('dash.ref.copy')}></button>
  <h3 style="margin-top:18px;font-size:1rem" ${D('dash.board')}></h3><ul class="board" id="board" style="list-style:none;padding:0;margin:0"></ul><p style="font-size:.82rem;color:var(--mute);margin-top:10px" ${D('dash.milestone')}></p></div>
 <p style="margin-top:18px"><a href="#" id="lo" ${D('nav.logout')}></a></p></div></div></div></div></section></main>`.replace('<span data-i18n="dash.rating"</span>', '<span data-i18n="dash.rating"></span>'), `
let D;
const gc=g=>g==='A+'?'Ap':g;
function chart(){const c=document.getElementById('chart'),x=c.getContext('2d'),W=c.width,H=c.height;x.clearRect(0,0,W,H);const m=D.weekly||[];
 document.getElementById('nodata').style.display=m.length?'none':'';c.style.display=m.length?'':'none';if(!m.length)return;
 x.strokeStyle='#e6e3e8';x.fillStyle='#646273';x.font='12px sans-serif';for(let i=0;i<=4;i++){const y=20+(H-50)*i/4;x.beginPath();x.moveTo(40,y);x.lineTo(W-10,y);x.stroke();x.fillText(100-i*25,8,y+4)}
 const px=i=>40+(W-60)*(m.length===1?.5:i/(m.length-1)),py=s=>20+(H-50)*(1-s/100);
 x.strokeStyle='#b71234';x.lineWidth=3;x.beginPath();m.forEach((p,i)=>i?x.lineTo(px(i),py(p.score)):x.moveTo(px(i),py(p.score)));x.stroke();
 x.fillStyle='#b71234';m.forEach((p,i)=>{x.beginPath();x.arc(px(i),py(p.score),5,0,7);x.fill()});
 x.fillStyle='#646273';m.forEach((p,i)=>x.fillText(p.start.slice(5),px(i)-14,H-10))}
function devs(){const have=(D.connections||[]).map(c=>c.provider);
 document.getElementById('devs').innerHTML=have.length?'<div class="pills" style="justify-content:flex-start;margin:6px 0">'+D.connections.map(c=>'<span class="pv on"><i></i>'+PC.providers[c.provider]+' <button class="btn sm ghost" data-x="'+c.provider+'" style="padding:2px 10px;margin-left:6px">'+PC.t('connect.disc')+'</button></span>').join('')+'</div><p style="color:var(--mute);font-size:.85rem;margin:0">'+PC.t('dash.lastsync')+': '+D.connections[0].last_sync.slice(0,16).replace('T',' ')+'</p>':'<p style="color:var(--mute)">'+PC.t('dash.nodev')+'</p>';
 document.getElementById('devrow').innerHTML=Object.entries(PC.providers).filter(([k])=>!have.includes(k)).map(([k,n])=>'<button class="devbtn" data-c="'+k+'">'+n+'<small>'+PC.t('dash.connect')+'</small></button>').join('');
 document.querySelectorAll('[data-c]').forEach(b=>b.onclick=async()=>{try{await PC.connect(b.dataset.c);load()}catch(e){if(e.message!=='cancel')PC.msg(sm,e.message)}});
 document.querySelectorAll('[data-x]').forEach(b=>b.onclick=async()=>{await PC.api('/disconnect',{provider:b.dataset.x});load()})}
function paint(){if(!D)return;const p=D.policy;who.textContent=D.user.name.split(' ')[0];if(!p){nop.style.display='';main.style.display='none';return}
 nop.style.display='none';main.style.display='';k_pol.textContent=PC.planName(p.plan||'A')+' \\u00b7 '+p.number;k_prem.textContent='RM '+PC.fmt(p.premium)+PC.t('common.year');
 k_score.innerHTML=D.score30==null?'-':'<span class="gr '+gc(D.grade)+'">'+D.grade+'</span> '+D.score30+'/100';
 k_proj.textContent='RM '+PC.fmt(D.projected.annualPremium)+' ('+(D.projected.adjustmentPct>0?'+':'')+D.projected.adjustmentPct+'%)';
 const n=D.connections.length,has=D.metrics.length>=7;pipe.innerHTML=['dash.p1','dash.p2','dash.p3','dash.p4','dash.p5'].map((k,i)=>'<span class="'+((i<2?n>0:i<3?has:true)?(i===4?'now':'done'):'')+'">'+(i<4?'&#10003; ':'')+PC.t(k)+'</span>').join('');
 if(D.paused){pausedmsg.style.display='';pausedmsg.textContent=PC.t('dash.paused')+' '+D.paused}else pausedmsg.style.display='none';
 rcode.textContent=D.user.refcode;rcount.textContent=D.referrals;medal.textContent=D.referrals>=25?'\\u{1F947}':D.referrals>=10?'\\u{1F948}':D.referrals>=3?'\\u{1F949}':'';
 board.innerHTML=D.ranking.length?D.ranking.map((r,i)=>'<li><span>'+(i+1)+'. '+PC.esc(r.name)+'</span><b>'+r.count+'</b></li>').join(''):'<li style="color:var(--mute)">-</li>';
 wk.innerHTML='<tr><th>'+PC.t('dash.week')+'</th><th>'+PC.t('dash.dayscount')+'</th><th>'+PC.t('dash.steps')+'</th><th>'+PC.t('dash.exercise')+' /wk</th><th>'+PC.t('dash.sleep')+'</th><th>'+PC.t('dash.hr')+'</th><th>'+PC.t('rate.grade')+'</th></tr>'+(D.weekly||[]).slice().reverse().slice(0,6).map(w=>'<tr><td>'+w.start.slice(5)+'</td><td>'+w.days+'</td><td>'+w.steps.toLocaleString()+'</td><td>'+w.exerciseMin+'</td><td>'+w.sleepHours+'</td><td>'+w.restingHr+'</td><td><span class="gr '+gc(w.grade)+'">'+w.grade+'</span></td></tr>').join('');
 cl.innerHTML=D.claims.length?D.claims.slice(0,3).map(c=>'<p><b>'+PC.esc(c.number)+'</b> &middot; RM '+PC.fmt(c.amount)+' &middot; <span class="pill">'+PC.t('cl.s.'+c.status)+'</span></p>').join(''):'<p style="color:var(--mute)">'+PC.t('cl.none')+'</p>';devs();chart()}
async function load(){try{D=await PC.api('/dashboard');paint()}catch(e){if(e.status===401)location.href='/account?next=/dashboard'}}
PC.ready.then(load);window.addEventListener('pc:lang',paint);
sync.onclick=async()=>{try{await PC.api('/sync',{});PC.msg(sm,PC.t('dash.synced'),true);load()}catch(e){PC.msg(sm,e.message)}};
pbtn.onclick=async()=>{try{await PC.api('/pause',{days:+pdays.value,reason:preason.value});PC.msg(pm,PC.t('dash.synced'),true);load()}catch(e){PC.msg(pm,e.message)}};
copy.onclick=()=>{const u=location.origin+'/account?ref='+D.user.refcode;(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).catch(()=>{}).finally(()=>{copy.textContent=PC.t('dash.ref.copied');setTimeout(()=>copy.textContent=PC.t('dash.ref.copy'),1500)})};
lo.onclick=e=>{e.preventDefault();PC.logout()};`];

  // ---------------- CLAIMS: photo banner ----------------
  let [clt, cld, clb, clj] = pages['claims'];
  clb = clb.replace('<h1 data-i18n="cl.h1"></h1><p class="lead" data-i18n="cl.sub"></p>', '<h1 data-i18n="cl.h1"></h1><p class="lead" data-i18n="cl.sub"></p><img class="photo banner" src="/img/claims-relief.jpg" alt="A man smiling with relief as he checks his phone at a home desk" width="1200" height="896" loading="lazy">');
  clb = clb.replace('<h2 style="margin-top:36px" data-i18n="cl.track"></h2>', '<h2 id="trk" style="margin-top:36px;display:none" data-i18n="cl.track"></h2>');
  clj = clj.replace("form.style.display='';load()", "form.style.display='';trk.style.display='';load()");
  pages['claims'] = [clt, cld, clb, clj];
};
