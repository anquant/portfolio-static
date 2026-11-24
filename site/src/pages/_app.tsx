import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';

import { onest, manrope } from '@/lib/fonts';
import { LANG_TAG, localeFromPath } from '@/lib/i18n';

export default function App({ Component, pageProps, router }: AppProps) {
  // Remount the page when moving between items of the same dynamic route
  // (case → next case, service → service, article → article). Otherwise React
  // reuses the tree: <video> keeps playing the previous <source>, scroll
  // reveals stay "already shown" and the 3D intro doesn't replay.
  // Query changes (?page, ?category) are intentionally not part of the key.
  const slug = router.query.slug;
  const pageKey = `${router.pathname}:${Array.isArray(slug) ? slug.join('/') : (slug ?? '')}`;

  // <html lang> comes from _document only on the first load; client-side
  // navigation between /… and /en/… must update it too, or the browser
  // (translation offer, hyphenation, screen readers) keeps the old language.
  // asPath, not pathname: the shared 404 page is "/404" for both languages.
  const lang = LANG_TAG[localeFromPath(router.asPath)];
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <>
      {/* Fonts are set on :root so portals (mobile menu dialog) inherit them too */}
      <style jsx global>{`
        :root {
          --font-sans: ${onest.style.fontFamily};
          --font-display: ${manrope.style.fontFamily};
        }
      `}</style>
      <Component key={pageKey} {...pageProps} />
    </>
  );
}
