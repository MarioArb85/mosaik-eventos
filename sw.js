const CACHE_NAME = 'mosaik-cache-v1';
// Lista de todos los archivos y rutas que queremos cachear. 
// Incluye HTML, CSS (en línea), fuentes, librerías e imágenes clave.
const urlsToCache = [
    '/', // La página principal
    '/index.html',
    '/manifest.json',
    'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Open+Sans:wght@400;600&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
    
    // Imágenes (Desktop, Tablet, Mobile, Logotipos y Carrusel)
    'mosaik-favicon.jpg',
    'mosaik-logo.jpg',
    'fondo-madera-clara.png', // Fondo de madera
    
    // Hero y CTA Backgrounds
    'hero-desktop.jpg',
    'hero-tablet.jpg',
    'hero-mobile.jpg',
    'cta-desktop.jpg',
    'cta-tablet.jpg',
    'cta-mobile.jpg',
    
    // Carrusel
    'evento-mosaik-01.jpg',
    'evento-mosaik-02.jpg',
    'evento-mosaik-03.jpg',
    'evento-mosaik-04.jpg',
    'evento-mosaik-05.jpg',
    
    // Clientes y Sobre Nosotros
    'logo-tedX.png',
    'logo-telefonica.png',
    'logo-kfc.png',
    'logo-tactik.png',
    'sobre-nosotros.jpg'
];

// Evento: Install (Instalación del Service Worker)
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker instalado: Cacheando shell estática');
                return cache.addAll(urlsToCache);
            })
    );
});

// Evento: Activate (Activación del Service Worker)
// Se usa para limpiar las cachés antiguas (si cambiamos el CACHE_NAME)
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Service Worker: Eliminando caché antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Evento: Fetch (Manejo de Solicitudes)
// Aquí es donde interceptamos las peticiones y servimos desde la caché
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Si encontramos el recurso en la caché, lo devolvemos
                if (response) {
                    return response;
                }
                // Si no, lo cargamos desde la red (y luego lo cacheamos si es necesario)
                return fetch(event.request).then(
                    function(response) {
                        // Comprobamos si recibimos una respuesta válida
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clonamos la respuesta porque la respuesta es un stream
                        const responseToCache = response.clone();

                        // Cacheamos nuevas peticiones para futuras visitas
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                // Solo cacheamos los archivos listados inicialmente para evitar llenar la caché
                                if (urlsToCache.includes(event.request.url.split(self.location.origin)[1] || event.request.url)) {
                                    cache.put(event.request, responseToCache);
                                }
                            });

                        return response;
                    }
                );
            })
    );
});