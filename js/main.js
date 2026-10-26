import * as St from './store.js';
const $ = (s, r = document) => r.querySelector(s);
const view = $('#view');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let cleanup = [];
function disposeAll() { cleanup.forEach(f => { try { f(); } catch {} }); cleanup = []; }
function toast(msg) { let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.append(t); } t.textContent = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 2600); }
async function companion(canvas, opts) { const m = await import('./character.js'); const c = m.createCompanion(canvas, opts); cleanup.push(() => c.dispose()); return c; }

St.load();
const P = new Proxy({}, { get: (_, k) => St.get().prefs[k], set: (_, k, v) => (St.get().prefs[k] = v, true) }); document.body.classList.toggle('night', P.night); document.body.classList.toggle('big', P.big);

/* ---------------- landing ---------------- */
function home() {
  view.innerHTML = `
  <div class="wrap">
    <section class="hero">
      <div>
        <span class="pill">لأسر أطفال الربو في البحرين والخليج</span>
        <h1>كل العائلة على <em>نَفَس</em> واحد</h1>
        <p class="lead">نَفَس يساعدك تنظم وتسجل وتشارك رعاية طفلك مع طبيبه. تذكير بالجرعة في وقتها، وسجل الفنتولين بضغطة، وخطة الطوارئ اللي كتبها الطبيب جاهزة حتى بدون إنترنت.</p>
        <div class="cta"><a class="btn" href="#/app">جرّب تطبيق الأسرة</a><a class="btn ghost" href="#/doctor">أنا طبيب</a></div>
        <div class="trust"><span>الطبيب يكتب والتطبيق يعرض</span><span>يشتغل بدون إنترنت</span><span>حتى 5 من العائلة</span></div>
      </div>
      <div class="stage"><canvas id="hero3d" aria-label="سلمان، رفيق الطفل"></canvas><div class="bubble">هلا! أنا سلمان 👋 أتنفس معاك على مهل</div></div>
    </section>
  </div>
  <section class="blk"><div class="wrap">
    <h2>اللي تحتاجه الساعة 3 الفجر، بضغطتين</h2>
    <p class="muted">صممناه لأم متعبة تبي تسجل وترجع تنام، ولجدة تبي أزرار كبيرة وكلام واضح.</p>
    <div class="grid3" style="margin-top:18px">
      ${[['⏰', 'تذكير تفاعلي', 'إشعار في موعد الطبيب بثلاثة أزرار: أُعطي، تأجيل، فات. واللي يأكد أول، يوصل للباقين.'], ['💨', 'سجل الفنتولين', 'زر واحد: عدد البخات والوقت. وعداد العبوة ينقص تلقائياً من سعة البخاخ.'], ['🚑', 'وضع الطوارئ', 'خطة الطبيب خطوة بخطوة وزر 999، يفتح خلال ثانية حتى لو الاشتراك منتهي.'], ['👨‍👩‍👧', 'العائلة كلها', 'الأم والأب والجدة والمربية، كل واحد يشوف "أُعطيت 8:05 بواسطة الأم" فما تتكرر الجرعة.'], ['🩺', 'تقرير للطبيب', 'صفحة وحدة قبل الزيارة: الجرعات المؤكدة والفائتة، والفنتولين، ونسبة اكتمال التسجيل.'], ['🫁', 'تعلّم بالـ 3D', 'طريقة البخاخ والقمع خطوة بخطوة، وسلمان يتنفس مع طفلك أثناء القمع.']]
        .map(([i, h, p]) => `<div class="card feat"><div class="ic">${i}</div><h3>${h}</h3><p>${p}</p></div>`).join('')}
    </div>
  </div></section>
  <section class="blk" style="background:var(--card);border-block:1px solid var(--line)"><div class="wrap">
    <h2>كيف يشتغل</h2>
    <div class="steps" style="margin-top:16px">
      <div class="card"><b>الطبيب يدعوك</b><p class="muted">من بوابته يطلع لك رمز QR أو رمز من 6 أرقام.</p></div>
      <div class="card"><b>تدخل برقم جوالك</b><p class="muted">رمز تحقق OTP، بدون كلمات مرور.</p></div>
      <div class="card"><b>الطبيب يأكد</b><p class="muted">يتأكد إن الملف يخص مريضه، ويوصلك الدواء والخطة.</p></div>
      <div class="card"><b>العائلة تنضم</b><p class="muted">تدعو حتى 4 أشخاص، وكلهم يشوفون نفس الشي.</p></div>
    </div>
  </div></section>
  <section class="blk"><div class="wrap grid2" style="align-items:center">
    <div>
      <h2>واضح من أول يوم</h2>
      <p class="rule"><b>نَفَس ما يحسب ولا يقرر ولا يفسّر.</b> الأدوية والجرعات والخطة يكتبها طبيبك، والتطبيق يعرضها حرفياً. ما يقترح جرعة، وما يغيّر لون الخطة بروحه، وما يقول لك "هذا كثير".</p>
      <p class="muted">بياناتكم مستضافة داخل البحرين، بأقل قدر ممكن، وبصلاحيات حسب الدور. والإشعار على شاشة القفل ما فيه اسم الطفل ولا الدواء.</p>
    </div>
    <div class="card" style="text-align:center">
      <span class="pill">بعد شهر تجربة مجاني</span>
      <div class="price" style="justify-content:center;margin-top:10px">5 <small>د.ب / شهرياً</small></div>
      <p class="muted">لمريض واحد وحتى 5 من العائلة. الطبيب يستخدم البوابة مجاناً.<br>وخطة الطوارئ وزر 999 يبقون شغالين دائماً، حتى لو انتهى الاشتراك.</p>
      <a class="btn" href="#/app">شوف التطبيق</a>
    </div>
  </div></section>
  <section class="blk" style="padding-top:0"><div class="wrap">
    <h2>أسئلة</h2>
    <details><summary>هل التطبيق يعطيني الجرعة؟</summary><p>لا. الجرعة يكتبها طبيبك في بوابته، والتطبيق يعرضها مثل ما كتبها بالضبط ويذكرك بموعدها.</p></details>
    <details><summary>إذا انقطع الإنترنت؟</summary><p>التذكيرات وخطة الطوارئ محفوظة على جهازك وتشتغل بدون شبكة، والتسجيل يتزامن أول ما يرجع الاتصال.</p></details>
    <details><summary>الحضانة تقدر تسجل؟</summary><p>إيه، برابط مؤقت تسويه أنت: تشوف خطة الطوارئ وزر الفنتولين بس، وتسجيلها يوصلك إشعار فوراً.</p></details>
    <details><summary>وين تنحفظ بياناتنا؟</summary><p>داخل البحرين، ومشفرة. ولكم حق تصدّرونها أو تحذفونها في أي وقت، وتشوفون مين اطلع عليها ومتى.</p></details>
  </div></section>`;
  companion($('#hero3d'));
}

