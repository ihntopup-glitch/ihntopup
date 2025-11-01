// This is a basic service worker for PWA functionality.

// Install event: caches essential assets.
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  // You can add caching strategies here if needed.
});

// Activate event: cleans up old caches.
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
});

// Fetch event: serves cached content when offline.
self.addEventListener('fetch', (event) => {
  // This is a basic pass-through. For full offline support,
  // you would implement a cache-first or network-first strategy here.
  event.respondWith(fetch(event.request));
});

// Push event: handles incoming push notifications.
self.addEventListener('push', (event) => {
  if (!event.data) {
    console.log("Push event has no data.");
    return;
  }
  const data = event.data.json();
  console.log('Service Worker: Push Received.', data);
  
  const title = data.title || 'IHN TOPUP';
  const options = {
    body: data.body || 'You have a new notification.',
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/icon-96x96.png', // Badge for the notification bar
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click event: focuses on the client window.
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked.');
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/admin/orders');
      }
    })
  );
});
