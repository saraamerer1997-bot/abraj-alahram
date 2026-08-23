// Service Worker لموقع أبراج الأهرام — استقبال إشعارات المشاكل

self.addEventListener('push', function(event) {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'أبراج الأهرام', body: event.data ? event.data.text() : 'إشعار جديد' };
  }

  const title = data.title || '⚠️ مشكلة جديدة مسجلة';
  const options = {
    body: data.body || 'تم تسجيل مشكلة جديدة بالإنتاج، افتح الموقع للتفاصيل.',
    icon: data.icon || '/icon.png',
    badge: data.badge || '/icon.png',
    dir: 'rtl',
    lang: 'ar',
    data: { url: data.url || '/' }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
