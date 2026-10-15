// v6: install page. QR code -> web app link -> Add to Home Screen (web app approach, hosted on Vercel).
module.exports = (pages, D) => {
  pages['app'] = ['Get the app', 'Open PulseCover as a web app on your phone, or download the Android app.', `
<main><section class="sec"><div class="wrap" style="max-width:920px"><div class="dlgrid">
 <div><h1 ${D('dl.h1')}></h1><p class="lead" ${D('dl.sub')}></p>
  <div class="card dlcard"><div class="dlhead"><img src="/img/logo-mark.png" alt="" width="64" height="64"><div><b ${D('dl.web.h')}></b><small ${D('dl.web.p')}></small></div></div>
   <div class="cta"><a class="btn" href="/" ${D('dl.web.btn')}></a><button class="btn ghost" id="pwa-install" type="button" style="display:none" ${D('dl.web.add')}></button></div>
   <ol class="tysteps" style="margin-top:16px"><li ${D('dl.web.ios')}></li><li ${D('dl.web.and')}></li></ol></div>
  </div>
 <div class="qrbox card"><div id="qr" aria-hidden="true"></div><p class="fnote" style="text-align:center" ${D('dl.scan')}></p></div>
</div></div></section></main><script src="/js/qrcode.js"></script>`, `
(function(){var url=location.origin+'/';
 try{var q=qrcode(0,'M');q.addData(url);q.make();document.getElementById('qr').innerHTML=q.createSvgTag({cellSize:6,margin:2,scalable:true})}catch(e){}
})();`];
};
