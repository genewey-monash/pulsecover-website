// v7: gamified Streaks and Rewards, and Campaigns (opt-in insurer and brand challenges).
module.exports = (pages, D) => {
  pages['rewards'] = ['Streaks and rewards', 'Build a streak and unlock coupons from healthy brands.', `
<main><section class="sec"><div class="wrap" style="max-width:980px">
 <span class="kicker" ${D('nav.rewards')}></span><h1 ${D('rw.h1')}></h1><p class="lead" ${D('rw.sub')}></p>
 <div class="card" id="rwlogin" style="display:none;margin-top:18px"><p ${D('rw.login')}></p><div class="cta"><a class="btn" href="/account?next=/rewards" ${D('nav.login')}></a><a class="btn ghost" href="/connect" ${D('nav.connect')}></a></div></div>
 <div id="rwbox" style="display:none;margin-top:18px">
  <div class="cards c3" id="rwstats"></div>
  <p class="fnote" style="margin:10px 0 0" ${D('rw.rule')}></p>
  <div class="card" id="rwnext" style="margin-top:16px"></div>
  <h2 style="margin-top:34px" ${D('rw.coupons')}></h2><div class="cards c2" id="rwcoupons" style="margin-top:12px"></div>
  <h2 style="margin-top:34px" ${D('rw.ach')}></h2><div id="rwach" style="display:flex;flex-wrap:wrap;gap:10px;margin-top:12px"></div>
  <p class="fnote" style="margin-top:22px" ${D('rw.note')}></p><p class="fnote" ${D('rw.demo')}></p>
 </div>
</div></section></main>`, `
let R=null;
const bar=(v,max)=>'<div style="height:8px;border-radius:5px;background:var(--line);margin-top:10px;overflow:hidden"><div style="height:100%;width:'+Math.max(4,Math.min(100,v/max*100))+'%;background:var(--red)"></div></div>';
function draw(){ if(!R) return; const t=PC.t;
 document.getElementById('rwstats').innerHTML=
  '<div class="card"><small style="color:var(--mute)">'+t('rw.streak')+'</small><div style="font-size:2.2rem;font-weight:800;color:var(--red)">'+R.streak+' <span style="font-size:1rem;color:var(--mute)">'+t('rw.days')+'</span></div></div>'+
  '<div class="card"><small style="color:var(--mute)">'+t('rw.best')+'</small><div style="font-size:2.2rem;font-weight:800">'+R.best+' <span style="font-size:1rem;color:var(--mute)">'+t('rw.days')+'</span></div></div>'+
  '<div class="card"><small style="color:var(--mute)">'+t('rw.level')+'</small><div style="font-size:2.2rem;font-weight:800">'+t('lv.'+R.level)+'</div></div>';
 document.getElementById('rwnext').innerHTML=R.next?'<b>'+t('rw.next')+':</b> '+t('cp.'+R.next.id+'.h')+' &middot; '+R.next.left+' '+t('rw.left')+bar(R.best,R.next.min):'<b>&#10003; '+t('rw.unlocked')+'</b>';
 document.getElementById('rwcoupons').innerHTML=R.coupons.map(c=>'<div class="card" style="'+(c.unlocked?'':'opacity:.78')+'"><div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start"><div><b>'+t('cp.'+c.id+'.h')+'</b><p style="margin:4px 0 0;color:var(--mute)">'+t('cp.'+c.id+'.p')+'</p></div><span class="chip">'+(c.unlocked?'&#10003; '+t('rw.unlocked'):c.min+' '+t('rw.days'))+'</span></div>'+
  (c.unlocked?'<div style="margin-top:12px;display:flex;gap:10px;align-items:center;flex-wrap:wrap"><small style="color:var(--mute)">'+t('rw.code')+'</small><code style="font-weight:800;letter-spacing:.06em;padding:6px 10px;border-radius:8px;background:var(--red-t);color:var(--ink)">'+c.code+'</code><button class="btn ghost sm" data-copy="'+c.code+'">'+t('rw.copy')+'</button></div>':'<div style="margin-top:10px;color:var(--mute);font-size:.9rem">'+t('rw.locked')+' '+c.min+' '+t('rw.days')+bar(R.best,c.min)+'</div>')+'</div>').join('');
 document.getElementById('rwach').innerHTML=R.achievements.map(a=>'<span class="chip" style="padding:10px 14px;'+(a.done?'background:var(--red);color:#fff':'opacity:.6')+'">'+(a.done?'&#10003; ':'')+t('ach.'+a.id)+'</span>').join('');
 document.querySelectorAll('[data-copy]').forEach(b=>b.onclick=()=>{try{navigator.clipboard.writeText(b.dataset.copy)}catch(e){}b.textContent=PC.t('rw.copied')});
}
PC.ready.then(async()=>{ if(!PC.user){document.getElementById('rwlogin').style.display='';return}
 document.getElementById('rwbox').style.display='';
 try{R=await PC.api('/rewards');draw()}catch(e){} });
window.addEventListener('pc:lang',draw);`];

  pages['campaigns'] = ['Campaigns', 'Optional challenges and offers from our partners.', `
<main><section class="sec"><div class="wrap" style="max-width:980px">
 <span class="kicker" ${D('nav.campaigns')}></span><h1 ${D('cm.h1')}></h1><p class="lead" ${D('cm.sub')}></p>
 <div class="cards c2" id="cmlist" style="margin-top:18px"></div>
 <p class="fnote" style="margin-top:20px" ${D('cm.privacy')}></p><p class="fnote" ${D('rw.demo')}></p>
</div></section></main>`, `
let L=[];
const KIND={insurer:'cm.insurer',brand:'cm.brand',watch:'cm.watch'};
function draw(){ const t=PC.t;
 document.getElementById('cmlist').innerHTML=L.map(c=>{
  const prog=c.joined&&c.target?'<div style="margin-top:10px"><small style="color:var(--mute)">'+c.progress+' / '+c.target+' '+t('cm.progress')+'</small><div style="height:8px;border-radius:5px;background:var(--line);margin-top:6px;overflow:hidden"><div style="height:100%;width:'+Math.max(4,c.progress/c.target*100)+'%;background:var(--red)"></div></div></div>':'';
  let act;
  if(c.kind==='watch') act='<span class="chip">'+t('cm.soon')+'</span>';
  else if(!PC.user) act='<a class="btn sm" href="/account?next=/campaigns">'+t('cm.login')+'</a>';
  else if(c.completed) act='<span class="chip" style="background:var(--red);color:#fff">&#10003; '+t('cm.done')+'</span>';
  else if(c.joined) act='<span class="chip">'+t('cm.joined')+'</span> <button class="btn ghost sm" data-leave="'+c.id+'">'+t('cm.leave')+'</button>';
  else act='<button class="btn sm" data-join="'+c.id+'">'+t('cm.join')+'</button>';
  return '<div class="card"><span class="chip" style="background:var(--red-t);color:var(--ink);font-weight:700">'+t(KIND[c.kind])+'</span><h3 style="margin:10px 0 6px">'+t('cm.'+c.id+'.h')+'</h3><p style="margin:0;color:var(--mute)">'+t('cm.'+c.id+'.p')+'</p>'+prog+'<div style="margin-top:14px;display:flex;gap:10px;align-items:center;flex-wrap:wrap">'+act+'</div></div>'}).join('');
 document.querySelectorAll('[data-join]').forEach(b=>b.onclick=async()=>{b.disabled=true;try{L=(await PC.api('/campaigns/join',{id:b.dataset.join})).campaigns}catch(e){}draw()});
 document.querySelectorAll('[data-leave]').forEach(b=>b.onclick=async()=>{b.disabled=true;try{L=(await PC.api('/campaigns/leave',{id:b.dataset.leave})).campaigns}catch(e){}draw()});
}
PC.ready.then(async()=>{try{L=await PC.api('/campaigns')}catch(e){}draw()});
window.addEventListener('pc:lang',draw);`];

  // ---- Premium Quote: dedicated highlighted band on the home page, right below the benefits grid ----
  const ROWS = ['r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8'];
  const premiumBand = `<section class="sec red premsec" id="premium"><div class="wrap"><div class="cards c2" style="gap:40px;align-items:center">
 <div><span class="kicker" style="color:#FFD9E0" ${D('pq.kicker')}></span><h2 ${D('pq.h')}></h2><p class="lead" ${D('pq.p')}></p>
  <ul class="premlist"><li ${D('pq.b1')}></li><li ${D('pq.b2')}></li><li ${D('pq.b3')}></li><li ${D('pq.b4')}></li></ul>
  <div class="cta"><a class="btn light" href="/premium" ${D('pq.cta')}></a><a class="btn outl-w" href="/calculator" ${D('pq.try')}></a></div></div>
 <div class="premcard"><small ${D('pq.col.premium')}></small><div class="premprice">RM14.90</div><p ${D('pq.price.note')}></p><div class="premfree"><b ${D('pq.col.free')}></b> &middot; <span ${D('pq.r3')}></span></div></div>
</div></div></section>`;
  let [it, id, ib, ij] = pages['index'];
  const at = ib.indexOf('home.ben.h'); const nx = ib.indexOf('<section', at);
  if (at > -1 && nx > -1) ib = ib.slice(0, nx) + premiumBand + '\n' + ib.slice(nx);
  pages['index'] = [it, id, ib, ij];

  // ---- Free vs Premium comparison page ----
  const cell = (yes) => (yes ? `<span class="pq-y" role="img" aria-label="Included">&#10003;</span>` : `<span class="pq-n" role="img" aria-label="Not included">&ndash;</span>`);
  const rowHtml = ROWS.map((r, i) => `<tr><th scope="row" ${D('pq.' + r)}></th><td class="c">${cell(true)}</td><td class="c prem">${cell(true)}</td></tr>`.replace(/<td class="c">(.*?)<\/td><td class="c prem">/, (m, g) => `<td class="c">${cell(i < 4)}</td><td class="c prem">`)).join('');
  pages['premium'] = ['Premium Quote', 'Free versus Premium Quote: what is included.', `
<main><section class="sec"><div class="wrap" style="max-width:920px">
 <span class="kicker" ${D('nav.premium')}></span><h1 ${D('pq.h')}></h1><p class="lead" ${D('pq.p')}></p>
 <div class="scroll" style="margin-top:26px"><table class="tbl pqt"><thead><tr><th ${D('pq.col.feature')}></th><th class="c" ${D('pq.col.free')}></th><th class="c prem" ${D('pq.col.premium')}></th></tr></thead><tbody>
  <tr><th scope="row" ${D('pq.r.price')}></th><td class="c"><b ${D('pq.v.free')}></b></td><td class="c prem"><b ${D('pq.v.premium')}></b></td></tr>
  ${rowHtml}
  <tr class="ctarow"><td></td><td class="c"><a class="btn ghost sm" href="/connect" ${D('pq.free.cta')}></a></td><td class="c prem"><a class="btn sm" href="/calculator" ${D('pq.premium.cta')}></a></td></tr>
 </tbody></table></div>
 <p class="fnote" style="margin-top:18px" ${D('pq.note')}></p>
</div></section></main>`, ''];
};
