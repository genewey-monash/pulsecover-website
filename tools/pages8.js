// v8: Premium Quote Results page (/premium-quote). All logic lives in public/js/premium-quote.js and reuses the shared scoring engine (pricing.js).
module.exports = (pages, D) => {
  const faq = [1, 2, 3, 4].map((i) => `<details><summary ${D('pqr.faq.q' + i)}></summary><p ${D('pqr.faq.a' + i)}></p></details>`).join('');
  pages['premium-quote'] = ['Premium Quote Results', 'Your detailed assessment, savings scenarios, coaching plan and perks.', `
<main id="pqr_page" class="pqr"><section class="sec"><div class="wrap">
 <div class="pqr-top"><span class="pqr-badge" ${D('pqr.badge')}></span><a href="/calculator" class="pqr-back" ${D('pqr.back')}></a></div>
 <h1 ${D('pqr.h1')}></h1><p class="lead" ${D('pqr.lead')}></p>
 <div class="pqr-banner" id="pqr_banner" style="display:none"><p ${D('pqr.banner')}></p><div class="cta"><a class="btn sm" href="/connect" ${D('nav.connect')}></a><a class="btn ghost sm" href="/calculator" ${D('nav.calc')}></a></div></div>
 <div class="pqr-ctl"><label for="pqr_plan_sel" ${D('pqr.plan.lbl')}></label><select id="pqr_plan_sel"></select><span class="pqr-src" id="pqr_src"></span></div>
 <div class="card pqr-hero" id="pqr_hero" aria-live="polite"></div>

 <h2 class="pqr-h" ${D('pqr.s2.h')}></h2><p class="mute" ${D('pqr.s2.p')}></p>
 <div class="cards c4 pqr-factors" id="pqr_factors"></div>
 <div class="cards c2 pqr-pair"><div class="card" id="pqr_next"></div><div class="card" id="pqr_quality"></div></div>
 <div class="card pqr-trend"><div class="pqr-fh"><b ${D('pqr.tr.h')}></b><span class="pqr-tag" id="pqr_tr_tag" ${D('pqr.sample')}></span><div class="pqr-seg" id="pqr_tr_tog" role="group"><button type="button" data-d="30" ${D('pqr.tr.30')}></button><button type="button" data-d="90" ${D('pqr.tr.90')}></button></div></div><div id="pqr_trend"></div><p class="pqr-fn" ${D('pqr.tr.note')}></p></div>

 <h2 class="pqr-h" ${D('pqr.s3.h')}></h2><p class="mute" ${D('pqr.s3.p')}></p>
 <div class="card"><div class="scroll"><table class="tbl pqr-sv" id="pqr_sv"></table></div></div>
 <div class="cards c2 pqr-pair"><div class="card"><h3 ${D('pqr.s.chart')}></h3><div id="pqr_chart" class="pqr-bars"></div></div>
  <div class="card"><div class="pqr-fh"><h3 style="margin:0" ${D('pqr.w.h')}></h3><button type="button" class="btn ghost sm" id="pqr_wi_reset" ${D('pqr.w.reset')}></button></div><p class="mute" ${D('pqr.w.p')}></p><div id="pqr_wi"></div><div class="pqr-out" id="pqr_wi_out" aria-live="polite"></div></div></div>
 <p class="pqr-fn" ${D('pqr.s3.note')}></p>

 <h2 class="pqr-h" ${D('pqr.s4.h')}></h2><p class="mute" ${D('pqr.s4.p')}></p>
 <div class="pqr-ring" id="pqr_ring"></div>
 <div class="cards c2 pqr-plan" id="pqr_plan"></div>
 <div class="pqr-fh" style="margin-top:12px"><p class="pqr-fn" style="margin:0" ${D('pqr.s4.note')}></p><button type="button" class="btn ghost sm" id="pqr_plan_reset" ${D('pqr.p.restart')}></button></div>

 <h2 class="pqr-h" ${D('pqr.s5.h')}></h2><p class="mute" ${D('pqr.s5.p')}></p>
 <div class="cards c3 pqr-pols" id="pqr_pol"></div>
 <p class="pqr-fn" ${D('pqr.s5.note')}></p>

 <h2 class="pqr-h" ${D('pqr.s6.h')}></h2><p class="mute" id="pqr_perk_note"></p>
 <div class="cards c3 pqr-perks" id="pqr_perks"></div>
 <h3 style="margin-top:28px" ${D('pqr.ev.h')}></h3><div class="cards c3" id="pqr_events"></div>
 <p class="pqr-fn" ${D('rw.demo')}></p>

 <h2 class="pqr-h" ${D('pqr.s7.h')}></h2>
 <div class="card pqr-cta"><div><h3 ${D('pqr.cta.h')}></h3><p ${D('pqr.cta.p')}></p><div class="cta"><a class="btn" id="pqr_apply" href="/apply" ${D('calc.cta')}></a></div></div><div id="pqr_email"></div></div>
 <div class="pqr-faq">${faq}</div>
 <p class="pqr-fn" ${D('pqr.disc')}></p>
</div></section>
<div class="pqr-sticky"><a class="btn" id="pqr_apply2" href="/apply" ${D('pqr.sticky.apply')}></a><button type="button" class="btn ghost" id="pqr_mail" ${D('pqr.sticky.mail')}></button></div>
</main><script src="/js/partner-icons.js"></script><script src="/js/pricing.js"></script><script src="/js/premium-quote.js"></script>`, ''];
};
