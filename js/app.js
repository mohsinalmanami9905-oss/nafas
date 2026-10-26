import * as St from './store.js';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const app = $('#app');
St.load();
const S = () => St.get();

/* ---------------- icons ---------------- */
const P = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h5v-6h4v6h5V9.5"/>',
  log: '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  plan: '<path d="M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1Z"/><rect x="5" y="5" width="14" height="16" rx="3"/><path d="m9 13 2 2 4-4"/>',
  salman: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  sos: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><circle cx="12" cy="12" r="4"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"/>',
  pill: '<rect x="3" y="8" width="18" height="8" rx="4"/><path d="M12 8v8"/>',
  puff: '<path d="M9 3h4v5H9z"/><path d="M7 8h8v9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V8Z"/><path d="M15 13h3a2 2 0 0 1 0 4h-3"/>',
  cough: '<path d="M4 12c2-4 6-4 8 0s6 4 8 0"/><path d="M4 17c2-3 6-3 8 0"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/>',
  back: '<path d="m9 6 6 6-6 6"/>',
  chev: '<path d="m9 6 6 6-6 6"/>',
  check: '<path d="m5 12 5 5 9-10"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  share: '<path d="M12 3v12"/><path d="m7 8 5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>',
  family: '<circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2 20c.8-3.5 3.2-5 6-5s5.2 1.5 6 5"/><path d="M14 15.5c2.6-.6 5.4.6 6.5 4.5"/>',
  doc: '<path d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  text: '<path d="M4 7V5h16v2M12 5v14M8 19h8"/>',
  speaker: '<path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m13 7 4 4"/>',
  stethoscope: '<path d="M6 3v6a4 4 0 0 0 8 0V3"/><path d="M10 13v3a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="12" r="2"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z"/>',
  play: '<path d="M7 4v16l13-8L7 4Z"/>',
  pause: '<path d="M7 4h4v16H7zM13 4h4v16h-4z"/>',
};
const ic = (n, sw = 1.9) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${P[n]}</svg>`;

/* ---------------- Salman: one real-time 3D character (js/salman3d.js) shared across screens ---------------- */
const S3 = import('./salman3d.js').catch(() => null);
const probing = Promise.resolve();
document.addEventListener('visibilitychange', () => { if (document.hidden && voiceEl) voiceEl.pause(); });
function salman(kind = 'idle', frame = 'full') {
  // the still is the instant fallback; the 3D view takes over the largest visible host once loaded
  return `<div class="sal" data-s3d data-kind="${kind}" data-frame="${frame}"><img class="sv still" src="assets/salman.jpg" alt="سلمان"></div>`;
}
const s3 = (fn) => S3.then(m => m && fn(m)).catch(() => {});
/* Salman's recorded voice; while it plays he switches to the talking motion, then eases back */
const GENDERED = new Set(['hello_morning', 'hello_evening', 'dose_done', 'follow', 'in', 'out', 'breathe_done', 'stamp', 'emergency']);
let voiceEl;
function setTalking(on) { $$('.sal').forEach(w => w.classList.toggle('talking', on)); }
function say(id) {
  if (!S().prefs.voice) return;
  try {
    voiceEl && (voiceEl.onended = null, voiceEl.pause());
    if (GENDERED.has(id)) id += S().child.gender === 'f' ? '_f' : '_m';
    voiceEl = new Audio(`assets/voice/${id}.mp3`);
    const el = voiceEl, vid = id; s3(m => m.speak(el, vid));
    voiceEl.onplay = () => setTalking(true); voiceEl.onended = voiceEl.onpause = () => setTalking(false);
    voiceEl.play().catch(() => setTalking(false));
  } catch {}
}
/* ---------------- feedback ---------------- */
let toastT;
function toast(msg, undo) {
  let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.append(t); }
  t.innerHTML = `<span>${esc(msg)}</span>${undo ? '<button>تراجع</button>' : ''}`;
  if (undo) t.querySelector('button').onclick = () => { undo(); t.classList.remove('on'); };
  t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), undo ? 5000 : 2600);
  navigator.vibrate && navigator.vibrate(12);
}
function sheet(html, onMount) {
  const sc = document.createElement('div'); sc.className = 'scrim';
  sc.innerHTML = `<div class="sheet" role="dialog"><div class="grab"></div>${html}</div>`;
  document.body.append(sc);
  const close = () => sc.remove();
  sc.addEventListener('click', e => { if (e.target === sc) close(); });
  onMount && onMount(sc.querySelector('.sheet'), close);
  return close;
}
function applyPrefs() { document.body.classList.toggle('night', !!S().prefs.night); document.body.classList.toggle('big', !!S().prefs.big); }
applyPrefs();

/* ---------------- router ---------------- */
const go = h => { location.hash = h; };
function route() {
  const [path, qs] = location.hash.replace(/^#\/?/, '').split('?');
  const q = new URLSearchParams(qs || '');
  window.scrollTo(0, 0); $$('.scrim').forEach(x => x.remove());
  const s = S();
  if (path === 'import' && q.get('d')) return importScreen(q.get('d'));
  if (!s.onboarded) {
    if (path === 'role') return roleScreen();
    if (path.startsWith('setup')) return setup(+(q.get('s') || 1));
    if (path === 'doctor-setup') return doctorSetup();
    return welcome(+(q.get('p') || 0));
  }
  if (s.role === 'doctor') {
    if (path === 'patient') return patientEditor(q.get('id'));
    if (path === 'settings') return settings();
    return doctorHome();
  }
  ({ log: logScreen, plan: planScreen, salman: salmanScreen, settings, family: familyScreen, report: reportScreen, edit: editPlan }[path] || homeScreen)(q);
}
window.addEventListener('hashchange', route);

function tabbar(active) {
  const T = [['home', 'الرئيسية'], ['log', 'السجل'], ['plan', 'الخطة'], ['salman', 'سلمان']];
  return `<nav class="tabbar">${T.map(([k, l]) => `<button data-go="${k}" class="${k === active ? 'on' : ''}" aria-label="${l}">${ic(k === 'salman' ? 'star' : k)}${l}</button>`).join('')}</nav>`;
}
function topbar(title, { back = false, sos = true, gear = false } = {}) {
  return `<div class="topbar">
    ${back ? `<button class="iconbtn" data-back aria-label="رجوع">${ic('back')}</button>` : gear ? `<button class="iconbtn" data-go="settings" aria-label="الإعدادات">${ic('gear')}</button>` : '<span style="width:42px"></span>'}
    <div class="t">${title}</div>
    ${sos ? `<button class="sos-pill" data-sos>${ic('phone', 2.2)}طوارئ</button>` : '<span style="width:42px"></span>'}
  </div>`;
}
function mount(html, after) {
  app.innerHTML = html;
  $$('[data-go]', app).forEach(b => b.onclick = () => go('/' + b.dataset.go));
  $$('[data-back]', app).forEach(b => b.onclick = () => history.length > 1 ? history.back() : go('/home'));
  $$('[data-sos]', app).forEach(b => b.onclick = emergency);
  after && after();
  if (app.querySelector('[data-s3d]')) s3(m => m.init());
}

/* ================= WELCOME ================= */
const SLIDES = [
  { t: 'هلا! أنا سلمان', p: 'أساعدك ترتب رعاية ربو طفلك: مواعيد البخاخ، وسجل الفنتولين، وخطة الطوارئ، كلها في مكان واحد.', kind: 'wave', v: 'welcome1' },
  { t: 'الطبيب يكتب، ونَفَس يعرض', p: 'الجرعات والخطة من طبيبكم بالحرف. التطبيق ما يحسب جرعة ولا يقرر بدال الطبيب.', kind: 'idle', v: 'welcome2' },
  { t: 'الطوارئ دايماً جاهزة', p: 'زر الطوارئ في كل شاشة، وخطة الطبيب تفتح حتى بدون إنترنت.', kind: 'proud', v: 'welcome3' },
];
async function welcome(p) {
  await probing;
  const s = SLIDES[p] || SLIDES[0];
  mount(`<div class="welcome">
    <div class="brand"><img src="assets/logo.svg" alt="">نَفَس</div>
    <div class="hero"><div class="pic">${salman(s.kind, 'full')}</div><h1>${s.t}</h1><p>${s.p}</p></div>
    <div class="dots">${SLIDES.map((_, i) => `<i class="${i === p ? 'on' : ''}"></i>`).join('')}</div>
    <button class="btn" id="next">${p < SLIDES.length - 1 ? 'التالي' : 'يلا نبدأ'}</button>
    ${p < SLIDES.length - 1 ? '<button class="btn ghost" id="skip" style="margin-top:10px;box-shadow:none;background:none">تخطّي</button>' : ''}
  </div>`, () => {
    $('#next').onclick = () => { if (p < SLIDES.length - 1) go('/?p=' + (p + 1)); else go('/role'); };
    $('#skip') && ($('#skip').onclick = () => go('/role'));
    let x0; const el = $('.welcome');
    el.addEventListener('touchstart', e => x0 = e.target.closest('.s3d-canvas') ? null : e.touches[0].clientX, { passive: true });
    el.addEventListener('touchend', e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (dx < -50 && p > 0) go('/?p=' + (p - 1)); if (dx > 50 && p < SLIDES.length - 1) go('/?p=' + (p + 1)); });
    say(s.v); if (s.kind === 'proud') s3(m => m.proud());
  });
}
function roleScreen() {
  mount(`<div class="screen plain">${topbar('', { back: true, sos: false })}
    <h1 class="big">مين بيستخدم نَفَس؟</h1><p class="sub">تقدر تغيّر هذا بعدين من الإعدادات.</p>
    <button class="role" id="parent"><div class="ic">${ic('family')}</div><div class="grow"><b>ولي أمر أو مقدم رعاية</b><div class="muted small">أتابع جرعات طفلي وأسجّل الفنتولين</div></div><span class="chev">${ic('chev')}</span></button>
    <button class="role" id="doctor"><div class="ic">${ic('stethoscope')}</div><div class="grow"><b>طبيب</b><div class="muted small">أكتب الخطة وأرسلها للأسرة برابط</div></div><span class="chev">${ic('chev')}</span></button>
    <p class="muted small" style="margin-top:18px;display:flex;gap:8px">${ic('shield')}<span>بياناتك تنحفظ على جهازك بس، وما تطلع منه إلا إذا أرسلتها بنفسك.</span></p>
  </div>`, () => {
    $('#parent').onclick = () => { S().role = 'parent'; St.save(); go('/setup?s=1'); };
    $('#doctor').onclick = () => { S().role = 'doctor'; St.save(); go('/doctor-setup'); };
  });
}

/* ================= PARENT SETUP ================= */
const bar = (n, of = 4) => `<div class="steps-bar">${Array.from({ length: of }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</div>`;
function setup(step) {
  const s = S();
  if (step === 1) return mount(`<div class="screen plain">${topbar('الخطوة 1 من 4', { back: true, sos: false })}${bar(1)}
    <h1 class="big">عرّفنا على طفلك</h1><p class="sub">عشان نسمّي الأشياء باسمه.</p>
    <div class="field"><label>اسم الطفل</label><input id="nm" value="${esc(s.child.name)}" placeholder="مثلاً: سلمان" autocomplete="off"></div>
    <div class="field"><label>ولد أو بنت؟</label><div class="chips" id="gd">${[['m', 'ولد'], ['f', 'بنت']].map(([k, l]) => `<button class="chip ${s.child.gender === k ? 'on' : ''}" data-g="${k}">${l}</button>`).join('')}</div><div class="hint">عشان سلمان يكلّم طفلك صح.</div></div>
    <div class="field"><label>العمر</label><div class="chips" id="age">${['أقل من سنتين', '2–5 سنوات', '6–11 سنة', '12 وفوق'].map(a => `<button class="chip ${s.child.age === a ? 'on' : ''}">${a}</button>`).join('')}</div></div>
    <div class="field"><label>حساسية دوائية معروفة (اختياري)</label><input id="al" value="${esc(s.child.allergy)}" placeholder="اتركه فاضي إذا ما في"></div>
    <div class="field"><label>شنو صلتك بالطفل؟</label><div class="chips" id="me">${['الأم', 'الأب', 'الجد أو الجدة', 'غيره'].map(a => `<button class="chip ${s.me === a ? 'on' : ''}">${a}</button>`).join('')}</div></div>
    <button class="btn" id="n" style="margin-top:10px">التالي</button></div>`, () => {
    const pick = (id, key, set) => $$(`#${id} .chip`).forEach(b => b.onclick = () => { $$(`#${id} .chip`).forEach(x => x.classList.toggle('on', x === b)); set(b.textContent); });
    pick('age', 'age', v => s.child.age = v); pick('me', 'me', v => s.me = v);
    $$('#gd .chip').forEach(b => b.onclick = () => { $$('#gd .chip').forEach(x => x.classList.toggle('on', x === b)); s.child.gender = b.dataset.g; });
    $('#n').onclick = () => { s.child.name = $('#nm').value.trim(); s.child.allergy = $('#al').value.trim(); if (!s.child.name) { $('#nm').focus(); return toast('اكتب اسم الطفل'); } if (!s.child.gender) return toast('اختار ولد أو بنت'); St.save(); go('/setup?s=' + (s.plan ? 3 : 2)); };
  });
  if (step === 2) return mount(`<div class="screen plain">${topbar('الخطوة 2 من 4', { back: true, sos: false })}${bar(2)}
    <h1 class="big">خطة الربو من الطبيب</h1><p class="sub">الخطة هي اللي يكتبها الطبيب: متى الوضع طبيعي، ومتى تحتاجون الفنتولين، ومتى طوارئ.</p>
    <div class="list">
      <button class="item" id="o1"><div class="ic">${ic('link')}</div><div class="grow"><b>عندي رابط من الطبيب</b><div class="d">الطبيب يرسله من نَفَس على الواتساب</div></div><span class="chev">${ic('chev')}</span></button>
      <button class="item" id="o2"><div class="ic">${ic('doc')}</div><div class="grow"><b>أنقلها من ورقة الطبيب</b><div class="d">تكتبها مثل ما هي مكتوبة بالضبط</div></div><span class="chev">${ic('chev')}</span></button>
      <button class="item" id="o3"><div class="ic">${ic('cal')}</div><div class="grow"><b>بعدين</b><div class="d">تقدر تضيفها من صفحة الخطة</div></div><span class="chev">${ic('chev')}</span></button>
    </div></div>`, () => {
    $('#o1').onclick = () => sheet(`<h2>الصق رابط الطبيب</h2><p class="muted">افتح رسالة الطبيب، انسخ الرابط، والصقه هني. أو اضغط الرابط نفسه من الواتساب وبيفتح نَفَس على طول.</p>
      <div class="field"><input id="lk" placeholder="https://…" dir="ltr"></div><button class="btn" id="ok">افتح</button>`, (el, close) => {
      $('#ok', el).onclick = () => { const v = $('#lk', el).value; const m = v.match(/[#&?]d=([^&\s]+)/); if (!m) return toast('هذا مو رابط نَفَس'); close(); go('/import?d=' + m[1]); };
    });
    $('#o2').onclick = () => editPlanSheet(() => go('/setup?s=3'));
    $('#o3').onclick = () => go('/setup?s=3');
  });
  if (step === 3) {
    const p = St.pre() || {}, r = St.rescue() || {};
    return mount(`<div class="screen plain">${topbar('الخطوة 3 من 4', { back: true, sos: false })}${bar(3)}
      <h1 class="big">البخاخات</h1><p class="sub">انقلها من الوصفة مثل ما هي. نَفَس ما يقترح ولا يغيّر أي جرعة.</p>
      <div class="card"><b>البخاخ الوقائي (اليومي)</b>
        <div class="field" style="margin-top:12px"><label>اسم البخاخ</label><input id="pn" value="${esc(p.name)}" placeholder="مثل ما هو مكتوب على العلبة"></div>
        <div class="field"><label>الجرعة كما كتبها الطبيب</label><input id="pd" value="${esc(p.dose)}" placeholder="مثلاً: بختين بالقمع"></div>
        <div class="field"><label>المواعيد</label><div class="times" id="pt">${(p.times || ['08:00', '20:00']).map(t => `<input type="time" value="${t}">`).join('')}<button class="chip" id="addt">${'+ وقت'}</button></div></div>
      </div>
      <div class="card"><b>بخاخ الإنقاذ (الفنتولين)</b>
        <div class="field" style="margin-top:12px"><label>اسم البخاخ</label><input id="rn" value="${esc(r.name || 'فنتولين')}"></div>
        <div class="field"><label>متى وكم، كما كتبها الطبيب</label><input id="rd" value="${esc(r.dose)}" placeholder="انقل تعليمات الطبيب"></div>
        <div class="field"><label>عدد البخات في العبوة الجديدة</label><input id="rc" type="number" inputmode="numeric" value="${r.capacity || 200}"><div class="hint">مكتوب على العلبة. نستخدمه عشان نعدّ اللي باقي.</div></div>
      </div>
      <p class="muted small">ما عندك بخاخ وقائي؟ اترك اسمه فاضي.</p>
      <button class="btn" id="n">التالي</button></div>`, () => {
      $('#addt').onclick = () => { const i = document.createElement('input'); i.type = 'time'; i.value = '14:00'; $('#pt').insertBefore(i, $('#addt')); };
      $('#n').onclick = () => {
        const times = $$('#pt input').map(i => i.value).filter(Boolean).sort();
        const pn = $('#pn').value.trim(), rn = $('#rn').value.trim();
        s.meds = [];
        if (pn) s.meds.push({ id: 'pre', role: 'pre', name: pn, dose: $('#pd').value.trim(), times, capacity: 120, used: 0, opened: St.now() });
        if (rn) s.meds.push({ id: 'rescue', role: 'rescue', name: rn, dose: $('#rd').value.trim(), times: [], capacity: +$('#rc').value || 200, used: 0, opened: St.now() });
        St.save(); go('/setup?s=4');
      };
    });
  }
  if (step === 4) {
    const p = St.pre();
    return mount(`<div class="screen plain">${topbar('الخطوة 4 من 4', { back: true, sos: false })}${bar(4)}
      <h1 class="big">التنبيهات</h1><p class="sub">عشان يرن جوالك في وقت الجرعة حتى لو نَفَس مسكّر، نضيف المواعيد لتقويم الآيفون مرة وحدة.</p>
      ${p && p.times.length ? `<div class="card"><div class="row"><div class="ic" style="width:44px;height:44px;border-radius:14px;display:grid;place-items:center;background:var(--brandsoft);color:var(--brand)">${ic('cal')}</div><div class="grow"><b>${p.times.join(' و ')} كل يوم</b><div class="muted small">التنبيه يقول «موعد الجرعة» بس، بدون اسم الطفل أو الدواء.</div></div></div>
        <button class="btn" id="ics" style="margin-top:14px">أضف للتقويم</button><p class="hint">بيفتح الآيفون صفحة «إضافة الكل». اضغطها.</p></div>` : '<div class="card muted">ما في مواعيد وقائي. تقدر تضيفها بعدين من صفحة الخطة.</div>'}
      <button class="btn ghost" id="done" style="margin-top:16px">خلصنا، ودّني للرئيسية</button></div>`, () => {
      $('#ics') && ($('#ics').onclick = () => downloadICS());
      $('#done').onclick = () => { s.onboarded = true; St.save(); go('/home'); setTimeout(() => toast(`هلا فيك! كل شي جاهز لـ ${s.child.name}`), 300); };
    });
  }
}
function downloadICS() {
  const p = St.pre(); if (!p) return;
  const blob = new Blob([St.icsFor(p.times)], { type: 'text/calendar' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'nafas-reminders.ics'; document.body.append(a); a.click(); a.remove();
}

/* ================= HOME ================= */
async function homeScreen() {
  await probing;
  const s = S(), slot = St.doseSlot(), p = St.pre(), r = St.rescue();
  const lastR = s.events.find(e => e.type === 'rescue'), lastD = s.events.find(e => e.type === 'dose' && e.status === 'given');
  const h = new Date().getHours(); const greet = h < 12 ? 'صباح الخير' : 'مساء الخير';
  const line = slot && slot.due ? (slot.late ? 'تأخر موعد البخاخ شوي، لا تنساه' : 'حان وقت البخاخ الوقائي') : lastR && St.now() - lastR.at < 6 * 3600e3 ? `آخر فنتولين ${St.ago(lastR.at)}` : 'كل شي مرتب لليوم';
  const today = s.events.filter(e => new Date(e.at).toDateString() === new Date().toDateString());
  mount(`<div class="screen">${topbar('', { gear: true })}
    <div class="hello"><div class="who"><span>${greet}، ${esc(s.me)}</span><b>${esc(s.child.name)}</b><span>${line}</span></div><div class="av">${salman('idle', 'face')}</div></div>
    ${p ? doseCard(slot, p) : `<button class="dose" style="width:100%;text-align:start" data-go="edit?what=meds"><div class="k">البخاخ الوقائي</div><div class="what" style="margin-top:6px">ما أضفت البخاخ الوقائي بعد</div><div class="link small" style="margin-top:6px">أضفه الحين</div></button>`}
    <div class="quick">
      <button class="qbtn" id="qr"><div class="ic">${ic('puff')}</div><b>سجّل فنتولين</b><span>${lastR ? 'آخر مرة ' + St.ago(lastR.at) : 'ما في تسجيل'}</span></button>
      <button class="qbtn" id="qs"><div class="ic" style="background:var(--warnsoft);color:var(--warn)">${ic('cough')}</div><b>سجّل أعراض</b><span>كحة، صفير، ضيق</span></button>
    </div>
    <div class="label">اليوم</div>
    <div class="card stat">
      <div><b>${today.filter(e => e.type === 'dose' && e.status === 'given').length}</b><span>جرعات وقائي</span></div>
      <div><b>${today.filter(e => e.type === 'rescue').reduce((a, e) => a + e.puffs, 0)}</b><span>بخات فنتولين</span></div>
      <div><b>${St.weekPuffs()}</b><span>فنتولين هالأسبوع</span></div>
    </div>
    ${r ? `<div class="label">العبوات</div><div class="list">${[p, r].filter(Boolean).map(m => { const left = Math.max(0, m.capacity - m.used); const pc = left / m.capacity; return `<button class="item" data-go="plan"><div class="ic">${ic(m.role === 'pre' ? 'pill' : 'puff')}</div><div class="grow"><b>${esc(m.name)}</b><div class="meter ${pc < .2 ? 'low' : ''}"><i style="width:${(pc * 100).toFixed(0)}%"></i></div><div class="d">باقي تقريباً ${left} من ${m.capacity} حسب التسجيل</div></div></button>`; }).join('')}</div>` : ''}
    ${!s.plan ? `<div class="label">ناقص</div><button class="card row" style="width:100%;text-align:start" data-go="edit?what=plan"><div class="grow"><b>أضف خطة الطبيب</b><div class="muted small">عشان تكون جاهزة في الطوارئ</div></div><span class="chev">${ic('chev')}</span></button>` : ''}
  </div>${tabbar('home')}`, () => {
    $('#qr').onclick = rescueSheet; $('#qs').onclick = symptomSheet;
    if (!window.__greeted) { window.__greeted = true; say(slot && slot.due ? 'dose_time' : h < 12 ? 'hello_morning' : 'hello_evening'); }
    $('#give') && ($('#give').onclick = () => confirmDose(slot, 'given'));
    $('#skip') && ($('#skip').onclick = () => sheet(`<h2>ما انعطت الجرعة؟</h2><p class="muted">نسجّلها «ما انعطت» مثل ما هي. ما في أي تقييم.</p><div class="btns"><button class="btn ghost" id="no">رجوع</button><button class="btn" id="yes">سجّل «ما انعطت»</button></div>`, (el, close) => { $('#no', el).onclick = close; $('#yes', el).onclick = () => { close(); confirmDose(slot, 'missed'); }; }));
    $('#early') && ($('#early').onclick = () => confirmDose({ at: slot.at }, 'given'));
  });
}
function doseCard(slot, p) {
  if (!slot) return `<div class="dose"><div class="k">البخاخ الوقائي</div><div class="what" style="margin-top:6px">${esc(p.name)}</div><div class="muted small">ما في مواعيد محددة</div></div>`;
  if (slot.due) return `<div class="dose due"><div class="k">${slot.late ? 'متأخرة' : 'حان الموعد'} · ${St.fmtTime(slot.at)}</div><div class="time">${esc(p.dose || 'الجرعة اليومية')}</div><div class="what">${esc(p.name)}</div><div class="muted small">كما كتبها الطبيب</div>
    <div class="btns"><button class="btn white" id="give">${ic('check', 2.4)}أعطيته</button><button class="btn clear" id="skip" style="flex:.55">ما انعطى</button></div></div>`;
  return `<div class="dose"><div class="k">الموعد الجاي · ${St.fmtDay(slot.at)}</div><div class="time">${St.fmtTime(slot.at)}</div><div class="what">${esc(p.name)} — ${esc(p.dose)}</div><button class="link small" id="early" style="margin-top:10px">أعطيته قبل الموعد؟ سجّله</button></div>`;
}
function confirmDose(slot, status) {
  const p = St.pre(); const puffs = status === 'given' ? (parseInt(p.dose) || (/بختين/.test(p.dose) ? 2 : 1)) : 0;
  if (status === 'given') p.used += puffs;
  const e = St.addEvent({ type: 'dose', med: 'pre', slot: slot.at, status, puffs });
  homeScreen(); if (status === 'given') { say('dose_done'); s3(m => m.proud()); }
  toast(status === 'given' ? `سجّلنا الجرعة ${St.fmtTime(e.at)}` : 'سجّلنا إن الجرعة ما انعطت', () => { St.removeEvent(e.id); homeScreen(); });
}

/* ================= QUICK SHEETS ================= */
function rescueSheet() {
  const r = St.rescue(); let n = 2, why = '';
  if (!r) return toast('أضف بخاخ الإنقاذ أول من صفحة الخطة');
  sheet(`<h2>سجّل فنتولين</h2><p class="muted">${esc(r.dose ? 'تعليمات الطبيب: ' + r.dose : 'اختار عدد البخات اللي انعطت.')}</p>
    <div class="label" style="margin-top:12px">كم بخة؟</div><div class="chips" id="np">${[1, 2, 3, 4, 5, 6, 8, 10].map(k => `<button class="chip ${k === 2 ? 'on' : ''}" data-k="${k}">${k}</button>`).join('')}</div>
    <div class="label">السبب (اختياري)</div><div class="chips" id="wy">${['كحة', 'صفير', 'ضيق نفس', 'قبل الرياضة', 'غبار', 'زكام'].map(w => `<button class="chip">${w}</button>`).join('')}</div>
    <button class="btn" id="ok" style="margin-top:20px">سجّل</button>`, (el, close) => {
    $$('#np .chip', el).forEach(b => b.onclick = () => { n = +b.dataset.k; $$('#np .chip', el).forEach(x => x.classList.toggle('on', x === b)); });
    $$('#wy .chip', el).forEach(b => b.onclick = () => { const on = !b.classList.contains('on'); $$('#wy .chip', el).forEach(x => x.classList.remove('on')); b.classList.toggle('on', on); why = on ? b.textContent : ''; });
    $('#ok', el).onclick = () => {
      r.used += n; const e = St.addEvent({ type: 'rescue', med: 'rescue', puffs: n, reason: why }); close(); route();
      toast(`سُجّل ${St.puffWord(n)} الساعة ${St.fmtTime(e.at)}`, () => { St.removeEvent(e.id); route(); });
    };
  });
}
function symptomSheet() {
  let kind = 'كحة', sev = 'خفيفة'; const tags = new Set();
  sheet(`<h2>سجّل أعراض</h2><p class="muted">اكتب اللي تشوفه. نَفَس يحفظه مثل ما هو.</p>
    <div class="label" style="margin-top:12px">شنو صار؟</div><div class="chips" id="k">${['كحة', 'صفير', 'ضيق نفس', 'صحى بالليل', 'زكام', 'حرارة'].map((w, i) => `<button class="chip ${i ? '' : 'on'}">${w}</button>`).join('')}</div>
    <div class="label">الشدة كما تشوفها</div><div class="chips" id="s">${['خفيفة', 'متوسطة', 'شديدة'].map((w, i) => `<button class="chip ${i ? '' : 'on'}">${w}</button>`).join('')}</div>
    <div class="label">وش كان حوله؟ (اختياري)</div><div class="chips" id="t">${['غبار', 'دخان', 'تكييف', 'مكان جديد', 'رياضة', 'عطر'].map(w => `<button class="chip">${w}</button>`).join('')}</div>
    <div class="field" style="margin-top:14px"><input id="note" placeholder="ملاحظة (اختياري)"></div>
    <button class="btn" id="ok">سجّل</button>`, (el, close) => {
    const one = (id, set) => $$(`#${id} .chip`, el).forEach(b => b.onclick = () => { $$(`#${id} .chip`, el).forEach(x => x.classList.toggle('on', x === b)); set(b.textContent); });
    one('k', v => kind = v); one('s', v => sev = v);
    $$('#t .chip', el).forEach(b => b.onclick = () => { b.classList.toggle('on'); b.classList.contains('on') ? tags.add(b.textContent) : tags.delete(b.textContent); });
    $('#ok', el).onclick = () => { const e = St.addEvent({ type: 'symptom', kind, severity: sev, tags: [...tags], note: $('#note', el).value.trim() }); close(); route(); toast(`سجّلنا: ${kind}`, () => { St.removeEvent(e.id); route(); }); };
  });
}

/* ================= EMERGENCY ================= */
function emergency() {
  const s = S(), e = s.emergency;
  const d = document.createElement('div'); d.className = 'emer';
  d.innerHTML = `<div class="topbar"><b style="font-size:1.15em">طوارئ — ${esc(s.child.name || '')}</b><button class="iconbtn" id="x" aria-label="إغلاق">${ic('x')}</button></div>
    <a class="call" href="tel:999">${ic('phone', 2.2)}اتصل 999</a>
    ${e && e.steps.length ? `<div class="label" style="color:#9a4b4b;margin-top:0">خطة الطبيب</div><ol>${e.steps.map(x => `<li>${esc(x)}</li>`).join('')}</ol>
      <p class="small" style="opacity:.7;margin-top:12px">كتبها ${esc(e.by || 'الطبيب')} · ${St.fmtDay(e.at)}. محفوظة على الجهاز وتشتغل بدون إنترنت.</p>`
      : `<p style="font-size:1.2em;font-weight:600">ما في خطة طوارئ من الطبيب مسجلة. اتصل بـ 999.</p>`}
    ${s.child.allergy ? `<p style="font-weight:600">حساسية: ${esc(s.child.allergy)}</p>` : ''}
    <div class="btns" style="margin-top:16px">${e ? `<button class="btn ghost" id="say">${ic('speaker')}اقرأ الخطوات</button>` : ''}${s.contacts.filter(c => c.p !== '999').map(c => `<a class="btn ghost" href="tel:${c.p.replace(/\s/g, '')}">${ic('phone')}${esc(c.n)}</a>`).join('')}</div>`;
  document.body.append(d);
  $('#x', d).onclick = () => { speechSynthesis.cancel(); d.remove(); };
  $('#say', d) && ($('#say', d).onclick = () => { const u = new SpeechSynthesisUtterance(e.steps.join('. ')); u.lang = 'ar-SA'; u.rate = .9; speechSynthesis.cancel(); speechSynthesis.speak(u); });
}

/* ================= LOG ================= */
let logFilter = 'all';
function logScreen() {
  const s = S();
  const F = { all: () => true, dose: e => e.type === 'dose', rescue: e => e.type === 'rescue', symptom: e => e.type === 'symptom' };
  const evs = s.events.filter(F[logFilter]).sort((a, b) => b.at - a.at);
  const groups = {}; evs.forEach(e => (groups[St.fmtDay(e.at)] ||= []).push(e));
  mount(`<div class="screen">${topbar('السجل')}
    <div class="seg">${[['all', 'الكل'], ['dose', 'الوقائي'], ['rescue', 'الفنتولين'], ['symptom', 'الأعراض']].map(([k, l]) => `<button data-f="${k}" class="${logFilter === k ? 'on' : ''}">${l}</button>`).join('')}</div>
    ${evs.length ? Object.entries(groups).map(([d, list]) => `<div class="day">${d}</div><div class="list">${list.map(evRow).join('')}</div>`).join('')
      : `<div class="empty"><img src="assets/salman_face.jpg" alt=""><div><b>ما في تسجيل بعد</b></div><div class="small">أي جرعة أو فنتولين تسجله يطلع هني بوقته.</div></div>`}
    <div class="btns" style="margin-top:18px"><button class="btn soft" id="ar">${ic('puff')}فنتولين</button><button class="btn soft" id="as">${ic('cough')}أعراض</button></div>
  </div>${tabbar('log')}`, () => {
    $$('[data-f]').forEach(b => b.onclick = () => { logFilter = b.dataset.f; logScreen(); });
    $('#ar').onclick = rescueSheet; $('#as').onclick = symptomSheet;
    $$('[data-ev]').forEach(b => b.onclick = () => {
      const e = s.events.find(x => x.id === b.dataset.ev);
      sheet(`<h2>${evTitle(e)}</h2><p class="muted">${St.fmtDay(e.at)} ${St.fmtTime(e.at)} · سجّله ${esc(e.by)}</p>${e.note ? `<p>${esc(e.note)}</p>` : ''}
        <button class="btn ghost" id="del" style="color:var(--sos);margin-top:10px">${ic('trash')}احذف هذا التسجيل</button>`, (el, close) => {
        $('#del', el).onclick = () => { const copy = { ...e }; St.removeEvent(e.id); close(); logScreen(); toast('انحذف', () => { s.events.push(copy); if (copy.puffs) { const m = s.meds.find(x => x.id === copy.med); m && (m.used += copy.puffs); } St.save(); logScreen(); }); };
      });
    });
  });
}
const evTitle = e => e.type === 'dose' ? (e.status === 'given' ? 'الوقائي — انعطى' : 'الوقائي — ما انعطى') : e.type === 'rescue' ? `فنتولين — ${St.puffWord(e.puffs)}` : `${e.kind} — ${e.severity}`;
function evRow(e) {
  const cls = e.type === 'symptom' && e.kind === 'صحى بالليل' ? 'night' : e.type;
  const icon = { dose: 'pill', rescue: 'puff', symptom: 'cough', night: 'moon' }[cls];
  const extra = e.type === 'rescue' && e.reason ? ` · ${esc(e.reason)}` : e.type === 'symptom' && e.tags && e.tags.length ? ` · ${e.tags.map(esc).join('، ')}` : '';
  return `<button class="ev" data-ev="${e.id}" style="width:100%;text-align:start"><div class="dot ${cls}">${ic(icon)}</div><div class="grow"><b>${evTitle(e)}</b><div class="m">${St.fmtTime(e.at)} · ${esc(e.by)}${extra}</div></div></button>`;
}

/* ================= PLAN ================= */
function planScreen() {
  const s = S(), p = s.plan, e = s.emergency;
  mount(`<div class="screen">${topbar('الخطة')}
    <div class="label" style="margin-top:6px">خطة الربو</div>
    ${p ? `<div class="card"><div class="zone z-g"><h4><i></i>الأخضر</h4>${esc(p.green)}</div><div class="zone z-y"><h4><i></i>الأصفر</h4>${esc(p.yellow)}</div><div class="zone z-r"><h4><i></i>الأحمر</h4>${esc(p.red)}</div>
      <div class="src">${ic(p.source === 'doctor' ? 'stethoscope' : 'doc')}<span>${p.source === 'doctor' ? 'من ' + esc(p.by) + ' عن طريق نَفَس' : 'منقولة من ورقة الطبيب'} · ${St.fmtDay(p.at)}</span></div>
      <p class="muted small" style="margin:8px 0 0">نَفَس يعرض الخطة بس، وما يحدد أنتم في أي لون. هذا قراركم حسب كلام الطبيب.</p></div>`
      : `<button class="card row" style="width:100%;text-align:start" data-go="edit?what=plan"><div class="grow"><b>ما في خطة بعد</b><div class="muted small">أضفها من رابط الطبيب أو انقلها من الورقة</div></div><span class="chev">${ic('chev')}</span></button>`}
    <div class="label">خطوات الطوارئ</div>
    ${e && e.steps.length ? `<div class="list">${e.steps.map((x, i) => `<div class="lstep"><span class="n">${i + 1}</span><span>${esc(x)}</span></div>`).join('')}</div>` : `<div class="card muted">ما في خطوات طوارئ. زر الطوارئ بيتصل بـ 999.</div>`}
    <div class="label">البخاخات</div>
    <div class="list">${s.meds.map(m => { const left = Math.max(0, m.capacity - m.used), pc = left / m.capacity; return `<div class="item"><div class="ic">${ic(m.role === 'pre' ? 'pill' : 'puff')}</div><div class="grow"><b>${esc(m.name)}</b><div class="d">${esc(m.dose)}${m.times.length ? ' · ' + m.times.join(' و ') : ''}</div><div class="meter ${pc < .2 ? 'low' : ''}"><i style="width:${(pc * 100).toFixed(0)}%"></i></div><div class="d">باقي تقريباً ${left} من ${m.capacity} (طرح من التسجيل، مو قياس للعبوة)</div></div></div>`; }).join('') || '<div class="item muted">ما في بخاخات</div>'}</div>
    <div class="btns" style="margin-top:12px"><button class="btn soft" data-go="edit?what=plan">${ic('edit')}عدّل الخطة</button><button class="btn soft" data-go="edit?what=meds">${ic('pill')}البخاخات</button></div>
    <button class="btn ghost" id="newcan" style="margin-top:10px">فتحت عبوة جديدة</button>
  </div>${tabbar('plan')}`, () => {
    $('#newcan').onclick = () => sheet(`<h2>أي عبوة فتحت؟</h2><div class="list">${s.meds.map(m => `<button class="item" data-m="${m.id}"><div class="ic">${ic(m.role === 'pre' ? 'pill' : 'puff')}</div><div class="grow"><b>${esc(m.name)}</b><div class="d">يرجع العداد ${m.capacity}</div></div></button>`).join('')}</div>`, (el, close) => {
      $$('[data-m]', el).forEach(b => b.onclick = () => { const m = s.meds.find(x => x.id === b.dataset.m); const old = m.used; m.used = 0; m.opened = St.now(); St.save(); close(); planScreen(); toast('رجع العداد للعبوة الجديدة', () => { m.used = old; St.save(); planScreen(); }); });
    });
  });
}
function editPlan(q) {
  if (q.get && q.get('what') === 'meds') return setupMedsInline();
  editPlanSheet(() => go('/plan'));
  if (!$('.screen')) planScreen();
}
function setupMedsInline() {
  // reuse the setup step but return to the plan
  const s = S();
  setup(3);
  $('#n').onclick = (orig => () => { const times = $$('#pt input').map(i => i.value).filter(Boolean).sort(); const pn = $('#pn').value.trim(), rn = $('#rn').value.trim();
    const oldP = St.pre(), oldR = St.rescue(); s.meds = [];
    if (pn) s.meds.push({ id: 'pre', role: 'pre', name: pn, dose: $('#pd').value.trim(), times, capacity: oldP?.capacity || 120, used: oldP?.used || 0, opened: oldP?.opened || St.now() });
    if (rn) s.meds.push({ id: 'rescue', role: 'rescue', name: rn, dose: $('#rd').value.trim(), times: [], capacity: +$('#rc').value || 200, used: oldR?.used || 0, opened: oldR?.opened || St.now() });
    St.save(); go('/plan'); toast('انحفظت البخاخات'); })();
  $('.topbar .t').textContent = 'البخاخات'; $('.steps-bar').remove(); $('#n').textContent = 'احفظ';
}
function editPlanSheet(done) {
  const s = S(), p = s.plan || {}, e = s.emergency || { steps: [] };
  sheet(`<h2>خطة الطبيب</h2><p class="muted">انقلها من ورقة الطبيب بالحرف. لا تضيف ولا تختصر.</p>
    <div class="field"><label><i class="zd g"></i>الأخضر: الوضع الطبيعي</label><textarea id="g">${esc(p.green)}</textarea></div>
    <div class="field"><label><i class="zd y"></i>الأصفر: الأعراض بدت</label><textarea id="y">${esc(p.yellow)}</textarea></div>
    <div class="field"><label><i class="zd r"></i>الأحمر: خطر</label><textarea id="r">${esc(p.red)}</textarea></div>
    <div class="field"><label>خطوات الطوارئ (كل خطوة في سطر)</label><textarea id="e" style="min-height:130px">${esc(e.steps.join('\n'))}</textarea></div>
    <div class="field"><label>رقم العيادة (اختياري)</label><input id="c" inputmode="tel" dir="ltr" value="${esc((s.contacts.find(c => c.n === 'العيادة') || {}).p || '')}"></div>
    <button class="btn" id="sv">احفظ</button>`, (el, close) => {
    $('#sv', el).onclick = () => {
      const g = $('#g', el).value.trim(), y = $('#y', el).value.trim(), r = $('#r', el).value.trim();
      if (g || y || r) s.plan = { green: g, yellow: y, red: r, by: 'الطبيب', at: St.now(), version: (p.version || 0) + 1, source: 'paper' };
      const steps = $('#e', el).value.split('\n').map(x => x.trim()).filter(Boolean);
      if (steps.length) s.emergency = { steps, by: 'الطبيب', at: St.now(), version: (e.version || 0) + 1 };
      const c = $('#c', el).value.trim(); s.contacts = s.contacts.filter(x => x.n !== 'العيادة'); if (c) s.contacts.push({ n: 'العيادة', p: c });
      St.save(); close(); toast('انحفظت الخطة'); done && done();
    };
  });
}

/* ================= SALMAN (breathing coach + inhaler guide) ================= */
let coachTimer;
async function salmanScreen() {
  await probing; clearInterval(coachTimer);
  const s = S(); const days = s.stamps.slice(-14);
  mount(`<div class="screen">${topbar('سلمان')}
    <div class="coach" id="coach">${salman('breathe', 'bust')}<div class="ring"><div id="cue">نتنفس سوا؟</div></div></div>
    <div class="btns" style="margin-top:12px"><button class="btn ok" id="go">${ic('play')}ابدأ 10 أنفاس</button><button class="btn ghost" id="voice" style="flex:.5">${ic('speaker')}${s.prefs.voice ? 'الصوت شغال' : 'الصوت مطفي'}</button></div>
    <p class="muted small" style="margin:8px 4px 0">استخدمه وقت القمع: الطفل يقلّد سلمان. سلمان يعدّ بس، وما يقيس التنفس.</p>
    <div class="label">طريقة البخاخ مع القمع</div>
    <div class="viewer"><canvas id="inh3d" aria-label="البخاخ والقمع ثلاثي الأبعاد"></canvas></div>
    <div class="list" style="margin-top:12px">${[['جهّز', 'شيل غطاء البخاخ وتأكد إن القمع نظيف وناشف.'], ['رجّ البخاخ', 'رجّه زين كم ثانية قبل كل بخة.'], ['ركّبه', 'دخّل البخاخ في طرف القمع، والقناع في الطرف الثاني.'], ['بخة وحدة وتنفس', 'حط القناع على الوجه بإحكام، اضغط بخة وحدة، وخلّ الطفل يتنفس مع سلمان حسب تعليمات الطبيب.']].map((x, i) => `<button class="lstep" data-s="${i}"><span class="n">${i + 1}</span><span class="grow"><b>${x[0]}</b><div class="muted small">${x[1]}</div></span></button>`).join('')}</div>
    <div class="label">أختامي (يوم فيه تسجيل = ختم)</div>
    <div class="card"><div class="stamps">${Array.from({ length: 14 }, (_, i) => `<span class="${i < days.length ? 'on' : ''}">${i < days.length ? '⭐' : ''}</span>`).join('')}</div></div>
    <p class="muted small" style="margin:10px 4px">الأختام على التسجيل، مو على «قلة الأعراض»، عشان ما ينخفى شي.</p>
  </div>${tabbar('salman')}`, async () => {
    let on = false, n = 0;
    const cue = $('#cue');
    const stop = (msg) => { on = false; clearInterval(coachTimer); s3(m => m.breath(null)); $('#go').innerHTML = ic('play') + 'ابدأ 10 أنفاس'; cue.textContent = msg; };
    $('#go').onclick = () => {
      if (on) { say('stop'); return stop('وقفنا. نكمل بعدين؟'); }
      on = true; n = 0; $('#go').innerHTML = ic('pause') + 'وقف'; say('breathe_start'); setTimeout(() => on && say('follow'), 2000);
      let phase = 'out'; cue.textContent = 'استعد…';
      const tick = () => {
        phase = phase === 'in' ? 'out' : 'in';
        if (phase === 'in') { n++; if (n > 10) { stop(S().child.gender === 'f' ? 'شاطرة! خلصنا' : 'شاطر! خلصنا'); say('breathe_done'); s3(m => m.proud()); return; } }
        cue.textContent = phase === 'in' ? `شهيق… ${n}` : `زفير… ${n}`; s3(m => m.breath(phase));
        if (n === 1) say(phase); else if (phase === 'in') say('n' + n);
      };
      setTimeout(() => { if (!on) return; tick(); coachTimer = setInterval(tick, 4000); }, 3600);
    };
    $('#voice').onclick = () => { s.prefs.voice = !s.prefs.voice; St.save(); salmanScreen(); };
    const m = await import('./inhaler3d.js'); const I = m.createInhaler($('#inh3d'));
    window.addEventListener('hashchange', () => { I.dispose(); clearInterval(coachTimer); s3(m => m.breath(null)); }, { once: true });
    $$('.lstep[data-s]').forEach(b => b.onclick = () => { $$('.lstep').forEach(x => x.classList.toggle('on', x === b)); I.step(+b.dataset.s); });
  });
}

/* ================= SETTINGS / FAMILY / REPORT ================= */
function settings() {
  const s = S(), pr = s.prefs; const isDoc = s.role === 'doctor';
  const sw = (k, label, icon) => `<button class="item" data-p="${k}"><div class="ic">${ic(icon)}</div><div class="grow"><b>${label}</b></div><span class="chip ${pr[k] ? 'on' : ''}" style="padding:6px 14px">${pr[k] ? 'شغال' : 'مطفي'}</span></button>`;
  mount(`<div class="screen plain">${topbar('الإعدادات', { back: true, sos: !isDoc })}
    ${isDoc ? '' : `<div class="label">${esc(s.child.name)}</div><div class="list">
      <button class="item" id="child"><div class="ic">${ic('user')}</div><div class="grow"><b>بيانات الطفل</b><div class="d">${esc(s.child.age || '')}${s.child.allergy ? ' · حساسية: ' + esc(s.child.allergy) : ''}</div></div><span class="chev">${ic('chev')}</span></button>
      <button class="item" data-go="family"><div class="ic">${ic('family')}</div><div class="grow"><b>العائلة</b><div class="d">شارك الخطة مع الأب أو الجدة أو الحضانة</div></div><span class="chev">${ic('chev')}</span></button>
      <button class="item" data-go="report"><div class="ic">${ic('doc')}</div><div class="grow"><b>تقرير للطبيب</b><div class="d">صفحة وحدة قبل الزيارة</div></div><span class="chev">${ic('chev')}</span></button>
      <button class="item" id="ics"><div class="ic">${ic('cal')}</div><div class="grow"><b>تنبيهات التقويم</b><div class="d">أضف مواعيد الجرعات للآيفون</div></div><span class="chev">${ic('chev')}</span></button>
    </div>`}
    <div class="label">العرض</div><div class="list">${sw('big', 'خط كبير (وضع الأجداد)', 'text')}${sw('night', 'الوضع الليلي', 'moon')}${isDoc ? '' : sw('voice', 'صوت سلمان', 'speaker')}</div>
    <div class="label">البيانات والخصوصية</div><div class="list">
      <div class="item"><div class="ic">${ic('shield')}</div><div class="grow"><b>بياناتك على جهازك</b><div class="d">ما في سيرفر. ما تطلع إلا برابط ترسله أنت.</div></div></div>
      <button class="item" id="exp"><div class="ic">${ic('share')}</div><div class="grow"><b>صدّر بياناتي</b><div class="d">ملف كامل تحتفظ فيه</div></div></button>
      <button class="item" id="wipe" style="color:var(--sos)"><div class="ic" style="background:var(--sossoft);color:var(--sos)">${ic('trash')}</div><div class="grow"><b>احذف كل البيانات</b></div></button>
    </div>
    <p class="muted small" style="margin:18px 4px">نَفَس أداة تنظيم وتوثيق ومشاركة. ما يشخّص ولا يعالج ولا يوصي بجرعات، وما يغني عن الطبيب. في الطوارئ اتصل بـ 999.</p>
  </div>`, () => {
    $$('[data-p]').forEach(b => b.onclick = () => { pr[b.dataset.p] = !pr[b.dataset.p]; St.save(); applyPrefs(); settings(); });
    $('#child') && ($('#child').onclick = () => { s.onboarded = false; St.save(); go('/setup?s=1'); setTimeout(() => { const n = $('#n'); if (n) n.onclick = () => { s.child.name = $('#nm').value.trim() || s.child.name; s.child.allergy = $('#al').value.trim(); s.onboarded = true; St.save(); go('/settings'); toast('انحفظ'); }; n && (n.textContent = 'احفظ'); }, 50); });
    $('#ics') && ($('#ics').onclick = () => St.pre() ? downloadICS() : toast('ما في مواعيد وقائي'));
    $('#exp').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(s, null, 1)], { type: 'application/json' })); a.download = 'nafas-data.json'; a.click(); };
    $('#wipe').onclick = () => sheet(`<h2>متأكد؟</h2><p class="muted">بينحذف كل شي على هذا الجهاز، وما يرجع.</p><div class="btns"><button class="btn ghost" id="no">لا</button><button class="btn sos" id="yes">احذف</button></div>`, (el, close) => { $('#no', el).onclick = close; $('#yes', el).onclick = () => { St.wipe(); close(); go('/'); route(); }; });
  });
}
async function familyScreen() {
  const s = S();
  mount(`<div class="screen plain">${topbar('العائلة', { back: true })}
    <h1 class="big">نفس الخطة عند الكل</h1><p class="sub">أرسل رابط فيه خطة الطبيب والبخاخات. اللي يفتحه يصير عنده نفس الخطة في نَفَس على جواله.</p>
    <div class="list">${[['الأب أو الأم', 'family'], ['الجد أو الجدة', 'family'], ['الحضانة أو المدرسة', 'doc']].map(([n, i]) => `<button class="item" data-to="${n}"><div class="ic">${ic(i)}</div><div class="grow"><b>${n}</b><div class="d">${n.includes('الحضانة') ? 'خطة الطوارئ بس' : 'الخطة والبخاخات'}</div></div><span class="chev">${ic('share')}</span></button>`).join('')}</div>
    <p class="muted small" style="margin:14px 4px">ملاحظة صريحة: التسجيل (الجرعات والفنتولين) ينحفظ على كل جوال بروحه. المزامنة اللحظية بين الأجهزة تحتاج سيرفر داخل البحرين، وهذي المرحلة الجاية.</p>
  </div>`, () => {
    $$('[data-to]').forEach(b => b.onclick = async () => {
      const nursery = b.dataset.to.includes('الحضانة');
      const payload = { t: nursery ? 'nursery' : 'family', child: { name: s.child.name, allergy: s.child.allergy }, emergency: s.emergency, contacts: s.contacts, ...(nursery ? {} : { plan: s.plan, meds: s.meds.map(({ used, ...m }) => m) }) };
      const url = await St.makeLink(payload);
      const text = `خطة ${s.child.name} في نَفَس: ${url}`;
      if (navigator.share) navigator.share({ title: 'نَفَس', text }).catch(() => {});
      else { await navigator.clipboard.writeText(url).catch(() => {}); toast('انسخ الرابط'); }
    });
  });
}
function reportScreen() {
  const s = S(); const D = 864e5, t = St.now();
  const inRange = (a, b) => e => t - e.at >= a * D && t - e.at < b * D;
  const p = St.pre(); const expected = p ? p.times.length * 14 : 0;
  const last = s.events.filter(inRange(0, 14)); const prev = s.events.filter(inRange(14, 28));
  const given = last.filter(e => e.type === 'dose' && e.status === 'given').length, missed = last.filter(e => e.type === 'dose' && e.status === 'missed').length;
  const resc = a => a.filter(e => e.type === 'rescue').reduce((x, e) => x + e.puffs, 0);
  const nights = last.filter(e => e.type === 'symptom' && e.kind === 'صحى بالليل').length;
  const daysLogged = new Set(last.map(e => new Date(e.at).toDateString())).size;
  mount(`<div class="screen plain">${topbar('تقرير للطبيب', { back: true, sos: false })}
    <div class="card"><div class="row"><img src="assets/logo.svg" width="40" alt=""><div class="grow"><b>${esc(s.child.name)}</b><div class="muted small">آخر 14 يوم · لين ${St.fmtDay(t)}</div></div></div>
      <div class="label">الأرقام كما سُجّلت</div>
      <div class="list" style="box-shadow:none;border:1px solid var(--line)">
        <div class="item"><div class="grow">جرعات وقائي مؤكدة</div><b>${given}${expected ? ' من ' + expected + ' مجدولة' : ''}</b></div>
        <div class="item"><div class="grow">جرعات «ما انعطت»</div><b>${missed}</b></div>
        <div class="item"><div class="grow">بخات فنتولين (آخر 14 يوم)</div><b>${resc(last)}</b></div>
        <div class="item"><div class="grow">بخات فنتولين (الـ 14 يوم قبلها)</div><b>${resc(prev)}</b></div>
        <div class="item"><div class="grow">ليالي صحى فيها</div><b>${nights}</b></div>
        <div class="item"><div class="grow">أيام فيها تسجيل</div><b>${daysLogged} من 14</b></div>
      </div>
      <p class="muted small">بدون تفسير. اكتمال التسجيل ${Math.round(daysLogged / 14 * 100)}%، فالأرقام قد تكون ناقصة.</p>
    </div>
    <button class="btn no-print" style="margin-top:14px" onclick="window.print()">${ic('share')}اطبع أو احفظ PDF</button>
  </div>`);
}

