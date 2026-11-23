import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { z } from "zod";

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
  type AboutData,
  type BlogArticlesData,
  type BlogCategoriesData,
  type BlogPageData,
  type ClientsData,
  type ContactsData,
  type HomeData,
  type ServicesListData,
  type ServicesPageData,
  type WorksData,
} from "./schemas";

/*
 * Build-time content layer. Every file under `content/` is parsed against
 * its schema when it is read: a typo in content fails `next build` with the
 * file name and the exact field, instead of shipping a broken page.
 *
 * Only called from getStaticProps / getStaticPaths (Node), never in the browser.
 */

export const CONTENT_DIR = path.join(process.cwd(), "content");

export class ContentError extends Error {
  constructor(file: string, detail: string) {
    super(`Invalid content in content/${file}:\n${detail}`);
    this.name = "ContentError";
  }
}

/** Validates `data` against `schema`; throws a ContentError naming the file */
export function parseContent<S extends z.ZodType>(
  schema: S,
  data: unknown,
  file: string
) {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ContentError(file, z.prettifyError(result.error));
  }
  return result.data as z.output<S>;
}

function readJson<S extends z.ZodType>(schema: S, file: string) {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
  return parseContent(schema, JSON.parse(raw), file);
}

/** File names (without extension) in a collection folder — they are the URL slugs */
export function slugsInDir(dir: string): string[] {
  return fs
    .readdirSync(path.join(CONTENT_DIR, dir))
    .filter((f) => /\.(json|mdx)$/.test(f))
    .map((f) => f.replace(/\.(json|mdx)$/, ""))
    .sort();
}

/* ------------------------------------------------------------------------ */
/* Single pages                                                             */
/* ------------------------------------------------------------------------ */

export const getHome = (): HomeData => readJson(homeSchema, "home.json");

export const getAbout = (): AboutData => readJson(aboutSchema, "about.json");

export const getContacts = (): ContactsData =>
  readJson(contactsSchema, "contacts.json");

export const getServicesPage = (): ServicesPageData =>
  readJson(servicesPageSchema, "services-page.json");

export const getBlogPage = (): BlogPageData =>
  readJson(blogPageSchema, "blog-page.json");

export const getBlogCategories = (): BlogCategoriesData[] =>
  readJson(z.array(blogCategorySchema), "blog-categories.json");

export const getClients = (): ClientsData[] =>
  readJson(z.array(clientSchema), "clients.json");

/* ------------------------------------------------------------------------ */
/* Works                                                                    */
/* ------------------------------------------------------------------------ */

export function getWorks(): WorksData[] {
  return slugsInDir("works")
    .map((slug) => ({
      ...readJson(workFileSchema, `works/${slug}.json`),
      slug,
    }))
    .sort((a, b) => a.sort - b.sort);
}

export function getWorkBySlug(slug: string): WorksData | undefined {
  return getWorks().find((w) => w.slug === slug);
}

/* ------------------------------------------------------------------------ */
/* Services                                                                 */
/* ------------------------------------------------------------------------ */

export function getServicesList(): ServicesListData[] {
  return slugsInDir("services")
    .map((slug) => {
      const { sections, ...service } = readJson(
        serviceFileSchema,
        `services/${slug}.json`
      );
      return { ...service, content: sections, slug };
    })
    .sort((a, b) => a.sort - b.sort);
}

export function getServiceBySlug(slug: string): ServicesListData | undefined {
  return getServicesList().find((s) => s.slug === slug);
}

/* ------------------------------------------------------------------------ */
/* Blog                                                                     */
/* ------------------------------------------------------------------------ */

function readArticle(slug: string) {
  const file = `blog/${slug}.mdx`;
  const { data, content } = matter(
    fs.readFileSync(path.join(CONTENT_DIR, file), "utf8")
  );
  const fm = parseContent(articleFrontmatterSchema, data, file);

  const category = getBlogCategories().find((c) => c.slug === fm.category);
  if (!category) {
    throw new ContentError(
      file,
      `✖ unknown category "${fm.category}" — add it to blog-categories.json`
    );
  }

  const article: BlogArticlesData = {
    pubdate: fm.pubdate,
    category,
    title: fm.title,
    annotation: fm.annotation,
    image_background_color: fm.image_background_color,
    ...(fm.scene && { scene: fm.scene }),
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
  };

  return { article, body: content };
}

/** Newest first */
export function getBlogArticles(): BlogArticlesData[] {
  return slugsInDir("blog")
    .map((slug) => readArticle(slug).article)
    .sort((a, b) => b.pubdate.localeCompare(a.pubdate));
}

export function getArticleBySlug(
  slug: string
): { article: BlogArticlesData; body: string } | undefined {
  if (!slugsInDir("blog").includes(slug)) return undefined;
  return readArticle(slug);
}
