/**
 * Academic Hub Pro - Advanced Service Worker
 * Implements true PWA capabilities with background sync, caching, and offline support
 */

const CACHE_NAME = 'academic-hub-pro-v3.0';
const STATIC_CACHE = 'academic-hub-static-v3.0';
const DYNAMIC_CACHE = 'academic-hub-dynamic-v3.0';

const STATIC_FILES = [
    '/',
    '/index.html',
    '/script.js',
    '/advanced-features.js',
    '/style.css',
    '/manifest.json',
    'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js',
    'https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js',
    'https://cdn.jsdelivr.net/npm/brython@3.10.5/brython.min.js'
];

// Install event - cache static files
self.addEventListener('install', event => {
    console.log('🚀 Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE).then(cache => {
            console.log('📦 Caching static files...');
            return cache.addAll(STATIC_FILES);
        }).then(() => {
            console.log('✅ Static files cached');
            return self.skipWaiting();
        })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('🔄 Service Worker activating...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        console.log('🗑️ Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Service Worker activated');
            return self.clients.claim();
        })
    );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);
    
    // Handle different types of requests
    if (requestUrl.origin === location.origin) {
        // Same origin - use cache first strategy
        event.respondWith(
            caches.match(event.request).then(response => {
                if (response) {
                    return response;
                }
                
                return fetch(event.request).then(networkResponse => {
                    // Cache successful responses
                    if (networkResponse.status === 200) {
                        const responseClone = networkResponse.clone();
                        caches.open(DYNAMIC_CACHE).then(cache => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return networkResponse;
                });
            }).catch(() => {
                // Return offline page for navigation requests
                if (event.request.destination === 'document') {
                    return caches.match('/offline.html');
                }
            })
        );
    } else if (requestUrl.hostname === 'openrouter.ai') {
        // OpenRouter API - network first with cache fallback
        event.respondWith(
            fetch(event.request).then(response => {
                const responseClone = response.clone();
                caches.open(DYNAMIC_CACHE).then(cache => {
                    cache.put(event.request, responseClone);
                });
                return response;
            }).catch(() => {
                return caches.match(event.request);
            })
        );
    } else {
        // External resources - network first
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match(event.request);
            })
        );
    }
});

// Background sync for data backup
self.addEventListener('sync', event => {
    console.log('🔄 Background sync triggered:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(performBackgroundSync());
    } else if (event.tag === 'cloud-backup') {
        event.waitUntil(performCloudBackup());
    }
});

async function performBackgroundSync() {
    try {
        console.log('📊 Performing background sync...');
        
        // Get current data from IndexedDB or localStorage
        const clients = await self.clients.matchAll();
        if (clients.length > 0) {
            // Send message to main app to perform sync
            clients[0].postMessage({
                type: 'BACKGROUND_SYNC',
                timestamp: new Date().toISOString()
            });
        }
        
        console.log('✅ Background sync completed');
    } catch (error) {
        console.error('❌ Background sync failed:', error);
        throw error;
    }
}

async function performCloudBackup() {
    try {
        console.log('☁️ Performing cloud backup...');
        
        // This would integrate with your cloud backup logic
        const clients = await self.clients.matchAll();
        if (clients.length > 0) {
            clients[0].postMessage({
                type: 'CLOUD_BACKUP',
                timestamp: new Date().toISOString()
            });
        }
        
        console.log('✅ Cloud backup completed');
    } catch (error) {
        console.error('❌ Cloud backup failed:', error);
        throw error;
    }
}

// Push notifications
self.addEventListener('push', event => {
    console.log('📱 Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'You have a new study reminder!',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'study-reminder',
        actions: [
            {
                action: 'start-study',
                title: '📚 Start Studying',
                icon: '/icon-192.png'
            },
            {
                action: 'dismiss',
                title: '⏰ Remind Later',
                icon: '/icon-192.png'
            }
        ],
        data: {
            timestamp: new Date().toISOString(),
            url: '/'
        }
    };
    
    event.waitUntil(
        self.registration.showNotification('Academic Hub Pro', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
    console.log('🔔 Notification clicked:', event.action);
    
    event.notification.close();
    
    const urlToOpen = event.notification.data?.url || '/';
    
    if (event.action === 'start-study') {
        // Open app and start study session
        event.waitUntil(
            clients.openWindow(urlToOpen + '#start-study')
        );
    } else if (event.action === 'dismiss') {
        // Schedule another reminder
        console.log('⏰ Scheduling reminder for later');
    } else {
        // Default action - just open the app
        event.waitUntil(
            clients.openWindow(urlToOpen)
        );
    }
});

// Message handling from main app
self.addEventListener('message', event => {
    console.log('📨 Message received:', event.data);
    
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    } else if (event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', event => {
    if (event.tag === 'study-reminder-sync') {
        event.waitUntil(checkStudyReminders());
    }
});

async function checkStudyReminders() {
    try {
        const clients = await self.clients.matchAll();
        if (clients.length > 0) {
            clients[0].postMessage({
                type: 'CHECK_REMINDERS',
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error('❌ Study reminder check failed:', error);
    }
}

console.log('✅ Advanced Service Worker loaded successfully!');
