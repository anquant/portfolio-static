/*
 * Two languages on one static export: Russian at the root, English under
 * /en. Next.js i18n routing doesn't work with `output: 'export'`, so the
 * locale is simply the URL prefix.
 *
 * The blog is Russian-only: its pages have no English counterpart.
 */

export const LOCALES = ['ru', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

const PREFIX: Record<Locale, string> = { ru: '', en: '/en' };

/** BCP 47 tag for `lang`, hreflang and schema.org `inLanguage` */
export const LANG_TAG: Record<Locale, string> = { ru: 'ru-RU', en: 'en' };
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

/** Pages that exist only in Russian */
function isRussianOnly(path: string): boolean {
  return /^\/(blog|404)(?=$|[/?#])/.test(path);
}

/**
 * The same page in another language, without query or hash, or null when
 * that page doesn't exist there (the blog in English).
 */
export function alternatePath(path: string, target: Locale): string | null {
  const base = stripLocale(path).split(/[?#]/)[0] || '/';
  if (target !== 'ru' && isRussianOnly(base)) {
    return null;
  }

  return localePath(target, base);
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
  contacts: {
    phone: 'Телефон',
    copy: 'Скопировать',
    copied: 'Скопировано',
    copyFailed: 'Не удалось скопировать',
    showPhone: 'Показать номер',
    hidePhone: 'Скрыть номер',
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
  contacts: {
    phone: 'Phone',
    copy: 'Copy',
    copied: 'Copied',
    copyFailed: 'Could not copy',
    showPhone: 'Show number',
    hidePhone: 'Hide number',
  },
};

export const DICTIONARY: Record<Locale, Dictionary> = { ru, en };

/** Prices: rubles on the Russian site, euros on the English one */
export function formatPrice(locale: Locale, amount: number): string {
  return locale === 'en'
    ? new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount)
    : `${new Intl.NumberFormat('ru-RU').format(amount)} ₽`;
}

export const CURRENCY: Record<Locale, string> = { ru: 'RUB', en: 'EUR' };

/** Main menu, also mirrored in the footer and on the 404 page */
export function navigation(locale: Locale) {
  const t = DICTIONARY[locale].nav;
  const items = [
    { title: t.works, slug: '/' },
    { title: t.services, slug: '/services' },
    { title: t.about, slug: '/about' },
    ...(locale === 'ru' ? [{ title: t.blog, slug: '/blog' }] : []),
  ];

  return items.map(item => ({ ...item, slug: localePath(locale, item.slug) }));
}
