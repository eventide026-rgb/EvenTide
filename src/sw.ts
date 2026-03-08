
/// <reference lib="webworker" />

/**
 * @fileOverview Service Worker for EvenTide PWA.
 */

import { precacheAndRoute } from 'workbox-precaching';

// Augment self to include the ServiceWorkerGlobalScope and the __WB_MANIFEST property
declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: (string | { url: string; revision: string | null })[] };

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

precacheAndRoute(self.__WB_MANIFEST);
