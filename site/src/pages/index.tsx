import Layout from "@/components/Layout";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import Button from "@/components/Button";
import ClientsSection from "@/components/ClientsSection";
import { getHome, getWorks, getClients } from "@/lib/content";
import { GetStaticProps } from "next";
import { HomeData } from "@/lib/types/homeType";
import { WorksData } from "@/lib/types/worksType";
import { ClientsData } from "@/lib/types/clientsType";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef, useLayoutEffect, useState, useEffect } from "react";
import ScrollLink from "@/components/ScrollLink";
import { useRouter } from "next/router";
import WorkCard from "@/components/WorkCard";
import { Manrope } from "next/font/google";
import { useSafari } from "@/hooks/useSafari";
import Image from "next/image";
import { SITE_URL } from "@/lib/site";

const manrope = Manrope({
  subsets: ["cyrillic"],
});

interface HomeProps {
  home: HomeData;
  works: WorksData[];
  clients?: ClientsData[];
}

export default function Home({ home, works, clients }: HomeProps) {
  const { title_h1, introtext, title_h2, meta_title, meta_description } = home;
  const seo = { meta_title, meta_description };

  // Safari detection
  const isSafari = useSafari();

  // Animation
  const { scrollYProgress } = useScroll();
  const ref = useRef<HTMLDivElement>(null);
  const [blockHeight, setBlockHeight] = useState(0);

  useLayoutEffect(() => {
    if (ref.current) {
      const { height } = ref.current.getBoundingClientRect();
      setBlockHeight(height);
    }
  }, [ref]);

  const y = useTransform(scrollYProgress, [0, 1], [0, -blockHeight]);

  // Pagination
  const itemsPerPage = 3;
  const router = useRouter();
  const { page } = router.query;
  const totalPages = Math.ceil(works.length / itemsPerPage);
  const [currentPage, setCurrentPage] = useState(() => Number(page) || 1);

  useEffect(() => {
    if (page !== undefined) {
      const currentPage = Number(page) || 1;

      if (currentPage === 1) {
        router.replace("/", undefined, { shallow: true });
        return;
      } else if (currentPage < 1 || currentPage > totalPages) {
        router.replace("/404");
      } else {
        setCurrentPage(currentPage);
      }
    } else {
      setCurrentPage(1);
    }
  }, [page, router, totalPages]);

  const handleClickLoadMore = () => {
    const nextPage = currentPage + 1;

    if (nextPage > totalPages) return;

    setCurrentPage(nextPage);
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, page: nextPage },
      },
      undefined,
      { shallow: true }
    );
  };

  const paginatedWorks = works.slice(0, currentPage * itemsPerPage);

  return (
    <>
      <style jsx global>{`
        body {
          background: linear-gradient(90deg, #d2d2d2, transparent);
        }
      `}</style>
      <Layout seo={seo} site_url={SITE_URL} canonical={true}>
        <div className="flex flex-col">
          <motion.div className="sticky top-0" style={{ y }} ref={ref}>
            <div className="relative min-h-[740px] md:min-h-[800px] lg:min-h-[650px] overflow-hidden">
              {!isSafari && (
                <video
                  playsInline
                  muted
                  autoPlay
                  loop
                  poster="/assets/images/home-mobius-strip.png"
                  className="absolute top-[65%] md:top-[75%] lg:top-[55%] left-1/2 w-[14rem] md:w-[16rem] lg:w-[24rem] xl:w-[26rem] max-w-full transform -translate-x-1/2 md:-translate-y-1/2 pointer-events-none z-0"
                >
                  <source
                    src="/assets/video/home-mobius-strip.webm"
                    type="video/webm"
                  />
                </video>
              )}
              {isSafari && (
                <Image
                  src="/assets/images/home-mobius-strip.png"
                  alt={title_h1}
                  width={1000}
                  height={1000}
                  className="absolute top-[65%] md:top-[75%] lg:top-[55%] left-1/2 w-[14rem] md:w-[16rem] lg:w-[24rem] xl:w-[26rem] max-w-full transform -translate-x-1/2 md:-translate-y-1/2 pointer-events-none z-0"
                />
              )}
              <section className="relative mx-auto max-w-7xl px-6 xl:px-0 z-10">
                <Header classes="mb-20 lg:mb-40" />
                <div className="md:px-20 pb-20">
                  <div className="flex flex-col lg:flex-row lg:justify-between gap-8 mb-14 md:mb-20">
                    <div className="basis-6/12">
                      <h1
                        className={`${manrope.className} text-[2.2rem] leading-[1.14] lg:text-[2.5rem] lg:leading-[1.18] font-bold`}
                      >
                        {title_h1}
                      </h1>
                    </div>
                    <div className="basis-5/12">
                      <div className="text-base md:text-lg opacity-60 lg:pt-[5.3rem]">
                        {introtext}
                      </div>
                    </div>
                  </div>
                  <div className="w-fit scale-[.65] md:scale-85 xl:scale-90">
                    <ScrollLink to="works" className="block w-fit group p-2">
                      <svg
                        className="fill-[--text] group-hover:fill-[--link] duration-300"
                        width="34"
                        height="39"
                        viewBox="0 0 34 39"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M19.2187 0.181824H14.4176V29.2102L3.31959 18.1122L0.0326538 21.4361L16.8182 38.2216L33.6406 21.4361L30.2798 18.1122L19.2187 29.2102V0.181824Z" />
                      </svg>
                    </ScrollLink>
                  </div>
                </div>
              </section>
            </div>
          </motion.div>
          <section id="works" className="h-full bg-white z-10">
            <div className="relative mx-auto max-w-7xl px-6 xl:px-0">
              <div className="md:px-20 pt-10 md:pt-20">
                <div className="flex justify-between gap-8 border-b-2 border-[--text] mb-14 md:mb-28 pb-3.5">
                  <h2 className="text-lg md:text-xl">{title_h2}</h2>
                  <div className="text-lg md:text-xl">
                    {paginatedWorks.length}
                    <span className="text-[--gray-text]">/{works.length}</span>
                  </div>
                </div>
                <WorkCard works={paginatedWorks} />
                {works.length > paginatedWorks.length && (
                  <div className="flex justify-center mt-28 md:mt-0">
                    <Button
                      type="button"
                      onClick={handleClickLoadMore}
                      className="text-lg"
                    >
                      Загрузить еще
                    </Button>
                  </div>
                )}
                <ClientsSection clients={clients} />
              </div>
              <Footer />
            </div>
          </section>
        </div>
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const home = getHome();
  const works = getWorks();
  const clients = getClients();

  return {
    props: {
      home,
      works,
      clients,
    },
  };
};
