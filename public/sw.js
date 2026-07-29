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

// Handle background messages (schedule delayed notifications, test alerts, etc)
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SYNC_SCHEDULED_NOTIFICATIONS') {
    scheduledNotifs = event.data.payload || [];
    scheduleTimersInServiceWorker();
  } else if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag, data } = event.data.payload;
    showSWNotification(title, body, tag, data);
  } else if (event.data.type === 'SCHEDULE_DELAYED') {
    const { title, body, tag, delayMs, data } = event.data.payload;
    setTimeout(() => {
      showSWNotification(title, body, tag, data);
    }, delayMs || 5000);
  }
});

function showSWNotification(title, body, tag, data) {
  self.registration.showNotification(title, {
    body: body || '',
    tag: tag || 'tattoo-agenda-' + Date.now(),
    icon: '/pwa-192.svg',
    badge: '/pwa-192.svg',
    vibrate: [200, 100, 200, 100, 300],
    data: data || { url: '/' },
    renotify: true,
    requireInteraction: true,
  });
}

// Active background timers maintained inside Service Worker
const activeSWTimers = new Map();

function scheduleTimersInServiceWorker() {
  if (!scheduledNotifs || scheduledNotifs.length === 0) return;

  const nowMs = Date.now();

  scheduledNotifs.forEach((n) => {
    if (!n.dataHoraNotificacao || activeSWTimers.has(n.id)) return;

    // Parse dataHoraNotificacao "YYYY-MM-DD HH:mm"
    const [datePart, timePart] = n.dataHoraNotificacao.split(' ');
    if (!datePart || !timePart) return;

    const [yyyy, mm, dd] = datePart.split('-').map(Number);
    const [hh, min] = timePart.split(':').map(Number);
    const targetDate = new Date(yyyy, mm - 1, dd, hh, min, 0);
    const diffMs = targetDate.getTime() - nowMs;

    // Try native TimestampTrigger if browser supports Native Scheduled Notifications
    if (typeof TimestampTrigger !== 'undefined' && 'showTrigger' in Notification.prototype && diffMs > 0) {
      try {
        self.registration.showNotification(`📅 Lembrete Tattoo: ${n.cliente}`, {
          body: n.mensagem,
          tag: n.id,
          icon: '/pwa-192.svg',
          badge: '/pwa-192.svg',
          vibrate: [200, 100, 200, 100, 300],
          showTrigger: new TimestampTrigger(targetDate.getTime()),
          data: { url: '/' },
        });
        activeSWTimers.set(n.id, true);
        return;
      } catch (err) {
        console.warn('TimestampTrigger failed, fallback to SW timer', err);
      }
    }

    // Fallback: If trigger time is in future within next 7 days, schedule SW timer
    if (diffMs > 0 && diffMs <= 7 * 24 * 60 * 60 * 1000) {
      const timerId = setTimeout(() => {
        showSWNotification(`📅 Lembrete Tattoo: ${n.cliente}`, n.mensagem, n.id);
        activeSWTimers.delete(n.id);
      }, diffMs);
      activeSWTimers.set(n.id, timerId);
    } else if (diffMs <= 0 && diffMs > -60000) {
      // If due within the last 1 minute
      showSWNotification(`📅 Lembrete Tattoo: ${n.cliente}`, n.mensagem, n.id);
      activeSWTimers.set(n.id, true);
    }
  });
}

