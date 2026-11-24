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
 * is CommonJS and can't import it). Blog articles are written per language
 * and have no counterpart; the blog index itself does.
 */
const SITE = (process.env.SITE_URL || 'https://moiseevp.ru/').replace(/\/$/, '');

function alternateRefs(loc) {
  const base = loc === '/en' ? '/' : loc.replace(/^\/en(?=\/)/, '');
  if (/^\/(blog\/[^/]+|404)$/.test(base)) {
    return [];
  }
  const ru = `${SITE}${base === '/' ? '/' : base}`;
  const en = `${SITE}${base === '/' ? '/en' : `/en${base}`}`;

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
