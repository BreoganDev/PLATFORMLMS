// service-worker.js
const CACHE_NAME = 'maternidad-en-calma-v1.0.0'
const STATIC_CACHE_NAME = `${CACHE_NAME}-static`
const DYNAMIC_CACHE_NAME = `${CACHE_NAME}-dynamic`

// Archivos críticos que siempre deben estar en caché
const STATIC_ASSETS = [
  '/',
  '/courses',
  '/login',
  '/register',
  '/dashboard',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/_next/static/css/app/layout.css',
  '/_next/static/chunks/webpack.js',
  '/offline.html'
]

// Rutas que se cachean dinámicamente
const DYNAMIC_ROUTES = [
  '/course/',
  '/api/',
  '/_next/static/',
  '/_next/image'
]

// Recursos externos que pueden cachearse
const EXTERNAL_RESOURCES = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://images.unsplash.com'
]

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('Service Worker: Static assets cached successfully')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Service Worker: Error caching static assets:', error)
      })
  )
})

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.includes('maternidad-en-calma') && 
                cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker: Activated successfully')
        return self.clients.claim()
      })
  )
})

// Interceptar peticiones de red
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Solo manejar peticiones GET
  if (request.method !== 'GET') return
  
  // Estrategias de caché según el tipo de recurso
  if (isStaticAsset(request.url)) {
    // Cache First para assets estáticos
    event.respondWith(cacheFirst(request))
  } else if (isAPIRequest(request.url)) {
    // Network First para APIs
    event.respondWith(networkFirst(request))
  } else if (isImageRequest(request.url)) {
    // Cache First para imágenes
    event.respondWith(cacheFirst(request))
  } else if (isHTMLRequest(request)) {
    // Network First para HTML con fallback offline
    event.respondWith(networkFirstWithOffline(request))
  } else {
    // Stale While Revalidate para otros recursos
    event.respondWith(staleWhileRevalidate(request))
  }
})

// Estrategia Cache First
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('Cache First failed:', error)
    return new Response('Offline', { status: 503 })
  }
}

// Estrategia Network First
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    return new Response(
      JSON.stringify({ error: 'Offline', message: 'No internet connection' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Estrategia Network First con fallback offline
async function networkFirstWithOffline(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Retornar página offline para navegación
    return caches.match('/offline.html')
  }
}

// Estrategia Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME)
  const cachedResponse = await cache.match(request)
  
  const networkResponsePromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  }).catch(() => cachedResponse)
  
  return cachedResponse || networkResponsePromise
}

// Funciones auxiliares
function isStaticAsset(url) {
  return url.includes('/_next/static/') || 
         url.includes('/icons/') ||
         url.includes('.css') ||
         url.includes('.js') ||
         url.includes('/manifest.json')
}

function isAPIRequest(url) {
  return url.includes('/api/')
}

function isImageRequest(url) {
  return url.includes('/images/') ||
         url.includes('/_next/image') ||
         url.includes('unsplash.com') ||
         url.includes('.jpg') ||
         url.includes('.jpeg') ||
         url.includes('.png') ||
         url.includes('.webp') ||
         url.includes('.svg')
}

function isHTMLRequest(request) {
  return request.headers.get('accept')?.includes('text/html')
}

// Manejar notificaciones push (si las implementas más tarde)
self.addEventListener('push', (event) => {
  console.log('Push notification received')
  
  if (!event.data) return
  
  const data = event.data.json()
  
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: data.data,
    actions: [
      {
        action: 'open',
        title: 'Ver curso'
      },
      {
        action: 'dismiss',
        title: 'Descartar'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'open') {
    const urlToOpen = event.notification.data?.url || '/'
    
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus().then(() => {
            return clientList[0].navigate(urlToOpen)
          })
        } else {
          return self.clients.openWindow(urlToOpen)
        }
      })
    )
  }
})

// Sincronización en segundo plano
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Aquí puedes sincronizar datos cuando vuelva la conexión
      console.log('Background sync triggered')
    )
  }
})