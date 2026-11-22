import Layout from "@/components/Layout";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import Button from "@/components/Button";
import { getAbout } from "@/lib/content";
import { GetStaticProps } from "next";
import { AboutData } from "@/lib/types/aboutType";

interface AboutProps {
  about: AboutData;
}

export default function About({ about }: AboutProps) {
  const { title_part1, title_part2, content, skills, resume, meta_title, meta_description } =
    about;
  const seo = { meta_title, meta_description };

  return (
    <Layout seo={seo}>
      <div className="container-page">
        <Header />
        <section>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-5xl">
            {title_part1}
            {title_part2 && (
              <>
                <br />
                <span className="text-muted">{title_part2}</span>
              </>
            )}
          </h1>
          <div className="mt-14 md:mt-20 grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div
              className="lg:col-span-7 text-lg md:text-xl leading-relaxed space-y-6 text-fg/90"
              dangerouslySetInnerHTML={{ __html: content }}
            />
            <aside className="lg:col-span-5 space-y-4">
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
            </aside>
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
