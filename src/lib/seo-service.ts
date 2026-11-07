import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import type { Metadata } from 'next';

export interface BreadcrumbItem {
  name: string;
  item: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface PageSeoConfig {
  id: string;
  slug: string;
  name: string;
  seoTitle: string;
  metaDescription: string;
  focusKeyword: string;
  secondaryKeywords: string[];
  canonicalUrl: string;
  robots: {
    index: boolean;
    follow: boolean;
    noarchive: boolean;
    nosnippet: boolean;
    maxSnippet: number;
    maxImagePreview: 'none' | 'standard' | 'large';
  };
  openGraph: {
    title: string;
    description: string;
    image: string;
    type: string;
  };
  featureImage: {
    url: string;
    alt: string;
    title: string;
    width?: number;
    height?: number;
  };
  breadcrumbs: BreadcrumbItem[];
  schemaJsonLd: Record<string, any>;
  content: {
    h1: string;
    subtitle: string;
  };
  faqs: FaqItem[];
  sitemap: {
    includeInSitemap: boolean;
    priority: number;
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  };
  lastModified: string;
}

export interface RedirectRule {
  id: string;
  source: string;
  destination: string;
  permanent: boolean;
  active: boolean;
  notes?: string;
  createdAt: string;
}

export interface GlobalSeoSettings {
  siteName: string;
  baseUrl: string;
  defaultOgImage: string;
  twitterHandle: string;
  googleSiteVerification?: string;
  bingSiteVerification?: string;
}

export interface SeoStoreData {
  version: number;
  globalSettings: GlobalSeoSettings;
  pages: Record<string, PageSeoConfig>;
  redirects: RedirectRule[];
}

const ADMIN_PASSWORD = process.env.SEO_ADMIN_PASSWORD || 'Ali@5121472';
const AUTH_SECRET = process.env.SEO_AUTH_SECRET || 'seo_secret_salt_5121472_convertir_word_a_pdf';
const AUTH_COOKIE_NAME = 'haider_seo_session';

let memoryCache: SeoStoreData | null = null;

function getStoreFilePath(): string {
  const primaryPath = path.join(process.cwd(), 'src', 'data', 'seo-store.json');
  return primaryPath;
}

function getTmpStoreFilePath(): string {
  return path.join(os.tmpdir(), 'seo-store.json');
}

/**
 * Loads the complete SEO configuration
 */
export function getSeoStore(): SeoStoreData {
  if (memoryCache) {
    return memoryCache;
  }

  // 1. Try reading from /tmp (if updated during runtime)
  const tmpPath = getTmpStoreFilePath();
  if (fs.existsSync(tmpPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(tmpPath, 'utf8'));
      memoryCache = data;
      return data;
    } catch {}
  }

  // 2. Try reading from project repo
  const primaryPath = getStoreFilePath();
  if (fs.existsSync(primaryPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(primaryPath, 'utf8'));
      memoryCache = data;
      return data;
    } catch {}
  }

  // 3. Fallback to minimal default
  const fallback: SeoStoreData = {
    version: 1,
    globalSettings: {
      siteName: 'Convertir Word a PDF',
      baseUrl: 'https://convertirwordapdf.net',
      defaultOgImage: 'https://convertirwordapdf.net/icon-512.png',
      twitterHandle: '@convertirwordapdf',
    },
    pages: {},
    redirects: [],
  };

  memoryCache = fallback;
  return fallback;
}

/**
 * Persists updated SEO configuration
 */
export async function saveSeoStore(data: SeoStoreData): Promise<boolean> {
  memoryCache = data;
  let saved = false;

  // 1. Write to /tmp
  try {
    await fs.promises.writeFile(getTmpStoreFilePath(), JSON.stringify(data, null, 2), 'utf8');
    saved = true;
  } catch (err) {
    console.warn('Could not write to /tmp:', err);
  }

  // 2. Write to project src/data
  try {
    const primaryPath = getStoreFilePath();
    const dir = path.dirname(primaryPath);
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
    }
    await fs.promises.writeFile(primaryPath, JSON.stringify(data, null, 2), 'utf8');
    saved = true;
  } catch (err) {
    console.warn('Could not write to src/data (read-only filesystem in serverless):', err);
  }

  return saved;
}

