import localFont from 'next/font/local';

/*
 * Self-hosted variable fonts (src/fonts, SIL Open Font License — see the
 * *-OFL.txt next to them). next/font/google downloaded them from Google at
 * build time, and that request failing on CI runners broke the build.
 *
 * The files are the upstream google/fonts variable fonts subset to Latin +
 * Cyrillic (plus → ≈ ≤ ≥ used in articles) with all OpenType features kept;
 * Manrope's weight axis is cut to the 500–700 the site uses.
 */

export const onest = localFont({
  src: '../fonts/Onest-Variable.woff2',
  weight: '100 900',
  display: 'swap',
});

export const manrope = localFont({
  src: '../fonts/Manrope-Variable.woff2',
  weight: '500 700',
  display: 'swap',
});
