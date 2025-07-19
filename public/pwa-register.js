if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, prompt user to refresh
              if (confirm('New version available! Click OK to refresh and get the latest features.')) {
                window.location.reload();
              }
            }
          });
        }
      });
    } catch (error) {
      console.log('ServiceWorker registration failed: ', error);
    }
  });
}

// Handle offline/online events
window.addEventListener('online', () => {
  console.log('Back online');
  // You could dispatch a custom event here to update UI
  window.dispatchEvent(new CustomEvent('network-status-changed', { detail: { online: true } }));
});

window.addEventListener('offline', () => {
  console.log('Gone offline');
  // You could dispatch a custom event here to update UI
  window.dispatchEvent(new CustomEvent('network-status-changed', { detail: { online: false } }));
});

export {};
