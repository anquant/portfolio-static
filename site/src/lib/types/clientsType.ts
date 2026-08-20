import { ImageAsset } from "./assetType";

export interface ClientsData {
  id: number;
  title: string;
  logo: ImageAsset;
  link?: string | null;
}
