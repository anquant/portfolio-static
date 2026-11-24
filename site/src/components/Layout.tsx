import Head from 'next/head';
import { useRouter } from 'next/router';
import { type ReactNode } from 'react';

import { DEFAULT_OG_IMAGE, absUrl, ldGraph, pageTitle } from '@/lib/seo';
import { AUTHOR_NAME } from '@/lib/site';

type OgImage = { src: string; width?: number; height?: number; alt?: string };

type SeoData = {
  meta_title: string;
  meta_description?: string;
  /** Link-preview image (site path); the site cover when omitted */
  image?: OgImage;
  /** Open Graph type: "article" for blog posts and cases */
  type?: 'website' | 'article' | 'profile';
  /** Error pages: keep them out of the index */
  noindex?: boolean;
};

interface LayoutProps {
  seo: SeoData;
  /** schema.org nodes for this page; wrapped into one JSON-LD graph */
  jsonLd?: Record<string, unknown>[];
  children: ReactNode;
}

const Layout = ({ seo, jsonLd, children }: LayoutProps) => {
  const router = useRouter();
  const url = absUrl(router.asPath);
  const title = pageTitle(seo.meta_title);
  const image: OgImage = seo.image ?? DEFAULT_OG_IMAGE;

  return (
    <>
      <Head>
        <title>{title}</title>
        {seo.meta_description && <meta name="description" content={seo.meta_description} />}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="shortcut icon" href="/favicon.svg" type="image/svg+xml" />
        {seo.noindex ? <meta name="robots" content="noindex, follow" /> : <link rel="canonical" href={url} />}

        <meta property="og:type" content={seo.type ?? 'website'} />
        <meta property="og:site_name" content={AUTHOR_NAME} />
        <meta property="og:locale" content="ru_RU" />
        <meta property="og:title" content={title} />
        {seo.meta_description && <meta property="og:description" content={seo.meta_description} />}
        {!seo.noindex && <meta property="og:url" content={url} />}
        <meta property="og:image" content={absUrl(image.src)} />
        {image.width && <meta property="og:image:width" content={String(image.width)} />}
        {image.height && <meta property="og:image:height" content={String(image.height)} />}
        {image.alt && <meta property="og:image:alt" content={image.alt} />}
        <meta name="twitter:card" content="summary_large_image" />

        {jsonLd && jsonLd.length > 0 && (
          <script
            type="application/ld+json"
            // "<" escaped so text in the data can never close the script tag
            dangerouslySetInnerHTML={{ __html: JSON.stringify(ldGraph(jsonLd)).replace(/</g, '\\u003c') }}
          />
        )}
      </Head>
      <main id="beginning">{children}</main>
    </>
  );
};

export default Layout;
