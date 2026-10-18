// v9: plan result view. Plan selection (Products > Plans > Get Quote) lands here, never in the Premium Calculator.
const PRICING = require('../pricing');
module.exports = (pages, D) => {
  const bullets = [['shield', 1], ['file', 2], ['gift', 3]].map(([ic, i]) => `<li><span class="ic" data-ic="${ic}"></span><span ${D('pl2.up.b' + i)}></span></li>`).join('');
  pages['plan-result'] = ['Plan quote', 'Your wearable-adjusted premium for the plan you chose.', `
<main class="pl2"><section class="sec"><div class="wrap" style="max-width:760px">
 <a class="pl2-back" href="/plans" ${D('pl2.back')}></a>
 <h1 id="pl2_title" style="margin-top:10px"></h1><p class="lead" ${D('pl2.sub')}></p>
 <div class="pqr-banner" id="pl2_banner" style="display:none"><p ${D('pl2.sample')}></p><div class="cta"><a class="btn sm" href="/connect" ${D('nav.connect')}></a></div></div>
 <p class="pl2-fn" id="pl2_src" style="margin:10px 0 0"></p>
 <div class="result" id="pl2_result" style="margin-top:18px"></div>
 <div id="pl2_fam" style="display:none;margin-top:18px"></div>
 <div id="pl2_sav"></div>
 <div class="card pl2-up"><span class="pl2-ubadge" ${D('pl2.up.badge')}></span><h2 ${D('pl2.up.h')}></h2><p ${D('pl2.up.p')}></p><ul>${bullets}</ul>
  <div id="pl2_sub"></div><p class="pl2-fn" style="margin-top:12px" ${D('pl2.up.note')}></p></div>
</div></section></main><script src="/js/pricing.js"></script><script src="/js/plan-result.js"></script>`, `document.querySelectorAll('[data-ic]').forEach(e=>e.innerHTML=PC_ICON(e.dataset.ic));`];

  // ---------------- PRICING PAGE (how-pricing-works): base premiums + Premium pricing (Monthly / Yearly) ----------------
  {
    const [ht, hd, hb, hj] = pages['how-pricing-works'];
    const base = `<h2 style="margin-top:44px" ${D('pp.base.h')}></h2><p class="mute" ${D('pp.base.p')}></p>
 <div class="pp-base"><div class="card"><b>RM${PRICING.CONFIG.base.individual.toLocaleString('en-US')}</b><span ${D('pp.base.ind')}></span></div><div class="card"><b>RM${PRICING.CONFIG.base.family.toLocaleString('en-US')}</b><span ${D('pp.base.fam')}></span></div><div class="card"><b ${D('pp.base.custom')}></b><span ${D('pp.base.biz')}></span></div></div>
 <h2 style="margin-top:44px" id="premium-pricing" ${D('pp.h')}></h2><p class="mute" ${D('pp.sub')}></p>
 <div class="pp-grid" id="pp_grid"></div><p class="fnote" style="margin-top:14px" ${D('pp.cancel')}></p>
 `;
    const hb2 = hb.replace('<div class="cta"><a class="btn" href="/calculator"', base + '<div class="cta"><a class="btn" href="/calculator"');
    const js = hj + `
function ppDraw(){const S=window.PC_SUB,st=PC.sub.state(),prem=st.tier==='premium';const feats=['sb.f1','sb.f2','sb.f3','sb.f4'].map(k=>'<li>'+PC.t(k)+'</li>').join('');
 const card=(b)=>{const y=b==='yearly';return '<div class="card pp-card'+(y?' hl':'')+'">'+(y?'<div class="sb-tags"><span class="sb-save">'+PC.t('sb.save')+'</span><span class="sb-best">'+PC.t('sb.best')+'</span></div>':'')+'<h3>'+PC.t(y?'sb.yearly':'sb.monthly')+'</h3>'+(y?'<div class="sb-amt"><b>RM'+PC.fmt(S.yearly,0)+'</b><span>/'+PC.t('sb.yr')+'</span><s>RM'+PC.fmt(S.monthlyTotal)+'/'+PC.t('sb.yr')+'</s></div><p class="mute">'+PC.t('sb.eff')+'</p>':'<div class="sb-amt"><b>RM'+PC.fmt(S.monthly)+'</b><span>/'+PC.t('sb.mo')+'</span></div><p class="mute">'+PC.t('sb.hint')+'</p>')+'<ul>'+feats+'</ul>'+(prem?'<a class="btn ghost" href="/dashboard#premium">'+PC.t('sb.mg.h')+'</a>':'<button class="btn'+(y?'':' ghost')+'" data-pp="'+b+'">'+PC.t('pp.sub.btn')+' - '+PC.sub.label(b)+'</button>')+'</div>'};
 document.getElementById('pp_grid').innerHTML=card('monthly')+card('yearly');document.querySelectorAll('[data-pp]').forEach(x=>x.onclick=()=>PC.sub.open(x.dataset.pp,{}))}
ppDraw();window.addEventListener('pc:sub',ppDraw);window.addEventListener('pc:lang',ppDraw);`;
    pages['how-pricing-works'] = [ht, hd, hb2, js];
  }

  // ---------------- DASHBOARD: Overview / Premium tabs (manage subscription) ----------------
  {
    let [dt, dd, db, dj] = pages['dashboard'];
    db = db.replace('</h1>', `</h1>
 <div class="rw2-tabs" id="dtabs" role="group"><button type="button" class="on" data-dt="ov" aria-pressed="true" ${D('db.ov')}></button><button type="button" data-dt="pm" aria-pressed="false" ${D('db.prem')}></button></div>
 <div id="dprem" style="display:none"><h2 style="margin:6px 0 14px" ${D('db.prem.h')}></h2><div id="dprem_host" style="max-width:640px"></div></div>`);
    dj += `
(function(){const w=document.querySelector('main .wrap');const set=(k)=>{w.classList.toggle('dprem-on',k==='pm');document.getElementById('dprem').style.display=k==='pm'?'':'none';document.querySelectorAll('[data-dt]').forEach(b=>{const on=b.dataset.dt===k;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});if(k==='pm')history.replaceState(null,'','#premium');else history.replaceState(null,'',location.pathname)};
 document.querySelectorAll('[data-dt]').forEach(b=>b.onclick=()=>set(b.dataset.dt));PC.sub.manage(document.getElementById('dprem_host'));if(location.hash==='#premium')set('pm')})();`;
    pages['dashboard'] = [dt, dd, db, dj];
  }

  // ---------------- /invite/[token]: accept or decline a family invite ----------------
  pages['invite'] = ['Family invite', 'Accept or decline an invite to a PulseCover family plan.', `
<main><section class="sec"><div class="wrap" style="max-width:560px"><div class="card" id="iv_box" aria-live="polite"><p ${D('iv.loading')}></p></div></div></section></main>`, `
(function(){
 const parts=location.pathname.split('/').filter(Boolean),token=parts[1]||'',wantDecline=/[?&]decline=1/.test(location.search);
 const box=document.getElementById('iv_box'),T=(k,o)=>{let s=PC.t(k);if(o)for(const x in o)s=s.split('{'+x+'}').join(o[x]);return s};
 let info=null,state='load',err='';
 const fdate=(iso)=>new Date(iso).toLocaleDateString(PC.lang==='zh'?'zh-CN':PC.lang==='ms'?'ms-MY':PC.lang==='ta'?'ta-IN':'en-MY',{day:'numeric',month:'long',year:'numeric'});
 function draw(){
  if(state==='load'){box.innerHTML='<p>'+T('iv.loading')+'</p>';return}
  if(state==='bad'){const k=info&&info.reason==='expired'?'iv.bad.expired':info&&info.reason==='invalid'?'iv.bad.invalid':'iv.bad.used';box.innerHTML='<h2>'+T('iv.bad.h')+'</h2><p>'+T(k)+'</p><div class="cta"><a class="btn" href="/">'+T('iv.home')+'</a></div>';return}
  if(state==='ok'){box.innerHTML='<div class="sb-okic" aria-hidden="true">&#10003;</div><h2>'+T('iv.ok.h')+'</h2><p>'+T('iv.ok.p')+'</p><div class="cta"><a class="btn" href="/connect">'+T('iv.ok.link')+'</a><a class="btn ghost" href="/dashboard">'+T('iv.ok.dash')+'</a></div>';return}
  if(state==='declined'){box.innerHTML='<h2>'+T('iv.dec.h')+'</h2><p>'+T('iv.dec.p')+'</p><div class="cta"><a class="btn" href="/">'+T('iv.home')+'</a></div>';return}
  const rel=T('fm.rel.'+info.relationship).toLowerCase();
  box.innerHTML='<h2 style="margin-top:0">'+T('iv.h',{n:PC.esc(info.inviter)})+'</h2><p>'+T('iv.rel',{r:PC.esc(rel)})+'</p><p>'+T('iv.what')+'</p><div class="pqr-banner" style="margin:14px 0"><p><b>'+T('iv.share')+'</b></p></div>'+
   (PC.user?'':'<p class="fnote">'+T('iv.signin')+'</p>')+(err?'<div class="msg err">'+PC.esc(err)+'</div>':'')+
   '<div class="cta">'+(PC.user?'<button class="btn" id="iv_ok"'+(wantDecline?' style="opacity:.85"':'')+'>'+T('iv.accept')+'</button>':'<a class="btn" href="/account?next='+encodeURIComponent('/invite/'+token)+'">'+T('iv.login')+' / '+T('iv.signup')+'</a>')+'<button class="btn ghost" id="iv_no">'+T('iv.decline')+'</button></div><p class="fnote" style="margin-top:14px">'+T('iv.expires',{d:fdate(info.expiresAt)})+'</p>';
  const ok=document.getElementById('iv_ok'),no=document.getElementById('iv_no');
  if(ok)ok.onclick=async()=>{ok.disabled=true;err='';try{await PC.api('/invite/accept',{token});state='ok'}catch(e){err=e.message||T('iv.err')}draw()};
  no.onclick=async()=>{no.disabled=true;err='';try{await PC.api('/invite/decline',{token});state='declined'}catch(e){err=e.message||T('iv.err')}draw()};
  if(wantDecline){no.focus()}
 }
 PC.ready.then(async()=>{try{info=await PC.api('/invite/info',{token});state=info.valid?'ready':'bad'}catch(e){info={reason:'invalid'};state='bad'}draw()});
 window.addEventListener('pc:lang',draw);
})();`];
};
