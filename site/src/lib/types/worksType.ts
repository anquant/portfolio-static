import { ImageAsset, VideoAsset } from "./assetType";

export interface WorksData {
  sort: number;
  title: string;
  description: string;
  infotext: string;
  link?: string;
  illustration?: ImageAsset;
  color?: string;
  company: string;
  problem: string;
  video?: VideoAsset;
  video_poster?: { src: string };
  mockups_description?: string;
  mockups?: ImageAsset[];
  result: string;
  meta_title: string;
  meta_description?: string;
  slug: string;
}
