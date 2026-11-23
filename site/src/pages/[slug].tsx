import { type GetStaticPaths, type GetStaticProps } from 'next';
import Link from 'next/link';
import { FiArrowRight, FiArrowUpRight } from 'react-icons/fi';

import CaseVideo from '@/components/CaseVideo';
import { Footer } from '@/components/Footer';
import Header from '@/components/Header';
import Layout from '@/components/Layout';
import PageIntro from '@/components/PageIntro';
import ProjectMedia from '@/components/ProjectMedia';
import Reveal from '@/components/Reveal';
import Scene3D from '@/components/Scene3D';
import { getWorks, getWorkBySlug } from '@/lib/content';
import type { WorksData } from '@/lib/content/schemas';
import { displayHost } from '@/lib/url';

interface WorkProps {
  work: WorksData;
  next: { slug: string; title: string } | null;
}

/**
 * A chapter of the case story. Numbered and set in the display face so it
 * reads as narrative, unlike the small-caps reference facts in the hero.
 */
function Row({ index, label, children }: { index: number; label: string; children: React.ReactNode }) {
  return (
    <Reveal className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-8 border-t border-line pt-8">
      <h2 className="md:col-span-3 flex items-baseline gap-3 font-display font-semibold text-xl md:text-2xl">
        <span className="text-sm text-muted tabular-nums">{String(index).padStart(2, '0')}</span>
        {label}
      </h2>
      <div className="md:col-span-9 text-lg md:text-xl leading-relaxed text-fg/90">{children}</div>
    </Reveal>
  );
}

/** One cell of the hero grid: a hairline, a small label, the fact */
function Cell({
  label,
  className = '',
  delay,
  children,
}: {
  label: string;
  className?: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`reveal border-t border-line pt-4 ${className}`}
      style={{ '--d': `${delay}ms` } as React.CSSProperties}
    >
      <div className="eyebrow mb-3">{label}</div>
      {children}
    </div>
  );
}

export default function Work({ work, next }: WorkProps) {
  const {
    title,
    description,
    infotext,
    scope,
    link,
    illustration,
    scene,
    color,
    company,
    problem,
    video,
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
      <section className="relative">
        <div className="container-page relative">
          <Header />
          {/*
            Desktop: two halves of one block. Title + lead read as one thought on
            the left, the facts sit on the 3D frame's bottom edge, so the whole
            opening fits the first screen. On phones everything stacks.
          */}
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4 lg:grid-rows-[auto_1fr]">
            <PageIntro
              crumbs={[{ href: '/', label: 'Проекты' }]}
              title={title}
              lead={<span className="text-fg/85">{description}</span>}
              glow={color}
              className="lg:col-span-2"
            >
              {scope && (
                <ul aria-label="Что сделано" className="flex flex-wrap gap-1.5">
                  {scope.map(item => (
                    <li key={item} className="rounded-full border border-line px-3 py-1 text-[13px] text-fg/80">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </PageIntro>
            <div className="lg:col-span-2 lg:col-start-3 lg:row-span-2 lg:row-start-1">
              {scene ? (
                <Scene3D
                  scene={scene}
                  label={title}
                  mode="hero"
                  aspectClassName="aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[26rem]"
                  className="reveal [--d:600ms]"
                />
              ) : (
                illustration && (
                  <ProjectMedia
                    {...illustration}
                    alt={title}
                    color={color}
                    priority
                    sizes="(min-width: 1280px) 40rem, (min-width: 1024px) 50vw, 100vw"
                    className="reveal [--d:600ms]"
                  />
                )
              )}
            </div>
            {/* the facts sit on the media's bottom edge (desktop), after it on phones */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:col-span-2 lg:self-end">
              <Cell label="Стек" delay={500} className={link ? '' : 'sm:col-span-2'}>
                <p className="text-muted leading-relaxed">{infotext}</p>
              </Cell>
              {link && (
                <Cell label="Сайт" delay={600}>
                  <a
                    href={link}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="inline-flex items-center gap-2 text-lg transition-colors hover:text-accent"
                  >
                    {displayHost(link)}
                    <FiArrowUpRight />
                  </a>
                </Cell>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container-page">
        <div className="space-y-12 mt-28 mb-20 md:mt-48 md:mb-32 max-w-5xl">
          <Row index={1} label="Заказчик">
            <div dangerouslySetInnerHTML={{ __html: company }} />
          </Row>
          <Row index={2} label="Задача">
            <div dangerouslySetInnerHTML={{ __html: problem }} />
          </Row>
        </div>

        <Reveal>
          {video ? (
            <CaseVideo key={video.src} video={video} poster={cover} title={title} color={color} />
          ) : (
            cover && (
              <ProjectMedia
                {...cover}
                alt={`${title} — главный экран`}
                color={color}
                sizes="(min-width: 1280px) 80rem, 100vw"
              />
            )
          )}
        </Reveal>

        {mockups_description && (
          <div className="section-gap max-w-5xl">
            <Row index={3} label="Решение">
              <div dangerouslySetInnerHTML={{ __html: mockups_description }} />
            </Row>
          </div>
        )}

        {mockups && mockups.length > 0 && (
          <div
            className={`mt-12 md:mt-20 grid grid-cols-1 gap-4 md:gap-6 ${mockups.length > 1 ? 'md:grid-cols-2' : ''}`}
          >
            {mockups.map((item, index) => (
              <Reveal key={index} delay={(index % 2) * 120}>
                <ProjectMedia
                  {...item}
                  alt={`${title} — макет ${index + 1}`}
                  color={color}
                  sizes={mockups.length > 1 ? '(min-width: 768px) 50vw, 100vw' : '100vw'}
                />
              </Reveal>
            ))}
          </div>
        )}

        <div className="section-gap max-w-5xl">
          <Row index={mockups_description ? 4 : 3} label="Результат">
            <div dangerouslySetInnerHTML={{ __html: result }} />
          </Row>
        </div>

        {next && (
          <Reveal>
            <Link
              href={`/${next.slug}`}
              className="group section-gap flex items-center justify-between gap-6 rounded-3xl border border-line bg-surface p-8 md:p-12 transition-colors hover:bg-surface-2"
            >
              <div>
                <div className="eyebrow mb-3">Следующий проект</div>
                <div className="t-card-lg md:text-5xl transition-colors group-hover:text-accent">{next.title}</div>
              </div>
              <span
                aria-hidden
                className="grid place-items-center size-12 md:size-16 shrink-0 rounded-full border border-line text-2xl transition-colors group-hover:bg-fg group-hover:text-bg"
              >
                <FiArrowRight />
              </span>
            </Link>
          </Reveal>
        )}

        <Footer />
      </div>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: getWorks().map(w => ({ params: { slug: w.slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const work = getWorkBySlug(slug);
  if (!work) {
    return { notFound: true };
  }

  const works = getWorks();
  const i = works.findIndex(w => w.slug === slug);
  const n = works[(i + 1) % works.length];
  const next = n && n.slug !== slug ? { slug: n.slug, title: n.title } : null;

  return { props: { work, next } };
};
