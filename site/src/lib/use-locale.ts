import { useRouter } from 'next/router';

import { DICTIONARY, localeFromPath, localePath } from './i18n';

/** Current locale (from the route), its strings and a link helper */
export function useLocale() {
  const { pathname } = useRouter();
  const locale = localeFromPath(pathname);

  return {
    locale,
    t: DICTIONARY[locale],
    /** Site path in the current language: href("/about") → "/en/about" on the English site */
    href: (path: string) => localePath(locale, path),
  };
}
