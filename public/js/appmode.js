/* PulseCover app mode (phone / installed web app): bottom tab bar, back button, search "Cancel", feedback link in footer. */
(function () {
  'use strict';
  var root = document.documentElement;
  var path = location.pathname.replace(/\/+$/, '') || '/';
  var TABS = [
    { href: '/', key: 'nav.home', icon: 'home', match: ['/'] },
    { href: '/plans', key: 'nav.plans', icon: 'shield', match: ['/plans', '/compare', '/calculator', '/apply', '/how-pricing-works'] },
    { href: '/connect', key: 'nav.connect', icon: 'watch', match: ['/connect'], mid: true },
    { href: '/claims', key: 'nav.claims', icon: 'file', match: ['/claims'] },
    { href: '/account', key: 'nav.account', icon: 'user', match: ['/account', '/dashboard', '/profile'], acct: true }
  ];
  var HOME = '<path d="M3.5 11L12 4l8.5 7v8.5a1 1 0 0 1-1 1h-4.5v-6h-6v6H4.5a1 1 0 0 1-1-1V11z"/>';
  var BACK = '<path d="M15 5l-7 7 7 7"/>';
  var svg = function (p) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>'; };
  var t = function (k, fb) { try { var v = window.PC && PC.t ? PC.t(k) : k; return v && v !== k ? v : fb; } catch (e) { return fb; } };
  var active = function (m) { return m.indexOf(path) !== -1; };

  function build() {
    if (document.getElementById('tabbar')) return;
    var nav = document.createElement('nav'); nav.className = 'tabbar'; nav.id = 'tabbar'; nav.setAttribute('aria-label', 'App');
    var P = window.PC_ICON_PATHS || {};
    nav.innerHTML = TABS.map(function (x) {
      var p = x.icon === 'home' ? HOME : (P[x.icon] || '');
      return '<a href="' + x.href + '" class="' + (x.mid ? 'mid ' : '') + (active(x.match) ? 'on' : '') + '"' + (x.acct ? ' id="tabacct"' : '') + ' data-k="' + x.key + '">' + svg(p) + '<span></span></a>';
    }).join('');
    document.body.appendChild(nav);
    label();
  }
  var FALLBACK = { 'nav.home': 'Home', 'nav.plans': 'Plans', 'nav.connect': 'Wearable', 'nav.claims': 'Claims', 'nav.account': 'Account' };
  var SHORT = { 'nav.connect': 'tab.wearable', 'nav.account': 'tab.account' };
  function label() {
    var nav = document.getElementById('tabbar'); if (!nav) return;
    nav.querySelectorAll('a').forEach(function (a) {
      var k = a.getAttribute('data-k'), s = a.querySelector('span');
      var v = SHORT[k] ? t(SHORT[k], '') : '';
      s.textContent = v || (k === 'nav.account' ? t('nav.dash', FALLBACK[k]) : t(k, FALLBACK[k]));
      if (k === 'nav.connect') s.textContent = t('tab.wearable', 'Wearable');
      if (k === 'nav.account') s.textContent = t('tab.account', 'Account');
    });
  }

  function chrome() {
    var bar = document.querySelector('header.top .bar');
    if (bar && !document.getElementById('apback') && !TABS.some(function (x) { return x.match.indexOf(path) !== -1 && x.href === path; }) && path !== '/') {
      var b = document.createElement('button'); b.className = 'apback'; b.id = 'apback'; b.setAttribute('aria-label', 'Back'); b.innerHTML = svg(BACK);
      b.addEventListener('click', function () { if (history.length > 1 && document.referrer.indexOf(location.host) !== -1) history.back(); else location.href = '/'; });
      bar.insertBefore(b, bar.firstChild);
    }
    var box = document.querySelector('.spanel .wrap > div.sbox') || document.querySelector('.sbox');
    if (box && !document.getElementById('apcancel')) {
      var c = document.createElement('button'); c.className = 'apcancel'; c.id = 'apcancel'; c.type = 'button'; c.textContent = t('tab.cancel', 'Cancel');
      c.addEventListener('click', function (e) { e.stopPropagation(); if (window.PC && PC.closeSearch) PC.closeSearch(); });
      box.parentNode.insertBefore(c, box.nextSibling);
    }
    var fb = document.getElementById('fbtab'), reg = document.querySelector('footer .reg');
    if (fb && reg && !document.getElementById('apfeedback')) {
      var f = document.createElement('button'); f.className = 'apfeedback'; f.id = 'apfeedback'; f.type = 'button'; f.textContent = fb.textContent || 'Feedback';
      f.addEventListener('click', function () { fb.click(); });
      reg.parentNode.insertBefore(f, reg);
    }
    var logo = document.querySelector('header.top .logo-img'); if (logo && logo.getAttribute('src') !== '/img/logo-mark-t.png') logo.setAttribute('src', '/img/logo-mark-t.png');
  }

  function acctLink() {
    var a = document.getElementById('tabacct'); if (!a) return;
    var go = function () { a.setAttribute('href', window.PC && PC.user ? '/dashboard' : '/account'); };
    if (window.PC && PC.ready && PC.ready.then) PC.ready.then(go); else go();
  }

  function start() {
    if (!root.classList.contains('appmode')) { window.addEventListener('resize', function once() { if (root.classList.contains('appmode')) { window.removeEventListener('resize', once); start(); } }); return; }
    build(); chrome(); acctLink();
    window.addEventListener('pc:lang', label);
    if (window.PC && PC.ready && PC.ready.then) PC.ready.then(function () { label(); chrome(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(start, 0); }); else setTimeout(start, 0);
})();
