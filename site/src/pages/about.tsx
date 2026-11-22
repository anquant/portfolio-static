import Layout from "@/components/Layout";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import Button from "@/components/Button";
import PageIntro from "@/components/PageIntro";
import Reveal from "@/components/Reveal";
import { getAbout } from "@/lib/content";
import { GetStaticProps } from "next";
import { AboutData } from "@/lib/types/aboutType";

interface AboutProps {
  about: AboutData;
}

export default function About({ about }: AboutProps) {
  const {
    title_part1,
    title_part2,
    content,
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
        <section>
          <div className="mt-14 md:mt-20 grid grid-cols-1 lg:grid-cols-12 gap-12">
            <Reveal className="lg:col-span-7 text-lg md:text-xl leading-relaxed space-y-6 text-fg/90">
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </Reveal>
            <Reveal as="aside" delay={150} className="lg:col-span-5 space-y-4">
              {skills && (
                <div className="rounded-2xl border border-line bg-surface p-6 md:p-8">
                  <h2 className="eyebrow mb-5">Навыки</h2>
                  <div
                    className="content-blocks text-muted"
                    dangerouslySetInnerHTML={{ __html: skills }}
                  />
                </div>
              )}
              {resume && (
                <div className="flex flex-wrap gap-3">
                  <Button type="link" href={resume} external>
                    Открыть резюме (PDF)
                  </Button>
                  <Button type="link" href="/contacts" variant="secondary">
                    Контакты
                  </Button>
                </div>
              )}
            </Reveal>
          </div>
        </section>
        <Footer />
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return { props: { about: getAbout() } };
};
