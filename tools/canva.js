// Builds public/canva/site.html: a fully pre-rendered, script-free, multi-page static copy of the site for importing into Canva.
// Each top-level .cpage becomes one Canva page. Run after tools/build.js.  node tools/canva.js
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
global.window = {};
eval(fs.readFileSync(path.join(root, 'public/js/i18n.js'), 'utf8'));
eval(fs.readFileSync(path.join(root, 'public/js/i18n2.js'), 'utf8'));
eval(fs.readFileSync(path.join(root, 'public/js/i18n3.js'), 'utf8'));
eval(fs.readFileSync(path.join(root, 'public/js/icons.js'), 'utf8'));
const svgIcon = (n, color = '#B71234') => `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${window.PC_ICON_PATHS[n] || ''}</svg>`;
const D = window.PC_I18N, t = (k) => (D[k] ? D[k][0] : k);
const P = require('../pricing');
const css = fs.readFileSync(path.join(root, 'public/css/style.css'), 'utf8');

const main = (f) => {
  let h = fs.readFileSync(path.join(root, 'public', f + '.html'), 'utf8');
  h = h.slice(h.indexOf('<main'), h.indexOf('</main>') + 7);
  return h.replace(/<(\w+)([^>]*?)\sdata-i18n="([^"]+)"([^>]*)>([^<]*)<\/\1>/g, (m, tag, a, key, b) => `<${tag}${a}${b}>${t(key)}</${tag}>`)
    .replace(/\sdata-i18n-ph="([^"]+)"/g, (m, k) => ` placeholder="${t(k)}"`)
    .replace(/<option([^>]*?)\sdata-i18n-opt="([^"]+)"([^>]*)><\/option>/g, (m, a, k, b) => `<option${a}${b}>${t(k)}</option>`)
    .replace(/<div class="ico" data-ic="(\w+)"><\/div>/g, (m, n) => `<div class="ico">${svgIcon(n)}</div>`)
    .replace(/<video[^>]*class="logoanim"[^>]*><\/video>/g, '<img class="logoanim" src="https://pulsecover-website.onrender.com/img/logo-mark.png" alt="PulseCover logo" width="96" height="96">')
    .replace(/src="\/img\//g, 'src="https://pulsecover-website.onrender.com/img/')
    .replace(/<script[\s\S]*?<\/script>/g, '');
};
const covs = (p) => 'ABCDEF'.slice(0, { A: 3, B: 4, C: 5, D: 6 }[p.id]).split('');
const planCard = (p) => `<div class="card" style="display:flex;flex-direction:column"><div>${p.isNew ? `<span class="chip">${t('plan.new')}</span>` : ''}<span class="chip">${t('type.' + p.type)}</span></div><h3 style="margin-top:10px">${t('plan.word')} ${p.id}</h3><ul>${covs(p).map((c) => `<li>${t('cov.' + c)}</li>`).join('')}<li>${t('plan.wear')}</li></ul><p><small>${t('plan.from')}</small><br><b style="color:var(--red);font-size:1.4rem">RM ${p.base.toLocaleString()}${t('common.year')}</b></p><a class="btn sm ghost">${t('common.learn')}</a></div>`;
const plans = Object.values(P.PLANS);
const fin = P.financials();
const LIVE = 'https://pulsecover-website.onrender.com';
const NAVMAP = { 'nav.products': '/plans', 'nav.pricing': '/how-pricing-works', 'nav.calc': '/calculator', 'nav.sme': '/business', 'nav.help': '/faq' };
const nav = Object.keys(NAVMAP).map((k) => `<a href="${LIVE}${NAVMAP[k]}">${t(k)}</a>`).join('');
const header = `<div class="promo"><div class="wrap"><b>${t('promo.b')}</b> ${t('promo.t')} <a>${t('promo.l')}</a></div></div><header class="top"><div class="wrap bar"><a class="brand" href="${LIVE}/"><img class="logo-img" src="https://pulsecover-website.onrender.com/img/logo-mark.png" alt="PulseCover logo" width="46" height="46">PulseCover</a><nav class="main">${nav}</nav><div class="tools"><span class="lang">English</span><a class="btn ghost sm" href="${LIVE}/account">${t('nav.login')}</a><a class="btn sm" href="${LIVE}/connect">${t('nav.connect')}</a></div></div></header>`;
const footer = `<footer class="foot"><div class="wrap"><div class="fgrid"><div><div class="brand" style="color:#fff"><img class="logo-img" src="https://pulsecover-website.onrender.com/img/logo-mark.png" alt="PulseCover logo" width="46" height="46">PulseCover</div><p>${t('footer.tag')}</p></div><div><h4>${t('footer.product')}</h4><a href="${LIVE}/plans">${t('nav.plans')}</a><a href="${LIVE}/calculator">${t('nav.calc')}</a><a href="${LIVE}/compare">${t('nav.compare')}</a></div><div><h4>${t('footer.support')}</h4><a href="${LIVE}/claims">${t('nav.claims')}</a><a href="${LIVE}/faq">${t('nav.faq')}</a><a href="${LIVE}/contact">${t('nav.contact')}</a></div><div><h4>${t('footer.company')}</h4><a href="${LIVE}/how-pricing-works">${t('nav.how')}</a><a href="${LIVE}/investors">${t('nav.investors')}</a><a href="${LIVE}/privacy">${t('footer.privacy')}</a></div><div></div></div><div class="reg">${t('footer.reg.p')}</div><div class="fbot"><span>${t('footer.group')}</span></div></div></footer>`;

