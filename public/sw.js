// public/sw.js

self.addEventListener('push', (e) => {
  const data = e.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: './icon.png', // Optional: Add an icon in your public folder
  });
});