/* ---------------- family app ---------------- */
let tab = 'home';
function famShell() {
  view.innerHTML = `<div class="wrap appwrap">
    <div class="phone"><div class="scr" id="scr"></div>
      <div class="tabs">${[['home', '🏠', 'الرئيسية'], ['log', '🗓️', 'السجل'], ['plan', '📋', 'الخطة'], ['meds', '💊', 'الأدوية'], ['family', '👨‍👩‍👧', 'العائلة'], ['kid', '⭐', 'الطفل']]
        .map(([k, i, l]) => `<button data-t="${k}" class="${tab === k ? 'on' : ''}"><i>${i}</i>${l}</button>`).join('')}</div></div>
    <aside class="side">
      <span class="pill">عرض تفاعلي</span>
      <h2>تطبيق الأسرة</h2>
      <p class="muted">جرّب بنفسك: أكّد جرعة، سجّل فنتولين، افتح الطوارئ، أو خلّ سلمان يتنفس مع طفلك. وإذا عدّلت الخطة من بوابة الطبيب، بتشوفها هني مباشرة.</p>
      <ul><li>أي تسجيل يحمل وقته ومن سجّله ومصدره.</li><li>ما في أي تقييم أو تفسير للأرقام.</li><li>الأحمر محجوز للطوارئ بس.</li></ul>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn ghost" id="tNight">${P.night ? '☀️ الوضع النهاري' : '🌙 الوضع الليلي'}</button>
        <button class="btn ghost" id="tBig">${P.big ? 'الخط العادي' : '👵 وضع الأجداد'}</button>
        <button class="btn ghost" id="tReset">إعادة البيانات</button>
      </div>
    </aside></div>`;
  view.querySelectorAll('.tabs button').forEach(b => b.onclick = () => { tab = b.dataset.t; famShell(); });
  $('#tNight').onclick = () => { P.night = !P.night; St.save(); document.body.classList.toggle('night', P.night); famShell(); };
  $('#tBig').onclick = () => { P.big = !P.big; St.save(); document.body.classList.toggle('big', P.big); famShell(); };
  $('#tReset').onclick = () => { St.reset(); toast('رجعت البيانات التجريبية'); famShell(); };
  disposeAll();
  ({ home: fHome, log: fLog, plan: fPlan, meds: fMeds, family: fFamily, kid: fKid })[tab]($('#scr'));
}
const sosBar = () => `<div class="sos"><button class="btn red" data-emer>🚑 طوارئ</button><a class="btn red" style="flex:.5" href="tel:999">📞 999</a></div>`;
function bindSos(r) { r.querySelectorAll('[data-emer]').forEach(b => b.onclick = emergency); }

