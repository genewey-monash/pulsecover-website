/* v4 translations: accounts, search, theme, referral, email-me-this-quote, confirmation messages. Order: [English, Chinese, Malay, Tamil]. */
Object.assign(window.PC_I18N, {
  'search.g.page': ['Pages', '页面', 'Halaman', 'பக்கங்கள்'],
  'search.g.tool': ['Tools and actions', '工具与操作', 'Alat dan tindakan', 'கருவிகள் மற்றும் செயல்கள்'],
  'search.g.plan': ['Plans', '保障计划', 'Pelan', 'திட்டங்கள்'],
  'search.g.faq': ['Questions', '常见问题', 'Soalan', 'கேள்விகள்'],
  'search.popular': ['Popular searches', '热门搜索', 'Carian popular', 'பிரபலமான தேடல்கள்'],
  'search.hint': ['Tip: press / to search from any page.', '提示：在任何页面按 / 即可搜索。', 'Petua: tekan / untuk mencari dari mana-mana halaman.', 'குறிப்பு: எந்தப் பக்கத்திலும் / அழுத்தித் தேடலாம்.'],
  'search.enter': ['Use the arrow keys to move and Enter to open.', '使用方向键移动，按 Enter 打开。', 'Guna kekunci anak panah untuk bergerak dan Enter untuk membuka.', 'அம்புக்குறி விசைகளால் நகர்ந்து Enter அழுத்தித் திறக்கவும்.'],
  'theme.dark': ['Switch to dark mode', '切换到深色模式', 'Tukar ke mod gelap', 'இருண்ட பயன்முறைக்கு மாறு'],
  'theme.light': ['Switch to light mode', '切换到浅色模式', 'Tukar ke mod cerah', 'ஒளி பயன்முறைக்கு மாறு'],

  // account
  'acc.sub': ['Log in or create your PulseCover account.', '登录或创建您的 PulseCover 账户。', 'Log masuk atau cipta akaun PulseCover anda.', 'உங்கள் PulseCover கணக்கில் உள்நுழையவும் அல்லது உருவாக்கவும்.'],
  'acc.register.sub': ['Create your account to connect a wearable, get your risk rating and apply.', '创建账户，连接可穿戴设备，获取风险评级并投保。', 'Cipta akaun anda untuk menyambung peranti, mendapatkan penarafan risiko dan memohon.', 'சாதனத்தை இணைக்க, இடர் மதிப்பீட்டைப் பெற, விண்ணப்பிக்க உங்கள் கணக்கை உருவாக்குங்கள்.'],
  'field.password2': ['Confirm password', '确认密码', 'Sahkan kata laluan', 'கடவுச்சொல்லை உறுதிப்படுத்துங்கள்'],
  'field.password.login': ['Password', '密码', 'Kata laluan', 'கடவுச்சொல்'],
  'acc.show': ['Show', '显示', 'Tunjuk', 'காட்டு'],
  'acc.hide': ['Hide', '隐藏', 'Sembunyi', 'மறை'],
  'acc.err.name': ['Please enter your full name.', '请输入您的姓名。', 'Sila masukkan nama penuh anda.', 'உங்கள் முழுப் பெயரை உள்ளிடவும்.'],
  'acc.err.email': ['Invalid email address.', '邮箱地址无效。', 'Alamat e-mel tidak sah.', 'மின்னஞ்சல் முகவரி தவறானது.'],
  'acc.err.pwlen': ['Password must be at least 8 characters.', '密码至少需要 8 个字符。', 'Kata laluan mestilah sekurang-kurangnya 8 aksara.', 'கடவுச்சொல் குறைந்தது 8 எழுத்துகள் இருக்க வேண்டும்.'],
  'acc.err.match': ['The passwords do not match. Please enter them again.', '两次输入的密码不一致，请重新输入。', 'Kata laluan tidak sepadan. Sila masukkan semula.', 'கடவுச்சொற்கள் பொருந்தவில்லை. மீண்டும் உள்ளிடவும்.'],
  'acc.err.dob': ['You must be 16 or older to register.', '须年满 16 岁方可注册。', 'Anda mesti berumur 16 tahun atau lebih untuk mendaftar.', 'பதிவு செய்ய 16 வயது அல்லது அதற்கு மேல் இருக்க வேண்டும்.'],
  'acc.err.exists': ['An account with this email already exists. Please log in instead.', '该邮箱已注册账户，请直接登录。', 'Akaun dengan e-mel ini sudah wujud. Sila log masuk.', 'இந்த மின்னஞ்சலில் ஏற்கனவே கணக்கு உள்ளது. உள்நுழையவும்.'],
  'acc.err.login': ['Incorrect email or password.', '邮箱或密码不正确。', 'E-mel atau kata laluan tidak betul.', 'மின்னஞ்சல் அல்லது கடவுச்சொல் தவறானது.'],
  'acc.pw.0': ['Too short', '太短', 'Terlalu pendek', 'மிகக் குறுகியது'],
  'acc.pw.1': ['Weak', '弱', 'Lemah', 'பலவீனம்'],
  'acc.pw.2': ['Fair', '一般', 'Sederhana', 'நடுத்தரம்'],
  'acc.pw.3': ['Good', '良好', 'Baik', 'நன்று'],
  'acc.pw.4': ['Strong', '强', 'Kuat', 'வலிமை'],
  'acc.created': ['Account created', '账户已创建', 'Akaun dicipta', 'கணக்கு உருவாக்கப்பட்டது'],
  'acc.created.p': ['We have sent a welcome email to', '我们已向以下邮箱发送欢迎邮件：', 'Kami telah menghantar e-mel alu-aluan ke', 'வரவேற்பு மின்னஞ்சலை அனுப்பியுள்ளோம்:'],
  'acc.welcome.note': ['After you register, we email you a welcome message with your account perks.', '注册后，我们会向您发送包含账户福利的欢迎邮件。', 'Selepas mendaftar, kami menghantar e-mel alu-aluan dengan faedah akaun anda.', 'பதிவு செய்தபின், கணக்கு நன்மைகளுடன் வரவேற்பு மின்னஞ்சல் அனுப்புவோம்.'],

  // confirmation messages (every contact path sends a no-reply email)
  'ct.ok': ['Message sent. We have emailed you a confirmation with a copy of your message.', '留言已发送。我们已向您发送确认邮件，附上您的留言副本。', 'Mesej dihantar. Kami telah menghantar e-mel pengesahan dengan salinan mesej anda.', 'செய்தி அனுப்பப்பட்டது. உங்கள் செய்தியின் நகலுடன் உறுதிப்படுத்தல் மின்னஞ்சல் அனுப்பியுள்ளோம்.'],
  'ct.ack': ['We will also email you a confirmation with a copy of your message.', '我们还会向您发送带有留言副本的确认邮件。', 'Kami juga akan menghantar e-mel pengesahan dengan salinan mesej anda.', 'உங்கள் செய்தியின் நகலுடன் உறுதிப்படுத்தல் மின்னஞ்சலும் அனுப்புவோம்.'],
  'cb.ok': ['Thank you! An advisor will call you back within 2 working days. We have emailed you a confirmation.', '谢谢！顾问将在 2 个工作日内回电，我们已向您发送确认邮件。', 'Terima kasih! Penasihat akan menghubungi anda dalam 2 hari bekerja. Kami telah menghantar e-mel pengesahan.', 'நன்றி! ஆலோசகர் 2 வேலை நாட்களுக்குள் அழைப்பார். உறுதிப்படுத்தல் மின்னஞ்சல் அனுப்பியுள்ளோம்.'],
  'cb.email.note': ['We will email you a confirmation.', '我们会向您发送确认邮件。', 'Kami akan menghantar e-mel pengesahan.', 'உறுதிப்படுத்தல் மின்னஞ்சல் அனுப்புவோம்.'],
  'sme.ok': ['Thank you! We have emailed you a confirmation and will be in touch within 2 working days.', '谢谢！我们已向您发送确认邮件，并将在 2 个工作日内联系您。', 'Terima kasih! Kami telah menghantar e-mel pengesahan dan akan menghubungi dalam 2 hari bekerja.', 'நன்றி! உறுதிப்படுத்தல் மின்னஞ்சல் அனுப்பியுள்ளோம்; 2 வேலை நாட்களுக்குள் தொடர்பு கொள்வோம்.'],
  'home.waitlist.ok': ['You are on the list. Check your email for a confirmation.', '您已加入名单，请查收确认邮件。', 'Anda dalam senarai. Semak e-mel anda untuk pengesahan.', 'நீங்கள் பட்டியலில் உள்ளீர்கள். உறுதிப்படுத்தலுக்கு மின்னஞ்சலைப் பாருங்கள்.'],
  'cl.done': ['Claim submitted. Reference:', '理赔已提交。编号：', 'Tuntutan dihantar. Rujukan:', 'கோரிக்கை சமர்ப்பிக்கப்பட்டது. குறிப்பு எண்:'],
  'cl.email': ['We have also emailed you a confirmation.', '我们也已向您发送确认邮件。', 'Kami juga telah menghantar e-mel pengesahan.', 'உறுதிப்படுத்தல் மின்னஞ்சலும் அனுப்பியுள்ளோம்.'],

  // email me this quote
  'eq.h': ['Email me this quote', '把此报价发到我的邮箱', 'E-melkan sebut harga ini kepada saya', 'இந்த விலையை எனக்கு மின்னஞ்சல் செய்யுங்கள்'],
  'eq.ph': ['Your email address', '您的邮箱地址', 'Alamat e-mel anda', 'உங்கள் மின்னஞ்சல் முகவரி'],
  'eq.btn': ['Send quote', '发送报价', 'Hantar sebut harga', 'விலையை அனுப்பு'],
  'eq.ok': ['Sent. Check your inbox in a minute.', '已发送，请稍后查收邮箱。', 'Dihantar. Semak peti masuk anda sebentar lagi.', 'அனுப்பப்பட்டது. சிறிது நேரத்தில் இன்பாக்ஸைப் பாருங்கள்.'],
  'eq.note': ['An indicative quote. No obligation.', '仅供参考的报价，无任何义务。', 'Sebut harga panduan. Tiada obligasi.', 'குறிப்புக்கான விலை. கட்டாயம் இல்லை.'],

  // referral section
  'ref.h': ['Share PulseCover with a friend', '与朋友分享 PulseCover', 'Kongsi PulseCover dengan rakan', 'PulseCover-ஐ நண்பருடன் பகிருங்கள்'],
  'ref.p': ['Earn a RM10–20 credit for each friend who joins and links a wearable. Climb the leaderboard and unlock milestone rewards.', '每位加入并连接设备的朋友可为您带来 RM10–20 积分。冲上排行榜，解锁里程碑奖励。', 'Dapatkan kredit RM10–20 bagi setiap rakan yang menyertai dan menyambung peranti. Naik papan pendahulu dan buka ganjaran pencapaian.', 'சேர்ந்து சாதனத்தை இணைக்கும் ஒவ்வொரு நண்பருக்கும் RM10–20 கிரெடிட் பெறுங்கள். தரவரிசையில் உயர்ந்து மைல்கல் பரிசுகளைத் திறக்கவும்.'],
  'ref.s1': ['Copy your personal code from your dashboard', '在主页复制您的专属推荐码', 'Salin kod peribadi anda daripada papan pemuka', 'டாஷ்போர்டில் உங்கள் தனிப்பட்ட குறியீட்டை நகலெடுக்கவும்'],
  'ref.s2': ['Your friend joins and links a wearable', '朋友加入并连接设备', 'Rakan anda menyertai dan menyambung peranti', 'உங்கள் நண்பர் சேர்ந்து சாதனத்தை இணைக்கிறார்'],
  'ref.s3': ['You receive a RM10 to RM20 credit', '您获得 RM10 至 RM20 积分', 'Anda menerima kredit RM10 hingga RM20', 'உங்களுக்கு RM10 முதல் RM20 கிரெடிட் கிடைக்கும்'],
  'ref.cta': ['Get my code', '获取我的推荐码', 'Dapatkan kod saya', 'என் குறியீட்டைப் பெறு']
});
