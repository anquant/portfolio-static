export interface AboutStat {
  value: string;
  label: string;
}

export interface AboutSkillGroup {
  title: string;
  items: string[];
}

export interface AboutData {
  title_part1: string;
  title_part2?: string;
  content: string;
  stats?: AboutStat[];
  skills?: AboutSkillGroup[];
  resume?: string;
  meta_title: string;
  meta_description?: string;
}
