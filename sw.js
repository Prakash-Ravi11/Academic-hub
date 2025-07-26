/**
 * Academic Hub Pro - Service Worker
 * Built by: Nick (Ex-Apple UI/UX) + R R PRAKASHRAVI
 * 
 * Features:
 * - Offline caching for core app files
 * - Background sync for study data
 * - Push notifications for study reminders
 * - Cache management and updates
 */

const CACHE_NAME = 'academic-hub-pro-v1.0.0';
const DATA_CACHE_NAME = 'academic-hub-data-v1.0.0';

// Files to cache for offline functionality
const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/script.js',
    '/manifest.json',
    'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js',
    'https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js',
    // Add any other assets you want cached
];

// API endpoints that should be cached
const API_CACHE_URLS = [
    'https://openrouter.ai/api/v1/chat/completions'
];

// ==================== INSTALL EVENT ====================
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Service Worker: Caching app shell');
                return cache.addAll(FILES_TO_CACHE);
            })
            .then(() => {
                // Force the waiting service worker to become the active service worker
                return self.skipWaiting();
            })
    );
});

// ==================== ACTIVATE EVENT ====================
self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Delete old caches
                    if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
                        console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Take control of all pages immediately
            return self.clients.claim();
        })
    );
});

// ==================== FETCH EVENT ====================
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Handle API requests differently
    if (url.origin === 'https://openrouter.ai') {
        event.respondWith(handleAPIRequest(event));
    } 
    // Handle app shell requests
    else if (url.origin === location.origin) {
        event.respondWith(handleAppShellRequest(event));
    }
    // Handle external resources (CDN)
    else {
        event.respondWith(handleExternalRequest(event));
    }
});

// ==================== API REQUEST HANDLER ====================
async function handleAPIRequest(event) {
    try {
        // Always try network first for API requests
        const response = await fetch(event.request);
        
        // Cache successful responses
        if (response.status === 200) {
            const cache = await caches.open(DATA_CACHE_NAME);
            cache.put(event.request.url, response.clone());
        }
        
        return response;
    } catch (error) {
        console.warn('🌐 Service Worker: API request failed, checking cache');
        
        // Try to serve from cache if network fails
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return a custom offline response for API failures
        return new Response(
            JSON.stringify({
                error: 'Network unavailable',
                message: 'AI features require internet connection',
                offline: true
            }),
            {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// ==================== APP SHELL REQUEST HANDLER ====================
async function handleAppShellRequest(event) {
    try {
        // Try cache first for app shell
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // If not in cache, fetch from network and cache
        const response = await fetch(event.request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, response.clone());
        
        return response;
    } catch (error) {
        // If both cache and network fail, return offline page
        if (event.request.destination === 'document') {
            return caches.match('/index.html');
        }
        
        return new Response('Resource not available offline', {
            status: 404,
            statusText: 'Not Found'
        });
    }
}

// ==================== EXTERNAL REQUEST HANDLER ====================
async function handleExternalRequest(event) {
    try {
        // Try cache first for external resources
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Fetch from network
        const response = await fetch(event.request);
        
        // Cache successful responses
        if (response.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, response.clone());
        }
        
        return response;
    } catch (error) {
        console.warn('🌐 Service Worker: External resource failed:', event.request.url);
        return new Response('Resource not available', { status: 404 });
    }
}

// ==================== BACKGROUND SYNC ====================
self.addEventListener('sync', (event) => {
    console.log('🔄 Service Worker: Background sync triggered');
    
    if (event.tag === 'study-data-sync') {
        event.waitUntil(syncStudyData());
    }
});

async function syncStudyData() {
    try {
        // Get study data from IndexedDB or localStorage
        const clients = await self.clients.matchAll();
        
        clients.forEach(client => {
            client.postMessage({
                type: 'SYNC_STUDY_DATA',
                message: 'Syncing study data in background...'
            });
        });
        
        console.log('📊 Service Worker: Study data synced successfully');
    } catch (error) {
        console.error('❌ Service Worker: Study data sync failed:', error);
    }
}

// ==================== PUSH NOTIFICATIONS ====================
self.addEventListener('push', (event) => {
    console.log('📱 Service Worker: Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'Time to study! 📚',
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 'study-reminder'
        },
        actions: [
            {
                action: 'start-study',
                title: '📚 Start Studying',
                icon: '/icons/study.png'
            },
            {
                action: 'dismiss',
                title: '❌ Dismiss',
                icon: '/icons/dismiss.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Academic Hub Pro', options)
    );
});

// ==================== NOTIFICATION CLICK HANDLER ====================
self.addEventListener('notificationclick', (event) => {
    console.log('📱 Service Worker: Notification clicked');
    
    event.notification.close();
    
    if (event.action === 'start-study') {
        // Open the app and start a study session
        event.waitUntil(
            clients.openWindow('/?action=start-study')
        );
    } else if (event.action === 'dismiss') {
        // Just close the notification
        return;
    } else {
        // Default action - open the app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// ==================== MESSAGE HANDLER ====================
self.addEventListener('message', (event) => {
    console.log('💬 Service Worker: Message received:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

// ==================== CACHE MANAGEMENT ====================
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'cache-cleanup') {
        event.waitUntil(cleanupOldCaches());
    }
});

async function cleanupOldCaches() {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => 
        name.startsWith('academic-hub') && name !== CACHE_NAME && name !== DATA_CACHE_NAME
    );
    
    return Promise.all(
        oldCaches.map(cacheName => caches.delete(cacheName))
    );
}

console.log('🚀 Service Worker: Loaded successfully');
