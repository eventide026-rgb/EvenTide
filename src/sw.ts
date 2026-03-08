/// <reference lib="webworker" />

/**
 * @fileOverview Service Worker for EvenTide PWA.
 * This file is processed by next-pwa to enable offline functionality.
 */

import { precacheAndRoute } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: (string | { url: string; revision: string | null })[] };

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// The precacheAndRoute function will be automatically replaced by next-pwa
// with the list of files to precache.
precacheAndRoute(self.__WB_MANIFEST);
