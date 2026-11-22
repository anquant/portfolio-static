import Layout from "@/components/Layout";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import Button from "@/components/Button";
import PageIntro from "@/components/PageIntro";
import Reveal from "@/components/Reveal";
import SectionHeader from "@/components/SectionHeader";
import { getAbout } from "@/lib/content";
import { GetStaticProps } from "next";
import { AboutData } from "@/lib/types/aboutType";
import { FiArrowRight, FiArrowUpRight } from "react-icons/fi";

interface AboutProps {
  about: AboutData;
}

export default function About({ about }: AboutProps) {
  const {
    title_part1,
    title_part2,
    content,
    stats,
    skills,
    resume,
    meta_title,
    meta_description,
  } = about;
  const seo = { meta_title, meta_description };

  return (
    <Layout seo={seo}>
      <div className="container-page">
        <Header />
        <PageIntro
          title={
            <>
              {title_part1}
              {title_part2 && (
                <>
                  <br />
                  <span className="text-muted">{title_part2}</span>
                </>
              )}
            </>
          }
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
                <Reveal
                  key={s.label}
                  delay={i * 100}
                  className="bg-bg px-8 py-10 md:px-12 md:py-14"
                >
                  <dt className="sr-only">{s.label}</dt>
                  <dd>
                    <span className="block font-display text-6xl md:text-7xl font-bold tracking-tight">
                      {s.value}
                    </span>
                    <span aria-hidden className="mt-3 block text-muted">
                      {s.label}
                    </span>
                  </dd>
                </Reveal>
              ))}
            </dl>
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
                    {group.items.map((item) => (
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
