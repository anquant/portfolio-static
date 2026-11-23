import { type GetStaticProps } from 'next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FiArrowDown } from 'react-icons/fi';

import Button from '@/components/Button';
import ClientsSection from '@/components/ClientsSection';
import { Footer } from '@/components/Footer';
import Header from '@/components/Header';
import Layout from '@/components/Layout';
import SectionHeader from '@/components/SectionHeader';
import WorkCard from '@/components/WorkCard';
import { getHome, getWorks, getClients } from '@/lib/content';
import type { HomeData } from '@/lib/content/schemas';
import type { WorksData } from '@/lib/content/schemas';
import type { ClientsData } from '@/lib/content/schemas';
import { SITE_URL } from '@/lib/site';

// three.js is loaded only in the browser and after the page is interactive
const HeroScene = dynamic(() => import('@/components/hero/HeroScene'), {
  ssr: false,
});

interface HomeProps {
  home: HomeData;
  works: WorksData[];
  clients?: ClientsData[];
}

const ITEMS_PER_PAGE = 3;

export default function Home({ home, works, clients }: HomeProps) {
  const { title_h1, introtext, title_h2, meta_title, meta_description } = home;
  const seo = { meta_title, meta_description };

  // "Load more" pagination, mirrored in ?page=N so a shared link restores it
  const router = useRouter();
  const { page } = router.query;
  const totalPages = Math.ceil(works.length / ITEMS_PER_PAGE);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (page === undefined) {
      return setCurrentPage(1);
    }
    const n = Number(page) || 1;
    if (n <= 1) {
      router.replace('/', undefined, { shallow: true });
    } else {
      setCurrentPage(Math.min(n, totalPages));
    }
  }, [page, router, totalPages]);

  const handleClickLoadMore = () => {
    const nextPage = currentPage + 1;
    if (nextPage > totalPages) {
      return;
    }
    setCurrentPage(nextPage);
    router.push({ pathname: '/', query: { page: nextPage } }, undefined, {
      shallow: true,
      scroll: false,
    });
  };

  const paginatedWorks = works.slice(0, currentPage * ITEMS_PER_PAGE);

  return (
    <Layout seo={seo} site_url={SITE_URL} canonical={true}>
      {/* Hero: interactive 3D background (wave field + morphing shape) */}
      <section className="relative isolate overflow-hidden min-h-[100svh] lg:min-h-[92svh] flex flex-col">
        <div className="absolute inset-0 -z-10">
          <HeroScene />
          {/* Keeps the text readable over the scene and blends into the next section */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-bg via-bg/60 to-transparent lg:via-bg/30"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent"
          />
        </div>
        <div className="container-page flex-1 flex flex-col">
          <Header />
          <div className="flex-1 flex items-start lg:items-center pb-24 md:pb-32">
            <div className="max-w-2xl lg:max-w-[46rem]">
              <div className="reveal eyebrow mb-6" style={{ '--d': '150ms' } as React.CSSProperties}>
                UX/UI-дизайн · Разработка · SEO
              </div>
              <h1 style={{ '--d': '300ms' } as React.CSSProperties} className="reveal t-hero">
                {title_h1}
              </h1>
              <p
                style={{ '--d': '500ms' } as React.CSSProperties}
                className="reveal mt-6 md:mt-8 max-w-xl text-lg md:text-xl text-muted"
              >
                {introtext}
              </p>
              <div style={{ '--d': '700ms' } as React.CSSProperties} className="reveal mt-10 flex flex-wrap gap-3">
                <Button type="link" href="#works">
                  Смотреть проекты <FiArrowDown aria-hidden />
                </Button>
                <Button type="link" href="/contacts" variant="secondary">
                  Обсудить проект
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Works */}
      <section id="works" className="container-page scroll-mt-6">
        <SectionHeader
          title={title_h2}
          aside={
            <span className="tabular-nums">
              <span className="text-fg">{paginatedWorks.length}</span> / {works.length}
            </span>
          }
        />
        <WorkCard works={paginatedWorks} />
        {works.length > paginatedWorks.length && (
          <div className="flex justify-center mt-16 md:mt-24">
            <Button variant="secondary" onClick={handleClickLoadMore}>
              Показать ещё {Math.min(ITEMS_PER_PAGE, works.length - paginatedWorks.length)}
            </Button>
          </div>
        )}
        <ClientsSection clients={clients} />
        <Footer />
      </section>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      home: getHome(),
      works: getWorks(),
      clients: getClients(),
    },
  };
};
