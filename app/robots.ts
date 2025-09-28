import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login', '/register', '/pricing'],
        disallow: ['/dashboard/', '/api/', '/admin/', '/_next/'],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/login', '/register', '/pricing'],
        disallow: ['/dashboard/', '/api/', '/admin/', '/_next/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}