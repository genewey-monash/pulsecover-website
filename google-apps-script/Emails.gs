/**
 * PulseCover: localised email templates for call back, business enquiry, quote, application, claim and waitlist.
 * Add this as a second file (Emails.gs) in the same Apps Script project as Code.gs.
 * Register and contact emails keep using buildEmail() in Code.gs. Everything else is built here, in the language
 * the visitor chose on the website (en, zh, ms, ta).
 */
const M = {
  en: {
    plan: 'Plan', rm: 'RM', yr: 'per year', mo: 'per month',
    needs: { info: 'General information', plan: 'Choosing a plan', claims: 'Claims', business: 'Business cover', other: 'Something else' },
    times: { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' },
    types: { hospitalisation: 'Hospitalisation', outpatient: 'Outpatient', critical_illness: 'Critical illness', accident: 'Accident', death: 'Death' },
    cb: { s: 'We received your call back request', h: 'Thank you, ', intro: 'We have received your request. Our team will call you back within 2 working days. Here is what you told us:', phone: 'Phone', state: 'State', need: 'Help with', time: 'Best time', out: 'Please keep your phone nearby. We will be in touch soon.' },
    sme: { s: 'We received your business enquiry', h: 'Thank you, ', intro: function (c, n) { return 'Thank you for your interest in PulseCover for ' + c + '. Your estimate for ' + n + ' employees is shown below. We will contact you within 2 working days.'; }, per: 'Per employee per year', total: 'Total per year', msg: 'Your message', out: 'The estimate is indicative. Final group pricing depends on your team\'s activity.' },
    quote: { s: 'Your PulseCover quote', h: 'Your quote, ', intro: function (pl) { return 'Here is your indicative quote for Plan ' + pl + '.'; }, rating: 'PulseCover Risk Rating', base: 'Base premium', adj: 'Wearable adjustment', annual: 'Your annual premium', about: 'about', out: 'Your final premium is set at renewal from your 12-month average and can move by at most 15% either way.', cta: 'Continue my application' },
    app: { s: function (n) { return 'Your PulseCover policy ' + n; }, h: 'You are covered, ', intro: 'Your application has been received and your policy is active.', no: 'Policy number', plan: 'Plan', annual: 'Annual premium', rating: 'PulseCover Risk Rating', out: 'Your rating and quote have been sent to our partner insurer for underwriting.', cta: 'Open my dashboard' },
    claim: { s: function (n) { return 'We received your claim ' + n; }, h: 'Claim received, ', intro: 'We have received your claim. You can follow each step online.', ref: 'Reference', type: 'Type', amount: 'Amount', date: 'Date of incident', cta: 'Track my claim' },
    wl: { s: 'You are on the PulseCover list', h: 'Thank you for joining', intro: 'We will let you know about new features, wearable launches and offers. No spam.', cta: 'Explore PulseCover' }
  },
  zh: {
    plan: '计划', rm: 'RM', yr: '每年', mo: '每月',
    needs: { info: '一般咨询', plan: '选择计划', claims: '理赔', business: '企业保障', other: '其他' },
    times: { morning: '上午', afternoon: '下午', evening: '晚上' },
    types: { hospitalisation: '住院', outpatient: '门诊', critical_illness: '重大疾病', accident: '意外', death: '身故' },
    cb: { s: '我们已收到您的回电请求', h: '谢谢您，', intro: '我们已收到您的请求，我们的团队将在 2 个工作日内回电。以下是您提供的信息：', phone: '电话', state: '州属', need: '需要协助', time: '方便接听时间', out: '请保持手机畅通，我们很快与您联系。' },
    sme: { s: '我们已收到您的企业咨询', h: '谢谢您，', intro: function (c, n) { return '感谢您为 ' + c + ' 咨询 PulseCover。以下是 ' + n + ' 名员工的估算，我们将在 2 个工作日内联系您。'; }, per: '每名员工每年', total: '每年总计', msg: '您的留言', out: '此估算仅供参考，最终团体保费取决于团队的活跃程度。' },
    quote: { s: '您的 PulseCover 报价', h: '您的报价，', intro: function (pl) { return '以下是您的 ' + pl + ' 计划参考报价。'; }, rating: 'PulseCover 风险评级', base: '基本保费', adj: '可穿戴设备调整', annual: '您的年保费', about: '约', out: '最终保费将于续保时依据您 12 个月的平均数据确定，上下浮动最多 15%。', cta: '继续申请' },
    app: { s: function (n) { return '您的 PulseCover 保单 ' + n; }, h: '您已获得保障，', intro: '我们已收到您的申请，您的保单已生效。', no: '保单号', plan: '计划', annual: '年保费', rating: 'PulseCover 风险评级', out: '您的评级和报价已发送给合作保险公司进行核保。', cta: '打开我的主页' },
    claim: { s: function (n) { return '我们已收到您的理赔 ' + n; }, h: '已收到理赔，', intro: '我们已收到您的理赔申请，您可在线查看每个步骤的进度。', ref: '编号', type: '类型', amount: '金额', date: '事故日期', cta: '追踪我的理赔' },
    wl: { s: '您已加入 PulseCover 名单', h: '感谢您加入', intro: '我们会通知您新功能、可穿戴设备上线和优惠，绝不发送垃圾邮件。', cta: '探索 PulseCover' }
  },
  ms: {
    plan: 'Pelan', rm: 'RM', yr: 'setahun', mo: 'sebulan',
    needs: { info: 'Maklumat am', plan: 'Memilih pelan', claims: 'Tuntutan', business: 'Perlindungan perniagaan', other: 'Lain-lain' },
    times: { morning: 'Pagi', afternoon: 'Petang', evening: 'Malam' },
    types: { hospitalisation: 'Kemasukan hospital', outpatient: 'Pesakit luar', critical_illness: 'Penyakit kritikal', accident: 'Kemalangan', death: 'Kematian' },
    cb: { s: 'Kami telah menerima permintaan panggilan balik anda', h: 'Terima kasih, ', intro: 'Kami telah menerima permintaan anda. Pasukan kami akan menghubungi anda dalam 2 hari bekerja. Inilah yang anda berikan:', phone: 'Telefon', state: 'Negeri', need: 'Bantuan untuk', time: 'Masa terbaik', out: 'Sila sediakan telefon anda. Kami akan menghubungi anda tidak lama lagi.' },
    sme: { s: 'Kami telah menerima pertanyaan perniagaan anda', h: 'Terima kasih, ', intro: function (c, n) { return 'Terima kasih kerana berminat dengan PulseCover untuk ' + c + '. Anggaran anda untuk ' + n + ' pekerja ditunjukkan di bawah. Kami akan menghubungi anda dalam 2 hari bekerja.'; }, per: 'Setiap pekerja setahun', total: 'Jumlah setahun', msg: 'Mesej anda', out: 'Anggaran ini hanya panduan. Harga kumpulan akhir bergantung pada aktiviti pasukan anda.' },
    quote: { s: 'Sebut harga PulseCover anda', h: 'Sebut harga anda, ', intro: function (pl) { return 'Berikut ialah sebut harga panduan anda untuk Pelan ' + pl + '.'; }, rating: 'Penarafan Risiko PulseCover', base: 'Premium asas', adj: 'Pelarasan peranti boleh pakai', annual: 'Premium tahunan anda', about: 'kira-kira', out: 'Premium akhir anda ditetapkan semasa pembaharuan berdasarkan purata 12 bulan dan boleh berubah paling banyak 15% ke mana-mana arah.', cta: 'Teruskan permohonan saya' },
    app: { s: function (n) { return 'Polisi PulseCover anda ' + n; }, h: 'Anda dilindungi, ', intro: 'Permohonan anda telah diterima dan polisi anda aktif.', no: 'Nombor polisi', plan: 'Pelan', annual: 'Premium tahunan', rating: 'Penarafan Risiko PulseCover', out: 'Penarafan dan sebut harga anda telah dihantar kepada syarikat insurans rakan kami untuk penjaminan.', cta: 'Buka papan pemuka saya' },
    claim: { s: function (n) { return 'Kami telah menerima tuntutan anda ' + n; }, h: 'Tuntutan diterima, ', intro: 'Kami telah menerima tuntutan anda. Anda boleh mengikuti setiap langkah dalam talian.', ref: 'Rujukan', type: 'Jenis', amount: 'Jumlah', date: 'Tarikh kejadian', cta: 'Jejak tuntutan saya' },
    wl: { s: 'Anda berada dalam senarai PulseCover', h: 'Terima kasih kerana menyertai', intro: 'Kami akan memaklumkan anda tentang ciri baharu, pelancaran peranti dan tawaran. Tiada spam.', cta: 'Terokai PulseCover' }
  },
  ta: {
    plan: 'திட்டம்', rm: 'RM', yr: 'ஆண்டுக்கு', mo: 'மாதத்திற்கு',
    needs: { info: 'பொதுத் தகவல்', plan: 'திட்டத்தைத் தேர்ந்தெடுத்தல்', claims: 'கோரிக்கைகள்', business: 'வணிகக் காப்பீடு', other: 'மற்றவை' },
    times: { morning: 'காலை', afternoon: 'மதியம்', evening: 'மாலை' },
    types: { hospitalisation: 'மருத்துவமனை அனுமதி', outpatient: 'வெளிநோயாளி', critical_illness: 'தீவிர நோய்', accident: 'விபத்து', death: 'மரணம்' },
    cb: { s: 'உங்கள் திரும்ப அழைப்புக் கோரிக்கை கிடைத்தது', h: 'நன்றி, ', intro: 'உங்கள் கோரிக்கை கிடைத்தது. எங்கள் குழு 2 வேலை நாட்களுக்குள் உங்களை அழைப்பார். நீங்கள் தந்த விவரங்கள்:', phone: 'தொலைபேசி', state: 'மாநிலம்', need: 'தேவையான உதவி', time: 'வசதியான நேரம்', out: 'உங்கள் தொலைபேசியை அருகில் வைத்திருங்கள். விரைவில் தொடர்பு கொள்வோம்.' },
    sme: { s: 'உங்கள் வணிக விசாரணை கிடைத்தது', h: 'நன்றி, ', intro: function (c, n) { return c + ' நிறுவனத்திற்கான PulseCover ஆர்வத்திற்கு நன்றி. ' + n + ' ஊழியர்களுக்கான மதிப்பீடு கீழே உள்ளது. 2 வேலை நாட்களுக்குள் தொடர்பு கொள்வோம்.'; }, per: 'ஒரு ஊழியருக்கு ஆண்டுக்கு', total: 'ஆண்டுக்கு மொத்தம்', msg: 'உங்கள் செய்தி', out: 'இந்த மதிப்பீடு குறிப்புக்காக மட்டுமே. இறுதிக் குழு விலை உங்கள் குழுவின் செயல்பாட்டைப் பொறுத்தது.' },
    quote: { s: 'உங்கள் PulseCover விலை', h: 'உங்கள் விலை, ', intro: function (pl) { return 'திட்டம் ' + pl + '-க்கான உங்கள் குறிப்பு விலை இதோ.'; }, rating: 'PulseCover இடர் மதிப்பீடு', base: 'அடிப்படை பிரீமியம்', adj: 'அணிகலன் சரிசெய்தல்', annual: 'உங்கள் ஆண்டுப் பிரீமியம்', about: 'சுமார்', out: 'இறுதிப் பிரீமியம் புதுப்பிக்கும்போது 12 மாத சராசரியிலிருந்து நிர்ணயிக்கப்படும்; அதிகபட்சம் 15% மட்டுமே மாறும்.', cta: 'என் விண்ணப்பத்தைத் தொடர்க' },
    app: { s: function (n) { return 'உங்கள் PulseCover பாலிசி ' + n; }, h: 'நீங்கள் காப்பீடு பெற்றுள்ளீர்கள், ', intro: 'உங்கள் விண்ணப்பம் கிடைத்தது; பாலிசி செயலில் உள்ளது.', no: 'பாலிசி எண்', plan: 'திட்டம்', annual: 'ஆண்டுப் பிரீமியம்', rating: 'PulseCover இடர் மதிப்பீடு', out: 'உங்கள் மதிப்பீடும் விலையும் ஒப்புதலுக்காக எங்கள் கூட்டாளி காப்பீட்டாளருக்கு அனுப்பப்பட்டுள்ளது.', cta: 'என் டாஷ்போர்டைத் திற' },
    claim: { s: function (n) { return 'உங்கள் கோரிக்கை கிடைத்தது ' + n; }, h: 'கோரிக்கை கிடைத்தது, ', intro: 'உங்கள் கோரிக்கை கிடைத்தது. ஒவ்வொரு படியையும் ஆன்லைனில் பின்தொடரலாம்.', ref: 'குறிப்பு எண்', type: 'வகை', amount: 'தொகை', date: 'சம்பவ தேதி', cta: 'என் கோரிக்கையைக் கண்காணி' },
    wl: { s: 'நீங்கள் PulseCover பட்டியலில் உள்ளீர்கள்', h: 'இணைந்ததற்கு நன்றி', intro: 'புதிய அம்சங்கள், சாதன அறிமுகங்கள், சலுகைகள் பற்றி தெரிவிப்போம். ஸ்பேம் இல்லை.', cta: 'PulseCover-ஐ ஆராயுங்கள்' }
  }
};

function buildEmail2(a, d, ref) {
  if (a === 'register' || a === 'contact') return buildEmail(a, d, ref);
  const lang = ({ en: 1, zh: 1, ms: 1, ta: 1 })[d.lang] ? d.lang : 'en';
  const t = M[lang], name = esc(d.name || '');
  const row = function (k, v) { return '<b>' + esc(k) + ':</b> ' + v; };
  let subject = '', title = '', inner = '';
  if (a === 'callback') {
    const c = t.cb; subject = c.s; title = c.h + name;
    inner = p(esc(c.intro)) + box([row(c.phone, esc(d.phone)), row(c.state, esc(d.state)), row(c.need, esc(t.needs[d.need] || d.need)), row(c.time, esc(t.times[d.time] || d.time))].join('<br>')) + p(esc(c.out));
  } else if (a === 'sme') {
    const c = t.sme; subject = c.s; title = c.h + esc(d.contact || '');
    inner = p(esc(c.intro(d.company, d.employees))) + box([row(c.per, t.rm + ' ' + esc(d.quote && d.quote.perEmployeeAnnual)), row(c.total, t.rm + ' ' + esc(d.quote && d.quote.totalAnnual)), row(c.msg, nl2br(d.message || '-'))].join('<br>')) + p(esc(c.out));
  } else if (a === 'quote') {
    const c = t.quote; subject = c.s; title = c.h + name;
    inner = p(esc(c.intro(d.plan))) + box([row(c.rating, esc(d.grade) + ' (' + esc(d.score) + '/100)'), row(c.base, t.rm + ' ' + esc(d.base)), row(c.adj, esc(d.adjustmentPct) + '%'), row(c.annual, t.rm + ' ' + esc(d.annualPremium) + ' (' + esc(c.about) + ' ' + t.rm + ' ' + esc(d.monthlyPremium) + ' ' + esc(t.mo) + ')')].join('<br>')) + p(esc(c.out)) + btn(c.cta, SITE + '/apply?plan=' + encodeURIComponent(d.plan));
  } else if (a === 'application') {
    const c = t.app; subject = c.s(d.number); title = c.h + name;
    inner = p(esc(c.intro)) + box([row(c.no, esc(d.number)), row(c.plan, esc(t.plan) + ' ' + esc(d.plan)), row(c.annual, t.rm + ' ' + esc(d.premium)), row(c.rating, esc(d.grade))].join('<br>')) + p(esc(c.out)) + btn(c.cta, SITE + '/dashboard');
  } else if (a === 'claim') {
    const c = t.claim; subject = c.s(d.number); title = c.h + name;
    inner = p(esc(c.intro)) + box([row(c.ref, esc(d.number)), row(c.type, esc(t.types[d.type] || d.type)), row(c.amount, t.rm + ' ' + esc(d.amount)), row(c.date, esc(d.incident))].join('<br>')) + btn(c.cta, SITE + '/claims');
  } else if (a === 'waitlist') {
    const c = t.wl; subject = c.s; title = c.h;
    inner = p(esc(c.intro)) + btn(c.cta, SITE);
  } else { return null; }
  const html = layout(title, inner, lang);
  return { subject: subject, html: html, text: strip(html) };
}

/**
 * Account data backup. The PulseCover server saves its accounts here (hidden tab "_Backup", one previous copy in "_Backup_prev")
 * and reads them back when Render restarts, because Render's free disk is wiped on every restart.
 * Chunks start with the letter J so Sheets never treats them as a formula or a number.
 */
function handleBackup(a, d) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName('_Backup') || ss.insertSheet('_Backup');
  if (a === 'restore') {
    const n = sh.getLastRow();
    const vals = n ? sh.getRange(1, 1, n, 1).getValues().map(function (r) { return r[0]; }).filter(function (x) { return x !== ''; }) : [];
    return { ok: true, chunks: vals };
  }
  const prev = ss.getSheetByName('_Backup_prev') || ss.insertSheet('_Backup_prev');
  const last = sh.getLastRow();
  prev.clearContents();
  if (last) prev.getRange(1, 1, last, 1).setValues(sh.getRange(1, 1, last, 1).getValues());
  sh.clearContents();
  const ch = (d && d.chunks) || [];
  if (ch.length) sh.getRange(1, 1, ch.length, 1).setValues(ch.map(function (c) { return [String(c)]; }));
  [sh, prev].forEach(function (x) { try { x.hideSheet(); } catch (e) { /* needs at least one visible sheet */ } });
  return { ok: true, chunks: ch.length };
}

