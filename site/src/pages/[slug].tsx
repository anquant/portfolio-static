import Layout from "@/components/Layout";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getWorks, getWorkBySlug } from "@/lib/content";
import { GetStaticPaths, GetStaticProps } from "next";
import { WorksData } from "@/lib/types/worksType";
import Image from "next/image";
import Link from "next/link";
import { MdOutlineArrowOutward } from "react-icons/md";

interface WorkProps {
  work: WorksData;
  next: { slug: string; title: string } | null;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-8 border-t border-line pt-8">
      <h2 className="md:col-span-3 eyebrow pt-1">{label}</h2>
      <div className="md:col-span-9 text-lg md:text-xl leading-relaxed text-fg/90">
        {children}
      </div>
    </div>
  );
}

export default function Work({ work, next }: WorkProps) {
  const {
    title,
    description,
    infotext,
    link,
    illustration,
    color,
    company,
    problem,
    cover,
    mockups_description,
    mockups,
    result,
    meta_title,
    meta_description,
  } = work;
  const seo = { meta_title, meta_description };

  return (
    <Layout seo={seo}>
      {/* Project colour is used as a soft glow, not as a light page background */}
      <section className="relative overflow-hidden">
        {color && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[44rem] opacity-25"
            style={{
              background: `radial-gradient(60% 60% at 50% 0%, ${color}, transparent)`,
            }}
          />
        )}
        <div className="container-page relative">
          <Header />
          <nav aria-label="Хлебные крошки" className="flex gap-2 text-sm text-muted mb-6">
            <Link href="/" className="hover:text-fg transition-colors">
              Проекты
            </Link>
            <span aria-hidden>/</span>
            <span className="text-fg">{title}</span>
          </nav>
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight">
            {title}
          </h1>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-8 md:items-end">
            <div className="md:col-span-7 space-y-3">
              <p className="text-lg md:text-xl">{description}</p>
              <p className="text-muted">{infotext}</p>
            </div>
            {link && (
              <div className="md:col-span-5 md:justify-self-end">
                <a
                  href={link}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-5 py-2.5 transition-colors hover:border-accent hover:text-accent"
                >
                  {new URL(link).hostname}
                  <MdOutlineArrowOutward />
                </a>
              </div>
            )}
          </div>
          {illustration && (
            <div className="mt-12 md:mt-16 overflow-hidden rounded-3xl border border-line">
              <Image
                src={illustration.src}
                width={illustration.width}
                height={illustration.height}
                alt={title}
                priority
                sizes="(min-width: 1280px) 80rem, 100vw"
                className="w-full h-auto"
              />
            </div>
          )}
        </div>
      </section>

      <div className="container-page">
        <div className="space-y-12 my-20 md:my-32 max-w-5xl">
          <Row label="О компании">
            <div dangerouslySetInnerHTML={{ __html: company }} />
          </Row>
          <Row label="Задача">
            <div dangerouslySetInnerHTML={{ __html: problem }} />
          </Row>
        </div>

        {cover && (
          <div className="overflow-hidden rounded-3xl border border-line">
            <Image
              src={cover.src}
              width={cover.width}
              height={cover.height}
              alt={`${title} — главный экран`}
              sizes="(min-width: 1280px) 80rem, 100vw"
              className="w-full h-auto"
            />
          </div>
        )}

        {mockups_description && (
          <div
            className="max-w-4xl mt-20 md:mt-32 text-xl md:text-2xl leading-snug"
            dangerouslySetInnerHTML={{ __html: mockups_description }}
          />
        )}

        {mockups && mockups.length > 0 && (
          <div
            className={`mt-12 md:mt-20 grid grid-cols-1 gap-4 md:gap-6 ${
              mockups.length > 1 ? "md:grid-cols-2" : ""
            }`}
          >
            {mockups.map((item, index) => (
              <div key={index} className="overflow-hidden rounded-2xl border border-line">
                <Image
                  src={item.src}
                  width={item.width}
                  height={item.height}
                  alt={`${title} — макет ${index + 1}`}
                  sizes={mockups.length > 1 ? "(min-width: 768px) 50vw, 100vw" : "100vw"}
                  className="w-full h-auto"
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-20 md:mt-32 max-w-5xl">
          <Row label="Результат">
            <div dangerouslySetInnerHTML={{ __html: result }} />
          </Row>
        </div>

        {next && (
          <Link
            href={`/${next.slug}`}
            className="group mt-24 md:mt-32 flex items-center justify-between gap-6 rounded-3xl border border-line bg-surface p-8 md:p-12 transition-colors hover:bg-surface-2"
          >
            <div>
              <div className="eyebrow mb-3">Следующий проект</div>
              <div className="font-display text-3xl md:text-5xl font-bold transition-colors group-hover:text-accent">
                {next.title}
              </div>
            </div>
            <span
              aria-hidden
              className="grid place-items-center size-12 md:size-16 shrink-0 rounded-full border border-line text-2xl transition-colors group-hover:bg-fg group-hover:text-bg"
            >
              →
            </span>
          </Link>
        )}

        <Footer />
      </div>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: getWorks().map((w) => ({ params: { slug: w.slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const work = getWorkBySlug(slug);
  if (!work) return { notFound: true };

  const works = getWorks();
  const i = works.findIndex((w) => w.slug === slug);
  const n = works[(i + 1) % works.length];
  const next = n && n.slug !== slug ? { slug: n.slug, title: n.title } : null;

  return { props: { work, next } };
};
