import { Html, Head, Main, NextScript, type DocumentProps } from 'next/document';

import { LANG_TAG, localeFromPath } from '@/lib/i18n';

export default function Document({ __NEXT_DATA__ }: DocumentProps) {
  // the route pattern ("/en/[slug]") tells the language of every prerendered page
  const lang = LANG_TAG[localeFromPath(__NEXT_DATA__.page)];

  return (
    // data-scroll-behavior: page changes jump to the top instantly; the CSS smooth
    // scroll stays for in-page anchors (Next 16 no longer does this by default)
    <Html lang={lang} className="bg-bg" data-scroll-behavior="smooth">
      <Head>
        <meta name="theme-color" content="#0c0c0e" />
        <meta name="color-scheme" content="dark" />
        {/* Lets CSS hide scroll-reveal blocks only when JS will reveal them */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
      </Head>
      <body className="bg-bg text-fg font-sans antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