/* ---------- family plan invite (one email, only at the plan holder's request, only to the address they typed) ---------- */
const FAM = {
  en: { rel: { spouse: 'spouse', child: 'child', parent: 'parent', other: 'family member' },
    s: function (n) { return n + ' invited you to join their PulseCover family plan'; }, h: function (n) { return 'Join ' + n + '\'s family plan'; },
    intro: function (n, r) { return n + ' has invited you to join their PulseCover family plan as their ' + r + '.'; },
    what: 'PulseCover links your own wearable through Apple Health or Google Health Connect and turns your daily habits into a Health Score. It is a data service, not an insurer, and partner insurers set the final prices.',
    share: 'You will only share your Health Score and grade, never your raw health data.', accept: 'Accept invite', decline: 'Decline',
    expire: function (days) { return 'This invite expires in ' + days + ' days and can be used once.'; }, ignore: 'If you weren\'t expecting this, you can ignore this email.' },
  zh: { rel: { spouse: '配偶', child: '子女', parent: '父母', other: '家人' },
    s: function (n) { return n + ' 邀请您加入其 PulseCover 家庭计划'; }, h: function (n) { return '加入 ' + n + ' 的家庭计划'; },
    intro: function (n, r) { return n + ' 邀请您以“' + r + '”身份加入其 PulseCover 家庭计划。'; },
    what: 'PulseCover 通过 Apple Health 或 Google Health Connect 连接您自己的可穿戴设备，把您的日常习惯转化为健康评分。它是数据服务而非保险公司，最终价格由合作保险公司决定。',
    share: '您只会分享您的健康评分和等级，绝不会分享原始健康数据。', accept: '接受邀请', decline: '拒绝',
    expire: function (days) { return '此邀请将在 ' + days + ' 天后失效，且只能使用一次。'; }, ignore: '如果您并不期待这封邮件，可以直接忽略。' },
  ms: { rel: { spouse: 'pasangan', child: 'anak', parent: 'ibu bapa', other: 'ahli keluarga' },
    s: function (n) { return n + ' menjemput anda menyertai pelan keluarga PulseCover mereka'; }, h: function (n) { return 'Sertai pelan keluarga ' + n; },
    intro: function (n, r) { return n + ' telah menjemput anda menyertai pelan keluarga PulseCover mereka sebagai ' + r + ' mereka.'; },
    what: 'PulseCover menyambungkan peranti boleh pakai anda sendiri melalui Apple Health atau Google Health Connect dan menukar tabiat harian anda kepada Skor Kesihatan. Ia perkhidmatan data, bukan penanggung insurans, dan penanggung insurans rakan menetapkan harga akhir.',
    share: 'Anda hanya akan berkongsi Skor Kesihatan dan gred anda, tidak sekali-kali data kesihatan mentah.', accept: 'Terima jemputan', decline: 'Tolak',
    expire: function (days) { return 'Jemputan ini tamat dalam ' + days + ' hari dan boleh digunakan sekali sahaja.'; }, ignore: 'Jika anda tidak menjangkakannya, anda boleh abaikan e-mel ini.' },
  ta: { rel: { spouse: 'துணைவர்', child: 'குழந்தை', parent: 'பெற்றோர்', other: 'குடும்ப உறுப்பினர்' },
    s: function (n) { return n + ' தங்கள் PulseCover குடும்பத் திட்டத்தில் சேர உங்களை அழைத்துள்ளார்'; }, h: function (n) { return n + ' குடும்பத் திட்டத்தில் சேருங்கள்'; },
    intro: function (n, r) { return n + ' தங்கள் PulseCover குடும்பத் திட்டத்தில் தங்கள் ' + r + ' ஆகச் சேர உங்களை அழைத்துள்ளார்.'; },
    what: 'PulseCover உங்கள் சொந்த அணியக்கூடிய சாதனத்தை Apple Health அல்லது Google Health Connect வழியாக இணைத்து, உங்கள் தினசரிப் பழக்கங்களை ஆரோக்கிய மதிப்பெண்ணாக மாற்றுகிறது. இது தரவுச் சேவை, காப்பீட்டாளர் அல்ல; இறுதி விலையை கூட்டாளர் காப்பீட்டாளர்கள் நிர்ணயிப்பர்.',
    share: 'உங்கள் ஆரோக்கிய மதிப்பெண்ணையும் தரத்தையும் மட்டுமே பகிர்வீர்கள்; மூல ஆரோக்கியத் தரவை ஒருபோதும் அல்ல.', accept: 'அழைப்பை ஏற்கவும்', decline: 'நிராகரி',
    expire: function (days) { return 'இந்த அழைப்பு ' + days + ' நாட்களில் காலாவதியாகும்; ஒருமுறை மட்டுமே பயன்படுத்தலாம்.'; }, ignore: 'இதை எதிர்பார்க்கவில்லை என்றால் இந்த மின்னஞ்சலைப் புறக்கணிக்கலாம்.' }
};
function handleFamilyInvite(d) {
  if (!validEmail(d.to)) return { ok: false, error: 'invalid recipient' };
  if (String(d.link).indexOf(SITE + '/invite/') !== 0 || String(d.decline).indexOf(SITE + '/invite/') !== 0) return { ok: false, error: 'invalid link' };
  const L = FAM[d.lang] || FAM.en, name = String(d.inviter || 'A PulseCover member').slice(0, 60), rel = L.rel[d.relationship] || L.rel.other, days = Number(d.days) || 7;
  const inner = p(esc(L.intro(name, rel))) + p(esc(L.what)) + box('<b>' + esc(L.share) + '</b>') + btn(L.accept, d.link) +
    '<p style="margin:10px 0 18px;font-size:14px"><a href="' + d.decline + '" style="color:#646273">' + esc(L.decline) + '</a></p>' + p('<span style="color:#646273;font-size:13px">' + esc(L.expire(days)) + '<br>' + esc(L.ignore) + '</span>');
  const text = L.intro(name, rel) + '\n\n' + L.what + '\n\n' + L.share + '\n\n' + L.accept + ': ' + d.link + '\n' + L.decline + ': ' + d.decline + '\n\n' + L.expire(days) + '\n' + L.ignore;
  MailApp.sendEmail({ to: d.to, subject: L.s(name), htmlBody: layout(L.h(name), inner, d.lang), body: text, name: BRAND_NAME, noReply: true });
  return { ok: true, emailed: true };
}

/** Run once from the editor to check the family invite email layout (sends a sample invite to your own address; the link is a dummy). */
function testFamilyInvite() {
  const me = Session.getActiveUser().getEmail(), dummy = SITE + '/invite/' + new Array(65).join('a');
  Logger.log(JSON.stringify(handleFamilyInvite({ to: me, inviter: 'Gene', relationship: 'spouse', link: dummy, decline: dummy + '?decline=1', lang: 'en', days: 7 })));
}
