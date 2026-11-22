import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="ru" className="bg-bg">
      <Head>
        <meta name="theme-color" content="#0c0c0e" />
        <meta name="color-scheme" content="dark" />
      </Head>
      <body className="bg-bg text-fg font-sans antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
