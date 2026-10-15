/**
 * PulseCover: Google Sheet logger + automatic emails (Google Apps Script web app).
 * Bound to a Google Sheet (Extensions > Apps Script). The PulseCover server POSTs JSON here.
 * Passwords are never sent here. Only name, email and non-sensitive details.
 *
 * Actions: register, contact, callback, sme, quote, application, claim, waitlist, feedback.
 */
const SECRET = 'CHANGE_THIS_TO_A_LONG_RANDOM_TEXT';        // must match SHEET_SECRET on the server
const SITE = 'https://pulsecover-website.onrender.com';
const BRAND_NAME = 'PulseCover';
const RED = '#B71234', GOLD = '#E8A317';

const SHEETS = {
  register:    ['Timestamp', 'Name', 'Email', 'Language', 'Referral code'],
  contact:     ['Timestamp', 'Reference', 'Name', 'Email', 'Topic', 'Message', 'Language'],
  callback:    ['Timestamp', 'Name', 'Phone', 'Email', 'State', 'Need', 'Best time', 'Language'],
  sme:         ['Timestamp', 'Company', 'Contact', 'Email', 'Phone', 'Employees', 'Per employee (RM/yr)', 'Total (RM/yr)', 'Message'],
  quote:       ['Timestamp', 'Name', 'Email', 'Plan', 'Grade', 'Score', 'Annual premium (RM)', 'Language'],
  application: ['Timestamp', 'Policy number', 'Name', 'Email', 'Plan', 'Cover (RM)', 'Premium (RM/yr)', 'Grade', 'Device', 'Beneficiary'],
  claim:       ['Timestamp', 'Reference', 'Name', 'Email', 'Type', 'Amount (RM)', 'Incident date', 'Description'],
  waitlist:    ['Timestamp', 'Email', 'Language'],
  feedback:    ['Timestamp', 'Purpose', 'Rating', 'Comment', 'Page']
};
const SHEET_NAME = { register: 'Users', contact: 'Contact', callback: 'Callbacks', sme: 'SME enquiries', quote: 'Quotes', application: 'Applications', claim: 'Claims', waitlist: 'Waitlist', feedback: 'Feedback' };

function doGet() { return json({ ok: true, service: 'PulseCover sheet + email webhook' }); }

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.secret !== SECRET) return json({ ok: false, error: 'unauthorized' });
    const a = String(body.action || ''), d = body.data || {};
    if (a === 'backup' || a === 'restore') return json(handleBackup(a, d));  // handleBackup lives in Emails.gs
    if (!SHEETS[a]) return json({ ok: false, error: 'unknown action' });
    const ref = (a === 'contact') ? 'CT-' + Utilities.formatDate(new Date(), 'Asia/Kuala_Lumpur', 'yyMMddHHmmss') : '';
    appendRow(a, d, ref);
    const mail = buildEmail2(a, d, ref);  // buildEmail2 lives in Emails.gs
    if (mail && validEmail(d.email)) {
      MailApp.sendEmail({ to: d.email, subject: mail.subject, htmlBody: mail.html, body: mail.text, name: BRAND_NAME, noReply: true });
    }
    return json({ ok: true, emailed: !!(mail && validEmail(d.email)) });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function validEmail(s) { return typeof s === 'string' && /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/.test(s); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function nl2br(s) { return esc(s).replace(/\n/g, '<br>'); }
// stop spreadsheet formula injection from user text
function safe(v) { v = (v == null ? '' : v); return (typeof v === 'string' && /^[=+\-@]/.test(v)) ? "'" + v : v; }

function appendRow(a, d, ref) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME[a]);
  if (!sh) { sh = ss.insertSheet(SHEET_NAME[a]); sh.appendRow(SHEETS[a]); sh.getRange(1, 1, 1, SHEETS[a].length).setFontWeight('bold').setBackground('#FCEBEF'); sh.setFrozenRows(1); }
  const t = new Date();
  const rows = {
    register: [t, d.name, d.email, d.lang, d.refcode],
    contact: [t, ref, d.name, d.email, d.topic, d.message, d.lang],
    callback: [t, d.name, d.phone, d.email, d.state, d.need, d.time, d.lang],
    sme: [t, d.company, d.contact, d.email, d.phone, d.employees, d.quote && d.quote.perEmployeeAnnual, d.quote && d.quote.totalAnnual, d.message],
    quote: [t, d.name, d.email, 'Plan ' + d.plan, d.grade, d.score, d.annualPremium, d.lang],
    application: [t, d.number, d.name, d.email, 'Plan ' + d.plan, d.cover, d.premium, d.grade, d.device, d.beneficiary],
    claim: [t, d.number, d.name, d.email, d.type, d.amount, d.incident, d.description],
    waitlist: [t, d.email, d.lang],
    feedback: [t, d.purpose, d.rating, d.comment, d.page]
  }[a].map(safe);
  sh.appendRow(rows);
}

