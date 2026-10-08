// v6: app download page (APK served by this same server).
module.exports = (pages, D) => {
  pages['app'] = ['Get the app', 'Download the PulseCover Android app.', `
<main><section class="sec"><div class="wrap" style="max-width:920px"><div class="dlgrid">
 <div><h1 ${D('dl.h1')}></h1><p class="lead" ${D('dl.sub')}></p>
  <div class="card dlcard" id="dlbox"><div class="dlhead"><img src="/img/logo-mark.png" alt="" width="64" height="64"><div><b>PulseCover</b><small id="dlmeta"></small></div></div>
   <a class="btn" id="dlbtn" href="/download/pulsecover.apk" download ${D('dl.btn')}></a><p class="fnote" id="dlreq" ${D('dl.req')}></p><p class="fhelp" id="dlnone" ${D('dl.none')}></p></div>
  <h3 style="margin-top:28px" ${D('dl.steps')}></h3>
  <ol class="tysteps"><li ${D('dl.s1')}></li><li ${D('dl.s2')}></li><li ${D('dl.s3')}></li></ol>
  <div class="card" style="margin-top:22px"><h3 ${D('dl.ios')}></h3><p ${D('dl.ios.p')}></p></div></div>
 <div class="qrbox card"><div id="qr" aria-hidden="true"></div><p class="fnote" style="text-align:center" ${D('dl.scan')}></p></div>
</div></div></section></main><script src="/js/qrcode.js"></script>`, `
(function(){var url=location.origin+'/download/pulsecover.apk';
 try{var q=qrcode(0,'M');q.addData(url);q.make();document.getElementById('qr').innerHTML=q.createSvgTag({cellSize:6,margin:2,scalable:true})}catch(e){}
 fetch('/download/version.json',{cache:'no-store'}).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(v){
  function paint(){document.getElementById('dlmeta').textContent=PC.t('dl.ver')+' '+v.version+' \u00b7 '+PC.t('dl.size')+' '+v.sizeMB+' MB'}
  PC.ready.then(paint);window.addEventListener('pc:lang',paint)}).catch(function(){document.getElementById('dlbtn').style.display='none';document.getElementById('dlreq').style.display='none';document.getElementById('dlnone').classList.add('on')});
})();`];
};
