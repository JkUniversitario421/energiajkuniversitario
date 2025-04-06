// sw.js
self.addEventListener('install', (event) => {
    console.log('Service Worker instalado');
  });
  
  self.addEventListener('activate', (event) => {
    console.log('Service Worker ativado');
  });
  
  self.addEventListener('fetch', (event) => {
    // Aqui você pode adicionar cache de recursos, se necessário
    event.respondWith(fetch(event.request));
  });
  