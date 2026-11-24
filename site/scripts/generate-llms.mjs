/**
 * Writes out/llms.txt (https://llmstxt.org): a plain summary of the site for
 * AI assistants — who, services, cases, articles — built from the same
 * content files as the pages, so it never goes stale. Runs after `next build`.
 *
 * Contact details stay off it on purpose: the site keeps them out of static
 * HTML (see src/lib/obfuscate.ts), so this links to the contacts page instead.
 */
import fs from 'node:fs';
import path from 'node:path';

import matter from 'gray-matter';

const ROOT = path.resolve(import.meta.dirname, '..');
const CONTENT = path.join(ROOT, 'content');
const OUT = path.join(ROOT, 'out', 'llms.txt');
const SITE = (process.env.SITE_URL || 'https://moiseevp.ru/').replace(/\/$/, '');

const readJson = file => JSON.parse(fs.readFileSync(path.join(CONTENT, file), 'utf8'));
const jsonDir = dir =>
  fs
    .readdirSync(path.join(CONTENT, dir))
    .filter(file => file.endsWith('.json'))
    .map(file => ({ slug: file.replace(/\.json$/, ''), ...readJson(path.join(dir, file)) }));

/** HTML from the CMS-style fields → one line of plain text */
const plain = html =>
  String(html ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&nbsp;/g, ' ')
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const about = readJson('about.json');
const home = readJson('home.json');
const services = jsonDir('services').sort((a, b) => a.sort - b.sort);
const works = jsonDir('works').sort((a, b) => a.sort - b.sort);
const categories = Object.fromEntries(readJson('blog-categories.json').map(c => [c.slug, c.title]));
const articles = fs
  .readdirSync(path.join(CONTENT, 'blog'))
  .filter(file => file.endsWith('.mdx'))
  .map(file => ({ slug: file.replace(/\.mdx$/, ''), ...matter.read(path.join(CONTENT, 'blog', file)).data }))
  .sort((a, b) => String(b.pubdate).localeCompare(String(a.pubdate)));

const lines = [
  '# Павел Моисеев',
  '',
  `> ${about.title_part1} ${about.title_part2}. ${plain(home.meta_description)}`,
  '',
  plain(about.content),
  '',
  ...(about.stats ?? []).map(s => `- ${s.value} ${s.label}`),
  '',
  '## Услуги',
  '',
  ...services.flatMap(s => [
    `- [${s.preview_title}](${SITE}/services/${s.slug}): ${plain(s.meta_description)}`,
    ...(s.faq?.items ?? []).map(item => `  - ${item.question} ${plain(item.answer)}`),
  ]),
  '',
  '## Проекты',
  '',
  ...works.flatMap(w => [
    `- [${w.title}](${SITE}/${w.slug}): ${plain(w.description)}`,
    ...(w.scope ? [`  - Что сделано: ${w.scope.join(', ')}`] : []),
    `  - Стек: ${plain(w.infotext)}`,
    ...(w.link ? [`  - Сайт: ${w.link}`] : []),
  ]),
  '',
  '## Блог',
  '',
  ...articles.map(
    a =>
      `- [${a.title}](${SITE}/blog/${a.slug}) (${a.pubdate}, ${categories[a.category] ?? a.category}): ${plain(a.annotation)}`,
  ),
  '',
  '## Навыки',
  '',
  ...(about.skills ?? []).map(group => `- ${group.title}: ${group.items.join(', ')}`),
  '',
  '## Контакты',
  '',
  `- [Связаться](${SITE}/contacts)`,
  `- [Обо мне](${SITE}/about)`,
  '',
];

fs.writeFileSync(OUT, lines.join('\n'));
console.log(`llms.txt: ${services.length} services, ${works.length} works, ${articles.length} articles → ${OUT}`);
