self.addEventListener('push', function (event) {
    const data = event.data.json();
    console.log('New notification', data);
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: 'https://i.imgur.com/bJH9BH5.png'
        })
    );
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});
