import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FisherMate.Ai - Fishing Companion',
    short_name: 'FisherMate.Ai',
    description: 'Your comprehensive fishing companion with AI assistance, weather updates, safety tips, and fishing laws.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#2563eb',
    categories: ['sports', 'lifestyle', 'navigation'],
    orientation: 'portrait',
    scope: '/',
    lang: 'en',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon',
        purpose: 'any'
      },
      {
        src: '/favicon.svg',
        sizes: '72x72 96x96 128x128 256x256',
        type: 'image/svg+xml',
        purpose: 'maskable'
      },
      {
        src: '/apple-touch-icon.svg',
        sizes: '180x180',
        type: 'image/svg+xml',
        purpose: 'any'
      }
    ],
    screenshots: [
      {
        src: '/screenshots/desktop.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: 'FisherMate.AI Desktop Experience'
      },
      {
        src: '/screenshots/mobile.png',
        sizes: '375x667',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'FisherMate.AI Mobile Experience'
      }
    ],
    shortcuts: [
      {
        name: 'Weather Forecast',
        url: '/dashboard?section=weather',
        description: 'Check current weather conditions and fishing forecasts',
        icons: [
          {
            src: '/favicon.svg',
            sizes: '96x96',
            type: 'image/svg+xml'
          }
        ]
      },
      {
        name: 'Safety Tips',
        url: '/safety',
        description: 'View important fishing safety guidelines',
        icons: [
          {
            src: '/favicon.svg',
            sizes: '96x96',
            type: 'image/svg+xml'
          }
        ]
      },
      {
        name: 'Fishing Laws',
        url: '/laws',
        description: 'Check local fishing regulations and laws',
        icons: [
          {
            src: '/favicon.svg',
            sizes: '96x96',
            type: 'image/svg+xml'
          }
        ]
      },
      {
        name: 'AI Assistant',
        url: '/chat',
        description: 'Get AI-powered fishing advice and tips',
        icons: [
          {
            src: '/favicon.svg',
            sizes: '96x96',
            type: 'image/svg+xml'
          }
        ]
      }
    ],
    prefer_related_applications: false,
    related_applications: []
  };
}
