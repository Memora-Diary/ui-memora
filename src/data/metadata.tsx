// metadata.ts
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Heirary',
  description: 'Secure your digital legacy with Heirary',
  icons: {
    icon: [
      { url: '/img/favicon.ico', sizes: 'any' },
      { url: '/img/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/img/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/img/apple-touch-icon.png' },
    ],
    other: [
      { rel: 'android-chrome-192x192', url: '/img/android-chrome-192x192.png' },
      { rel: 'android-chrome-512x512', url: '/img/android-chrome-512x512.png' },
    ],
  },
  manifest: '/img/site.webmanifest',
};