function fHome(r) {
  const s = St.get(), last = t => s.events.find(e => e.type === t);
  const ld = last('dose'), lr = last('rescue'), nd = St.nextDose(), pre = s.meds[0];
  r.innerHTML = `
    <div class="ahead"><div><div class="who">صباح الخير، ${esc(St.who(s.me))}</div><div class="sync">آخر مزامنة: الحين · ملف ${esc(s.patient.name)}</div></div><img src="assets/logo.svg" width="36" alt=""></div>
    ${sosBar()}
    <div class="tile"><div><b>آخر وقائي</b><span class="sub">${ld ? `${St.fmtDay(ld.at)} ${St.fmtTime(ld.at)} · بواسطة ${esc(St.who(ld.by))}` : 'ما في تسجيل'}</span></div><span>💊</span></div>
    <div class="tile"><div><b>آخر فنتولين</b><span class="sub">${lr ? `${St.ago(lr.at)} · ${lr.puffs} ${lr.puffs === 1 ? 'بخة' : 'بخات'} · بواسطة ${esc(St.who(lr.by))}` : 'ما في تسجيل'}</span></div><span>💨</span></div>
    <div class="tile"><div><b>الموعد الجاي</b><span class="sub">${esc(pre.name)} — ${St.fmtDay(nd)} ${St.fmtTime(nd)}<br>${esc(pre.dose)} (كما كتبها الطبيب)</span></div><span>⏰</span></div>
    <div class="big2"><button class="b-dose" id="bDose">✓ أُعطي الوقائي</button><button class="b-res" id="bRes">💨 سجّل فنتولين</button></div>
    <div class="tile" style="background:var(--amberbg);border-color:transparent"><div><b>🌫️ الغبار مرتفع اليوم في البحرين</b><span class="sub">مثال على تنبيه عام من مصدر رسمي، يوصل لكل المستخدمين ومو مرتبط بحالة طفلك.</span></div></div>
    <div class="tile"><div><b>هذا الأسبوع</b><span class="sub">${St.weekCount('rescue')} بخات فنتولين مسجلة · ${s.events.filter(e => e.type === 'dose' && Date.now() - e.at < 6048e5).length} جرعات وقائي مؤكدة</span></div></div>
    <div class="tile"><div><b>سؤال الصباح</b><span class="sub">صحى بالليل من الكحة؟</span></div><div class="chips" style="margin:0"><button data-n="1">إيه</button><button data-n="0">لا</button></div></div>`;
  bindSos(r);
  $('#bDose').onclick = () => { St.add({ type: 'dose', med: 'pre', status: 'أُعطي' }); toast(`سُجّلت الجرعة ${St.fmtTime(Date.now())} · وصل التحديث لكل العائلة`); fHome(r); };
  $('#bRes').onclick = rescueSheet;
  r.querySelectorAll('[data-n]').forEach(b => b.onclick = () => { St.add({ type: 'check', night: b.dataset.n === '1', activity: false }); toast('انحفظ جوابك'); fHome(r); });
}

