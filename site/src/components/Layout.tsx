"use client";

import { ReactNode } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

type SeoData = {
  meta_title: string;
  meta_description?: string;
};

interface LayoutProps {
  seo: SeoData;
  children: ReactNode;
  site_url?: string;
  canonical?: boolean;
}

const Layout = ({
  seo,
  children,
  site_url,
  canonical = false,
}: LayoutProps) => {
  const router = useRouter();
  const base_url = (site_url || "").replace(/\/$/, "");
  const canonical_url = `${base_url}${router.asPath.split("?")[0]}`;

  return (
    <>
      <Head>
        <title>{seo.meta_title}</title>
        <meta name="description" content={seo.meta_description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="shortcut icon" href="/favicon.svg" type="image/svg+xml" />
        {canonical && <link rel="canonical" href={canonical_url} />}
      </Head>
      <main id="beginning">{children}</main>
    </>
  );
};

export default Layout;
