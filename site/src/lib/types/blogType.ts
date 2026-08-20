import { ImageAsset } from "./assetType";

export interface BlogPageData {
  title: string;
  meta_title: string;
  meta_description?: string;
}

export interface BlogCategoriesData {
  title: string;
  slug: string;
}

export interface ArticleCardData {
  pubdate: string;
  category: BlogCategoriesData;
  title: string;
  annotation?: string;
  image?: ImageAsset;
  image_background_color?: string;
  slug: string;
}

export interface BlogArticlesData {
  pubdate: string;
  category: BlogCategoriesData;
  title: string;
  annotation?: string;
  image?: ImageAsset;
  image_background_color?: string;
  meta_title: string;
  meta_description?: string;
  slug: string;
}