/* ---------- email templates ---------- */
function layout(title, inner, lang) {
  const footer = ({
    en: 'This is an automated message from PulseCover. Please do not reply to this email.',
    zh: '这是 PulseCover 的自动邮件，请勿回复此邮件。',
    ms: 'Ini ialah mesej automatik daripada PulseCover. Sila jangan balas e-mel ini.',
    ta: 'இது PulseCover-இன் தானியங்கி செய்தி. இந்த மின்னஞ்சலுக்குப் பதிலளிக்க வேண்டாம்.'
  })[lang] || 'This is an automated message from PulseCover. Please do not reply to this email.';
  return '<div style="background:#F6F4F7;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:#26242F">' +
    '<table role="presentation" width="100%" style="max-width:600px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden">' +
    '<tr><td style="background:' + RED + ';padding:22px 28px"><span style="color:#fff;font-size:22px;font-weight:700">PulseCover</span></td></tr>' +
    '<tr><td style="height:4px;background:' + GOLD + '"></td></tr>' +
    '<tr><td style="padding:28px"><h1 style="margin:0 0 14px;font-size:22px;line-height:1.3;color:#26242F">' + esc(title) + '</h1>' + inner + '</td></tr>' +
    '<tr><td style="padding:18px 28px;background:#F6F4F7;color:#646273;font-size:12px;line-height:1.6">' + esc(footer) + '<br>Group 5, BFM3130 &middot; ' + SITE.replace('https://', '') + '</td></tr></table></div>';
}
function btn(label, url) { return '<p style="margin:22px 0 6px"><a href="' + url + '" style="background:' + RED + ';color:#fff;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:99px;display:inline-block">' + esc(label) + '</a></p>'; }
function p(s) { return '<p style="margin:0 0 14px;font-size:15px;line-height:1.7">' + s + '</p>'; }
function list(items) { return '<ul style="margin:0 0 14px;padding-left:20px;font-size:15px;line-height:1.9">' + items.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul>'; }
function box(s) { return '<div style="background:#FFF5DE;border-left:4px solid ' + GOLD + ';padding:14px 16px;border-radius:8px;margin:0 0 16px;font-size:15px;line-height:1.7">' + s + '</div>'; }
function strip(html) { return html.replace(/<br>/g, '\n').replace(/<\/(p|li|h1|tr)>/g, '\n').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\n{3,}/g, '\n\n').trim(); }

