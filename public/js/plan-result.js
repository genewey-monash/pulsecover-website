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
    if (FAM) { $('pl2_result').style.display = 'none'; $('pl2_fam').style.display = ''; document.querySelector('.pl2 .wrap').style.maxWidth = '1040px'; renderFamily(); return; }
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
    if (PC.sub) PC.sub.savings($('pl2_sav'), { kind: FAM ? 'family' : BIZ ? 'biz' : 'ind', metrics: m, plan: PLAN.id, members: S.members, heads: S.heads, sample: !S.real });
  }

  /* ---------- Family quote: member score cards (SAMPLE until real members join), summary, email invites ---------- */
  var FS = { api: null, form: { email: '', rel: 'spouse' }, msg: null, confirm: null, busy: false };
  var SAMPLE_MEMBERS = [['fm.m1', { steps: 8200, exerciseMin: 130, sleepHours: 7.4, restingHr: 62 }], ['fm.m2', { steps: 6800, exerciseMin: 90, sleepHours: 7.0, restingHr: 68 }], ['fm.m3', { steps: 11000, exerciseMin: 200, sleepHours: 8.8, restingHr: 60 }], ['fm.m4', { steps: 4500, exerciseMin: 70, sleepHours: 7.2, restingHr: 72 }]];
  var esc = function (x) { return PC.esc(x); }, initial = function (n) { return esc(String(n || '?').trim().charAt(0).toUpperCase() || '?'); };
  function famMembers() {
    var q = function (m) { return P.quote(m, { plan: PLAN.id }); }, list = [];
    var real = PC.user && FS.api && FS.api.members.length;
    if (!real) return SAMPLE_MEMBERS.map(function (x) { var r = q(x[1]); return { kind: 'sample', label: T(x[0]), score: r.score, grade: r.grade, adj: r.adjustmentPct, prem: r.annualPremium, base: r.base, comps: r.components }; });
    var me = q(S.m); list.push({ kind: S.real ? 'you' : 'yousample', label: T('fm.you'), score: me.score, grade: me.grade, adj: me.adjustmentPct, prem: me.annualPremium, base: me.base, comps: me.components });
    FS.api.members.forEach(function (m) {
      var o = { kind: 'member', id: m.id, rel: m.relationship, email: m.email, status: m.display, label: m.label || T('fm.rel.' + m.relationship), m: m };
      if (m.display === 'connected') Object.assign(o, { score: m.score, grade: m.grade, adj: m.adjustmentPct, prem: m.annualPremium, base: m.base, comps: m.components });
      list.push(o);
    });
    return list;
  }
  function bars(c) { return '<div class="bars">' + ['steps', 'exercise', 'sleep', 'heart'].map(function (k) { var v = c[k]; return '<div class="b"><div class="t"><span>' + T('comp.' + k) + '</span><span>' + v + '</span></div><div class="tr"><i style="width:' + v + '%"></i></div></div>'; }).join('') + '</div>'; }
  function hoursLeft(iso) { var ms = new Date(iso) - new Date(); if (ms <= 0) return null; var h = Math.ceil(ms / 3600000); return h + 'h'; }
  function memberCard(x) {
    var chip = x.kind === 'sample' ? '<span class="fm-chip sample">' + T('pqr.sample') + '</span>' : x.kind === 'yousample' ? '<span class="fm-chip sample">' + T('pqr.sample') + '</span>' : x.status ? '<span class="fm-chip ' + x.status + '">' + T('fm.st.' + x.status) + '</span>' : '';
    var head = '<div class="fm-h"><span class="fm-av" aria-hidden="true">' + initial(x.label) + '</span><div><b>' + esc(x.label) + '</b>' + (x.rel ? '<small>' + T('fm.rel.' + x.rel) + (x.email ? ' &middot; ' + esc(x.email) : '') + '</small>' : '') + '</div>' + chip + '</div>';
    if (x.score != null) return '<div class="result fm-card">' + head + '<div class="fm-score"><span class="big">' + x.score + ' / 100 (' + x.grade + ')</span><span class="badge ' + (x.adj < 0 ? 'good' : 'neu') + '">' + (x.adj > 0 ? '+' : '') + x.adj + '%</span></div><div class="row"><span>' + T('fm.prem') + '</span><b>' + rm(x.prem) + '</b></div>' + bars(x.comps) + (x.kind === 'member' ? actions(x) : '') + '</div>';
    var msg = x.status === 'pending' ? T('fm.pend.p') + '<small>' + T('fm.pend.exp', { d: new Date(x.m.expiresAt).toLocaleDateString(PC.lang === 'zh' ? 'zh-CN' : PC.lang === 'ms' ? 'ms-MY' : PC.lang === 'ta' ? 'ta-IN' : 'en-MY', { day: 'numeric', month: 'short' }) }) + '</small>' : x.status === 'nolink' ? T('fm.nolink.p') : x.status === 'failed' ? esc(x.m.error || '') : '';
    return '<div class="result fm-card muted">' + head + '<p class="fm-p">' + msg + '</p>' + actions(x) + '</div>';
  }
  function actions(x) {
    if (x.kind !== 'member') return '';
    var st = x.status, b = '', wait = hoursLeft(x.m.canResendAt);
    if (FS.confirm === x.id) return '<div class="fm-confirm" role="alertdialog"><b>' + T('fm.a.remove.h') + '</b><p>' + T('fm.a.remove.p') + '</p><div class="fm-act"><button class="btn sm" data-fm="rmyes" data-id="' + x.id + '">' + T('fm.a.remove.yes') + '</button><button class="btn ghost sm" data-fm="rmno">' + T('fm.a.keep') + '</button></div></div>';
    if (st === 'pending' || st === 'expired') b += '<button class="btn ghost sm" data-fm="resend" data-id="' + x.id + '"' + (wait && st === 'pending' ? ' disabled title="' + esc(T('fm.a.wait', { t: wait })) + '"' : '') + '>' + T('fm.a.resend') + '</button>' + (wait && st === 'pending' ? '<small class="fm-wait">' + T('fm.a.wait', { t: wait }) + '</small>' : '');
    if (st === 'failed') b += '<button class="btn sm" data-fm="resend" data-id="' + x.id + '">' + T('fm.a.retry') + '</button>';
    if (st === 'pending' || st === 'failed' || st === 'expired') b += '<button class="btn ghost sm" data-fm="cancel" data-id="' + x.id + '">' + T('fm.a.cancel') + '</button>';
    else b += '<button class="btn ghost sm" data-fm="rm" data-id="' + x.id + '">' + T('fm.a.remove') + '</button>';
    return '<div class="fm-act">' + b + '</div>';
  }
  function renderFamily() {
    var ms = famMembers(), scored = ms.filter(function (x) { return x.score != null; }), pending = ms.length - scored.length;
    var combined = scored.reduce(function (a, x) { return a + x.prem; }, 0), flat = scored.reduce(function (a, x) { return a + x.base; }, 0), isSample = !(PC.user && FS.api && FS.api.members.length);
    var used = FS.api ? FS.api.used : 1, max = (FS.api && FS.api.max) || +window.PC_TOKENS.famMax || 6, left = Math.max(0, max - used);
    var form = !PC.user ? '<p>' + T('fm.add.login') + '</p><a class="btn" href="/account?next=' + encodeURIComponent('/plan-result?plan=' + PLAN_URL) + '">' + T('iv.login') + ' / ' + T('iv.signup') + '</a>'
      : left <= 0 ? '<p>' + T('fm.add.full') + '</p>' :
      '<form id="fm_form" novalidate><label for="fm_e">' + T('fm.add.email') + '</label><input id="fm_e" type="email" autocomplete="off" value="' + esc(FS.form.email) + '"><label for="fm_r">' + T('fm.add.rel') + '</label><select id="fm_r">' + ['spouse', 'child', 'parent', 'other'].map(function (r) { return '<option value="' + r + '"' + (FS.form.rel === r ? ' selected' : '') + '>' + T('fm.rel.' + r) + '</option>'; }).join('') + '</select>' +
      (FS.form.rel === 'child' ? '<p class="fm-note">' + T('fm.add.minor') + '</p>' : '') + '<button class="btn" id="fm_send"' + (FS.busy ? ' disabled' : '') + '>' + T(FS.busy ? 'fm.add.sending' : 'fm.add.send') + '</button></form>';
    $('pl2_fam').innerHTML = '<h2 class="fm-t">' + T('fm.h') + (isSample ? ' <span class="pqr-tag">' + T('pqr.sample') + '</span>' : '') + '</h2><p class="mute">' + T('fm.sub') + '</p>' + (isSample ? '<p class="pl2-fn">' + T('fm.sample.note') + '</p>' : '') +
      '<div class="fm-grid">' + ms.map(memberCard).join('') + '</div>' +
      '<div class="result fm-sum"><h3>' + T('fm.sum.h') + '</h3><div class="row"><span>' + T('fm.sum.combined') + '</span><b style="font-size:1.3rem">' + rm(combined) + '</b></div><div class="row"><span>' + T('fm.sum.monthly') + '</span><b>' + rm(combined / 12) + '</b></div><div class="row" style="border:0"><span>' + T('fm.sum.saving') + '</span><b>' + rm(flat - combined) + '</b></div><p class="pl2-fn light">' + T('fm.sum.n', { n: scored.length }) + (pending ? ' &middot; ' + T('fm.sum.pending', { n: pending }) : '') + '</p>' +
      '<a class="btn" style="width:100%;margin-top:14px" href="/apply?plan=' + PLAN.id + '&steps=' + S.m.steps + '&ex=' + S.m.exerciseMin + '&sl=' + S.m.sleepHours + '&hr=' + S.m.restingHr + '">' + T('calc.cta') + '</a><p class="pl2-fn light">' + T('pl2.disc') + '</p></div>' +
      '<div class="card fm-add"><h3>' + T('fm.add.h') + '</h3>' + (PC.user ? '<p class="mute">' + T('fm.add.slots', { n: left, max: max }) + '</p>' : '') + form + (FS.msg ? '<div class="msg ' + (FS.msg.ok ? 'ok' : 'err') + '">' + esc(FS.msg.text) + '</div>' : '') + '<p class="pl2-fn">' + T('fm.add.note') + '</p></div>';
    bindFamily();
    if (PC.sub) PC.sub.savings($('pl2_sav'), { kind: 'family', metrics: S.m, plan: PLAN.id, members: Math.max(1, scored.length), sample: isSample || !S.real });
  }
  function famLoad() { if (!PC.user) return Promise.resolve(); return PC.api('/family').then(function (r) { FS.api = r; }).catch(function () { FS.api = null; }); }
  function bindFamily() {
    var f = $('fm_form');
    if (f) {
      $('fm_e').oninput = function () { FS.form.email = this.value; };
      $('fm_r').onchange = function () { FS.form.rel = this.value; renderFamily(); };
      f.onsubmit = async function (e) {
        e.preventDefault(); var em = FS.form.email.trim().toLowerCase(); FS.msg = null;
        var emailOk = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/.test(em) && em.indexOf('..') < 0;
        if (!emailOk) FS.msg = { ok: false, text: T('fm.add.err.email') };
        else if (PC.user && em === String(PC.user.email).toLowerCase()) FS.msg = { ok: false, text: T('fm.add.err.self') };
        else if (FS.api && FS.api.members.some(function (m) { return m.email === em && m.display !== 'declined'; })) FS.msg = { ok: false, text: T('fm.add.err.dup') };
        if (FS.msg) { renderFamily(); return; }
        FS.busy = true; renderFamily();
        try { var r = await PC.api('/family/invite', { email: em, relationship: FS.form.rel }); FS.msg = r.ok ? { ok: true, text: T('fm.add.ok', { e: em }) } : { ok: false, text: T('fm.add.fail', { e: em }) }; if (r.ok) FS.form.email = ''; }
        catch (x) { FS.msg = { ok: false, text: x.message }; }
        FS.busy = false; await famLoad(); renderFamily();
      };
    }
    [].forEach.call($('pl2_fam').querySelectorAll('[data-fm]'), function (b) {
      b.onclick = async function () {
        var a = b.dataset.fm, id = +b.dataset.id; FS.msg = null;
        if (a === 'rm') { FS.confirm = id; return renderFamily(); } if (a === 'rmno') { FS.confirm = null; return renderFamily(); }
        b.disabled = true;
        try {
          if (a === 'resend') { var r = await PC.api('/family/resend', { id: id }); FS.msg = r.ok ? { ok: true, text: T('fm.add.ok', { e: r.member.email }) } : { ok: false, text: T('fm.add.fail', { e: r.member.email }) }; }
          else if (a === 'cancel') await PC.api('/family/cancel', { id: id });
          else if (a === 'rmyes') { await PC.api('/family/remove', { id: id }); FS.confirm = null; }
        } catch (x) { FS.msg = { ok: false, text: x.message }; }
        await famLoad(); renderFamily();
      };
    });
  }

  /* the Premium upsell: billing toggle + price, "Unlock My Savings Plan" opens the demo subscribe step; numbers travel to /premium-quote through sessionStorage */
  function handoff() { var m = S.m; try { sessionStorage.setItem('pc_pq', JSON.stringify({ plan: PLAN.id, steps: m.steps, exerciseMin: m.exerciseMin, sleepHours: m.sleepHours, restingHr: m.restingHr, from: '/plan-result?plan=' + PLAN_URL })); } catch (x) {} }
  document.addEventListener('DOMContentLoaded', function () { if (!P) return; PC.ready.then(function () { load().then(function () {
    (FAM ? famLoad() : Promise.resolve()).then(function () { render(); window.addEventListener('pc:lang', render); });
    PC.sub.mount($('pl2_sub'), { onUnlock: function (b) { handoff(); PC.sub.open(b, { nextHref: '/premium-quote' }); }, onPremium: function () { handoff(); location.href = '/premium-quote'; } });
  }); }); });
})();
