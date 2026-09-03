self.addEventListener('push', (event) => {
  let data = { title: 'MediMind', body: 'You have a medicine reminder.' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch (e) {
    // keep defaults if payload is not JSON
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/favicon.ico',
      tag: 'medimind-reminder',
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('/');
    }),
  );
});
