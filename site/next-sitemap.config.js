/** @type {import('next-sitemap').IConfig} */

module.exports = {
  siteUrl: process.env.SITE_URL || "https://moiseevp.ru/",
  generateIndexSitemap: false,
  generateRobotsTxt: true,
};
