import fs from 'fs';
import path from 'path';

import matter from 'gray-matter';
import { z } from 'zod';

import type { Locale } from '@/lib/i18n';

import {
  aboutSchema,
  articleFrontmatterSchema,
  blogCategorySchema,
  blogPageSchema,
  clientSchema,
  contactsSchema,
  homeSchema,
  serviceFileSchema,
  servicesPageSchema,
  workFileSchema,
  workTranslationSchema,
  type AboutData,
  type ArticleFrontmatter,
  type BlogArticlesData,
  type BlogCategoriesData,
  type BlogPageData,
  type ClientsData,
  type ContactsData,
  type HomeData,
  type ServiceFile,
  type ServicesListData,
  type ServicesPageData,
  type WorksData,
} from './schemas';

/*
 * Build-time content layer. Every file under `content/` is parsed against
 * its schema when it is read: a typo in content fails `next build` with the
 * file name and the exact field, instead of shipping a broken page.
 *
 * Only called from getStaticProps / getStaticPaths (Node), never in the browser.
 */

export const CONTENT_DIR = path.join(process.cwd(), 'content');

export class ContentError extends Error {
  constructor(file: string, detail: string) {
    super(`Invalid content in content/${file}:\n${detail}`);
    this.name = 'ContentError';
  }
}

/** Validates `data` against `schema`; throws a ContentError naming the file */
export function parseContent<S extends z.ZodType>(schema: S, data: unknown, file: string) {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ContentError(file, z.prettifyError(result.error));
  }

  return result.data as z.output<S>;
}

function readJson<S extends z.ZodType>(schema: S, file: string) {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8');

  return parseContent(schema, JSON.parse(raw), file);
}

/** File names (without extension) in a collection folder — they are the URL slugs */
export function slugsInDir(dir: string): string[] {
  return fs
    .readdirSync(path.join(CONTENT_DIR, dir))
    .filter(f => /\.(json|mdx)$/.test(f))
    .map(f => f.replace(/\.(json|mdx)$/, ''))
    .sort();
}

/**
 * Russian content sits at the root of `content/`, English in `content/en/`
 * with the same file names. The blog, its categories and the client logos
 * are Russian-only / shared and have no English copy.
 */
export function localized(locale: Locale, file: string): string {
  return locale === 'ru' ? file : `${locale}/${file}`;
}

/* ------------------------------------------------------------------------ */
/* Single pages                                                             */
/* ------------------------------------------------------------------------ */

export const getHome = (locale: Locale = 'ru'): HomeData => readJson(homeSchema, localized(locale, 'home.json'));

export const getAbout = (locale: Locale = 'ru'): AboutData => readJson(aboutSchema, localized(locale, 'about.json'));

export const getContacts = (locale: Locale = 'ru'): ContactsData =>
  readJson(contactsSchema, localized(locale, 'contacts.json'));

export const getServicesPage = (locale: Locale = 'ru'): ServicesPageData =>
  readJson(servicesPageSchema, localized(locale, 'services-page.json'));

export const getBlogPage = (locale: Locale = 'ru'): BlogPageData =>
  readJson(blogPageSchema, localized(locale, 'blog-page.json'));

/** One shared list of categories; the English site gets their English titles */
export const getBlogCategories = (locale: Locale = 'ru'): BlogCategoriesData[] =>
  readJson(z.array(blogCategorySchema), 'blog-categories.json').map(({ title_en, ...category }) => ({
    ...category,
    title: locale === 'en' && title_en ? title_en : category.title,
  }));

/** One shared list; the English site gets the Latin spelling of each name */
export const getClients = (locale: Locale = 'ru'): ClientsData[] =>
  readJson(z.array(clientSchema), 'clients.json').map(({ title_en, ...client }) => ({
    ...client,
    title: locale === 'en' && title_en ? title_en : client.title,
  }));

/* ------------------------------------------------------------------------ */
/* Works                                                                    */
/* ------------------------------------------------------------------------ */

