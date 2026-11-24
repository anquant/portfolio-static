import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import ArticleCard from '@/components/ArticleCard';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Layout from '@/components/Layout';
import PageIntro from '@/components/PageIntro';
import type { BlogPageData, BlogCategoriesData, BlogArticlesData } from '@/lib/content/schemas';
import { pageFromQuery } from '@/lib/pagination';
import { breadcrumbLd } from '@/lib/seo';
import { useLocale } from '@/lib/use-locale';

interface BlogProps {
  blog_page: BlogPageData;
  blog_categories: BlogCategoriesData[];
  blog_articles: BlogArticlesData[];
}

export default function BlogPage({ blog_page, blog_categories, blog_articles }: BlogProps) {
  const { title, meta_title, meta_description } = blog_page;
  const seo = { meta_title, meta_description };
  const { locale, t, href } = useLocale();

  // Sorting articles
  const ITEMS_PER_PAGE = 9;

  const router = useRouter();
  const searchParams = useSearchParams();

  const categorySlug = searchParams.get('category') || '';
  const pageParam = searchParams.get('page');

  const [activeCategory, setActiveCategory] = useState(categorySlug);

  useEffect(() => {
    setActiveCategory(categorySlug);
  }, [categorySlug]);

  const filteredArticles = useMemo(() => {
    if (!activeCategory) {
      return blog_articles;
    }

    return blog_articles.filter(article => article.category?.slug === activeCategory);
  }, [activeCategory, blog_articles]);

  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
  const currentPage = pageFromQuery(pageParam, totalPages);
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
    <Layout seo={seo} jsonLd={[breadcrumbLd([{ name: title, path: href('/blog') }], locale)]}>
      <div className="container-page">
        <Header />
        <PageIntro title={title}>
          {categories_with_articles.length > 0 && (
            <div role="group" aria-label={t.blog.categories} className="flex flex-wrap gap-2">
              <button
                type="button"
                aria-pressed={!activeCategory}
                onClick={() => handleCategoryClick('')}
                className={chip(!activeCategory)}
              >
                {t.blog.all}
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
            <nav aria-label={t.blog.pages} className="flex justify-center mt-12 gap-2">
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
