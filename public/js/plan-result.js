/* Plan result view (/plan-result?plan=A|B|C|D|business). Stands alone: it never reads or writes the Premium Calculator.
   Uses the shared scoring engine (pricing.js -> window.PCPricing). Figures are fixed and indicative. */
(function () {
  'use strict';
  var P = window.PCPricing;
  var $ = function (id) { return document.getElementById(id); };
  var T = function (k, o) { var s = PC.t(k); if (o) for (var x in o) s = s.split('{' + x + '}').join(o[x]); return s; };
  var rm = function (n) { return 'RM ' + PC.fmt(n, 2); };
  var SAMPLE = { steps: 7500, exerciseMin: 100, sleepHours: 7.5, restingHr: 66 };
  var S = { m: SAMPLE, real: false, members: 4, heads: 25 };
  var ID = (function () {
    var q = (new URLSearchParams(location.search).get('plan') || '').toUpperCase(), keep = null;
    try { keep = sessionStorage.getItem('pc_plan_sel'); } catch (e) {}
    var id = q || keep || 'A'; if (id !== 'BUSINESS' && !P.PLANS[id]) id = 'A';
    try { sessionStorage.setItem('pc_plan_sel', id); } catch (e) {}
    return id;
  })();
  var PLAN_URL = ID.toLowerCase(), BIZ = ID === 'BUSINESS', PLAN = BIZ ? P.PLANS.A : P.PLANS[ID];
  var FAM = !BIZ && PLAN.type === 'family';

  /* ---- wearable data: same 28-day guest simulation as PC.guestConnect, or the account's last 30 days ---- */
  var hashS = function (str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  var rng = function (seed) { return function () { seed = (seed + 0x6D2B79F5) | 0; var t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  function guestAvg() {
    var g = null; try { g = JSON.parse(localStorage.getItem('pc_guest_conn')); } catch (e) {}
    if (!g || !g.providers || !g.providers.length) return null;
    var r0 = rng(hashS(g.seed)), base = { st: 5500 + r0() * 5500, ex: 60 + r0() * 110, sl: 6.2 + r0() * 2, hr: 54 + r0() * 18 }, out = [], t = new Date();
    for (var i = 27; i >= 0; i--) {
      var d = new Date(t.getFullYear(), t.getMonth(), t.getDate() - i), iso = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2), r = rng(hashS(g.seed + iso)), wk = d.getDay() % 6 === 0 ? 0.85 : 1.05;
      out.push({ steps: Math.round(base.st * wk * (0.75 + r() * 0.5)), exerciseMin: Math.round((base.ex / 7) * wk * (0.6 + r() * 0.9)), sleepHours: Math.round((base.sl + (r() - 0.5)) * 10) / 10, restingHr: Math.round(base.hr + (r() - 0.5) * 6) });
    }
    return P.averageMetrics(out);
  }
  function load() {
    return (PC.user ? PC.api('/dashboard') : Promise.reject()).then(function (d) {
      var ms = (d && d.metrics) || []; if (ms.length < 7) throw 0;
      var a = P.averageMetrics(ms.slice(-30)); S.m = { steps: Math.round(a.steps), exerciseMin: Math.round(a.exerciseMin), sleepHours: Math.round(a.sleepHours * 4) / 4, restingHr: Math.round(a.restingHr) }; S.real = true;
    }).catch(function () { var g = guestAvg(); if (g) { S.m = { steps: Math.round(g.steps), exerciseMin: Math.round(g.exerciseMin), sleepHours: Math.round(g.sleepHours * 4) / 4, restingHr: Math.round(g.restingHr) }; S.real = true; } });
  }

  function viewBlock(q) {
    if (FAM) {
      var per = q.annualPremium / S.members;
      return '<h3 class="pl2-vh">' + T('pl2.fam.h') + '</h3><label class="pl2-lbl" for="pl2_n">' + T('pl2.fam.members') + '</label><select id="pl2_n">' + [2, 3, 4, 5, 6].map(function (n) { return '<option value="' + n + '"' + (n === S.members ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '</select>' +
        '<div class="row"><span>' + T('pl2.fam.combined') + '</span><b>' + rm(q.annualPremium) + '</b></div><div class="row"><span>' + T('pl2.fam.per') + '</span><b>' + rm(per) + '</b></div><div class="row" style="border:0"><span>' + T('calc.permonth') + ' / ' + T('pl2.fam.per').toLowerCase() + '</span><b>' + rm(per / 12) + '</b></div><p class="pl2-fn">' + T('pl2.fam.note') + '</p>';
    }
    if (BIZ) {
      var b = P.smeQuote(S.heads, q.score);
      return '<h3 class="pl2-vh">' + T('pl2.biz.h') + '</h3><label class="pl2-lbl" for="pl2_n">' + T('pl2.biz.heads') + '</label><select id="pl2_n">' + [5, 10, 25, 50, 100, 250, 500].map(function (n) { return '<option value="' + n + '"' + (n === S.heads ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '</select>' +
        '<div class="row"><span>' + T('pl2.biz.per') + '</span><b>' + rm(b.perEmployeeAnnual) + '</b></div><div class="row"><span>' + T('pl2.biz.total') + '</span><b>' + rm(b.totalAnnual) + '</b></div><div class="row"><span>' + T('pl2.biz.disc') + '</span><b>' + b.bulkDiscountPct + '%</b></div><div class="row" style="border:0"><span>' + T(b.savingsVsFlat >= 0 ? 'calc.saved' : 'calc.extra') + '</span><b>' + rm(Math.abs(b.savingsVsFlat)) + '</b></div><p class="pl2-fn">' + T('pl2.biz.note') + '</p>';
    }
    return '';
  }
  function render() {
    var m = S.m, q = P.quote(m, { plan: PLAN.id }), adj = q.adjustmentPct, per = BIZ ? P.smeQuote(S.heads, q.score) : null;
    var ann = BIZ ? per.perEmployeeAnnual : q.annualPremium, base = q.base, adjPct = BIZ ? per.adjustmentPct : adj, sav = BIZ ? (base - per.perEmployeeAnnual) : q.savings;
    $('pl2_title').textContent = T('pl2.h1', { p: (BIZ ? T('pl2.biz') : PC.planName(PLAN.id)).replace(/ /g, '\u00A0') });
    $('pl2_banner').style.display = S.real ? 'none' : '';
    $('pl2_src').textContent = S.real ? T('pl2.src.real') : (BIZ ? T('pl2.biz.team') : '');
    $('pl2_result').innerHTML = '<h3>' + T('calc.score') + (S.real ? '' : ' <span class="pl2-tag">' + T('pqr.sample') + '</span>') + '</h3><div class="big">' + q.score + ' / 100 (' + q.grade + ')</div><span class="badge ' + (adj < 0 ? 'good' : adj > 0 ? 'up' : 'neu') + '">' + (adj > 0 ? '+' : '') + adj + '%</span>' +
      '<div style="margin-top:14px" class="row"><span>' + T('calc.base') + (BIZ ? ' / ' + T('pl2.biz.per').toLowerCase() : '') + '</span><b>' + rm(base) + '</b></div>' +
      '<div class="row"><span>' + T('calc.adj') + '</span><b>' + (adjPct > 0 ? '+' : '') + adjPct + '%</b></div>' +
      '<div class="row"><span>' + T('calc.yours') + (BIZ ? ' / ' + T('pl2.biz.per').toLowerCase() : '') + '</span><b style="font-size:1.3rem">' + rm(ann) + '</b></div>' +
      '<div class="row"><span>' + T('calc.permonth') + '</span><b>' + rm(ann / 12) + '</b></div>' +
      '<div class="row" style="border:0"><span>' + T(sav >= 0 ? 'calc.saved' : 'calc.extra') + '</span><b>' + rm(Math.abs(sav)) + '</b></div>' +
      '<h3 style="margin-top:18px;font-size:1rem">' + T('calc.breakdown') + '</h3><div class="bars">' + ['steps', 'exercise', 'sleep', 'heart'].map(function (k) { var v = q.components[k]; return '<div class="b"><div class="t"><span>' + T('comp.' + k) + '</span><span>' + v + '</span></div><div class="tr"><i style="width:' + v + '%"></i></div></div>'; }).join('') + '</div>' +
      '<div class="pl2-view">' + viewBlock(q) + '</div>' +
      (BIZ ? '<a class="btn" style="width:100%;margin-top:18px" href="/business#enquiry">' + T('pl2.biz.cta') + '</a>' : '<a class="btn" style="width:100%;margin-top:18px" id="pl2_apply" href="/apply?plan=' + PLAN.id + '&steps=' + m.steps + '&ex=' + m.exerciseMin + '&sl=' + m.sleepHours + '&hr=' + m.restingHr + '">' + T('calc.cta') + '</a>') +
      '<p class="pl2-fn light">' + T('pl2.disc') + '</p>';
    var n = $('pl2_n'); if (n) n.onchange = function () { if (BIZ) S.heads = +n.value; else S.members = +n.value; render(); };
    var u = $('pl2_up'); u.onclick = function (e) { e.preventDefault(); try { sessionStorage.setItem('pc_pq', JSON.stringify({ plan: PLAN.id, steps: m.steps, exerciseMin: m.exerciseMin, sleepHours: m.sleepHours, restingHr: m.restingHr, from: '/plan-result?plan=' + PLAN_URL })); } catch (x) {} location.href = '/premium-quote'; };
  }
  document.addEventListener('DOMContentLoaded', function () { if (!P) return; PC.ready.then(function () { load().then(function () { render(); window.addEventListener('pc:lang', render); }); }); });
})();
