const C='nafas-v2';const A=['./','index.html','css/app.css','js/main.js','js/store.js','js/character.js','js/inhaler3d.js','vendor/three.module.min.js','vendor/OrbitControls.js','assets/logo.svg','fonts/IBMPlexSansArabic-Regular.ttf','fonts/IBMPlexSansArabic-SemiBold.ttf','fonts/IBMPlexSansArabic-Bold.ttf'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x))))));
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request)))});
