const CACHE_NAME = 'fishermate-v1.0.0';
const STATIC_CACHE = 'fishermate-static-v1.0.0';
const DYNAMIC_CACHE = 'fishermate-dynamic-v1.0.0';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/dashboard',
  '/safety',
  '/laws',
  '/chat',
  '/map',
  '/offline',
  '/favicon.ico',
  '/favicon.svg',
  '/apple-touch-icon.svg',
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^https:\/\/api\.openweathermap\.org/,
  /^https:\/\/maps\.googleapis\.com/,
  /\/api\/health/,
];

// Network-first resources (always try network first)
const NETWORK_FIRST_PATTERNS = [
  /\/api\/chat/,
  /\/api\/weather/,
  /\/api\/laws/,
];

// Cache-first resources (try cache first)
const CACHE_FIRST_PATTERNS = [
  /\.(js|css|png|jpg|jpeg|svg|ico|woff|woff2|ttf)$/,
  /\/favicon/,
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('ServiceWorker installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Caching static files');
        return cache.addAll(STATIC_FILES);
      }),
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('ServiceWorker activating...');
  
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE && cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension requests
  if (url.protocol === 'chrome-extension:') return;

  // Skip external domains (except allowed APIs)
  if (url.origin !== self.location.origin && !isAllowedExternalDomain(url)) {
    return;
  }

  // Handle different caching strategies based on request type
  if (matchesPattern(request.url, NETWORK_FIRST_PATTERNS)) {
    event.respondWith(networkFirstStrategy(request));
  } else if (matchesPattern(request.url, CACHE_FIRST_PATTERNS)) {
    event.respondWith(cacheFirstStrategy(request));
  } else if (matchesPattern(request.url, API_CACHE_PATTERNS)) {
    event.respondWith(staleWhileRevalidateStrategy(request));
  } else {
    event.respondWith(networkFirstWithFallback(request));
  }
});

// Caching strategies
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || createOfflineResponse(request);
  }
}

async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(request.destination === 'document' ? STATIC_CACHE : DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return createOfflineResponse(request);
  }
}

async function staleWhileRevalidateStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  const networkPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(DYNAMIC_CACHE);
      cache.then(cache => cache.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(() => cachedResponse);

  return cachedResponse || networkPromise;
}

async function networkFirstWithFallback(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineResponse = await caches.match('/offline');
      if (offlineResponse) {
        return offlineResponse;
      }
    }

    return createOfflineResponse(request);
  }
}

// Helper functions
function matchesPattern(url, patterns) {
  return patterns.some(pattern => pattern.test(url));
}

function isAllowedExternalDomain(url) {
  const allowedDomains = [
    'api.openweathermap.org',
    'maps.googleapis.com',
    'fonts.googleapis.com',
    'fonts.gstatic.com'
  ];
  return allowedDomains.includes(url.hostname);
}

function createOfflineResponse(request) {
  if (request.destination === 'document') {
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Offline - FisherMate.AI</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
            }
            .container {
              max-width: 400px;
              padding: 40px;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 16px;
              backdrop-filter: blur(10px);
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            }
            h1 { margin-top: 0; font-size: 2em; }
            .fish-icon {
              font-size: 4em;
              margin-bottom: 20px;
              display: block;
            }
            button {
              background: #2563eb;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-size: 16px;
              cursor: pointer;
              margin-top: 20px;
            }
            button:hover { background: #1d4ed8; }
          </style>
        </head>
        <body>
          <div class="container">
            <span class="fish-icon">🎣</span>
            <h1>You're Offline</h1>
            <p>No internet connection available. You can still access cached fishing data and safety information.</p>
            <button onclick="window.location.reload()">Try Again</button>
          </div>
        </body>
      </html>
    `, {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });
  }

  if (request.destination === 'image') {
    // Return a simple SVG placeholder for images
    return new Response(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#f3f4f6"/>
        <text x="100" y="100" text-anchor="middle" dy="0.3em" fill="#9ca3af" font-family="sans-serif">
          🎣 Offline
        </text>
      </svg>
    `, {
      status: 200,
      headers: { 'Content-Type': 'image/svg+xml' }
    });
  }

  // For API requests, return a JSON error
  if (request.url.includes('/api/')) {
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'This feature requires an internet connection'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response('Offline', { status: 503 });
}

// Background sync for data when online
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-fishing-data') {
    event.waitUntil(syncFishingData());
  }
});

async function syncFishingData() {
  try {
    // Get pending data from IndexedDB or localStorage
    // This would sync fishing journal entries, weather data, etc.
    console.log('Syncing fishing data...');
    
    // Implementation would go here to sync offline data
    // when the connection is restored
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Push notifications (for future weather alerts, etc.)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: data.tag || 'fishermate-notification',
      requireInteraction: false,
      actions: data.actions || []
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (let client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
