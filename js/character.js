// "سلمان" — a Gulf boy companion built procedurally in three.js (thobe, red shemagh, agal).
// He breathes slowly so a child can copy him during spacer use. He does not measure anything.
import * as THREE from '../vendor/three.module.min.js';

function shemaghTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d');
  g.fillStyle = '#fbf8f3'; g.fillRect(0, 0, 512, 512);
  const red = '#b8141f', n = 16, s = 512 / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const x = i * s, y = j * s;
    g.fillStyle = red;
    if ((i + j) % 2 === 0) {               // houndstooth-like motif
      g.beginPath(); g.moveTo(x + s * .5, y + s * .1); g.lineTo(x + s * .9, y + s * .5); g.lineTo(x + s * .5, y + s * .9); g.lineTo(x + s * .1, y + s * .5); g.closePath(); g.fill();
    } else {
      g.fillRect(x + s * .42, y + s * .1, s * .16, s * .8); g.fillRect(x + s * .1, y + s * .42, s * .8, s * .16);
    }
  }
  
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3.2, 2.2); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

function fabricNormal() {   // subtle weave for the thobe
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  g.fillStyle = 'rgb(128,128,255)'; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 128; i += 4) { g.fillStyle = 'rgba(150,128,255,.6)'; g.fillRect(i, 0, 1, 128); g.fillStyle = 'rgba(128,150,255,.6)'; g.fillRect(0, i, 128, 1); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 10); return t;
}

