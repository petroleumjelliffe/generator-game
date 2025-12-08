import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Register service worker for PWA with update detection
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/generator-game/sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration);

        // Check for updates periodically (every 60 seconds)
        setInterval(() => {
          registration.update();
        }, 60000);

        // Listen for new service worker waiting to activate
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available - show update notification
                showUpdateNotification();
              }
            });
          }
        });
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });

    // Handle controller change (new SW activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Reload to get the new version
      window.location.reload();
    });
  });
}

// Show a simple notification that a new version is available
function showUpdateNotification() {
  const notification = document.createElement('div');
  notification.id = 'update-notification';
  notification.innerHTML = `
    <span>New version available!</span>
    <button onclick="window.location.reload()">Update</button>
  `;
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #2a4a2a;
    border: 2px solid #4ade80;
    border-radius: 8px;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  `;
  const button = notification.querySelector('button');
  if (button) {
    button.style.cssText = `
      background: #4ade80;
      border: none;
      border-radius: 4px;
      padding: 8px 16px;
      cursor: pointer;
      font-weight: bold;
      color: #1a1a1a;
    `;
  }
  document.body.appendChild(notification);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
