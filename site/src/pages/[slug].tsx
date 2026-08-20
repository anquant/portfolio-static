import Layout from "@/components/Layout";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getWorks, getWorkBySlug } from "@/lib/content";
import { GetStaticPaths, GetStaticProps } from "next";
import { WorksData } from "@/lib/types/worksType";
import VideoSection from "@/components/VideoSection";
import Image from "next/image";
import Link from "next/link";
import { Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["cyrillic"],
  weight: "500",
});

interface WorkProps {
  work: WorksData;
}

export default function Work({ work }: WorkProps) {
  const {
    title,
    description,
    link,
    illustration,
    color,
    company,
    problem,
    video,
    video_poster,
    mockups_description,
    mockups,
    result,
    meta_title,
    meta_description,
  } = work;
  const seo = { meta_title, meta_description };

  return (
    <>
      {color && (
        <style jsx global>{`
          body {
            background: #ffffff;
          }
        `}</style>
      )}
      <Layout seo={seo}>
        <div className="relative flex flex-col justify-between min-h-screen">
          <section
            style={
              color
                ? {
                    backgroundColor: "#FFFFFF",
                    background: `linear-gradient(180deg, ${color} 600px, #FFFFFF)`,
                  }
                : {}
            }
          >
            <div className="mx-auto w-full max-w-7xl px-6 xl:px-0">
              <Header classes="mb-20 md:mb-40" />
              <div className="md:px-20">
                <h1
                  className={`${manrope.className} text-5xl lg:text-7xl mb-6`}
                >
                  {title}
                </h1>
                <div className="flex flex-col md:flex-row justify-between gap-12">
                  <div className="basis-7/12">
                    <span className="text-lg">{description}</span>
                  </div>
                  {link && (
                    <div className="basis-5/12 flex justify-end items-end border-b border-[--text] pb-2.5">
                      <Link
                        href={link}
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        className="text-lg text-[--text] hover:text-[--link] duration-300"
                      >
                        {new URL(link).hostname}
                      </Link>
                    </div>
                  )}
                </div>
                <div className="mt-16">
                  {illustration && (
                    <Image
                      src={illustration.src}
                      width={illustration.width}
                      height={illustration.height}
                      alt={title}
                      className="bg-[--background] w-full"
                    />
                  )}
                </div>
                <div className="space-y-16 my-28 md:my-44">
                  <div
                    className="text-lg"
                    dangerouslySetInnerHTML={{ __html: company }}
                  />
                  <div className="flex flex-col md:flex-row gap-3 md:gap-8">
                    <div className="basis-2/12">
                      <h2 className="text-lg text-[--gray-text] mb-3.5">
                        проблематика
                      </h2>
                    </div>
                    <div
                      className="basis-8/12 text-lg"
                      dangerouslySetInnerHTML={{ __html: problem }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
          {video && (
            <section
              style={
                color
                  ? {
                      backgroundColor: color,
                    }
                  : {}
              }
            >
              <div className="mx-auto w-full max-w-7xl px-6 xl:px-0 my-28 md:my-44">
                <div className="md:px-20">
                  <VideoSection poster={video_poster?.src} video={video} />
                </div>
              </div>
            </section>
          )}
          <section className="mx-auto w-full max-w-7xl px-6 xl:px-0 my-28 md:my-44">
            <div className="md:px-20">
              <div className="space-y-28 md:space-y-44">
                {mockups_description && (
                  <div
                    className="max-w-4xl text-lg md:text-2xl leading-snug"
                    dangerouslySetInnerHTML={{ __html: mockups_description }}
                  />
                )}
                {mockups &&
                  mockups.length > 0 &&
                  (mockups.length === 1 ? (
                    <Image
                      src={mockups[0].src}
                      width={mockups[0].width}
                      height={mockups[0].height}
                      alt="Макет"
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {mockups.map((item, index) => (
                        <Image
                          key={index}
                          src={item.src}
                          width={item.width}
                          height={item.height}
                          alt="Макет"
                        />
                      ))}
                    </div>
                  ))}
                <div className="flex flex-col md:flex-row gap-3 md:gap-8">
                  <div className="basis-2/12">
                    <h2 className="text-lg text-[--gray-text] mb-3.5">
                      результат
                    </h2>
                  </div>
                  <div
                    className="basis-9/12 text-lg"
                    dangerouslySetInnerHTML={{ __html: result }}
                  />
                </div>
              </div>
            </div>
          </section>
          <div className="mx-auto w-full max-w-7xl px-6 xl:px-0">
            <Footer />
          </div>
        </div>
      </Layout>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = getWorks().map((w) => ({ params: { slug: w.slug } }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const work = getWorkBySlug(slug);

  if (!work) {
    return { notFound: true };
  }

  return {
    props: {
      work,
    },
  };
};
