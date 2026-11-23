import { describe, expect, it } from 'vitest';

import { absUrl, pageTitle } from './seo';

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
