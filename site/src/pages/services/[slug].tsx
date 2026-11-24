import { type GetStaticPaths, type GetStaticProps } from 'next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { MDXRemote, type MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import { FiArrowRight } from 'react-icons/fi';
import remarkGfm from 'remark-gfm';

import Button from '@/components/Button';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Layout from '@/components/Layout';
import PageIntro from '@/components/PageIntro';
import Reveal from '@/components/Reveal';
import SectionHeader from '@/components/SectionHeader';
import { Cards, Faq, Pricing, Process, faqLd } from '@/components/service/ServiceBlocks';
import WorkCard from '@/components/WorkCard';
import { ContentError, getServicesList, getServiceBySlug, getWorks } from '@/lib/content';
import type { WorksData } from '@/lib/content/schemas';
import type { ServicesListData } from '@/lib/content/schemas';
import { mdxComponents } from '@/lib/mdx-components';
import { breadcrumbLd, personRef } from '@/lib/seo';

const HeroScene = dynamic(() => import('@/components/hero/HeroScene'), {
  ssr: false,
});

type SerializedBlock = {
  title: string;
  mdxSource: MDXRemoteSerializeResult;
};

type SerializedSection = {
  title: string;
  color: 'light' | 'dark';
  blocks: SerializedBlock[];
};

interface CurrentServiceProps {
  service: Omit<ServicesListData, 'content'> & {
    sections: SerializedSection[];
  };
  works: WorksData[];
}

export default function CurrentService({ service, works }: CurrentServiceProps) {
  const { title, tech_list, introtext, scene, sections, tasks, process, pricing, faq, meta_title, meta_description } =
    service;
  const offers = pricing?.plans.filter(plan => plan.price_from) ?? [];
  const seo = { meta_title, meta_description };
  const jsonLd = [
    {
      '@type': 'Service',
      name: service.preview_title,
      ...(meta_description && { description: meta_description }),
      provider: personRef,
      areaServed: { '@type': 'Country', name: 'Россия' },
      inLanguage: 'ru-RU',
      ...(offers.length > 0 && {
        offers: offers.map(plan => ({
          '@type': 'Offer',
          name: plan.title,
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            minPrice: plan.price_from,
            priceCurrency: 'RUB',
            ...(plan.unit && { unitText: plan.unit }),
          },
        })),
      }),
    },
    ...(faq ? [faqLd(faq.items)] : []),
    breadcrumbLd([
      { name: 'Услуги', path: '/services' },
      { name: service.preview_title, path: `/services/${service.slug}` },
    ]),
  ];

  return (
    <Layout seo={seo} jsonLd={jsonLd}>
      {/* Hero: same interactive 3D background as the home page, own centrepiece per service */}
      <section className="relative isolate overflow-hidden border-b border-line">
        <div className="absolute inset-0 -z-10">
          <HeroScene variant={scene ?? 'blob'} />
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
          <PageIntro
            crumbs={[{ href: '/services', label: 'Услуги' }]}
            current={service.preview_title}
            title={title}
            size="title"
            lead={introtext}
            glow={false}
          >
            {tech_list && (
              <ul className="flex flex-wrap gap-2 mb-10">
                {tech_list.map(item => (
                  <li key={item} className="rounded-full border border-line bg-surface/70 px-4 py-2 text-sm">
                    {item}
                  </li>
                ))}
              </ul>
            )}
            <Button type="link" href="/contacts">
              Обсудить задачу <FiArrowRight aria-hidden />
            </Button>
          </PageIntro>
        </div>
      </section>

      {tasks && (
        <div className="container-page">
          <Cards {...tasks} />
        </div>
      )}

      <div className={tasks ? 'section-gap border-t border-line' : ''}>
        {sections.map((section, s_index) => (
          <section
            key={s_index}
            className={section.color === 'dark' ? 'bg-surface border-b border-line' : 'border-b border-line'}
          >
            <div className="container-page py-16 md:py-28">
              <Reveal as="h2" className="t-section md:text-4xl max-w-3xl mb-12 md:mb-20">
                {section.title}
              </Reveal>
              {section.blocks.length > 0 && (
                <div className="divide-y divide-line">
                  {section.blocks.map((b, b_index) => (
                    <Reveal
                      key={b_index}
                      delay={b_index * 80}
                      className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-8 py-8 first:pt-0"
                    >
                      <h3 className="md:col-span-4 flex gap-4 text-lg md:text-xl font-semibold">
                        <span className="font-display text-muted text-sm pt-1.5">
                          {String(b_index + 1).padStart(2, '0')}
                        </span>
                        {b.title}
                      </h3>
                      <div className="md:col-span-8 content-blocks text-muted">
                        <MDXRemote {...b.mdxSource} components={mdxComponents} />
                      </div>
                    </Reveal>
                  ))}
                </div>
              )}
            </div>
          </section>
        ))}
      </div>

      <div className="container-page">
        {process && <Process {...process} />}
        {pricing && <Pricing {...pricing} />}
        <section className="section-gap">
          <SectionHeader
            title="Проекты по теме"
            aside={
              <Link href="/#works" className="transition-colors hover:text-fg">
                Все проекты <FiArrowRight aria-hidden className="inline -mt-0.5" />
              </Link>
            }
          />
          <WorkCard works={works} />
        </section>
        {faq && <Faq {...faq} />}
        <Footer />
      </div>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: getServicesList().map(s => ({ params: { slug: s.slug } })),
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
    (service.content ?? []).map(async section => ({
      title: section.title,
      color: section.color,
      blocks: await Promise.all(
        (section.blocks ?? []).map(async block => ({
          title: block.title,
          mdxSource: await serialize(block.content, {
            mdxOptions: { remarkPlugins: [remarkGfm] },
          }),
        })),
      ),
    })),
  );

  const { content: _content, ...serviceRest } = service;
  const allWorks = getWorks();
  const worksBySlug = new Map(allWorks.map(work => [work.slug, work]));

  return {
    props: {
      service: { ...serviceRest, sections },
      works: service.works
        ? service.works.map(workSlug => {
            const work = worksBySlug.get(workSlug);
            if (!work) {
              throw new ContentError(`services/${slug}.json`, `works: unknown work "${workSlug}"`);
            }

            return work;
          })
        : allWorks.slice(0, 3),
    },
  };
};
