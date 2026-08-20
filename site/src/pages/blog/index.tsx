import Layout from "@/components/Layout";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import Button from "@/components/Button";
import { getBlogPage, getBlogCategories, getBlogArticles } from "@/lib/content";
import { GetStaticProps } from "next";
import {
  BlogPageData,
  BlogCategoriesData,
  BlogArticlesData,
} from "@/lib/types/blogType";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ArticleCard from "@/components/ArticleCard";
import { Manrope } from "next/font/google";
import { SITE_URL } from "@/lib/site";

const manrope = Manrope({
  subsets: ["cyrillic"],
  weight: "500",
});

interface BlogProps {
  blog_page: BlogPageData;
  blog_categories: BlogCategoriesData[];
  blog_articles: BlogArticlesData[];
}

export default function Blog({
  blog_page,
  blog_categories,
  blog_articles,
}: BlogProps) {
  const { title, meta_title, meta_description } = blog_page;
  const seo = { meta_title, meta_description };

  // Sorting articles
  const ITEMS_PER_PAGE = 9;

  const router = useRouter();
  const searchParams = useSearchParams();

  const categorySlug = searchParams.get("category") || "";
  const page = parseInt(searchParams.get("page") || "1");

  const [activeCategory, setActiveCategory] = useState(categorySlug);
  const [currentPage, setCurrentPage] = useState(page);

  useEffect(() => {
    setActiveCategory(categorySlug);
    setCurrentPage(page);
  }, [categorySlug, page]);

  const filteredArticles = useMemo(() => {
    if (!activeCategory) return blog_articles;

    return blog_articles.filter(
      (article) => article.category?.slug === activeCategory
    );
  }, [activeCategory, blog_articles]);

  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCategoryClick = (slug: string) => {
    const query = new URLSearchParams(searchParams.toString());
    if (slug === activeCategory || slug === "") {
      query.delete("category");
    } else {
      query.set("category", slug);
    }
    query.delete("page");
    const queryString = query.toString();
    router.push(queryString ? `?${queryString}` : "", { scroll: false });
  };

  const handlePageChange = (newPage: number) => {
    const query = new URLSearchParams(searchParams.toString());
    if (newPage === 1) {
      query.delete("page");
    } else {
      query.set("page", newPage.toString());
    }
    const queryString = query.toString();
    router.push(queryString ? `?${queryString}` : "", { scroll: false });
  };

  // Sorting categories
  const categories_with_articles = blog_categories.filter((category) =>
    blog_articles.some((article) => article.category.slug === category.slug)
  );

  return (
    <Layout seo={seo} site_url={SITE_URL} canonical={true}>
      <div className="relative flex flex-col justify-between min-h-screen mx-auto max-w-7xl px-6 xl:px-0">
        <Header classes="mb-20 md:mb-40" />
        <section className="md:px-20">
          <h1
            className={`${manrope.className} text-5xl lg:text-7xl mb-2.5 md:mb-6`}
          >
            {title}
          </h1>
          {categories_with_articles?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-10">
              <Button
                type="button"
                size="small"
                theme="dark"
                onClick={() => handleCategoryClick("")}
                className={
                  !activeCategory
                    ? "pointer-events-none"
                    : "opacity-40 hover:opacity-100 duration-100"
                }
              >
                Все
              </Button>
              {categories_with_articles.map((category) => (
                <Button
                  key={category.slug}
                  type="button"
                  size="small"
                  theme="dark"
                  onClick={() => handleCategoryClick(category.slug)}
                  className={
                    activeCategory === category.slug
                      ? "pointer-events-none"
                      : "opacity-40 hover:opacity-100 duration-100"
                  }
                >
                  {category.title}
                </Button>
              ))}
              <div className="flex-1 flex gap-1.5 items-center">
                <hr className="flex-1 min-w-[50px] border-[#b8b8b8]" />
                <div className="text-sm text-[--gray-text] lowercase">
                  Категории
                </div>
              </div>
            </div>
          )}
          <ArticleCard articles={paginatedArticles} />
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-10 gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`min-w-[36px] px-3 py-1 border border-[--text] text-center ${currentPage === i + 1 ? "bg-[--text] text-white" : "hover:border-[--link] duration-300"}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </section>
        <Footer />
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const blog_page = getBlogPage();
  const blog_categories = getBlogCategories();
  const blog_articles = getBlogArticles();

  return {
    props: {
      blog_page,
      blog_categories,
      blog_articles,
    },
  };
};
