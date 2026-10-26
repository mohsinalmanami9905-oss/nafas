/* Salman 3D — one shared WebGL view that moves between host elements (.sal).
   Real mesh (Tencent HY 3D v3.1) with a sculpted mouth (cut lips, teeth, tongue, cavity) and morph targets
   jawOpen/mouthWide/mouthRound/mouthPress/smile; runtime skeleton for breathing and head motion; lip-sync from Rhubarb cues. */
import * as THREE from '../vendor/three.module.min.js';
import { GLTFLoader } from '../vendor/GLTFLoader.js';
import { MeshoptDecoder } from '../vendor/meshopt_decoder.js';
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


async function load() {
  const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync('models/salman.glb');
  gltf.scene.updateMatrixWorld(true);
  const srcs = []; gltf.scene.traverse(o => { if (o.isMesh) srcs.push(o); });
  // ---- skeleton: hips → chest → head (mouth shapes are morph targets authored in Blender)
  const hips = new THREE.Bone(), chest = new THREE.Bone(), head = new THREE.Bone();
  hips.position.set(...LM.hips); chest.position.set(0, LM.chest[1] - LM.hips[1], 0); head.position.set(LM.neck[0], LM.neck[1] - LM.chest[1], LM.neck[2]);
  hips.add(chest); chest.add(head);
  const root = new THREE.Group(); root.add(hips); scene.add(root); root.updateMatrixWorld(true);
  const skel = new THREE.Skeleton([hips, chest, head]); const meshes = [];
  const deq = (a) => { if (!a || a.array instanceof Float32Array) return a; const f = new Float32Array(a.count * a.itemSize); for (let i = 0; i < a.count; i++) for (let k = 0; k < a.itemSize; k++) f[i * a.itemSize + k] = a.getComponent(i, k); return new THREE.BufferAttribute(f, a.itemSize); };
  for (const src of srcs) {
    const geo = src.geometry.clone();
    for (const n of ['position', 'normal', 'tangent']) if (geo.attributes[n]) geo.setAttribute(n, deq(geo.attributes[n]));
    for (const n in geo.morphAttributes) geo.morphAttributes[n] = geo.morphAttributes[n].map(deq);
    geo.applyMatrix4(src.matrixWorld);
    const pos = geo.attributes.position, n = pos.count, si = new Uint16Array(n * 4), sw = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) {
      const y = pos.getY(i); const wh = ss(0.842, 0.888, y), wc = ss(0.42, 0.70, y) * (1 - wh);
      si.set([0, 1, 2, 0], i * 4); sw.set([1 - wh - wc, wc, wh, 0], i * 4);
    }
    geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4)); geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4));
    const m = new THREE.SkinnedMesh(geo, src.material); m.morphTargetDictionary = src.morphTargetDictionary; m.morphTargetInfluences = src.morphTargetInfluences ? src.morphTargetInfluences.slice() : undefined;
    root.add(m); m.bind(skel); meshes.push(m);
  }
  rig = { root, hips, chest, head, meshes, w: { jawOpen: 0, mouthWide: 0, mouthRound: 0, mouthPress: 0, smile: 0 }, rest: { hipsY: hips.position.y, chestY: chest.position.y } };
}
/* Rhubarb mouth cues → morph weights (A=M/B/P closed … D=wide open, E=O, F=U/W, X=rest) */
const SHAPES = {
  A: { mouthPress: 1 }, B: { jawOpen: .12, mouthWide: .35 }, C: { jawOpen: .42, mouthWide: .55 }, D: { jawOpen: .85, mouthWide: .1 },
  E: { jawOpen: .4, mouthRound: .55 }, F: { jawOpen: .14, mouthRound: 1 }, G: { jawOpen: .08, mouthPress: .4, mouthWide: .2 }, H: { jawOpen: .45 }, X: {},
};
function setMorphs() { for (const m of rig.meshes) { const d = m.morphTargetDictionary; if (!d) continue; for (const k in rig.w) if (d[k] !== undefined) m.morphTargetInfluences[d[k]] = rig.w[k]; } }

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
    // voice → mouth shapes (cue lookahead + smoothing = coarticulation)
    let target = SHAPES.X; let speaking = false;
    const a = state.talk;
    if (a && !a.el.paused && !a.el.ended && a.cues) {
      speaking = true; const tt = a.el.currentTime + 0.035; let cur = 'X';
      for (let i = 0; i < a.cues.length && a.cues[i][1] <= tt; i++) cur = a.cues[i][0];
      target = SHAPES[cur] || SHAPES.X;
    }
    const rate = Math.min(1, dt * 20);
    for (const k in rig.w) { const goal = (target[k] || 0) + (k === 'smile' ? (speaking ? 0.15 : 0.3) : 0); rig.w[k] += (goal - rig.w[k]) * rate; }
    setMorphs();
    state.nod = (state.nod || 0) + ((rig.w.jawOpen > 0.3 ? 1 : 0) - (state.nod || 0)) * Math.min(1, dt * 3);
    // head: gentle look-around + nods while talking
    const talking = speaking;
    rig.head.rotation.y = 0.07 * Math.sin(t * 0.37) + 0.03 * Math.sin(t * 0.91) + (talking ? 0.02 * Math.sin(t * 2.3) : 0);
    rig.head.rotation.x = 0.025 * Math.sin(t * 0.53) - 0.025 * state.nod + 0.012 * state.breath;
    rig.head.rotation.z = 0.035 * Math.sin(t * 0.29 + 1);
    rig.hips.rotation.z = 0.008 * Math.sin(t * 0.7); rig.hips.rotation.y = 0.03 * Math.sin(t * 0.23);
    // proud hop
    if (state.hop > 0) { state.hop = Math.max(0, state.hop - dt); const p = 1 - state.hop / 0.9; rig.root.position.y = Math.max(0, Math.sin(p * Math.PI * 2)) * 0.035 * (1 - p); } else rig.root.position.y = 0;
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
    fetch('assets/voice/visemes.json').then(r => r.json()).then(j => { ENV = j; }).catch(() => {});
  }
  if (!loading) loading = load().then(() => { document.querySelectorAll('.sal.s3d-on').forEach(h => h.classList.add('s3d-ready')); }).catch(e => { console.warn('salman3d', e); failed = true; });
  attachBest();
  return true;
}
export function refresh() { if (renderer) { host = null; attachBest(); } }
export function speak(el, id) {
  let cues = null; const e = ENV && ENV[id];
  if (e) cues = e.match(/[A-HX]\d{4}/g).map(c => [c[0], +c.slice(1) / 100]);
  state.talk = { el, cues };
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
