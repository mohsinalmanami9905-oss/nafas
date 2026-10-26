/* Salman 3D — one shared WebGL view that moves between host elements (.sal).
   Real mesh (Tencent HY 3D v3.1 → optimized), runtime skeleton (hips/chest/head),
   breathing, idle head motion, blinking eyelids and a mouth that opens with his recorded voice. */
import * as THREE from '../vendor/three.module.min.js';
import { GLTFLoader } from '../vendor/GLTFLoader.js';
import { MeshoptDecoder } from '../vendor/meshopt_decoder.js';
import { DecalGeometry } from '../vendor/DecalGeometry.js';
import { OrbitControls } from '../vendor/OrbitControls.js';

/* landmarks measured on the model (metres, feet at y=0, facing +z) */
const LM = {
  height: 1.1456,
  neck: [0, 0.862, -0.005], chest: [0, 0.60, 0], hips: [0, 0.34, 0],
  mouth: [-0.0007, 0.9080, 0.1150], eyeL: [-0.0449, 0.9730, 0.0975], eyeR: [0.0468, 0.9730, 0.0972],
};
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

let renderer, scene, camera, controls, rig = null, loading = null, host = null, raf = 0, failed = false;
const state = { frame: 'full', talk: null, breath: 0, breathTarget: -1, blink: 0, nextBlink: 2, hop: 0, look: 0, interacted: 0 };
let ENV = null;

function setupRenderer() {
  const canvas = document.createElement('canvas'); canvas.className = 's3d-canvas';
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(26, 1, 0.02, 20);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb9c4d2, 1.35));
  const key = new THREE.DirectionalLight(0xfff4e6, 2.1); key.position.set(1.2, 2.4, 2.6); scene.add(key);
  const fill = new THREE.DirectionalLight(0xdfe9ff, 0.7); fill.position.set(-2, 1.2, 1.5); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 1.1); rim.position.set(0, 2, -2.5); scene.add(rim);
  // soft contact shadow
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, 'rgba(16,35,58,.32)'); gr.addColorStop(1, 'rgba(16,35,58,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.36), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
  sh.rotation.x = -Math.PI / 2; sh.position.y = 0.002; scene.add(sh);
  controls = new OrbitControls(camera, canvas);
  controls.enablePan = false; controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.minPolarAngle = Math.PI * 0.32; controls.maxPolarAngle = Math.PI * 0.56; controls.rotateSpeed = 0.7;
  controls.addEventListener('start', () => { state.interacted = performance.now(); host && host.classList.add('touched'); });
  controls.addEventListener('end', () => { state.interacted = performance.now(); });
}

function canvasTex(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return { c, g: c.getContext('2d'), t }; }

