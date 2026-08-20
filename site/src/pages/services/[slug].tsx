import Layout from "@/components/Layout";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getServicesList, getServiceBySlug, getWorks } from "@/lib/content";
import { GetStaticPaths, GetStaticProps } from "next";
import { ServicesListData } from "@/lib/types/servicesType";
import { WorksData } from "@/lib/types/worksType";
import Link from "next/link";
import WorkCard from "@/components/WorkCard";
import Button from "@/components/Button";
import { Manrope } from "next/font/google";
import { useSafari } from "@/hooks/useSafari";
import Image from "next/image";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "@/lib/mdx-components";

const manrope = Manrope({
  subsets: ["cyrillic"],
  weight: "700",
});

type SerializedBlock = {
  title: string;
  mdxSource: MDXRemoteSerializeResult;
};

type SerializedSection = {
  title: string;
  color: "light" | "dark";
  blocks: SerializedBlock[];
};

interface CurrentServiceProps {
  service: Omit<ServicesListData, "content"> & { sections: SerializedSection[] };
  works: WorksData[];
}

export default function CurrentService({ service, works }: CurrentServiceProps) {
  const { title, tech_list, introtext, bg_video, bg_video_poster, sections, meta_title, meta_description } =
    service;
  const seo = { meta_title, meta_description };

  // Safari detection
  const isSafari = useSafari();

  return (
    <>
      <style jsx global>{`
        body {
          background: #ffffff;
        }
      `}</style>
      <Layout seo={seo}>
        <div className="relative flex flex-col justify-between min-h-screen">
          <div className="relative bg-[--background] md:bg-[#e5e5e5] overflow-hidden">
            {bg_video?.src && (
              <>
                {!isSafari && (
                  <video
                    playsInline
                    muted
                    autoPlay
                    loop
                    {...(bg_video_poster && {
                      poster: bg_video_poster.src,
                    })}
                    className="hidden md:block absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
                  >
                    <source src={bg_video.src} type={bg_video.type} />
                  </video>
                )}
                {isSafari && bg_video_poster && (
                  <Image
                    src={bg_video_poster.src}
                    alt={title}
                    width={bg_video_poster.width}
                    height={bg_video_poster.height}
                    className="hidden md:block absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
                  />
                )}
              </>
            )}
            <div className="relative z-10 pb-20 md:pb-40">
              <div className="mx-auto w-full max-w-7xl px-6 xl:px-0">
                <Header classes="mb-20 md:mb-36" />
              </div>
              <section className="mx-auto w-full max-w-6xl px-6 xl:px-0">
                <div className="flex gap-2 mb-6">
                  <Link href="/" className="hover:text-[--link] duration-300">
                    Главная
                  </Link>
                  <span>/</span>
                  <Link
                    href="/services"
                    className="hover:text-[--link] duration-300"
                  >
                    Услуги
                  </Link>
                </div>
                <h1
                  className={`${manrope.className} text-4xl lg:text-5xl max-w-3xl mb-8 md:mb-10 lg:mb-12`}
                >
                  {title}
                </h1>
                {tech_list && (
                  <div className="flex flex-wrap gap-1 mb-28 md:mb-20">
                    {tech_list.map((item, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-full py-2 px-3 md:px-6"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-center">
                  <p className="max-w-2xl">{introtext}</p>
                </div>
              </section>
            </div>
          </div>
          {sections &&
            sections.map((c, c_index) => (
              <section
                key={c_index}
                className={
                  c.color === "dark"
                    ? "bg-[--background-dark]"
                    : "bg-[--background-light]"
                }
              >
                <div className="mx-auto w-full max-w-6xl py-16 md:py-32 px-6 xl:px-0">
                  <h2
                    className={`${manrope.className} ${c.color === "dark" ? "text-white" : ""} text-3xl lg:text-4xl font-semibold max-w-[90%] mb-14 md:mb-24`}
                  >
                    {c.title}
                  </h2>
                  {c.blocks && c.blocks.length > 0 && (
                    <div className="space-y-12">
                      {c.blocks.map((b, b_index) => (
                        <div
                          key={b_index}
                          className="flex flex-col md:flex-row gap-3.5 md:gap-6"
                        >
                          <h3
                            className={`md:basis-3/12 ${c.color === "dark" && "text-white"} text-lg md:text-xl font-semibold`}
                          >
                            {b.title}
                          </h3>
                          <div
                            className={`md:basis-9/12 content-blocks ${c.color === "dark" ? "text-white/60" : "text-[--text]/60"}`}
                          >
                            <MDXRemote {...b.mdxSource} components={mdxComponents} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            ))}
          <section className="mx-auto w-full max-w-6xl py-16 px-6 xl:px-0">
            <h2 className="text-xl md:text-2xl border-b-2 border-[--text] mb-14 md:mb-28 pb-3.5">
              Реализованные проекты
            </h2>
            <WorkCard works={works} />
            <div className="flex justify-center mt-28 md:mt-0">
              <Button type="link" href="/?page=2#work-4" className="text-lg">
                Все проекты
              </Button>
              <hr />
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
  const paths = getServicesList().map((s) => ({ params: { slug: s.slug } }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const service = getServiceBySlug(slug);

  if (!service) {
    return { notFound: true };
  }

  const sections: SerializedSection[] = await Promise.all(
    (service.content ?? []).map(async (section) => ({
      title: section.title,
      color: section.color,
      blocks: await Promise.all(
        (section.blocks ?? []).map(async (block) => ({
          title: block.title,
          mdxSource: await serialize(block.content, {
            mdxOptions: { remarkPlugins: [remarkGfm] },
          }),
        }))
      ),
    }))
  );

  const works = getWorks().slice(0, 3);
  const { content: _content, ...serviceRest } = service;

  return {
    props: {
      service: { ...serviceRest, sections },
      works,
    },
  };
};