const page = (label, body) => `<div class="cpage" data-document-role="page" data-label="${label}">${header}${body}${footer}</div>`;
const pages = [];

let home = main('index');
home = home.replace('<div class="cards c4" id="plancards"></div>', `<div class="cards c4">${plans.map(planCard).join('')}</div>`)
  .replace(/<div class="formcard"><div id="homecb"><\/div><\/div>/, `<div class="formcard"><h3>${t('cb.h')}</h3><label>${t('field.name')}</label><input><label>${t('cb.phone')}</label><input><label>${t('cb.state')}</label><select><option>Selangor</option></select><br><br><a class="btn">${t('cb.submit')}</a></div>`);
pages.push(page('Home', home));

let cn = main('connect');
cn = cn.replace('<div class="devrow" id="devrow"></div><div id="cres"></div><div class="msg" id="cmsg"></div>', `<div class="devrow">${['Google Health Connect', 'Fitbit', 'Garmin', 'Whoop'].map((n) => `<span class="devbtn">${n}<small>${t('connect.cta')}</small></span>`).join('')}</div>`);
pages.push(page('Connect wearable', cn));

let pl = main('plans');
pl = pl.replace('<div class="plist" id="plist"></div>', `<div class="plist">${plans.map((p) => `<div class="plan">${p.isNew ? '<span class="rib">NEW</span>' : ''}<div><span class="cat">${t('plan.cat')}</span><h3>${t('plan.word')} ${p.id}</h3><ul>${covs(p).map((c) => `<li>${t('cov.' + c)}</li>`).join('')}<li>${t('plan.wear')}</li></ul></div><div class="side"><div class="price"><small>${t('plan.from')}</small><br><b>RM ${p.base.toLocaleString()}</b><small>${t('common.year')}</small></div><a class="btn sm">${t('plan.apply')}</a></div></div>`).join('')}</div>`)
  .replace('<table class="tbl" id="ctable"></table>', `<table class="tbl"><thead><tr><th></th>${plans.map((p) => `<th>${t('plan.word')} ${p.id}</th>`).join('')}</tr></thead><tbody>${[['cmpt.price', (p) => 'RM ' + p.base], ['cmpt.cover', (p) => 'RM ' + p.cover.toLocaleString()], ['cmpt.type', (p) => t('type.' + p.type)]].map(([k, f]) => `<tr><td>${t(k)}</td>${plans.map((p) => `<td>${f(p)}</td>`).join('')}</tr>`).join('')}</tbody></table>`);
pages.push(page('Plans', pl));

let calc = main('calculator');
const q = P.quote({ steps: 7500, exerciseMin: 100, sleepHours: 7.5, restingHr: 66 });
calc = calc.replace('<select id="planSel"></select>', '<select><option>Plan A</option></select>')
  .replace('id="r_score">-<', `id="r_score">${q.score} / 100<`).replace('<b id="r_base"></b>', `<b>RM ${q.base}</b>`).replace('<b id="r_adj"></b>', `<b>${q.adjustmentPct}%</b>`)
  .replace('<b id="r_total" style="font-size:1.3rem"></b>', `<b style="font-size:1.3rem">RM ${q.annualPremium}/yr</b>`).replace('<b id="r_month"></b>', `<b>RM ${q.monthlyPremium}/mo</b>`).replace('<b id="r_sav"></b>', `<b>RM ${q.savings}</b>`)
  .replace('<span id="r_savlbl"></span>', `<span>${t('calc.saved')}</span>`)
  .replace('<div class="bars" id="bars"></div>', `<div class="bars">${Object.entries(q.components).map(([k, v]) => `<div class="b"><div class="t"><span>${t('comp.' + k)}</span><span>${v}</span></div><div class="tr"><i style="width:${v}%"></i></div></div>`).join('')}</div>`)
  .replace(/<b id="v_\w+"><\/b>/g, '<b></b>');
