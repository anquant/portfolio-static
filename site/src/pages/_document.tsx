import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="ru" className="bg-bg">
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
