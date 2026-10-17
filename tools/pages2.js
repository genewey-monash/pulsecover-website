// Redesign overrides: new home, plans page, plan-aware calculator/apply/dashboard.
module.exports = (pages, D) => {
  const PLAN_JS = `
function planCardHome(p){const lo=Math.round(p.base*.85),hi=Math.round(p.base*1.15);return '<div class="card plancard" data-type="'+p.type+'" style="display:flex;flex-direction:column"><div>'+(p.isNew?'<span class="chip">'+PC.t('plan.new')+'</span>':'')+'<span class="chip" style="background:var(--red-t);color:var(--red)">'+PC.t('type.'+p.type)+'</span></div><h3 style="margin-top:10px;font-size:1.35rem">'+PC.planName(p.id)+'</h3><ul style="padding-left:18px;margin:6px 0 14px;color:var(--mute)">'+covs(p).slice(0,3).map(c=>'<li>'+PC.t('cov.'+c)+'</li>').join('')+'<li>'+PC.t('plan.wear')+'</li></ul><div style="margin-top:auto;border-top:1px solid var(--line);padding-top:14px"><small style="color:var(--mute)">'+PC.t('plan.from')+'</small><div style="color:var(--red);font-size:1.35rem;font-weight:800;white-space:nowrap;margin-bottom:12px">RM '+PC.fmt(p.base,0)+'<small style="font-size:.8rem;font-weight:500;color:var(--mute)"> '+PC.t('common.year')+'</small></div><a class="btn sm ghost" style="width:100%" href="/plans#'+p.id+'">'+PC.t('common.learn')+' &rarr;</a></div></div>'}
function covs(p){return 'ABCDEF'.slice(0,{A:3,B:4,C:5,D:6}[p.id]||3).split('')}`;

  // ---------------- HOME ----------------
  pages['index'] = ['Wearable-based life & health insurance', 'Insurance priced on how you live. Link your wearable, get a fair premium.', `
<main>
<section class="hero"><div class="wrap" style="padding:0"><div class="grid">
 <img class="pic" src="/img/hero-family.jpg" alt="A multi-generation Malaysian family walking together in a park, wearing fitness trackers" width="1376" height="768">
 <div class="copy"><span class="eyebrow" ${D('home.eyebrow')}></span><h1 ${D('home.h1')}></h1><p class="lead" ${D('home.sub')}></p>
 <div class="cta"><a class="btn" href="/calculator" ${D('home.cta1')}></a><a class="btn ghost" href="/how-pricing-works" ${D('home.cta2')}></a><a class="btn ghost" href="/app" ${D('dl.web.btn')}></a></div></div></div></div></section>
<div class="wrap"><div class="stats">
 <div class="stat"><b>RM600</b><span ${D('home.stat1')}></span></div><div class="stat"><b>±15%</b><span ${D('home.stat2')}></span></div>
 <div class="stat"><b>3</b><span ${D('home.stat3')}></span></div><div class="stat"><b>18+</b><span ${D('home.stat4')}></span></div></div></div>

<section class="sec"><div class="wrap center"><h2 ${D('home.problem.h')}></h2><p class="lead" ${D('home.problem.p')}></p></div></section>

<section class="sec alt" id="plans"><div class="wrap"><div class="center"><span class="kicker" ${D('nav.plans')}></span><h2 ${D('home.plans.h')}></h2><p class="lead" ${D('home.plans.sub')}></p></div>
 <div class="tabs" id="ptabs" style="margin-top:22px"><button class="tab on" data-f="all" ${D('plans.all')}></button><button class="tab" data-f="individual" ${D('type.individual')}></button><button class="tab" data-f="family" ${D('type.family')}></button></div>
 <div class="cards c4" id="plancards"></div><p class="center" style="margin:26px 0 0"><a class="btn" href="/plans" ${D('home.viewall')}></a></p><p class="center" style="font-size:.82rem;color:var(--mute);margin-top:16px" ${D('home.disc')}></p></div></section>

<section class="sec"><div class="wrap"><h2 class="center" ${D('home.ben.h')}></h2><div class="cards c3" style="margin-top:30px">
 ${[['heart',1],['shield',2],['watch',3],['file',4],['lock',5],['gift',6]].map(([ic,i])=>`<div class="card"><div class="ico" data-ic="${ic}"></div><h3 ${D('home.ben'+i+'.h')}></h3><p ${D('home.ben'+i+'.p')}></p></div>`).join('')}</div></div></section>

<section class="sec alt"><div class="wrap"><h2 class="center" ${D('home.steps.h')}></h2><div class="cards c4" style="margin-top:28px">
 ${[1,2,3,4].map(i=>`<div class="card"><div class="ico">${i}</div><h3 ${D('home.s'+i+'.h')}></h3><p ${D('home.s'+i+'.p')}></p></div>`).join('')}</div></div></section>

<section class="sec"><div class="wrap"><div class="cards c2" style="align-items:center;gap:40px"><img class="photo" src="/img/three-ages.jpg" alt="Three friends of different ages looking at a phone together at a cafe" width="1200" height="896" loading="lazy"><div><h2 ${D('home.why.h')}></h2><p class="lead" ${D('home.why.p')}></p>
 ${[1,2,3].map(i=>`<div class="card quote" style="margin-top:14px;padding:18px"><h3 style="font-size:1rem" ${D('home.c'+i+'.h')}></h3><p ${D('home.c'+i+'.p')}></p></div>`).join('')}</div></div></div></section>

<section class="sec dark"><div class="wrap"><h2 class="center" ${D('home.trust.h')}></h2><div class="cards c3" style="margin-top:28px;text-align:center">
 ${[1,2,3].map(i=>`<div><b style="font-size:2.6rem;color:var(--gold)" ${D('home.trust.'+i)}></b><p style="color:rgba(255,255,255,.8)" ${D('home.trust.'+i+'d')}></p></div>`).join('')}</div>
 <p class="center" style="margin-top:22px"><a class="btn gold" href="/investors" ${D('nav.investors')}></a></p></div></section>

<section class="sec"><div class="wrap"><h2 class="center" ${D('home.tools.h')}></h2><p class="lead center" ${D('home.tools.sub')}></p><div class="cards c3" style="margin-top:28px">
 <a class="card" href="/calculator" style="text-decoration:none"><div class="ico" data-ic="calc"></div><h3 ${D('nav.calc')}></h3><p ${D('calc.sub')}></p></a>
 <a class="card" href="/compare" style="text-decoration:none"><div class="ico" data-ic="scale"></div><h3 ${D('nav.compare')}></h3><p ${D('cmp.sub')}></p></a>
 <a class="card" href="/how-pricing-works" style="text-decoration:none"><div class="ico" data-ic="watch"></div><h3 ${D('nav.how')}></h3><p ${D('how.sub')}></p></a></div></div></section>

<section class="sec alt"><div class="wrap"><h2 class="center" ${D('home.cross.h')}></h2><div class="cards c3" style="margin-top:28px">
 <a class="card" href="/business" style="text-decoration:none"><div class="ico" data-ic="users"></div><h3 ${D('home.cross.1')}></h3><p ${D('home.cross.1d')}></p></a>
 <a class="card" href="/claims" style="text-decoration:none"><div class="ico" data-ic="file"></div><h3 ${D('home.cross.2')}></h3><p ${D('home.cross.2d')}></p></a>
 <a class="card" href="/faq" style="text-decoration:none"><div class="ico" data-ic="book"></div><h3 ${D('home.cross.3')}></h3><p ${D('home.cross.3d')}></p></a></div></div></section>

<section class="sec red" id="advisor"><div class="wrap"><div class="cards c2" style="gap:40px;align-items:center"><div><h2 ${D('home.adv.h')}></h2><p class="lead" ${D('home.adv.p')}></p>
 <ul style="list-style:none;padding:0;margin:18px 0 22px">${[1,2,3].map(i=>`<li style="padding:5px 0 5px 28px;position:relative"><span style="position:absolute;left:0;color:var(--gold)">&#10003;</span><span ${D('home.adv.b'+i)}></span></li>`).join('')}</ul>
 <img class="photo" style="min-height:0;height:230px" src="/img/advisor.jpg" alt="A friendly team member with a headset smiling at a laptop" width="1200" height="896" loading="lazy"></div>
 <div class="formcard"><div id="homecb"></div></div></div></div></section>

<section class="sec"><div class="wrap center"><h2 ${D('home.waitlist.h')}></h2><p class="lead" ${D('home.waitlist.p')}></p>
 <form id="wl" style="max-width:460px;margin:18px auto 0;display:flex;gap:10px"><input type="email" required data-i18n-ph="field.email" id="wlemail"><button class="btn" ${D('home.waitlist.btn')}></button></form><div id="wlm" class="msg" style="max-width:460px;margin:12px auto"></div></div></section>
</main>`, `
${PLAN_JS}
let PL=[],flt='all';
function drawPlans(){document.getElementById('plancards').innerHTML=PL.filter(p=>flt==='all'||p.type===flt).map(planCardHome).join('')}
function ics(){document.querySelectorAll('[data-ic]').forEach(e=>e.innerHTML=PC_ICON(e.dataset.ic))}
PC.api('/plans').then(p=>{PL=p;drawPlans()});ics();
document.querySelectorAll('#ptabs .tab').forEach(b=>b.onclick=()=>{flt=b.dataset.f;document.querySelectorAll('#ptabs .tab').forEach(x=>x.classList.toggle('on',x===b));drawPlans()});
window.addEventListener('pc:lang',drawPlans);
PC.callbackForm(document.getElementById('homecb'),'h');
document.getElementById('wl').onsubmit=async e=>{e.preventDefault();const m=document.getElementById('wlm');try{await PC.api('/waitlist',{email:document.getElementById('wlemail').value,lang:PC.lang});PC.msg(m,PC.t('home.waitlist.ok'),true);e.target.reset()}catch(x){PC.msg(m,x.message)}}`];

  // ---------------- PLANS ----------------
  pages['plans'] = ['Plans', 'Browse and compare PulseCover plans.', `
<main>
<section class="sec" style="padding:48px 0 28px"><div class="wrap"><div class="cards c2" style="align-items:center"><div><h1 ${D('plans.h1')}></h1><p class="lead" ${D('plans.sub')}></p><div class="cta"><a class="btn" href="#list" ${D('plan.quote')}></a><a class="btn ghost" href="#advisor" data-open-callback ${D('nav.talk')}></a></div></div><img class="photo" style="min-height:0;height:260px" src="/img/three-ages.jpg" alt="Three friends looking at a phone together at a café" width="1200" height="896" loading="lazy"></div></div></section>
<div class="subnav"><div class="wrap"><strong ${D('nav.plans')}></strong><a href="#list" ${D('plans.all')}></a><a href="#compare" ${D('cmpt.h')}></a><a href="/how-pricing-works" ${D('nav.how')}></a><a href="/faq" ${D('nav.faq')}></a></div></div>
<section class="sec alt" id="list"><div class="wrap"><details class="card" id="diff" style="margin-bottom:22px"><summary style="cursor:pointer;font-weight:800" ${D('diff.h')}></summary><div class="cards c2" style="margin-top:14px;gap:18px"><div><h3 ${D('diff.ind.h')}></h3><ul style="margin:8px 0 0;padding-left:20px"><li ${D('diff.ind.1')}></li><li ${D('diff.ind.2')}></li><li ${D('diff.ind.3')}></li></ul></div><div><h3 ${D('diff.fam.h')}></h3><ul style="margin:8px 0 0;padding-left:20px"><li ${D('diff.fam.1')}></li><li ${D('diff.fam.2')}></li><li ${D('diff.fam.3')}></li></ul></div></div><p style="margin:14px 0 0;color:var(--mute)" ${D('diff.same')}></p></details><div class="plans"><aside class="filters"><h4 ${D('filter.browse')}></h4>
 <h4 ${D('filter.type')}></h4><label><input type="checkbox" data-ft="individual" checked><span ${D('type.individual')}></span></label><label><input type="checkbox" data-ft="family" checked><span ${D('type.family')}></span></label><label><input type="checkbox" data-ft="business" checked><span ${D('pl2.type.biz')}></span></label></aside>
 <div><div class="plist" id="plist"></div><p id="pnone" style="display:none;color:var(--mute)" ${D('plan.none')}></p><p style="font-size:.85rem;color:var(--mute);margin-top:18px" ${D('plans.note')}></p><div class="card" style="margin-top:18px"><p style="margin:0 0 6px"><b ${D('plans.uw')}></b></p><p style="margin:0;color:var(--mute);font-size:.9rem" ${D('plans.consent')}></p></div></div></div></div></section>
<section class="sec white" id="compare"><div class="wrap"><h2 ${D('cmpt.h')}></h2><div class="scroll"><table class="tbl" id="ctable"></table></div></div></section>
<div class="cmpbar" id="cmpbar"><div class="wrap"><b id="cmpn"></b><span ${D('cmpbar.t')}></span><span id="cmpnames" style="opacity:.8"></span><a class="btn gold sm" style="margin-left:auto" href="#compare" ${D('cmpbar.go')}></a><button class="btn outl-w sm" id="cmpclr" ${D('cmpbar.clear')}></button></div></div>
</main>`, `
${PLAN_JS}
let PL=[],sel=[];
const T=()=>[...document.querySelectorAll('[data-ft]:checked')].map(e=>e.dataset.ft);
function planCard(p){const lo=Math.round(p.base*.85),hi=Math.round(p.base*1.15);return '<div class="plan" id="'+p.id+'">'+(p.isNew?'<span class="rib">'+PC.t('plan.new')+'</span>':'')+'<div><span class="cat">'+PC.t('plan.cat')+'</span><h3>'+PC.planName(p.id)+'</h3><div><span class="chip">'+PC.t('type.'+p.type)+'</span>'+'</div><ul>'+covs(p).map(c=>'<li>'+PC.t('cov.'+c)+'</li>').join('')+'<li>'+PC.t('plan.wear')+'</li></ul><p style="margin:0;color:var(--mute);font-size:.9rem">'+PC.t('plan.cover')+' <b>RM '+PC.fmt(p.cover,0)+'</b></p></div><div class="side"><div class="price"><small>'+PC.t('plan.from')+'</small><b>RM '+PC.fmt(p.base,0)+'</b><small>'+PC.t('common.year')+'</small><br><small style="color:var(--mute)">'+PC.t('plan.range')+': RM '+PC.fmt(lo,0)+'\u2013'+PC.fmt(hi,0)+'</small></div><div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end"><button class="btn ghost sm" data-cmp="'+p.id+'">'+(sel.includes(p.id)?'&#10003; '+PC.t('plan.added'):'+ '+PC.t('plan.compare'))+'</button><a class="btn ghost sm" href="/plan-result?plan='+p.id+'">'+PC.t('plan.quote')+'</a><a class="btn sm" href="/apply?plan='+p.id+'">'+PC.t('plan.apply')+'</a></div></div></div>'}
function bizCard(){return '<div class="plan" id="business"><div><span class="cat">'+PC.t('pl2.biz.cat')+'</span><h3>'+PC.t('pl2.biz')+'</h3><div><span class="chip">'+PC.t('pl2.type.biz')+'</span></div><ul><li>'+PC.t('pl2.biz.c1')+'</li><li>'+PC.t('pl2.biz.c2')+'</li><li>'+PC.t('pl2.biz.c3')+'</li></ul></div><div class="side"><div class="price"><small>'+PC.t('pl2.biz.from')+'</small><b>RM 600</b><small>'+PC.t('common.year')+'</small></div><div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end"><a class="btn ghost sm" href="/business#enquiry">'+PC.t('pl2.biz.enquire')+'</a><a class="btn sm" href="/plan-result?plan=business">'+PC.t('plan.quote')+'</a></div></div></div>'}
function draw(){const t=T();const vis=PL.filter(p=>t.includes(p.type));const biz=t.includes('business');document.getElementById('plist').innerHTML=vis.map(planCard).join('')+(biz?bizCard():'');document.getElementById('pnone').style.display=vis.length||biz?'none':'';
 document.querySelectorAll('[data-cmp]').forEach(x=>x.onclick=()=>{const id=x.dataset.cmp;if(sel.includes(id))sel=sel.filter(s=>s!==id);else if(sel.length<3)sel.push(id);draw();table()});table()}
function table(){const rows=PL.filter(p=>sel.includes(p.id));const bar=document.getElementById('cmpbar');bar.classList.toggle('open',sel.length>0);cmpn.textContent=sel.length;cmpnames.textContent=sel.map(PC.planName).join(', ');
 const use=rows.length?rows:PL;const tb=document.getElementById('ctable');
 tb.innerHTML='<thead><tr><th></th>'+use.map(p=>'<th>'+PC.planName(p.id)+'</th>').join('')+'</tr></thead><tbody>'+
 [['cmpt.price',p=>'RM '+PC.fmt(p.base,0)],['cmpt.best',p=>'RM '+PC.fmt(p.base*.85,0)],['cmpt.worst',p=>'RM '+PC.fmt(p.base*1.15,0)],['cmpt.cover',p=>'RM '+PC.fmt(p.cover,0)],['cmpt.type',p=>PC.t('type.'+p.type)],['cmpt.cov',p=>covs(p).map(c=>'<div style="margin:0 0 12px;line-height:1.45">'+PC.t('cov.'+c)+'</div>').join('')]].map(r=>'<tr><td>'+PC.t(r[0])+'</td>'+use.map(p=>'<td>'+r[1](p)+'</td>').join('')+'</tr>').join('')+'<tr><td></td>'+use.map(p=>'<td><div style="display:flex;flex-direction:column;gap:6px"><a class="btn ghost sm" href="/plan-result?plan='+p.id+'">'+PC.t('plan.quote')+'</a><a class="btn sm" href="/apply?plan='+p.id+'">'+PC.t('plan.apply')+'</a></div></td>').join('')+'</tr></tbody>'}
PC.api('/plans').then(p=>{PL=p;draw();if(location.hash&&document.querySelector(location.hash))setTimeout(()=>document.querySelector(location.hash).scrollIntoView({block:'center'}),100)});
document.querySelectorAll('[data-ft]').forEach(e=>e.onchange=draw);cmpclr.onclick=()=>{sel=[];draw()};
window.addEventListener('pc:lang',draw);`];

  // ---------------- CALCULATOR: plan select ----------------
  let [ct, cd, cb, cj] = pages['calculator'];
  cb = cb.replace('<div class="card">\n <div class="rng"><label '+D('calc.steps')+'>', `<div class="card">\n <label ${D('calc.plan')}></label><select id="planSel"></select>\n <div class="rng"><label ${D('calc.steps')}>`);
  cj = cj.replace("appSubscription:document.getElementById('appSub').checked}", "appSubscription:document.getElementById('appSub').checked,plan:document.getElementById('planSel').value||'A'}");
  cj = cj.replace("document.getElementById('base') ", "document.getElementById('base') ");
  cj = cj.replace("ids.concat('appSub').forEach", `PC.api('/plans').then(ps=>{const s=document.getElementById('planSel');s.innerHTML=ps.map(p=>'<option value="'+p.id+'">'+PC.planName(p.id)+' - RM '+p.base+'</option>').join('');const q=new URLSearchParams(location.search).get('plan');if(q)s.value=q;s.onchange=()=>{clearTimeout(timer);timer=setTimeout(run,60)};window.addEventListener('pc:lang',()=>{[...s.options].forEach(o=>o.textContent=PC.planName(o.value)+' - RM '+ps.find(p=>p.id===o.value).base)});run()});
ids.concat('appSub').forEach`);
  cj = cj.replace("window.addEventListener('pc:lang',paint);run();","window.addEventListener('pc:lang',paint);");
  cj = cj.replace("'/apply?steps='", "'/apply?plan='+document.getElementById('planSel').value+'&steps='");
  pages['calculator'] = [ct, cd, cb, cj];

  // ---------------- APPLY: plan pick instead of cover ----------------
  let [at, ad, ab, aj] = pages['apply'];
  ab = ab.replace(/<label \$\{D\('apply\.cover'\)\}>[\s\S]*?<\/select>/, '');
  ab = ab.replace(`<label data-i18n="apply.cover"></label><select id="a_cover"><option value="50000">RM 50,000</option><option value="100000" selected>RM 100,000</option><option value="250000">RM 250,000</option><option value="500000">RM 500,000</option></select>`, '');
  ab = ab.replace('<div class="card" id="s1"><h3 data-i18n="apply.dev"></h3>', '<div class="card" id="s1"><h3 data-i18n="apply.plan"></h3><div class="devs planpick" id="plansel"></div><h3 style="margin-top:22px" data-i18n="apply.dev"></h3>');
  aj = aj.replace("let device='healthconnect'", "let PLANS=[],plan=new URLSearchParams(location.search).get('plan')||'A';\nlet device='healthconnect'");
  aj = aj.replace("function drawDevs(){", "function drawPlansel(){document.getElementById('plansel').innerHTML=PLANS.map(p=>'<div class=\"dev '+(p.id===plan?'sel':'')+'\" data-p=\"'+p.id+'\">'+PC.planName(p.id)+'<br><small style=\"font-weight:400\">RM '+p.base+PC.t('common.year')+'</small></div>').join('');document.querySelectorAll('[data-p]').forEach(e=>e.onclick=()=>{plan=e.dataset.p;drawPlansel()})}\nfunction drawDevs(){");
  aj = aj.replace("PC.ready.then(async()=>{drawDevs();", "PC.ready.then(async()=>{PLANS=await PC.api('/plans');if(!PLANS.find(p=>p.id===plan))plan='A';drawPlansel();drawDevs();");
  aj = aj.replace("window.addEventListener('pc:lang',()=>{drawDevs();", "window.addEventListener('pc:lang',()=>{drawPlansel();drawDevs();");
  aj = aj.replace("appSubscription:a_sub.checked})", "appSubscription:a_sub.checked,plan})");
  aj = aj.replace("device,cover:+a_cover.value,beneficiary", "device,plan,beneficiary");
  pages['apply'] = [at, ad, ab, aj];

  // ---------------- DASHBOARD: show plan ----------------
  let [dt, dd, db, dj] = pages['dashboard'];
  dj = dj.replace("k_pol.textContent=p.number;", "k_pol.textContent=PC.planName(p.plan||'A')+' \\u00b7 '+p.number;");
  pages['dashboard'] = [dt, dd, db, dj];

  // business: anchor for enquiry
  let [bt, bd, bb, bj] = pages['business'];
  bb = bb.replace('<div class="card" style="margin-top:24px;max-width:720px"><h3', '<div class="card" id="enquiry" style="margin-top:24px;max-width:720px"><h3');
  pages['business'] = [bt, bd, bb, bj];
};
