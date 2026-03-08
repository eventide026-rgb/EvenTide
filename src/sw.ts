/// <reference lib="webworker" />

/**
 * @fileOverview Service Worker for EvenTide PWA.
 * Technical fix for property 'addEventListener' does not exist on type 'typeof globalThis'.
 */

import { precacheAndRoute } from 'workbox-precaching';

// Correctly augment self to include the ServiceWorkerGlobalScope and the __WB_MANIFEST property
declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: (string | { url: string; revision: string | null })[] };

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event: ExtendableEvent) => {
    event.waitUntil(self.clients.claim());
});

precacheAndRoute(self.__WB_MANIFEST);