/** A translation replaces the text fields; a field it leaves out is dropped, not kept in Russian */
function readWork(slug: string, locale: Locale): WorksData {
  const base = readJson(workFileSchema, `works/${slug}.json`);
  if (locale === 'ru') {
    return { ...base, slug };
  }
  const { scope: _scope, mockups_description: _mockups, meta_description: _meta, ...media } = base;

  return withoutUndefined({
    ...media,
    ...readJson(workTranslationSchema, localized(locale, `works/${slug}.json`)),
    slug,
  });
}

export function getWorks(locale: Locale = 'ru'): WorksData[] {
  return slugsInDir('works')
    .map(slug => readWork(slug, locale))
    .sort((a, b) => a.sort - b.sort);
}

export function getWorkBySlug(slug: string, locale: Locale = 'ru'): WorksData | undefined {
  return getWorks(locale).find(w => w.slug === slug);
}

/* ------------------------------------------------------------------------ */
/* Services                                                                 */
/* ------------------------------------------------------------------------ */

/**
 * getStaticProps props must be JSON: Next.js rejects `undefined`. Optional
 * fields that are absent from a file are dropped instead of kept as
 * `key: undefined`, so a valid file never fails later in serialisation.
 */
function withoutUndefined<T extends object>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as T;
}

/** services/<slug>.json → page data (`sections` is exposed as `content`) */
export function toService(file: ServiceFile, slug: string): ServicesListData {
  const { sections, ...service } = file;

  return withoutUndefined({ ...service, content: sections, slug });
}

export function getServicesList(locale: Locale = 'ru'): ServicesListData[] {
  const dir = localized(locale, 'services');

  return slugsInDir(dir)
    .map(slug => toService(readJson(serviceFileSchema, `${dir}/${slug}.json`), slug))
    .sort((a, b) => a.sort - b.sort);
}

export function getServiceBySlug(slug: string, locale: Locale = 'ru'): ServicesListData | undefined {
  return getServicesList(locale).find(s => s.slug === slug);
}

/* ------------------------------------------------------------------------ */
/* Blog                                                                     */
/* ------------------------------------------------------------------------ */

/** Validated frontmatter → page data; `file` is only used in error messages */
export function toArticle(
  fm: ArticleFrontmatter,
  slug: string,
  categories: BlogCategoriesData[],
  file = `blog/${slug}.mdx`,
): BlogArticlesData {
  const category = categories.find(c => c.slug === fm.category);
  if (!category) {
    throw new ContentError(file, `✖ unknown category "${fm.category}" — add it to blog-categories.json`);
  }

  return withoutUndefined({
    pubdate: fm.pubdate,
    category,
    title: fm.title,
    annotation: fm.annotation,
    image_background_color: fm.image_background_color,
    ...(fm.scene && { scene: fm.scene }),
    // the schema guarantees all three image fields or none
    ...(fm.image_src &&
      fm.image_width &&
      fm.image_height && {
        image: {
          src: fm.image_src,
          width: fm.image_width,
          height: fm.image_height,
        },
      }),
    meta_title: fm.meta_title,
    meta_description: fm.meta_description,
    slug,
  });
}

/** Each language has its own posts: blog/ (Russian) and en/blog/ */
function readArticle(slug: string, locale: Locale) {
  const file = localized(locale, `blog/${slug}.mdx`);
  const { data, content } = matter(fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8'));
  const fm = parseContent(articleFrontmatterSchema, data, file);

  return { article: toArticle(fm, slug, getBlogCategories(locale), file), body: content };
}

/** Newest first */
export function getBlogArticles(locale: Locale = 'ru'): BlogArticlesData[] {
  return slugsInDir(localized(locale, 'blog'))
    .map(slug => readArticle(slug, locale).article)
    .sort((a, b) => b.pubdate.localeCompare(a.pubdate));
}

export function getArticleBySlug(
  slug: string,
  locale: Locale = 'ru',
): { article: BlogArticlesData; body: string } | undefined {
  if (!slugsInDir(localized(locale, 'blog')).includes(slug)) {
    return undefined;
  }

  return readArticle(slug, locale);
}
