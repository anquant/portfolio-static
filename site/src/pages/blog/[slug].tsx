import Layout from "@/components/Layout";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getBlogArticles, getArticleBySlug } from "@/lib/content";
import { GetStaticPaths, GetStaticProps } from "next";
import { BlogArticlesData } from "@/lib/types/blogType";
import BlogCover from "@/components/BlogCover";
import PageIntro from "@/components/PageIntro";
import SectionHeader from "@/components/SectionHeader";
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

export default function Article({
  article,
  articles,
  mdxSource,
}: ArticleProps) {
  const { title, image, image_background_color, meta_title, meta_description } =
    article;
  const seo = { meta_title, meta_description };

  return (
    <Layout seo={seo}>
      <div className="container-page">
        <Header />
        <article className="mx-auto max-w-3xl">
          <PageIntro
            crumbs={[{ href: "/blog", label: "Блог" }]}
            current={article.category.title}
            title={title}
            size="title"
            glow={image_background_color}
          >
            <time
              dateTime={article.pubdate}
              className="block text-sm text-muted"
            >
              {format(new Date(article.pubdate), "d MMMM yyyy", { locale: ru })}
            </time>
          </PageIntro>
          <BlogCover
            image={image}
            color={image_background_color}
            mode="hero"
            priority
            className="reveal mt-10 aspect-[2/1] rounded-3xl border border-line [--d:500ms]"
          />
          <div className="content-blocks mt-12 text-lg text-fg/90">
            <MDXRemote {...mdxSource} components={mdxComponents} />
          </div>
        </article>
        {articles?.length > 0 && (
          <section className="mt-24 md:mt-32">
            <SectionHeader
              title="Другие статьи"
              className="!mb-0"
              aside={
                <Link
                  href="/blog"
                  className="flex gap-2 items-center transition-colors hover:text-fg"
                >
                  Все статьи <FiArrowRight />
                </Link>
              }
            />
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
