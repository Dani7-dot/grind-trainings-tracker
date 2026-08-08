const CACHE = 'grind-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      const network = fetch(event.request)
        .then(res => {
          if (res.ok) caches.open(CACHE).then(c => c.put(event.request, res.clone()));
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});

// Best-effort daily reminder while the browser keeps the SW alive (Android/Chrome, installed PWA only).
self.addEventListener('periodicsync', event => {
  if (event.tag === 'daily-reminder') {
    event.waitUntil(checkAndNotify());
  }
});

async function checkAndNotify() {
  try {
    const clientsList = await self.clients.matchAll({ type: 'window' });
    if (clientsList.length > 0) return; // app is open, in-page timer already handles it
    await self.registration.showNotification('GRIND — Training nicht vergessen', {
      body: 'Du hast dein Tagesziel heute noch nicht erreicht — Zeit für ein paar Übungen! 💪',
      icon: 'icons/icon-192.png',
      badge: 'icons/icon-192.png',
      tag: 'grind-reminder',
    });
  } catch { /* ignore */ }
}

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(list => {
      for (const c of list) if ('focus' in c) return c.focus();
      if (self.clients.openWindow) return self.clients.openWindow('./index.html');
    })
  );
});
