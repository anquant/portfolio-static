import fs from "fs";
import path from "path";
import matter from "gray-matter";

import homeJson from "../../content/home.json";
import aboutJson from "../../content/about.json";
import contactsJson from "../../content/contacts.json";
import servicesPageJson from "../../content/services-page.json";
import blogPageJson from "../../content/blog-page.json";
import blogCategoriesJson from "../../content/blog-categories.json";
import clientsJson from "../../content/clients.json";

import { HomeData } from "./types/homeType";
import { AboutData } from "./types/aboutType";
import { ContactsData } from "./types/contactsType";
import { ClientsData } from "./types/clientsType";
import { WorksData } from "./types/worksType";
import {
  ServicesPageData,
  ServicesListData,
} from "./types/servicesType";
import {
  BlogPageData,
  BlogCategoriesData,
  BlogArticlesData,
} from "./types/blogType";

const CONTENT_DIR = path.join(process.cwd(), "content");

function slugsInDir(dir: string): string[] {
  return fs
    .readdirSync(path.join(CONTENT_DIR, dir))
    .filter((f) => f.endsWith(".json") || f.endsWith(".mdx"))
    .map((f) => f.replace(/\.(json|mdx)$/, ""));
}

function readJson<T>(relPath: string): T {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, relPath), "utf8");
  return JSON.parse(raw) as T;
}

// ---------- Singletons ----------

export function getHome(): HomeData {
  return homeJson as HomeData;
}

export function getAbout(): AboutData {
  return aboutJson as AboutData;
}

export function getContacts(): ContactsData {
  return contactsJson as ContactsData;
}

export function getServicesPage(): ServicesPageData {
  return servicesPageJson as ServicesPageData;
}

export function getBlogPage(): BlogPageData {
  return blogPageJson as BlogPageData;
}

export function getBlogCategories(): BlogCategoriesData[] {
  return blogCategoriesJson as BlogCategoriesData[];
}

export function getClients(): ClientsData[] {
  return clientsJson as ClientsData[];
}

// ---------- Works ----------

export function getWorks(): WorksData[] {
  return slugsInDir("works")
    .map((slug) => ({
      ...readJson<Omit<WorksData, "slug">>(`works/${slug}.json`),
      slug,
    }))
    .sort((a, b) => a.sort - b.sort);
}

export function getWorkBySlug(slug: string): WorksData | undefined {
  return getWorks().find((w) => w.slug === slug);
}

// ---------- Services ----------

interface RawServiceJson {
  sort: number;
  preview_title: string;
  preview_description: string;
  title: string;
  tech_list?: string[];
  introtext?: string;
  bg_video?: ServicesListData["bg_video"];
  bg_video_poster?: ServicesListData["bg_video_poster"];
  sections?: ServicesListData["content"];
  meta_title: string;
  meta_description?: string;
}

export function getServicesList(): ServicesListData[] {
  return slugsInDir("services")
    .map((slug) => {
      const raw = readJson<RawServiceJson>(`services/${slug}.json`);
      return {
        sort: raw.sort,
        preview_title: raw.preview_title,
        preview_description: raw.preview_description,
        title: raw.title,
        tech_list: raw.tech_list,
        introtext: raw.introtext,
        bg_video: raw.bg_video,
        bg_video_poster: raw.bg_video_poster,
        content: raw.sections,
        meta_title: raw.meta_title,
        meta_description: raw.meta_description,
        slug,
      };
    })
    .sort((a, b) => a.sort - b.sort);
}

export function getServiceBySlug(slug: string): ServicesListData | undefined {
  return getServicesList().find((s) => s.slug === slug);
}

// ---------- Blog ----------

interface ArticleFrontmatter {
  pubdate: string;
  category: string;
  title: string;
  annotation?: string;
  image_background_color?: string;
  image_src?: string;
  image_width?: number;
  image_height?: number;
  meta_title: string;
  meta_description?: string;
}

function resolveCategory(slug: string): BlogCategoriesData {
  return (
    getBlogCategories().find((c) => c.slug === slug) ?? {
      title: slug,
      slug,
    }
  );
}

function readArticle(slug: string) {
  const raw = fs.readFileSync(
    path.join(CONTENT_DIR, `blog/${slug}.mdx`),
    "utf8"
  );
  const { data, content } = matter(raw);
  const fm = data as ArticleFrontmatter;

  const article: BlogArticlesData = {
    pubdate: fm.pubdate,
    category: resolveCategory(fm.category),
    title: fm.title,
    annotation: fm.annotation,
    image_background_color: fm.image_background_color,
    image:
      fm.image_src && fm.image_width && fm.image_height
        ? { src: fm.image_src, width: fm.image_width, height: fm.image_height }
        : undefined,
    meta_title: fm.meta_title,
    meta_description: fm.meta_description,
    slug,
  };

  return { article, body: content };
}

export function getBlogArticles(): BlogArticlesData[] {
  return slugsInDir("blog")
    .map((slug) => readArticle(slug).article)
    .sort((a, b) => (a.pubdate < b.pubdate ? 1 : -1));
}

export function getArticleBySlug(
  slug: string
): { article: BlogArticlesData; body: string } | undefined {
  if (!slugsInDir("blog").includes(slug)) return undefined;
  return readArticle(slug);
}
