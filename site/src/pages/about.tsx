import { type GetStaticProps } from 'next';
import { FiArrowRight, FiArrowUpRight } from 'react-icons/fi';

import Button from '@/components/Button';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Layout from '@/components/Layout';
import PageIntro from '@/components/PageIntro';
import Reveal from '@/components/Reveal';
import SectionHeader from '@/components/SectionHeader';
import { Cards } from '@/components/service/ServiceBlocks';
import { getAbout } from '@/lib/content';
import type { AboutData } from '@/lib/content/schemas';
import { breadcrumbLd, personLd } from '@/lib/seo';

interface AboutProps {
  about: AboutData;
}

export default function About({ about }: AboutProps) {
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
  const seo = { meta_title, meta_description, type: 'profile' as const };
  const jsonLd = [
    {
      '@type': 'ProfilePage',
      mainEntity: {
        ...personLd((skills ?? []).flatMap(group => group.items)),
        alumniOf: {
          '@type': 'CollegeOrUniversity',
          name: 'Санкт-Петербургский государственный университет аэрокосмического приборостроения (ГУАП)',
        },
        homeLocation: { '@type': 'City', name: 'Санкт-Петербург' },
      },
    },
    breadcrumbLd([{ name: meta_title, path: '/about' }]),
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
          lead={lead}
        />

        {/* Story: one comfortable reading column, first paragraph as the lead */}
        <section className="mt-16 md:mt-24">
          <Reveal className="story">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </Reveal>
          <Reveal delay={100} className="mt-12 flex flex-wrap gap-3">
            {resume && (
              <Button type="link" href={resume} external>
                Резюме (PDF) <FiArrowUpRight aria-hidden />
              </Button>
            )}
            <Button type="link" href="/contacts" variant="secondary">
              Контакты <FiArrowRight aria-hidden />
            </Button>
          </Reveal>
        </section>

        {/* Numbers: a pause between the story and the skills */}
        {stats && stats.length > 0 && (
          <section aria-label="В цифрах" className="section-gap">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line">
              {stats.map((s, i) => (
                <Reveal key={s.label} delay={i * 100} className="bg-bg px-8 py-10 md:px-12 md:py-14">
                  <dt className="sr-only">{s.label}</dt>
                  <dd>
                    <span className="block font-display text-6xl md:text-7xl font-bold tracking-tight">{s.value}</span>
                    <span aria-hidden className="mt-3 block text-muted">
                      {s.label}
                    </span>
                  </dd>
                </Reveal>
              ))}
            </dl>
          </section>
        )}

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
            <SectionHeader id="skills-title" title="Навыки" />
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

export const getStaticProps: GetStaticProps = async () => {
  return { props: { about: getAbout() } };
};