async function load() {
  const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync('models/salman.glb');
  gltf.scene.updateMatrixWorld(true);
  let src; gltf.scene.traverse(o => { if (o.isMesh && !src) src = o; });
  const geo = src.geometry.clone();
  // de-quantize (meshopt/KHR_mesh_quantization stores int16) before baking the node transform
  for (const name of ['position', 'normal', 'tangent']) {
    const a = geo.attributes[name]; if (!a || a.array instanceof Float32Array) continue;
    const f = new Float32Array(a.count * a.itemSize);
    for (let i = 0; i < a.count; i++) for (let k = 0; k < a.itemSize; k++) f[i * a.itemSize + k] = a.getComponent(i, k);
    geo.setAttribute(name, new THREE.BufferAttribute(f, a.itemSize));
  }
  geo.applyMatrix4(src.matrixWorld);
  const pos = geo.attributes.position, n = pos.count;
  // ---- skeleton: hips → chest → head
  const hips = new THREE.Bone(), chest = new THREE.Bone(), head = new THREE.Bone();
  hips.position.set(...LM.hips); chest.position.set(0, LM.chest[1] - LM.hips[1], 0); head.position.set(LM.neck[0], LM.neck[1] - LM.chest[1], LM.neck[2]);
  hips.add(chest); chest.add(head);
  const si = new Uint16Array(n * 4), sw = new Float32Array(n * 4);
  // ---- jaw morph: lower lip + chin drop a little while the mouth opens
  const jaw = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const wh = ss(0.842, 0.888, y), wc = ss(0.42, 0.70, y) * (1 - wh), wp = 1 - wh - wc;
    si.set([0, 1, 2, 0], i * 4); sw.set([wp, wc, wh, 0], i * 4);
    if (z > 0.06 && y < 0.912 && y > 0.85 && Math.abs(x) < 0.07) {
      const f = Math.exp(-((x / 0.04) ** 2) - (((y - 0.893) / 0.02) ** 2)) * (1 - ss(0.903, 0.909, y));
      jaw[i * 3 + 1] = -0.0075 * f; jaw[i * 3 + 2] = -0.0015 * f;
    }
  }
  geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4));
  geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4));
  geo.morphAttributes.position = [new THREE.Float32BufferAttribute(jaw, 3)]; geo.morphTargetsRelative = true;
  const mat = src.material; mat.envMapIntensity = 1;
  const mesh = new THREE.SkinnedMesh(geo, mat); mesh.morphTargetInfluences = [0];
  const root = new THREE.Group(); root.add(hips); root.add(mesh);
  scene.add(root); root.updateMatrixWorld(true);
  mesh.bind(new THREE.Skeleton([hips, chest, head]));

  // ---- skin colour for eyelids (sampled from the texture just above the eye)
  const probe = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
  const rc = new THREE.Raycaster(); let skin = '#d59a78';
  try {
    const img = mat.map.image, cv = document.createElement('canvas'); cv.width = 256; cv.height = 256; const cg = cv.getContext('2d', { willReadFrequently: true }); cg.drawImage(img, 0, 0, 256, 256);
    const sample = (x, y) => { rc.set(new THREE.Vector3(x, y, 1), new THREE.Vector3(0, 0, -1)); const h = rc.intersectObject(probe)[0]; if (!h || !h.uv) return null; const d = cg.getImageData(Math.floor(h.uv.x * 255), Math.floor(h.uv.y * 255), 1, 1).data; return d; };
    const cs = [sample(-0.045, 0.989), sample(0.047, 0.989), sample(-0.02, 0.992), sample(0.02, 0.992)].filter(Boolean);
    if (cs.length) { const m = [0, 1, 2].map(k => Math.round(cs.reduce((a, d) => a + d[k], 0) / cs.length)); skin = `rgb(${m[0]},${m[1]},${m[2]})`; }
  } catch {}

  // ---- decals (projected on the face, carried by the head bone)
  const headInv = new THREE.Matrix4().copy(head.matrixWorld).invert();
  const decal = (p, size, tex, order) => {
    const g = new DecalGeometry(probe, new THREE.Vector3(...p), new THREE.Euler(0, 0, 0), new THREE.Vector3(...size));
    g.applyMatrix4(headInv);
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: tex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, roughness: 0.62, metalness: 0 }));
    m.renderOrder = order; m.visible = false; head.add(m); return m;
  };
  const mouthT = canvasTex(256, 160), lidL = canvasTex(128, 100), lidR = canvasTex(128, 100);
  const mouthM = decal(LM.mouth, [0.07, 0.044, 0.06], mouthT.t, 2);
  const eyeLM = decal(LM.eyeL, [0.054, 0.042, 0.05], lidL.t, 3), eyeRM = decal(LM.eyeR, [0.054, 0.042, 0.05], lidR.t, 3);
  rig = { root, hips, chest, head, mesh, mouthT, mouthM, lids: [[lidL, eyeLM], [lidR, eyeRM]], skin, rest: { hipsY: hips.position.y, chestY: chest.position.y } };
}

