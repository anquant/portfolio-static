import { ImageAsset, VideoAsset } from "./assetType";

export interface ServicesPageData {
  title: string;
  introtext?: string;
  meta_title: string;
  meta_description?: string;
}

export interface ServicesListData {
  sort: number;
  preview_title: string;
  preview_description: string;
  title: string;
  tech_list?: string[];
  introtext?: string;
  bg_video?: VideoAsset;
  bg_video_poster?: ImageAsset;
  content?: {
    title: string;
    blocks?: {
      title: string;
      content: string;
    }[];
    color: "light" | "dark";
  }[];
  meta_title: string;
  meta_description?: string;
  slug: string;
}
