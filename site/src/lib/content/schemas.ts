import { z } from 'zod';

import { HERO_SCENES } from '@/components/hero/variants';
import { SCENE_IDS } from '@/components/scene3d/ids';

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
const publicPath = z.string().startsWith('/', 'must be a /-rooted public path');

const isoDate = z.iso.date();

const hexColor = z.string().regex(/^#[0-9a-f]{6}$/i, 'must be a #rrggbb colour');

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

const titledText = z.strictObject({ title: z.string().min(1), text: z.string().min(1) });

export const aboutSchema = z.strictObject({
  title_part1: z.string(),
  title_part2: z.string().optional(),
  content: z.string(),
  stats: z.array(z.strictObject({ value: z.string(), label: z.string() })).optional(),
  /** One-sentence answer to "who is this", shown under the title */
  lead: z.string().optional(),
  skills: z.array(z.strictObject({ title: z.string(), items: z.array(z.string()) })).optional(),
  /** "How I work": principles as cards */
  principles: z.strictObject({ title: z.string(), items: z.array(titledText).min(1) }).optional(),
  /** Career and education, newest first */
  experience: z
    .strictObject({
      title: z.string(),
      items: z
        .array(
          z.strictObject({
            period: z.string().min(1).optional(),
            role: z.string().min(1),
            place: z.string().min(1),
            text: z.string().optional(),
          }),
        )
        .min(1),
    })
    .optional(),
  resume: publicPath.optional(),
  ...seo,
});

export const contactsSchema = z.strictObject({
  title: z.string(),
  email: z.email().optional(),
  phone: z.string().optional(),
  /** Telegram username without "@" */
  telegram: z
    .string()
    .regex(/^[a-z0-9_]{5,32}$/i, 'a Telegram username without "@"')
    .optional(),
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
  /** Latin spelling for the English site, when `title` is in Cyrillic */
  title_en: z.string().optional(),
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
  /** What was done on the project, a few short items ("Логотип", "Разработка") */
  scope: z.array(z.string().min(1)).min(1).optional(),
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

/**
 * en/works/<slug>.json: the translated text of a case. Media, colours and
 * order come from the Russian file, so they can't drift between languages.
 */
export const workTranslationSchema = workFileSchema.pick({
  title: true,
  description: true,
  infotext: true,
  scope: true,
  company: true,
  problem: true,
  mockups_description: true,
  result: true,
  meta_title: true,
  meta_description: true,
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
  scene: heroSceneSchema.default('blob'),
  sections: z
    .array(
      z.strictObject({
        title: z.string(),
        color: z.enum(['light', 'dark']),
        blocks: z.array(z.strictObject({ title: z.string(), content: z.string() })).optional(),
      }),
    )
    .optional(),
  /** "Who comes with what": situations the service solves, as cards */
  tasks: z.strictObject({ title: z.string(), items: z.array(titledText).min(1) }).optional(),
  /** Work stages, in order */
  process: z.strictObject({ title: z.string(), steps: z.array(titledText).min(1) }).optional(),
  /** Engagement formats with an optional "from" price */
  pricing: z
    .strictObject({
      title: z.string(),
      note: z.string().optional(),
      plans: z
        .array(
          z.strictObject({
            title: z.string().min(1),
            text: z.string().min(1),
            /** Rubles (US dollars on the English site); the card says "по оценке" when absent */
            price_from: z.number().int().positive().optional(),
            /** "за проект", "в месяц", … */
            unit: z.string().optional(),
            term: z.string().optional(),
          }),
        )
        .min(1),
    })
    .optional(),
  /** Slugs of works/<slug>.json shown as related cases */
  works: z.array(z.string().min(1)).optional(),
  /** Questions people actually search; also emitted as FAQPage JSON-LD */
  faq: z
    .strictObject({
      title: z.string(),
      items: z.array(z.strictObject({ question: z.string().min(1), answer: z.string().min(1) })).min(1),
    })
    .optional(),
  ...seo,
});

/** Frontmatter of blog/<slug>.mdx */
export const articleFrontmatterSchema = z
  .strictObject({
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
  })
  .refine(
    fm => {
      const set = [fm.image_src, fm.image_width, fm.image_height].filter(v => v !== undefined).length;

      return set === 0 || set === 3;
    },
    {
      message: 'image_src, image_width and image_height go together: set all three or none',
      path: ['image_src'],
    },
  );

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
/** A client as pages see it: `title` already in the page's language */
export type ClientsData = Omit<z.infer<typeof clientSchema>, 'title_en'>;

export type WorksData = z.infer<typeof workFileSchema> & { slug: string };
export type ArticleFrontmatter = z.output<typeof articleFrontmatterSchema>;

export type ServiceFile = z.output<typeof serviceFileSchema>;
export type ServiceSection = NonNullable<ServiceFile['sections']>[number];
export type ServicesListData = Omit<ServiceFile, 'sections'> & {
  content?: ServiceSection[];
  slug: string;
};

/** What a service card on /services needs */
export type ServicePreview = Pick<ServicesListData, 'slug' | 'preview_title' | 'preview_description' | 'tech_list'>;

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
export type ArticleCardData = Omit<BlogArticlesData, 'meta_title' | 'meta_description'>;
