/* PulseCover shared client: chrome (banner, header, mega menus, search, floating widgets, footer), language engine, API helper. */
(function () {
  const LANGS = window.PC_LANGS, DICT = window.PC_I18N, idx = { en: 0, zh: 1, ms: 2, ta: 3 };
  let lang = 'en';
  try { lang = localStorage.getItem('pc_lang') || 'en'; } catch (e) {}
  if (!(lang in idx)) lang = 'en';
  const PC = { user: null, get lang() { return lang; } };
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  PC.t = (k) => (DICT[k] ? (DICT[k][idx[lang]] || DICT[k][0]) : k);
  PC.fmt = (n, d = 2) => Number(n).toLocaleString('en-MY', { minimumFractionDigits: d, maximumFractionDigits: d });
  PC.esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  PC.planName = (id) => PC.t('plan.word') + ' ' + id;
  PC.api = async (path, body) => {
    const r = await fetch('/api' + path, body === undefined ? {} : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    let j = {}; try { j = await r.json(); } catch (e) {}
    if (!r.ok) { const err = new Error(j.error || PC.t('common.error')); err.status = r.status; throw err; }
    return j;
  };
  PC.msg = (el, text, ok) => { el.className = 'msg ' + (ok ? 'ok' : 'err'); el.textContent = text; };

  /* ---- icons (inline SVG, brand-coloured via currentColor) ---- */
  const I = {
    heart: '<path d="M12 21s-7-4.6-9.3-9A5.4 5.4 0 0 1 12 6.4 5.4 5.4 0 0 1 21.3 12C19 16.4 12 21 12 21z"/>',
    shield: '<path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z"/><path d="M8.5 12l2.5 2.5L16 9.5"/>',
    family: '<circle cx="8" cy="7" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M2.5 20c0-3.5 2.5-6 5.5-6s5.5 2.5 5.5 6M14.5 20c0-2.6 1.4-4.5 3.5-4.5s3.5 1.9 3.5 4.5"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.6 2.7-6 6-6s6 2.4 6 6"/><path d="M16 5.5a3 3 0 0 1 0 5.6M18 14.5c2 .6 3.5 2.5 3.5 5.5"/>',
    calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h2M12 12h2M16 12h0M8 16h2M12 16h2M16 16h0"/>',
    chart: '<path d="M4 20V4M4 20h16"/><path d="M8 16l4-5 3 3 5-7"/>',
    scale: '<path d="M12 4v16M6 20h12M4 8h16"/><path d="M4 8l-2 6a3 3 0 0 0 6 0L6 8M20 8l-2 6a3 3 0 0 0 6 0l-2-6" transform="translate(-1 0)"/>',
    watch: '<rect x="7" y="6" width="10" height="12" rx="3"/><path d="M9 6l1-3h4l1 3M9 18l1 3h4l1-3M12 10v2.5l1.5 1"/>',
    file: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M9.5 13h5M9.5 17h5"/>',
    phone: '<path d="M6 3h4l1.6 4.5-2.2 1.4a11 11 0 0 0 5.7 5.7l1.4-2.2L21 14v4a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2z"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    pause: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5v7M14 8.5v7"/>',
    gift: '<rect x="3" y="9" width="18" height="12" rx="1"/><path d="M3 13h18M12 9v12M12 9C9 9 7 7.5 8 5.8s3.8-.2 4 3.2c.2-3.4 3-5 4-3.2s-1 3.2-4 3.2z"/>',
    star: '<path d="M12 3.5l2.6 5.5 6 .8-4.4 4.1 1.1 6L12 17l-5.3 2.9 1.1-6L3.4 9.8l6-.8z"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5z"/><path d="M4 19a2 2 0 0 1 2-2h13"/>',
    cash: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.8"/>'
  };
  PC.icon = (n, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n] || ''}</svg>`;
  window.PC_ICON = PC.icon;
  const chev = '<svg class="chev" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 4l4 4 4-4"/></svg>';

  /* ---- navigation model ---- */
  const MEGA = {
    products: {
      key: 'nav.products', cols: [
        ['mega.individual', [['/plans#A', 'heart', 'A'], ['/plans#B', 'shield', 'B']]],
        ['mega.family', [['/plans#C', 'family', 'C'], ['/plans#D', 'family', 'D']]],
        ['mega.business', [['/business', 'users', 'nav.sme'], ['/business#enquiry', 'chart', 'mega.hr']]],
        ['mega.tools', [['/calculator', 'calc', 'nav.calc'], ['/compare', 'scale', 'nav.compare'], ['/how-pricing-works', 'watch', 'nav.how']]]
      ], links: [['/plans', 'mega.browse', 'mega.browse.d'], ['/how-pricing-works', 'mega.rules', 'mega.rules.d'], ['/claims', 'nav.claims', 'mega.claims.d'], ['/privacy', 'footer.privacy', 'mega.priv.d']]
    },
    help: {
      key: 'nav.help', cols: [
        ['mega.support', [['/contact', 'phone', 'nav.contact'], ['/faq', 'book', 'nav.faq'], ['/claims', 'file', 'nav.claims']]],
        ['mega.account', [['/account', 'lock', 'nav.login'], ['/dashboard', 'chart', 'nav.dashboard']]],
        ['mega.learn', [['/investors', 'cash', 'nav.investors'], ['/privacy', 'shield', 'footer.privacy']]]
      ], links: []
    }
  };
  const TOP = [['mega:products'], ['/how-pricing-works', 'nav.pricing'], ['/calculator', 'nav.calc'], ['/business', 'nav.sme'], ['mega:help']];
  const CRUMB = { '/plans': 'nav.plans', '/how-pricing-works': 'nav.how', '/calculator': 'nav.calc', '/compare': 'nav.compare', '/business': 'nav.sme', '/investors': 'nav.investors', '/faq': 'nav.faq', '/contact': 'nav.contact', '/privacy': 'footer.privacy', '/apply': 'nav.apply', '/account': 'nav.login', '/dashboard': 'nav.dashboard', '/claims': 'nav.claims' };
  const SEARCH = [
    ['/', 'nav.home', 'footer.tag'], ['/plans', 'nav.plans', 'plans.sub'], ['/calculator', 'nav.calc', 'calc.sub'], ['/how-pricing-works', 'nav.how', 'how.sub'],
    ['/compare', 'nav.compare', 'cmp.sub'], ['/business', 'nav.sme', 'sme.sub'], ['/investors', 'nav.investors', 'inv.sub'], ['/privacy', 'footer.privacy', 'prv.sub'],
    ['/claims', 'nav.claims', 'cl.sub'], ['/apply', 'nav.apply', 'apply.sub'], ['/contact', 'nav.contact', 'ct.sub'], ['/dashboard', 'nav.dashboard', 'dash.nopolicy']
  ].concat([1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => ['/faq', 'faq.q' + i, 'faq.a' + i]));

  const path = () => (location.pathname.replace(/\.html$/, '').replace(/\/index$/, '/') || '/');
  const mi = (href, icon, labelKey) => {
    const lab = /^[A-D]$/.test(labelKey) ? `<span data-plan="${labelKey}"></span>` : `<span data-i18n="${labelKey}"></span>`;
    return `<a class="mi" href="${href}">${PC.icon(icon)}${lab}</a>`;
  };

  function chrome() {
    const here = path();
    // skip link + promo banner
    const skip = document.createElement('a'); skip.className = 'skip'; skip.href = '#main'; skip.setAttribute('data-i18n', 'nav.skip'); document.body.prepend(skip);
    const main = document.querySelector('main'); if (main) main.id = 'main';
    const hdr = document.createElement('header'); hdr.className = 'top';
    const promoOn = store.get('pc_promo') !== '1';
    const nav = TOP.map((t) => {
      if (t[0].startsWith('mega:')) { const m = t[0].slice(5); return `<button class="nv" data-mega="${m}" aria-expanded="false">${'<span data-i18n="' + MEGA[m].key + '"></span>'}${chev}</button>`; }
      return `<a href="${t[0]}" class="${t[0] === here ? 'on' : ''}" data-i18n="${t[1]}"></a>`;
    }).join('');
    const megaHtml = Object.entries(MEGA).map(([k, m]) => `<div class="mega" id="mega-${k}"><div class="wrap"><div class="mgrid" style="grid-template-columns:repeat(${m.cols.length},1fr)">${m.cols.map(([h, items]) => `<div><h4 data-i18n="${h}"></h4>${items.map((i) => mi(i[0], i[1], i[2])).join('')}</div>`).join('')}</div>${m.links.length ? `<div class="mlinks">${m.links.map((l) => `<a href="${l[0]}"><span data-i18n="${l[1]}"></span><small data-i18n="${l[2]}"></small></a>`).join('')}</div>` : ''}</div></div>`).join('');
    hdr.innerHTML = `${promoOn ? `<div class="promo" id="promo"><div class="wrap"><span><b data-i18n="promo.b"></b> <span data-i18n="promo.t"></span></span> <a href="/dashboard" data-i18n="promo.l"></a><button id="promox" aria-label="Close">&times;</button></div></div>` : ''}
    <div style="position:relative"><div class="wrap bar">
      <a class="brand" href="/"><span class="logo-slot" data-i18n="logo.placeholder"></span><span class="name">PulseCover</span></a>
      <nav class="main" id="mainnav" aria-label="Main">${nav}</nav>
      <div class="tools">
        <button class="ibtn" id="sbtn" aria-label="Search">${PC.icon('search')}</button>
        <select class="lang" id="langsel" aria-label="Language">${LANGS.map((l) => `<option value="${l.code}">${l.label}</option>`).join('')}</select>
        <a class="btn ghost sm" id="authbtn" href="/account"></a>
        <a class="btn sm" href="/apply" data-i18n="nav.apply"></a>
        <button class="burger" id="burger" aria-label="Menu">&#9776;</button>
      </div></div>
      ${megaHtml}
      <div class="spanel" id="spanel"><div class="wrap"><div class="sbox"><span style="color:var(--red)">${PC.icon('search')}</span><input id="sq" type="search" autocomplete="off" data-i18n-ph="search.ph"><button id="sclear" data-i18n="search.clear"></button></div><div class="sres" id="sres"></div></div></div>
    </div>`;
    document.body.prepend(hdr);

    // breadcrumb
    if (here !== '/' && CRUMB[here]) {
      const c = document.createElement('div'); c.className = 'crumb';
      c.innerHTML = `<div class="wrap"><a href="/" data-i18n="nav.home"></a><span class="sep">&rsaquo;</span><b data-i18n="${CRUMB[here]}"></b></div>`;
      hdr.after(c);
    }

    // footer
    const ft = document.createElement('footer'); ft.className = 'foot';
    ft.innerHTML = `<div class="wrap"><div class="fgrid">
      <div><div class="brand" style="color:#fff"><span class="logo-slot" data-i18n="logo.placeholder"></span><span class="name">PulseCover</span></div><p style="margin-top:12px" data-i18n="footer.tag"></p>
        <p style="margin:6px 0"><b style="color:#fff">1300-00-0000</b><br>hello@pulsecover.example</p>
        <div class="soc"><a href="#" aria-label="Facebook">f</a><a href="#" aria-label="Instagram">ig</a><a href="#" aria-label="TikTok">tt</a><a href="#" aria-label="LinkedIn">in</a><a href="#" aria-label="YouTube">yt</a></div>
        <div class="badges"><span>App Store</span><span>Google Play</span></div></div>
      <div><h4 data-i18n="footer.product"></h4><a href="/plans" data-i18n="nav.plans"></a><a href="/calculator" data-i18n="nav.calc"></a><a href="/compare" data-i18n="nav.compare"></a><a href="/apply" data-i18n="nav.apply"></a><a href="/business" data-i18n="nav.sme"></a></div>
      <div><h4 data-i18n="footer.support"></h4><a href="/claims" data-i18n="nav.claims"></a><a href="/dashboard" data-i18n="nav.dashboard"></a><a href="/faq" data-i18n="nav.faq"></a><a href="/contact" data-i18n="nav.contact"></a></div>
      <div><h4 data-i18n="footer.company"></h4><a href="/how-pricing-works" data-i18n="nav.how"></a><a href="/investors" data-i18n="nav.investors"></a><a href="/privacy" data-i18n="footer.privacy"></a></div>
      <div><h4 data-i18n="nav.language"></h4><div class="langs" id="flangs">${LANGS.map((l) => `<button data-l="${l.code}">${l.label}</button>`).join('')}</div></div></div>
      <div class="reg"><b data-i18n="footer.reg.h"></b> <span data-i18n="footer.reg.p"></span><br><span data-i18n="footer.partner"></span></div>
      <div class="fbot"><span data-i18n="footer.group"></span><span>&copy; 2026 PulseCover</span></div></div>`;
    document.body.append(ft);

    // floating widgets
    const pill = document.createElement('button'); pill.className = 'fpill'; pill.id = 'cbpill';
    pill.innerHTML = `${PC.icon('phone')}<span class="t" data-i18n="nav.talk"></span>`; document.body.append(pill);
    const fb = document.createElement('button'); fb.className = 'fbtab'; fb.id = 'fbtab'; fb.setAttribute('data-i18n', 'fb.tab'); document.body.append(fb);
    const ck = document.createElement('div'); ck.className = 'cookie' + (store.get('pc_cookie') ? '' : ' open'); ck.id = 'cookie';
    ck.innerHTML = `<div class="wrap"><p><span data-i18n="cookie.t"></span> <a href="/privacy" data-i18n="footer.privacy"></a></p><button class="btn light sm" id="ckok" data-i18n="cookie.ok"></button><button class="btn outl-w sm" id="ckno" data-i18n="cookie.no"></button></div>`;
    document.body.append(ck);
    const cm = document.createElement('div'); cm.className = 'modal'; cm.id = 'cbmodal';
    cm.innerHTML = `<div class="mbox"><button class="x" data-close aria-label="Close">&times;</button><h3 data-i18n="cb.h"></h3><p style="color:var(--mute)" data-i18n="cb.sub"></p><div id="cbform"></div></div>`; document.body.append(cm);
    const fm = document.createElement('div'); fm.className = 'modal'; fm.id = 'fbmodal';
    fm.innerHTML = `<div class="mbox"><button class="x" data-close aria-label="Close">&times;</button><h3 data-i18n="fb.h"></h3><div id="fbbody"></div></div>`; document.body.append(fm);

    wire(hdr, ft, ck, cm, fm);
    PC.callbackForm(document.getElementById('cbform'), 'm');
    feedbackForm(document.getElementById('fbbody'));
  }

  function wire(hdr, ft, ck, cm, fm) {
    const sel = document.getElementById('langsel'); sel.value = lang; sel.onchange = () => PC.setLang(sel.value);
    ft.querySelectorAll('#flangs button').forEach((b) => (b.onclick = () => PC.setLang(b.dataset.l)));
    document.getElementById('burger').onclick = () => document.getElementById('mainnav').classList.toggle('open');
    const px = document.getElementById('promox'); if (px) px.onclick = () => { store.set('pc_promo', '1'); document.getElementById('promo').remove(); };
    document.getElementById('ckok').onclick = () => { store.set('pc_cookie', 'all'); ck.classList.remove('open'); };
    document.getElementById('ckno').onclick = () => { store.set('pc_cookie', 'essential'); ck.classList.remove('open'); };
    // mega menus
    const closeMega = () => { document.querySelectorAll('.mega').forEach((m) => m.classList.remove('open')); document.querySelectorAll('[data-mega]').forEach((b) => { b.classList.remove('on'); b.setAttribute('aria-expanded', 'false'); }); };
    document.querySelectorAll('[data-mega]').forEach((b) => b.addEventListener('click', (e) => {
      e.stopPropagation(); const el = document.getElementById('mega-' + b.dataset.mega), was = el.classList.contains('open');
      closeMega(); document.getElementById('spanel').classList.remove('open');
      if (!was) { el.classList.add('open'); b.classList.add('on'); b.setAttribute('aria-expanded', 'true'); }
    }));
    document.addEventListener('click', (e) => { if (!e.target.closest('.mega') && !e.target.closest('#spanel')) { closeMega(); } });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeMega(); document.getElementById('spanel').classList.remove('open'); document.querySelectorAll('.modal.open').forEach((m) => m.classList.remove('open')); } });
    // search
    const sp = document.getElementById('spanel'), sq = document.getElementById('sq');
    document.getElementById('sbtn').onclick = (e) => { e.stopPropagation(); closeMega(); sp.classList.toggle('open'); if (sp.classList.contains('open')) { sq.focus(); runSearch(); } };
    document.getElementById('sclear').onclick = () => { sq.value = ''; runSearch(); sq.focus(); };
    sq.oninput = runSearch;
    // modals
    document.getElementById('cbpill').onclick = () => cm.classList.add('open');
    document.getElementById('fbtab').onclick = () => fm.classList.add('open');
    [cm, fm].forEach((m) => { m.addEventListener('click', (e) => { if (e.target === m || e.target.hasAttribute('data-close')) m.classList.remove('open'); }); });
    document.querySelectorAll('[data-open-callback]').forEach((b) => (b.onclick = (e) => { e.preventDefault(); cm.classList.add('open'); }));
  }

  function runSearch() {
    const q = document.getElementById('sq').value.trim().toLowerCase(), box = document.getElementById('sres');
    const rows = SEARCH.map(([h, tk, dk]) => ({ h, title: PC.t(tk), desc: PC.t(dk) }));
    const hit = q ? rows.filter((r) => (r.title + ' ' + r.desc).toLowerCase().includes(q)) : rows.slice(0, 6);
    box.innerHTML = hit.length ? hit.slice(0, 10).map((r) => `<a href="${r.h}">${PC.esc(r.title)}<small>${PC.esc(r.desc.slice(0, 90))}</small></a>`).join('') : `<p style="color:var(--mute)">${PC.t('search.none')}</p>`;
  }

  /* ---- reusable "talk to an advisor" form ---- */
  const STATES = ['Johor', 'Kedah', 'Kelantan', 'Kuala Lumpur', 'Labuan', 'Melaka', 'Negeri Sembilan', 'Pahang', 'Perak', 'Perlis', 'Pulau Pinang', 'Putrajaya', 'Sabah', 'Sarawak', 'Selangor', 'Terengganu'];
  PC.callbackForm = (host, id) => {
    host.innerHTML = `<form id="cb-${id}" novalidate>
      <div class="rowf"><div><label data-i18n="field.name"></label><input name="name" required autocomplete="name"></div><div><label data-i18n="cb.phone"></label><input name="phone" type="tel" required autocomplete="tel" placeholder="+60"></div>
      <div><label data-i18n="field.email"></label><input name="email" type="email" autocomplete="email"></div>
      <div><label data-i18n="cb.state"></label><select name="state" required><option value="" data-i18n-opt="cb.select"></option>${STATES.map((s) => `<option>${s}</option>`).join('')}</select></div>
      <div><label data-i18n="cb.need"></label><select name="need"><option value="info" data-i18n-opt="cb.n1"></option><option value="plan" data-i18n-opt="cb.n2"></option><option value="claims" data-i18n-opt="cb.n3"></option><option value="business" data-i18n-opt="cb.n4"></option><option value="other" data-i18n-opt="cb.n5"></option></select></div>
      <div><label data-i18n="cb.time"></label><select name="time"><option value="morning" data-i18n-opt="cb.t1"></option><option value="afternoon" data-i18n-opt="cb.t2"></option><option value="evening" data-i18n-opt="cb.t3"></option></select></div></div>
      <label data-i18n="cb.lang"></label><div style="display:flex;gap:14px;flex-wrap:wrap">${LANGS.map((l) => `<label style="margin:0;font-weight:400"><input type="radio" name="clang" value="${l.code}" ${l.code === lang ? 'checked' : ''}>${l.label}</label>`).join('')}</div>
      <label class="check"><input type="checkbox" name="consent"><span data-i18n="cb.consent"></span></label>
      <div class="msg"></div><button class="btn" style="margin-top:8px" data-i18n="cb.submit"></button></form>`;
    const f = host.querySelector('form'), m = host.querySelector('.msg');
    f.onsubmit = async (e) => {
      e.preventDefault(); const d = new FormData(f);
      try {
        await PC.api('/callback', { name: d.get('name'), phone: d.get('phone'), email: d.get('email'), state: d.get('state'), need: d.get('need'), time: d.get('time'), lang: d.get('clang'), consent: !!d.get('consent') });
        PC.msg(m, PC.t('cb.ok'), true); f.reset();
      } catch (x) { PC.msg(m, x.message); }
    };
    PC.apply(host);
  };

  function feedbackForm(host) {
    host.innerHTML = `<form id="fbf"><label data-i18n="fb.q"></label><select name="purpose"><option value="research" data-i18n-opt="fb.p1"></option><option value="buy" data-i18n-opt="fb.p2"></option><option value="policy" data-i18n-opt="fb.p3"></option><option value="claim" data-i18n-opt="fb.p4"></option><option value="other" data-i18n-opt="fb.p5"></option></select>
      <label data-i18n="fb.rate"></label><div class="stars" id="stars">${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-n="${n}" aria-label="${n}">&#9733;</button>`).join('')}</div>
      <label data-i18n="fb.comment"></label><textarea name="comment" rows="3" maxlength="1000"></textarea><div class="msg"></div><button class="btn" style="margin-top:12px" data-i18n="fb.submit"></button></form>`;
    let rating = 0; const stars = host.querySelectorAll('#stars button'), m = host.querySelector('.msg'), f = host.querySelector('form');
    stars.forEach((b) => (b.onclick = () => { rating = +b.dataset.n; stars.forEach((s) => s.classList.toggle('on', +s.dataset.n <= rating)); }));
    f.onsubmit = async (e) => {
      e.preventDefault(); if (!rating) return PC.msg(m, PC.t('fb.need'));
      try { await PC.api('/feedback', { rating, purpose: f.purpose.value, comment: f.comment.value, page: location.pathname }); PC.msg(m, PC.t('fb.thanks'), true); f.reset(); rating = 0; stars.forEach((s) => s.classList.remove('on')); } catch (x) { PC.msg(m, x.message); }
    };
  }

  PC.apply = (scope) => {
    const root = scope || document;
    if (!scope) document.documentElement.lang = { en: 'en', zh: 'zh-Hans', ms: 'ms', ta: 'ta' }[lang];
    root.querySelectorAll('[data-i18n]').forEach((e) => { e.textContent = PC.t(e.dataset.i18n); });
    root.querySelectorAll('[data-i18n-ph]').forEach((e) => { e.placeholder = PC.t(e.dataset.i18nPh); });
    root.querySelectorAll('[data-i18n-opt]').forEach((e) => { e.textContent = PC.t(e.dataset.i18nOpt); });
    root.querySelectorAll('[data-plan]').forEach((e) => { e.textContent = PC.planName(e.dataset.plan); });
    if (scope) return;
    const ab = document.getElementById('authbtn');
    if (ab) { ab.textContent = PC.user ? PC.t('nav.dashboard') : PC.t('nav.login'); ab.href = PC.user ? '/dashboard' : '/account'; }
    document.querySelectorAll('#flangs button').forEach((b) => b.classList.toggle('on', b.dataset.l === lang));
    document.querySelectorAll('.modal input[name=clang]').forEach((r) => { r.checked = r.value === lang; });
    if (document.getElementById('spanel') && document.getElementById('spanel').classList.contains('open')) runSearch();
    window.dispatchEvent(new CustomEvent('pc:lang', { detail: lang }));
  };
  PC.setLang = (l) => {
    lang = l; store.set('pc_lang', l);
    const sel = document.getElementById('langsel'); if (sel) sel.value = l;
    PC.apply(); if (PC.user) PC.api('/lang', { lang: l }).catch(() => {});
  };
  PC.ready = (async function () {
    chrome();
    try { PC.user = (await PC.api('/me')).user; } catch (e) {}
    if (PC.user && store.get('pc_lang') === null && idx[PC.user.lang] !== undefined) lang = PC.user.lang;
    const sel = document.getElementById('langsel'); if (sel) sel.value = lang;
    PC.apply();
  })();
  PC.logout = async () => { await PC.api('/logout', {}); location.href = '/'; };
  window.PC = PC;
})();
