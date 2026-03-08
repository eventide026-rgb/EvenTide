
/// <reference lib="webworker" />

/**
 * @fileOverview Service Worker for EvenTide PWA.
 * Technical fix for 'Property addEventListener does not exist on type ServiceWorkerGlobalScope'
 */

import { precacheAndRoute } from 'workbox-precaching';

// Augment the self type to include the manifest required by Workbox
declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: (string | { url: string; revision: string | null })[] };

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

precacheAndRoute(self.__WB_MANIFEST);
