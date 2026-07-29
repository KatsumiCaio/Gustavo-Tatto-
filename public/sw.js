const CACHE_NAME = 'gustavo-tattoo-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-192.svg',
  '/pwa-512.svg'
];

// Scheduled notification queue stored in SW memory
let scheduledNotifs = [];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200) {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, resClone);
          });
        }
        return response;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) return cachedResponse;
        
        // If it's a navigation request and we're offline, return index.html
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      })
  );
});

// Handle notification click (Opens or brings app to foreground when user clicks phone alert)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Receive scheduled notifications list from main app thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_SCHEDULED_NOTIFICATIONS') {
    scheduledNotifs = event.data.payload || [];
    checkBackgroundNotifications();
  } else if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag, data } = event.data.payload;
    self.registration.showNotification(title, {
      body,
      tag: tag || 'tattoo-agenda',
      icon: '/pwa-192.svg',
      badge: '/pwa-192.svg',
      vibrate: [200, 100, 200],
      data,
    });
  }
});

// Periodic background check inside Service Worker
function checkBackgroundNotifications() {
  if (!scheduledNotifs || scheduledNotifs.length === 0) return;

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const currentNowIso = `${yyyy}-${mm}-${dd} ${hh}:${min}`;

  const remaining = [];
  scheduledNotifs.forEach((n) => {
    if (n.dataHoraNotificacao && n.dataHoraNotificacao <= currentNowIso) {
      self.registration.showNotification(`📅 Lembrete Tattoo: ${n.cliente}`, {
        body: n.mensagem,
        tag: n.id,
        icon: '/pwa-192.svg',
        badge: '/pwa-192.svg',
        vibrate: [200, 100, 200, 100, 300],
        data: { url: '/' },
      });
    } else {
      remaining.push(n);
    }
  });

  scheduledNotifs = remaining;
}

// Check every 30s in Service Worker
setInterval(checkBackgroundNotifications, 30000);

