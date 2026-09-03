/* GYM PRO — سرویس‌ورکر: کش اول (آفلاین کامل)
   توجه: فقط روی http/https (از جمله localhost) فعال می‌شود؛ روی file:// لازم نیست
   چون خودِ فایل از قبل آفلاین است. */
const CACHE = "gympro-v9";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon.svg", "./icons/icon-maskable.svg"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(hit => {
      if (hit) return hit;
      return fetch(e.request).then(res => {
        const copy = res.clone();
        if (res.ok && new URL(e.request.url).origin === self.location.origin) {
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => caches.match("./index.html")); // ناوبری آفلاین
    })
  );
});
