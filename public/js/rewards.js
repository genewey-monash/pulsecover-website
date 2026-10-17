/* Rewards page: XP, levels, quests, streaks, badges, vault. All thresholds live in data/rewards-catalog.json (generated to rewards-catalog.js).
   State is kept in localStorage for the demo, one key per concern and per data source, so a backend can replace it later. */
(function () {
  'use strict';
  var C = window.PC_RW_CATALOG;
  var $ = function (id) { return document.getElementById(id); };
  var T = function (k, o) { var s = PC.t(k); if (o) for (var x in o) s = s.split('{' + x + '}').join(o[x]); return s; };
  var esc = function (s) { return PC.esc(String(s)); };
  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    str: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  };
  var icon = function (n, size) { return window.PC_LINE_ICON(n, size || 22); };
  var S = { src: 'sample', days: [], dates: [], user: null, dash: null, R: null, premium: false, realPremium: false, friends: 0, view: 7, bf: 'all', vt: 'all', freezeOpen: false };

  /* ---------- dates ---------- */
  var ymd = function (d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); };
  var addD = function (d, n) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); return x; };
  var TODAY = function () { var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };
  var monday = function (d) { return addD(d, -((d.getDay() + 6) % 7)); };
  var locale = function () { return PC.lang === 'zh' ? 'zh-CN' : PC.lang === 'ms' ? 'ms-MY' : PC.lang === 'ta' ? 'ta-IN' : 'en-MY'; };
  var fdate = function (iso) { var p = String(iso).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString(locale(), { day: 'numeric', month: 'short', year: 'numeric' }); };

  /* ---------- data sources ---------- */
  var hashS = function (str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  var rng = function (seed) { return function () { seed = (seed + 0x6D2B79F5) | 0; var t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  function guestRecords() { // same simulation as PC.guestConnect (28 days)
    var g = LS.get('pc_guest_conn', null); if (!g || !g.providers || !g.providers.length) return null;
    var r0 = rng(hashS(g.seed)), base = { st: 5500 + r0() * 5500, ex: 60 + r0() * 110, sl: 6.2 + r0() * 2, hr: 54 + r0() * 18 }, out = [], t = TODAY();
    for (var i = 27; i >= 0; i--) {
      var d = addD(t, -i), r = rng(hashS(g.seed + ymd(d))), wk = d.getDay() % 6 === 0 ? 0.85 : 1.05;
      out.push({ day: ymd(d), steps: Math.round(base.st * wk * (0.75 + r() * 0.5)), exerciseMin: Math.round((base.ex / 7) * wk * (0.6 + r() * 0.9)), sleepHours: Math.round((base.sl + (r() - 0.5)) * 10) / 10, restingHr: Math.round(base.hr + (r() - 0.5) * 6) });
    }
    return out;
  }
  function sampleRecords() { // clearly labelled SAMPLE: 90 days, modest habits, today partly done
    var r = rng(20260317), out = [], t = TODAY();
    for (var i = 89; i >= 0; i--) {
      var d = addD(t, -i);
      if (i > 0 && r() < 0.07) continue; // days without wearable data
      var f = (89 - i) / 89, wk = d.getDay() % 6 === 0 ? 0.8 : 1.05;
      var rec = { day: ymd(d), steps: Math.round((5300 + 1500 * f) * wk * (0.72 + r() * 0.56)), exerciseMin: Math.round((11 + 5 * f) * wk * (0.5 + r() * 1.0)), sleepHours: Math.round((6.2 + 0.5 * f + (r() - 0.5) * 1.4) * 10) / 10, restingHr: Math.round(70 - 4 * f + (r() - 0.5) * 4) };
      if (i >= 1 && i <= 5) rec.steps = Math.max(rec.steps, 8100 + Math.round(r() * 1500)); // a recent run so the SAMPLE streak is not empty
      if (i === 0) { rec.steps = Math.round(rec.steps * 0.6); rec.exerciseMin = Math.round(rec.exerciseMin * 0.5); }
      out.push(rec);
    }
    return out;
  }
  function dense(recs) { // newest last, one slot per calendar day for the last 90 days (null = no data)
    var map = {}; recs.forEach(function (m) { map[m.day] = m; });
    var t = TODAY(), days = [], dates = [];
    for (var i = 89; i >= 0; i--) { var k = ymd(addD(t, -i)); dates.push(k); days.push(map[k] || null); }
    return { days: days, dates: dates };
  }

  /* ---------- scoring engine for rewards (pure) ---------- */
  var isActive = function (r) { return !!r && (r.steps >= C.activeRule.steps || r.exerciseMin >= C.activeRule.exerciseMin); };
  function streaks(days, dates, freezeDay) {
    var act = days.map(function (r, i) { return isActive(r) || (freezeDay && dates[i] === freezeDay); });
    var best = 0, run = 0; act.forEach(function (a) { run = a ? run + 1 : 0; if (run > best) best = run; });
    var i = act.length - 1; if (!act[i]) i--; var cur = 0; while (i >= 0 && act[i]) { cur++; i--; }
    return { cur: cur, best: best, act: act };
  }
  function blocks(days) { // full 7-day blocks counted back from today, returned oldest first
    var out = []; for (var end = days.length; end - 7 >= 0; end -= 7) out.unshift(days.slice(end - 7, end)); return out;
  }
  var bestRun = function (arr, ok) { var b = 0, r = 0; arr.forEach(function (x) { r = ok(x) ? r + 1 : 0; if (r > b) b = r; }); return b; };
  var avg = function (a) { return a.length ? a.reduce(function (x, y) { return x + y; }, 0) / a.length : 0; };
  function metricValue(m, param, ctx) {
    var days = ctx.days, have = days.filter(Boolean);
    switch (m) {
      case 'daysSteps': return have.filter(function (r) { return r.steps >= param; }).length;
      case 'daysSleep': return have.filter(function (r) { return r.sleepHours >= param; }).length;
      case 'hrDays': return have.filter(function (r) { return r.restingHr > 0; }).length;
      case 'daysConnected': return have.length;
      case 'weekExerciseBest': return Math.max.apply(null, [0].concat(blocks(days).map(function (b) { return b.reduce(function (s, r) { return s + (r ? r.exerciseMin : 0); }, 0); })));
      case 'weeksExerciseRun': return bestRun(blocks(days), function (b) { return b.reduce(function (s, r) { return s + (r ? r.exerciseMin : 0); }, 0) >= param; });
      case 'weekWearBest': return Math.max.apply(null, [0].concat(blocks(days).map(function (b) { return b.filter(Boolean).length; })));
      case 'weeksWearRun': return bestRun(blocks(days), function (b) { return b.filter(Boolean).length >= param; });
      case 'hrImprove': {
        if (days.length < param - 2) return 0;
        var seg = days.slice(-param).filter(function (r) { return r && r.restingHr > 0; }).map(function (r) { return r.restingHr; });
        if (seg.length < 14) return 0;
        return Math.max(0, Math.round((avg(seg.slice(0, 7)) - avg(seg.slice(-7))) * 10) / 10);
      }
      case 'streakBest': return Math.max(ctx.streakBest || 0, streaks(days, ctx.dates, ctx.freeze).best);
      case 'friends': return ctx.friends;
      case 'xpBase': return ctx.xpBase;
    }
    return 0;
  }
  var REPLAYABLE = { daysSteps: 1, daysSleep: 1, hrDays: 1, daysConnected: 1, weekExerciseBest: 1, weeksExerciseRun: 1, weekWearBest: 1, weeksWearRun: 1, hrImprove: 1 };

  function compute() {
    var ctx0 = { days: S.days, dates: S.dates, friends: S.friends, freeze: freezeDay(), streakBest: S.R ? S.R.best : 0 };
    var st = streaks(S.days, S.dates, ctx0.freeze), have = S.days.filter(Boolean);
    var best = Math.max(st.best, ctx0.streakBest), cur = Math.max(st.cur, S.R ? S.R.streak : 0);
    var activeDays = S.days.filter(isActive).length;
    var xp = { daily: activeDays * C.xp.activeDay, wear: have.length * C.xp.wearDay, streak: 0, ref: S.friends * C.xp.referral, quest: 0, badge: 0 };
    C.milestones.forEach(function (n) { if (best >= n) xp.streak += C.xp.streak[n]; });
    var ledger = LS.get(key('q'), {}); Object.keys(ledger).forEach(function (k) { xp.quest += ledger[k]; });
    var seen = LS.get(key('seen'), {}), earnedList = [];
    var badges = C.badges.map(function (b) {
      var vals = [], earned = 0, prevOk = true;
      b.tiers.forEach(function (t, i) { // 'lvl' tiers need the XP of everything else first, handled below
        if (b.id === 'lvl') { vals.push(0); return; }
        var v = metricValue(t.metric, t.param, Object.assign({}, ctx0, { xpBase: 0 })); vals.push(v);
        if (prevOk && v >= t.need) earned = i + 1; else prevOk = false;
      });
      return { def: b, vals: vals, tier: earned };
    });
    badges.forEach(function (b) { if (b.def.id !== 'lvl') for (var i = 0; i < b.tier; i++) xp.badge += b.def.tiers[i].xp; });
    var xpBase = xp.daily + xp.wear + xp.streak + xp.ref + xp.quest + xp.badge;
    var lvl = badges.filter(function (b) { return b.def.id === 'lvl'; })[0];
    var pv = true; lvl.def.tiers.forEach(function (t, i) { lvl.vals[i] = xpBase; if (pv && xpBase >= t.need) lvl.tier = i + 1; else pv = false; });
    for (var i = 0; i < lvl.tier; i++) xp.badge += lvl.def.tiers[i].xp;
    var total = xpBase + lvl.def.tiers.slice(0, lvl.tier).reduce(function (s, t) { return s + t.xp; }, 0);
    var li = 0; C.levels.forEach(function (l, i) { if (total >= l.xp) li = i; });
    // earned dates: replay the daily series where possible, otherwise the day first seen
    badges.forEach(function (b) {
      b.dates = []; b.def.tiers.forEach(function (t, i) {
        if (i >= b.tier) { b.dates.push(null); return; }
        var d = null;
        if (REPLAYABLE[t.metric] || t.metric === 'streakBest') {
          for (var k = 1; k <= S.days.length; k++) {
            var c2 = { days: S.days.slice(0, k), dates: S.dates.slice(0, k), friends: 0, freeze: ctx0.freeze, streakBest: 0 };
            if (metricValue(t.metric, t.param, c2) >= t.need) { d = S.dates[k - 1]; break; }
          }
        }
        if (!d) d = seen[b.def.id + ':' + (i + 1)] || ymd(TODAY());
        b.dates.push(d);
      });
    });
    return { st: st, best: best, cur: cur, activeDays: activeDays, have: have.length, xp: xp, total: total, li: li, badges: badges, ledger: ledger, seen: seen, ctx: ctx0 };
  }
  var key = function (k) { return 'pc_rw_' + k + '_' + S.src; };
  var freezeDay = function () { var f = LS.get(key('freeze'), null); return f && f.week === ymd(monday(TODAY())) ? f.day : null; };

  /* ---------- quests ---------- */
  function questProgress(q, M) {
    var t = TODAY(), tk = ymd(t), mk = ymd(monday(t)), today = null, week = [];
    S.days.forEach(function (r, i) { if (S.dates[i] === tk) today = r; if (S.dates[i] >= mk) week.push(r); });
    switch (q.metric) {
      case 'stepsToday': return today ? today.steps : 0;
      case 'sleepToday': return today ? today.sleepHours : 0;
      case 'exerciseWeek': return week.reduce(function (s, r) { return s + (r ? r.exerciseMin : 0); }, 0);
      case 'sleepNightsWeek': return week.filter(function (r) { return r && r.sleepHours >= 7; }).length;
      case 'wearDaysWeek': return week.filter(Boolean).length;
    }
    return 0;
  }
  var periodKey = function (q) { var t = TODAY(); return q.id + '@' + (q.period === 'day' ? ymd(t) : ymd(monday(t))); };
  function resetIn(period) {
    var now = new Date(), end = period === 'day' ? addD(TODAY(), 1) : addD(monday(TODAY()), 7), ms = Math.max(0, end - now), m = Math.floor(ms / 60000), d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60);
    return d ? d + 'd ' + h + 'h' : h + 'h ' + (m % 60) + 'm';
  }

  /* ---------- small UI helpers ---------- */
  function ring(frac, size, col, inner) {
    var r = size / 2 - 5, c = 2 * Math.PI * r;
    return '<span class="rw2-ring" style="width:' + size + 'px;height:' + size + 'px"><svg viewBox="0 0 ' + size + ' ' + size + '" aria-hidden="true"><circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" class="t"/><circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" class="v" style="stroke:' + col + '" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + (c * (1 - Math.max(0, Math.min(1, frac)))).toFixed(1) + '"/></svg><b>' + inner + '</b></span>';
  }
  var bar = function (frac, cls) { return '<div class="rw2-bar ' + (cls || '') + '" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(Math.max(0, Math.min(1, frac)) * 100) + '"><i style="width:' + Math.round(Math.max(0, Math.min(1, frac)) * 100) + '%"></i></div>'; };
  var tag = function () { return S.src === 'real' ? '' : '<span class="rw2-tag">' + T('rw2.sample') + '</span>'; };
  var num = function (n) { return PC.fmt(n, Math.abs(n % 1) > 0.001 ? 1 : 0); };
  var tierName = function (i) { return T('rw2.t.' + i); };
  var levelName = function (i) { return T('rw2.level.' + C.levels[i].id); };
  var TIERCOL = ['', 'var(--rw-bronze)', 'var(--rw-silver)', 'var(--rw-gold)'];

  /* ---------- celebrations (respect reduced motion) ---------- */
  var reduced = function () { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  function toast(msg) {
    var el = $('rw2_toast'); el.textContent = msg; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function () { el.classList.remove('on'); }, 3600);
  }
  function confetti(x, y) {
    if (reduced()) return;
    var host = $('rw2_conf'), cols = ['#B71234', '#E8A317', '#1B8A5A', '#4C7DF0', '#F2C561'];
    for (var i = 0; i < 26; i++) {
      var p = document.createElement('i'), a = Math.random() * Math.PI * 2, v = 90 + Math.random() * 150;
      p.style.cssText = 'left:' + x + 'px;top:' + y + 'px;background:' + cols[i % cols.length] + ';width:' + (6 + Math.random() * 5) + 'px;height:' + (8 + Math.random() * 6) + 'px';
      host.appendChild(p);
      var an = p.animate([{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: 'translate(' + Math.cos(a) * v + 'px,' + (Math.sin(a) * v + 140) + 'px) rotate(' + (Math.random() * 720 - 360) + 'deg)', opacity: 0 }], { duration: 1100 + Math.random() * 500, easing: 'cubic-bezier(.2,.7,.3,1)' });
      an.onfinish = (function (el) { return function () { el.remove(); }; })(p);
    }
  }
  var centerConf = function () { confetti(innerWidth / 2, innerHeight * 0.38); };
  function popin(b, tier) {
    var el = $('rw2_pop'); el.innerHTML = '<div class="rw2-pop-in" style="--c:' + TIERCOL[tier] + '"><span class="ic">' + icon(b.def.icon, 40) + '</span><b>' + esc(T('rw2.b.' + b.def.id + '.n')) + '</b><small>' + esc(tierName(tier)) + '</small></div>';
    el.classList.add('on'); clearTimeout(popin.t); popin.t = setTimeout(function () { el.classList.remove('on'); }, 2800);
  }

  /* ---------- renderers ---------- */
  function renderPlayer(M) {
    var nxt = C.levels[M.li + 1], cur = C.levels[M.li], u = S.user, init = (u && u.name ? u.name.trim().charAt(0) : '?').toUpperCase();
    var frac = nxt ? (M.total - cur.xp) / (nxt.xp - cur.xp) : 1, earned = M.badges.reduce(function (s, b) { return s + b.tier; }, 0), all = C.badges.length * 3;
    $('rw2_player').innerHTML =
      '<div class="rw2-ph"><span class="rw2-av" aria-hidden="true">' + esc(init) + '</span><div class="rw2-pn"><div class="rw2-pr"><b>' + esc(levelName(M.li)) + '</b><span class="rw2-chip ' + (S.premium ? 'prem' : '') + '">' + T(S.premium ? 'rw2.premium' : 'rw2.free') + '</span>' + tag() + '</div>' +
      '<small>' + T('rw2.xp') + ' ' + PC.fmt(M.total, 0) + (nxt ? ' &middot; ' + T('rw2.toNext', { n: PC.fmt(nxt.xp - M.total, 0), l: levelName(M.li + 1) }) : ' &middot; ' + T('rw2.maxlvl')) + '</small>' + bar(frac, 'red') + '</div></div>' +
      '<div class="rw2-pstats"><div><span class="fl">' + icon('flame', 22) + '</span><b>' + M.cur + '</b><small>' + T('rw2.streakday') + '</small></div><div><b>' + M.best + '</b><small>' + T('rw2.longest') + '</small></div><div><b>' + earned + ' / ' + all + '</b><small>' + esc(T('rw2.badges', { a: earned, b: all })) + '</small></div></div>';
  }
  function renderQuests(M) {
    var li = M.li;
    var card = function (q) {
      var locked = q.minLevel && C.levels.map(function (l) { return l.id; }).indexOf(q.minLevel) > li;
      var v = questProgress(q, M), done = !locked && v >= q.goal, st = locked ? 'locked' : done ? 'done' : 'progress';
      var shown = q.unit === 'h' ? Math.min(v, q.goal) : Math.min(Math.round(v), q.goal), frac = locked ? 0 : Math.min(1, v / q.goal);
      var goalTxt = T('rw2.q.' + q.id, { n: PC.fmt(q.goal, 0) });
      return '<div class="card rw2-q ' + st + '"><div class="rw2-qr">' + ring(frac, 64, done ? 'var(--rw-ok)' : 'var(--red)', done ? '&#10003;' : Math.round(frac * 100) + '%') + '<div><b>' + esc(goalTxt) + '</b><small>' + (locked ? T('rw2.q.locked', { l: levelName(C.levels.map(function (l) { return l.id; }).indexOf(q.minLevel)) }) : PC.fmt(shown, q.unit === 'h' ? 1 : 0) + ' / ' + PC.fmt(q.goal, 0) + ' ' + T('rw2.u.' + q.unit)) + '</small></div></div>' +
        '<div class="rw2-qf"><span class="rw2-st ' + st + '">' + T('rw2.st.' + st) + '</span><span class="rw2-xpc">' + T('rw2.q.xp', { n: q.xp }) + '</span></div>' + (locked ? '' : '<small class="rw2-rs" data-reset="' + q.period + '">' + T('rw2.q.reset', { t: resetIn(q.period) }) + '</small>') + '</div>';
    };
    var by = function (p) { return C.quests.filter(function (q) { return q.period === p; }).map(card).join(''); };
    $('rw2_quests').innerHTML = '<h3 class="rw2-sub">' + T('rw2.q.daily') + ' ' + tag() + '</h3><div class="cards c2">' + by('day') + '</div><h3 class="rw2-sub">' + T('rw2.q.weekly') + '</h3><div class="cards c3">' + by('week') + '</div>';
  }
  function renderStreaks(M) {
    var t = TODAY(), fz = freezeDay(), n = S.view, firstIdx = S.days.length - n, cells = '';
    for (var i = firstIdx; i < S.days.length; i++) {
      var iso = S.dates[i], r = S.days[i], act = isActive(r), frozen = !act && fz === iso, d = new Date(iso + 'T12:00:00');
      var lab = n === 7 ? d.toLocaleDateString(locale(), { weekday: 'short' }) : d.getDate();
      var cls = act ? 'on' : frozen ? 'fz' : 'off', isToday = iso === ymd(t);
      cells += '<div class="rw2-d ' + cls + (isToday ? ' td' : '') + '" title="' + esc(fdate(iso) + ': ' + T(act ? 'rw2.s.active' : frozen ? 'rw2.s.frozen' : 'rw2.s.missed')) + '"><small>' + esc(lab) + '</small><span>' + (act ? '&#10003;' : frozen ? '&#10052;' : '&middot;') + '</span></div>';
    }
    var missed = []; for (var j = S.days.length - 7; j < S.days.length - 1; j++) if (!isActive(S.days[j]) && fz !== S.dates[j]) missed.push(S.dates[j]);
    var freezeHtml = fz ? '<p class="rw2-fz ok">' + T('rw2.s.freeze.used', { d: fdate(fz) }) + '</p>' : !missed.length ? '<p class="rw2-fz">' + T('rw2.s.freeze.none') + '</p>' : '<button type="button" class="btn ghost sm" id="rw2_fzbtn" aria-expanded="' + S.freezeOpen + '">' + T('rw2.s.freeze.use') + '</button>' + (S.freezeOpen ? '<div class="rw2-fzpick"><small>' + T('rw2.s.freeze.pick') + '</small>' + missed.map(function (m) { return '<button type="button" class="btn ghost sm" data-fz="' + m + '">' + esc(fdate(m)) + '</button>'; }).join('') + '</div>' : '');
    var ach = [['first', M.have >= 1], ['s3', M.best >= 3], ['s7', M.best >= 7], ['s14', M.best >= 14], ['s30', M.best >= 30], ['s60', M.best >= 60]];
    $('rw2_streak').innerHTML = '<div class="card rw2-sk"><div class="rw2-big"><span class="fl">' + icon('flame', 44) + '</span><div><b>' + M.cur + '</b><small>' + T('rw2.streakday') + ' ' + tag() + '</small></div></div>' +
      '<div class="rw2-seg" role="group"><button type="button" data-v="7" class="' + (n === 7 ? 'on' : '') + '" aria-pressed="' + (n === 7) + '">' + T('rw2.s.week') + '</button><button type="button" data-v="30" class="' + (n === 30 ? 'on' : '') + '" aria-pressed="' + (n === 30) + '">' + T('rw2.s.month') + '</button></div>' +
      '<div class="rw2-strip n' + n + '">' + cells + '</div><p class="rw2-fn">' + T('rw2.s.p') + '</p></div>' +
      '<div class="card rw2-fzc"><div class="rw2-shield">' + icon('star', 26) + '</div><div><h3>' + T('rw2.s.freeze') + '</h3><p>' + T('rw2.s.freeze.p') + '</p>' + freezeHtml + '</div></div>';
    $('rw2_ms').innerHTML = '<h3 class="rw2-sub">' + T('rw2.s.ms') + '</h3><div class="rw2-msr">' + C.milestones.map(function (m) { var ok = M.best >= m; return '<div class="rw2-m ' + (ok ? 'on' : '') + '"><span>' + (ok ? '&#10003;' : m) + '</span><b>' + T('rw2.s.ms.n', { n: m }) + '</b><small>' + T('rw2.s.ms.bonus', { n: C.xp.streak[m] }) + '</small></div>'; }).join('') + '</div>' +
      '<div class="rw2-chips">' + ach.map(function (a) { return '<span class="rw2-ac ' + (a[1] ? 'on' : '') + '">' + (a[1] ? '&#10003; ' : '') + T('ach.' + a[0]) + '</span>'; }).join('') + '</div>';
    [].forEach.call($('rw2_streak').querySelectorAll('[data-v]'), function (b) { b.onclick = function () { S.view = +b.dataset.v; renderStreaks(M); }; });
    var fb = $('rw2_fzbtn'); if (fb) fb.onclick = function () { S.freezeOpen = !S.freezeOpen; renderAll(); };
    [].forEach.call($('rw2_streak').querySelectorAll('[data-fz]'), function (b) { b.onclick = function () { LS.set(key('freeze'), { week: ymd(monday(TODAY())), day: b.dataset.fz }); S.freezeOpen = false; renderAll(); toast(T('rw2.s.freeze.used', { d: fdate(b.dataset.fz) })); }; });
  }
  function badgeBlock(b) {
    var d = b.def, t = b.tier, next = t < 3 ? d.tiers[t] : null, val = next ? b.vals[t] : d.tiers[2].need, frac = next ? Math.min(1, val / next.need) : 1;
    var col = t ? TIERCOL[t] : 'var(--rw-lock)', shown = next ? PC.fmt(Math.min(val, next.need), val % 1 ? 1 : 0) + ' / ' + PC.fmt(next.need, 0) + ' ' + T('rw2.u.' + next.unit) : T('rw2.b.max');
    var open = S.openBadge === d.id;
    var tiers = d.tiers.map(function (x, i) { var ok = i < t; return '<li class="' + (ok ? 'ok' : '') + '"><span class="tn" style="color:' + TIERCOL[i + 1] + '">' + tierName(i + 1) + '</span> ' + esc(T('rw2.b.' + d.id + '.' + (i + 1))) + (ok ? ' <small>&#10003; ' + esc(T('rw2.b.earned', { d: fdate(b.dates[i]) })) + '</small>' : ' <small>(' + (i === t ? shown : T('rw2.st.locked')) + ')</small>') + '</li>'; }).join('');
    return '<button type="button" class="card rw2-bd ' + (t ? 'earned' : 'locked') + (open ? ' open' : '') + '" data-b="' + d.id + '" aria-expanded="' + open + '" style="--c:' + col + '"><span class="ic">' + icon(d.icon, 28) + '</span>' +
      '<span class="bn"><small>' + T('rw2.cat.' + d.category) + '</small><b>' + esc(T('rw2.b.' + d.id + '.n')) + '</b><em>' + (t ? tierName(t) : T('rw2.t.none')) + '</em></span>' + bar(frac, t ? 'tier' : 'lock') +
      '<span class="bp">' + shown + (next ? '<br><small>' + esc(T('rw2.b.nexttier', { t: T('rw2.b.' + d.id + '.' + (t + 1)) })) + '</small>' : '') + '</span>' + (t ? '<span class="bd">' + esc(T('rw2.b.earned', { d: fdate(b.dates[t - 1]) })) + '</span>' : '') + (open ? '<ul class="bt">' + tiers + '</ul>' : '') + '</button>';
  }
  function renderBadges(M) {
    var f = S.bf, list = M.badges.filter(function (b) { var nextFrac = b.tier < 3 ? b.vals[b.tier] / b.def.tiers[b.tier].need : 1; return f === 'all' || (f === 'earned' && b.tier > 0) || (f === 'progress' && b.tier < 3 && nextFrac > 0) || (f === 'locked' && b.tier === 0 && nextFrac === 0); });
    // next badge: highest progress towards a tier that is not yet earned
    var cand = M.badges.filter(function (b) { return b.tier < 3; }).map(function (b) { return { b: b, frac: Math.min(1, b.vals[b.tier] / b.def.tiers[b.tier].need) }; }).sort(function (a, b) { return b.frac - a.frac; })[0];
    var nb = '';
    if (cand) { var x = cand.b, nt = x.def.tiers[x.tier]; nb = '<div class="card rw2-next"><span class="ic" style="--c:' + TIERCOL[x.tier + 1] + '">' + icon(x.def.icon, 30) + '</span><div><small>' + T('rw2.b.next') + '</small><b>' + esc(T('rw2.b.' + x.def.id + '.n')) + ' (' + tierName(x.tier + 1) + ')</b><p>' + esc(T('rw2.b.' + x.def.id + '.' + (x.tier + 1))) + '</p>' + bar(cand.frac, 'red') + '<small>' + PC.fmt(Math.min(x.vals[x.tier], nt.need), x.vals[x.tier] % 1 ? 1 : 0) + ' / ' + PC.fmt(nt.need, 0) + ' ' + T('rw2.u.' + nt.unit) + ' &middot; ' + T('rw2.q.xp', { n: nt.xp }) + '</small></div></div>'; }
    $('rw2_next').innerHTML = nb;
    var tabs = ['all', 'earned', 'progress', 'locked'];
    $('rw2_bf').innerHTML = tabs.map(function (k) { return '<button type="button" class="' + (f === k ? 'on' : '') + '" data-f="' + k + '" aria-pressed="' + (f === k) + '">' + T('rw2.f.' + k) + '</button>'; }).join('');
    $('rw2_badges').innerHTML = list.length ? list.map(badgeBlock).join('') : '<p class="mute">' + T('rw2.v.empty') + '</p>';
    var hist = []; M.badges.forEach(function (b) { for (var i = 0; i < b.tier; i++) hist.push({ b: b, tier: i + 1, date: b.dates[i], xp: b.def.tiers[i].xp }); });
    hist.sort(function (a, c) { return a.date < c.date ? 1 : a.date > c.date ? -1 : c.tier - a.tier; });
    $('rw2_hist').innerHTML = hist.length ? '<ul>' + hist.map(function (h) { return '<li><span class="ic" style="--c:' + TIERCOL[h.tier] + '">' + icon(h.b.def.icon, 18) + '</span><div><b>' + esc(T('rw2.b.' + h.b.def.id + '.n')) + '</b> <em style="color:' + TIERCOL[h.tier] + '">' + tierName(h.tier) + '</em><small>' + esc(fdate(h.date)) + '</small></div><span class="xp">' + T('rw2.q.xp', { n: h.xp }) + '</span></li>'; }).join('') + '</ul>' : '<p class="mute">' + T('rw2.b.hist.none') + '</p>';
    [].forEach.call($('rw2_bf').querySelectorAll('[data-f]'), function (b) { b.onclick = function () { S.bf = b.dataset.f; renderBadges(M); }; });
    [].forEach.call($('rw2_badges').querySelectorAll('[data-b]'), function (b) { b.onclick = function () { S.openBadge = S.openBadge === b.dataset.b ? null : b.dataset.b; renderBadges(M); var el = $('rw2_badges').querySelector('[data-b="' + b.dataset.b + '"]'); if (el) el.focus({ preventScroll: true }); }; });
  }
  function renderLevels(M) {
    $('rw2_levels').innerHTML = C.levels.map(function (l, i) {
      var st = i < M.li ? 'done' : i === M.li ? 'now' : '';
      return '<li class="' + st + '"><span class="dot">' + (i < M.li ? '&#10003;' : i + 1) + '</span><div><b>' + levelName(i) + '</b> <small>' + T('rw2.l.at', { n: PC.fmt(l.xp, 0) }) + (i === M.li ? ' &middot; ' + T('rw2.l.you') : '') + '</small><p>' + T('rw2.l.u.' + l.id) + '</p></div></li>';
    }).join('');
    var s = C.xp.streak;
    $('rw2_xpl').innerHTML = '<li>' + T('rw2.xp.daily', { n: C.xp.activeDay }) + '</li><li>' + T('rw2.xp.quest') + '</li><li>' + T('rw2.xp.badge') + '</li><li>' + T('rw2.xp.streak', { a: s[7], b: s[14], c: s[30], d: s[60] }) + '</li><li>' + T('rw2.xp.wear', { n: C.xp.wearDay }) + '</li><li>' + T('rw2.xp.ref', { n: C.xp.referral }) + '</li>';
  }
  /* ---- vault ---- */
  var lvIdx = function (id) { return C.levels.map(function (l) { return l.id; }).indexOf(id); };
  function reqMet(it, M) { var r = it.req; if (!r) return true; if (r.level) return M.li >= lvIdx(r.level); var b = M.badges.filter(function (x) { return x.def.id === r.badge; })[0]; return b.tier >= r.tier; }
  function reqText(it) { var r = it.req; if (!r) return null; if (r.level) return T('rw2.v.byLevel', { l: levelName(lvIdx(r.level)) }); return T('rw2.v.byBadge', { b: T('rw2.b.' + r.badge + '.n'), t: tierName(r.tier) }); }
  function codeFor(it) {
    var sc = S.R && S.R.coupons && S.R.coupons.filter(function (c) { return c.id === it.id && c.code; })[0]; if (sc) return sc.code;
    return 'PC-' + it.id.toUpperCase().slice(0, 4) + '-' + ('000000' + (hashS((S.user ? S.user.email || S.user.id : 'guest') + it.id) % 1679616).toString(36)).slice(-6).toUpperCase();
  }
  function renderVault(M) {
    var claims = LS.get(key('claims'), {}), tab = S.vt;
    var items = C.vault.map(function (it) { var met = reqMet(it, M), premOk = !it.premium || S.premium, claimed = claims[it.id]; return { it: it, met: met, premOk: premOk, state: claimed ? 'claimed' : (met && premOk) ? 'open' : 'locked', claimed: claimed }; })
      .filter(function (x) { return tab === 'all' || (tab === 'unlocked' && x.state !== 'locked') || (tab === 'locked' && x.state === 'locked') || (tab === 'events' && x.it.kind === 'event'); });
    var tabs = ['all', 'unlocked', 'locked', 'events'];
    $('rw2_vt').innerHTML = tabs.map(function (k) { return '<button type="button" class="' + (tab === k ? 'on' : '') + '" data-t="' + k + '" aria-pressed="' + (tab === k) + '">' + T('rw2.v.' + k) + '</button>'; }).join('');
    $('rw2_vault').innerHTML = items.length ? items.map(function (x) {
      var it = x.it, ev = it.kind === 'event', rt = reqText(it), joined = ev && x.claimed;
      var act;
      if (x.state === 'claimed') act = ev ? '<span class="rw2-ok">&#10003; ' + T('rw2.v.joined') + '</span>' : '<div class="rw2-code"><span class="rw2-ok">&#10003; ' + T('rw2.v.claimed') + '</span><small>' + T('rw.code') + '</small><code>' + esc(x.claimed) + '</code></div>';
      else if (x.state === 'open') act = '<button type="button" class="btn sm" data-claim="' + it.id + '">' + T(ev ? 'rw2.v.join' : 'rw2.v.claim') + '</button>';
      else act = (!x.premOk ? '<a class="btn sm" href="/premium-quote">' + T('rw2.v.go') + '</a>' : '') + (!x.met ? '<small class="rw2-need">' + T('rw2.v.need', { x: rt }) + '</small>' : '');
      return '<div class="card rw2-v ' + (x.state === 'locked' ? 'locked' : '') + '"><div class="xtop">' + PC_PARTNER_ICON(it.icon, 22, x.state === 'locked') + '<div><b>' + T(it.k + '.h') + '</b></div><div class="chips">' + (it.premium ? '<span class="rw2-chip prem">' + T('rw2.v.premium') + '</span>' : '') + '<span class="rw2-tag">' + T('rw2.sample') + '</span></div></div>' +
        '<p>' + T(it.k + '.p') + '</p>' + (ev ? '<small class="mute">' + new Date(Date.now() + it.off * 86400000).toLocaleDateString(locale(), { day: 'numeric', month: 'short', year: 'numeric' }) + ' &middot; ' + T(it.loc) + '</small>' : '<small class="mute">' + T('rw2.v.exp', { d: new Date(Date.now() + 60 * 86400000).toLocaleDateString(locale(), { day: 'numeric', month: 'short', year: 'numeric' }) }) + '</small>') +
        '<small class="rw2-by">' + (rt ? T('rw2.v.by', { x: rt }) : T('rw2.v.by', { x: T('rw2.v.premium') })) + '</small><div class="act">' + act + '</div></div>';
    }).join('') : '<p class="mute">' + T('rw2.v.empty') + '</p>';
    [].forEach.call($('rw2_vt').querySelectorAll('[data-t]'), function (b) { b.onclick = function () { S.vt = b.dataset.t; renderVault(M); }; });
    [].forEach.call($('rw2_vault').querySelectorAll('[data-claim]'), function (b) {
      b.onclick = function (e) {
        var it = C.vault.filter(function (v) { return v.id === b.dataset.claim; })[0], c = LS.get(key('claims'), {}); c[it.id] = it.kind === 'event' ? 'joined' : codeFor(it); LS.set(key('claims'), c);
        var r = b.getBoundingClientRect(); confetti(r.left + r.width / 2, r.top); renderVault(M);
      };
    });
  }
  function renderSocial(M) {
    var u = S.user, on = LS.get('pc_rw_fc', false), you = M.total, fr = [['1', 420], ['2', 180], ['3', 640]];
    $('rw2_ref').innerHTML = '<div class="card"><h3>' + T('rw2.r.h') + '</h3><p>' + T('rw2.r.p') + '</p>' + (u && u.refcode ? '<div class="rw2-rc"><small>' + T('rw2.r.code') + '</small><code>' + esc(u.refcode) + '</code><button type="button" class="btn ghost sm" id="rw2_copy" data-copy="' + esc(u.refcode) + '">' + T('rw.copy') + '</button></div><small class="mute">' + T('rw2.r.count', { n: S.friends }) + '</small>' : '<div class="cta" style="margin-top:12px"><a class="btn sm" href="/account?next=/rewards">' + T('rw2.r.login') + '</a></div>') + '</div>' +
      '<div class="card"><h3>' + T('rw2.fc.h') + (on ? ' <span class="rw2-tag">' + T('rw2.sample') + '</span>' : '') + '</h3><p>' + T('rw2.fc.p') + '</p><label class="check"><input type="checkbox" id="rw2_fc"' + (on ? ' checked' : '') + '><span>' + T('rw2.fc.opt') + '</span></label>' +
      (on ? '<ul class="rw2-fl">' + [['you', you]].concat(fr.map(function (f) { return [T('rw2.fc.friend', { n: f[0] }), f[1]]; })).map(function (f) { return '<li' + (f[0] === 'you' ? ' class="me"' : '') + '><span class="av">' + esc((f[0] === 'you' ? T('rw2.fc.you') : f[0]).charAt(0)) + '</span><b>' + esc(f[0] === 'you' ? T('rw2.fc.you') : f[0]) + '</b><span>' + PC.fmt(f[1], 0) + ' ' + T('rw2.xp') + '</span></li>'; }).join('') + '</ul><p class="rw2-fn">' + T('rw2.fc.note') + '</p>' : '') + '</div>';
    var fc = $('rw2_fc'); fc.onchange = function () { LS.set('pc_rw_fc', fc.checked); renderSocial(M); };
    var cp = $('rw2_copy'); if (cp) cp.onclick = function () { try { navigator.clipboard.writeText(cp.dataset.copy); } catch (e) {} cp.textContent = T('rw.copied'); };
    $('rw2_upgrade').style.display = S.premium ? 'none' : '';
  }

  /* ---------- orchestration ---------- */
  var M = null;
  function celebrate(M) {
    // quests: award XP once per period, then celebrate
    var ledger = LS.get(key('q'), {}), msgs = [];
    C.quests.forEach(function (q) {
      var locked = q.minLevel && lvIdx(q.minLevel) > M.li; if (locked) return;
      var k = periodKey(q); if (!ledger[k] && questProgress(q, M) >= q.goal) { ledger[k] = q.xp; msgs.push(T('rw2.q.done', { q: T('rw2.q.' + q.id, { n: PC.fmt(q.goal, 0) }), n: q.xp })); }
    });
    var changed = msgs.length > 0; if (changed) LS.set(key('q'), ledger);
    // badges: celebrate the best new tier, mark everything seen
    var seen = LS.get(key('seen'), {}), fresh = [];
    M.badges.forEach(function (b) { for (var i = 0; i < b.tier; i++) { var k2 = b.def.id + ':' + (i + 1); if (!seen[k2]) { fresh.push({ b: b, tier: i + 1 }); seen[k2] = b.dates[i]; } } });
    var first = !LS.get(key('init'), false); LS.set(key('init'), true);
    if (fresh.length) LS.set(key('seen'), seen);
    return { changed: changed, msgs: msgs, fresh: first && fresh.length > 1 ? [fresh.sort(function (a, c) { return c.tier - a.tier; })[0]] : fresh, extra: first ? fresh.length - 1 : 0 };
  }
  function renderAll(skipCelebrate) {
    M = compute();
    var cel = skipCelebrate ? null : celebrate(M);
    if (cel && cel.changed) M = compute(); // XP from quests changes level
    renderPlayer(M); renderQuests(M); renderStreaks(M); renderBadges(M); renderLevels(M); renderVault(M); renderSocial(M);
    $('rw2_banner').style.display = S.src === 'real' ? 'none' : '';
    $('rw2_premdemo').style.display = S.realPremium ? 'none' : '';
    $('rw2_pd').checked = LS.get('pc_rw_demo_prem', false);
    if (cel) {
      var msgs = cel.msgs.slice();
      if (cel.fresh.length) { var f = cel.fresh[0]; msgs.unshift(T('rw2.b.unlocked', { b: T('rw2.b.' + f.b.def.id + '.n'), t: tierName(f.tier) }) + (cel.extra > 0 ? ' · ' + T('rw2.b.more', { n: cel.extra }) : '')); setTimeout(function () { popin(f.b, f.tier); centerConf(); }, 350); }
      else if (cel.msgs.length) setTimeout(centerConf, 250);
      if (msgs.length) setTimeout(function () { toast(msgs[0]); }, 500);
    }
  }
  function load() {
    var tasks = [];
    if (PC.user) {
      tasks.push(PC.api('/dashboard').then(function (d) { S.dash = d; }).catch(function () {}));
      tasks.push(PC.api('/rewards').then(function (r) { S.R = r; }).catch(function () {}));
    }
    return Promise.all(tasks).then(function () {
      var recs = null; S.user = PC.user || null;
      if (S.dash) { S.user = S.dash.user || S.user; S.friends = S.dash.referrals || 0; S.realPremium = !!(S.dash.policy && +S.dash.policy.app_sub); if ((S.dash.metrics || []).length >= 7) recs = S.dash.metrics; }
      if (!recs && !PC.user) { var g = guestRecords(); if (g) recs = g; }
      S.src = recs ? 'real' : 'sample';
      if (!recs) { recs = sampleRecords(); S.friends = 1; S.R = null; S.realPremium = false; }
      var d = dense(recs); S.days = d.days; S.dates = d.dates;
      S.premium = S.realPremium || !!LS.get('pc_rw_demo_prem', false);
    });
  }
  function init() {
    $('rw2_pd').onchange = function () { LS.set('pc_rw_demo_prem', this.checked); S.premium = S.realPremium || this.checked; renderAll(true); };
    load().then(function () {
      renderAll();
      document.querySelector('.rw2').classList.add('ready');
      setInterval(function () { [].forEach.call(document.querySelectorAll('[data-reset]'), function (el) { el.textContent = T('rw2.q.reset', { t: resetIn(el.dataset.reset) }); }); }, 30000);
      window.addEventListener('pc:lang', function () { renderAll(true); });
    });
  }
  document.addEventListener('DOMContentLoaded', function () { if (!C) return; PC.ready.then(init); });
})();
