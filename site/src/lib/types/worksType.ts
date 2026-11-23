import { ImageAsset, VideoAsset } from "./assetType";
import type { WorkSceneId } from "@/components/work-scene/ids";

export interface WorksData {
  sort: number;
  title: string;
  description: string;
  infotext: string;
  link?: string;
  illustration?: ImageAsset;
  /** Animated 3D preview; takes the place of `illustration` when set */
  scene?: WorkSceneId;
  color?: string;
  company: string;
  problem: string;
  video?: VideoAsset;
  /** Static image; also the poster of `video` */
  cover?: ImageAsset;
  mockups_description?: string;
  mockups?: ImageAsset[];
  result: string;
  meta_title: string;
  meta_description?: string;
  slug: string;
}
