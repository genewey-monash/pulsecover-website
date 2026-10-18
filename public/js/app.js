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
  // {tokens} such as {maxPct}, {indBase} and {subYearly} are filled from the pricing config (pricing.js), so no wording hard-codes a price
  const fillTokens = (s) => (s.indexOf('{') < 0 || !window.PC_TOKENS ? s : s.replace(/\{([a-zA-Z]+)\}/g, (m, k) => (k in window.PC_TOKENS ? window.PC_TOKENS[k] : m)));
  PC.t = (k) => (DICT[k] ? fillTokens(DICT[k][idx[lang]] || DICT[k][0]) : k);
  PC.fmt = (n, d = 2) => Number(n).toLocaleString('en-MY', { minimumFractionDigits: d, maximumFractionDigits: d });
  PC.esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  PC.planName = (id) => PC.t('plan.word') + ' ' + id;
  PC.api = async (path, body) => {
    const r = await fetch('/api' + path, body === undefined ? {} : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ lang }, body)) });
    let j = {}; try { j = await r.json(); } catch (e) {}
    if (!r.ok) { const err = new Error(j.error || PC.t('common.error')); err.status = r.status; throw err; }
    return j;
  };
  PC.thanks = (kind, info) => { try { sessionStorage.setItem('pc_ty', JSON.stringify(Object.assign({ t: kind }, info))); } catch (e) {} location.href = '/thank-you?t=' + kind; };
  PC.msg = (el, text, ok) => { el.className = 'msg ' + (ok ? 'ok' : 'err'); el.textContent = text; };

  /* ---- icons (inline SVG, brand-coloured via currentColor) ---- */
  const I = window.PC_ICON_PATHS;
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
        ['mega.tools', [['/connect', 'plug', 'nav.connect'], ['/compare', 'scale', 'nav.compare'], ['/how-pricing-works', 'watch', 'nav.how'], ['/rewards', 'gift', 'nav.rewards'], ['/campaigns', 'badge', 'nav.campaigns'], ['/premium', 'star', 'nav.premium']]]
      ], links: [['/plans', 'mega.browse', 'mega.browse.d'], ['/how-pricing-works', 'mega.rules', 'mega.rules.d'], ['/claims', 'nav.claims', 'mega.claims.d'], ['/privacy', 'footer.privacy', 'mega.priv.d']]
    },
    help: {
      key: 'nav.help', cols: [
        ['mega.support', [['/contact', 'phone', 'nav.contact'], ['/faq', 'book', 'nav.faq'], ['/claims', 'file', 'nav.claims']]],
        ['mega.account', [['/account', 'lock', 'nav.login'], ['/dashboard', 'chart', 'nav.dashboard'], ['/profile', 'user', 'nav.profile']]],
        ['mega.learn', [['/investors', 'cash', 'nav.investors'], ['/privacy', 'shield', 'footer.privacy']]]
      ], links: []
    }
  };
  const TOP = [['mega:products'], ['/how-pricing-works', 'nav.pricing'], ['/dashboard', 'nav.dashboard'], ['/rewards', 'nav.rewards'], ['/business', 'nav.sme'], ['mega:help']];
  // pages that belong to a dropdown highlight its button (the Calculator stays reachable from the Pricing page and the footer, not the navbar)
  const MEGA_PAGES = { products: ['/plans', '/plan-result', '/connect', '/compare', '/campaigns', '/premium', '/premium-quote', '/claims', '/apply'], help: ['/faq', '/contact', '/investors', '/privacy', '/profile'] };
  const CRUMB = { '/plans': 'nav.plans', '/how-pricing-works': 'nav.how', '/connect': 'nav.connect', '/calculator': 'nav.calc', '/premium-quote': 'pqr.h1', '/compare': 'nav.compare', '/business': 'nav.sme', '/investors': 'nav.investors', '/faq': 'nav.faq', '/rewards': 'nav.rewards', '/premium': 'nav.premium', '/campaigns': 'nav.campaigns', '/app': 'nav.app', '/contact': 'nav.contact', '/privacy': 'footer.privacy', '/apply': 'nav.apply', '/account': 'nav.login', '/dashboard': 'nav.dashboard', '/profile': 'nav.profile', '/app': 'nav.app', '/claims': 'nav.claims' };
  // Search index: [href, titleKey, descKey, group, extra English keywords]. Matches the current language AND English keywords.
  const SEARCH = [
    ['/', 'nav.home', 'footer.tag', 'page', 'home start welcome'],
    ['/plans', 'nav.plans', 'plans.sub', 'page', 'plans cover insurance products packages price'],
    ['/connect', 'nav.connect', 'connect.sub', 'tool', 'wearable fitbit garmin whoop google health connect device sync link'],
    ['/calculator', 'nav.calc', 'calc.sub', 'tool', 'calculator premium quote price estimate steps sleep heart rate'],
    ['/how-pricing-works', 'nav.how', 'how.sub', 'page', 'pricing rules formula band fair how it works'],
    ['/how-pricing-works#bands', 'rate.bands', 'rate.sub', 'page', 'risk rating grade score a+ band credit score'],
    ['/compare', 'nav.compare', 'cmp.sub', 'page', 'compare aia vitality traditional flat rate difference'],
    ['/business', 'nav.sme', 'sme.sub', 'tool', 'business sme employer staff group employees hr'],
    ['/business#enquiry', 'sme.enquiry.h', 'sme.assoc', 'tool', 'enquiry business quote group contact'],
    ['/investors', 'nav.investors', 'inv.sub', 'page', 'investors market financials breakeven revenue cost sources'],
    ['/privacy', 'footer.privacy', 'prv.sub', 'page', 'privacy data protection consent security pdpa'],
    ['/premium-quote', 'pqr.h1', 'pqr.lead', 'page', 'premium quote results detailed assessment savings what-if coaching plan policy guidance perks'],
    ['/premium', 'nav.premium', 'pq.p', 'page', 'premium quote paid upgrade free comparison detailed assessment coaching policy guidance partner discounts report savings'],
    ['/rewards', 'nav.rewards', 'rw.sub', 'tool', 'rewards streak streaks coupons level achievements gamified'],
    ['/campaigns', 'nav.campaigns', 'cm.sub', 'tool', 'campaign campaigns challenge step insurer promotion offer'],
    ['/app', 'nav.app', 'dl.web.p', 'tool', 'app web app qr code install download home screen phone'],
    ['/claims', 'nav.claims', 'cl.sub', 'tool', 'claim claims file submit track hospital accident'],
    ['/apply', 'nav.apply', 'apply.sub', 'tool', 'apply get covered buy join sign up policy'],
    ['/account', 'nav.login', 'acc.sub', 'tool', 'login log in register sign up account password'],
    ['/dashboard', 'nav.dashboard', 'dash.summ.note', 'tool', 'dashboard policy weekly summary devices'],
    ['/profile', 'nav.profile', 'pf.sub', 'tool', 'profile account personal details update plan change password phone address name logout log out sign out'],
    ['#theme', 'theme.dark', 'theme.light', 'tool', 'dark mode light mode theme night appearance'],
    ['/dashboard', 'dash.ref.h', 'dash.ref.p', 'tool', 'referral refer friend code credit leaderboard'],
    ['/dashboard', 'dash.pause.h', 'dash.pause.p', 'tool', 'pause tracking illness injury travel pregnancy'],
    ['/contact', 'nav.contact', 'ct.sub', 'page', 'contact email phone address message help'],
    ['#callback', 'cb.h', 'cb.sub', 'tool', 'call back talk callback phone request'],
    ['/plans#A', 'plan.A', 'plan.wear', 'plan', 'plan a 600 individual'],
    ['/plans#B', 'plan.B', 'plan.wear', 'plan', 'plan b 900 individual'],
    ['/plans#C', 'plan.C', 'plan.wear', 'plan', 'plan c 1500 family'],
    ['/plans#D', 'plan.D', 'plan.wear', 'plan', 'plan d 2400 family']
  ].concat([1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => ['/faq#faq' + i, 'faq.q' + i, 'faq.a' + i, 'faq', 'faq question']));
  const GROUPS = { page: 'search.g.page', tool: 'search.g.tool', plan: 'search.g.plan', faq: 'search.g.faq' };
  const POPULAR = [['/calculator', 'nav.calc'], ['/connect', 'nav.connect'], ['/claims', 'nav.claims'], ['/faq', 'nav.faq'], ['/plans', 'nav.plans']];
  const EN = (k) => (DICT[k] ? DICT[k][0] : k);

  const path = () => (location.pathname.replace(/\.html$/, '').replace(/\/index$/, '/') || '/');
  const mi = (href, icon, labelKey) => {
    const lab = /^[A-D]$/.test(labelKey) ? `<span data-plan="${labelKey}"></span>` : `<span data-i18n="${labelKey}"></span>`;
    return `<a class="mi" href="${href}">${PC.icon(icon)}${lab}</a>`;
  };

  function chrome() {
    const here = path();
    // skip link + promo banner
    const skip = document.createElement('a'); skip.className = 'skip'; skip.href = '#content'; skip.setAttribute('data-i18n', 'nav.skip'); document.body.prepend(skip);
    const main = document.querySelector('main'); if (main) main.id = 'content';
    const hdr = document.createElement('header'); hdr.className = 'top';
    const promoOn = store.get('pc_promo') !== '1';
    const nav = TOP.map((t) => {
      if (t[0].startsWith('mega:')) { const m = t[0].slice(5); return `<button class="nv ${(MEGA_PAGES[m] || []).includes(here) ? 'on' : ''}" data-mega="${m}" aria-expanded="false">${'<span data-i18n="' + MEGA[m].key + '"></span>'}</button>`; }
      return `<a href="${t[0]}" class="${t[0] === here ? 'on' : ''}"${t[0] === here ? ' aria-current="page"' : ''} data-i18n="${t[1]}"></a>`;
    }).join('');
    const megaHtml = Object.entries(MEGA).map(([k, m]) => `<div class="mega" id="mega-${k}"><div class="wrap"><div class="mgrid" style="grid-template-columns:repeat(${m.cols.length},1fr)">${m.cols.map(([h, items]) => `<div><h4 data-i18n="${h}"></h4>${items.map((i) => mi(i[0], i[1], i[2])).join('')}</div>`).join('')}</div>${m.links.length ? `<div class="mlinks">${m.links.map((l) => `<a href="${l[0]}"><span data-i18n="${l[1]}"></span><small data-i18n="${l[2]}"></small></a>`).join('')}</div>` : ''}</div></div>`).join('');
    hdr.innerHTML = `${promoOn ? `<div class="promo" id="promo"><div class="wrap"><span><b data-i18n="promo.b"></b> <span data-i18n="promo.t"></span></span> <a href="/dashboard" data-i18n="promo.l"></a><button id="promox" aria-label="Close">&times;</button></div></div>` : ''}
    <div style="position:relative"><div class="wrap bar">
      <a class="brand" href="/"><img class="logo-img" src="/img/logo-mark.png" alt="PulseCover logo" width="46" height="46"><span class="name">PulseCover</span></a>
      <nav class="main" id="mainnav" aria-label="Main">${nav}<div class="navacct" id="navacct"></div></nav>
      <div class="tools">
        <button class="ibtn" id="sbtn" aria-label="Search">${PC.icon('search')}</button>
        <a class="ibtn appbtn" href="/app" id="appbtn" data-i18n-aria="nav.app" aria-label="Get the app" title="Get the app">${PC.icon('qr')}</a>
        <button class="ibtn" id="themebtn" aria-label="Theme" aria-pressed="false"></button>
        <div class="dd lsw" id="lsw"><button class="lbtn" id="langbtn" type="button" aria-haspopup="listbox" aria-expanded="false" aria-label="Language"><span id="langlabel"></span>${PC.icon('chev', 'chev')}</button>
          <ul class="dmenu lmenu" id="langmenu" role="listbox" aria-label="Language">${LANGS.map((l) => `<li role="option" tabindex="-1" data-l="${l.code}"><span>${l.label}</span>${PC.icon('check', 'tick')}</li>`).join('')}</ul></div>
        <a class="btn ghost sm" id="authbtn" href="/account"></a>
        <div class="dd asw" id="asw" hidden><button class="abtn" id="acctbtn" type="button" aria-haspopup="menu" aria-expanded="false" aria-label="My account"><span class="av" id="av"></span>${PC.icon('chev', 'chev')}</button>
          <div class="dmenu amenu" id="acctmenu" role="menu"><div class="ahead"><span class="av lg" id="avl"></span><div><b id="an"></b><small id="ae"></small></div></div>
            <a role="menuitem" href="/dashboard">${PC.icon('grid')}<span data-i18n="nav.dash"></span></a>
            <a role="menuitem" href="/profile">${PC.icon('user')}<span data-i18n="nav.profile"></span></a>
            <hr><button role="menuitem" type="button" id="logoutbtn" class="out">${PC.icon('logout')}<span data-i18n="nav.logout"></span></button></div></div>
        <a class="btn sm" href="/connect" data-i18n="nav.connect" data-connect-cta></a>
        <button class="burger" id="burger" aria-label="Menu">&#9776;</button>
      </div></div>
      ${megaHtml}
      <div class="spanel" id="spanel"><div class="wrap"><div class="sbox"><span class="sico">${PC.icon('search')}</span><input id="sq" type="search" role="combobox" aria-expanded="true" aria-controls="sres" aria-autocomplete="list" autocomplete="off" spellcheck="false" data-i18n-ph="search.ph"><button id="sclear" data-i18n="search.clear"></button><kbd class="skey">Esc</kbd></div><div class="sres" id="sres" role="listbox"></div></div></div>
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
      <div><div class="brand" style="color:#fff"><img class="logo-img" src="/img/logo-mark.png" alt="PulseCover logo" width="46" height="46"><span class="name">PulseCover</span></div><p style="margin-top:12px" data-i18n="footer.tag"></p>
        <p style="margin:6px 0"><b style="color:#fff">1300-00-0000</b><br>hello@pulsecover.example</p>
        <div class="soc">${[['Facebook', 'facebook', 'https://www.facebook.com/'], ['Instagram', 'instagram', 'https://www.instagram.com/'], ['X', 'x', 'https://x.com/'], ['Telegram', 'telegram', 'https://t.me/'], ['LinkedIn', 'linkedin', 'https://www.linkedin.com/'], ['YouTube', 'youtube', 'https://www.youtube.com/']].map(([n, f, u]) => `<a href="${u}" target="_blank" rel="noopener noreferrer" aria-label="${n}" title="${n}"><img src="/img/social/${f}.svg" alt="" width="18" height="18"></a>`).join('')}</div>
        <div class="badges"><a class="btn ghost sm" href="/app" data-i18n="dl.web.btn"></a></div></div>
      <div><h4 data-i18n="footer.product"></h4><a href="/plans" data-i18n="nav.plans"></a><a href="/calculator" data-i18n="nav.calc"></a><a href="/compare" data-i18n="nav.compare"></a><a href="/apply" data-i18n="nav.apply"></a><a href="/business" data-i18n="nav.sme"></a><a href="/app" data-i18n="nav.app"></a><a href="/premium" data-i18n="nav.premium"></a><a href="/rewards" data-i18n="nav.rewards"></a><a href="/campaigns" data-i18n="nav.campaigns"></a></div>
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
    document.body.append(ck); document.body.classList.toggle('ckopen', ck.classList.contains('open'));
    const cm = document.createElement('div'); cm.className = 'modal'; cm.id = 'cbmodal';
    cm.innerHTML = `<div class="mbox"><button class="x" data-close aria-label="Close">&times;</button><h3 data-i18n="cb.h"></h3><p style="color:var(--mute)" data-i18n="cb.sub"></p><div id="cbform"></div></div>`; document.body.append(cm);
    const fm = document.createElement('div'); fm.className = 'modal'; fm.id = 'fbmodal';
    fm.innerHTML = `<div class="mbox"><button class="x" data-close aria-label="Close">&times;</button><h3 data-i18n="fb.h"></h3><div id="fbbody"></div></div>`; document.body.append(fm);

    wire(hdr, ft, ck, cm, fm);
    PC.callbackForm(document.getElementById('cbform'), 'm');
    feedbackForm(document.getElementById('fbbody'));
  }

  function wire(hdr, ft, ck, cm, fm) {
    // animated dropdowns (language + account)
    const dds = [...document.querySelectorAll('.dd')];
    const closeDD = (except) => dds.forEach((d) => { if (d !== except && d.classList.contains('open')) { d.classList.remove('open'); d.querySelector('button').setAttribute('aria-expanded', 'false'); } });
    PC.closeDD = closeDD;
    dds.forEach((d) => {
      const btn = d.querySelector('button'), menu = d.querySelector('.dmenu');
      btn.addEventListener('click', (e) => { e.stopPropagation(); menu.style.top = window.innerWidth <= 620 ? btn.getBoundingClientRect().bottom + 8 + 'px' : ''; const o = !d.classList.contains('open'); closeDD(d); d.classList.toggle('open', o); btn.setAttribute('aria-expanded', String(o)); if (o) { document.querySelectorAll('.mega.open').forEach((m) => m.classList.remove('open')); PC.closeSearch && PC.closeSearch(); const cur = menu.querySelector('li.on, a'); if (cur) cur.focus({ preventScroll: true }); } });
      menu.addEventListener('keydown', (e) => {
        const items = [...menu.querySelectorAll('li,a,button')], i = items.indexOf(document.activeElement);
        if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
        if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
        if (e.key === 'Enter' && document.activeElement.tagName === 'LI') { e.preventDefault(); document.activeElement.click(); }
      });
    });
    document.addEventListener('click', () => closeDD());
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { const o = dds.find((d) => d.classList.contains('open')); closeDD(); if (o) o.querySelector('button').focus(); } });
    document.querySelectorAll('#langmenu li').forEach((li) => li.addEventListener('click', () => { PC.setLang(li.dataset.l); closeDD(); document.getElementById('langbtn').focus(); }));
    document.getElementById('logoutbtn').onclick = () => PC.logout();
    ft.querySelectorAll('#flangs button').forEach((b) => (b.onclick = () => PC.setLang(b.dataset.l)));
    document.getElementById('burger').onclick = () => document.getElementById('mainnav').classList.toggle('open');
    const px = document.getElementById('promox'); if (px) px.onclick = () => { store.set('pc_promo', '1'); const pr = document.getElementById('promo'); pr.classList.add('gone'); setTimeout(() => pr.remove(), 380); };
    document.getElementById('ckok').onclick = () => { store.set('pc_cookie', 'all'); ck.classList.remove('open'); document.body.classList.remove('ckopen'); };
    document.getElementById('ckno').onclick = () => { store.set('pc_cookie', 'essential'); ck.classList.remove('open'); document.body.classList.remove('ckopen'); };
    // light / dark mode (remembered per visitor)
    const tb = document.getElementById('themebtn');
    const paintTheme = () => { const dark = document.documentElement.dataset.theme === 'dark'; tb.innerHTML = PC.icon(dark ? 'sun' : 'moon'); tb.title = tb.ariaLabel = PC.t(dark ? 'theme.light' : 'theme.dark'); tb.setAttribute('aria-pressed', dark ? 'true' : 'false'); };
    PC.paintTheme = paintTheme;
    tb.onclick = () => { const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = next; store.set('pc_theme', next); paintTheme(); };
    paintTheme();
    // mega menus
    const closeMega = () => { document.querySelectorAll('.mega').forEach((m) => m.classList.remove('open')); document.querySelectorAll('[data-mega]').forEach((b) => { b.classList.remove('on'); b.setAttribute('aria-expanded', 'false'); }); };
    document.querySelectorAll('[data-mega]').forEach((b) => b.addEventListener('click', (e) => {
      e.stopPropagation(); const el = document.getElementById('mega-' + b.dataset.mega), was = el.classList.contains('open');
      closeMega(); PC.closeSearch();
      if (!was) { el.classList.add('open'); b.classList.add('on'); b.setAttribute('aria-expanded', 'true'); }
    }));
    document.addEventListener('click', (e) => { if (!e.target.closest('.mega') && !e.target.closest('#spanel') && !e.target.closest('#sbtn')) { closeMega(); if (document.getElementById('spanel').classList.contains('open')) PC.closeSearch(); } });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeMega(); document.getElementById('spanel').classList.remove('open'); document.querySelectorAll('.modal.open').forEach((m) => m.classList.remove('open')); PC.closeSearch && PC.closeSearch(); } });
    // search
    const sp = document.getElementById('spanel'), sq = document.getElementById('sq');
    const openSearch = () => { closeMega(); sp.classList.add('open'); document.getElementById('sbtn').setAttribute('aria-expanded', 'true'); setTimeout(() => sq.focus(), 60); runSearch(); };
    const closeSearch = () => { sp.classList.remove('open'); document.getElementById('sbtn').setAttribute('aria-expanded', 'false'); };
    PC.openSearch = openSearch; PC.closeSearch = closeSearch;
    document.getElementById('sbtn').onclick = (e) => { e.stopPropagation(); sp.classList.contains('open') ? closeSearch() : openSearch(); };
    document.getElementById('sclear').onclick = () => { sq.value = ''; runSearch(); sq.focus(); };
    sq.oninput = runSearch;
    sq.addEventListener('keydown', (e) => {
      const items = [...document.querySelectorAll('#sres .si')]; if (!items.length) return;
      let i = items.findIndex((x) => x.classList.contains('act'));
      if (e.key === 'ArrowDown') { e.preventDefault(); i = (i + 1) % items.length; }
      else if (e.key === 'ArrowUp') { e.preventDefault(); i = (i - 1 + items.length) % items.length; }
      else if (e.key === 'Enter') { e.preventDefault(); (items[i < 0 ? 0 : i]).click(); return; }
      else return;
      items.forEach((x) => x.classList.remove('act')); items[i].classList.add('act'); items[i].scrollIntoView({ block: 'nearest' });
    });
    document.addEventListener('keydown', (e) => { if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); } });
    // modals
    document.getElementById('cbpill').onclick = () => cm.classList.add('open');
    document.getElementById('fbtab').onclick = () => fm.classList.add('open');
    [cm, fm].forEach((m) => { m.addEventListener('click', (e) => { if (e.target === m || e.target.hasAttribute('data-close')) m.classList.remove('open'); }); });
    document.querySelectorAll('[data-open-callback]').forEach((b) => (b.onclick = (e) => { e.preventDefault(); cm.classList.add('open'); }));
  }

  function hl(text, tokens) {
    const toks = tokens.filter(Boolean).sort((x, y) => y.length - x.length).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (!toks.length) return PC.esc(text);
    return text.split(new RegExp('(' + toks.join('|') + ')', 'ig')).map((p, i) => (i % 2 ? '<mark>' + PC.esc(p) + '</mark>' : PC.esc(p))).join('');
  }
  function runSearch() {
    const q = document.getElementById('sq').value.trim().toLowerCase(), box = document.getElementById('sres');
    const tokens = q.split(/\s+/).filter(Boolean);
    if (!tokens.length) {
      box.innerHTML = `<div class="sgrp">${PC.t('search.popular')}</div><div class="spop">${POPULAR.map(([h, k]) => `<a class="si pop" href="${h}">${PC.esc(PC.t(k))}</a>`).join('')}</div><p class="shint">${PC.t('search.hint')}</p>`;
      return;
    }
    const rows = SEARCH.map(([h, tk, dk, g, kw]) => {
      const title = tk.startsWith('plan.') && /^plan\.[A-D]$/.test(tk) ? PC.planName(tk.slice(5)) : PC.t(tk);
      const desc = PC.t(dk), en = EN(tk) || '';
      const T = title.toLowerCase(), D2 = desc.toLowerCase(), K = (kw + ' ' + en).toLowerCase();
      let score = 0;
      for (const t of tokens) {
        if (T === t) score += 9; else if (T.startsWith(t)) score += 6; else if (T.includes(' ' + t)) score += 5; else if (T.includes(t)) score += 4;
        else if (K.includes(t)) score += 3; else if (D2.includes(t)) score += 1; else return null;
      }
      return { h, title, desc, g, score };
    }).filter(Boolean).sort((x, y) => y.score - x.score).slice(0, 8);
    if (!rows.length) {
      box.innerHTML = `<p class="snone">${PC.t('search.none')}</p><div class="sgrp">${PC.t('search.popular')}</div><div class="spop">${POPULAR.map(([h, k]) => `<a class="si pop" href="${h}">${PC.esc(PC.t(k))}</a>`).join('')}</div>`;
      return;
    }
    // groups ordered by their best match, so the most relevant result is always first and highlighted
    const order = ['page', 'tool', 'plan', 'faq'].map((g) => ({ g, best: Math.max(0, ...rows.filter((r) => r.g === g).map((r) => r.score)) })).filter((x) => x.best > 0).sort((x, y) => y.best - x.best).map((x) => x.g); let html = '';
    for (const g of order) {
      const list = rows.filter((r) => r.g === g); if (!list.length) continue;
      html += `<div class="sgrp">${PC.t(GROUPS[g])}</div>` + list.map((r) => `<a class="si" role="option" href="${r.h}"><span class="sti">${hl(r.title, tokens)}</span><span class="sde">${hl(r.desc.length > 110 ? r.desc.slice(0, 107) + '...' : r.desc, tokens)}</span></a>`).join('');
    }
    box.innerHTML = html + `<p class="shint">${PC.t('search.enter')}</p>`;
    const first = box.querySelector('.si'); if (first) first.classList.add('act');
  }
  document.addEventListener('click', (e) => {
    const s = e.target.closest('#sres a.si'); if (!s) return;
    if (s.getAttribute('href') === '#callback') { e.preventDefault(); PC.closeSearch(); document.getElementById('cbmodal').classList.add('open'); }
    else if (s.getAttribute('href') === '#theme') { e.preventDefault(); PC.closeSearch(); document.getElementById('themebtn').click(); }
    else if (s.getAttribute('href').split('#')[0] === location.pathname.replace(/\.html$/, '') || (s.getAttribute('href').startsWith('#'))) { PC.closeSearch(); }
  });


  /* ---- guest wearable: simulated 28 days kept in this browser; moved into the account after login ---- */
  const GK = 'pc_guest_conn';
  const gRead = () => { try { return JSON.parse(localStorage.getItem(GK)) || null; } catch (e) { return null; } };
  const gHash = (str) => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const gRng = (seed) => () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  PC.guestProviders = () => (gRead() || { providers: [] }).providers;
  PC.guestConnect = async (provider, plan) => {
    const g = gRead() || { providers: [], seed: Math.random().toString(36).slice(2, 10) };
    if (!g.providers.includes(provider)) g.providers.push(provider);
    try { localStorage.setItem(GK, JSON.stringify(g)); } catch (e) {}
    const r0 = gRng(gHash(g.seed)), base = { st: 5500 + r0() * 5500, ex: 60 + r0() * 110, sl: 6.2 + r0() * 2, hr: 54 + r0() * 18 };
    let st = 0, ex = 0, sl = 0, hr = 0; const today = new Date();
    for (let i = 27; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const r = gRng(gHash(g.seed + d.toISOString().slice(0, 10))), wk = d.getDay() % 6 === 0 ? 0.85 : 1.05;
      st += Math.round(base.st * wk * (0.75 + r() * 0.5)); ex += Math.round((base.ex / 7) * wk * (0.6 + r() * 0.9));
      sl += Math.round((base.sl + (r() - 0.5)) * 10) / 10; hr += Math.round(base.hr + (r() - 0.5) * 6);
    }
    const quote = await PC.api('/quote', { steps: st / 28, exerciseMin: (ex / 28) * 7, sleepHours: sl / 28, restingHr: hr / 28, plan });
    return { provider, days: 28, added: 28, quote, guest: true };
  };
  PC.guestMigrate = async () => {
    const g = gRead(); if (!g || !PC.user) return;
    for (const p of g.providers) { try { await PC.api('/connect', { provider: p, consent: true }); } catch (e) {} }
    try { localStorage.removeItem(GK); } catch (e) {}
  };

  /* ---- wearable connect (consent modal -> /api/connect). Simulated: real vendor OAuth needs partner credentials. ---- */
  PC.connectable = ['applehealth', 'healthconnect']; // Fitbit, Garmin and Whoop data flow in through these two
  PC.providers = { applehealth: 'Apple Health', healthconnect: 'Google Health Connect', fitbit: 'Fitbit', garmin: 'Garmin', whoop: 'Whoop' };
  PC.connect = (provider, plan) => new Promise((resolve, reject) => {
    document.getElementById('cnmodal')?.remove(); // guests can connect too: the readings are simulated in this browser and saved to the account after login
    const m = document.createElement('div'); m.className = 'modal open'; m.id = 'cnmodal';
    m.innerHTML = `<div class="mbox"><button class="x" data-close aria-label="Close">&times;</button><div class="ico" style="margin-bottom:10px">${PC.icon('plug')}</div><h3 data-i18n="connect.modal.h"></h3><p style="margin:0 0 6px"><b>${PC.providers[provider]}</b></p>
      <ul class="perm"><li data-i18n="connect.a1"></li><li data-i18n="connect.a2"></li><li data-i18n="connect.a3"></li><li data-i18n="connect.a4"></li></ul>
      <p style="color:var(--mute);font-size:.88rem" data-i18n="connect.modal.p"></p><div class="msg"></div>
      <div class="cta"><button class="btn" id="cnok" data-i18n="connect.allow"></button><button class="btn ghost" id="cnno" data-i18n="connect.cancel"></button></div></div>`;
    document.body.append(m); PC.apply(m);
    const close = () => m.remove();
    m.querySelector('#cnno').onclick = () => { close(); reject(new Error('cancel')); };
    m.addEventListener('click', (e) => { if (e.target === m || e.target.hasAttribute('data-close')) { close(); reject(new Error('cancel')); } });
    m.querySelector('#cnok').onclick = async () => {
      const b = m.querySelector('#cnok'); b.disabled = true;
      try { const r = PC.user ? await PC.api('/connect', { provider, consent: true, plan }) : await PC.guestConnect(provider, plan); close(); PC.connected = true; PC.paintConnect(); resolve(r); }
      catch (e) { PC.msg(m.querySelector('.msg'), e.message); b.disabled = false; }
    };
  });

  /* ---- "email me this quote" widget (sends a no-reply email with the quote) ---- */
  PC.emailQuote = (host, getPayload) => {
    host.innerHTML = `<div class="eqbox"><h4 data-i18n="eq.h"></h4><form class="eqf" novalidate><div class="eqrow"><input type="email" required autocomplete="email" data-i18n-ph="eq.ph" aria-label="Email"><button class="btn sm" data-i18n="eq.btn"></button></div><p class="fhelp" style="display:block;color:var(--mute)" data-i18n="eq.note"></p><div class="msg"></div></form></div>`;
    const f = host.querySelector('form'), m = host.querySelector('.msg'), inp = f.querySelector('input');
    f.onsubmit = async (e) => { e.preventDefault(); const b = f.querySelector('button'); b.disabled = true;
      try { await PC.api('/email-quote', Object.assign({ email: inp.value, lang: PC.lang }, getPayload())); PC.msg(m, PC.t('eq.ok'), true); inp.value = ''; }
      catch (x) { PC.msg(m, /email/i.test(x.message) ? PC.t('acc.err.email') : x.message); } b.disabled = false; };
    PC.apply(host);
  };

  /* ---- reusable "talk to an advisor" form ---- */
  const STATES = ['Johor', 'Kedah', 'Kelantan', 'Kuala Lumpur', 'Labuan', 'Melaka', 'Negeri Sembilan', 'Pahang', 'Perak', 'Perlis', 'Pulau Pinang', 'Putrajaya', 'Sabah', 'Sarawak', 'Selangor', 'Terengganu'];
  PC.callbackForm = (host, id) => {
    host.innerHTML = `<form id="cb-${id}" novalidate>
      <div class="rowf"><div><label data-i18n="field.name"></label><input name="name" required autocomplete="name"></div><div><label data-i18n="cb.phone"></label><input name="phone" type="tel" required autocomplete="tel" placeholder="+60"></div>
      <div><label data-i18n="field.email"></label><input name="email" type="email" required autocomplete="email"><p class="fhelp" style="display:block;color:var(--mute)" data-i18n="cb.email.note"></p></div>
      <div><label data-i18n="cb.state"></label><select name="state" required><option value="" data-i18n-opt="cb.select"></option>${STATES.map((s) => `<option>${s}</option>`).join('')}</select></div>
      <div><label data-i18n="cb.need"></label><select name="need"><option value="info" data-i18n-opt="cb.n1"></option><option value="plan" data-i18n-opt="cb.n2"></option><option value="claims" data-i18n-opt="cb.n3"></option><option value="business" data-i18n-opt="cb.n4"></option><option value="other" data-i18n-opt="cb.n5"></option></select></div>
      <div><label data-i18n="cb.time"></label><select name="time"><option value="morning" data-i18n-opt="cb.t1"></option><option value="afternoon" data-i18n-opt="cb.t2"></option><option value="evening" data-i18n-opt="cb.t3"></option></select></div></div>
      <label data-i18n="cb.lang" style="margin-top:22px;display:block"></label><div class="langopts">${LANGS.map((l) => `<label class="langopt"><input type="radio" name="clang" value="${l.code}" ${l.code === lang ? 'checked' : ''}><span>${l.label}</span></label>`).join('')}</div>
      <label class="check"><input type="checkbox" name="consent"><span data-i18n="cb.consent"></span></label>
      <div class="msg"></div><button class="btn" style="margin-top:8px" data-i18n="cb.submit"></button></form>`;
    const f = host.querySelector('form'), m = host.querySelector('.msg');
    const EM = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/;
    const flag = (el, key) => { // red inline error under the field
      let h = el.closest('div,label') && el.parentElement.querySelector(':scope > .ferr');
      if (!h) { h = document.createElement('p'); h.className = 'fhelp ferr'; (el.type === 'checkbox' ? el.closest('label') : el).after(h); }
      el.classList.toggle('fld-err', !!key); h.classList.toggle('on', !!key); h.textContent = key ? PC.t(key) : ''; h.dataset.key = key || ''; return !key;
    };
    f.querySelectorAll('input,select').forEach((el) => el.addEventListener('input', () => { if (el.classList.contains('fld-err')) el.classList.remove('fld-err'); const h = el.parentElement.querySelector(':scope > .ferr'); if (h) h.classList.remove('on'); }));
    f.onsubmit = async (e) => {
      e.preventDefault(); const d = new FormData(f); m.className = 'msg';
      const ok = [
        flag(f.name, String(d.get('name')).trim().length >= 2 ? '' : 'acc.err.name'),
        flag(f.phone, String(d.get('phone')).replace(/\D/g, '').length >= 8 ? '' : 'cb.err.phone'),
        flag(f.email, EM.test(String(d.get('email')).trim()) ? '' : 'acc.err.email'),
        flag(f.state, d.get('state') ? '' : 'cb.err.state'),
        flag(f.consent, d.get('consent') ? '' : 'cb.err.consent')
      ].every(Boolean);
      if (!ok) { const first = f.querySelector('.fld-err'); if (first) { first.scrollIntoView({ block: 'center', behavior: 'smooth' }); first.focus({ preventScroll: true }); } PC.msg(m, PC.t('pf.fix')); return; }
      const btn = f.querySelector('button.btn'); btn.disabled = true;
      try {
        await PC.api('/callback', { name: String(d.get('name')).trim(), phone: d.get('phone'), email: String(d.get('email')).trim(), state: d.get('state'), need: d.get('need'), time: d.get('time'), lang: d.get('clang'), consent: !!d.get('consent') });
        PC.thanks('cb', { name: String(d.get('name')).trim(), email: String(d.get('email')).trim() }); return;
      } catch (x) { PC.msg(m, /email/i.test(x.message) ? PC.t('acc.err.email') : /try again|too many/i.test(x.message) ? PC.t('cb.err.many') : x.message); btn.disabled = false; }
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

  function paintLangUI() {
    const cur = LANGS.find((l) => l.code === lang) || LANGS[0], lb = document.getElementById('langlabel'); if (lb) { lb.textContent = ({ en: 'EN', zh: '中文', ms: 'BM', ta: 'தமிழ்' })[cur.code] || cur.label; lb.parentNode.title = cur.label; }
    document.querySelectorAll('#langmenu li').forEach((li) => { const on = li.dataset.l === lang; li.classList.toggle('on', on); li.setAttribute('aria-selected', String(on)); });
  }
  function paintAcct() {
    const ab = document.getElementById('authbtn'), asw = document.getElementById('asw'); if (!ab || !asw) return;
    const u = PC.user, ini = u ? ((u.name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?') : '';
    ab.textContent = PC.t('nav.login'); ab.href = '/account'; ab.hidden = !!u; asw.hidden = !u;
    if (u) { document.getElementById('av').textContent = ini; document.getElementById('avl').textContent = ini; document.getElementById('an').textContent = u.name; document.getElementById('ae').textContent = u.email; }
    const na = document.getElementById('navacct');
    if (na) na.innerHTML = u ? `<a href="/dashboard">${PC.t('nav.dash')}</a><a href="/profile">${PC.t('nav.profile')}</a><button type="button" class="out" id="navout">${PC.t('nav.logout')}</button>` : `<a href="/account">${PC.t('nav.login')}</a>`;
    const no = document.getElementById('navout'); if (no) no.onclick = () => PC.logout();
  }
  /* once a wearable is linked, every "Connect wearable" call to action becomes "View my score" and goes to the quote */
  PC.paintConnect = () => {
    document.querySelectorAll('[data-connect-cta]').forEach((e) => {
      if (!e.dataset.cta0) e.dataset.cta0 = e.dataset.i18n;
      e.dataset.i18n = PC.connected ? 'nav.myscore' : e.dataset.cta0; e.textContent = PC.t(e.dataset.i18n);
      e.setAttribute('href', PC.connected ? '/plan-result?plan=A' : '/connect');
    });
  };
  PC.apply = (scope) => {
    const root = scope || document;
    if (!scope) document.documentElement.lang = { en: 'en', zh: 'zh-Hans', ms: 'ms', ta: 'ta' }[lang];
    root.querySelectorAll('[data-i18n]').forEach((e) => { e.textContent = PC.t(e.dataset.i18n); });
    root.querySelectorAll('[data-i18n-ph]').forEach((e) => { e.placeholder = PC.t(e.dataset.i18nPh); });
    root.querySelectorAll('[data-i18n-aria]').forEach((e) => { const v = PC.t(e.dataset.i18nAria); e.setAttribute('aria-label', v); e.title = v; });
    root.querySelectorAll('[data-i18n-opt]').forEach((e) => { e.textContent = PC.t(e.dataset.i18nOpt); });
    root.querySelectorAll('[data-plan]').forEach((e) => { e.textContent = PC.planName(e.dataset.plan); });
    if (scope) return;
    paintLangUI(); paintAcct(); PC.paintConnect();
    document.querySelectorAll('#flangs button').forEach((b) => b.classList.toggle('on', b.dataset.l === lang));
    document.querySelectorAll('.modal input[name=clang]').forEach((r) => { r.checked = r.value === lang; });
    if (PC.paintTheme) PC.paintTheme();
    if (document.getElementById('spanel') && document.getElementById('spanel').classList.contains('open')) runSearch();
    window.dispatchEvent(new CustomEvent('pc:lang', { detail: lang }));
  };
  PC.setLang = (l) => {
    lang = l; store.set('pc_lang', l);
    PC.apply(); if (PC.user) PC.api('/lang', { lang: l }).catch(() => {});
  };
  PC.ready = (async function () {
    chrome();
    try { PC.user = (await PC.api('/me')).user; } catch (e) {}
    if (PC.user) PC.guestMigrate(); // a wearable connected as a guest is saved to the account after login
    PC.connected = PC.guestProviders().length > 0;
    if (PC.user) PC.api('/dashboard').then((d) => { PC.connected = PC.connected || (d.connections || []).length > 0; PC.paintConnect(); }).catch(() => {});
    idleGuard();
    if (PC.user && store.get('pc_lang') === null && idx[PC.user.lang] !== undefined) lang = PC.user.lang;
    PC.apply();
  })();
  /* auto log out after 30 minutes of inactivity (warns at 28) */
  function idleGuard() {
    if (!PC.user || PC.idleOn) return; PC.idleOn = true;
    const LIMIT = 30 * 60e3, WARN = 28 * 60e3; let last = Date.now(), pinged = Date.now(), box = null;
    const bump = () => { if (box) return; last = Date.now(); if (Date.now() - pinged > 4 * 60e3) { pinged = Date.now(); PC.api('/me').catch(() => {}); } };
    ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'].forEach((ev) => window.addEventListener(ev, bump, { passive: true }));
    const out = async () => { try { await PC.api('/logout', {}); } catch (e) {} location.href = '/account?expired=1'; };
    setInterval(() => {
      const idle = Date.now() - last;
      if (idle >= LIMIT) return out();
      if (idle >= WARN && !box) {
        box = document.createElement('div'); box.className = 'modal open'; box.id = 'idlebox';
        box.innerHTML = `<div class="mbox" style="max-width:420px;text-align:center"><h3 data-i18n="idle.title"></h3><p style="color:var(--mute)" data-i18n="idle.p"></p><div class="cta" style="justify-content:center"><button class="btn" id="idlestay" data-i18n="idle.stay"></button><button class="btn ghost" id="idleout" data-i18n="nav.logout"></button></div></div>`;
        document.body.append(box); PC.apply(box);
        document.getElementById('idlestay').onclick = () => { box.remove(); box = null; last = Date.now(); pinged = Date.now(); PC.api('/me').catch(() => {}); };
        document.getElementById('idleout').onclick = out;
      }
    }, 15000);
  }
  PC.logout = async () => { await PC.api('/logout', {}); location.href = '/'; };
  window.PC = PC;
})();
