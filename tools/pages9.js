// v9: plan result view. Plan selection (Products > Plans > Get Quote) lands here, never in the Premium Calculator.
module.exports = (pages, D) => {
  const bullets = [['shield', 1], ['file', 2], ['gift', 3]].map(([ic, i]) => `<li><span class="ic" data-ic="${ic}"></span><span ${D('pl2.up.b' + i)}></span></li>`).join('');
  pages['plan-result'] = ['Plan quote', 'Your wearable-adjusted premium for the plan you chose.', `
<main class="pl2"><section class="sec"><div class="wrap" style="max-width:760px">
 <a class="pl2-back" href="/plans" ${D('pl2.back')}></a>
 <h1 id="pl2_title" style="margin-top:10px"></h1><p class="lead" ${D('pl2.sub')}></p>
 <div class="pqr-banner" id="pl2_banner" style="display:none"><p ${D('pl2.sample')}></p><div class="cta"><a class="btn sm" href="/connect" ${D('nav.connect')}></a></div></div>
 <p class="pl2-fn" id="pl2_src" style="margin:10px 0 0"></p>
 <div class="result" id="pl2_result" style="margin-top:18px"></div>
 <div class="card pl2-up"><span class="pl2-ubadge" ${D('pl2.up.badge')}></span><h2 ${D('pl2.up.h')}></h2><p ${D('pl2.up.p')}></p><ul>${bullets}</ul>
  <p class="pl2-price" ${D('pl2.up.price')}></p><a class="btn" id="pl2_up" href="/premium-quote" ${D('pl2.up.cta')}></a><p class="pl2-fn" style="margin-top:12px" ${D('pl2.up.note')}></p></div>
</div></section></main><script src="/js/pricing.js"></script><script src="/js/plan-result.js"></script>`, `document.querySelectorAll('[data-ic]').forEach(e=>e.innerHTML=PC_ICON(e.dataset.ic));`];
};