export function createCompanion(canvas, opts = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(30, 1, .1, 100);
  cam.position.set(0, 2.25, 10.2);

  scene.add(new THREE.HemisphereLight(0xfff6e8, 0x6b7f99, 1.15));
  const key = new THREE.DirectionalLight(0xfff1dc, 2.4); key.position.set(-4, 7, 6); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); key.shadow.camera.left = -4; key.shadow.camera.right = 4; key.shadow.camera.top = 6; key.shadow.camera.bottom = -2; key.shadow.radius = 6;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9cc8ff, 1.6); rim.position.set(5, 4, -5); scene.add(rim);
  const fill = new THREE.PointLight(0xffd9b3, 8, 20); fill.position.set(3, 2, 5); scene.add(fill);

  const skin = new THREE.MeshPhysicalMaterial({ color: 0xc8936a, roughness: .55, sheen: .4, sheenColor: 0xffc9a8, clearcoat: .08 });
  const cloth = new THREE.MeshPhysicalMaterial({ color: 0xfbfaf6, roughness: .82, sheen: 1, sheenRoughness: .6, sheenColor: 0xffffff, normalMap: fabricNormal(), normalScale: new THREE.Vector2(.25, .25) });
  const shemagh = new THREE.MeshPhysicalMaterial({ map: shemaghTexture(), roughness: .85, sheen: .8, sheenColor: 0xffffff, side: THREE.DoubleSide });
  const black = new THREE.MeshStandardMaterial({ color: 0x14161a, roughness: .45, metalness: .1 });
  const white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .2 });
  const iris = new THREE.MeshStandardMaterial({ color: 0x3b2414, roughness: .25 });
  const lip = new THREE.MeshStandardMaterial({ color: 0x8a3b2c, roughness: .5 });
  const blush = new THREE.MeshBasicMaterial({ color: 0xff7a7a, transparent: true, opacity: .22, depthWrite: false });
  const sandal = new THREE.MeshStandardMaterial({ color: 0x6b4a2e, roughness: .7 });

  const root = new THREE.Group(); scene.add(root);
  const body = new THREE.Group(); root.add(body);

  // thobe: lathe profile from the hem up to the neck
  const prof = [[0, 0], [.96, 0], [.99, .1], [.93, .6], [.84, 1.2], [.8, 1.65], [.83, 2.05], [.8, 2.3], [.66, 2.5], [.42, 2.62], [.27, 2.7], [0, 2.72]].map(([x, y]) => new THREE.Vector2(x, y));
  const thobe = new THREE.Mesh(new THREE.LatheGeometry(prof, 72), cloth); thobe.castShadow = true; thobe.position.y = .18; body.add(thobe);
  const chest = thobe; // breathing target
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(.31, .33, .14, 40, 1, true), cloth); collar.position.y = 2.93; body.add(collar);
  const placket = new THREE.Mesh(new THREE.BoxGeometry(.11, .7, .02), new THREE.MeshStandardMaterial({ color: 0xf1efe9, roughness: .8 }));
  placket.position.set(0, 2.45, .8); placket.rotation.x = -.18; body.add(placket);
  for (let i = 0; i < 3; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(.028, 16, 12), new THREE.MeshStandardMaterial({ color: 0xd9c9a3, metalness: .6, roughness: .3 })); b.position.set(0, 2.68 - i * .2, .83 - i * .035); body.add(b); }
  // feet
  for (const s of [-1, 1]) { const f = new THREE.Mesh(new THREE.SphereGeometry(.22, 24, 16), sandal); f.scale.set(1, .45, 1.6); f.position.set(s * .35, .1, .35); f.castShadow = true; root.add(f); }

  // arms
  const arms = [];
  for (const s of [-1, 1]) {
    const sh = new THREE.Group(); sh.position.set(s * .74, 2.5, 0); body.add(sh);
    const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(.2, 1.05, 8, 24), cloth); sleeve.position.y = -.6; sleeve.castShadow = true; sh.add(sleeve);
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(.205, .205, .08, 24), cloth); cuff.position.y = -1.18; sh.add(cuff);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(.17, 28, 20), skin); hand.scale.set(.9, 1.1, .8); hand.position.y = -1.32; sh.add(hand);
    const th = new THREE.Mesh(new THREE.CapsuleGeometry(.05, .1, 6, 12), skin); th.position.set(-s * .1, -1.28, .08); th.rotation.z = s * .6; sh.add(th);
    sh.rotation.z = s * .14; arms.push(sh);
  }

  // head
  const head = new THREE.Group(); head.position.y = 3.62; body.add(head);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(.22, .25, .4, 24), skin); neck.position.y = -.55; head.add(neck);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(.78, 64, 48), skin); skull.scale.set(.95, 1.02, .93); skull.castShadow = true; head.add(skull);
  const chin = new THREE.Mesh(new THREE.SphereGeometry(.46, 40, 30), skin); chin.scale.set(1.02, .72, .86); chin.position.set(0, -.27, .14); head.add(chin);
  for (const s of [-1, 1]) {
    const cheek = new THREE.Mesh(new THREE.CircleGeometry(.13, 32), blush); cheek.position.set(s * .38, -.16, .69); cheek.rotation.y = s * .45; head.add(cheek);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(.085, 24, 16), skin); nose.scale.set(1, .9, 1.1); nose.position.set(0, -.06, .76); head.add(nose);
  const eyes = [];
  for (const s of [-1, 1]) {
    const eg = new THREE.Group(); eg.position.set(s * .25, .1, .64); head.add(eg);
    const sc = new THREE.Mesh(new THREE.SphereGeometry(.13, 32, 24), white); sc.scale.set(1, 1.15, .6); eg.add(sc);
    const ir = new THREE.Mesh(new THREE.SphereGeometry(.085, 32, 24), iris); ir.scale.set(1, 1.1, .5); ir.position.z = .055; eg.add(ir);
    const pu = new THREE.Mesh(new THREE.SphereGeometry(.045, 20, 16), black); pu.scale.set(1, 1, .4); pu.position.z = .085; eg.add(pu);
    const hl = new THREE.Mesh(new THREE.SphereGeometry(.022, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffffff })); hl.position.set(.03, .035, .1); eg.add(hl);
    const lid = new THREE.Mesh(new THREE.SphereGeometry(.14, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), skin); lid.scale.set(1.02, 1.2, .66); lid.rotation.x = -Math.PI / 2 + .2; lid.position.z = .005; lid.scale.multiplyScalar(1); eg.add(lid);
    const brow = new THREE.Mesh(new THREE.CapsuleGeometry(.025, .16, 4, 10), new THREE.MeshStandardMaterial({ color: 0x2a1a10, roughness: .8 })); brow.rotation.z = Math.PI / 2 + s * .12; brow.position.set(0, .2, .02); eg.add(brow);
    eyes.push({ eg, lid, ir, pu, hl });
  }
  const smile = new THREE.Mesh(new THREE.TorusGeometry(.17, .028, 12, 40, Math.PI * .85), lip); smile.rotation.z = Math.PI + Math.PI * .075; smile.position.set(0, -.27, .7); smile.rotation.x = -.15; head.add(smile);
  for (const s of [-1, 1]) { const ear = new THREE.Mesh(new THREE.SphereGeometry(.14, 20, 16), skin); ear.scale.set(.5, 1, .8); ear.position.set(s * .74, 0, 0); head.add(ear); }

  // gahfiya (white cap) under the shemagh
  const cap = new THREE.Mesh(new THREE.SphereGeometry(.81, 64, 32, 0, Math.PI * 2, 0, Math.PI * .42), cloth); cap.scale.set(.97, 1.03, .95); cap.position.y = .02; head.add(cap);
  // shemagh crown + drape with folds; opening faces the front
  const crown = new THREE.Mesh(new THREE.SphereGeometry(.86, 72, 36, 0, Math.PI * 2, 0, Math.PI * .4), shemagh); crown.scale.set(.98, 1.03, .97); crown.position.y = .05; head.add(crown);
  const dg = new THREE.CylinderGeometry(.86, 1.12, 1.45, 96, 24, true, Math.PI * .26, Math.PI * 1.48);
  const p = dg.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i); const t = (.725 - v.y) / 1.45; const a = Math.atan2(v.x, v.z);
    const r = Math.hypot(v.x, v.z) * (1 + Math.sin(a * 11) * .035 * t + Math.sin(a * 5 + 1) * .03 * t);
    v.x = Math.sin(a) * r; v.z = Math.cos(a) * r - t * t * .35; p.setXYZ(i, v.x, v.y, v.z);
  }
  dg.computeVertexNormals();
  const drape = new THREE.Mesh(dg, shemagh); drape.position.set(0, -.5, -.04); drape.castShadow = true; head.add(drape);
  // front flaps falling over the shoulders
  for (const s of [-1, 1]) {
    const fg = new THREE.PlaneGeometry(.34, 1.25, 6, 20); const fp = fg.attributes.position;
    for (let i = 0; i < fp.count; i++) { v.fromBufferAttribute(fp, i); const t = (.625 - v.y) / 1.25; fp.setZ(i, Math.sin(v.x * 14) * .025 + t * t * .45); fp.setX(i, v.x - s * t * .05); }
    fg.computeVertexNormals();
    const fl = new THREE.Mesh(fg, shemagh); fl.position.set(s * .66, -.98, .5); fl.rotation.set(-.08, s * .5, 0); fl.castShadow = true; head.add(fl);
  }
  // agal: two black rings
  for (let k = 0; k < 2; k++) { const ag = new THREE.Mesh(new THREE.TorusGeometry(.8, .058, 18, 96), black); ag.rotation.x = Math.PI / 2 + .22; ag.position.set(0, .4 + k * .09, -.08 - k * .015); ag.scale.set(1.02, 1, 1); head.add(ag); }

  // soft ground shadow
  const gc = document.createElement('canvas'); gc.width = gc.height = 128; const gg = gc.getContext('2d');
  const grd = gg.createRadialGradient(64, 64, 4, 64, 64, 62); grd.addColorStop(0, 'rgba(15,42,68,.35)'); grd.addColorStop(1, 'rgba(15,42,68,0)'); gg.fillStyle = grd; gg.fillRect(0, 0, 128, 128);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.6), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(gc), transparent: true, depthWrite: false }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = .01; root.add(ground);

  // interaction
  const look = new THREE.Vector2();
  const onMove = e => { const r = canvas.getBoundingClientRect(); look.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1)); };
  window.addEventListener('pointermove', onMove);
  let wave = 0; canvas.addEventListener('pointerdown', () => { wave = 1; });

  const state = { breath: opts.breath || false, period: 8, onPhase: opts.onPhase || null };
  let lastPhase = '', blinkT = 2.5, running = true;

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas); resize();

  const clock = new THREE.Clock();
  function frame() {
    if (!running) return;
    const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime;
    // breathing: 4 s in, 4 s out when guiding; otherwise a calm idle breath
    const per = state.breath ? state.period : 4.5;
    const ph = (t % per) / per; const b = state.breath ? (ph < .5 ? Math.sin(ph * Math.PI) : Math.sin(ph * Math.PI)) : .5 + .5 * Math.sin(t * 2 * Math.PI / per);
    const amp = state.breath ? .055 : .015;
    chest.scale.set(1 + b * amp, 1 + b * amp * .4, 1 + b * amp * 1.2);
    head.position.y = 3.62 + b * amp * 1.2;
    arms.forEach((a, i) => { const s = i ? 1 : -1; a.position.y = 2.5 + b * amp * 1.4; a.rotation.z = s * (.14 + b * amp * .8); });
    if (state.breath) { const phase = ph < .5 ? 'in' : 'out'; if (phase !== lastPhase) { lastPhase = phase; state.onPhase && state.onPhase(phase); } }
    // wave on tap
    if (wave > 0) { wave -= dt * .45; const w = Math.max(wave, 0); arms[1].rotation.z = 2.4 * Math.sin(Math.min(1, w * 3) * Math.PI / 2) + Math.sin(t * 14) * .25 * w; arms[1].rotation.x = -.2 * w; }
    // look at pointer
    head.rotation.y += (look.x * .45 - head.rotation.y) * .06;
    head.rotation.x += (-look.y * .18 - head.rotation.x) * .06;
    eyes.forEach(e => { e.ir.position.x = look.x * .02; e.pu.position.x = look.x * .02; e.ir.position.y = e.pu.position.y = look.y * .015; });
    root.rotation.y = Math.sin(t * .35) * .08;
    // blink
    blinkT -= dt; let lid = 0; if (blinkT < 0) { lid = Math.sin(Math.min(1, -blinkT / .16) * Math.PI); if (blinkT < -.16) blinkT = 2 + Math.random() * 3; }
    if (state.breath && ph >= .5) lid = Math.max(lid, .55);           // calm half-closed eyes on the out-breath
    eyes.forEach(e => { e.lid.rotation.x = -Math.PI / 2 + .2 + lid * 1.25; });
    renderer.render(scene, cam);
    requestAnimationFrame(frame);
  }
  frame();
  return {
    setBreath(on) { state.breath = on; lastPhase = ''; clock.start(); },
    wave() { wave = 1; },
    dispose() { running = false; window.removeEventListener('pointermove', onMove); renderer.dispose(); },
  };
}