pages.push(page('Calculator', calc));

for (const [f, label] of [['how-pricing-works', 'How pricing works'], ['compare', 'Compare'], ['business', 'For business'], ['faq', 'FAQ'], ['privacy', 'Privacy'], ['contact', 'Contact']]) pages.push(page(label, main(f)));

let inv = main('investors');
inv = inv.replace('<div class="kpi" id="fin"></div>', `<div class="kpi">${[[t('inv.rev'), fin.revenue], [t('inv.cost'), fin.totalCost], [t('inv.profit'), fin.profit], [t('inv.be'), fin.breakevenPolicies]].map(([l, v]) => `<div class="card"><span>${l}</span><b>${typeof v === 'number' && v > 5000 || v < 0 ? 'RM ' : ''}${Number(v).toLocaleString()}</b></div>`).join('')}</div>`)
  .replace(/<canvas[\s\S]*?<\/canvas>/g, '');
pages.push(page('Investors', inv));


// ---- make every link work inside Canva (absolute URLs to the live site) ----
const BTN = [
  [/log ?in|login/i, '/account'], [/connect/i, '/connect'], [/get covered|apply/i, '/apply'], [/get (my )?quote|calculator/i, '/calculator'],
  [/view all plans|learn more|plan/i, '/plans'], [/how it works|how pricing/i, '/how-pricing-works'], [/call back|talk to us/i, '/#advisor'],
  [/notify/i, '/#how'], [/enquiry|business/i, '/business#enquiry'], [/send message|contact/i, '/contact'], [/feedback/i, '/contact'],
  [/investor/i, '/investors'], [/compare/i, '/compare'], [/claim/i, '/claims'], [/dashboard/i, '/dashboard']
];
const pick = (text) => { for (const [re, to] of BTN) if (re.test(text)) return to; return '/'; };
const HASH = { '#plans': '/#plans', '#how': '/#how', '#advisor': '/#advisor', '#compare': '/plans#compare', '#list': '/plans#list', '#enquiry': '/business#enquiry', '#': '/' };
function fixLinks(h) {
  // <button class="btn ..."> -> <a class="btn ..." href=...>
  h = h.replace(/<button([^>]*class="[^"]*btn[^"]*"[^>]*)>([\s\S]*?)<\/button>/g, (m, attrs, inner) => {
    const text = inner.replace(/<[^>]+>/g, '').trim();
    attrs = attrs.replace(/\s(id|type|disabled)="[^"]*"/g, '').replace(/\sdisabled/g, '');
    return `<a${attrs} href="${LIVE}${pick(text)}">${inner}</a>`;
  });
  // plan filter tabs -> link to the live plans page
  h = h.replace(/<button class="tab( on)?"[^>]*>([\s\S]*?)<\/button>/g, (m, on, inner) => `<a class="tab${on || ''}" href="${LIVE}/plans">${inner}</a>`);
  // <a ...btn...> without href
  h = h.replace(/<a((?:(?!href=)[^>])*class="[^"]*btn[^"]*"(?:(?!href=)[^>])*)>([\s\S]*?)<\/a>/g, (m, attrs, inner) => `<a${attrs} href="${LIVE}${pick(inner.replace(/<[^>]+>/g, '').trim())}">${inner}</a>`);
  // relative and hash hrefs -> absolute
  h = h.replace(/href="(#[^"]*|\/[^"]*)"/g, (m, v) => `href="${LIVE}${v.startsWith('#') ? (HASH[v] || '/' + v) : v}"`);
  return h;
}

const html0 = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>PulseCover website (Canva pages)</title><style>${css}
.cpage{width:1440px;overflow:hidden;background:#fff;margin:0}.promo,.cpage header.top{position:static}.cpage .wrap{max-width:1180px}.cpage .sec{padding:56px 0}
.fpill,.fbtab,.cookie,.modal,.cmpbar{display:none!important}
h1{line-height:58px;letter-spacing:0}h2{line-height:44px;letter-spacing:0}h3{line-height:30px}p,.lead{line-height:28px}li{line-height:28px;padding:6px 0}.btn{white-space:nowrap}</style></head><body>${pages.join('\n')}</body></html>`;
const html = fixLinks(html0);
fs.mkdirSync(path.join(root, 'public/canva'), { recursive: true });
fs.writeFileSync(path.join(root, 'public/canva/site.html'), html);
console.log('canva pages:', pages.length, 'size', (html.length / 1024).toFixed(0) + ' KB');
