import Link from 'next/link';
import { useRouter } from 'next/router';

import { LOCALES, alternatePath, localePath, type Locale } from '@/lib/i18n';
import { useLocale } from '@/lib/use-locale';

const NAMES: Record<Locale, string> = { ru: 'Русский', en: 'English' };

type LanguageSwitchProps = {
  className?: string;
  onNavigate?: () => void;
};

/**
 * "RU | EN" pill in the style of the main menu: the current language is
 * highlighted, the other one links to the same page in that language (or to
 * its home page when the page doesn't exist there, e.g. the blog).
 */
export default function LanguageSwitch({ className = '', onNavigate }: LanguageSwitchProps) {
  const router = useRouter();
  const { locale, t } = useLocale();
  const item = 'grid h-7 min-w-10 place-items-center rounded-full px-2.5 text-sm font-medium transition-colors';

  return (
    <div
      role="group"
      aria-label={t.language}
      className={`flex items-center gap-0.5 rounded-full border border-line bg-surface/70 p-1 backdrop-blur ${className}`}
    >
      {LOCALES.map(l => {
        // visible code stays part of the accessible name (WCAG 2.5.3)
        const label = (
          <>
            {l.toUpperCase()}
            <span className="sr-only"> — {NAMES[l]}</span>
          </>
        );

        return l === locale ? (
          <span key={l} lang={l} aria-current="true" className={`${item} bg-surface-2 text-fg`}>
            {label}
          </span>
        ) : (
          <Link
            key={l}
            href={alternatePath(router.asPath, l) ?? localePath(l, '/')}
            lang={l}
            hrefLang={l}
            onClick={onNavigate}
            className={`${item} text-muted hover:text-fg`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