/* ---------- drawing ---------- */
function drawMouth(open, round) {
  const { g, c, t } = rig.mouthT; g.clearRect(0, 0, c.width, c.height);
  if (open < 0.04) { rig.mouthM.visible = false; return; }
  rig.mouthM.visible = true;
  const cx = 128, cy = 82, w = 50 + 22 * (1 - round) + 12 * open, h = 7 + 40 * open * (0.75 + 0.35 * round);
  g.save(); g.translate(cx, cy);
  // lips rim
  g.shadowColor = 'rgba(120,40,40,.45)'; g.shadowBlur = 6;
  g.fillStyle = '#c56f68'; g.beginPath(); g.ellipse(0, 1, w + 5, h + 5, 0, 0, Math.PI * 2); g.fill();
  g.shadowBlur = 0;
  // cavity
  g.beginPath(); g.ellipse(0, 1, w, h, 0, 0, Math.PI * 2); g.closePath(); g.save(); g.clip();
  const cav = g.createRadialGradient(0, 4, 2, 0, 4, w); cav.addColorStop(0, '#3a0f12'); cav.addColorStop(1, '#5a1a1d'); g.fillStyle = cav; g.fillRect(-w, -h, w * 2, h * 2 + 2);
  if (h > 12) { g.fillStyle = '#f4efe8'; g.beginPath(); g.ellipse(0, -h + 2, w * 0.78, Math.min(7, h * 0.28), 0, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#b8505a'; g.beginPath(); g.ellipse(0, h * 0.85, w * 0.62, h * 0.45, 0, 0, Math.PI * 2); g.fill();
  g.restore();
  // inner lip highlight
  g.strokeStyle = 'rgba(255,190,180,.35)'; g.lineWidth = 2; g.beginPath(); g.ellipse(0, 1, w + 2, h + 2, 0, Math.PI * 0.15, Math.PI * 0.85); g.stroke();
  g.restore(); t.needsUpdate = true;
}
function drawLids(k) {
  for (const [L, m] of rig.lids) {
    const { g, c, t } = L; g.clearRect(0, 0, c.width, c.height);
    if (k < 0.05) { m.visible = false; continue; }
    m.visible = true;
    const cx = 64, cy = 52, rx = 50, ry = 37, edge = cy - ry + 2 * ry * k;
    g.save(); g.beginPath(); g.ellipse(cx, cy, rx + 2, ry + 3, 0, 0, Math.PI * 2); g.clip();
    g.fillStyle = rig.skin; g.beginPath(); g.moveTo(0, 0); g.lineTo(128, 0); g.lineTo(128, edge - 4); g.quadraticCurveTo(cx, edge + 10 * k, 0, edge - 4); g.closePath(); g.fill();
    g.strokeStyle = '#2a1712'; g.lineWidth = 3.5; g.beginPath(); g.moveTo(6, edge - 4); g.quadraticCurveTo(cx, edge + 10 * k, 122, edge - 4); g.stroke();
    g.restore(); t.needsUpdate = true;
  }
}

/* ---------- framing ---------- */
const FRAMES = { full: { y: 0.585, d: 2.7 }, bust: { y: 0.88, d: 1.4 }, face: { y: 0.945, d: 0.7 } };
function applyFrame(f, snap) {
  const F = FRAMES[f] || FRAMES.full; state.frame = f;
  controls.target.set(0, F.y, 0); controls.minDistance = F.d * 0.6; controls.maxDistance = F.d * 1.35;
  if (snap) { camera.position.set(0, F.y + 0.04, F.d); controls.update(); }
}
function resize() {
  if (!host) return; const r = host.getBoundingClientRect(); const w = Math.max(1, r.width), h = Math.max(1, r.height);
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
}

/* ---------- loop ---------- */
let last = performance.now();
function tick(now) {
  raf = requestAnimationFrame(tick);
  if (state.cap) { if (!state.cap.go) return; state.cap.go = false; now = state.cap.t * 1000; }
  step(now);
}
function step(now) {
  if (!host || !document.body.contains(host)) { attachBest(); if (!host) return; }
  const dt = Math.min(0.05, (now - last) / 1000); last = now; const t = now / 1000;
  if (rig) {
    // breathing: idle rhythm, or the coach's in/out phase
    const idleB = (Math.sin(t * 1.6) * 0.5 + 0.5) * 0.45;
    state.breath += ((state.breathTarget >= 0 ? state.breathTarget : idleB) - state.breath) * Math.min(1, dt * 2.2);
    rig.chest.position.y = rig.rest.chestY + 0.004 * state.breath;
    rig.chest.rotation.x = -0.025 * state.breath;
    // voice
    let open = 0, round = 0.5, nod = 0;
    const a = state.talk;
    if (a && !a.el.paused && !a.el.ended) {
      const i = Math.floor(a.el.currentTime * 50);
      if (a.env && i < a.env.length) { open = a.env[i]; round = a.rnd[i]; nod = (a.env[Math.max(0, i - 3)] || 0); }
      else if (!a.env) { open = Math.max(0, Math.sin(t * 13) * 0.6 + Math.sin(t * 7.3) * 0.4); }
    }
    state.open = (state.open || 0) + (open - (state.open || 0)) * Math.min(1, dt * 22);
    state.nod = (state.nod || 0) + (nod - (state.nod || 0)) * Math.min(1, dt * 6);
    rig.mesh.morphTargetInfluences[0] = state.open;
    drawMouth(state.open, round);
    // head: gentle look-around + nods while talking
    const talking = state.open > 0.05 || (a && !a.el.paused);
    rig.head.rotation.y = 0.07 * Math.sin(t * 0.37) + 0.03 * Math.sin(t * 0.91) + (talking ? 0.02 * Math.sin(t * 2.3) : 0);
    rig.head.rotation.x = 0.025 * Math.sin(t * 0.53) - 0.05 * state.nod + 0.012 * state.breath;
    rig.head.rotation.z = 0.035 * Math.sin(t * 0.29 + 1);
    rig.hips.rotation.z = 0.008 * Math.sin(t * 0.7); rig.hips.rotation.y = 0.03 * Math.sin(t * 0.23);
    // proud hop
    if (state.hop > 0) { state.hop = Math.max(0, state.hop - dt); const p = 1 - state.hop / 0.9; rig.root.position.y = Math.max(0, Math.sin(p * Math.PI * 2)) * 0.035 * (1 - p); } else rig.root.position.y = 0;
    // blink
    state.nextBlink -= dt;
    if (state.nextBlink <= 0) { state.blink = 0.16; state.nextBlink = 2.2 + Math.random() * 3.5; if (Math.random() < 0.18) state.nextBlink = 0.32; }
    let k = 0; if (state.blink > 0) { state.blink = Math.max(0, state.blink - dt); const p = 1 - state.blink / 0.16; k = Math.sin(p * Math.PI); }
    drawLids(k);
  }
  // return to the front a few seconds after the finger lets go
  if (performance.now() - state.interacted > 4000) {
    const F = FRAMES[state.frame]; const az = controls.getAzimuthalAngle();
    if (Math.abs(az) > 0.002) { const off = camera.position.clone().sub(controls.target); off.applyAxisAngle(new THREE.Vector3(0, 1, 0), -az * Math.min(1, dt * 1.6)); camera.position.copy(controls.target).add(off); }
    const d = camera.position.distanceTo(controls.target); if (Math.abs(d - F.d) > 0.005) camera.position.sub(controls.target).setLength(d + (F.d - d) * Math.min(1, dt * 1.5)).add(controls.target);
  }
  controls.update(); renderer.render(scene, camera);
}

/* ---------- public ---------- */
function attachBest() {
  const hosts = [...document.querySelectorAll('.sal[data-s3d]')].filter(h => h.offsetParent !== null);
  if (!hosts.length) { host = null; return; }
  hosts.sort((a, b) => (b.getBoundingClientRect().width * b.getBoundingClientRect().height) - (a.getBoundingClientRect().width * a.getBoundingClientRect().height));
  mountIn(hosts[0]);
}
function mountIn(h) {
  if (host === h) return; host = h;
  h.prepend(renderer.domElement); applyFrame(h.dataset.frame || 'full', true); resize();
  h.classList.add('s3d-on');
  if (rig) h.classList.add('s3d-ready');
}
export async function init() {
  if (failed) return false;
  if (!renderer) {
    try { setupRenderer(); } catch { failed = true; return false; }
    window.addEventListener('resize', resize);
    new ResizeObserver(() => resize()).observe(document.body);
    raf = requestAnimationFrame(tick);
    fetch('assets/voice/env.json').then(r => r.json()).then(j => { ENV = j; }).catch(() => {});
  }
  if (!loading) loading = load().then(() => { document.querySelectorAll('.sal.s3d-on').forEach(h => h.classList.add('s3d-ready')); }).catch(e => { console.warn('salman3d', e); failed = true; });
  attachBest();
  return true;
}
export function refresh() { if (renderer) { host = null; attachBest(); } }
export function speak(el, id) {
  let env = null, rnd = null;
  const e = ENV && ENV[id];
  if (e) { const [a, b] = e.split('|'); env = Float32Array.from(a, c => +c / 9); rnd = Float32Array.from(b, c => +c / 9); }
  state.talk = { el, env, rnd };
}
export function breath(phase) { state.breathTarget = phase === 'in' ? 1 : phase === 'out' ? 0 : -1; }
export function proud() { state.hop = 0.9; }
/* deterministic frame stepping for recording demo videos */
export function capture(t, audioT, id) {
  if (!state.cap) { state.cap = { t: 0 }; last = 0; scene.background = new THREE.Color(0xeef3f8); }
  if (id) { if (!state.talk || state.talk.id !== id) { speak({ paused: false, ended: false, currentTime: 0 }, id); state.talk.id = id; } state.talk.el.currentTime = audioT; state.talk.el.paused = audioT < 0; }
  else state.talk = null;
  state.cap.t = t; step(t * 1000);
  return renderer.domElement.toDataURL('image/jpeg', 0.92);
}
