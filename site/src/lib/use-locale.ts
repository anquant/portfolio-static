import { useRouter } from 'next/router';
import { createContext, useContext } from 'react';

import { DICTIONARY, localeFromPath, localePath, type Locale } from './i18n';

/**
 * Overrides the locale taken from the route. Only the 404 page needs it: one
 * static 404.html serves both languages, so its route ("/404") can't tell.
 */
const LocaleOverride = createContext<Locale | null>(null);
export const LocaleProvider = LocaleOverride.Provider;

/** Current locale (from the route), its strings and a link helper */
export function useLocale() {
  const override = useContext(LocaleOverride);
  const { pathname } = useRouter();
  const locale = override ?? localeFromPath(pathname);

  return {
    locale,
    t: DICTIONARY[locale],
    /** Site path in the current language: href("/about") → "/en/about" on the English site */
    href: (path: string) => localePath(locale, path),
  };
}
