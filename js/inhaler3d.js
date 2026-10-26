// Generic MDI + spacer + mask, built procedurally (no brand marks). Educational only.
import * as THREE from '../vendor/three.module.min.js';
import { OrbitControls } from '../vendor/OrbitControls.js';

export function createInhaler(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene(); const cam = new THREE.PerspectiveCamera(32, 1, .1, 100); cam.position.set(4.5, 3.4, 11.5);
  const ctl = new OrbitControls(cam, canvas); ctl.enableDamping = true; ctl.enablePan = false; ctl.minDistance = 7; ctl.maxDistance = 18; ctl.target.set(.9, .9, 0);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8899aa, 1.3));
  const k = new THREE.DirectionalLight(0xffffff, 2.2); k.position.set(4, 6, 5); scene.add(k);
  const r = new THREE.DirectionalLight(0x9fc7ff, 1.2); r.position.set(-5, 2, -4); scene.add(r);

  const blue = new THREE.MeshPhysicalMaterial({ color: 0x2b6cb0, roughness: .35, clearcoat: .4 });
  const metal = new THREE.MeshStandardMaterial({ color: 0xd6dbe0, metalness: .85, roughness: .25 });
  const clear = new THREE.MeshPhysicalMaterial({ color: 0xdfefff, roughness: .05, transparent: true, opacity: .32, side: THREE.DoubleSide, depthWrite: false });
  const grey = new THREE.MeshStandardMaterial({ color: 0x5c6773, roughness: .6 });
  const orange = new THREE.MeshPhysicalMaterial({ color: 0xf2994a, roughness: .45, transparent: true, opacity: .9, side: THREE.DoubleSide });

  // inhaler: L-shaped boot
  const inh = new THREE.Group(); scene.add(inh);
  const shp = new THREE.Shape(); const R = .18;
  shp.moveTo(-.45, -.2); shp.lineTo(.45, -.2); shp.quadraticCurveTo(.62, -.2, .62, 0); shp.lineTo(.62, 1.9); shp.quadraticCurveTo(.62, 2.05, .45, 2.05); shp.lineTo(-.45, 2.05); shp.quadraticCurveTo(-.62, 2.05, -.62, 1.9); shp.lineTo(-.62, 0); shp.quadraticCurveTo(-.62, -.2, -.45, -.2);
  const boot = new THREE.Mesh(new THREE.ExtrudeGeometry(shp, { depth: .7, bevelEnabled: true, bevelSize: R * .6, bevelThickness: R * .6, bevelSegments: 6 }), blue); boot.position.z = -.35; inh.add(boot);
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(.9, .62, 1.1, 1, 1, 1), blue); mouth.position.set(0, .12, .85); inh.add(mouth);
  const hole = new THREE.Mesh(new THREE.BoxGeometry(.66, .4, .05), grey); hole.position.set(0, .12, 1.41); inh.add(hole);
  const can = new THREE.Group(); inh.add(can);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, 2.1, 48), metal); body.position.y = 2.6; can.add(body);
  const top = new THREE.Mesh(new THREE.SphereGeometry(.42, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2), metal); top.scale.y = .35; top.position.y = 3.65; can.add(top);
  inh.position.set(-3.4, -.6, 0); inh.rotation.y = Math.PI / 2;

  // spacer + mask
  const sp = new THREE.Group(); scene.add(sp);
  const prof = [[.45, 0], [.55, .2], [1.05, .9], [1.15, 2.4], [1.05, 3.2], [.6, 3.6], [.42, 3.8]].map(([x, y]) => new THREE.Vector2(x, y));
  const tube = new THREE.Mesh(new THREE.LatheGeometry(prof, 64), clear); sp.add(tube);
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, .25, 40), grey); ring.position.y = -.05; sp.add(ring);
  const ring2 = new THREE.Mesh(new THREE.CylinderGeometry(.45, .45, .25, 40), grey); ring2.position.y = 3.85; sp.add(ring2);
  const mprof = [[.45, 0], [.55, .2], [.95, .6], [1.25, .95], [1.3, 1.05]].map(([x, y]) => new THREE.Vector2(x, y));
  const mask = new THREE.Mesh(new THREE.LatheGeometry(mprof, 64), orange); mask.position.y = 3.95; sp.add(mask);
  sp.rotation.z = -Math.PI / 2; sp.position.set(-.2, -.2, 0);

  const T = { shake: 0, attach: 0, press: 0, puffs: [] };
  function resize() { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w) return; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
  new ResizeObserver(resize).observe(canvas); resize();
  const puffMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .5, depthWrite: false });
  let running = true; const clock = new THREE.Clock();
  (function loop() {
    if (!running) return; const dt = clock.getDelta(), t = clock.elapsedTime;
    // attach: slide the inhaler into the spacer's back ring
    const a = THREE.MathUtils.smoothstep(T.attach, 0, 1);
    inh.position.x = THREE.MathUtils.lerp(-3.4, -1.62, a); inh.position.y = THREE.MathUtils.lerp(-.6, -.32, a);
    inh.rotation.y = Math.PI / 2;
    if (T.shake > 0) { T.shake -= dt; inh.position.y += Math.sin(t * 40) * .18; inh.rotation.z = Math.sin(t * 40) * .1; } else inh.rotation.z = 0;
    if (T.press > 0) { T.press -= dt; can.position.y = -Math.sin(Math.min(1, T.press * 2) * Math.PI) * .25; } else can.position.y = 0;
    T.puffs.forEach(p => { p.position.x += dt * 1.6; p.scale.multiplyScalar(1 + dt * .9); p.material.opacity = Math.max(0, p.material.opacity - dt * .25); });
    T.puffs = T.puffs.filter(p => p.material.opacity > 0 || (scene.remove(p), false));
    ctl.update(); renderer.render(scene, cam); requestAnimationFrame(loop);
  })();
  const anim = (k, to, dur = .9) => { const from = T[k], st = performance.now(); (function s() { const q = Math.min(1, (performance.now() - st) / 1000 / dur); T[k] = from + (to - from) * q; if (q < 1) requestAnimationFrame(s); })(); };
  return {
    step(i) {
      if (i === 0) { anim('attach', 0); }
      if (i === 1) { T.shake = 1.4; }
      if (i === 2) { anim('attach', 1); }
      if (i === 3) { T.press = .5; for (let n = 0; n < 6; n++) { const m = new THREE.Mesh(new THREE.SphereGeometry(.18, 16, 12), puffMat.clone()); m.position.set(-.1 + n * .15, -.2 + (Math.random() - .5) * .3, (Math.random() - .5) * .3); scene.add(m); T.puffs.push(m); } }
    },
    dispose() { running = false; renderer.dispose(); },
  };
}
