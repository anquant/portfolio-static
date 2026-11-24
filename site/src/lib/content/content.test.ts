import fs from 'fs';
import path from 'path';

import { describe, expect, it } from 'vitest';

import {
  CONTENT_DIR,
  ContentError,
  getAbout,
  getArticleBySlug,
  getBlogArticles,
  getClients,
  getContacts,
  getHome,
  getServicesList,
  getServicesPage,
  getWorks,
  parseContent,
  slugsInDir,
  toArticle,
  toService,
} from '.';
import { articleFrontmatterSchema, serviceFileSchema, workFileSchema } from './schemas';

/*
 * Runs the real content through the real loaders: the same checks the build
 * does, plus cross-file ones the schemas can't express (assets exist, slugs
 * resolve).
 */

const PUBLIC_DIR = path.join(process.cwd(), 'public');

/** Every "/…" string found anywhere inside a value */
function publicPaths(value: unknown): string[] {
  if (typeof value === 'string') {
    return /^\/[\w./-]+\.\w+$/.test(value) ? [value] : [];
  }
  if (Array.isArray(value)) {
    return value.flatMap(publicPaths);
  }
  if (value && typeof value === 'object') {
    return Object.values(value).flatMap(publicPaths);
  }

  return [];
}

describe('real content', () => {
  const works = getWorks();
  const services = getServicesList();
  const articles = getBlogArticles();

  it('loads and validates every file', () => {
    expect(works.length).toBe(slugsInDir('works').length);
    expect(services.length).toBe(slugsInDir('services').length);
    expect(articles.length).toBe(slugsInDir('blog').length);
    expect(() => [getHome(), getAbout(), getContacts(), getClients()]).not.toThrow();
  });

  it('references only assets that exist in public/', () => {
    const everything = [works, services, articles, getAbout(), getClients()];
    const missing = publicPaths(everything).filter(p => !fs.existsSync(path.join(PUBLIC_DIR, p)));
    expect(missing).toEqual([]);
  });

  it('gives every work a preview: a 3D scene or an illustration', () => {
    const bare = works.filter(w => !w.scene && !w.illustration);
    expect(bare.map(w => w.slug)).toEqual([]);
  });

  it('keeps the manual sort order unambiguous', () => {
    for (const list of [works, services]) {
      const orders = list.map(x => x.sort);
      expect(new Set(orders).size).toBe(orders.length);
    }
  });

  it('links services only to works that exist', () => {
    const slugs = new Set(works.map(w => w.slug));
    const broken = services.flatMap(s => (s.works ?? []).filter(w => !slugs.has(w)).map(w => `${s.slug} → ${w}`));
    expect(broken).toEqual([]);
  });

  it('lists articles newest first', () => {
    const dates = articles.map(a => a.pubdate);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it('returns undefined for an unknown article slug', () => {
    expect(getArticleBySlug('does-not-exist')).toBeUndefined();
  });
});

describe('English content', () => {
  const ru = { works: getWorks('ru'), services: getServicesList('ru') };
  const en = { works: getWorks('en'), services: getServicesList('en') };

  it('loads and validates every file', () => {
    expect(() => [getHome('en'), getAbout('en'), getContacts('en'), getServicesPage('en')]).not.toThrow();
  });

  it('translates every case and every service, and nothing extra', () => {
    expect(slugsInDir('en/works')).toEqual(slugsInDir('works'));
    expect(en.services.map(s => s.slug)).toEqual(ru.services.map(s => s.slug));
  });

  it('keeps cases identical apart from the text', () => {
    for (const [i, work] of en.works.entries()) {
      const base = ru.works[i]!;
      expect([work.slug, work.sort, work.scene, work.cover, work.mockups]).toEqual([
        base.slug,
        base.sort,
        base.scene,
        base.cover,
        base.mockups,
      ]);
    }
  });

  it('keeps service structure in step with the Russian site', () => {
    for (const [i, service] of en.services.entries()) {
      const base = ru.services[i]!;
      expect([service.sort, service.scene, service.works, service.content?.length]).toEqual([
        base.sort,
        base.scene,
        base.works,
        base.content?.length,
      ]);
    }
  });

  it('has no Russian left in it', () => {
    const files = [
      ...['home', 'about', 'contacts', 'services-page'].map(f => `en/${f}.json`),
      ...slugsInDir('en/works').map(s => `en/works/${s}.json`),
      ...slugsInDir('en/services').map(s => `en/services/${s}.json`),
    ];
    const cyrillic = files.filter(f => /[а-яё]/i.test(fs.readFileSync(path.join(CONTENT_DIR, f), 'utf8')));
    expect(cyrillic).toEqual([]);
  });

  it('never lets a case slug shadow the /en prefix', () => {
    expect(slugsInDir('works')).not.toContain('en');
  });
});

describe('validation errors', () => {
  const validWork = {
    sort: 1,
    title: 'T',
    description: 'D',
    infotext: 'I',
    company: 'C',
    problem: 'P',
    result: 'R',
    meta_title: 'M',
  };

  it('accepts a minimal valid file', () => {
    expect(() => parseContent(workFileSchema, validWork, 'works/x.json')).not.toThrow();
  });

  it('names the file and the field', () => {
    const bad = { ...validWork, scene: 'teapot' };
    expect(() => parseContent(workFileSchema, bad, 'works/x.json')).toThrow(/content\/works\/x\.json[\s\S]*scene/);
  });

  it('rejects unknown keys, which are usually typos', () => {
    const typo = {
      ...validWork,
      ilustration: { src: '/a.png', width: 1, height: 1 },
    };
    expect(() => parseContent(workFileSchema, typo, 'works/x.json')).toThrow(ContentError);
  });

  it('rejects malformed dates and asset paths', () => {
    const fm = {
      pubdate: '23.11.2026',
      category: 'seo',
      title: 'T',
      meta_title: 'M',
      image_src: 'images/no-leading-slash.png',
    };
    const error = (() => {
      try {
        parseContent(articleFrontmatterSchema, fm, 'blog/x.mdx');
      } catch (e) {
        return String(e);
      }
    })();
    expect(error).toMatch(/pubdate/);
    expect(error).toMatch(/image_src/);
  });
});

describe('page data is JSON-safe for getStaticProps', () => {
  /** Next.js rejects `undefined` anywhere in props */
  const hasUndefined = (value: object) => Object.values(value).some(v => v === undefined);
  const categories = [{ title: 'SEO', slug: 'seo' }];

  it('drops optional article fields that are absent', () => {
    const fm = parseContent(
      articleFrontmatterSchema,
      { pubdate: '2026-01-01', category: 'seo', title: 'T', meta_title: 'M' },
      'blog/x.mdx',
    );
    const article = toArticle(fm, 'x', categories);
    expect(hasUndefined(article)).toBe(false);
    expect(article).not.toHaveProperty('image');
  });

  it('drops a service without sections', () => {
    const file = parseContent(
      serviceFileSchema,
      { sort: 1, preview_title: 'P', preview_description: 'D', title: 'T', meta_title: 'M' },
      'services/x.json',
    );
    expect(hasUndefined(toService(file, 'x'))).toBe(false);
  });

  it('names the file when the category does not exist', () => {
    const fm = parseContent(
      articleFrontmatterSchema,
      { pubdate: '2026-01-01', category: 'nope', title: 'T', meta_title: 'M' },
      'blog/x.mdx',
    );
    expect(() => toArticle(fm, 'x', categories)).toThrow(/content\/blog\/x\.mdx[\s\S]*nope/);
  });
});

describe('article image fields', () => {
  const base = { pubdate: '2026-01-01', category: 'seo', title: 'T', meta_title: 'M' };
  const image = { image_src: '/images/a.png', image_width: 600, image_height: 600 };

  it('accept all three or none', () => {
    expect(() => parseContent(articleFrontmatterSchema, base, 'blog/x.mdx')).not.toThrow();
    expect(() => parseContent(articleFrontmatterSchema, { ...base, ...image }, 'blog/x.mdx')).not.toThrow();
  });

  it('reject a partial set instead of silently dropping the image', () => {
    const { image_height: _dropped, ...partial } = image;
    expect(() => parseContent(articleFrontmatterSchema, { ...base, ...partial }, 'blog/x.mdx')).toThrow(/go together/);
  });
});
