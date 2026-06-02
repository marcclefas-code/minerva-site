export const directus = {
  url: import.meta.env.DIRECTUS_URL || 'https://directus.belinus.net',
};

export type Locale = 'en' | 'nl' | 'fr' | 'de' | 'it' | 'es' | 'zh' | 'ja';

type LocaleString = Record<string, string>;

function getLocaleStr(obj: LocaleString | string | null | undefined, locale: Locale): string {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  if (typeof obj === 'object') {
    return obj[locale] || obj['en'] || Object.values(obj)[0] || '';
  }
  return '';
}

async function fetchDirectus<T>(
  endpoint: string,
  params?: Record<string, string | boolean | number>
): Promise<T | null> {
  const url = new URL(`${directus.url}/${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }

  try {
    const res = await fetch(url.toString(), {
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as T;
  } catch {
    return null;
  }
}

export interface PageContent {
  slug: string;
  title: string;
  meta_description: string;
  eyebrow: string;
  heading: string;
  body: string;
  tag_line: string;
}

export interface SiteSettings {
  nav_about: string;
  nav_history: string;
  nav_aegis: string;
  nav_sovereign: string;
  nav_news: string;
  footer_legal: string;
  gdpr_accept: string;
  gdpr_reject: string;
  gdpr_message: string;
  subscribe_cta: string;
  subscribe_placeholder: string;
  subscribe_thanks: string;
}

export interface ProductReveal {
  slug: string;
  target_date: string;
  headline: string;
  subline: string;
  specs_html: string;
  teaser_image?: string;
}

export interface NewsArticle {
  id: number;
  slug: string;
  published_date: string;
  cover?: string;
  title: string;
  excerpt: string;
  body: string;
}

export interface TeamVacancy {
  id: number;
  department: string;
  location: string;
  type: string;
  title: string;
  description: string;
  requirements: string;
}

export interface HistoryEvent {
  id: number;
  year: number;
  order: number;
  title: string;
  body: string;
}

export interface LegalDocument {
  slug: string;
  body: string;
}

export interface GalleryImage {
  id: number;
  image: string;
  alt_key: string;
  page_slug: string;
}

function mapPage(raw: any, locale: Locale): PageContent | null {
  if (!raw) return null;
  return {
    slug: raw.slug,
    title: getLocaleStr(raw.title, locale),
    meta_description: getLocaleStr(raw.meta_description, locale),
    eyebrow: getLocaleStr(raw.eyebrow, locale),
    heading: getLocaleStr(raw.heading, locale),
    body: getLocaleStr(raw.body, locale),
    tag_line: getLocaleStr(raw.tag_line, locale),
  };
}

function mapProductReveal(raw: any, locale: Locale): ProductReveal | null {
  if (!raw) return null;
  return {
    slug: raw.slug,
    target_date: raw.target_date,
    headline: getLocaleStr(raw.headline, locale),
    subline: getLocaleStr(raw.subline, locale),
    specs_html: getLocaleStr(raw.specs_html, locale),
    teaser_image: raw.teaser_image ? `${directus.url}/assets/${raw.teaser_image}` : undefined,
  };
}

export const directusClient = {
  async getPage(slug: string, locale: Locale = 'en'): Promise<PageContent | null> {
    const items = await fetchDirectus<any[]>('items/pages', {
      'filter[slug][_eq]': slug,
      'single': 'true',
    });
    if (!items || items.length === 0) return null;
    return mapPage(items[0], locale);
  },

  async getAllPages(locale: Locale = 'en'): Promise<PageContent[]> {
    const items = await fetchDirectus<any[]>('items/pages', {
      'filter[status][_eq]': 'published',
    });
    if (!items) return [];
    return items.map(item => mapPage(item, locale)).filter((p): p is PageContent => p !== null);
  },

  async getSiteSettings(locale: Locale = 'en'): Promise<SiteSettings | null> {
    const raw = await fetchDirectus<any>('items/site_settings', { single: 'true' });
    if (!raw) return null;
    return {
      nav_about: getLocaleStr(raw.nav_about, locale),
      nav_history: getLocaleStr(raw.nav_history, locale),
      nav_aegis: getLocaleStr(raw.nav_aegis, locale),
      nav_sovereign: getLocaleStr(raw.nav_sovereign, locale),
      nav_news: getLocaleStr(raw.nav_news, locale),
      footer_legal: getLocaleStr(raw.footer_legal, locale),
      gdpr_accept: getLocaleStr(raw.gdpr_accept, locale),
      gdpr_reject: getLocaleStr(raw.gdpr_reject, locale),
      gdpr_message: getLocaleStr(raw.gdpr_message, locale),
      subscribe_cta: getLocaleStr(raw.subscribe_cta, locale),
      subscribe_placeholder: getLocaleStr(raw.subscribe_placeholder, locale),
      subscribe_thanks: getLocaleStr(raw.subscribe_thanks, locale),
    };
  },

  async getProductReveal(slug: string, locale: Locale = 'en'): Promise<ProductReveal | null> {
    const raw = await fetchDirectus<any>('items/product_reveals', {
      'filter[slug][_eq]': slug,
      'single': 'true',
    });
    return mapProductReveal(raw, locale);
  },

  async getNewsArticles(locale: Locale = 'en'): Promise<NewsArticle[]> {
    const items = await fetchDirectus<any[]>('items/news_articles', { 'sort': '-published_date' });
    if (!items) return [];
    return items.map(item => ({
      id: item.id,
      slug: item.slug,
      published_date: item.published_date,
      cover: item.cover ? `${directus.url}/assets/${item.cover}` : undefined,
      title: getLocaleStr(item.title, locale),
      excerpt: getLocaleStr(item.excerpt, locale),
      body: getLocaleStr(item.body, locale),
    }));
  },

  async getTeamVacancies(locale: Locale = 'en'): Promise<TeamVacancy[]> {
    const items = await fetchDirectus<any[]>('items/team_vacancies');
    if (!items) return [];
    return items.map(item => ({
      id: item.id,
      department: item.department,
      location: item.location,
      type: item.type,
      title: getLocaleStr(item.title, locale),
      description: getLocaleStr(item.description, locale),
      requirements: getLocaleStr(item.requirements, locale),
    }));
  },

  async getHistoryEvents(locale: Locale = 'en'): Promise<HistoryEvent[]> {
    const items = await fetchDirectus<any[]>('items/history_events', { 'sort': 'order' });
    if (!items) return [];
    return items.map(item => ({
      id: item.id,
      year: item.year,
      order: item.order,
      title: getLocaleStr(item.title, locale),
      body: getLocaleStr(item.body, locale),
    }));
  },

  async getLegalDocument(slug: string, locale: Locale = 'en'): Promise<LegalDocument | null> {
    const items = await fetchDirectus<any[]>('items/legal_documents', {
      'filter[slug][_eq]': slug,
      'single': 'true',
    });
    if (!items || items.length === 0) return null;
    return {
      slug: items[0].slug,
      body: getLocaleStr(items[0].body, locale),
    };
  },

  getAssetURL(fileId: string): string {
    return `${directus.url}/assets/${fileId}`;
  },

  async getGalleryImages(pageSlug?: string): Promise<GalleryImage[]> {
    const params: Record<string, string> = {};
    if (pageSlug) {
      params['filter[page_slug][_eq]'] = pageSlug;
    }
    const items = await fetchDirectus<GalleryImage[]>('items/gallery_images', params);
    return items || [];
  },
};
