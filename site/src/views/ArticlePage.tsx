import Link from 'next/link';
import { MDXRemote, type MDXRemoteSerializeResult } from 'next-mdx-remote';
import { FiArrowRight } from 'react-icons/fi';

import ArticleCard from '@/components/ArticleCard';
import BlogCover from '@/components/BlogCover';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Layout from '@/components/Layout';
import PageIntro from '@/components/PageIntro';
import Scene3D from '@/components/Scene3D';
import SectionHeader from '@/components/SectionHeader';
import type { BlogArticlesData } from '@/lib/content/schemas';
import { LANG_TAG, formatDate } from '@/lib/i18n';
import { mdxComponents } from '@/lib/mdx-components';
import { absUrl, breadcrumbLd, personRef } from '@/lib/seo';
import { useLocale } from '@/lib/use-locale';

interface ArticleProps {
  article: BlogArticlesData;
  articles: BlogArticlesData[];
  mdxSource: MDXRemoteSerializeResult;
}

export default function ArticlePage({ article, articles, mdxSource }: ArticleProps) {
  const { locale, t, href } = useLocale();
  const { title, image, image_background_color, meta_title, meta_description } = article;
  const seo = { meta_title, meta_description, type: 'article' as const, image: image && { ...image, alt: title } };
  const jsonLd = [
    {
      '@type': 'BlogPosting',
      headline: title,
      ...(meta_description && { description: meta_description }),
      datePublished: article.pubdate,
      ...(image && { image: absUrl(image.src) }),
      author: personRef,
      publisher: personRef,
      articleSection: article.category.title,
      inLanguage: LANG_TAG[locale],
    },
    breadcrumbLd(
      [
        { name: t.nav.blog, path: href('/blog') },
        { name: title, path: href(`/blog/${article.slug}`) },
      ],
      locale,
    ),
  ];

  return (
    <Layout seo={seo} jsonLd={jsonLd}>
      <div className="container-page">
        <Header />
        <article className="mx-auto max-w-3xl">
          <PageIntro
            crumbs={[{ href: href('/blog'), label: t.nav.blog }]}
            current={article.category.title}
            title={title}
            size="title"
            // 3D covers live in the accent palette; the old pastel tint would clash
            glow={article.scene ? undefined : image_background_color}
          >
            <time dateTime={article.pubdate} className="block text-sm text-muted">
              {formatDate(locale, article.pubdate)}
            </time>
          </PageIntro>
          {article.scene ? (
            <Scene3D
              scene={article.scene}
              label={article.title}
              mode="hero"
              aspectClassName="aspect-[4/3] md:aspect-[2/1]"
              className="reveal mt-10 [--d:500ms]"
            />
          ) : (
            <BlogCover
              image={image}
              color={image_background_color}
              mode="hero"
              priority
              className="reveal mt-10 aspect-[2/1] rounded-3xl border border-line [--d:500ms]"
            />
          )}
          <div className="content-blocks mt-12 text-lg text-fg/90">
            <MDXRemote {...mdxSource} components={mdxComponents} />
          </div>
        </article>
        {articles?.length > 0 && (
          <section className="section-gap">
            <SectionHeader
              title={t.blog.other}
              className="!mb-0"
              aside={
                <Link href={href('/blog')} className="flex gap-2 items-center transition-colors hover:text-fg">
                  {t.blog.allArticles} <FiArrowRight />
                </Link>
              }
            />
            <ArticleCard articles={articles} headingAs="h3" />
          </section>
        )}
        <Footer />
      </div>
    </Layout>
  );
}
