// layout.tsx

import type { Metadata } from "next";
import "swiper/css";
import "../../public/styles/style.css";
import ClientWrapper from "@/components/clientwrapper";

export const metadata: Metadata = {
  title: 'Heirary',
  description: 'Secure your digital legacy with Heirary',
  icons: {
    icon: [
      { url: '/img/favicon.ico' },
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        itemScope
        itemType="http://schema.org/WebPage"
        className="overflow-x-hidden font-body text-lisabona-500 dark:bg-lisabona-900"
      >
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}