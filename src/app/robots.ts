import { MetadataRoute } from 'next';
import { getSeoStore } from '@/lib/seo-service';

export default function robots(): MetadataRoute.Robots {
  const store = getSeoStore();
  const baseUrl = store.globalSettings.baseUrl || 'https://convertirwordapdf.net';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/haider-project', '/haider-project/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
