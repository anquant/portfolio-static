import { DICTIONARY, LANG_TAG, localePath, type Locale } from './i18n';
import { BEHANCE_URL, SITE_URL } from './site';

export const AUTHOR_PROFILES = [BEHANCE_URL];

/** Link previews (Telegram, VK, …) for pages without an image of their own */
export const DEFAULT_OG_IMAGE = { src: '/og.png', width: 1200, height: 630 };

const BASE = SITE_URL.replace(/\/$/, '');

/** Absolute URL for a site path: "/about" → "https://moiseevp.ru/about" */
export function absUrl(path: string): string {
  if (/^https?:\/\//.test(path)) {
    return path;
  }
  const clean = path.split(/[?#]/)[0] ?? '';

  return clean === '/' || clean === '' ? `${BASE}/` : `${BASE}${clean.startsWith('/') ? '' : '/'}${clean}`;
}

/** Longest title that still gets the author suffix; past it, search results cut it anyway */
const TITLE_LIMIT = 70;

/** "<page> — Павел Моисеев", unless the title already names the author or is long enough on its own */
export function pageTitle(metaTitle: string, locale: Locale = 'ru'): string {
  const author = DICTIONARY[locale].authorName;
  const withAuthor = `${metaTitle} — ${author}`;

  return metaTitle.includes(author) || withAuthor.length > TITLE_LIMIT ? metaTitle : withAuthor;
}

type JsonLd = Record<string, unknown>;

const PERSON_ID = `${BASE}/#person`;

/** Reference to the person node, for author/creator/provider fields */
export const personRef: JsonLd = { '@id': PERSON_ID };

export function personLd(locale: Locale = 'ru', knowsAbout: string[] = []): JsonLd {
  const t = DICTIONARY[locale];

  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: t.authorName,
    jobTitle: t.authorJob,
    url: absUrl(localePath(locale, '/')),
    sameAs: AUTHOR_PROFILES,
    ...(knowsAbout.length > 0 && { knowsAbout }),
  };
}

export function websiteLd(locale: Locale = 'ru', description?: string): JsonLd {
  const url = absUrl(localePath(locale, '/'));

  return {
    '@type': 'WebSite',
    '@id': `${url}#website`,
    url,
    name: DICTIONARY[locale].authorName,
    ...(description && { description }),
    inLanguage: LANG_TAG[locale],
    publisher: personRef,
  };
}

/** Breadcrumbs from the home page down to the current page; paths are already localized */
export function breadcrumbLd(items: { name: string; path: string }[], locale: Locale = 'ru'): JsonLd {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: DICTIONARY[locale].home, path: localePath(locale, '/') }, ...items].map(
      (item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: absUrl(item.path),
      }),
    ),
  };
}

/** Wraps nodes into one JSON-LD document */
export function ldGraph(nodes: JsonLd[]): JsonLd {
  return { '@context': 'https://schema.org', '@graph': nodes };
}