/* ================= IMPORT (link from doctor / family) ================= */
async function importScreen(d) {
  let data; try { data = await St.readLink(d); } catch { mount(`<div class="screen plain">${topbar('', { back: true, sos: false })}<div class="empty"><b>الرابط ناقص أو خربان</b><div class="small">اطلب من المرسل يرسله مرة ثانية.</div></div></div>`); return; }
  const s = S();
  mount(`<div class="screen plain">${topbar('رابط نَفَس', { back: false, sos: false })}
    <h1 class="big">${data.t === 'nursery' ? 'خطة طوارئ' : 'خطة من ' + esc(data.from || 'الطبيب')}</h1><p class="sub">لـ <b>${esc(data.child?.name)}</b>. شيّك عليها قبل لا تعتمدها.</p>
    ${data.plan ? `<div class="card"><div class="zone z-g"><h4><i></i>الأخضر</h4>${esc(data.plan.green)}</div><div class="zone z-y"><h4><i></i>الأصفر</h4>${esc(data.plan.yellow)}</div><div class="zone z-r"><h4><i></i>الأحمر</h4>${esc(data.plan.red)}</div></div>` : ''}
    ${data.emergency ? `<div class="label">الطوارئ</div><div class="list">${data.emergency.steps.map((x, i) => `<div class="lstep"><span class="n">${i + 1}</span><span>${esc(x)}</span></div>`).join('')}</div>` : ''}
    ${data.meds && data.meds.length ? `<div class="label">البخاخات</div><div class="list">${data.meds.map(m => `<div class="item"><div class="ic">${ic(m.role === 'pre' ? 'pill' : 'puff')}</div><div class="grow"><b>${esc(m.name)}</b><div class="d">${esc(m.dose)}${m.times?.length ? ' · ' + m.times.join(' و ') : ''}</div></div></div>`).join('')}</div>` : ''}
    <button class="btn" id="ok" style="margin-top:18px">اعتمد الخطة</button>
    ${s.onboarded && s.role === 'parent' ? '<p class="muted small" style="margin:10px 4px">بتحل محل الخطة الحالية. السجل ما يتأثر.</p>' : ''}
  </div>`, () => {
    $('#ok').onclick = () => {
      s.role = s.role || 'parent'; if (s.role === 'doctor') s.role = 'parent';
      if (!s.child.name && data.child) s.child.name = data.child.name;
      if (data.child?.allergy) s.child.allergy = data.child.allergy;
      if (data.plan) s.plan = { ...data.plan, source: data.t === 'doctor' ? 'doctor' : data.plan.source || 'paper' };
      if (data.emergency) s.emergency = data.emergency;
      if (data.contacts) s.contacts = data.contacts;
      if (data.meds) s.meds = data.meds.map(m => { const old = s.meds.find(x => x.id === m.id); return { ...m, used: old ? old.used : 0, opened: old ? old.opened : St.now() }; });
      const wasOn = s.onboarded; St.save();
      if (wasOn) { go('/plan'); toast('اعتمدت الخطة الجديدة'); }
      else go('/setup?s=1');
    };
  });
}