const T = {
  welcome: {
    en: { s: 'Welcome to PulseCover', h: function (n) { return 'Welcome, ' + n + '!'; }, intro: 'Thank you for creating your PulseCover account. Here is what you can look forward to:', perks: ['A PulseCover Risk Rating built from your own wearable data, with no health forms', 'A fair price: your premium can move by at most 15% up or down, once a year at renewal', 'Weekly summaries and one monthly rating, so you never need to check it every day', 'Pause tracking for up to 60 days when you are ill, injured or travelling', 'A RM10 to RM20 credit for each friend who joins and links a wearable', 'Simple online claims with live status tracking'], next: 'Next step: connect your wearable and see your risk rating.', cta: 'Connect my wearable' },
    zh: { s: '欢迎加入 PulseCover', h: function (n) { return '欢迎您，' + n + '！'; }, intro: '感谢您创建 PulseCover 账户。您将享有：', perks: ['依据您自己的可穿戴设备数据生成的 PulseCover 风险评级，无需健康问卷', '公平的价格：保费每年续保时最多上下浮动 15%', '每周摘要和每月评级，无需每天查看', '生病、受伤或旅行时可暂停追踪最长 60 天', '每位加入并连接设备的朋友可为您带来 RM10 至 RM20 积分', '简单的线上理赔，并可实时追踪状态'], next: '下一步：连接您的可穿戴设备，查看您的风险评级。', cta: '连接我的设备' },
    ms: { s: 'Selamat datang ke PulseCover', h: function (n) { return 'Selamat datang, ' + n + '!'; }, intro: 'Terima kasih kerana mencipta akaun PulseCover anda. Inilah yang menanti anda:', perks: ['Penarafan Risiko PulseCover berdasarkan data peranti boleh pakai anda sendiri, tanpa borang kesihatan', 'Harga adil: premium anda berubah paling banyak 15% ke atas atau ke bawah, setahun sekali semasa pembaharuan', 'Ringkasan mingguan dan satu penarafan bulanan, jadi anda tidak perlu menyemak setiap hari', 'Jeda penjejakan sehingga 60 hari apabila anda sakit, cedera atau bermusafir', 'Kredit RM10 hingga RM20 bagi setiap rakan yang menyertai dan menyambung peranti', 'Tuntutan dalam talian yang mudah dengan penjejakan status langsung'], next: 'Langkah seterusnya: sambung peranti anda dan lihat penarafan risiko anda.', cta: 'Sambung peranti saya' },
    ta: { s: 'PulseCover-க்கு வரவேற்கிறோம்', h: function (n) { return 'வரவேற்கிறோம், ' + n + '!'; }, intro: 'உங்கள் PulseCover கணக்கை உருவாக்கியதற்கு நன்றி. உங்களுக்குக் காத்திருப்பவை:', perks: ['சுகாதார படிவங்கள் இல்லாமல், உங்கள் சொந்த சாதனத் தரவிலிருந்து உருவாக்கப்படும் PulseCover இடர் மதிப்பீடு', 'நியாயமான விலை: புதுப்பிப்பின்போது ஆண்டுக்கு ஒருமுறை அதிகபட்சம் 15% மட்டுமே மாறும்', 'வாராந்திர சுருக்கங்கள், மாதாந்திர மதிப்பீடு; தினமும் பார்க்கத் தேவையில்லை', 'நோய், காயம், பயணத்தின்போது 60 நாட்கள் வரை கண்காணிப்பை இடைநிறுத்தலாம்', 'சேர்ந்து சாதனத்தை இணைக்கும் ஒவ்வொரு நண்பருக்கும் RM10 முதல் RM20 வரை கிரெடிட்', 'நேரலை நிலைக் கண்காணிப்புடன் எளிய ஆன்லைன் கோரிக்கைகள்'], next: 'அடுத்த படி: உங்கள் சாதனத்தை இணைத்து இடர் மதிப்பீட்டைப் பாருங்கள்.', cta: 'என் சாதனத்தை இணை' }
  },
  contact: {
    en: { s: 'We received your message', h: function (n) { return 'Thank you, ' + n; }, intro: 'We have received your message and a member of the PulseCover team will reply within 2 working days. Here is a copy of what you sent:', ref: 'Your reference', topic: 'Topic', msg: 'Your message', out: 'Please keep this reference if you need to follow up. Stay put, we will be in touch soon.' },
    zh: { s: '我们已收到您的留言', h: function (n) { return '谢谢您，' + n; }, intro: '我们已收到您的留言，PulseCover 团队将在 2 个工作日内回复。以下是您发送内容的副本：', ref: '您的参考编号', topic: '主题', msg: '您的留言', out: '如需跟进，请保留此编号。请耐心等候，我们很快会联系您。' },
    ms: { s: 'Kami telah menerima mesej anda', h: function (n) { return 'Terima kasih, ' + n; }, intro: 'Kami telah menerima mesej anda dan pasukan PulseCover akan membalas dalam 2 hari bekerja. Berikut ialah salinan apa yang anda hantar:', ref: 'Rujukan anda', topic: 'Topik', msg: 'Mesej anda', out: 'Sila simpan rujukan ini jika anda perlu membuat susulan. Harap bersabar, kami akan menghubungi anda tidak lama lagi.' },
    ta: { s: 'உங்கள் செய்தி எங்களுக்குக் கிடைத்தது', h: function (n) { return 'நன்றி, ' + n; }, intro: 'உங்கள் செய்தி கிடைத்தது; PulseCover குழு 2 வேலை நாட்களுக்குள் பதிலளிக்கும். நீங்கள் அனுப்பியவற்றின் நகல்:', ref: 'உங்கள் குறிப்பு எண்', topic: 'தலைப்பு', msg: 'உங்கள் செய்தி', out: 'தொடர்ந்து கேட்க வேண்டுமெனில் இந்த எண்ணை வைத்திருங்கள். விரைவில் தொடர்பு கொள்கிறோம்.' }
  }
};

