import { MetadataRoute } from 'next';
import { getSeoStore } from '@/lib/seo-service';

export default function sitemap(): MetadataRoute.Sitemap {
  const store = getSeoStore();
  const baseUrl = (store.globalSettings.baseUrl || 'https://www.convertirwordapdf.net').replace(/\/$/, '');
  const pages = store.pages || {};

  const entries: MetadataRoute.Sitemap = [];

  for (const slug of Object.keys(pages)) {
    const page = pages[slug];
    if (!page) continue;

    // Skip pages marked as noindex or excluded from sitemap
    if (page.robots?.index === false || page.sitemap?.includeInSitemap === false) {
      continue;
    }

    // Skip admin pages
    if (slug.includes('haider-project')) {
      continue;
    }

    const cleanSlug = page.slug === '/' ? '' : page.slug.startsWith('/') ? page.slug : `/${page.slug}`;
    const url = `${baseUrl}${cleanSlug}`;

    entries.push({
      url,
      lastModified: page.lastModified || new Date().toISOString(),
      changeFrequency: page.sitemap?.changeFrequency || 'weekly',
      priority: typeof page.sitemap?.priority === 'number' ? page.sitemap.priority : 0.9,
    });
  }

  // Ensure default home exists if empty
  if (entries.length === 0) {
    entries.push({
      url: `${baseUrl}/`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 1.0,
    });
  }

  return entries;
}
