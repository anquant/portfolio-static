import { describe, expect, it } from 'vitest';

import { absUrl, breadcrumbLd, ldGraph, pageTitle } from './seo';

describe('absUrl', () => {
  it.each([
    ['/', 'https://moiseevp.ru/'],
    ['', 'https://moiseevp.ru/'],
    ['/about', 'https://moiseevp.ru/about'],
    ['about', 'https://moiseevp.ru/about'],
    ['/blog?page=2', 'https://moiseevp.ru/blog'],
    ['/#works', 'https://moiseevp.ru/'],
    ['/images/og.png', 'https://moiseevp.ru/images/og.png'],
    ['https://igem.ru/', 'https://igem.ru/'],
  ])('%s → %s', (path, expected) => {
    expect(absUrl(path)).toBe(expected);
  });
});

describe('pageTitle', () => {
  it('adds the author to a short title', () => {
    expect(pageTitle('Контакты')).toBe('Контакты — Павел Моисеев');
  });

  it('keeps a title that already names the author', () => {
    expect(pageTitle('Павел Моисеев — веб-разработчик')).toBe('Павел Моисеев — веб-разработчик');
  });

  it('keeps a long title as is instead of pushing it past the search snippet', () => {
    const long = 'Ваш сайт не продаёт? Почему бизнес переходит на Next.js — скорость, SEO';

    expect(pageTitle(long)).toBe(long);
  });
});

describe('breadcrumbLd', () => {
  it('starts at the home page and numbers the items', () => {
    expect(breadcrumbLd([{ name: 'Блог', path: '/blog' }])).toEqual({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Главная', item: 'https://moiseevp.ru/' },
        { '@type': 'ListItem', position: 2, name: 'Блог', item: 'https://moiseevp.ru/blog' },
      ],
    });
  });
});

describe('ldGraph', () => {
  it('wraps nodes into one schema.org document', () => {
    expect(ldGraph([{ '@type': 'WebSite' }])).toEqual({
      '@context': 'https://schema.org',
      '@graph': [{ '@type': 'WebSite' }],
    });
  });
});

describe('English pages', () => {
  it('sign titles with the English name', () => {
    expect(pageTitle('Contact', 'en')).toBe('Contact — Pavel Moiseev');
  });

  it('start breadcrumbs at the English home page', () => {
    expect(breadcrumbLd([{ name: 'Services', path: '/en/services' }], 'en')).toMatchObject({
      itemListElement: [
        { position: 1, name: 'Home', item: 'https://moiseevp.ru/en' },
        { position: 2, name: 'Services', item: 'https://moiseevp.ru/en/services' },
      ],
    });
  });
});
