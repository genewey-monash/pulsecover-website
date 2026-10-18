/* PulseCover UI polish: English Title Case for navigation/buttons/tabs, language-aware header fitting, hover menus, FAQ deep links.
   Style guide (English): navigation, buttons, tabs, table headers, chips, footer links = Title Case. Headings = Title Case too. Body copy = sentence case.
   Proper nouns and product names keep their own capitals (PulseCover, Fitbit, Garmin, Whoop, Google Health Connect, Plan A, PIDM). */
(function () {
  const SMALL = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor', 'of', 'on', 'or', 'per', 'the', 'to', 'vs']);
  const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1);
  function titleCase(s, isFirst = true, isLast = true) {
    const parts = s.split(/(\s+)/); const words = parts.filter((p) => p.trim()); let wi = 0;
    return parts.map((p) => {
      if (!p.trim()) return p;
      const first = isFirst && wi === 0, last = isLast && wi === words.length - 1; wi++;
      const m = p.match(/[A-Za-z]/); if (!m) return p;
      const i = m.index, core = p.slice(i);
      if (/[A-Z]/.test(core.slice(1)) || /\d/.test(core) || /^[A-Z]{2,}/.test(core)) return p; // PulseCover, iOS, FAQ, RM600
      const bare = core.replace(/[^A-Za-z]/g, '').toLowerCase();
      if (!first && !last && SMALL.has(bare)) return p.slice(0, i) + core.charAt(0).toLowerCase() + core.slice(1);
      return p.slice(0, i) + core.split('-').map(cap).join('-');
    }).join('');
  }
  window.PC_titleCase = titleCase;

  const SEL = [
    'nav.main > a', 'nav.main > button.nv > span', '.mega h4', '.mi > span', '.mlinks a > span:first-child',
    '.btn', 'button.tab', '.subnav a', '.subnav strong', 'footer.foot h4', 'footer.foot .fgrid a', '.crumb a', '.crumb b',
    'th', '.steps span', '.pipe span', '.devbtn', '.devbtn small', '.chip', '.si.pop', '.promo a', '.promo b', '.promo strong', '.fpill .t', '.fbtab', '.stat > span', '.qcard b', '.navacct a', '.navacct button', '.amenu span[data-i18n]'
  ].join(',');
  const HEAD = 'h1,h2,h3,h4,summary,.sech,.card > b,.cardh';
  const SKIP = '.price,.langs,.lsw,[data-notc],.badge-app,.soc';
  let busy = false;
  function polish() {
    if (document.documentElement.lang !== 'en') return;
    busy = true;
    document.querySelectorAll(SEL).forEach((el) => {
      if (el.closest(SKIP)) return;
      el.childNodes.forEach((n) => {
        if (n.nodeType !== 3 || !n.nodeValue.trim()) return;
        const t = titleCase(n.nodeValue); if (t !== n.nodeValue) n.nodeValue = t;
      });
    });
    document.querySelectorAll(HEAD).forEach((el) => {
      if (el.closest(SKIP)) return;
      const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); const ns = [];
      for (let n = w.nextNode(); n; n = w.nextNode()) if (n.nodeValue.trim() && !n.parentElement.closest('script,style,.price')) ns.push(n);
      ns.forEach((n, k) => { const t = titleCase(n.nodeValue, k === 0, k === ns.length - 1); if (t !== n.nodeValue) n.nodeValue = t; });
    });
    const parts = document.title.split(' | '); const tt = parts.map((x) => titleCase(x)).join(' | ');
    if (tt !== document.title) document.title = tt;
    busy = false;
  }
  let raf = 0;
  const schedule = () => { if (busy || raf) return; raf = requestAnimationFrame(() => { raf = 0; polish(); }); };
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true, characterData: true });

  /* ---- switch to the menu button when this language does not fit ---- */
  function fitNav() {
    const root = document.documentElement, nav = document.getElementById('mainnav'); if (!nav) return;
    root.classList.remove('navb', 'navtight', 'navtighter');
    if (window.innerWidth <= 1060) { root.classList.add('navb'); return; }
    const bar = document.querySelector('.bar');
    const overflows = () => { const need = [...nav.children].reduce((s, c) => s + c.getBoundingClientRect().width, 0); return nav.scrollWidth > nav.clientWidth + 1 || need > nav.clientWidth + 1 || bar.scrollWidth > bar.clientWidth + 1; };
    if (!overflows()) return;
    root.classList.add('navtight'); // longer labels (Malay, Tamil): squeeze the spacing first, switch to the menu button only if that is still not enough
    if (!overflows()) return;
    root.classList.add('navtighter'); // last step before the menu button: the QR icon steps aside (the app link stays in the hero and footer)
    if (overflows()) { root.classList.remove('navtight', 'navtighter'); root.classList.add('navb'); }
  }
  function fit() { fitNav(); }

  /* ---- hover to open menus (desktop only) ---- */
  function hoverMenus() {
    const hdr = document.querySelector('header.top'); if (!hdr) return; let timer;
    const open = (btn) => { if (document.documentElement.classList.contains('navb')) return; const el = document.getElementById('mega-' + btn.dataset.mega); if (!el.classList.contains('open')) btn.click(); };
    document.querySelectorAll('[data-mega]').forEach((b) => b.addEventListener('mouseenter', () => { clearTimeout(timer); open(b); }));
    document.querySelectorAll('nav.main > a, .tools').forEach((x) => x.addEventListener('mouseenter', () => { timer = setTimeout(() => document.querySelectorAll('.mega.open').forEach((m) => { document.querySelector(`[data-mega="${m.id.replace('mega-', '')}"]`).click(); }), 120); }));
    hdr.addEventListener('mouseleave', () => { timer = setTimeout(() => document.querySelectorAll('.mega.open').forEach((m) => { document.querySelector(`[data-mega="${m.id.replace('mega-', '')}"]`).click(); }), 220); });
    document.querySelectorAll('.mega').forEach((m) => m.addEventListener('mouseenter', () => clearTimeout(timer)));
  }

  /* ---- FAQ deep links (#faq3 opens that answer) ---- */
  function faqHash() {
    const h = location.hash; if (!/^#faq\d+$/.test(h)) return; const d = document.querySelector(h); if (d) { d.open = true; setTimeout(() => d.scrollIntoView({ block: 'center' }), 150); }
  }

  const start = async () => {
    if (window.PC && PC.ready) await PC.ready;
    polish(); fit(); hoverMenus(); faqHash();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { fit(); polish(); });
    window.addEventListener('resize', fit); window.addEventListener('pc:lang', () => { polish(); setTimeout(fit, 30); });
    window.addEventListener('hashchange', faqHash);
  };
  start();
})();
