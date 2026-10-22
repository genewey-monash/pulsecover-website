// v7: gamified Streaks and Rewards, and Campaigns (opt-in insurer and brand challenges).
module.exports = (pages, D) => {
  pages['rewards'] = ['Streaks and rewards', 'Build streaks, earn badges and unlock rewards from healthy brands.', `
<main id="rw2_page" class="rw2"><section class="sec"><div class="wrap" style="max-width:1040px">
 <span class="kicker" ${D('nav.rewards')}></span><h1 ${D('rw.h1')}></h1><p class="lead" ${D('rw.sub')}></p>
 <div class="rw2-banner" id="rw2_banner" style="display:none"><p ${D('rw2.samplebanner')}></p><div class="cta"><a class="btn sm" href="/connect" ${D('nav.connect')}></a><a class="btn ghost sm" href="/account?next=/rewards" ${D('nav.login')}></a></div></div>
 <div class="card rw2-player" id="rw2_player"></div>
 <p class="rw2-fn" ${D('rw2.note')}></p>

 <h2 class="rw2-h" ${D('rw2.q.h')}></h2><p class="mute" ${D('rw2.q.p')}></p>
 <div id="rw2_quests"></div><p class="rw2-fn" ${D('rw2.safe')}></p>

 <h2 class="rw2-h" ${D('rw2.s.h')}></h2>
 <div class="cards c2 rw2-sgrid" id="rw2_streak"></div><div id="rw2_ms"></div>

 <h2 class="rw2-h" ${D('rw2.b.h')}></h2><p class="mute" ${D('rw2.b.p')}></p>
 <div id="rw2_next"></div>
 <div class="rw2-tabs" id="rw2_bf" role="group"></div>
 <div class="rw2-bgrid" id="rw2_badges"></div>
 <h3 class="rw2-sub" ${D('rw2.b.hist')}></h3><div class="card rw2-hist" id="rw2_hist"></div>

 <h2 class="rw2-h" ${D('rw2.l.h')}></h2>
 <div class="card"><ol class="rw2-lv" id="rw2_levels"></ol></div>
 <details class="rw2-xp"><summary ${D('rw2.xp.h')}></summary><ul id="rw2_xpl"></ul></details>

 <h2 class="rw2-h" ${D('rw2.v.h')}></h2><p class="mute" ${D('rw2.v.p')}></p>
 <div class="rw2-tabs" id="rw2_vt" role="group"></div>
 <div class="cards c3 rw2-vgrid" id="rw2_vault"></div>
 <p class="rw2-fn" ${D('rw.note')}></p><p class="rw2-fn" ${D('rw.demo')}></p>

 <div class="cards c2 rw2-soc" id="rw2_ref"></div>
 <div class="card rw2-up" id="rw2_upgrade"><div><h3 ${D('rw2.up.h')}></h3><p ${D('rw2.up.p')}></p></div><a class="btn" href="/premium-quote" ${D('rw2.up.cta')}></a></div>
 <p class="rw2-fn" ${D('rw2.noprem')}></p>
</div></section>
<div class="rw2-toast" id="rw2_toast" role="status" aria-live="polite"></div><div class="rw2-pop" id="rw2_pop" role="status" aria-live="polite"></div><div class="rw2-conf" id="rw2_conf" aria-hidden="true"></div>
</main><script src="/js/partner-icons.js"></script><script src="/js/rewards-catalog.js"></script><script src="/js/rewards.js"></script>`, ''];

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

  // ---- Premium Subscription: dedicated highlighted band on the home page, right below the benefits grid ----
  const ROWS = ['r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8'];
  const premiumBand = `<section class="sec red premsec" id="premium"><div class="wrap"><div class="cards c2" style="gap:40px;align-items:center">
 <div><span class="kicker" style="color:#FFD9E0" ${D('pq.kicker')}></span><h2 ${D('pq.h')}></h2><p class="lead" ${D('pq.p')}></p>
  <ul class="premlist"><li ${D('pq.b1')}></li><li ${D('pq.b2')}></li><li ${D('pq.b3')}></li><li ${D('pq.b4')}></li></ul>
  <div class="cta"><a class="btn light" href="/premium" ${D('pq.cta')}></a><a class="btn outl-w" href="/premium-quote" ${D('pq.try')}></a></div></div>
 <div class="premcard"><small ${D('pq.col.premium')}></small><div class="premprice">RM14.90</div><p ${D('pq.price.note')}></p><div class="premfree"><b ${D('pq.col.free')}></b> &middot; <span ${D('pq.r3')}></span></div></div>
</div></div></section>`;
  let [it, id, ib, ij] = pages['index'];
  const at = ib.indexOf('home.ben.h'); const nx = ib.indexOf('<section', at);
  if (at > -1 && nx > -1) ib = ib.slice(0, nx) + premiumBand + '\n' + ib.slice(nx);
  pages['index'] = [it, id, ib, ij];

  // ---- Free vs Premium comparison page ----
  const cell = (yes) => (yes ? `<span class="pq-y" role="img" aria-label="Included">&#10003;</span>` : `<span class="pq-n" role="img" aria-label="Not included">&ndash;</span>`);
  const rowHtml = ROWS.map((r, i) => `<tr><th scope="row" ${D('pq.' + r)}></th><td class="c">${cell(true)}</td><td class="c prem">${cell(true)}</td></tr>`.replace(/<td class="c">(.*?)<\/td><td class="c prem">/, (m, g) => `<td class="c">${cell(i < 4)}</td><td class="c prem">`)).join('');
  pages['premium'] = ['Premium Subscription', 'Free versus Premium Subscription: what is included.', `
<main><section class="sec"><div class="wrap" style="max-width:920px">
 <span class="kicker" ${D('nav.premium')}></span><h1 ${D('pq.h')}></h1><p class="lead" ${D('pq.p')}></p>
 <div class="scroll" style="margin-top:26px"><table class="tbl pqt"><thead><tr><th ${D('pq.col.feature')}></th><th class="c" ${D('pq.col.free')}></th><th class="c prem" ${D('pq.col.premium')}></th></tr></thead><tbody>
  <tr><th scope="row" ${D('pq.r.price')}></th><td class="c"><b ${D('pq.v.free')}></b></td><td class="c prem"><b id="pq_price"></b></td></tr>
  ${rowHtml}
  <tr class="ctarow"><td></td><td class="c"><a class="btn ghost sm" href="/connect" ${D('pq.free.cta')}></a></td><td class="c prem"><a class="btn sm" href="/premium-quote" ${D('pq.premium.cta')}></a></td></tr>
 </tbody></table></div>
 <div class="card" style="margin-top:22px"><div id="pq_sub"></div></div>
 <p class="fnote" style="margin-top:18px" ${D('pq.note')}></p>
</div></section></main>`, `
function price(){var e=document.getElementById('pq_price');if(e)e.textContent=PC.sub.label(PC.sub.billing())}
price();window.addEventListener('pc:sub',price);window.addEventListener('pc:lang',price);
PC.sub.mount(document.getElementById('pq_sub'),{onUnlock:function(b){PC.sub.open(b,{})}});`];
};
