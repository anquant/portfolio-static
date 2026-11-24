import { FiArrowRight, FiArrowUpRight } from 'react-icons/fi';

import Button from '@/components/Button';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Layout from '@/components/Layout';
import PageIntro from '@/components/PageIntro';
import Reveal from '@/components/Reveal';
import SectionHeader from '@/components/SectionHeader';
import { Cards } from '@/components/service/ServiceBlocks';
import type { AboutData } from '@/lib/content/schemas';
import { breadcrumbLd, personLd } from '@/lib/seo';
import { useLocale } from '@/lib/use-locale';

interface AboutProps {
  about: AboutData;
}

export default function AboutPage({ about }: AboutProps) {
  const { locale, t, href } = useLocale();
  const {
    title_part1,
    title_part2,
    lead,
    content,
    stats,
    principles,
    experience,
    skills,
    resume,
    meta_title,
    meta_description,
  } = about;
  // one reveal per paragraph, so the story reads in as it appears
  const matched = Array.from(content.matchAll(/<p>([\s\S]*?)<\/p>/g), m => m[1] ?? '');
  const paragraphs = matched.length > 0 ? matched : [content];
  const seo = { meta_title, meta_description, type: 'profile' as const };
  const jsonLd = [
    {
      '@type': 'ProfilePage',
      mainEntity: {
        ...personLd(
          locale,
          (skills ?? []).flatMap(group => group.items),
        ),
        ...(locale === 'ru'
          ? {
              alumniOf: {
                '@type': 'CollegeOrUniversity',
                name: 'Санкт-Петербургский государственный университет аэрокосмического приборостроения (ГУАП)',
              },
            }
          : {
              alumniOf: {
                '@type': 'CollegeOrUniversity',
                name: 'State University of Aerospace Instrumentation (SUAI)',
              },
            }),
      },
    },
    breadcrumbLd([{ name: meta_title, path: href('/about') }], locale),
  ];

  return (
    <Layout seo={seo} jsonLd={jsonLd}>
      <div className="container-page">
        <Header />
        <PageIntro
          title={
            <>
              {title_part1}{' '}
              {title_part2 && (
                <>
                  <br />
                  <span className="text-muted">{title_part2}</span>
                </>
              )}
            </>
          }
          lead={
            // the lead links its key words to the matching services
            lead && (
              <span
                className="[&_a]:text-accent [&_a]:underline [&_a]:decoration-accent/40 [&_a]:decoration-1 [&_a]:underline-offset-4 [&_a]:transition-colors [&_a:hover]:text-fg [&_a:hover]:decoration-fg"
                dangerouslySetInnerHTML={{ __html: lead }}
              />
            )
          }
        />

        {/* Story on the left, the numbers pinned beside it on desktop.
            On the first screen everything continues the PageIntro sequence (lead lands at 300ms). */}
        <section className="mt-16 md:mt-24 grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-8">
            <div className="story">
              {paragraphs.map((html, i) => (
                <Reveal key={i} as="p" delay={i * 80} introDelay={450}>
                  <span dangerouslySetInnerHTML={{ __html: html }} />
                </Reveal>
              ))}
            </div>
            <Reveal delay={paragraphs.length * 80} introDelay={450} className="mt-12 flex flex-wrap gap-3">
              {resume && (
                <Button type="link" href={resume} external>
                  {t.about.resume} <FiArrowUpRight aria-hidden />
                </Button>
              )}
              <Button type="link" href={href('/contacts')} variant="secondary">
                {t.nav.contacts} <FiArrowRight aria-hidden />
              </Button>
            </Reveal>
          </div>

          {stats && stats.length > 0 && (
            <aside aria-label={t.about.inNumbers} className="lg:col-span-3 lg:col-start-10">
              {/* The card reveals as a whole (no grey gaps), then its numbers one by one */}
              <Reveal
                as="dl"
                introDelay={600}
                className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line lg:sticky lg:top-8 lg:grid-cols-1"
              >
                {stats.map((s, i) => (
                  <div key={s.label} className="bg-bg px-6 py-8 md:px-8 md:py-10">
                    <dt className="sr-only">{s.label}</dt>
                    <dd>
                      <Reveal as="span" delay={150 + i * 120} introDelay={600} className="block">
                        <span className="block font-display text-5xl md:text-6xl font-bold tracking-tight">
                          {s.value}
                        </span>
                        <span aria-hidden className="mt-3 block text-muted">
                          {s.label}
                        </span>
                      </Reveal>
                    </dd>
                  </div>
                ))}
              </Reveal>
            </aside>
          )}
        </section>

        {principles && <Cards {...principles} />}

        {/* Experience: newest first, period / role / what it taught */}
        {experience && (
          <section className="section-gap" aria-labelledby="experience-title">
            <SectionHeader id="experience-title" title={experience.title} />
            <ol>
              {experience.items.map((item, i) => (
                <Reveal
                  as="li"
                  key={i}
                  delay={i * 70}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-8 border-t border-line py-7 first:border-t-0 first:pt-0"
                >
                  <div className="md:col-span-3 text-sm md:text-base text-muted tabular-nums">{item.period}</div>
                  <div className="md:col-span-4">
                    <h3 className="font-semibold text-lg md:text-xl">{item.role}</h3>
                    <div className="mt-1 text-muted">{item.place}</div>
                  </div>
                  {item.text && <p className="md:col-span-5 text-muted leading-relaxed">{item.text}</p>}
                </Reveal>
              ))}
            </ol>
          </section>
        )}

        {/* Skills: scannable tags, grouped */}
        {skills && skills.length > 0 && (
          <section className="section-gap" aria-labelledby="skills-title">
            <SectionHeader id="skills-title" title={t.about.skills} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
              {skills.map((group, i) => (
                <Reveal key={group.title} delay={i * 100}>
                  <h3 className="eyebrow mb-5">{group.title}</h3>
                  <ul className="flex flex-wrap gap-2">
                    {group.items.map(item => (
                      <li
                        key={item}
                        className="rounded-full border border-line bg-surface px-4 py-2 text-sm md:text-base"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        <Footer />
      </div>
    </Layout>
  );
}
