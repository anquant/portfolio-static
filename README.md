## Getting Started

Static Next.js site, no backend or database — content lives in `site/content/` as JSON/MDX files.

Install dependencies: `npm ci` (run inside `site/`)

Development version: `npm run dev`

Build a static export (outputs to `site/out/`): `npm run build`

Deploy: pushing to `main` runs `.github/workflows/deploy.yml`, which builds and publishes `site/out/` to GitHub Pages.

### Editing content

Each page's content is a file under `site/content/`:

- `home.json`, `about.json`, `contacts.json`, `services-page.json`, `blog-page.json`, `clients.json`, `blog-categories.json` — single-page/site-wide fields
- `works/*.json` — one file per case study (filename = URL slug)
- `services/*.json` — one file per service
- `blog/*.mdx` — one Markdown/MDX file per article (frontmatter + body)

Images/videos/the resume PDF live in `site/public/`; reference them by their `/`-rooted path in the content files. Commit and push to `main` to publish.

## License

All rights reserved — see [LICENSE](LICENSE). This repository is public for portfolio purposes only; reuse requires permission.