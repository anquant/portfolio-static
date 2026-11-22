import Layout from "@/components/Layout";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getServicesList, getServiceBySlug, getWorks } from "@/lib/content";
import { GetStaticPaths, GetStaticProps } from "next";
import { ServicesListData } from "@/lib/types/servicesType";
import { WorksData } from "@/lib/types/worksType";
import Link from "next/link";
import dynamic from "next/dynamic";
import WorkCard from "@/components/WorkCard";
import Button from "@/components/Button";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "@/lib/mdx-components";

const HeroScene = dynamic(() => import("@/components/HeroScene"), { ssr: false });

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
  const { title, tech_list, introtext, scene, sections, meta_title, meta_description } =
    service;
  const seo = { meta_title, meta_description };

  return (
    <Layout seo={seo}>
      {/* Hero: same interactive 3D background as the home page, own centrepiece per service */}
      <section className="relative isolate overflow-hidden border-b border-line">
        <div className="absolute inset-0 -z-10">
          <HeroScene variant={scene ?? "blob"} />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-bg via-bg/70 to-transparent lg:via-bg/40"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-bg to-transparent"
          />
        </div>
        <div className="container-page relative pb-20 md:pb-32 lg:min-h-[44rem]">
          <Header />
          <nav aria-label="Хлебные крошки" style={{ "--d": "100ms" } as React.CSSProperties} className="reveal flex gap-2 text-sm text-muted mb-6">
            <Link href="/services" className="hover:text-fg transition-colors">
              Услуги
            </Link>
            <span aria-hidden>/</span>
            <span className="text-fg">{service.preview_title}</span>
          </nav>
          <h1 style={{ "--d": "250ms" } as React.CSSProperties} className="reveal font-display text-4xl md:text-6xl font-bold tracking-tight max-w-4xl">
            {title}
          </h1>
          {tech_list && (
            <ul style={{ "--d": "450ms" } as React.CSSProperties} className="reveal flex flex-wrap gap-2 mt-8">
              {tech_list.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-line bg-surface/70 px-4 py-2 text-sm"
                >
                  {item}
                </li>
              ))}
            </ul>
          )}
          {introtext && (
            <p style={{ "--d": "600ms" } as React.CSSProperties} className="reveal mt-10 max-w-2xl text-lg md:text-xl text-muted leading-relaxed">
              {introtext}
            </p>
          )}
          <div style={{ "--d": "750ms" } as React.CSSProperties} className="reveal mt-10">
            <Button type="link" href="/contacts">
              Обсудить задачу <span aria-hidden>→</span>
            </Button>
          </div>
        </div>
      </section>

      {sections.map((section, s_index) => (
        <section
          key={s_index}
          className={section.color === "dark" ? "bg-surface border-b border-line" : "border-b border-line"}
        >
          <div className="container-page py-16 md:py-28">
            <h2 className="font-display text-3xl lg:text-4xl font-semibold max-w-3xl mb-12 md:mb-20">
              {section.title}
            </h2>
            {section.blocks.length > 0 && (
              <div className="divide-y divide-line">
                {section.blocks.map((b, b_index) => (
                  <div
                    key={b_index}
                    className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-8 py-8 first:pt-0"
                  >
                    <h3 className="md:col-span-4 flex gap-4 text-lg md:text-xl font-semibold">
                      <span className="font-display text-muted text-sm pt-1.5">
                        {String(b_index + 1).padStart(2, "0")}
                      </span>
                      {b.title}
                    </h3>
                    <div className="md:col-span-8 content-blocks text-muted">
                      <MDXRemote {...b.mdxSource} components={mdxComponents} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      ))}

      <div className="container-page">
        <section className="mt-20 md:mt-32">
          <div className="flex items-end justify-between gap-6 border-b border-line pb-4 mb-12 md:mb-20">
            <h2 className="font-display text-2xl md:text-3xl font-semibold">
              Реализованные проекты
            </h2>
            <Link href="/#works" className="text-sm text-muted hover:text-fg transition-colors">
              Все проекты →
            </Link>
          </div>
          <WorkCard works={works} />
        </section>
        <Footer />
      </div>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: getServicesList().map((s) => ({ params: { slug: s.slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const service = getServiceBySlug(slug);
  if (!service) return { notFound: true };

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

  const { content: _content, ...serviceRest } = service;

  return {
    props: {
      service: { ...serviceRest, sections },
      works: getWorks().slice(0, 3),
    },
  };
};
