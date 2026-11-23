import { ImageAsset } from "./assetType";
import type { SceneId } from "@/components/scene3d/ids";

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
  /** Animated 3D cover; replaces the image when set */
  scene?: SceneId;
  slug: string;
}

export interface BlogArticlesData {
  pubdate: string;
  category: BlogCategoriesData;
  title: string;
  annotation?: string;
  image?: ImageAsset;
  image_background_color?: string;
  scene?: SceneId;
  meta_title: string;
  meta_description?: string;
  slug: string;
}