/**
 * Normalizes slug path for key lookup
 */
export function normalizeSlug(slug: string): string {
  if (!slug || slug === '/' || slug === '') return '/';
  let s = slug.trim();
  if (!s.startsWith('/')) s = '/' + s;
  return s;
}

/**
 * Retrieves page config by slug
 */
export function getPageSeo(slug: string): PageSeoConfig | undefined {
  const store = getSeoStore();
  const normalized = normalizeSlug(slug);

  // Exact match
  if (store.pages[normalized]) return store.pages[normalized];

  // Try with/without trailing slash
  const withSlash = normalized.endsWith('/') ? normalized : `${normalized}/`;
  const withoutSlash = normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;

  return store.pages[withSlash] || store.pages[withoutSlash];
}

/**
 * Generates Next.js Metadata dynamically from stored SEO settings
 */
export function generatePageMetadata(slug: string, fallbackDefaults?: Partial<Metadata>): Metadata {
  const page = getPageSeo(slug);
  const store = getSeoStore();
  const baseUrl = store.globalSettings.baseUrl || 'https://convertirwordapdf.net';

  if (!page) {
    return {
      title: fallbackDefaults?.title || 'Convertir Word a PDF Gratis Online',
      description: fallbackDefaults?.description || 'Convierte documentos en línea gratis.',
      ...fallbackDefaults,
    };
  }

  const canonical = page.canonicalUrl || `${baseUrl}${page.slug}`;
  const ogImage = page.featureImage?.url || page.openGraph?.image || store.globalSettings.defaultOgImage;
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`;

  const robotsConfig = {
    index: page.robots.index,
    follow: page.robots.follow,
    noarchive: page.robots.noarchive,
    nosnippet: page.robots.nosnippet,
    'max-snippet': page.robots.maxSnippet,
    'max-image-preview': page.robots.maxImagePreview,
  };

  return {
    title: page.seoTitle,
    description: page.metaDescription,
    keywords: [page.focusKeyword, ...(page.secondaryKeywords || [])],
    alternates: {
      canonical,
    },
    robots: robotsConfig as any,
    openGraph: {
      title: page.openGraph.title || page.seoTitle,
      description: page.openGraph.description || page.metaDescription,
      url: canonical,
      siteName: store.globalSettings.siteName,
      type: (page.openGraph.type as any) || 'website',
      images: [
        {
          url: fullOgImage,
          width: page.featureImage?.width || 1200,
          height: page.featureImage?.height || 630,
          alt: page.featureImage?.alt || page.seoTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: page.openGraph.title || page.seoTitle,
      description: page.openGraph.description || page.metaDescription,
      images: [fullOgImage],
    },
  };
}

/**
 * Authentication Helpers for /haider-project
 */
export function verifyAdminPassword(password: string): boolean {
  if (!password) return false;
  return password.trim() === ADMIN_PASSWORD.trim();
}

export function createAuthToken(): string {
  const timestamp = Date.now().toString();
  const hmac = crypto.createHmac('sha256', AUTH_SECRET);
  hmac.update(`${ADMIN_PASSWORD}:${timestamp}`);
  const signature = hmac.digest('hex');
  return `${timestamp}.${signature}`;
}

export function verifyAuthToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestamp, signature] = parts;
  const timeNum = parseInt(timestamp, 10);
  if (isNaN(timeNum)) return false;

  // Token expires after 7 days
  const maxAge = 7 * 24 * 60 * 60 * 1000;
  if (Date.now() - timeNum > maxAge) return false;

  const hmac = crypto.createHmac('sha256', AUTH_SECRET);
  hmac.update(`${ADMIN_PASSWORD}:${timestamp}`);
  const expectedSig = hmac.digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
}

export { AUTH_COOKIE_NAME };
