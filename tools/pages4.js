// v4 overrides: real account flow, referral section, quote emails, contact acknowledgements.
module.exports = (pages, D) => {
  // ---------------- ACCOUNT ----------------
  const pw = (id, label, auto) => `<label ${D(label)} for="${id}"></label><div class="pwwrap"><input type="password" id="${id}" required autocomplete="${auto}" minlength="8"><button type="button" class="pwtog" data-for="${id}" ${D('acc.show')}></button></div><p class="fhelp" id="${id}_e"></p>`;
  pages['account'] = ['Account', 'Log in or create your PulseCover account.', `
<main><section class="sec"><div class="wrap" style="max-width:540px"><h1 ${D('acc.h1')}></h1><p class="lead" ${D('acc.sub')}></p>
<div class="card" id="loginbox"><h3 ${D('acc.login')}></h3><form id="lf" novalidate>
 <label ${D('field.email')} for="le"></label><input type="email" id="le" required autocomplete="email" inputmode="email"><p class="fhelp" id="le_e"></p>
 ${pw('lp', 'field.password.login', 'current-password')}
 <div id="lm" class="msg"></div><button class="btn" style="margin-top:18px;width:100%" ${D('acc.login')}></button></form>
 <p style="margin:18px 0 0"><span ${D('acc.new')}></span> <a href="#" id="toreg" ${D('acc.register')}></a></p></div>
<div class="card" id="regbox" style="display:none"><h3 ${D('acc.register')}></h3><p style="color:var(--mute);font-size:.92rem" ${D('acc.register.sub')}></p><form id="rf" novalidate>
 <label ${D('field.name')} for="rn"></label><input id="rn" required autocomplete="name" maxlength="100"><p class="fhelp" id="rn_e"></p>
 <label ${D('field.email')} for="re"></label><input type="email" id="re" required autocomplete="email" inputmode="email"><p class="fhelp" id="re_e"></p>
 <label ${D('field.dob')} for="rd"></label><input type="date" id="rd" required><p class="fhelp" id="rd_e"></p>
 ${pw('rp', 'field.password', 'new-password')}<div class="pwmeter"><i id="rmeter"></i></div><p style="font-size:.8rem;color:var(--mute);margin:6px 0 0" id="rstrength"></p>
 ${pw('rp2', 'field.password2', 'new-password')}
 <label ${D('field.referral')} for="rr"></label><input id="rr" autocomplete="off" maxlength="20">
 <p style="font-size:.85rem;color:var(--mute);margin:14px 0 0" ${D('acc.welcome.note')}></p>
 <div id="rm" class="msg"></div><button class="btn" style="margin-top:18px;width:100%" ${D('acc.register')}></button></form>
 <p style="margin:18px 0 0"><span ${D('acc.have')}></span> <a href="#" id="tolog" ${D('acc.login')}></a></p></div>
<div class="card" id="okbox" style="display:none;text-align:center"><div class="ico" style="margin:0 auto 14px">&#10003;</div><h3 ${D('acc.created')}></h3><p id="okmail" style="margin:0"></p></div>
</div></section></main>`, `
const q=new URLSearchParams(location.search);const next=q.get('next')&&q.get('next').startsWith('/')?q.get('next'):'/dashboard';
const EMAIL=/^[^\\s@]+@[^\\s@.]+(\\.[^\\s@.]+)*\\.[A-Za-z]{2,}$/;
function bad(id,key){const i=document.getElementById(id),h=document.getElementById(id+'_e');if(key){i.classList.add('fld-err');h.textContent=PC.t(key);h.classList.add('on')}else{i.classList.remove('fld-err');h.classList.remove('on')}return !key}
if(q.get('ref')){document.getElementById('rr').value=q.get('ref');show(true)}
function show(r){document.getElementById('loginbox').style.display=r?'none':'';document.getElementById('regbox').style.display=r?'':'none'}
document.getElementById('toreg').onclick=e=>{e.preventDefault();show(true)};document.getElementById('tolog').onclick=e=>{e.preventDefault();show(false)};
document.getElementById('rd').max=new Date().toISOString().slice(0,10);
document.querySelectorAll('.pwtog').forEach(b=>b.onclick=()=>{const i=document.getElementById(b.dataset.for);const s=i.type==='password';i.type=s?'text':'password';b.textContent=PC.t(s?'acc.hide':'acc.show')});
window.addEventListener('pc:lang',()=>document.querySelectorAll('.pwtog').forEach(b=>b.textContent=PC.t(document.getElementById(b.dataset.for).type==='password'?'acc.show':'acc.hide')));
function strength(v){let s=0;if(v.length>=8)s++;if(/[A-Z]/.test(v)&&/[a-z]/.test(v))s++;if(/\\d/.test(v))s++;if(/[^A-Za-z0-9]/.test(v)||v.length>=14)s++;return v.length<8?0:Math.max(1,s)}
rp.oninput=()=>{const s=strength(rp.value),m=document.getElementById('rmeter');m.style.width=(rp.value?[12,30,55,80,100][s]:0)+'%';m.style.background=['#c92a2a','#e8590c','#d99a06','#2b9348','#1c7a3c'][s];document.getElementById('rstrength').textContent=rp.value?PC.t('acc.pw.'+s):'';document.getElementById('rstrength').style.color=['#C92A2A','#C2410C','#9A6B00','#2B9348','#1C7A3C'][s];if(rp.value.length>=8&&document.getElementById('rp_e').classList.contains('on'))bad('rp',null);if(rp2.value)bad('rp2',rp.value===rp2.value?null:'acc.err.match')};
rp.onblur=()=>rp.value&&bad('rp',rp.value.length>=8?null:'acc.err.pwlen');
rp2.oninput=()=>bad('rp2',rp.value===rp2.value?null:'acc.err.match');
re.onblur=()=>re.value&&bad('re',EMAIL.test(re.value.trim())?null:'acc.err.email');le.onblur=()=>le.value&&bad('le',EMAIL.test(le.value.trim())?null:'acc.err.email');
PC.ready.then(()=>{if(PC.user)location.href=next});
function srv(m){m=m||'';if(/already exists/i.test(m))return PC.t('acc.err.exists');if(/incorrect/i.test(m))return PC.t('acc.err.login');if(/invalid email/i.test(m))return PC.t('acc.err.email');if(/do not match/i.test(m))return PC.t('acc.err.match');if(/at least 16/i.test(m))return PC.t('acc.err.dob');return m}
document.getElementById('lf').onsubmit=async e=>{e.preventDefault();const m=document.getElementById('lm');m.className='msg';
 const ok=bad('le',EMAIL.test(le.value.trim())?null:'acc.err.email')&bad('lp',lp.value?null:'acc.err.pwlen');if(!ok){const f=document.querySelector('#lf .fld-err');if(f)f.focus();const h=document.querySelector('#lf .fhelp.on');if(h)PC.msg(m,h.textContent);return}
 try{await PC.api('/login',{email:le.value.trim(),password:lp.value});location.href=next}catch(x){PC.msg(m,srv(x.message))}};
document.getElementById('rf').onsubmit=async e=>{e.preventDefault();const m=document.getElementById('rm');m.className='msg';
 const age=(d=>{const t=new Date(),b=new Date(d);let a=t.getFullYear()-b.getFullYear();const md=t.getMonth()-b.getMonth();if(md<0||(md===0&&t.getDate()<b.getDate()))a--;return a})(rd.value);
 const ok=[bad('rn',rn.value.trim().length>=2?null:'acc.err.name'),bad('re',EMAIL.test(re.value.trim())?null:'acc.err.email'),bad('rd',rd.value&&age>=16?null:'acc.err.dob'),bad('rp',rp.value.length>=8?null:'acc.err.pwlen'),bad('rp2',rp.value===rp2.value?null:'acc.err.match')].every(Boolean);
 if(!ok){if(rp.value!==rp2.value)rp2.value='';const f=document.querySelector('#rf .fld-err');if(f){f.scrollIntoView({block:'center',behavior:'smooth'});f.focus({preventScroll:true})}const h=document.querySelector('#rf .fhelp.on');if(h)PC.msg(m,h.textContent);return}
 const b=e.target.querySelector('button.btn');b.disabled=true;
 try{await PC.api('/register',{name:rn.value.trim(),email:re.value.trim(),dob:rd.value,password:rp.value,password2:rp2.value,referral:rr.value,lang:PC.lang});
  document.getElementById('regbox').style.display='none';document.getElementById('okbox').style.display='';document.getElementById('okmail').textContent=PC.t('acc.created.p')+' '+re.value.trim();setTimeout(()=>location.href=next,2600)}
 catch(x){PC.msg(m,srv(x.message));b.disabled=false}};`];

  // ---------------- HOME: referral section ----------------
  let [it, id, ib, ij] = pages['index'];
  ib = ib.replace('<section class="sec red" id="advisor">', `<section class="sec white refsec"><div class="wrap"><div class="cards c2" style="align-items:center;gap:44px"><img class="photo" src="/img/referral-friends.jpg" alt="Two friends walking in a park and looking at a phone together" width="1376" height="768" loading="lazy"><div><span class="kicker" ${D('promo.b')}></span><h2 ${D('ref.h')}></h2><p class="lead" ${D('ref.p')}></p><ul class="stepsmall">${[1, 2, 3].map((i) => `<li><b>${i}</b><span ${D('ref.s' + i)}></span></li>`).join('')}</ul><a class="btn" href="/dashboard" ${D('ref.cta')}></a></div></div></div></section>

<section class="sec red" id="advisor">`);
  pages['index'] = [it, id, ib, ij];

  // ---------------- CALCULATOR: email me this quote ----------------
  let [ct, cd, cb, cj] = pages['calculator'];
  cb = cb.replace('data-i18n="calc.connect.btn"></a></div>', 'data-i18n="calc.connect.btn"></a></div><div id="eqhost" style="margin-top:14px"></div>');
  cj += `
PC.emailQuote(document.getElementById('eqhost'),()=>vals());`;
  pages['calculator'] = [ct, cd, cb, cj];

  // ---------------- APPLY: email me this quote on the quote step ----------------
  let [at, ad, ab, aj] = pages['apply'];
  ab = ab.replace('<div class="cta"><button class="btn ghost" data-back="1"', '<div id="eqhost2" style="margin-top:14px"></div><div class="cta"><button class="btn ghost" data-back="1"');
  aj = aj.replace("function showQuote(){", "let eqDone=false;function showQuote(){if(!eqDone){eqDone=true;PC.emailQuote(document.getElementById('eqhost2'),()=>Object.assign({},mets(),{useStored:days>=7}))}");
  pages['apply'] = [at, ad, ab, aj];

  // ---------------- CONTACT: acknowledgement note ----------------
  let [kt, kd, kb, kj] = pages['contact'];
  kb = kb.replace('<div class="msg" id="cm"></div>', '<p style="color:var(--mute);font-size:.85rem;margin:8px 0 0" data-i18n="ct.ack"></p><div class="msg" id="cm"></div>');
  pages['contact'] = [kt, kd, kb, kj];

  // ---------------- CLAIMS: mention the confirmation email ----------------
  let [lt, ld, lb, lj] = pages['claims'];
  lj = lj.replace("PC.t('cl.done')+' '+r.number,true)", "PC.t('cl.done')+' '+r.number+'. '+PC.t('cl.email'),true)");
  pages['claims'] = [lt, ld, lb, lj];

  // ---------------- BUSINESS: team photo ----------------
  let [bt, bd, bb, bj] = pages['business'];
  bb = bb.replace('<p class="lead" data-i18n="sme.sub"></p>', '<p class="lead" data-i18n="sme.sub"></p><img class="photo banner" src="/img/team-meeting.jpg" alt="Three colleagues of different ages in a friendly discussion at a meeting table" width="1376" height="768" loading="lazy">');
  pages['business'] = [bt, bd, bb, bj];

  // ---------------- CALCULATOR: photo banner ----------------
  let [ct2, cd2, cb2, cj2] = pages['calculator'];
  cb2 = cb2.replace('<p class="lead" data-i18n="calc.sub"></p>', '<p class="lead" data-i18n="calc.sub"></p><img class="photo banner" style="object-position:30% 30%" src="/img/cafe-phone.jpg" alt="A man smiling as he checks his phone at a cafe table" width="1376" height="768" loading="lazy">');
  pages['calculator'] = [ct2, cd2, cb2, cj2];
};
