// Demo data store (localStorage). Everything the doctor writes is shown verbatim; the app never calculates doses.
const KEY = 'nafas_demo_v1';
const now = () => Date.now();
const H = 3600e3, D = 24 * H;

function seed() {
  const t = now();
  return {
    patient: { name: 'سلمان', age: '6 سنوات', weight: '21 كغ (للعرض فقط)', allergy: 'لا توجد حساسية دوائية معروفة', doctor: 'د. ريم الصفار — استشارية صدرية أطفال' },
    me: 'mom',
    family: [
      { id: 'mom', name: 'أم سلمان', role: 'ولي الأمر الرئيسي', phone: '+973 3xxx 1122', devices: 2 },
      { id: 'dad', name: 'أبو سلمان', role: 'مقدم رعاية', phone: '+973 3xxx 4455', devices: 1 },
      { id: 'grandma', name: 'الجدة أم جاسم', role: 'مقدم رعاية', phone: '+973 3xxx 7788', devices: 1 },
    ],
    meds: [
      { id: 'pre', role: 'وقائي', name: 'بخاخ وقائي (كورتيزون مستنشق)', dose: 'بختين بالقمع', times: ['08:00', '20:00'], capacity: 120, used: 46, opened: t - 23 * D, expiryNote: 'حسب نشرة المنتج المسجل' },
      { id: 'rescue', role: 'إنقاذ', name: 'فنتولين (سالبيوتامول)', dose: 'كما في خطة الطبيب أدناه', times: [], capacity: 200, used: 31, opened: t - 40 * D, expiryNote: 'حسب نشرة المنتج المسجل' },
    ],
    plan: {
      version: 3, by: 'د. ريم الصفار', at: t - 9 * D,
      green: 'يتنفس بارتياح، ينام الليل كامل، يلعب طبيعي.\nاستمر على البخاخ الوقائي بختين بالقمع الصبح والمساء.',
      yellow: 'كحة أو صفير أو ضيق بسيط، أو صحى بالليل من الكحة.\nأعطه الفنتولين حسب ما وضّحته لكم في العيادة، واستمر على الوقائي، وتواصلوا مع العيادة إذا تكرر.',
      red: 'تعب شديد في التنفس، ما يقدر يتكلم جملة كاملة، شفايفه زرقاء، أو الفنتولين ما فاد.\nاتصلوا 999 فوراً واتبعوا خطة الطوارئ.',
    },
    emergency: {
      version: 2, by: 'د. ريم الصفار', at: t - 9 * D,
      steps: ['اتصلوا بالإسعاف 999.', 'خلّوه جالس ومرتاح، لا تمددونه.', 'استخدموا الفنتولين بالقمع حسب التعليمات المكتوبة لكم من العيادة.', 'لا تتركونه بروحه لين يوصل الإسعاف.', 'خذوا معكم البخاخات وهذي الخطة.'],
      contacts: [{ n: 'الإسعاف', p: '999' }, { n: 'عيادة الصدرية', p: '+973 1700 0000' }],
    },
    events: [
      { type: 'dose', med: 'pre', at: t - 13 * H, by: 'mom', mode: 'لحظي', status: 'أُعطي' },
      { type: 'rescue', at: t - 30 * H, by: 'dad', mode: 'لحظي', puffs: 2, reason: 'بعد اللعب' },
      { type: 'dose', med: 'pre', at: t - 25 * H, by: 'grandma', mode: 'لحظي', status: 'أُعطي' },
      { type: 'symptom', at: t - 31 * H, by: 'dad', mode: 'متأخر', kind: 'كحة', severity: 'خفيفة', minutes: 12, tags: ['غبار'] },
      { type: 'check', at: t - 10 * H, by: 'mom', mode: 'لحظي', night: false, activity: false },
      { type: 'dose', med: 'pre', at: t - 37 * H, by: 'mom', mode: 'لحظي', status: 'أُعطي' },
      { type: 'rescue', at: t - 4 * D, by: 'nursery', mode: 'من الحضانة', puffs: 2, reason: 'كحة في الحصة' },
    ],
    notes: [{ by: 'د. ريم الصفار', at: t - 9 * D, text: 'تم تعديل الخطة بعد الزيارة. هذي الرسائل ليست للطوارئ، والرد قد لا يكون فوري.' }],
    stamps: 9,
    doctorPatients: [
      { name: 'سلمان', age: 6, last: t - 10 * H, rescueWeek: 2, me: true },
      { name: 'نورة', age: 9, last: t - 2 * H, rescueWeek: 0 },
      { name: 'يوسف', age: 4, last: t - 3 * D, rescueWeek: 5 },
      { name: 'مريم', age: 12, last: t - 26 * H, rescueWeek: 1 },
      { name: 'حمد', age: 7, last: t - 6 * H, rescueWeek: 0 },
    ],
    versions: [],
    prefs: { big: false, night: false },
  };
}

let S;
export function load() {
  try { S = JSON.parse(localStorage.getItem(KEY)) || seed(); } catch { S = seed(); }
  return S;
}
export function save() { localStorage.setItem(KEY, JSON.stringify(S)); window.dispatchEvent(new Event('nafas:change')); }
export function reset() { S = seed(); save(); }
export function get() { return S || load(); }
export function add(ev) { S.events.unshift({ at: now(), by: S.me, mode: 'لحظي', ...ev }); save(); }
export const who = id => ({ nursery: 'الحضانة' }[id] || (get().family.find(f => f.id === id) || {}).name || id);

export function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString('ar-BH', { hour: 'numeric', minute: '2-digit', numberingSystem: 'latn' });
}
export function fmtDay(ts) {
  const d = new Date(ts), n = new Date();
  const days = Math.floor((new Date(n.toDateString()) - new Date(d.toDateString())) / D);
  if (days === 0) return 'اليوم';
  if (days === 1) return 'أمس';
  return d.toLocaleDateString('ar-BH', { weekday: 'long', day: 'numeric', month: 'long', numberingSystem: 'latn' });
}
export function ago(ts) {
  const m = Math.round((now() - ts) / 60000);
  if (m < 1) return 'الحين';
  if (m < 60) return `قبل ${m} دقيقة`;
  const h = Math.round(m / 60);
  if (h < 24) return h === 1 ? 'قبل ساعة' : h === 2 ? 'قبل ساعتين' : `قبل ${h} ساعات`;
  const d = Math.round(h / 24);
  return d === 1 ? 'أمس' : d === 2 ? 'قبل يومين' : `قبل ${d} أيام`;
}
export function weekCount(type) {
  return get().events.filter(e => e.type === type && now() - e.at < 7 * D).reduce((a, e) => a + (e.puffs || 1), 0);
}
export function nextDose() {
  const m = get().meds.find(x => x.id === 'pre'); const d = new Date();
  for (let k = 0; k < 2; k++) for (const t of m.times) {
    const [hh, mm] = t.split(':').map(Number); const c = new Date(d); c.setDate(d.getDate() + k); c.setHours(hh, mm, 0, 0);
    if (c > d) return c.getTime();
  }
}
