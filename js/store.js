// نَفَس — on-device store. Nothing leaves the phone unless the user shares a link himself.
const KEY = 'nafas_v2';
const H = 3600e3, D = 24 * H;
export const now = () => Date.now();

const blank = () => ({
  v: 2, role: null, onboarded: false,
  child: { name: '', age: '', allergy: '' },
  plan: null,          // {green, yellow, red, by, at, version, source}
  emergency: null,     // {steps:[], by, at, version}
  contacts: [{ n: 'الإسعاف', p: '999' }],
  meds: [],            // {id, role:'pre'|'rescue', name, dose, times:[], capacity, used, opened}
  events: [],          // {id, type, at, by, ...}
  family: [],          // {id, name, relation}
  me: 'أنا',
  stamps: [],          // day strings with at least one record
  prefs: { big: false, night: false, voice: true },
  patients: [],        // doctor mode
});

let S;
export function load() { try { S = Object.assign(blank(), JSON.parse(localStorage.getItem(KEY)) || {}); } catch { S = blank(); } return S; }
export function get() { return S || load(); }
export function save() { localStorage.setItem(KEY, JSON.stringify(S)); }
export function wipe() { localStorage.removeItem(KEY); S = blank(); }
export const uid = () => Math.random().toString(36).slice(2, 10);

export function addEvent(ev) {
  const e = { id: uid(), at: now(), by: S.me, ...ev }; S.events.unshift(e);
  const day = new Date(e.at).toDateString(); if (!S.stamps.includes(day)) S.stamps.push(day);
  save(); return e;
}
export function removeEvent(id) {
  const e = S.events.find(x => x.id === id); if (!e) return;
  const m = S.meds.find(x => x.id === e.med); if (m && e.puffs) m.used = Math.max(0, m.used - e.puffs);
  S.events = S.events.filter(x => x.id !== id); save();
}
export const pre = () => S.meds.find(m => m.role === 'pre');
export const rescue = () => S.meds.find(m => m.role === 'rescue');

// next scheduled preventer slot; "due" from 60 min before to 3 h after, unless already handled
export function doseSlot() {
  const m = pre(); if (!m || !m.times.length) return null;
  const t = now(), slots = [];
  for (let k = -1; k <= 1; k++) for (const s of m.times) {
    const [hh, mm] = s.split(':').map(Number); const d = new Date(); d.setDate(d.getDate() + k); d.setHours(hh, mm, 0, 0); slots.push(d.getTime());
  }
  slots.sort((a, b) => a - b);
  const done = s => S.events.some(e => e.type === 'dose' && e.slot === s);
  const due = slots.find(s => t >= s - H && t <= s + 3 * H && !done(s));
  if (due) return { at: due, due: true, late: t > due + 15 * 60e3 };
  return { at: slots.find(s => s > t && !done(s)), due: false };
}

export const fmtTime = ts => new Date(ts).toLocaleTimeString('ar-BH', { hour: 'numeric', minute: '2-digit', numberingSystem: 'latn' });
export function fmtDay(ts) {
  const a = new Date(new Date(ts).toDateString()), b = new Date(new Date().toDateString());
  const d = Math.round((b - a) / D);
  if (d === 0) return 'اليوم'; if (d === 1) return 'أمس'; if (d === -1) return 'باجر';
  return new Date(ts).toLocaleDateString('ar-BH', { weekday: 'long', day: 'numeric', month: 'long', numberingSystem: 'latn' });
}
export function ago(ts) {
  const m = Math.round((now() - ts) / 60000);
  if (m < 1) return 'الحين'; if (m < 60) return m <= 10 ? `قبل ${m} دقايق` : `قبل ${m} دقيقة`;
  const h = Math.round(m / 60); if (h < 24) return h === 1 ? 'قبل ساعة' : h === 2 ? 'قبل ساعتين' : h <= 10 ? `قبل ${h} ساعات` : `قبل ${h} ساعة`;
  const d = Math.round(h / 24); return d === 1 ? 'أمس' : d === 2 ? 'قبل يومين' : `قبل ${d} أيام`;
}
export const puffWord = n => n === 1 ? 'بخة وحدة' : n === 2 ? 'بختين' : n <= 10 ? `${n} بخات` : `${n} بخة`;
export const weekPuffs = () => S.events.filter(e => e.type === 'rescue' && now() - e.at < 7 * D).reduce((a, e) => a + e.puffs, 0);

/* ---------- doctor link: the plan travels inside the link (#/import?d=...) ---------- */
async function deflate(str) {
  if (!('CompressionStream' in window)) return 'u' + btoa(unescape(encodeURIComponent(str)));
  const cs = new Blob([str]).stream().pipeThrough(new CompressionStream('deflate-raw'));
  const buf = new Uint8Array(await new Response(cs).arrayBuffer());
  let s = ''; buf.forEach(b => s += String.fromCharCode(b)); return 'z' + btoa(s);
}
async function inflate(p) {
  const b64 = p.slice(1).replace(/-/g, '+').replace(/_/g, '/');
  if (p[0] === 'u') return decodeURIComponent(escape(atob(b64)));
  const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const ds = new Blob([bin]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return await new Response(ds).text();
}
export async function makeLink(payload) {
  const p = (await deflate(JSON.stringify(payload))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return location.origin + location.pathname + '#/import?d=' + p;
}
export async function readLink(p) { return JSON.parse(await inflate(p)); }

/* ---------- iPhone calendar reminders (.ics with alarms; no child or drug name on the lock screen) ---------- */
export function icsFor(times) {
  const pad = n => String(n).padStart(2, '0'); const d = new Date();
  const day = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const ev = times.map((t, i) => {
    const [hh, mm] = t.split(':');
    return ['BEGIN:VEVENT', `UID:nafas-${day}-${i}@nafas.app`, `DTSTAMP:${day}T000000Z`, `DTSTART:${day}T${hh}${mm}00`, 'DURATION:PT10M', 'RRULE:FREQ=DAILY',
      'SUMMARY:نَفَس — موعد الجرعة', 'DESCRIPTION:افتح نَفَس وأكّد الجرعة', 'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:موعد الجرعة', 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT'].join('\r\n');
  });
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Nafas//AR', 'CALSCALE:GREGORIAN', ...ev, 'END:VCALENDAR'].join('\r\n');
}
