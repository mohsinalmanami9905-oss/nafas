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
    if (src.material.map && !src.material.userData.lids) installLids(src.material);
    const m = new THREE.SkinnedMesh(geo, src.material); m.morphTargetDictionary = src.morphTargetDictionary; m.morphTargetInfluences = src.morphTargetInfluences ? src.morphTargetInfluences.slice() : undefined;
    root.add(m); m.bind(skel); meshes.push(m);
  }
  rig = { root, hips, chest, head, meshes, w: { jawOpen: 0, mouthWide: 0, mouthRound: 0, mouthPress: 0, smile: 0, mouthSmile: 0, mouthFrown: 0, cheekRaise: 0, browUp: 0, browInnerUp: 0, browDown: 0 }, rest: { hipsY: hips.position.y, chestY: chest.position.y } };
}
/* Blink: the painted eyes are covered by the skin of a seamless closed-eye texture (projected from the front),
   the upper lid edge sweeps down with a lash line while the lower lid rises a little — like a drawn cartoon lid. */
const LID = { uBlink: { value: 0 }, uLidTex: { value: null } };
function installLids(mat) {
  mat.userData.lids = true;
  const tex = new THREE.TextureLoader().load('assets/salman_lids.webp'); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; LID.uLidTex.value = tex;
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uBlink = LID.uBlink; sh.uniforms.uLidTex = LID.uLidTex;
    sh.vertexShader = 'varying vec3 vRest; varying vec3 vAx; varying vec3 vAy; varying vec3 vAz;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n  vRest = position; vAx = normalize(normalMatrix * vec3(1.,0.,0.)); vAy = normalize(normalMatrix * vec3(0.,1.,0.)); vAz = normalize(normalMatrix * vec3(0.,0.,1.));');
    sh.fragmentShader = 'varying vec3 vRest; varying vec3 vAx; varying vec3 vAy; varying vec3 vAz;\nuniform float uBlink;\nuniform sampler2D uLidTex;\n' + sh.fragmentShader.replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
  if (lidK > 0.001) normal = normalize(mix(normal, normalize(vAx * lidN.x + vAy * lidN.y + vAz * lidN.z), lidK * 0.6));`).replace('#include <map_fragment>', `#include <map_fragment>
  float lidK = 0.0; vec3 lidN = vec3(0.0, 0.0, 1.0);
  if (uBlink > 0.002 && vRest.z > 0.05 && vRest.y > 0.94 && vRest.y < 1.01) {
    vec4 E[2]; E[0] = vec4(-0.0452, 0.9752, 0.0250, 0.0215); E[1] = vec4(0.0466, 0.9752, 0.0255, 0.0215);
    for (int i = 0; i < 2; i++) {
      float u = (vRest.x - E[i].x) / (E[i].z * 1.26);
      if (abs(u) < 1.0) {
        float w = sqrt(1.0 - u * u);
        float wl = sqrt(max(0.0, 1.0 - u * u * 1.12)); float top = E[i].y + E[i].w * 0.92 * wl, bot = E[i].y - E[i].w * 1.08 * w, cl = E[i].y - E[i].w * 0.50 * wl;
        float edge = mix(top, cl, uBlink), low = mix(bot, cl, uBlink);
        float aa = 0.00035;
        // only the band the lid actually covers: from the lid edge up to the open-eye top, and the lower lid band
        float upper = smoothstep(edge - aa, edge + aa, vRest.y) * (1.0 - smoothstep(top - 0.0002, top + 0.0012, vRest.y));
        float lower = (1.0 - smoothstep(low - aa, low + aa, vRest.y)) * smoothstep(bot - 0.0012, bot + 0.0002, vRest.y);
        float side = 1.0 - smoothstep(0.93, 1.0, abs(u));
        float lside = 1.0 - smoothstep(0.70, 0.86, abs(u));
        float k = max(upper, lower) * side;
        vec2 luv = vec2((vRest.x + 0.10) / 0.20, (vRest.y - 0.925) / 0.10);
        vec3 lid = texture2D(uLidTex, luv).rgb * 0.9;
        diffuseColor.rgb = mix(diffuseColor.rgb, lid, k);
        float cover = (1.0 - smoothstep(0.85, 1.0, abs(u))) * smoothstep(bot - 0.002, bot + 0.001, vRest.y) * (1.0 - smoothstep(top - 0.001, top + 0.006, vRest.y));
        if (cover * uBlink > lidK) { lidK = cover * smoothstep(0.15, 0.7, uBlink); lidN = normalize(vec3((vRest.x - E[i].x) / (E[i].z * 2.2), (vRest.y - E[i].y) / (E[i].w * 2.2), 1.0)); }
        float th = 0.0009 * (0.5 + 0.5 * wl) * smoothstep(0.04, 0.2, uBlink);
        float lash = (1.0 - smoothstep(th * 0.6, th, abs(vRest.y - edge))) * lside;
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.045, 0.025, 0.02), lash * 0.92);
      }
    }
  }`);
  };
  mat.needsUpdate = true;
}
/* Rhubarb mouth cues → morph weights (A=M/B/P closed … D=wide open, E=O, F=U/W, X=rest) */
const SHAPES = {
  A: { mouthPress: 1 }, B: { jawOpen: .12, mouthWide: .35 }, C: { jawOpen: .42, mouthWide: .55 }, D: { jawOpen: .7, mouthWide: .1 },
  E: { jawOpen: .35, mouthRound: .8 }, F: { jawOpen: .14, mouthRound: 1 }, G: { jawOpen: .08, mouthPress: .4, mouthWide: .2 }, H: { jawOpen: .45 }, X: {},
};
/* emotion per line: the whole face holds one feeling, lip-sync rides on top */
const MOODS = {
  happy:   { mouthSmile: .55, cheekRaise: .55, browUp: .25, smile: .25 },
  excited: { mouthSmile: .75, cheekRaise: .75, browUp: .55, smile: .3 },
  proud:   { mouthSmile: .65, cheekRaise: .6, browUp: .35, smile: .3 },
  warm:    { mouthSmile: .35, cheekRaise: .3, browUp: .1, smile: .2 },
  calm:    { mouthSmile: .2, cheekRaise: .15, smile: .2 },
  reassure:{ mouthSmile: .15, browInnerUp: .45, smile: .1 },
  idle:    { mouthSmile: .12, cheekRaise: .08, smile: .3 },
};
const LINE_MOOD = { welcome1: 'excited', welcome2: 'warm', welcome3: 'happy', breathe_start: 'calm', follow: 'calm', in: 'calm', out: 'calm', stop: 'reassure',
  hello_morning: 'excited', hello_evening: 'happy', dose_done: 'proud', dose_time: 'warm', breathe_done: 'excited', stamp: 'excited', emergency: 'reassure' };
const moodOf = id => { if (!id) return 'idle'; const b = id.replace(/_[mf]$/, ''); return LINE_MOOD[b] || (/^n\d+$/.test(b) ? 'calm' : 'warm'); };
function setMorphs() {
  LID.uBlink.value = rig.blink || 0;
  for (const m of rig.meshes) { const d = m.morphTargetDictionary; if (!d) continue;
    for (const k in rig.w) if (d[k] !== undefined) m.morphTargetInfluences[d[k]] = rig.w[k];
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
    // voice → mouth shapes (sound shape hit ~70 ms early, fast attack / softer release)
    let target = SHAPES.X, speaking = false, emph = 0;
    const a = state.talk;
    if (a && !a.el.paused && !a.el.ended && a.cues) {
      speaking = true; const tt = a.el.currentTime + 0.07; let cur = 'X', ci = -1;
      for (let i = 0; i < a.cues.length && a.cues[i][1] <= tt; i++) { cur = a.cues[i][0]; ci = i; }
      target = SHAPES[cur] || SHAPES.X;
      if ((cur === 'D' || cur === 'C') && ci >= 0) emph = 1 - Math.min(1, (tt - a.cues[ci][1]) / 0.35);  // stressed syllable
    }
    // mood: the line's feeling, held for the whole line; idle warmth otherwise
    const moodName = speaking ? moodOf(a.id) : (state.hop > 0 ? 'proud' : 'idle');
    const mood = MOODS[moodName];
    state.emph = (state.emph || 0) + (emph - (state.emph || 0)) * Math.min(1, dt * 10);
    for (const k in rig.w) {
      const lip = target[k] || 0, md = mood[k] || 0;
      let goal = Math.max(lip, md * (k === 'mouthSmile' ? (1 - (target.mouthRound || 0)) : 1));
      if (k === 'browUp') goal += 0.35 * state.emph;
      const sp = (goal > rig.w[k] ? 26 : 14) * (k.startsWith('brow') || k === 'cheekRaise' || k === 'mouthSmile' ? 0.35 : 1);
      rig.w[k] += (goal - rig.w[k]) * Math.min(1, dt * sp);
    }
    // blink: 2–6 s apart, sometimes double, also on bigger head turns; 50 ms close, 40 ms hold, 120 ms open
    state.nextBlink -= dt;
    const turn = Math.abs(rig.head.rotation.y - (state.lastYaw || 0)); state.lastYaw = rig.head.rotation.y;
    if (state.blinkT === undefined) state.blinkT = -1;
    if (state.blinkT < 0 && (state.nextBlink <= 0 || turn > 0.02)) { state.blinkT = 0; state.nextBlink = 2.5 + Math.random() * 3.5; if (Math.random() < 0.15) state.dbl = true; }
    let bk = 0;
    if (state.blinkT >= 0) {
      state.blinkT += dt; const t2 = state.blinkT;
      bk = t2 < 0.05 ? t2 / 0.05 : t2 < 0.09 ? 1 : t2 < 0.21 ? 1 - (t2 - 0.09) / 0.12 : 0;
      bk = bk * bk * (3 - 2 * bk);
      if (t2 >= 0.21) { state.blinkT = -1; if (state.dbl) { state.dbl = false; state.nextBlink = 0.12; } }
    }
    const squint = rig.w.cheekRaise * 0.18;  // happy eyes narrow a touch
    rig.blink = Math.max(bk, squint);
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
  state.talk = { el, cues, id };
}
export function breath(phase) { state.breathTarget = phase === 'in' ? 1 : phase === 'out' ? 0 : -1; }
export function proud() { state.hop = 0.9; }
/* deterministic frame stepping for recording demo videos */
export function capture(t, audioT, id) {
  if (!state.cap) { state.cap = { t: 0 }; last = 0; scene.background = new THREE.Color(0xeef3f8); }
  if (id) { if (!state.talk || state.talk.id !== id) { speak({ paused: false, ended: false, currentTime: 0 }, id); } state.talk.el.currentTime = audioT; state.talk.el.paused = audioT < 0; }
  else state.talk = null;
  state.cap.t = t; step(t * 1000);
  return renderer.domElement.toDataURL('image/jpeg', 0.92);
}
