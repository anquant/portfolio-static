/*
 * Two languages on one static export: Russian at the root, English under
 * /en. Next.js i18n routing doesn't work with `output: 'export'`, so the
 * locale is simply the URL prefix.
 *
 * Every page exists in both languages except blog articles: each language
 * has its own posts. An English post may adapt a Russian one for its search
 * market; such pairs are listed in content/blog-translations.json and are
 * each other's counterpart. Other articles have none.
 */

import BLOG_TRANSLATIONS from '../../content/blog-translations.json';

export const LOCALES = ['ru', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

const PREFIX: Record<Locale, string> = { ru: '', en: '/en' };

/**
 * BCP 47 tag for `lang`, hreflang and schema.org `inLanguage`. Language only,
 * no region: "ru-RU" would make Google send Russian speakers outside Russia
 * (ru-KZ, ru-FI, …) to the x-default page, which is English.
 */
export const LANG_TAG: Record<Locale, string> = { ru: 'ru', en: 'en' };
export const OG_LOCALE: Record<Locale, string> = { ru: 'ru_RU', en: 'en_US' };

/**
 * hreflang="x-default": the version for visitors whose language matches
 * none of ours (Finnish, German, …) — they get English, not Russian.
 */
export const X_DEFAULT_LOCALE: Locale = 'en';

/** Locale of a route pattern or URL path: "/en/[slug]", "/en/about?x" → "en" */
export function localeFromPath(path: string): Locale {
  return /^\/en(?=$|[/?#])/.test(path) ? 'en' : 'ru';
}

/** Path without its locale prefix: "/en/about" → "/about", "/en" → "/" */
export function stripLocale(path: string): string {
  if (localeFromPath(path) === 'ru') {
    return path;
  }
  const rest = path.slice(PREFIX.en.length);

  return rest === '' || /^[?#]/.test(rest) ? `/${rest}` : rest;
}

/** A site path in the given language: ("en", "/about") → "/en/about", ("en", "/#works") → "/en#works" */
export function localePath(locale: Locale, path: string): string {
  if (locale === 'ru' || /^https?:\/\//.test(path)) {
    return path;
  }

  return path === '/' || /^\/[?#]/.test(path) ? `${PREFIX.en}${path.slice(1)}` : `${PREFIX.en}${path}`;
}

/** Pages without a same-path counterpart in the other language: blog articles and the 404 page */
function isUntranslated(path: string): boolean {
  return /^\/(blog\/[^/]+|404)$/.test(path);
}

/**
 * The same page in another language, without query or hash, or null when
 * the page has no counterpart there (a blog article). A page is always its
 * own counterpart in its own language.
 */
export function alternatePath(path: string, target: Locale): string | null {
  const base = stripLocale(path).split(/[?#]/)[0] || '/';
  const source = localeFromPath(path);
  if (target !== source && isUntranslated(base)) {
    const slug = base.startsWith('/blog/') ? base.slice('/blog/'.length) : null;
    const pair = slug ? BLOG_TRANSLATIONS.find(p => p[source] === slug) : undefined;

    return pair ? localePath(target, `/blog/${pair[target]}`) : null;
  }

  return localePath(target, base);
}

/**
 * Where the language switch leads: the same page in that language, or the
 * closest one that exists — the blog for an article, the home page otherwise.
 */
export function switchPath(path: string, target: Locale): string {
  const base = stripLocale(path).split(/[?#]/)[0] || '/';

  return alternatePath(path, target) ?? localePath(target, base.startsWith('/blog/') ? '/blog' : '/');
}

/* ------------------------------------------------------------------------ */
/* Interface strings                                                        */
/* ------------------------------------------------------------------------ */

const ru = {
  authorName: 'Павел Моисеев',
  authorInitials: 'ПМ',
  authorJob: 'Fullstack веб-разработчик',
  nav: { works: 'Проекты', services: 'Услуги', about: 'Обо мне', blog: 'Блог', contacts: 'Контакты' },
  mainMenu: 'Основное меню',
  footerMenu: 'Навигация в подвале',
  openMenu: 'Открыть меню',
  closeMenu: 'Закрыть меню',
  discussProject: 'Обсудить проект',
  language: 'Язык',
  breadcrumbs: 'Хлебные крошки',
  home: 'Главная',
  footer: {
    eyebrow: 'Есть задача?',
    title: 'Обсудим ваш проект',
    text: 'Расскажите о задаче — предложу решение, сроки и формат работы.',
    button: 'Написать мне',
    toTop: 'Наверх',
  },
  hero: { eyebrow: 'UX/UI-дизайн · Разработка · SEO', viewWorks: 'Смотреть проекты', loadMore: 'Показать ещё' },
  clients: { title: 'Клиенты', count: (n: number) => `${n} компаний`, site: (name: string) => `Сайт ${name}` },
  workCard: { empty: 'Здесь пока нет проектов…', open: 'Смотреть кейс' },
  serviceCard: { empty: 'Здесь пока нет услуг…' },
  work: {
    scope: 'Что сделано',
    stack: 'Стек',
    site: 'Сайт',
    client: 'Заказчик',
    task: 'Задача',
    solution: 'Решение',
    result: 'Результат',
    next: 'Следующий проект',
    services: 'Услуги в проекте',
    cover: 'главный экран',
    mockup: (n: number) => `макет ${n}`,
    video: 'видеообзор сайта',
    pause: 'Поставить видео на паузу',
    play: 'Воспроизвести видео',
  },
  service: {
    discuss: 'Обсудить задачу',
    relatedWorks: 'Проекты по теме',
    allWorks: 'Все проекты',
    step: 'Этап',
    from: 'от',
    byEstimate: 'Стоимость по оценке',
  },
  about: { resume: 'Резюме (PDF)', inNumbers: 'В цифрах', skills: 'Навыки' },
  blog: {
    categories: 'Категории',
    all: 'Все',
    pages: 'Страницы',
    other: 'Другие статьи',
    allArticles: 'Все статьи',
    empty: 'Здесь пока нет статей…',
    copyCode: 'Скопировать код',
    updated: 'Обновлено',
    copied: 'Скопировано',
  },
  contacts: {
    labels: { email: 'E-mail', phone: 'Телефон', telegram: 'Telegram' },
    /** Show / hide buttons of the masked channels */
    reveal: {
      phone: { show: 'Показать номер', hide: 'Скрыть номер' },
      telegram: { show: 'Показать ник в Telegram', hide: 'Скрыть ник в Telegram' },
    },
    copy: 'Скопировать',
    copied: 'Скопировано',
    copyFailed: 'Не удалось скопировать',
  },
  notFound: {
    metaTitle: 'Ошибка 404',
    title: 'Такой страницы не существует',
    text: 'Возможно, она переехала. Попробуйте один из разделов:',
    home: 'На главную',
  },
};

export type Dictionary = typeof ru;

const en: Dictionary = {
  authorName: 'Pavel Moiseev',
  authorInitials: 'PM',
  authorJob: 'Full-stack web developer',
  nav: { works: 'Work', services: 'Services', about: 'About', blog: 'Blog', contacts: 'Contact' },
  mainMenu: 'Main menu',
  footerMenu: 'Footer navigation',
  openMenu: 'Open menu',
  closeMenu: 'Close menu',
  discussProject: 'Start a project',
  language: 'Language',
  breadcrumbs: 'Breadcrumbs',
  home: 'Home',
  footer: {
    eyebrow: 'Have a project in mind?',
    title: "Let's talk about your project",
    text: "Tell me what you need — I'll suggest a solution, a timeline and a way to work together.",
    button: 'Get in touch',
    toTop: 'Back to top',
  },
  hero: { eyebrow: 'UX/UI design · Development · SEO', viewWorks: 'See the work', loadMore: 'Show more' },
  clients: {
    title: 'Clients',
    count: (n: number) => `${n} companies`,
    site: (name: string) => `${name} website`,
  },
  workCard: { empty: 'No projects here yet…', open: 'View case study' },
  serviceCard: { empty: 'No services here yet…' },
  work: {
    scope: 'What I did',
    stack: 'Stack',
    site: 'Website',
    client: 'Client',
    task: 'Challenge',
    solution: 'Solution',
    result: 'Result',
    next: 'Next project',
    services: 'Services on this project',
    cover: 'home page',
    mockup: (n: number) => `mockup ${n}`,
    video: 'website walkthrough',
    pause: 'Pause video',
    play: 'Play video',
  },
  service: {
    discuss: 'Discuss your project',
    relatedWorks: 'Related work',
    allWorks: 'All projects',
    step: 'Step',
    from: 'from',
    byEstimate: 'Priced on request',
  },
  about: { resume: 'Résumé (PDF)', inNumbers: 'In numbers', skills: 'Skills' },
  blog: {
    categories: 'Categories',
    all: 'All',
    pages: 'Pages',
    other: 'More articles',
    allArticles: 'All articles',
    empty: 'No articles here yet…',
    copyCode: 'Copy code',
    updated: 'Updated',
    copied: 'Copied',
  },
  contacts: {
    labels: { email: 'E-mail', phone: 'Phone', telegram: 'Telegram' },
    reveal: {
      phone: { show: 'Show number', hide: 'Hide number' },
      telegram: { show: 'Show Telegram username', hide: 'Hide Telegram username' },
    },
    copy: 'Copy',
    copied: 'Copied',
    copyFailed: 'Could not copy',
  },
  notFound: {
    metaTitle: 'Error 404',
    title: 'This page does not exist',
    text: 'It may have moved. Try one of these sections:',
    home: 'Home page',
  },
};

export const DICTIONARY: Record<Locale, Dictionary> = { ru, en };

/** Prices: rubles on the Russian site, US dollars on the English one */
export function formatPrice(locale: Locale, amount: number): string {
  return locale === 'en'
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
    : `${new Intl.NumberFormat('ru-RU').format(amount)} ₽`;
}

export const CURRENCY: Record<Locale, string> = { ru: 'RUB', en: 'USD' };

const DATE_FORMAT: Record<Locale, Intl.DateTimeFormat> = {
  ru: new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }),
  en: new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }),
};

/** Publication date: "16 января 2026 г." → "16 января 2026", "January 16, 2026" */
export function formatDate(locale: Locale, isoDate: string): string {
  return DATE_FORMAT[locale].format(new Date(isoDate)).replace(/\s*г\.$/, '');
}

/** Main menu, also mirrored in the footer and on the 404 page */
export function navigation(locale: Locale) {
  const t = DICTIONARY[locale].nav;
  const items = [
    { title: t.works, slug: '/' },
    { title: t.services, slug: '/services' },
    { title: t.about, slug: '/about' },
    { title: t.blog, slug: '/blog' },
  ];

  return items.map(item => ({ ...item, slug: localePath(locale, item.slug) }));
}
