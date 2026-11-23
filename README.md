# moiseevp.ru

Portfolio of a web developer and designer — a fully static Next.js site with
real-time 3D: an interactive shader hero on the main pages and a family of
procedurally modelled, animated scenes for every case study and blog post.

**Live:** [moiseevp.ru](https://moiseevp.ru/)

**Stack:** Next.js 16 (static export) · React 19 · TypeScript (strict) ·
Tailwind CSS · three.js / React Three Fiber · MDX · zod · Vitest ·
GitHub Actions → GitHub Pages

## Engineering highlights

### Content is data, validated at build time

There is no CMS and no backend: every page is a JSON or MDX file in
[`site/content/`](site/content). Each file is parsed against a strict
[zod schema](site/src/lib/content/schemas.ts) when the site is built, and the
TypeScript types are _inferred from those schemas_ — the shape the pages rely
on is exactly the shape the build checks. A typo fails the build with the file
and the field:

```
Invalid content in content/works/mls.json:
✖ Invalid option: expected one of "containers"|"diamond"|…
  → at scene
```

Tests add the checks a schema can't express: every referenced asset exists in
`public/`, every case study has a preview, every blog category resolves.

### One WebGL context for any number of 3D scenes

Each case study and article has its own minimal 3D scene (a crane lowering a
container, a diamond in split rock, a gavel striking…), modelled in code — no
model files. A page can show many of them, and browsers cap live WebGL
contexts, so [`scene3d`](site/src/components/scene3d) renders them all with
**one** offscreen renderer and copies each frame into the card's plain 2D
canvas. three.js is loaded only when a card approaches the viewport, and
offscreen scenes cost nothing.

Every scene is a pure function of time on a shared 8-second beat, which keeps
the series visually coherent and makes it testable headless: the suite builds
each scene without WebGL and asserts it stays finite and loops seamlessly.

### Interactive hero

The [hero](site/src/components/hero) is a React Three Fiber scene with custom
GLSL: a point field that ripples under the cursor and a per-page centrepiece
(blob, ring, lattice, burst) that assembles on load, reacts to pointer speed
and disperses on scroll. All motion runs through one smoothed state object, so
every shape follows the same choreography.

### Built to degrade gracefully

- `prefers-reduced-motion`: scenes hold a still pose, parallax is off
- No WebGL: the stage frames stay as quiet placeholders, content is unaffected
- Contact details are kept out of the static HTML (decoded after hydration)

## Project structure

```
site/
├── content/                 JSON + MDX content, one file per page / item
├── public/                  images, video, files
└── src/
    ├── pages/               Next.js pages (getStaticProps reads content)
    ├── components/
    │   ├── hero/            R3F + GLSL hero: field, anchor, shapes/
    │   ├── scene3d/         shared-context 3D scenes
    │   │   ├── engine.ts    one renderer → many 2D canvases
    │   │   ├── stage.ts     shared camera, ground, screen axes
    │   │   ├── kit.ts       palette + procedural geometry (Voronoi, lathe…)
    │   │   ├── motion.ts    8 s loop, easing, keyframes
    │   │   └── scenes/      works/*, blog/* — one builder per file
    │   └── …                UI components
    ├── lib/
    │   ├── content/         zod schemas + loaders
    │   └── …                small utilities
    └── styles/              Tailwind + design tokens (CSS variables)
```

## Development

Inside `site/`:

| Command             | What it does                                     |
| ------------------- | ------------------------------------------------ |
| `npm ci`            | install dependencies                             |
| `npm run dev`       | dev server                                       |
| `npm run build`     | static export to `site/out/` (validates content) |
| `npm run check`     | typecheck, lint, format check, tests             |
| `npm run test:watch` | tests in watch mode                             |

**CI.** Every pull request and branch push runs `npm run check` and a build
([ci.yml](.github/workflows/ci.yml)). A push to `main` runs the same gates and
then deploys to GitHub Pages ([deploy.yml](.github/workflows/deploy.yml)).

## Editing content

- `home.json`, `about.json`, `contacts.json`, `services-page.json`,
  `blog-page.json`, `clients.json`, `blog-categories.json` — single pages and
  site-wide lists
- `works/*.json` — one case study per file (file name = URL slug)
- `services/*.json` — one service per file
- `blog/*.mdx` — one article per file (frontmatter + body)

Media lives in `site/public/` and is referenced by its `/`-rooted path. The
schemas in [`schemas.ts`](site/src/lib/content/schemas.ts) document every
field. Commit and push to `main` to publish.

### Adding a 3D scene

1. Write a builder in `scene3d/scenes/works/` or `scenes/blog/` that returns
   `{ root, update(t) }` — model with the shared `mat` palette and `kit`
   helpers, animate with `motion` so it loops on the common beat.
2. Add its id to `scene3d/ids.ts` and register it in `scenes/index.ts` (the
   registry is typed against the ids, so a missing half doesn't compile).
3. Reference it from content: `"scene": "<id>"`. The test suite picks the new
   scene up automatically.

## License

See [LICENSE](LICENSE) — split by material:

- **Code/interface** (`site/` excluding content/media) — free to use, provided
  you keep a visible attribution link to [moiseevp.ru](https://moiseevp.ru/).
- **Content** (`site/content/`, media in `site/public/`) — all rights
  reserved, no reuse without permission.
