import Layout from "@/components/Layout";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getBlogArticles, getArticleBySlug } from "@/lib/content";
import { GetStaticPaths, GetStaticProps } from "next";
import { BlogArticlesData } from "@/lib/types/blogType";
import Image from "next/image";
import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import { FiArrowRight } from "react-icons/fi";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "@/lib/mdx-components";

interface ArticleProps {
  article: BlogArticlesData;
  articles: BlogArticlesData[];
  mdxSource: MDXRemoteSerializeResult;
}

export default function Article({ article, articles, mdxSource }: ArticleProps) {
  const { title, image, image_background_color, meta_title, meta_description } =
    article;
  const seo = { meta_title, meta_description };

  return (
    <Layout seo={seo}>
      <div className="container-page">
        <Header />
        <article className="mx-auto max-w-3xl">
          <nav aria-label="Хлебные крошки" className="flex gap-2 text-sm text-muted mb-6">
            <Link href="/blog" className="hover:text-fg transition-colors">
              Блог
            </Link>
            <span aria-hidden>/</span>
            <span>{article.category.title}</span>
          </nav>
          <h1 className="font-display text-3xl leading-tight md:text-5xl md:leading-[1.15] font-bold tracking-tight">
            {title}
          </h1>
          <time dateTime={article.pubdate} className="block mt-5 text-sm text-muted">
            {format(new Date(article.pubdate), "d MMMM yyyy", { locale: ru })}
          </time>
          <div
            className="relative mt-10 flex items-center justify-center aspect-[2/1] overflow-hidden rounded-3xl"
            style={{ backgroundColor: image_background_color || "#d1d0ca" }}
          >
            <Image
              src={image?.src ?? "/assets/images/default-image-blog.png"}
              width={image?.width ?? 600}
              height={image?.height ?? 600}
              alt=""
              priority
              className="w-2/5 h-auto"
            />
          </div>
          <div className="content-blocks mt-12 text-lg text-fg/90">
            <MDXRemote {...mdxSource} components={mdxComponents} />
          </div>
        </article>
        {articles?.length > 0 && (
          <section className="mt-24 md:mt-32">
            <div className="flex items-end justify-between gap-6 border-b border-line pb-4">
              <h2 className="font-display text-2xl md:text-3xl font-semibold">
                Другие статьи
              </h2>
              <Link
                href="/blog"
                className="flex gap-2 items-center text-sm text-muted hover:text-fg transition-colors"
              >
                Все статьи <FiArrowRight />
              </Link>
            </div>
            <ArticleCard articles={articles} />
          </section>
        )}
        <Footer />
      </div>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = getBlogArticles().map((a) => ({ params: { slug: a.slug } }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const found = getArticleBySlug(slug);

  if (!found) {
    return { notFound: true };
  }

  const mdxSource = await serialize(found.body, {
    mdxOptions: { remarkPlugins: [remarkGfm] },
  });

  const articles = getBlogArticles()
    .filter((a) => a.slug !== slug)
    .slice(0, 3);

  return {
    props: {
      article: found.article,
      articles,
      mdxSource,
    },
  };
};
