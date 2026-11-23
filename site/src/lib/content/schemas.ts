import { z } from "zod";
import { SCENE_IDS } from "@/components/scene3d/ids";

/*
 * Content schemas — the single source of truth for every file under
 * `content/`. Types are inferred from the schemas, so the shape the pages
 * rely on is exactly the shape the build validates. Objects are strict:
 * an unknown key (usually a typo) is an error, not silently dropped.
 */

/* ------------------------------------------------------------------------ */
/* Primitives                                                               */
/* ------------------------------------------------------------------------ */

/** Root-relative path to a file in `public/` */
const publicPath = z.string().startsWith("/", "must be a /-rooted public path");

const isoDate = z.iso.date();

const hexColor = z
  .string()
  .regex(/^#[0-9a-f]{6}$/i, "must be a #rrggbb colour");

const seo = {
  meta_title: z.string().min(1),
  meta_description: z.string().optional(),
};

export const imageAssetSchema = z.strictObject({
  src: publicPath,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const videoAssetSchema = z.strictObject({
  src: publicPath,
  type: z.string().regex(/^video\//),
});

export const sceneIdSchema = z.enum(SCENE_IDS);

export const HERO_SCENES = ["blob", "ring", "lattice", "burst"] as const;
export const heroSceneSchema = z.enum(HERO_SCENES);

/* ------------------------------------------------------------------------ */
/* Single pages                                                             */
/* ------------------------------------------------------------------------ */

export const homeSchema = z.strictObject({
  title_h1: z.string(),
  introtext: z.string(),
  title_h2: z.string(),
  ...seo,
});

export const aboutSchema = z.strictObject({
  title_part1: z.string(),
  title_part2: z.string().optional(),
  content: z.string(),
  stats: z
    .array(z.strictObject({ value: z.string(), label: z.string() }))
    .optional(),
  skills: z
    .array(z.strictObject({ title: z.string(), items: z.array(z.string()) }))
    .optional(),
  resume: publicPath.optional(),
  ...seo,
});

export const contactsSchema = z.strictObject({
  title: z.string(),
  email: z.email().optional(),
  phone: z.string().optional(),
  text: z.string().optional(),
  ...seo,
});

export const servicesPageSchema = z.strictObject({
  title: z.string(),
  introtext: z.string().optional(),
  ...seo,
});

export const blogPageSchema = z.strictObject({
  title: z.string(),
  ...seo,
});

export const blogCategorySchema = z.strictObject({
  title: z.string(),
  slug: z.string(),
});

export const clientSchema = z.strictObject({
  id: z.number().int(),
  title: z.string(),
  logo: imageAssetSchema,
  link: z.url().nullish(),
});

/* ------------------------------------------------------------------------ */
/* Collections                                                              */
/* ------------------------------------------------------------------------ */

/** works/<slug>.json */
export const workFileSchema = z.strictObject({
  sort: z.number(),
  title: z.string(),
  description: z.string(),
  infotext: z.string(),
  link: z.string().optional(),
  illustration: imageAssetSchema.optional(),
  /** Animated 3D preview; takes the place of `illustration` when set */
  scene: sceneIdSchema.optional(),
  color: hexColor.optional(),
  company: z.string(),
  problem: z.string(),
  video: videoAssetSchema.optional(),
  /** Static image; also the poster of `video` */
  cover: imageAssetSchema.optional(),
  mockups_description: z.string().optional(),
  mockups: z.array(imageAssetSchema).optional(),
  result: z.string(),
  ...seo,
});

/** services/<slug>.json */
export const serviceFileSchema = z.strictObject({
  sort: z.number(),
  preview_title: z.string(),
  preview_description: z.string(),
  title: z.string(),
  tech_list: z.array(z.string()).optional(),
  introtext: z.string().optional(),
  /** 3D centrepiece of the hero background */
  scene: heroSceneSchema.default("blob"),
  sections: z
    .array(
      z.strictObject({
        title: z.string(),
        color: z.enum(["light", "dark"]),
        blocks: z
          .array(z.strictObject({ title: z.string(), content: z.string() }))
          .optional(),
      })
    )
    .optional(),
  ...seo,
});

/** Frontmatter of blog/<slug>.mdx */
export const articleFrontmatterSchema = z.strictObject({
  pubdate: isoDate,
  /** Slug of a category in blog-categories.json */
  category: z.string(),
  title: z.string(),
  annotation: z.string().optional(),
  image_background_color: hexColor.optional(),
  image_src: publicPath.optional(),
  image_width: z.number().int().positive().optional(),
  image_height: z.number().int().positive().optional(),
  /** Animated 3D cover; replaces the image when set */
  scene: sceneIdSchema.optional(),
  ...seo,
});

/* ------------------------------------------------------------------------ */
/* Types                                                                    */
/* ------------------------------------------------------------------------ */

export type ImageAsset = z.infer<typeof imageAssetSchema>;
export type VideoAsset = z.infer<typeof videoAssetSchema>;
export type HeroSceneId = z.infer<typeof heroSceneSchema>;

export type HomeData = z.infer<typeof homeSchema>;
export type AboutData = z.infer<typeof aboutSchema>;
export type ContactsData = z.infer<typeof contactsSchema>;
export type ServicesPageData = z.infer<typeof servicesPageSchema>;
export type BlogPageData = z.infer<typeof blogPageSchema>;
export type BlogCategoriesData = z.infer<typeof blogCategorySchema>;
export type ClientsData = z.infer<typeof clientSchema>;

export type WorksData = z.infer<typeof workFileSchema> & { slug: string };

type ServiceFile = z.output<typeof serviceFileSchema>;
export type ServiceSection = NonNullable<ServiceFile["sections"]>[number];
export type ServicesListData = Omit<ServiceFile, "sections"> & {
  content?: ServiceSection[];
  slug: string;
};

export type BlogArticlesData = {
  pubdate: string;
  category: BlogCategoriesData;
  title: string;
  annotation?: string;
  image?: ImageAsset;
  image_background_color?: string;
  scene?: z.infer<typeof sceneIdSchema>;
  meta_title: string;
  meta_description?: string;
  slug: string;
};

/** What an article card needs — a subset of the article */
export type ArticleCardData = Omit<
  BlogArticlesData,
  "meta_title" | "meta_description"
>;
