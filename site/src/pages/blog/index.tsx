import { type GetStaticProps } from 'next';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import ArticleCard from '@/components/ArticleCard';
import { Footer } from '@/components/Footer';
import Header from '@/components/Header';
import Layout from '@/components/Layout';
import PageIntro from '@/components/PageIntro';
import { getBlogPage, getBlogCategories, getBlogArticles } from '@/lib/content';
import type { BlogPageData, BlogCategoriesData, BlogArticlesData } from '@/lib/content/schemas';
import { SITE_URL } from '@/lib/site';

interface BlogProps {
  blog_page: BlogPageData;
  blog_categories: BlogCategoriesData[];
  blog_articles: BlogArticlesData[];
}

export default function Blog({ blog_page, blog_categories, blog_articles }: BlogProps) {
  const { title, meta_title, meta_description } = blog_page;
  const seo = { meta_title, meta_description };

  // Sorting articles
  const ITEMS_PER_PAGE = 9;

  const router = useRouter();
  const searchParams = useSearchParams();

  const categorySlug = searchParams.get('category') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const [activeCategory, setActiveCategory] = useState(categorySlug);
  const [currentPage, setCurrentPage] = useState(page);

  useEffect(() => {
    setActiveCategory(categorySlug);
    setCurrentPage(page);
  }, [categorySlug, page]);

  const filteredArticles = useMemo(() => {
    if (!activeCategory) {
      return blog_articles;
    }

    return blog_articles.filter(article => article.category?.slug === activeCategory);
  }, [activeCategory, blog_articles]);

  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
  const paginatedArticles = filteredArticles.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleCategoryClick = (slug: string) => {
    const query = new URLSearchParams(searchParams.toString());
    if (slug === activeCategory || slug === '') {
      query.delete('category');
    } else {
      query.set('category', slug);
    }
    query.delete('page');
    const queryString = query.toString();
    router.push(queryString ? `?${queryString}` : '', { scroll: false });
  };

  const handlePageChange = (newPage: number) => {
    const query = new URLSearchParams(searchParams.toString());
    if (newPage === 1) {
      query.delete('page');
    } else {
      query.set('page', newPage.toString());
    }
    const queryString = query.toString();
    router.push(queryString ? `?${queryString}` : '', { scroll: false });
  };

  // Sorting categories
  const categories_with_articles = blog_categories.filter(category =>
    blog_articles.some(article => article.category.slug === category.slug),
  );

  const chip = (active: boolean) =>
    `rounded-full border px-4 py-2 text-sm transition-colors ${
      active ? 'border-fg bg-fg text-bg' : 'border-line text-muted hover:text-fg hover:border-fg/40'
    }`;

  return (
    <Layout seo={seo} site_url={SITE_URL} canonical={true}>
      <div className="container-page">
        <Header />
        <PageIntro title={title}>
          {categories_with_articles.length > 0 && (
            <div role="group" aria-label="Категории" className="flex flex-wrap gap-2">
              <button
                type="button"
                aria-pressed={!activeCategory}
                onClick={() => handleCategoryClick('')}
                className={chip(!activeCategory)}
              >
                Все
              </button>
              {categories_with_articles.map(category => (
                <button
                  key={category.slug}
                  type="button"
                  aria-pressed={activeCategory === category.slug}
                  onClick={() => handleCategoryClick(category.slug)}
                  className={chip(activeCategory === category.slug)}
                >
                  {category.title}
                </button>
              ))}
            </div>
          )}
        </PageIntro>
        <section>
          {/* key: re-run the card reveal when the filter or page changes */}
          <ArticleCard key={`${activeCategory}-${currentPage}`} articles={paginatedArticles} />
          {totalPages > 1 && (
            <nav aria-label="Страницы" className="flex justify-center mt-12 gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handlePageChange(i + 1)}
                  aria-current={currentPage === i + 1 ? 'page' : undefined}
                  className={`size-10 rounded-full border text-sm transition-colors ${
                    currentPage === i + 1 ? 'border-fg bg-fg text-bg' : 'border-line text-muted hover:text-fg'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </nav>
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
