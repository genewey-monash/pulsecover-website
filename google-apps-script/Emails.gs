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
    cb: { s: 'We received your call back request', h: 'Thank you, ', intro: 'We have received your request. An advisor will call you back within 2 working days. Here is what you told us:', phone: 'Phone', state: 'State', need: 'Help with', time: 'Best time', out: 'Please keep your phone nearby. We will be in touch soon.' },
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
    cb: { s: '我们已收到您的回电请求', h: '谢谢您，', intro: '我们已收到您的请求，顾问将在 2 个工作日内回电。以下是您提供的信息：', phone: '电话', state: '州属', need: '需要协助', time: '方便接听时间', out: '请保持手机畅通，我们很快与您联系。' },
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
    cb: { s: 'Kami telah menerima permintaan panggilan balik anda', h: 'Terima kasih, ', intro: 'Kami telah menerima permintaan anda. Penasihat akan menghubungi anda dalam 2 hari bekerja. Inilah yang anda berikan:', phone: 'Telefon', state: 'Negeri', need: 'Bantuan untuk', time: 'Masa terbaik', out: 'Sila sediakan telefon anda. Kami akan menghubungi anda tidak lama lagi.' },
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
    cb: { s: 'உங்கள் திரும்ப அழைப்புக் கோரிக்கை கிடைத்தது', h: 'நன்றி, ', intro: 'உங்கள் கோரிக்கை கிடைத்தது. ஆலோசகர் 2 வேலை நாட்களுக்குள் உங்களை அழைப்பார். நீங்கள் தந்த விவரங்கள்:', phone: 'தொலைபேசி', state: 'மாநிலம்', need: 'தேவையான உதவி', time: 'வசதியான நேரம்', out: 'உங்கள் தொலைபேசியை அருகில் வைத்திருங்கள். விரைவில் தொடர்பு கொள்வோம்.' },
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
