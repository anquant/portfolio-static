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
import { Manrope } from "next/font/google";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "@/lib/mdx-components";

const manrope = Manrope({
  subsets: ["cyrillic"],
  weight: "600",
});

interface ArticleProps {
  article: BlogArticlesData;
  articles: BlogArticlesData[];
  mdxSource: MDXRemoteSerializeResult;
}

export default function Article({ article, articles, mdxSource }: ArticleProps) {
  const { title, image, image_background_color, meta_title, meta_description } =
    article;
  const seo = { meta_title, meta_description };

  const imageClass =
    "absolute top-16 left-1/2 -translate-x-1/2 w-full max-w-[350px] md:max-w-[450px] h-auto inset-0 pointer-events-none";

  return (
    <Layout seo={seo}>
      <div className="relative flex flex-col justify-between min-h-screen">
        <section
          style={{ backgroundColor: image_background_color || "#d1d0ca" }}
        >
          <div className="mx-auto w-full max-w-7xl px-6 xl:px-0">
            <div className="relative flex w-full h-[24rem] md:h-[28rem]">
              {image ? (
                <Image
                  src={image.src}
                  width={image.width}
                  height={image.height}
                  alt={article.title}
                  className={imageClass}
                />
              ) : (
                <Image
                  src="/assets/images/default-image-blog.png"
                  width="600"
                  height="600"
                  alt={article.title}
                  className={imageClass}
                />
              )}
              <div className="mx-auto w-full">
                <Header />
              </div>
            </div>
          </div>
        </section>
        <article className="mx-auto w-full max-w-5xl px-6 xl:px-0">
          <div className="flex gap-2 mt-14 mb-6">
            <Link href="/" className="hover:text-[--link] duration-300">
              Главная
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-[--link] duration-300">
              Блог
            </Link>
          </div>
          <h1
            className={`${manrope.className} text-3xl leading-tight md:text-4xl md:leading-[1.24] lg:text-5xl lg:leading-[1.19] mb-8 md:mb-10 lg:mb-12`}
          >
            {title}
          </h1>
          <div className="content-blocks">
            <MDXRemote {...mdxSource} components={mdxComponents} />
          </div>
        </article>
        {articles?.length > 0 && (
          <section className="mx-auto w-full max-w-7xl mt-20 md:mt-28 px-6 xl:px-0">
            <div className="flex flex-wrap justify-between items-end gap-2 mb-6 md:mb-12">
              <div className="text-3xl md:text-4xl xl:text-5xl font-thin">
                Другие статьи
              </div>
              <div>
                <Link
                  href="/blog"
                  className="relative flex gap-2 items-center hover:text-[--link] duration-300"
                >
                  Все статьи <FiArrowRight />
                </Link>
              </div>
            </div>
            <ArticleCard articles={articles} />
          </section>
        )}
        <div className="mx-auto w-full max-w-7xl px-6 xl:px-0">
          <Footer />
        </div>
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
