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
  /** 3D centrepiece of the hero background */
  scene?: "blob" | "ring" | "lattice" | "burst";
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
