// v5: profile page (personal details, current plan, password).
module.exports = (pages, D) => {
  const pw = (id, label, auto) => `<label ${D(label)} for="${id}"></label><div class="pwwrap"><input type="password" id="${id}" autocomplete="${auto}"><button type="button" class="pwtog" data-for="${id}" ${D('acc.show')}></button></div><p class="fhelp" id="${id}_e"></p>`;
  pages['profile'] = ['My profile', 'Update your personal details, current plan and password.', `
<main><section class="sec"><div class="wrap"><h1 ${D('pf.h1')}></h1><p class="lead" ${D('pf.sub')}></p>
<div class="pgrid">
 <div class="card" id="pcard"><h3 ${D('pf.personal')}></h3><form id="pf" novalidate>
  <label ${D('field.name')} for="p_n"></label><input id="p_n" maxlength="100" autocomplete="name"><p class="fhelp" id="p_n_e"></p>
  <label ${D('field.email')} for="p_e"></label><input id="p_e" type="email" disabled><p class="fnote" ${D('pf.email.note')}></p>
  <div class="rowf"><div><label ${D('field.phone')} for="p_p"></label><input id="p_p" type="tel" maxlength="20" autocomplete="tel" inputmode="tel"><p class="fhelp" id="p_p_e"></p></div>
  <div><label ${D('field.dob')} for="p_d"></label><input id="p_d" type="date"><p class="fhelp" id="p_d_e"></p></div></div>
  <label ${D('pf.address')} for="p_a"></label><input id="p_a" maxlength="200" autocomplete="street-address">
  <label ${D('pf.lang')} for="p_l"></label><select id="p_l"><option value="en">English</option><option value="zh">中文</option><option value="ms">Bahasa Malaysia</option><option value="ta">தமிழ்</option></select>
  <div class="msg" id="pm1"></div><button class="btn" style="margin-top:20px" ${D('pf.save')}></button></form></div>
 <div>
  <div class="card" id="plcard"><h3 ${D('pf.plan.h')}></h3>
   <div id="nopol" style="display:none"><p ${D('pf.plan.none')}></p><a class="btn" href="/apply" ${D('nav.apply')}></a></div>
   <div id="haspol" style="display:none">
    <dl class="kv"><div><dt ${D('pf.policyno')}></dt><dd id="v_no"></dd></div><div><dt ${D('pf.cover')}></dt><dd id="v_cov"></dd></div><div><dt ${D('pf.prem')}></dt><dd id="v_prem"></dd></div><div><dt ${D('pf.renew')}></dt><dd id="v_ren"></dd></div></dl>
    <h4 style="margin:22px 0 12px" ${D('pf.choose')}></h4><div class="plansel" id="psel"></div>
    <label ${D('pf.ben')} for="p_b"></label><input id="p_b" maxlength="100"><p class="fhelp" id="p_b_e"></p>
    <p class="fnote" ${D('pf.plan.note')}></p>
    <div class="msg" id="pm2"></div><button class="btn" id="psave" style="margin-top:16px" ${D('pf.plan.save')}></button></div></div>
  <div class="card" style="margin-top:24px"><h3 ${D('pf.pw.h')}></h3><form id="pwf" novalidate>
   ${pw('w_c', 'pf.pw.cur', 'current-password')}${pw('w_n', 'pf.pw.new', 'new-password')}${pw('w_n2', 'field.password2', 'new-password')}
   <div class="msg" id="pm3"></div><button class="btn" style="margin-top:20px" ${D('pf.pw.btn')}></button></form></div>
 </div></div></div></section></main>`, `
let U,POL,PREV=[],plan='A';
function bad(id,key){const i=document.getElementById(id),h=document.getElementById(id+'_e');if(key){i.classList.add('fld-err');h.textContent=PC.t(key);h.classList.add('on')}else{i.classList.remove('fld-err');h.classList.remove('on')}return !key}
const age=d=>{const t=new Date(),b=new Date(d);if(isNaN(b))return -1;let a=t.getFullYear()-b.getFullYear();const m=t.getMonth()-b.getMonth();if(m<0||(m===0&&t.getDate()<b.getDate()))a--;return a};
document.querySelectorAll('.pwtog').forEach(b=>b.onclick=()=>{const i=document.getElementById(b.dataset.for);const s=i.type==='password';i.type=s?'text':'password';b.textContent=PC.t(s?'acc.hide':'acc.show')});
window.addEventListener('pc:lang',()=>{document.querySelectorAll('.pwtog').forEach(b=>b.textContent=PC.t(document.getElementById(b.dataset.for).type==='password'?'acc.show':'acc.hide'));drawPlans();drawPolicy()});
p_d.max=new Date().toISOString().slice(0,10);
function fillUser(){p_n.value=U.name;p_e.value=U.email;p_p.value=U.phone||'';p_d.value=U.dob||'';p_a.value=U.address||'';p_l.value=U.lang||'en'}
function drawPolicy(){if(!U)return;const has=!!POL;nopol.style.display=has?'none':'';haspol.style.display=has?'':'none';if(!has)return;
 v_no.textContent=POL.number;v_cov.textContent='RM '+PC.fmt(POL.cover,0);v_prem.textContent='RM '+PC.fmt(POL.premium)+PC.t('common.year');v_ren.textContent=POL.renewal_date;if(document.activeElement!==p_b)p_b.value=POL.beneficiary||''}
function drawPlans(){if(!POL||!PREV.length)return;psel.innerHTML=PREV.map(p=>'<button type="button" class="pchoice '+(p.id===plan?'sel':'')+'" data-p="'+p.id+'" aria-pressed="'+(p.id===plan)+'"><b>'+PC.planName(p.id)+'</b><span>RM '+PC.fmt(p.premium,0)+PC.t('common.year')+'</span><small>'+PC.t('pf.cover')+' RM '+PC.fmt(p.cover,0)+'</small>'+(p.id===POL.plan?'<em>'+PC.t('pf.current')+'</em>':'')+'</button>').join('');
 document.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{plan=b.dataset.p;drawPlans()})}
async function load(){try{const d=await PC.api('/dashboard');U=d.user;POL=d.policy;if(POL)plan=POL.plan||'A';fillUser();if(POL)PREV=await PC.api('/policy/preview',{});drawPolicy();drawPlans()}catch(e){if(e.status===401)location.href='/account?next=/profile'}}
PC.ready.then(load);
p_n.onblur=()=>bad('p_n',p_n.value.trim().length>=2?null:'acc.err.name');
pf.onsubmit=async e=>{e.preventDefault();pm1.className='msg';
 const ok=[bad('p_n',p_n.value.trim().length>=2?null:'acc.err.name'),bad('p_p',!p_p.value.trim()||/^\\+?[0-9][0-9 \\-]{6,18}$/.test(p_p.value.trim())?null:'pf.err.phone'),bad('p_d',p_d.value&&age(p_d.value)>=16?null:'acc.err.dob')].every(Boolean);
 if(!ok){const f=document.querySelector('#pf .fld-err');if(f)f.focus();PC.msg(pm1,PC.t('pf.fix'));return}
 try{U=await PC.api('/profile',{name:p_n.value.trim(),phone:p_p.value.trim(),dob:p_d.value,address:p_a.value.trim(),lang:p_l.value});PC.msg(pm1,PC.t('pf.saved'),true);if(U.lang!==PC.lang)PC.setLang(U.lang);PC.user=U;window.dispatchEvent(new CustomEvent('pc:lang',{detail:PC.lang}))}
 catch(x){PC.msg(pm1,/phone/i.test(x.message)?PC.t('pf.err.phone'):/at least 16/i.test(x.message)?PC.t('acc.err.dob'):x.message)}};
psave.onclick=async()=>{pm2.className='msg';if(!bad('p_b',p_b.value.trim().length>=2?null:'common.required'))return;psave.disabled=true;
 try{const r=await PC.api('/policy',{plan,beneficiary:p_b.value.trim()});POL=r.policy;PREV=await PC.api('/policy/preview',{});drawPolicy();drawPlans();PC.msg(pm2,PC.t('pf.plan.done'),true)}catch(x){PC.msg(pm2,x.message)}psave.disabled=false};
w_n2.oninput=()=>bad('w_n2',w_n.value===w_n2.value?null:'acc.err.match');w_n.onblur=()=>w_n.value&&bad('w_n',w_n.value.length>=8?null:'acc.err.pwlen');
pwf.onsubmit=async e=>{e.preventDefault();pm3.className='msg';
 const ok=[bad('w_c',w_c.value?null:'common.required'),bad('w_n',w_n.value.length>=8?null:'acc.err.pwlen'),bad('w_n2',w_n.value===w_n2.value?null:'acc.err.match')].every(Boolean);
 if(!ok){const f=document.querySelector('#pwf .fld-err');if(f)f.focus();PC.msg(pm3,PC.t('pf.fix'));return}
 try{await PC.api('/password',{current:w_c.value,password:w_n.value,password2:w_n2.value});PC.msg(pm3,PC.t('pf.pw.done'),true);pwf.reset()}
 catch(x){if(/incorrect/i.test(x.message)){bad('w_c','pf.pw.wrong');PC.msg(pm3,PC.t('pf.pw.wrong'))}else PC.msg(pm3,/do not match/i.test(x.message)?PC.t('acc.err.match'):x.message)}};`];

  pages['thank-you'] = ['Thank you', 'Thank you. Your request has been received.', `
<main><section class="sec"><div class="wrap ty"><span class="tyico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>
 <h1 id="ty_h"></h1>
 <div class="tymail" id="ty_mail" style="display:none"><span ${D('ty.sent')}></span> <b id="ty_em"></b><small ${D('ty.spam')}></small></div>
 <p class="tyref" id="ty_ref" style="display:none"><span ${D('ty.ref')}></span>: <b id="ty_refv"></b></p>
 <div class="card tynext"><h3 ${D('ty.next')}></h3><ol class="tysteps"><li id="ty_1"></li><li id="ty_2"></li><li id="ty_3"></li></ol></div>
 <div class="cta tycta"><a class="btn" href="/" ${D('ty.home')}></a><a class="btn ghost" href="/plans" ${D('ty.explore')}></a></div>
</div></section></main>`, `
const T=(()=>{try{return JSON.parse(sessionStorage.getItem('pc_ty')||'{}')}catch(e){return{}}})();
const kind=['cb','ct','sme'].includes(T.t)?T.t:(['cb','ct','sme'].includes(new URLSearchParams(location.search).get('t'))?new URLSearchParams(location.search).get('t'):'cb');
function paint(){ty_h.textContent=PC.t('ty.h.'+kind);
 [1,2,3].forEach(i=>document.getElementById('ty_'+i).textContent=PC.t('ty.'+kind+'.'+i));
 if(T.email){ty_mail.style.display='';ty_em.textContent=T.email}if(T.ref){ty_ref.style.display='';ty_refv.textContent=T.ref}document.title=PC.t('ty.title')+' | PulseCover'}
PC.ready.then(paint);window.addEventListener('pc:lang',paint);`];
};
