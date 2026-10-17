/* Premium Quote Results page. Reuses the shared scoring engine (pricing.js -> window.PCPricing). Figures are indicative only. */
(function () {
  'use strict';
  var P = window.PCPricing;
  var $ = function (id) { return document.getElementById(id); };
  var T = function (k, o) { var s = PC.t(k); if (o) for (var x in o) s = s.split('{' + x + '}').join(o[x]); return s; };
  var rm = function (n) { return 'RM ' + PC.fmt(n, 0); };
  var rm2 = function (n) { return 'RM ' + PC.fmt(n, 2); };
  var esc = function (s) { return PC.esc ? PC.esc(String(s)) : String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var store = {
    s: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    g: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var FLAME = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 2s5 4.5 5 9.5a5 5 0 01-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-5.500 1-8z"/><path d="M12 22a4 4 0 01-4-4c0-2 2-3 4-6 2 3 4 4 4 6a4 4 0 01-4 4z" opacity=".6"/></svg>';
  var FACTORS = ['steps', 'exercise', 'sleep', 'heart'];
  var KEYMAP = { steps: 'steps', exercise: 'exerciseMin', sleep: 'sleepHours', heart: 'restingHr' };
  var SAMPLE = { plan: 'A', steps: 6500, exerciseMin: 100, sleepHours: 6.5, restingHr: 68 };
  var S = { cur: null, source: 'sample', series: [], days: 30, rewards: null, plan: 'A' };

  /* ---------- helpers on top of the shared engine ---------- */
  var round = function (v, step) { return Math.round(v / step) * step; };
  var metrics = function (c) { return { steps: c.steps, exerciseMin: c.exerciseMin, sleepHours: c.sleepHours, restingHr: c.restingHr }; };
  var calc = function (c) { return P.quote(metrics(c), { plan: S.plan }); };
  var unit = function (f, v) { return f === 'steps' ? PC.fmt(v, 0) : f === 'exercise' ? v + ' ' + T('pqr.u.min') : f === 'sleep' ? (Math.round(v * 100) / 100) + ' ' + T('pqr.u.h') : v + ' ' + T('pqr.u.bpm'); };
  var fscore = function (f, c) { return P.score(metrics(c)).components[f]; };
  var status = function (v) { return v >= 80 ? 'good' : v >= 50 ? 'ok' : 'low'; };
  var STAT = { good: 'pqr.st.excellent', ok: 'pqr.st.good', low: 'pqr.st.work' };
  var BANDS = [{ g: 'A+', min: 90 }, { g: 'A', min: 75 }, { g: 'B', min: 60 }, { g: 'C', min: 40 }, { g: 'D', min: 25 }, { g: 'E', min: 0 }];
  var withVal = function (c, f, v) { var o = {}; for (var k in c) o[k] = c[k]; o[KEYMAP[f]] = v; return o; };

  /* realistic, capped improvement target for a factor (null = already at the top of the score) */
  function fullTarget(f, c) {
    if (f === 'steps') return c.steps >= 8000 ? null : Math.min(8000, round(c.steps + 3000, 250));
    if (f === 'exercise') return c.exerciseMin >= 150 ? null : Math.min(150, round(c.exerciseMin + 60, 5));
    if (f === 'sleep') { if (c.sleepHours >= 7 && c.sleepHours <= 9) return null; return c.sleepHours < 7 ? Math.min(7.5, round(c.sleepHours + 1, 0.25)) : 8.5; }
    var hr = c.restingHr; return hr <= 55 ? null : Math.max(55, hr - 5);
  }

  function scenarios(c) {
    var base = calc(c), rows = [];
    FACTORS.forEach(function (f) {
      var to = fullTarget(f, c);
      if (to === null) { rows.push({ f: f, from: c[KEYMAP[f]], to: null, fscore: fscore(f, c), score: base.score, annual: base.annualPremium, saving: 0 }); return; }
      var n = withVal(c, f, to), q = calc(n);
      rows.push({ f: f, from: c[KEYMAP[f]], to: to, fscore: fscore(f, n), score: q.score, annual: q.annualPremium, saving: Math.max(0, Math.round((base.annualPremium - q.annualPremium) * 100) / 100) });
    });
    var top = rows.filter(function (r) { return r.to !== null && r.saving > 0; }).sort(function (a, b) { return b.saving - a.saving; }).slice(0, 3);
    var n = c; top.forEach(function (r) { n = withVal(n, r.f, r.to); });
    var q = calc(n);
    return { rows: rows, base: base, best: { factors: top.map(function (r) { return r.f; }), score: q.score, annual: q.annualPremium, saving: Math.max(0, Math.round((base.annualPremium - q.annualPremium) * 100) / 100), metrics: n } };
  }

  /* ---------- data loading ---------- */
  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function sampleSeries(c) { // deterministic SAMPLE history around the user's inputs: [{score|null}]
    var r = mulberry(Math.round(c.steps + c.exerciseMin * 3 + c.sleepHours * 100 + c.restingHr * 7)), out = [];
    for (var i = 0; i < 90; i++) {
      var drift = (i - 90) / 90 * 0.05; // gentle upward drift towards today
      var m = { steps: c.steps * (0.82 + r() * 0.36 + drift), exerciseMin: c.exerciseMin * (0.8 + r() * 0.4 + drift), sleepHours: c.sleepHours + (r() - 0.5) * 1.2, restingHr: c.restingHr + (r() - 0.5) * 6 - drift * 40 };
      out.push(r() < 0.13 ? null : P.score(m).score);
    }
    return out;
  }
  function loadInputs() {
    var raw = store.s('pc_pq'), saved = null;
    try { saved = raw ? JSON.parse(raw) : null; } catch (e) {}
    if (saved && isFinite(saved.steps) && isFinite(saved.exerciseMin) && isFinite(saved.sleepHours) && isFinite(saved.restingHr)) {
      S.cur = { plan: saved.plan, steps: +saved.steps, exerciseMin: +saved.exerciseMin, sleepHours: +saved.sleepHours, restingHr: +saved.restingHr };
      S.source = 'calc'; S.from = typeof saved.from === 'string' && saved.from.indexOf('/plan-result') === 0 ? saved.from : null; S.plan = P.PLANS[saved.plan] ? saved.plan : 'A'; S.series = sampleSeries(S.cur); return Promise.resolve();
    }
    return (PC.user ? PC.api('/dashboard') : Promise.reject()).then(function (d) {
      var ms = (d && d.metrics) || [];
      if (ms.length < 7) throw 0;
      var avg = P.averageMetrics(ms.slice(-30));
      S.cur = { plan: d.policy && d.policy.plan || 'A', steps: Math.round(avg.steps), exerciseMin: Math.round(avg.exerciseMin), sleepHours: Math.round(avg.sleepHours * 4) / 4, restingHr: Math.round(avg.restingHr) };
      S.plan = P.PLANS[S.cur.plan] ? S.cur.plan : 'A'; S.source = 'wearable';
      var byDay = {}; ms.forEach(function (m) { byDay[m.day] = m.score; });
      var out = [], now = new Date();
      for (var i = 89; i >= 0; i--) { var dt = new Date(now.getTime() - i * 86400000).toISOString().slice(0, 10); out.push(byDay[dt] == null ? null : byDay[dt]); }
      S.series = out;
    }).catch(function () { S.cur = Object.assign({}, SAMPLE); S.source = 'sample'; S.plan = 'A'; S.series = sampleSeries(S.cur); });
  }
  function loadRewards() {
    if (!PC.user) { S.rewards = { sample: true, best: 8, streak: 5 }; return Promise.resolve(); }
    return PC.api('/rewards').then(function (r) { S.rewards = { sample: false, best: r.best, streak: r.streak }; }).catch(function () { S.rewards = { sample: true, best: 8, streak: 5 }; });
  }

  /* ---------- 1. hero ---------- */
  function renderHero() {
    var c = S.cur, q = calc(c), sc = scenarios(c), plan = P.PLANS[S.plan];
    var adj = q.adjustmentPct, circ = 2 * Math.PI * 54;
    var band = BANDS.filter(function (b) { return q.score >= b.min; })[0];
    var idx = BANDS.indexOf(band), hi = idx > 0 ? BANDS[idx - 1].min - 1 : 100;
    var save = sc.best.saving;
    $('pqr_hero').innerHTML =
      '<div class="pqr-gauge"><svg viewBox="0 0 128 128" role="img" aria-label="' + esc(T('pqr.h.score')) + ' ' + q.score + '/100"><circle cx="64" cy="64" r="54" class="trk"/><circle cx="64" cy="64" r="54" class="val" id="pqr_arc" stroke-dasharray="' + circ.toFixed(1) + '" stroke-dashoffset="' + circ.toFixed(1) + '"/></svg>' +
      '<div class="in"><b>' + q.score + '</b><small>/ 100</small><span class="badge ' + (adj < 0 ? 'good' : adj > 0 ? 'up' : 'neu') + '">' + T('pqr.h.grade') + ' ' + q.grade + '</span></div></div>' +
      '<div class="pqr-hs"><h2>' + T('pqr.h.score') + '</h2>' +
      '<div class="pqr-kv"><div><small>' + T('pqr.h.band') + '</small><b>' + q.grade + ' (' + band.min + '&ndash;' + hi + ')</b></div>' +
      '<div><small>' + T('pqr.h.base') + '</small><b>' + rm(q.base) + '</b></div>' +
      '<div><small>' + T('pqr.h.adj') + '</small><b>' + (adj > 0 ? '+' : '') + adj + '%</b></div>' +
      '<div><small>' + T('pqr.h.annual') + '</small><b class="big">' + rm2(q.annualPremium) + '</b></div>' +
      '<div><small>' + T('pqr.h.monthly') + '</small><b>' + rm2(q.monthlyPremium) + '</b></div>' +
      '<div><small>' + T('pqr.h.plan') + '</small><b>' + esc(T('pqr.plan.' + S.plan)) + '</b></div></div>' +
      '<div class="pqr-save">' + (save > 0 ? '<span class="ic">' + PC.icon('chart') + '</span><div><b>' + T('pqr.h.save', { x: rm2(save) }) + '</b><small>' + T('pqr.h.save.sub') + '</small></div>' : '<span class="ic">' + PC.icon('chart') + '</span><div><b>' + T('pqr.h.top') + '</b></div>') + '</div>' +
      '<p class="pqr-fn">' + T('pqr.indicative') + '</p></div>';
    var arc = $('pqr_arc'); requestAnimationFrame(function () { requestAnimationFrame(function () { arc.style.strokeDashoffset = (circ * (1 - q.score / 100)).toFixed(1); }); });
  }

  /* ---------- 2. detailed assessment ---------- */
  function renderFactors() {
    var c = S.cur, q = calc(c);
    $('pqr_factors').innerHTML = FACTORS.map(function (f) {
      var v = q.components[f], st = status(v);
      return '<div class="card pqr-f"><div class="pqr-fh"><b>' + T('comp.' + f) + '</b><span class="pqr-chip ' + st + '">' + T(STAT[st]) + '</span></div>' +
        '<div class="pqr-fv">' + unit(f, c[KEYMAP[f]]) + '</div>' +
        '<div class="pqr-meter pqr-grow" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + v + '" aria-label="' + esc(T('comp.' + f)) + '"><i class="' + st + '" style="--w:' + v + '%"></i></div>' +
        '<div class="pqr-fs"><span>' + T('pqr.f.score') + '</span><b>' + v + ' / 100</b></div>' +
        '<p>' + T('pqr.f.' + f) + '</p></div>';
    }).join('');
    var idx = BANDS.map(function (b) { return b.g; }).indexOf(q.grade), nb = idx > 0 ? BANDS[idx - 1] : null;
    $('pqr_next').innerHTML = nb
      ? '<div class="pqr-fh"><b>' + T('pqr.next.h') + '</b><span>' + T('pqr.next.pts', { n: nb.min - q.score, g: nb.g }) + '</span></div><div class="pqr-meter pqr-grow tall" role="progressbar" aria-valuemin="0" aria-valuemax="' + nb.min + '" aria-valuenow="' + q.score + '"><i class="ok" style="--w:' + Math.round(q.score / nb.min * 100) + '%"></i></div><div class="pqr-fs"><span>' + q.score + '</span><span>' + nb.min + ' (' + T('pqr.h.grade') + ' ' + nb.g + ')</span></div>'
      : '<div class="pqr-fh"><b>' + T('pqr.next.h') + '</b></div><p>' + T('pqr.next.top') + '</p>';
    renderQuality();
  }
  function renderQuality() {
    var win = S.series.slice(-30), n = win.filter(function (v) { return v !== null; }).length, pct = Math.round(n / win.length * 100);
    var low = pct < 80, st = pct >= 80 ? 'good' : pct >= 60 ? 'ok' : 'low';
    $('pqr_quality').innerHTML = '<div class="pqr-fh"><b>' + T('pqr.dq.h') + '</b>' + (S.source === 'wearable' ? '' : '<span class="pqr-tag">' + T('pqr.sample') + '</span>') + '</div>' +
      '<div class="pqr-meter pqr-grow tall" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><i class="' + st + '" style="--w:' + pct + '%"></i></div>' +
      '<div class="pqr-fs"><span>' + T('pqr.dq.days', { n: n, d: win.length }) + '</span><b>' + pct + '%</b></div><p>' + (low ? T('pqr.dq.low') : T('pqr.dq.ok')) + '</p>';
  }
  function renderTrend() {
    var d = S.days, data = S.series.slice(-d), W = 640, H = 200, pl = 34, pr = 10, pt = 12, pb = 24;
    var vals = data.filter(function (v) { return v !== null; });
    var lo = Math.max(0, Math.floor(Math.min.apply(null, vals) / 10) * 10 - 10), hi = Math.min(100, Math.ceil(Math.max.apply(null, vals) / 10) * 10 + 10);
    var x = function (i) { return pl + i * (W - pl - pr) / (data.length - 1); }, y = function (v) { return pt + (hi - v) / (hi - lo) * (H - pt - pb); };
    var path = '', pen = false;
    data.forEach(function (v, i) { if (v === null) { pen = false; return; } path += (pen ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1); pen = true; });
    var grid = [lo, Math.round((lo + hi) / 2), hi].map(function (g) { return '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + y(g) + '" y2="' + y(g) + '" class="g"/><text x="' + (pl - 6) + '" y="' + (y(g) + 4) + '" text-anchor="end">' + g + '</text>'; }).join('');
    var ticks = [0, Math.floor((data.length - 1) / 2), data.length - 1].map(function (i) { return '<text x="' + x(i) + '" y="' + (H - 6) + '" text-anchor="' + (i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle') + '">' + (i === data.length - 1 ? T('pqr.tr.today') : T('pqr.tr.ago', { n: data.length - 1 - i })) + '</text>'; }).join('');
    $('pqr_trend').innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(T('pqr.tr.h')) + '">' + grid + ticks + '<path d="' + path + '" class="ln"/></svg>';
    var dots = $('pqr_tr_tog').querySelectorAll('button'); [].forEach.call(dots, function (b) { b.classList.toggle('on', +b.dataset.d === d); b.setAttribute('aria-pressed', +b.dataset.d === d); });
    $('pqr_tr_tag').style.display = S.source === 'wearable' ? 'none' : '';
  }

  /* ---------- 3. savings ---------- */
  function renderSavings() {
    var c = S.cur, sc = scenarios(c), base = sc.base;
    var rowF = function (r) {
      return '<tr><th scope="row" data-l="' + esc(T('pqr.s.col.if')) + '">' + T('pqr.s.if', { f: T('comp.' + r.f) }) + '</th>' +
        (r.to === null ? '<td colspan="5" class="mute" data-l="">' + T('pqr.s.at') + '</td>' :
          '<td data-l="' + esc(T('pqr.s.col.target')) + '">' + unit(r.f, r.from) + ' &rarr; <b>' + unit(r.f, r.to) + '</b></td><td data-l="' + esc(T('pqr.s.col.fscore')) + '">' + r.fscore + '</td><td data-l="' + esc(T('pqr.s.col.score')) + '">' + r.score + '</td><td data-l="' + esc(T('pqr.s.col.annual')) + '">' + rm2(r.annual) + '</td><td data-l="' + esc(T('pqr.s.col.save')) + '" class="sv">' + (r.saving > 0 ? '&minus;' + rm2(r.saving) : rm2(0)) + '</td>') + '</tr>';
    };
    var b = sc.best;
    $('pqr_sv').innerHTML = '<thead><tr><th>' + T('pqr.s.col.if') + '</th><th>' + T('pqr.s.col.target') + '</th><th>' + T('pqr.s.col.fscore') + '</th><th>' + T('pqr.s.col.score') + '</th><th>' + T('pqr.s.col.annual') + '</th><th>' + T('pqr.s.col.save') + '</th></tr></thead><tbody>' +
      sc.rows.map(rowF).join('') +
      '<tr class="tot"><th scope="row" data-l="">' + T('pqr.s.best') + '<small>' + (b.factors.length ? b.factors.map(function (f) { return T('comp.' + f); }).join(' + ') : '') + '</small></th>' +
      (b.factors.length ? '<td data-l="' + esc(T('pqr.s.col.target')) + '">' + b.factors.length + ' ' + T('pqr.s.changes') + '</td><td data-l="">&ndash;</td><td data-l="' + esc(T('pqr.s.col.score')) + '">' + b.score + '</td><td data-l="' + esc(T('pqr.s.col.annual')) + '">' + rm2(b.annual) + '</td><td data-l="' + esc(T('pqr.s.col.save')) + '" class="sv">&minus;' + rm2(b.saving) + '<small>' + T('pqr.s.permonth', { x: rm2(b.saving / 12) }) + '</small></td>' : '<td colspan="5" class="mute" data-l="">' + T('pqr.s.at') + '</td>') + '</tr></tbody>';
    var flat = base.base, max = Math.max(flat, base.annualPremium, b.annual);
    var bar = function (label, v, cls) { return '<div class="pqr-bar"><span>' + label + '</span><div class="pqr-grow"><i class="' + cls + '" style="--w:' + Math.max(6, Math.round(v / max * 100)) + '%"></i></div><b>' + rm2(v) + '</b></div>'; };
    $('pqr_chart').innerHTML = bar(T('pqr.s.c.flat'), flat, 'mute') + bar(T('pqr.s.c.now'), base.annualPremium, 'ok') + bar(T('pqr.s.c.best'), b.annual, 'good');
  }
  var WI = [['steps', 'steps', 0, 20000, 250], ['exercise', 'exerciseMin', 0, 400, 5], ['sleep', 'sleepHours', 3, 11, 0.25], ['heart', 'restingHr', 40, 100, 1]];
  function buildWhatIf() {
    var c = S.cur;
    $('pqr_wi').innerHTML = WI.map(function (w) {
      var f = w[0], v = Math.min(w[3], Math.max(w[2], c[w[1]]));
      return '<div class="pqr-sl"><div class="rng"><label for="wi_' + f + '">' + T('comp.' + f) + '</label><b id="wiv_' + f + '">' + unit(f, v) + '</b></div><input type="range" id="wi_' + f + '" min="' + w[2] + '" max="' + w[3] + '" step="' + w[4] + '" value="' + v + '"></div>';
    }).join('');
    WI.forEach(function (w) { $('wi_' + w[0]).addEventListener('input', updateWhatIf); });
    updateWhatIf();
  }
  function updateWhatIf() {
    var c = S.cur, n = Object.assign({}, c);
    WI.forEach(function (w) { var v = +$('wi_' + w[0]).value; n[w[1]] = v; $('wiv_' + w[0]).textContent = unit(w[0], v); });
    var q0 = calc(c), q = calc(n), d = Math.round((q0.annualPremium - q.annualPremium) * 100) / 100;
    $('pqr_wi_out').innerHTML = '<div><small>' + T('pqr.w.score') + '</small><b>' + q.score + ' <em>' + (q.score - q0.score >= 0 ? '+' : '') + (q.score - q0.score) + '</em></b></div>' +
      '<div><small>' + T('pqr.w.prem') + '</small><b>' + rm2(q.annualPremium) + '</b></div>' +
      '<div class="' + (d > 0 ? 'good' : d < 0 ? 'up' : '') + '"><small>' + T(d < 0 ? 'pqr.w.extra' : 'pqr.w.save') + '</small><b>' + rm2(Math.abs(d)) + '</b></div>';
  }

  /* ---------- 4. coaching plan ---------- */
  function planGoals() {
    var c = S.cur, q = calc(c), W = P.WEIGHTS;
    var gaps = FACTORS.map(function (f) { return { f: f, gap: (100 - q.components[f]) * W[f] }; }).filter(function (g) { return g.gap > 0 && fullTarget(g.f, c) !== null; }).sort(function (a, b) { return b.gap - a.gap; }).slice(0, 2);
    if (!gaps.length) return [];
    var order = gaps.length === 2 ? [0, 1, 0, 1] : [0, 0, 0, 0], goals = [], cum = Object.assign({}, c), seen = {};
    order.forEach(function (gi, i) {
      var f = gaps[gi].f, lvl = (seen[f] = (seen[f] || 0) + 1), full = fullTarget(f, c), from = cum[KEYMAP[f]], to;
      if (gaps.length === 1) { to = from + (full - from) * (i + 1) / 4 * 1; } else { to = lvl === 1 ? from + (full - from) / 2 : full; }
      var st = f === 'steps' ? 250 : f === 'exercise' ? 5 : f === 'sleep' ? 0.25 : 1;
      to = round(to, st); if ((full > from && to > full) || (full < from && to < full)) to = full;
      if (to === from) to = full;
      var before = P.score(metrics(cum)).score; cum = withVal(cum, f, to); var after = P.score(metrics(cum)).score;
      goals.push({ week: i + 1, f: f, from: from, to: to, gain: Math.max(0, after - before) });
    });
    return goals;
  }
  function checks() { try { var a = JSON.parse(store.g('pc_pq_checks') || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  function renderPlan() {
    var goals = planGoals(), ck = checks();
    if (!goals.length) { $('pqr_plan').innerHTML = '<div class="card"><p>' + T('pqr.p.none') + '</p></div>'; $('pqr_ring').style.display = 'none'; return; }
    $('pqr_ring').style.display = '';
    $('pqr_plan').innerHTML = goals.map(function (g, gi) {
      var days = '';
      for (var d = 0; d < 7; d++) { var id = gi * 7 + d; days += '<label class="pqr-day"><input type="checkbox" data-i="' + id + '"' + (ck[id] ? ' checked' : '') + '><span>' + (d + 1) + '</span></label>'; }
      var hv = g.f === 'sleep' && g.to < g.from ? 'pqr.p.sleep2' : 'pqr.p.' + g.f;
      return '<div class="card pqr-wk"><div class="pqr-fh"><b>' + T('pqr.p.week', { n: g.week }) + '</b><span class="pqr-chip good">+' + g.gain + ' ' + T('pqr.p.pts') + '</span></div>' +
        '<p class="pqr-habit">' + T(hv + '.habit', { t: unit(g.f, g.to), f: unit(g.f, g.from) }) + '</p><p>' + T('pqr.p.' + g.f + '.why') + '</p>' +
        '<div class="pqr-days" role="group" aria-label="' + esc(T('pqr.p.week', { n: g.week })) + '">' + days + '</div></div>';
    }).join('');
    [].forEach.call($('pqr_plan').querySelectorAll('input[type=checkbox]'), function (el) {
      el.addEventListener('change', function () { var a = checks(); a[+el.dataset.i] = el.checked; for (var i = 0; i < 28; i++) a[i] = !!a[i]; store.set('pc_pq_checks', JSON.stringify(a)); renderRing(goals.length * 7); });
    });
    renderRing(goals.length * 7);
  }
  function renderRing(total) {
    var a = checks(), done = 0, run = 0, best = 0;
    for (var i = 0; i < total; i++) { if (a[i]) { done++; run++; best = Math.max(best, run); } else run = 0; }
    var pct = Math.round(done / total * 100), circ = 2 * Math.PI * 30;
    $('pqr_ring').innerHTML = '<svg viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="30" class="trk"/><circle cx="36" cy="36" r="30" class="val" stroke-dasharray="' + circ.toFixed(1) + '" stroke-dashoffset="' + (circ * (1 - pct / 100)).toFixed(1) + '"/></svg><div><b>' + pct + '%</b><small>' + T('pqr.p.done', { a: done, b: total }) + '</small></div><div class="stk"><b>' + FLAME + ' ' + best + '</b><small>' + T('pqr.p.streak') + '</small></div>';
  }

  /* ---------- 5. policy guidance ---------- */
  function renderPolicies() {
    var plan = P.PLANS[S.plan], q = calc(S.cur), mult = [1, 1.07, 0.95], names = ['A', 'B', 'C'];
    $('pqr_pol').innerHTML = names.map(function (n, i) {
      var fam = plan.type === 'family';
      return '<div class="card pqr-pol"><div class="xtop">' + PC_PARTNER_ICON('shield', 22) + '<div><h3>' + T('pqr.pol.name', { n: n }) + '</h3></div><span class="pqr-tag">' + T('pqr.sample') + '</span></div><div class="pqr-pp">' + rm(Math.round(q.annualPremium * mult[i])) + '<small>' + T('common.year') + '</small></div><small class="mute">' + T('pqr.pol.ind') + '</small>' +
        '<ul><li>' + T('pqr.pol.cov', { c: rm(plan.cover) }) + '</li><li>' + T(fam ? 'pqr.pol.fam' : 'pqr.pol.ci') + '</li><li>' + T('pqr.pol.h' + (i + 1)) + '</li></ul>' +
        '<dl><dt>' + T('pqr.pol.wait') + '</dt><dd>' + T('pqr.pol.w' + (i + 1)) + '</dd><dt>' + T('pqr.pol.panel') + '</dt><dd>' + T('pqr.pol.p' + (i + 1)) + '</dd></dl></div>';
    }).join('');
  }

  /* ---------- 6. perks and events ---------- */
  var PERKS = [
    { id: 'pharm', min: 3, k: 'cp.pharm', icon: 'medkit' },
    { id: 'cafe', min: 7, k: 'cp.cafe', icon: 'cafe' },
    { id: 'super', min: 14, k: 'cp.super', icon: 'cart' },
    { id: 'watch', min: 14, k: 'pqr.perk.watch', icon: 'watch' },
    { id: 'gym', min: 30, k: 'cp.gym', icon: 'barbell' },
    { id: 'gymtrial', min: 21, k: 'pqr.perk.trial', icon: 'pricetag' }
  ];
  var EVENTS = [{ id: 'run', off: 21, loc: 'pqr.ev.loc.run', icon: 'flag' }, { id: 'steps', off: 10, loc: 'pqr.ev.loc.online', icon: 'footsteps' }, { id: 'talk', off: 35, loc: 'pqr.ev.loc.online', icon: 'mic' }];
  var claimed = function () { try { return JSON.parse(store.g('pc_pq_claims') || '{}'); } catch (e) { return {}; } };
  var joined = function () { try { return JSON.parse(store.g('pc_pq_events') || '{}'); } catch (e) { return {}; } };
  var dateStr = function (off) { var d = new Date(Date.now() + off * 86400000); return d.toLocaleDateString(PC.lang === 'zh' ? 'zh-CN' : PC.lang === 'ms' ? 'ms-MY' : PC.lang === 'ta' ? 'ta-IN' : 'en-MY', { day: 'numeric', month: 'short', year: 'numeric' }); };
  function renderPerks() {
    var R = S.rewards, cl = claimed(), ev = joined();
    $('pqr_perks').innerHTML = PERKS.map(function (p) {
      var open = R.best >= p.min, code = cl[p.id];
      var act = code ? '<div class="pqr-code"><small>' + T('rw.code') + '</small><code>' + esc(code) + '</code></div>'
        : open ? '<button class="btn sm" data-claim="' + p.id + '">' + T('pqr.perk.claim') + '</button>'
          : '<span class="pqr-lock"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg> ' + T('pqr.perk.need', { n: p.min }) + '</span>';
      return '<div class="card pqr-perk' + (open ? '' : ' locked') + '"><div class="xtop">' + PC_PARTNER_ICON(p.icon, 22, !open) + '<div><h4>' + T(p.k + '.h') + '</h4><p>' + T(p.k + '.p') + '</p></div><span class="pqr-tag">' + T('pqr.sample') + '</span></div><small class="mute">' + T('pqr.perk.exp', { d: dateStr(60) }) + '</small><div class="act">' + act + '</div></div>';
    }).join('');
    $('pqr_events').innerHTML = EVENTS.map(function (e) {
      var on = ev[e.id];
      return '<div class="card pqr-ev"><div class="xtop">' + PC_PARTNER_ICON(e.icon, 22) + '<div><h4>' + T('pqr.ev.' + e.id + '.h') + '</h4><small class="mute">' + dateStr(e.off) + ' &middot; ' + T(e.loc) + '</small></div><span class="pqr-tag">' + T('pqr.sample') + '</span></div><p>' + T('pqr.ev.' + e.id + '.p') + '</p><button class="btn sm' + (on ? ' ghost' : '') + '" data-join="' + e.id + '" aria-pressed="' + !!on + '">' + (on ? '&#10003; ' + T('pqr.ev.joined') : T('pqr.ev.join')) + '</button></div>';
    }).join('');
    [].forEach.call($('pqr_perks').querySelectorAll('[data-claim]'), function (b) { b.onclick = function () {
      var a = claimed(), id = b.dataset.claim; a[id] = 'PC-' + id.toUpperCase().slice(0, 4) + '-' + (Math.abs(hash(id + (S.rewards.best) + (PC.user ? PC.user.id || PC.user.email : 'guest'))) % 1e6 + 1e6).toString(36).slice(-6).toUpperCase(); store.set('pc_pq_claims', JSON.stringify(a)); renderPerks(); }; });
    [].forEach.call($('pqr_events').querySelectorAll('[data-join]'), function (b) { b.onclick = function () { var a = joined(); a[b.dataset.join] = !a[b.dataset.join]; store.set('pc_pq_events', JSON.stringify(a)); renderPerks(); }; });
    $('pqr_perk_note').textContent = R.sample ? T('pqr.perk.sample', { n: R.best }) : T('pqr.perk.yours', { n: R.best });
  }
  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; }

  /* ---------- 7. CTA ---------- */
  function applyHref() { var c = S.cur; return '/apply?steps=' + c.steps + '&ex=' + c.exerciseMin + '&sl=' + c.sleepHours + '&hr=' + c.restingHr; }
  function renderCta() {
    $('pqr_apply').href = applyHref(); $('pqr_apply2').href = applyHref();
    PC.emailQuote($('pqr_email'), function () { var c = S.cur; return { plan: S.plan, steps: c.steps, exerciseMin: c.exerciseMin, sleepHours: c.sleepHours, restingHr: c.restingHr }; });
  }

  /* ---------- plumbing ---------- */
  function observe() {
    var els = document.querySelectorAll('.pqr-grow:not(.in)');
    if (!('IntersectionObserver' in window)) { [].forEach.call(els, function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: 0.2 });
    [].forEach.call(els, function (e) { io.observe(e); });
  }
  function renderAll() {
    var c = S.cur;
    var bk = document.querySelector('.pqr-back'); if (bk) { var kk = S.from ? 'pl2.qback' : 'pqr.back'; bk.setAttribute('data-i18n', kk); bk.href = S.from || '/calculator'; bk.textContent = T(kk); }
    $('pqr_banner').style.display = S.source === 'sample' ? '' : 'none';
    $('pqr_src').textContent = T(S.source === 'wearable' ? 'pqr.src.wearable' : S.source === 'calc' ? 'pqr.src.calc' : 'pqr.src.sample');
    $('pqr_plan_sel').value = S.plan;
    renderHero(); renderFactors(); renderTrend(); renderSavings(); renderPlan(); renderPolicies(); renderPerks(); observe();
  }
  function init() {
    $('pqr_plan_sel').innerHTML = Object.keys(P.PLANS).map(function (k) { return '<option value="' + k + '">' + T('pqr.plan.' + k) + '</option>'; }).join('');
    $('pqr_plan_sel').addEventListener('change', function () { S.plan = this.value; renderAll(); updateWhatIf(); });
    [].forEach.call($('pqr_tr_tog').querySelectorAll('button'), function (b) { b.onclick = function () { S.days = +b.dataset.d; renderTrend(); }; });
    $('pqr_wi_reset').onclick = function () { WI.forEach(function (w) { $('wi_' + w[0]).value = Math.min(w[3], Math.max(w[2], S.cur[w[1]])); }); updateWhatIf(); };
    $('pqr_plan_reset').onclick = function () { store.set('pc_pq_checks', '[]'); renderPlan(); };
    $('pqr_mail').onclick = function () { var e = $('pqr_email'); e.scrollIntoView({ behavior: 'smooth', block: 'center' }); var i = e.querySelector('input'); if (i) setTimeout(function () { i.focus({ preventScroll: true }); }, 350); };
    Promise.all([loadInputs(), loadRewards()]).then(function () {
      buildWhatIf(); renderAll(); renderCta();
      document.querySelector('.pqr').classList.add('ready');
      window.addEventListener('pc:lang', function () { $('pqr_plan_sel').innerHTML = Object.keys(P.PLANS).map(function (k) { return '<option value="' + k + '">' + T('pqr.plan.' + k) + '</option>'; }).join(''); buildWhatIf(); renderAll(); });
    });
  }
  document.addEventListener('DOMContentLoaded', function () { if (!P) return; PC.ready.then(init); });
})();
