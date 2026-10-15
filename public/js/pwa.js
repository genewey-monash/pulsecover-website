/* PulseCover: installable web app (Add to Home Screen). Registers the service worker, keeps the Android install prompt,
   and shows a small one-time "install" hint on phones. */
(function () {
  'use strict';
  var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  if ('serviceWorker' in navigator && location.protocol !== 'file:') window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function () {}); });
  var deferred = null, ua = navigator.userAgent || '';
  var isIOS = /iphone|ipad|ipod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var isAndroid = /android/i.test(ua);
  var T = {
    en: ['Install PulseCover on your phone', 'Install', 'Tap Share, then Add to Home Screen.', 'Not now'],
    zh: ['把 PulseCover 安装到手机', '安装', '点击“分享”，再选“添加到主屏幕”。', '以后再说'],
    ms: ['Pasang PulseCover pada telefon anda', 'Pasang', 'Ketik Kongsi, kemudian Tambah ke Skrin Utama.', 'Bukan sekarang'],
    ta: ['PulseCover-ஐ உங்கள் தொலைபேசியில் நிறுவுங்கள்', 'நிறுவு', 'பகிர் என்பதைத் தட்டி, முகப்புத் திரையில் சேர் என்பதைத் தேர்ந்தெடுக்கவும்.', 'பிறகு']
  };
  var lang = function () { try { var l = localStorage.getItem('pc_lang'); return T[l] ? l : 'en'; } catch (e) { return 'en'; } };
  var dismissed = function () { try { return localStorage.getItem('pc_pwa_dismiss') === '1'; } catch (e) { return false; } };

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); deferred = e;
    var b = document.getElementById('pwa-install'); if (b) b.style.display = '';
    banner();
  });
  window.addEventListener('appinstalled', function () { deferred = null; var b = document.getElementById('pwa-bar'); if (b) b.remove(); });
  window.pcInstall = function () { if (!deferred) return false; deferred.prompt(); deferred.userChoice.finally(function () { deferred = null; }); return true; };

  function banner() {
    if (standalone || dismissed() || document.getElementById('pwa-bar') || location.pathname === '/app') return;
    if (!(isIOS || deferred)) return;
    var t = T[lang()];
    var bar = document.createElement('div'); bar.id = 'pwa-bar'; bar.setAttribute('role', 'dialog');
    bar.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;background:var(--card,#fff);color:var(--ink,#26242F);border:1px solid var(--line,#E6E3E8);border-radius:16px;box-shadow:0 8px 30px rgba(0,0,0,.18);padding:12px 14px;display:flex;align-items:center;gap:12px;font:600 14px/1.35 Inter,system-ui,sans-serif';
    var img = '<img src="/img/icon-192.png" alt="" width="40" height="40" style="border-radius:10px;flex:none">';
    var txt = '<div style="flex:1;min-width:0"><div>' + t[0] + '</div>' + (deferred ? '' : '<div style="font-weight:500;color:var(--mute,#646273)">' + t[2] + '</div>') + '</div>';
    var btn = deferred ? '<button id="pwa-go" style="background:#B71234;color:#fff;border:0;border-radius:999px;padding:9px 16px;font:700 14px Inter,system-ui,sans-serif;cursor:pointer">' + t[1] + '</button>' : '';
    bar.innerHTML = img + txt + btn + '<button id="pwa-x" aria-label="' + t[3] + '" style="background:none;border:0;font-size:22px;line-height:1;color:var(--mute,#646273);cursor:pointer;padding:4px">×</button>';
    document.body.appendChild(bar);
    var close = function () { try { localStorage.setItem('pc_pwa_dismiss', '1'); } catch (e) {} bar.remove(); };
    bar.querySelector('#pwa-x').addEventListener('click', close);
    var go = bar.querySelector('#pwa-go'); if (go) go.addEventListener('click', function () { window.pcInstall(); bar.remove(); });
  }
  if (isIOS && !standalone) window.addEventListener('load', function () { setTimeout(banner, 2500); });
  window.addEventListener('load', function () {
    var b = document.getElementById('pwa-install');
    if (b) { b.style.display = deferred ? '' : 'none'; b.addEventListener('click', function () { window.pcInstall(); }); }
  });
})();
