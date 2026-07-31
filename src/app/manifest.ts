import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'JRC Industrial Sales ERP',
    short_name: 'JRC ERP',
    description: 'Enterprise Resource Planning & Operational Intelligence for Chemical Manufacturing and Pest Control Services',
    start_url: '/',
    display: 'standalone',
    background_color: '#090d16',
    theme_color: '#090d16',
    icons: [
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