/* ================= DOCTOR ================= */
function doctorSetup() {
  const s = S();
  mount(`<div class="screen plain">${topbar('', { back: true, sos: false })}
    <h1 class="big">أهلاً دكتور</h1><p class="sub">اسمك يطلع للأسرة فوق الخطة اللي ترسلها.</p>
    <div class="field"><label>الاسم كما تحب يظهر</label><input id="dn" placeholder="د. ..." value="${esc(s.doctorName || '')}"></div>
    <div class="field"><label>العيادة أو المستشفى (اختياري)</label><input id="dc" value="${esc(s.clinic || '')}"></div>
    <div class="field"><label>رقم العيادة للأسرة (اختياري)</label><input id="dp" dir="ltr" inputmode="tel" value="${esc(s.clinicPhone || '')}"></div>
    <button class="btn" id="ok">ابدأ</button></div>`, () => {
    $('#ok').onclick = () => { const n = $('#dn').value.trim(); if (!n) return toast('اكتب اسمك'); s.doctorName = n; s.clinic = $('#dc').value.trim(); s.clinicPhone = $('#dp').value.trim(); s.onboarded = true; St.save(); go('/home'); };
  });
}
function doctorHome() {
  const s = S(); const L = [...s.patients].sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  mount(`<div class="screen plain"><div class="topbar"><button class="iconbtn" data-go="settings">${ic('gear')}</button><div class="t">${esc(s.doctorName)}</div><span style="width:42px"></span></div>
    <h1 class="big">مرضاي</h1><p class="sub">اكتب الخطة لكل مريض وأرسلها للأسرة برابط. البيانات على جهازك بس.</p>
    <button class="btn" id="new">${ic('plus', 2.4)}مريض جديد</button>
    ${L.length ? `<div class="label">مرتبين بالاسم</div><div class="list">${L.map(p => `<button class="item" data-id="${p.id}"><div class="ic">${ic('user')}</div><div class="grow"><b>${esc(p.name)}</b><div class="d">${p.sent ? 'آخر إرسال ' + St.ago(p.sent) : 'ما انرسلت بعد'} · الإصدار ${p.version || 1}</div></div><span class="chev">${ic('chev')}</span></button>`).join('')}</div>` : `<div class="empty"><b>ما في مرضى بعد</b><div class="small">اضغط «مريض جديد» واكتب خطته.</div></div>`}
  </div>`, () => {
    $('#new').onclick = () => { const id = St.uid(); s.patients.push({ id, name: '', version: 0 }); St.save(); go('/patient?id=' + id); };
    $$('[data-id]').forEach(b => b.onclick = () => go('/patient?id=' + b.dataset.id));
  });
}
function patientEditor(id) {
  const s = S(), p = s.patients.find(x => x.id === id); if (!p) return go('/home');
  const pl = p.plan || {}, em = p.emergency || { steps: [] }, meds = p.meds || [];
  const pre = meds.find(m => m.role === 'pre') || {}, res = meds.find(m => m.role === 'rescue') || { name: 'فنتولين' };
  mount(`<div class="screen plain">${topbar(p.name || 'مريض جديد', { back: true, sos: false })}
    <div class="field"><label>اسم المريض</label><input id="nm" value="${esc(p.name)}"></div>
    <div class="field"><label>حساسية دوائية (اختياري)</label><input id="al" value="${esc(p.allergy || '')}"></div>
    <div class="label">خطة الربو (بكلماتك)</div>
    <div class="field"><label><i class="zd g"></i>الأخضر</label><textarea id="g">${esc(pl.green)}</textarea></div>
    <div class="field"><label><i class="zd y"></i>الأصفر</label><textarea id="y">${esc(pl.yellow)}</textarea></div>
    <div class="field"><label><i class="zd r"></i>الأحمر</label><textarea id="r">${esc(pl.red)}</textarea></div>
    <div class="label">خطوات الطوارئ</div>
    <div class="field"><textarea id="e" style="min-height:130px" placeholder="كل خطوة في سطر">${esc(em.steps.join('\n'))}</textarea><div class="hint">ما في قالب جرعات جاهز. اكتب الخاص بهالمريض.</div></div>
    <div class="label">البخاخات</div>
    <div class="card"><b>الوقائي</b><div class="field" style="margin-top:10px"><label>الاسم</label><input id="pn" value="${esc(pre.name)}"></div><div class="field"><label>الجرعة</label><input id="pd" value="${esc(pre.dose)}"></div><div class="field"><label>المواعيد</label><input id="pt" dir="ltr" value="${(pre.times || ['08:00', '20:00']).join(', ')}"><div class="hint">مثال: 08:00, 20:00</div></div></div>
    <div class="card"><b>الإنقاذ</b><div class="field" style="margin-top:10px"><label>الاسم</label><input id="rn" value="${esc(res.name)}"></div><div class="field"><label>متى وكم</label><input id="rd" value="${esc(res.dose)}"></div></div>
    <button class="btn" id="send" style="margin-top:16px">${ic('share')}احفظ وأرسل للأسرة</button>
    <p class="muted small" style="margin:8px 4px">الرابط يحمل الخطة نفسها، وما تنحفظ على أي سيرفر. كل إرسال إصدار جديد.</p>
    <button class="btn ghost" id="del" style="margin-top:6px;color:var(--sos);box-shadow:none;background:none">احذف المريض</button>
  </div>`, () => {
    const collect = () => {
      p.name = $('#nm').value.trim(); p.allergy = $('#al').value.trim();
      p.plan = { green: $('#g').value.trim(), yellow: $('#y').value.trim(), red: $('#r').value.trim(), by: s.doctorName, at: St.now(), version: (p.version || 0) + 1 };
      p.emergency = { steps: $('#e').value.split('\n').map(x => x.trim()).filter(Boolean), by: s.doctorName, at: St.now(), version: (p.version || 0) + 1 };
      p.meds = [];
      if ($('#pn').value.trim()) p.meds.push({ id: 'pre', role: 'pre', name: $('#pn').value.trim(), dose: $('#pd').value.trim(), times: $('#pt').value.split(/[,،\s]+/).filter(x => /^\d{1,2}:\d{2}$/.test(x)).map(x => x.padStart(5, '0')), capacity: 120 });
      if ($('#rn').value.trim()) p.meds.push({ id: 'rescue', role: 'rescue', name: $('#rn').value.trim(), dose: $('#rd').value.trim(), times: [], capacity: 200 });
    };
    $('#send').onclick = async () => {
      collect(); if (!p.name) return toast('اكتب اسم المريض');
      p.version = (p.version || 0) + 1; p.sent = St.now(); St.save();
      const contacts = [{ n: 'الإسعاف', p: '999' }, ...(s.clinicPhone ? [{ n: 'العيادة', p: s.clinicPhone }] : [])];
      const url = await St.makeLink({ t: 'doctor', from: s.doctorName, child: { name: p.name, allergy: p.allergy }, plan: p.plan, emergency: p.emergency, meds: p.meds, contacts });
      const text = `خطة ${p.name} من ${s.doctorName} في نَفَس. افتح الرابط واضغط «اعتمد الخطة»:\n${url}`;
      if (navigator.share) navigator.share({ title: 'نَفَس', text }).catch(() => {});
      else { await navigator.clipboard.writeText(text).catch(() => {}); }
      toast(`الإصدار ${p.version} جاهز للإرسال`);
    };
    $('#del').onclick = () => { s.patients = s.patients.filter(x => x.id !== id); St.save(); go('/home'); };
  });
}

route();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
