import { createRequire } from 'node:module';

import { describe, expect, it } from 'vitest';

import {
  LANG_TAG,
  LOCALES,
  X_DEFAULT_LOCALE,
  alternatePath,
  formatPrice,
  localeFromPath,
  localePath,
  navigation,
  stripLocale,
  switchPath,
  formatDate,
} from './i18n';

describe('localeFromPath', () => {
  it.each([
    ['/', 'ru'],
    ['/about', 'ru'],
    ['/[slug]', 'ru'],
    ['/en', 'en'],
    ['/en/about', 'en'],
    ['/en/[slug]', 'en'],
    ['/en?page=2', 'en'],
    ['/en#works', 'en'],
    // a Russian slug that merely starts with "en"
    ['/energy', 'ru'],
  ])('%s → %s', (path, expected) => {
    expect(localeFromPath(path)).toBe(expected);
  });
});

describe('localePath / stripLocale', () => {
  it.each([
    ['/', '/en'],
    ['/about', '/en/about'],
    ['/services/seo', '/en/services/seo'],
    ['/#works', '/en#works'],
  ])('%s ↔ %s', (ru, en) => {
    expect(localePath('en', ru)).toBe(en);
    expect(stripLocale(en)).toBe(ru);
    expect(localePath('ru', ru)).toBe(ru);
  });

  it('leaves external links alone', () => {
    expect(localePath('en', 'https://igem.ru/')).toBe('https://igem.ru/');
  });
});

describe('alternatePath', () => {
  it('maps a page to its counterpart, without query and hash', () => {
    expect(alternatePath('/about', 'en')).toBe('/en/about');
    expect(alternatePath('/en/services/seo', 'ru')).toBe('/services/seo');
    expect(alternatePath('/en?page=2', 'ru')).toBe('/');
    expect(alternatePath('/?page=2#works', 'en')).toBe('/en');
  });

  it('pairs the blog index but not the articles, which are written per language', () => {
    expect(alternatePath('/blog', 'en')).toBe('/en/blog');
    expect(alternatePath('/en/blog?category=seo', 'ru')).toBe('/blog');
    expect(alternatePath('/blog/some-post', 'en')).toBeNull();
    expect(alternatePath('/blog/some-post', 'ru')).toBe('/blog/some-post');
    expect(alternatePath('/en/blog/a-post', 'ru')).toBeNull();
    expect(alternatePath('/en/blog/a-post', 'en')).toBe('/en/blog/a-post');
  });
});

describe('switchPath', () => {
  it('leads to the same page, or to the blog from an article', () => {
    expect(switchPath('/services/seo', 'en')).toBe('/en/services/seo');
    expect(switchPath('/blog/some-post', 'en')).toBe('/en/blog');
    expect(switchPath('/en/blog/a-post', 'ru')).toBe('/blog');
    expect(switchPath('/404', 'en')).toBe('/en');
  });
});

describe('navigation', () => {
  it('prefixes the links on the English site', () => {
    expect(navigation('en').map(i => i.slug)).toEqual(['/en', '/en/services', '/en/about', '/en/blog']);
    expect(navigation('ru').map(i => i.slug)).toEqual(['/', '/services', '/about', '/blog']);
  });
});

describe('formatDate', () => {
  it('writes the date the way each language does', () => {
    expect(formatDate('ru', '2026-01-16')).toBe('16 января 2026');
    expect(formatDate('en', '2026-01-16')).toBe('January 16, 2026');
  });
});

describe('formatPrice', () => {
  it('uses rubles in Russian and US dollars in English', () => {
    expect(formatPrice('ru', 120000)).toBe('120 000 ₽');
    expect(formatPrice('en', 2500)).toBe('$2,500');
  });
});

describe('sitemap hreflang', () => {
  // next-sitemap.config.js is CommonJS and repeats the alternatePath rules: keep them in step
  const require = createRequire(import.meta.url);
  const config = require('../../next-sitemap.config.js') as {
    transform: (config: unknown, loc: string) => Promise<{ alternateRefs: { href: string; hreflang: string }[] }>;
  };
  const SITE = 'https://moiseevp.ru';

  it.each([
    '/',
    '/about',
    '/services/seo',
    '/igem-ran',
    '/en',
    '/en/about',
    '/blog',
    '/en/blog',
    '/blog/x',
    '/en/blog/y',
  ])('%s', async loc => {
    const { alternateRefs } = await config.transform({}, loc);
    const expected = LOCALES.flatMap(l => {
      const path = alternatePath(loc, l);

      return path ? [{ hreflang: LANG_TAG[l], href: `${SITE}${path}` }] : [];
    });
    const xDefault = alternatePath(loc, X_DEFAULT_LOCALE);
    const pairs =
      expected.length > 1 && xDefault ? [...expected, { hreflang: 'x-default', href: `${SITE}${xDefault}` }] : [];

    expect(alternateRefs.map(({ hreflang, href }) => ({ hreflang, href }))).toEqual(pairs);
  });
});