function rescueSheet() {
  const sh = document.createElement('div'); sh.className = 'sheet';
  let n = 2, why = '';
  sh.innerHTML = `<div class="in"><h3>سجّل فنتولين</h3><p class="muted">كم بخة؟ التطبيق يسجل بس، ما يقيّم.</p>
    <div class="chips" id="np">${[1, 2, 3, 4, 5, 6].map(k => `<button data-k="${k}" class="${k === 2 ? 'on' : ''}">${k}</button>`).join('')}</div>
    <label>السبب (اختياري)</label><div class="chips" id="wy">${['كحة', 'صفير', 'ضيق', 'قبل الرياضة', 'غبار', 'زكام'].map(w => `<button>${w}</button>`).join('')}</div>
    <div style="display:flex;gap:10px;margin-top:16px"><button class="btn" style="flex:1" id="ok">سجّل</button><button class="btn ghost" id="cn">إلغاء</button></div></div>`;
  document.body.append(sh);
  sh.onclick = e => { if (e.target === sh) sh.remove(); };
  sh.querySelectorAll('#np button').forEach(b => b.onclick = () => { n = +b.dataset.k; sh.querySelectorAll('#np button').forEach(x => x.classList.toggle('on', x === b)); });
  sh.querySelectorAll('#wy button').forEach(b => b.onclick = () => { why = b.classList.toggle('on') ? b.textContent : ''; sh.querySelectorAll('#wy button').forEach(x => x !== b && x.classList.remove('on')); });
  $('#cn', sh).onclick = () => sh.remove();
  $('#ok', sh).onclick = () => { const s = St.get(); s.meds[1].used += n; St.add({ type: 'rescue', puffs: n, reason: why }); sh.remove(); toast(`سُجّل ${n} ${n === 1 ? 'بخة' : 'بخات'} الساعة ${St.fmtTime(Date.now())}`); if (tab === 'home' || tab === 'log') famShell(); };
}

