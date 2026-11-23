import { ImageAsset, VideoAsset } from "./assetType";
import type { SceneId } from "@/components/scene3d/ids";

export interface WorksData {
  sort: number;
  title: string;
  description: string;
  infotext: string;
  link?: string;
  illustration?: ImageAsset;
  /** Animated 3D preview; takes the place of `illustration` when set */
  scene?: SceneId;
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