function buildEmail(a, d, ref) {
  const lang = ({ en: 1, zh: 1, ms: 1, ta: 1 })[d.lang] ? d.lang : 'en';
  const name = esc(d.name || '');
  let subject = '', title = '', inner = '';
  if (a === 'register') {
    const t = T.welcome[lang]; subject = t.s; title = t.h(name);
    inner = p(esc(t.intro)) + list(t.perks.map(esc)) + p(esc(t.next)) + btn(t.cta, SITE + '/connect');
  } else if (a === 'contact') {
    const t = T.contact[lang]; subject = t.s + ' (' + ref + ')'; title = t.h(name);
    inner = p(esc(t.intro)) + box('<b>' + esc(t.ref) + ':</b> ' + esc(ref) + '<br><b>' + esc(t.topic) + ':</b> ' + esc(d.topic || '-') + '<br><br><b>' + esc(t.msg) + ':</b><br>' + nl2br(d.message)) + p(esc(t.out));
  } else if (a === 'callback') {
    subject = 'We received your call back request'; title = 'Thank you, ' + name;
    inner = p('We have received your request. Our team will call you back within 2 working days. Here is what you told us:') + box('<b>Phone:</b> ' + esc(d.phone) + '<br><b>State:</b> ' + esc(d.state) + '<br><b>Help with:</b> ' + esc(d.need) + '<br><b>Best time:</b> ' + esc(d.time)) + p('Stay put, we will be in touch soon.');
  } else if (a === 'sme') {
    subject = 'We received your business enquiry'; title = 'Thank you, ' + esc(d.contact || '');
    inner = p('Thank you for your interest in PulseCover for ' + esc(d.company) + '. Your estimate for ' + esc(d.employees) + ' employees is shown below. We will contact you within 2 working days.') + box('<b>Per employee per year:</b> RM ' + esc(d.quote && d.quote.perEmployeeAnnual) + '<br><b>Total per year:</b> RM ' + esc(d.quote && d.quote.totalAnnual) + '<br><b>Your message:</b> ' + nl2br(d.message || '-')) + p('The estimate is indicative. Final group pricing depends on your team\'s activity.');
  } else if (a === 'quote') {
    subject = 'Your PulseCover quote'; title = 'Your quote, ' + name;
    inner = p('Here is your indicative quote for Plan ' + esc(d.plan) + '.') + box('<b>PulseCover Risk Rating:</b> ' + esc(d.grade) + ' (' + esc(d.score) + '/100)<br><b>Base premium:</b> RM ' + esc(d.base) + '<br><b>Wearable adjustment:</b> ' + esc(d.adjustmentPct) + '%<br><b>Your annual premium:</b> RM ' + esc(d.annualPremium) + ' (about RM ' + esc(d.monthlyPremium) + ' per month)') + p('Your final premium is set at renewal from your 12-month average and can move by at most 15% either way.') + btn('Continue my application', SITE + '/apply?plan=' + encodeURIComponent(d.plan));
  } else if (a === 'application') {
    subject = 'Your PulseCover policy ' + d.number; title = 'You are covered, ' + name;
    inner = p('Your application has been received and your policy is active.') + box('<b>Policy number:</b> ' + esc(d.number) + '<br><b>Plan:</b> ' + esc(d.plan) + '<br><b>Annual premium:</b> RM ' + esc(d.premium) + '<br><b>PulseCover Risk Rating:</b> ' + esc(d.grade)) + p('Your rating and quote have been sent to our partner insurer for underwriting.') + btn('Open my dashboard', SITE + '/dashboard');
  } else if (a === 'claim') {
    subject = 'We received your claim ' + d.number; title = 'Claim received, ' + name;
    inner = p('We have received your claim. You can follow each step online.') + box('<b>Reference:</b> ' + esc(d.number) + '<br><b>Type:</b> ' + esc(d.type) + '<br><b>Amount:</b> RM ' + esc(d.amount) + '<br><b>Date of incident:</b> ' + esc(d.incident)) + btn('Track my claim', SITE + '/claims');
  } else if (a === 'waitlist') {
    subject = 'You are on the PulseCover list'; title = 'Thank you for joining';
    inner = p('We will let you know about new features, wearable launches and offers. No spam.') + btn('Explore PulseCover', SITE);
  } else { return null; }
  const html = layout(title, inner, lang);
  return { subject: subject, html: html, text: strip(html) };
}

/** Run once from the editor to test the email layout (sends to your own address). */
function testWelcome() {
  const me = Session.getActiveUser().getEmail();
  const m = buildEmail('register', { name: 'Test User', email: me, lang: 'en' }, '');
  MailApp.sendEmail({ to: me, subject: m.subject, htmlBody: m.html, body: m.text, name: BRAND_NAME, noReply: true });
}