function emergency() {
  const s = St.get(), e = s.emergency;
  const d = document.createElement('div'); d.className = 'emer';
  d.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:22px">خطة الطوارئ — ${esc(s.patient.name)}</b><button class="btn ghost" id="x">إغلاق</button></div>
    <a class="call" href="tel:999">📞 اتصل 999</a>
    <ol>${e.steps.map(x => `<li>${esc(x)}</li>`).join('')}</ol>
    <p style="font-size:15px;opacity:.75">كتبها ${esc(e.by)} · الإصدار ${e.version} · ${St.fmtDay(e.at)}. محفوظة على الجهاز وتشتغل بدون إنترنت.</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px">${e.contacts.map(c => `<a class="btn ghost" href="tel:${c.p.replace(/\s/g, '')}">${esc(c.n)} · ${esc(c.p)}</a>`).join('')}
    <button class="btn ghost" id="qr">📱 QR لطبيب الطوارئ</button><button class="btn ghost" id="say">🔊 اقرأ الخطوات</button></div>
    <div id="qrbox"></div>
    <p style="font-size:14px;opacity:.7;margin-top:18px">في الحالات الطارئة اتصل بـ 999.</p>`;
  document.body.append(d);
  $('#x', d).onclick = () => { speechSynthesis.cancel(); d.remove(); };
  $('#say', d).onclick = () => { const u = new SpeechSynthesisUtterance(e.steps.join('. ')); u.lang = 'ar-SA'; u.rate = .9; speechSynthesis.cancel(); speechSynthesis.speak(u); };
  $('#qr', d).onclick = () => { $('#qrbox', d).innerHTML = `<div class="card" style="margin-top:14px;color:var(--ink)"><b>رابط مؤقت لطبيب الطوارئ</b><p class="muted">صالح 24 ساعة، يعرض آخر 48 ساعة كما سُجّلت، للقراءة فقط. كل فتح ينسجل ويوصلكم إشعار. (في النسخة الحقيقية يطلع هني رمز QR.)</p></div>`; };
}

function evRow(e) {
  const ic = { dose: '💊', rescue: '💨', symptom: '😮‍💨', check: '🌙' }[e.type];
  const txt = e.type === 'dose' ? `الوقائي — ${e.status}` : e.type === 'rescue' ? `فنتولين ${e.puffs} ${e.puffs === 1 ? 'بخة' : 'بخات'}${e.reason ? ' · ' + esc(e.reason) : ''}` :
    e.type === 'symptom' ? `${esc(e.kind)} · ${e.minutes} دقيقة · الشدة كما اختارتها الأسرة: ${esc(e.severity)}${e.tags ? ' · ' + e.tags.join('، ') : ''}` : `سؤال الصباح: ${e.night ? 'صحى بالليل' : 'ما صحى بالليل'}`;
  return `<div class="ev"><div class="dot">${ic}</div><div><b>${txt}</b><div class="meta">${St.fmtDay(e.at)} ${St.fmtTime(e.at)} · ${esc(St.who(e.by))} · ${esc(e.mode)}</div></div></div>`;
}
function fLog(r) {
  const s = St.get();
  r.innerHTML = `${sosBar()}<h3>السجل</h3><p class="muted" style="margin-top:-6px">كل شي كما سُجّل، مع وقته ومن سجّله.</p>
    <div class="big2"><button class="b-res" id="bRes">💨 فنتولين</button><button class="b-dose" id="bCough">😮‍💨 بدأت كحة</button></div>
    <div class="card" style="padding:8px 16px">${s.events.slice().sort((a, b) => b.at - a.at).map(evRow).join('')}</div>`;
  bindSos(r); $('#bRes').onclick = rescueSheet;
  $('#bCough').onclick = () => { St.add({ type: 'symptom', kind: 'كحة', severity: 'خفيفة', minutes: 5, tags: [] }); toast('انسجلت بداية الكحة'); fLog(r); };
}
function fPlan(r) {
  const p = St.get().plan;
  r.innerHTML = `${sosBar()}<h3>خطة الربو</h3><p class="muted" style="margin-top:-6px">كتبها ${esc(p.by)} · الإصدار ${p.version} · ${St.fmtDay(p.at)}<br>تُعرض حرفياً كما كتبها الطبيب. التطبيق ما يحدد أي منطقة أنتم فيها.</p>
    <div class="zone z-g"><h4>🟢 الأخضر</h4>${esc(p.green)}</div>
    <div class="zone z-y"><h4>🟡 الأصفر</h4>${esc(p.yellow)}</div>
    <div class="zone z-r"><h4>🔴 الأحمر</h4>${esc(p.red)}</div>
    <h3 style="margin-top:18px">رسائل الطبيب</h3>${St.get().notes.map(n => `<div class="tile"><div><b>${esc(n.by)}</b><span class="sub">${esc(n.text)}<br>${St.fmtDay(n.at)}</span></div></div>`).join('')}`;
  bindSos(r);
}
function fMeds(r) {
  const s = St.get();
  r.innerHTML = `${sosBar()}<h3>الأدوية والعبوات</h3>${s.meds.map(m => {
    const left = m.capacity - m.used;
    return `<div class="card" style="margin-bottom:12px"><span class="pill">${m.role}</span><h3 style="margin-top:8px;font-size:18px">${esc(m.name)}</h3>
      <div class="muted">${esc(m.dose)}${m.times.length ? ' · ' + m.times.join(' و ') : ''}</div>
      <div class="meter"><i style="width:${(left / m.capacity * 100).toFixed(0)}%"></i></div>
      <div class="muted" style="font-size:14px">باقي ${left} من ${m.capacity} بخة حسب التسجيل (طرح من سعة النشرة، مو قياس للعبوة) · انفتحت ${St.fmtDay(m.opened)} · الصلاحية بعد الفتح ${esc(m.expiryNote)}</div>
      <button class="btn ghost" style="margin-top:10px" data-refill>طلب إعادة صرف</button></div>`;
  }).join('')}<p class="muted" style="font-size:13px">التطبيق ما يحسب جرعة ولا يقترحها. الوزن للعرض فقط: ${esc(s.patient.weight)}.</p>`;
  bindSos(r); r.querySelectorAll('[data-refill]').forEach(b => b.onclick = () => toast('انرسل طلب إعادة الصرف للعيادة (عمل إداري)'));
}
function fFamily(r) {
  const s = St.get();
  r.innerHTML = `${sosBar()}<h3>العائلة (${s.family.length} من 5)</h3>
    ${s.family.map(f => `<div class="tile"><div><b>${esc(f.name)}</b><span class="sub">${esc(f.role)} · ${f.devices} ${f.devices === 1 ? 'جهاز' : 'جهازين'}</span></div>${f.id === s.me ? '<span class="pill">أنت</span>' : ''}</div>`).join('')}
    <button class="btn" style="width:100%;margin:6px 0 16px" id="inv">+ دعوة برقم الجوال</button>
    <h3>روابط مؤقتة</h3>
    <div class="tile"><div><b>🏫 حضانة الياسمين</b><span class="sub">خطة الطوارئ + زر الفنتولين بس · ينتهي آخر الفصل</span></div><button class="pill" id="nur">جرّب</button></div>
    <div class="tile"><div><b>🩺 الطبيب</b><span class="sub">${esc(s.patient.doctor)}</span></div></div>
    <div class="tile"><div><b>👁️ سجل الوصول</b><span class="sub">مين اطلع على ملف ${esc(s.patient.name)} ومتى</span></div></div>`;
  bindSos(r);
  $('#inv').onclick = () => {
    if (s.family.length >= 5) return toast('وصلتوا الحد: 5 أشخاص لكل مريض');
    const nm = ['المربية ماريا', 'العمة فاطمة'][s.family.length - 3] || 'فرد جديد';
    s.family.push({ id: 'u' + Date.now(), name: nm, role: 'مقدم رعاية', phone: '', devices: 1 }); St.save(); toast(`انرسلت الدعوة لـ ${nm}`); fFamily(r);
  };
  $('#nur').onclick = () => { s.events.unshift({ type: 'rescue', at: Date.now(), by: 'nursery', mode: 'من الحضانة', puffs: 2, reason: 'كحة في الحصة' }); St.save(); toast('📩 إشعار: الحضانة سجلت 2 بخة الحين'); };
}
function fKid(r) {
  const s = St.get(); let on = false, count = 0, c;
  r.innerHTML = `<h3>سلمان يتنفس معاك</h3><p class="muted" style="margin-top:-6px">وقت القمع: قلّد سلمان. شهيق على مهل… وزفير على مهل.</p>
    <div class="companion"><canvas id="kid3d"></canvas><div class="bcount" id="bc">اضغط ابدأ</div></div>
    <div style="display:flex;gap:10px;margin:12px 0"><button class="btn green" style="flex:1" id="go">▶️ ابدأ</button><button class="btn ghost" id="wv">👋 سلّم</button></div>
    <p class="muted" style="font-size:13px">سلمان يعدّ الأنفاس عشان يساعد الطفل، وما يقيس التنفس فعلياً.</p>
    <h3>أختامي</h3><p class="muted" style="margin-top:-6px">ختم لكل يوم تسجيل.</p><div class="stamps">${Array.from({ length: 14 }, (_, i) => `<span>${i < s.stamps ? '⭐' : '·'}</span>`).join('')}</div>`;
  companion($('#kid3d'), { onPhase: ph => { if (!on) return; if (ph === 'in') count++; $('#bc').textContent = ph === 'in' ? `شهيق… ${count}` : `زفير… ${count}`; if (count > 10) { on = false; c.setBreath(false); $('#bc').textContent = 'أحسنت! خلصنا 10 أنفاس ⭐'; $('#go').textContent = '▶️ مرة ثانية'; } } }).then(x => c = x);
  $('#go').onclick = () => { if (!c) return; on = !on; count = 0; c.setBreath(on); $('#go').textContent = on ? '⏸️ وقف' : '▶️ ابدأ'; $('#bc').textContent = on ? 'استعد…' : 'اضغط ابدأ'; };
  $('#wv').onclick = () => c && c.wave();
}

/* ---------------- doctor portal ---------------- */
let dsel = 0, dtab = 'over';
function doctor() {
  disposeAll();
  const s = St.get(), p = s.plan, pt = s.doctorPatients[dsel];
  const mine = pt.me;
  view.innerHTML = `<div class="wrap doc">
    <aside class="card"><h3>مرضاي</h3><p class="muted" style="font-size:13px;margin-top:-6px">مرتبين بالاسم. البوابة ما تصنّف المرضى ولا ترتبهم حسب "الخطورة".</p>
      <div class="plist">${s.doctorPatients.map((x, i) => ({ x, i })).sort((a, b) => a.x.name.localeCompare(b.x.name, 'ar')).map(({ x, i }) => `<button data-i="${i}" class="${i === dsel ? 'on' : ''}"><span><b>${x.name}</b><br><span class="muted" style="font-size:13px">${x.age} سنوات · آخر تحديث ${St.ago(x.last)}</span></span><span class="muted" style="font-size:13px">${x.rescueWeek} فنتولين<br>هذا الأسبوع</span></button>`).join('')}</div>
      <button class="btn ghost" style="width:100%;margin-top:12px" id="invite">+ دعوة مريض جديد</button></aside>
    <section class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px"><div><h2 style="margin:0">${pt.name}</h2><span class="muted">${pt.age} سنوات${mine ? ' · ' + esc(s.patient.allergy) : ''}</span></div>
        <div class="chips" style="margin:0">${[['over', 'نظرة عامة'], ['plan', 'خطة الربو'], ['emer', 'خطة الطوارئ'], ['rx', 'الأدوية']].map(([k, l]) => `<button data-d="${k}" class="${dtab === k ? 'on' : ''}">${l}</button>`).join('')}</div></div>
      <div id="dbody" style="margin-top:16px"></div>
    </section></div>`;
  view.querySelectorAll('.plist button').forEach(b => b.onclick = () => { dsel = +b.dataset.i; doctor(); });
  view.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { dtab = b.dataset.d; doctor(); });
  $('#invite').onclick = () => { const code = String(Math.floor(100000 + Math.random() * 9e5)); toast(`رمز الدعوة: ${code} · صالح 72 ساعة`); };
  const B = $('#dbody');
  if (!mine) { B.innerHTML = `<p class="muted">هذا ملف تجريبي مختصر. افتح ملف <b>سلمان</b> عشان تجرب كتابة الخطة وتشوفها توصل لتطبيق الأسرة.</p>`; return; }
  if (dtab === 'over') {
    const wk = (a, b) => s.events.filter(e => e.type === 'rescue' && Date.now() - e.at >= a * 864e5 && Date.now() - e.at < b * 864e5).reduce((x, e) => x + e.puffs, 0);
    const days = new Set(s.events.filter(e => Date.now() - e.at < 7 * 864e5).map(e => new Date(e.at).toDateString())).size;
    const col = { dose: 'var(--green)', rescue: 'var(--blue)', symptom: 'var(--amber)', check: 'var(--muted)' };
    B.innerHTML = `<h3>مقارنة فترتين</h3><div class="cmp"><div><span class="muted">آخر 7 أيام</span><b>${wk(0, 7)}</b>بخة فنتولين</div><div><span class="muted">الـ 7 أيام قبلها</span><b>${wk(7, 14)}</b>بخة فنتولين</div></div>
      <p class="muted" style="font-size:13px">أرقام كما سُجّلت، بدون وصف "تحسن" أو "تدهور". اكتمال التسجيل: ${days} من 7 أيام.</p>
      <h3>الخط الزمني (آخر 7 أيام)</h3><div class="tl">${s.events.filter(e => Date.now() - e.at < 7 * 864e5).map(e => `<i title="${e.type}" style="right:${(Date.now() - e.at) / (7 * 864e5) * 96 + 2}%;background:${col[e.type]};bottom:${{ dose: 14, rescue: 44, symptom: 74, check: 100 }[e.type]}px"></i>`).join('')}</div>
      <p class="muted" style="font-size:13px">🟢 جرعات وقائي · 🔵 فنتولين · 🟠 أعراض · ⚪ سؤال الصباح</p>
      <h3>رسالة للأسرة</h3><textarea id="note" placeholder="ليست استشارة فورية، ومكتوب ذلك للأسرة بوضوح"></textarea><button class="btn" style="margin-top:8px" id="sendn">أرسل</button>
      <button class="btn ghost" style="margin-top:8px" onclick="window.print()">🖨️ تقرير PDF صفحة وحدة</button>`;
    $('#sendn').onclick = () => { const t = $('#note').value.trim(); if (!t) return; s.notes.unshift({ by: 'د. ريم الصفار', at: Date.now(), text: t }); St.save(); toast('وصلت الرسالة للأسرة'); doctor(); };
  }
  if (dtab === 'plan') {
    B.innerHTML = `<p class="muted">اكتب نص كل منطقة بكلماتك. التطبيق يعرضه حرفياً، وما ينقل المريض بين المناطق آلياً. الإصدار الحالي ${p.version}.</p>
      <label>🟢 الأخضر</label><textarea id="zg">${esc(p.green)}</textarea>
      <label>🟡 الأصفر</label><textarea id="zy">${esc(p.yellow)}</textarea>
      <label>🔴 الأحمر</label><textarea id="zr">${esc(p.red)}</textarea>
      <button class="btn" style="margin-top:12px" id="sv">احفظ إصدار جديد وأرسله للأسرة</button>
      <h3 style="margin-top:20px">سجل الإصدارات</h3>${[{ version: p.version, at: p.at, by: p.by }, ...s.versions].map(v => `<div class="muted">الإصدار ${v.version} · ${St.fmtDay(v.at)} · ${esc(v.by)}</div>`).join('')}`;
    $('#sv').onclick = () => { s.versions.unshift({ version: p.version, at: p.at, by: p.by }); Object.assign(p, { green: $('#zg').value, yellow: $('#zy').value, red: $('#zr').value, version: p.version + 1, at: Date.now() }); St.save(); toast(`انحفظ الإصدار ${p.version} · الأسرة بتستلم إشعار "الخطة تغيرت"`); doctor(); };
  }
  if (dtab === 'emer') {
    const e = s.emergency;
    B.innerHTML = `<p class="muted">خطوات الطوارئ الخاصة بالمريض، بالترتيب. ما في قالب جرعات جاهز. تنحفظ على جهاز الأسرة وتشتغل بدون إنترنت.</p>
      <label>الخطوات (سطر لكل خطوة)</label><textarea id="es" style="min-height:180px">${esc(e.steps.join('\n'))}</textarea>
      <button class="btn" style="margin-top:12px" id="sve">احفظ وأرسل</button>`;
    $('#sve').onclick = () => { e.steps = $('#es').value.split('\n').map(x => x.trim()).filter(Boolean); e.version++; e.at = Date.now(); St.save(); toast(`انحفظت خطة الطوارئ (الإصدار ${e.version})`); };
  }
  if (dtab === 'rx') {
    B.innerHTML = s.meds.map((m, i) => `<div class="card" style="margin-bottom:10px;box-shadow:none"><span class="pill">${m.role}</span>
      <label>المنتج (من مكتبة البخاخات المسجلة)</label><input value="${esc(m.name)}" data-f="name" data-i="${i}">
      <label>الجرعة كما تكتبها</label><input value="${esc(m.dose)}" data-f="dose" data-i="${i}">
      <label>المواعيد</label><input value="${m.times.join('، ')}" data-f="times" data-i="${i}" placeholder="مثال: 08:00، 20:00"></div>`).join('') +
      `<p class="muted" style="font-size:13px">البوابة ما تقترح جرعة ولا تحسبها من الوزن.</p><button class="btn" id="svr">احفظ الوصفة</button>`;
    $('#svr').onclick = () => { B.querySelectorAll('input').forEach(inp => { const m = s.meds[inp.dataset.i]; m[inp.dataset.f] = inp.dataset.f === 'times' ? inp.value.split(/[،,]/).map(x => x.trim()).filter(Boolean) : inp.value; }); St.save(); toast('انحفظت الوصفة كإصدار جديد'); };
  }
}

/* ---------------- learn ---------------- */
async function learn() {
  const steps = [['جهّز البخاخ والقمع', 'شيل غطاء البخاخ وتأكد إن القمع نظيف وناشف.'], ['رجّ البخاخ', 'رجّه زين كم ثانية قبل كل بخة.'], ['ركّبه في القمع', 'دخّل فم البخاخ في طرف القمع، والقناع على الطرف الثاني.'], ['بخة وحدة، وتنفس مع سلمان', 'حط القناع على الوجه بإحكام، اضغط بخة وحدة، وخلّ الطفل يتنفس على مهل حسب ما علّمك الطبيب.']];
  view.innerHTML = `<div class="wrap learn">
    <div class="viewer"><canvas id="inh3d" aria-label="نموذج ثلاثي الأبعاد للبخاخ والقمع"></canvas></div>
    <div><span class="pill">تعليم عام</span><h2>البخاخ مع القمع</h2><p class="muted">حرّك النموذج بإصبعك. اضغط على أي خطوة تشوفها.</p>
      ${steps.map((x, i) => `<button class="lstep" data-s="${i}"><b class="n">${i + 1}</b><span><b>${x[0]}</b><br><span class="muted">${x[1]}</span></span></button>`).join('')}
      <p class="muted" style="font-size:13px">محتوى عام مبني على إرشادات GINA، يراجعه أخصائي تنفس. نماذج عامة بدون علامات تجارية، وما ترتبط ببيانات طفلك. اتبع تعليمات طبيبك دائماً.</p>
      <a class="btn green" href="#/app" id="tokid">⭐ تنفس مع سلمان</a></div></div>`;
  $('#tokid').onclick = () => { tab = 'kid'; };
  const m = await import('./inhaler3d.js'); const I = m.createInhaler($('#inh3d')); cleanup.push(() => I.dispose());
  view.querySelectorAll('.lstep').forEach(b => b.onclick = () => { view.querySelectorAll('.lstep').forEach(x => x.classList.toggle('on', x === b)); I.step(+b.dataset.s); });
}

/* ---------------- router ---------------- */
function route() {
  disposeAll(); window.scrollTo(0, 0);
  const r = (location.hash.replace('#/', '') || 'home').split('?')[0];
  document.querySelectorAll('nav a').forEach(a => a.classList.toggle('on', a.dataset.r === r));
  ({ home, app: famShell, doctor, learn }[r] || home)();
}
window.addEventListener('hashchange', route);
window.addEventListener('storage', () => { St.load(); if (location.hash.startsWith('#/app')) famShell(); });
route();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
