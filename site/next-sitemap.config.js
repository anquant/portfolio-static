/* eslint-disable @typescript-eslint/no-require-imports -- next-sitemap loads this file as CommonJS */
const fs = require('fs');
const path = require('path');

const matter = require('gray-matter');

/** Publication date of each blog post, from its front matter: "/blog/<slug>", "/en/blog/<slug>" → ISO date */
function blogDates(contentDir, urlPrefix) {
  const dir = path.join(__dirname, 'content', contentDir);

  return Object.fromEntries(
    fs
      .readdirSync(dir)
      .filter(file => file.endsWith('.mdx'))
      .map(file => [`${urlPrefix}/${file.replace(/\.mdx$/, '')}`, matter.read(path.join(dir, file)).data.pubdate]),
  );
}

const dates = { ...blogDates('blog', '/blog'), ...blogDates('en/blog', '/en/blog') };

/*
 * hreflang alternates for every page that exists in both languages — the
 * same pairs as the <link rel="alternate"> tags (src/lib/i18n.ts; this file
 * is CommonJS and can't import it). Blog articles are written per language;
 * only the pairs in content/blog-translations.json are each other's
 * counterpart. The blog index itself always has one.
 */
const SITE = (process.env.SITE_URL || 'https://moiseevp.ru/').replace(/\/$/, '');
const BLOG_TRANSLATIONS = require('./content/blog-translations.json');

function alternateRefs(loc) {
  const base = loc === '/en' ? '/' : loc.replace(/^\/en(?=\/)/, '');
  let ruPath = base;
  let enPath = base;
  if (/^\/(blog\/[^/]+|404)$/.test(base)) {
    const slug = base.slice('/blog/'.length);
    const pair = base.startsWith('/blog/')
      ? BLOG_TRANSLATIONS.find(p => p[loc.startsWith('/en/') ? 'en' : 'ru'] === slug)
      : undefined;
    if (!pair) {
      return [];
    }
    ruPath = `/blog/${pair.ru}`;
    enPath = `/blog/${pair.en}`;
  }
  const ru = `${SITE}${ruPath === '/' ? '/' : ruPath}`;
  const en = `${SITE}${enPath === '/' ? '/en' : `/en${enPath}`}`;

  return [
    { href: ru, hreflang: 'ru', hrefIsAbsolute: true },
    { href: en, hreflang: 'en', hrefIsAbsolute: true },
    // visitors whose language is neither get English (X_DEFAULT_LOCALE)
    { href: en, hreflang: 'x-default', hrefIsAbsolute: true },
  ];
}

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://moiseevp.ru/',
  // straight into the export: `next build` copies public/ before this runs, so
  // writing to public/ (the default) leaves the deployed site without a sitemap
  outDir: 'out',
  generateIndexSitemap: false,
  // robots.txt is a static file in public/: next-sitemap would add the obsolete Host directive
  generateRobotsTxt: false,
  exclude: ['/404'],
  autoLastmod: false,
  // Only real dates: a build-time lastmod on every page tells crawlers that everything changes daily
  transform: async (config, loc) => ({
    loc,
    ...(dates[loc] && { lastmod: new Date(dates[loc]).toISOString() }),
    alternateRefs: alternateRefs(loc),
  }),
};
