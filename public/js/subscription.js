/* Premium subscription (DEMO): billing toggle, price block, subscribe flow, manage view and the "savings vs subscription" card.
   All prices come from the pricing config (window.PC_SUB, generated from pricing.js). No payment is taken and no card details are collected.
   State lives in localStorage under pc_sub (one object: tier, billing, startDate, renewalDate, status, pending). Pages listen for the "pc:sub" event. */
(function () {
  'use strict';
  var PC = window.PC, SUB = window.PC_SUB, KEY = 'pc_sub';
  if (!PC || !SUB) return;
  var T = function (k, o) { var s = PC.t(k); if (o) for (var x in o) s = s.split('{' + x + '}').join(o[x]); return s; };
  var esc = PC.esc;
  var rm = function (n, d) { return 'RM' + PC.fmt(n, d == null ? 2 : d); };
  var rm0 = function (n) { return 'RM' + PC.fmt(n, Number.isInteger(n) ? 0 : 2); };
  var iso = function (d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); };
  var today = function () { var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };
  var parse = function (s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); };
  var locale = function () { return PC.lang === 'zh' ? 'zh-CN' : PC.lang === 'ms' ? 'ms-MY' : PC.lang === 'ta' ? 'ta-IN' : 'en-MY'; };
  var fdate = function (s) { return parse(s).toLocaleDateString(locale(), { day: 'numeric', month: 'long', year: 'numeric' }); };
  var addPeriod = function (d, billing) { // one month or one year later, clamped to the end of a shorter month
    var y = d.getFullYear() + (billing === 'yearly' ? 1 : 0), m = d.getMonth() + (billing === 'yearly' ? 0 : 1), day = d.getDate();
    var last = new Date(y, m + 1, 0).getDate(); return new Date(y, m, Math.min(day, last));
  };
  function read() {
    var v = {}; try { v = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}
    var st = { tier: v.tier === 'premium' ? 'premium' : 'free', billing: v.billing === 'monthly' ? 'monthly' : 'yearly', startDate: v.startDate || null, renewalDate: v.renewalDate || null, status: v.status === 'cancelling' ? 'cancelling' : 'active', pending: v.pending === 'monthly' ? 'monthly' : null };
    var changed = false;
    if (st.tier === 'premium' && st.renewalDate) { // demo clock: renew or end when the renewal date has passed
      var guard = 0;
      while (st.tier === 'premium' && parse(st.renewalDate) <= today() && guard++ < 60) {
        if (st.status === 'cancelling') { st.tier = 'free'; st.startDate = null; st.renewalDate = null; st.status = 'active'; st.pending = null; }
        else { if (st.pending) { st.billing = st.pending; st.pending = null; } st.startDate = st.renewalDate; st.renewalDate = iso(addPeriod(parse(st.renewalDate), st.billing)); }
        changed = true;
      }
    }
    if (changed) write(st, true);
    return st;
  }
  function write(st, silent) { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} if (!silent) window.dispatchEvent(new CustomEvent('pc:sub')); }

  var sub = PC.sub = {
    state: read,
    isPremium: function () { return read().tier === 'premium'; },
    billing: function () { return read().billing; },
    setBilling: function (b) { var s = read(); if (s.tier === 'premium') return; s.billing = b === 'monthly' ? 'monthly' : 'yearly'; write(s); },
    subscribe: function (b) { var s = read(), t = today(); s.tier = 'premium'; s.billing = b === 'monthly' ? 'monthly' : 'yearly'; s.startDate = iso(t); s.renewalDate = iso(addPeriod(t, s.billing)); s.status = 'active'; s.pending = null; write(s); return s; },
    cancel: function () { var s = read(); if (s.tier !== 'premium') return; s.status = 'cancelling'; s.pending = null; write(s); },
    resume: function () { var s = read(); if (s.tier !== 'premium') return; s.status = 'active'; write(s); },
    upgradeToYearly: function () { var s = read(), t = today(); if (s.tier !== 'premium' || s.billing !== 'monthly') return; s.billing = 'yearly'; s.startDate = iso(t); s.renewalDate = iso(addPeriod(t, 'yearly')); s.pending = null; s.status = 'active'; write(s); },
    switchAtRenewal: function (on) { var s = read(); if (s.tier !== 'premium' || s.billing !== 'yearly') return; s.pending = on ? 'monthly' : null; write(s); },
    price: function (b) { return b === 'monthly' ? SUB.monthly : SUB.yearly; },
    annualCost: function (b) { return b === 'monthly' ? SUB.monthlyTotal : SUB.yearly; },
    label: function (b) { return b === 'monthly' ? rm(SUB.monthly) + '/' + T('sb.mo') : rm0(SUB.yearly) + '/' + T('sb.yr'); },
    fdate: fdate
  };

  /* ---------- toggle + price block ---------- */
  function toggleHTML(b) {
    return '<div class="sb-seg" role="group" aria-label="' + esc(T('sb.toggle.aria')) + '"><button type="button" data-b="monthly" class="' + (b === 'monthly' ? 'on' : '') + '" aria-pressed="' + (b === 'monthly') + '">' + T('sb.monthly') + '</button><button type="button" data-b="yearly" class="' + (b === 'yearly' ? 'on' : '') + '" aria-pressed="' + (b === 'yearly') + '">' + T('sb.yearly') + '<em>' + T('sb.save', {}) + '</em></button></div>';
  }
  function priceHTML(b) {
    if (b === 'yearly') return '<div class="sb-price"><div class="sb-tags"><span class="sb-save">' + T('sb.save') + '</span><span class="sb-best">' + T('sb.best') + '</span></div><div class="sb-amt"><b>' + rm0(SUB.yearly) + '</b><span>/' + T('sb.yr') + '</span><s>' + rm(SUB.monthlyTotal) + '/' + T('sb.yr') + '</s></div><p>' + T('sb.eff') + '</p></div>';
    return '<div class="sb-price"><div class="sb-amt"><b>' + rm(SUB.monthly) + '</b><span>/' + T('sb.mo') + '</span></div><p><button type="button" class="sb-link" data-b="yearly">' + T('sb.hint') + '</button></p></div>';
  }
  /* mount(host, opts): toggle + price (+ optional button). opts.cta = false to omit; opts.onUnlock(billing) overrides the default subscribe modal */
  sub.mount = function (host, opts) {
    opts = opts || {};
    function draw() {
      var st = read(), b = st.billing, prem = st.tier === 'premium';
      host.innerHTML = (prem ? '<p class="sb-active"><span class="sb-dot"></span>' + T('sb.active', { d: fdate(st.renewalDate) }) + '</p>' : toggleHTML(b) + priceHTML(b)) +
        (opts.cta === false ? '' : '<button type="button" class="btn sb-cta">' + (prem ? esc(opts.premiumLabel || T('sb.see')) : T('sb.cta') + ' - ' + sub.label(b)) + '</button>');
      [].forEach.call(host.querySelectorAll('[data-b]'), function (x) { x.onclick = function () { sub.setBilling(x.dataset.b); }; });
      var c = host.querySelector('.sb-cta'); if (c) c.onclick = function () { if (prem) { if (opts.onPremium) opts.onPremium(); else location.href = '/premium-quote'; } else if (opts.onUnlock) opts.onUnlock(read().billing); else sub.open(read().billing, opts); };
    }
    draw();
    var h = function () { if (document.body.contains(host)) draw(); else { window.removeEventListener('pc:sub', h); window.removeEventListener('pc:lang', h); } };
    window.addEventListener('pc:sub', h); window.addEventListener('pc:lang', h);
  };

  /* ---------- subscribe modal (demo) ---------- */
  var FEATURES = ['sb.f1', 'sb.f2', 'sb.f3', 'sb.f4'];
  sub.open = function (billing, opts) {
    opts = opts || {};
    var b = billing === 'monthly' ? 'monthly' : 'yearly', done = false;
    document.getElementById('sbmodal') && document.getElementById('sbmodal').remove();
    var m = document.createElement('div'); m.className = 'modal open'; m.id = 'sbmodal';
    document.body.append(m);
    function draw() {
      var renew = iso(addPeriod(today(), b));
      if (done) {
        var st = read();
        m.innerHTML = '<div class="mbox sbbox" role="dialog" aria-modal="true"><button class="x" data-close aria-label="Close">&times;</button><div class="sb-okic" aria-hidden="true">&#10003;</div><h3>' + T('sb.ok.h') + '</h3><p>' + T('sb.ok.p', { d: fdate(st.renewalDate) }) + '</p><div class="cta" style="margin-top:18px"><a class="btn" href="' + esc(opts.nextHref || '/premium-quote') + '">' + T(opts.nextKey || 'sb.see') + '</a><button class="btn ghost" data-close>' + T('sb.close') + '</button></div></div>';
      } else {
        m.innerHTML = '<div class="mbox sbbox" role="dialog" aria-modal="true" aria-labelledby="sbh"><button class="x" data-close aria-label="Close">&times;</button><h3 id="sbh">' + T('sb.m.h') + '</h3>' + toggleHTML(b) +
          '<dl class="sb-dl"><div><dt>' + T('sb.m.plan') + '</dt><dd>' + T('sb.m.prem') + ' ' + T(b === 'yearly' ? 'sb.yearly' : 'sb.monthly') + '</dd></div><div><dt>' + T('sb.m.price') + '</dt><dd>' + sub.label(b) + (b === 'yearly' ? ' <small>(' + T('sb.eff.short') + ')</small>' : '') + '</dd></div><div><dt>' + T('sb.m.renew') + '</dt><dd>' + fdate(renew) + '</dd></div></dl>' +
          '<h4 style="margin:14px 0 6px;font-size:.92rem">' + T('sb.m.incl') + '</h4><ul class="sb-ul">' + FEATURES.map(function (k) { return '<li>' + T(k) + '</li>'; }).join('') + '</ul>' +
          '<p class="sb-demo">' + T('sb.m.demo') + '</p><div class="cta" style="margin-top:14px"><button class="btn" id="sbok">' + T('sb.m.confirm') + '</button><button class="btn ghost" data-close>' + T('sb.m.cancel') + '</button></div></div>';
        m.querySelector('#sbok').onclick = function () { sub.subscribe(b); done = true; if (opts.onDone) opts.onDone(); draw(); };
      }
      [].forEach.call(m.querySelectorAll('.sb-seg [data-b]'), function (x) { x.onclick = function () { b = x.dataset.b; draw(); }; });
      m.querySelector('[data-close]') && [].forEach.call(m.querySelectorAll('[data-close]'), function (x) { x.onclick = function () { m.remove(); }; });
      var f = m.querySelector('#sbok, a.btn'); if (f) f.focus({ preventScroll: true });
    }
    m.addEventListener('click', function (e) { if (e.target === m) m.remove(); });
    m.addEventListener('keydown', function (e) { if (e.key === 'Escape') m.remove(); });
    draw();
  };

  /* ---------- manage view (dashboard Premium tab) ---------- */
  sub.manage = function (host) {
    var confirming = false;
    function draw() {
      var st = read(), prem = st.tier === 'premium';
      if (!prem) { host.innerHTML = '<div class="card"><h3>' + T('sb.mg.free.h') + '</h3><p>' + T('sb.mg.free.p') + '</p><div id="sbm_mount" style="margin-top:14px"></div></div>'; sub.mount(host.querySelector('#sbm_mount')); return; }
      var cancelling = st.status === 'cancelling', monthly = st.billing === 'monthly';
      host.innerHTML = '<div class="card sb-mg"><div class="sb-mgh"><h3>' + T('sb.mg.h') + '</h3><span class="sb-chip ' + (cancelling ? 'warn' : 'ok') + '">' + T(cancelling ? 'sb.mg.cancelling' : 'sb.mg.active') + '</span></div>' +
        '<dl class="sb-dl"><div><dt>' + T('sb.mg.plan') + '</dt><dd>' + T('sb.m.prem') + ' ' + T(monthly ? 'sb.monthly' : 'sb.yearly') + '</dd></div><div><dt>' + T('sb.m.price') + '</dt><dd>' + sub.label(st.billing) + '</dd></div><div><dt>' + T('sb.mg.status') + '</dt><dd>' + T(cancelling ? 'sb.mg.cancelling' : 'sb.mg.active') + '</dd></div><div><dt>' + T(cancelling ? 'sb.mg.endson' : 'sb.mg.next') + '</dt><dd>' + fdate(st.renewalDate) + '</dd></div></dl>' +
        (cancelling ? '<p class="sb-note warn">' + T('sb.mg.ends', { d: fdate(st.renewalDate) }) + '</p><button class="btn" id="sb_resume">' + T('sb.mg.resume') + '</button>' : '') +
        (!cancelling && monthly ? '<div class="sb-upg"><div><b>' + T('sb.mg.upg.h') + '</b><p>' + T('sb.mg.upg.p', { x: rm(SUB.saving) }) + '</p></div><button class="btn" id="sb_up">' + T('sb.mg.upg.btn') + '</button></div>' : '') +
        (!cancelling && !monthly ? (st.pending ? '<p class="sb-note">' + T('sb.mg.sw.on', { d: fdate(st.renewalDate) }) + '</p><button class="btn ghost sm" id="sb_sw">' + T('sb.mg.sw.undo') + '</button>' : '<button class="btn ghost sm" id="sb_sw">' + T('sb.mg.sw') + '</button>') : '') +
        (!cancelling ? '<div class="sb-cancel">' + (confirming ? '<div class="sb-confirm" role="alertdialog" aria-labelledby="sbch"><b id="sbch">' + T('sb.mg.cancel.h') + '</b><p>' + T('sb.mg.cancel.p', { d: fdate(st.renewalDate) }) + '</p><div class="cta"><button class="btn" id="sb_cy">' + T('sb.mg.cancel.yes') + '</button><button class="btn ghost" id="sb_cn">' + T('sb.mg.cancel.no') + '</button></div></div>' : '<button class="btn ghost sm" id="sb_c">' + T('sb.mg.cancel') + '</button>') + '</div>' : '') +
        '<p class="sb-demo">' + T('sb.m.demo') + '</p></div>';
      var on = function (id, fn) { var e = host.querySelector(id); if (e) e.onclick = fn; };
      on('#sb_resume', function () { sub.resume(); });
      on('#sb_up', function () { sub.upgradeToYearly(); });
      on('#sb_sw', function () { sub.switchAtRenewal(!read().pending); });
      on('#sb_c', function () { confirming = true; draw(); });
      on('#sb_cn', function () { confirming = false; draw(); });
      on('#sb_cy', function () { confirming = false; sub.cancel(); });
    }
    draw();
    var h = function () { if (document.body.contains(host)) draw(); else { window.removeEventListener('pc:sub', h); window.removeEventListener('pc:lang', h); } };
    window.addEventListener('pc:sub', h); window.addEventListener('pc:lang', h);
  };

  /* ---------- savings vs subscription card ---------- */
  /* opts: { kind: 'ind' | 'family' | 'biz', metrics, plan, members, heads, sample }  (Pricing engine: window.PCPricing) */
  sub.savings = function (host, opts) {
    var P = window.PCPricing; if (!P) return;
    var b = read().billing, cost = sub.annualCost(b);
    var q = P.quote(opts.metrics, { plan: opts.plan }), imp = P.improvementPlan(opts.metrics, opts.plan);
    var kind = opts.kind || 'ind', nowS, bestS, rows = '', note = '';
    if (kind === 'family') {
      var n = opts.members; nowS = q.savings * n; bestS = imp.best.totalSaving * n;
      rows = line(T('sv.now'), rm(nowS)) + line(T('sv.fam.per'), rm(imp.best.totalSaving) + ' <small>(' + T('sv.now.per', { x: rm(q.savings) }) + ')</small>') + line(T('sv.best'), rm(bestS));
      note = T('sv.fam.note');
    } else if (kind === 'biz') {
      var h = opts.heads, cur = P.smeQuote(h, q.score).savingsVsFlat, bs = P.smeQuote(h, imp.best.score).savingsVsFlat; nowS = cur; bestS = bs;
      rows = line(T('sv.now'), rm(nowS)) + line(T('sv.biz.per'), rm(bs / h)) + line(T('sv.best'), rm(bestS));
      note = T('sv.biz.note');
    } else {
      nowS = q.savings; bestS = imp.best.totalSaving;
      rows = line(T('sv.now'), rm(nowS)) + line(T('sv.best'), rm(bestS));
    }
    var net = Math.round((bestS - cost) * 100) / 100, pos = net > 0, max = Math.max(cost, bestS, 1);
    function line(k, v) { return '<div class="row"><span>' + k + '</span><b>' + v + '</b></div>'; }
    var bar = function (label, v, cls) { return '<div class="pqr-bar"><span>' + label + '</span><div class="pqr-grow in"><i class="' + cls + '" style="--w:' + Math.max(4, Math.round(v / max * 100)) + '%"></i></div><b>' + rm(v) + '</b></div>'; };
    host.innerHTML = '<div class="card sv-card"><div class="sv-h"><h3>' + T('sv.h') + '</h3><span class="sv-tags"><span class="sv-ind">' + T('sv.ind') + '</span>' + (opts.sample ? '<span class="pqr-tag">' + T('pqr.sample') + '</span>' : '') + '</span></div>' +
      '<div class="sv-rows">' + rows + line(T('sv.cost', { b: T(b === 'monthly' ? 'sb.monthly' : 'sb.yearly').toLowerCase() }), rm(cost)) + '</div>' +
      '<div class="sv-net ' + (pos ? 'pos' : 'neu') + '"><small>' + T('sv.net') + '</small><b>' + (net < 0 ? '−' : '') + rm(Math.abs(net)) + '</b><p>' + (pos ? T('sv.pos', { x: rm(net) }) : T('sv.neg')) + '</p></div>' +
      '<div class="pqr-bars sv-bars">' + bar(T('sv.chart.cost'), cost, 'mute') + bar(T('sv.chart.save'), bestS, pos ? 'good' : 'ok') + '</div>' + (note ? '<p class="sv-fn">' + note + '</p>' : '') + '<p class="sv-fn">' + T('sv.disc') + '</p></div>';
    host._svOpts = opts; // listeners always re-render with the latest inputs
    if (!host._sv) { host._sv = true; var rr = function () { if (document.body.contains(host)) sub.savings(host, host._svOpts); }; window.addEventListener('pc:sub', rr); window.addEventListener('pc:lang', rr); }
  };
})();
