import { SITE_URL } from './site';

/** The person behind the site: the brand in titles and the author everywhere */
export const AUTHOR_NAME = 'Павел Моисеев';
export const AUTHOR_JOB = 'Fullstack веб-разработчик';
export const AUTHOR_PROFILES = ['https://www.behance.net/moiseevp'];

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
export function pageTitle(metaTitle: string): string {
  const withAuthor = `${metaTitle} — ${AUTHOR_NAME}`;

  return metaTitle.includes(AUTHOR_NAME) || withAuthor.length > TITLE_LIMIT ? metaTitle : withAuthor;
}
