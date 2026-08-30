const CACHE_NAME = 'abraj-alahram-v2';
const APP_SHELL = ['/', '/index.html', '/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// استقبال الإشعار الفعلي من الخادم وعرضه للمستخدم — هذا الجزء كان ناقص
self.addEventListener('push', (event) => {
  let data = { title: 'أبراج الأهرام', body: 'إشعار جديد' };
  try { data = event.data.json(); } catch(e) {
    if(event.data) data.body = event.data.text();
  }
  const options = {
    body: data.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    dir: 'rtl',
    lang: 'ar',
    vibrate: [200, 100, 200],
  };
  event.waitUntil(self.registration.showNotification(data.title || 'أبراج الأهرام', options));
});

// لما المستخدم يضغط على الإشعار، يفتح الموقع (أو يركّز على تبويب مفتوح أصلاً)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('/');
    })
  );
});

// شبكة أول، وإذا فشل (بدون نت) يرجع للنسخة المخزنة محليًا — يخلي القشرة الأساسية تفتح حتى بلا اتصال
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/index.html')))
  );
});
