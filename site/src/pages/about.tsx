import Layout from "@/components/Layout";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getAbout, getContacts } from "@/lib/content";
import { GetStaticProps } from "next";
import { AboutData } from "@/lib/types/aboutType";
import { ContactsData } from "@/lib/types/contactsType";
import Link from "next/link";
import { Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["cyrillic"],
});

interface AboutProps {
  about: AboutData;
  contacts: ContactsData;
}

export default function About({ about, contacts }: AboutProps) {
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
      <div className="relative flex flex-col justify-between min-h-screen mx-auto max-w-7xl px-6 xl:px-0">
        <section>
          <Header classes="mb-20 md:mb-40" />
          <div className="md:px-20">
            <h1
              className={`${manrope.className} text-4xl md:text-6xl lg:text-7xl font-bold md:font-medium mb-10 md:mb-16`}
            >
              {title_part1}
              {title_part2 && (
                <>
                  <br />
                  {title_part2}
                </>
              )}
            </h1>
            <div
              className="text-lg md:text-xl font-light space-y-7 max-w-4xl"
              dangerouslySetInnerHTML={{ __html: content }}
            />
            <div className="text-lg space-y-8 md:space-y-11 mt-20 md:mt-32">
              {skills && (
                <div className="flex gap-8">
                  <div className="w-20 md:w-28 font-bold">Навыки</div>
                  <div
                    className="content-blocks flex-1 max-w-xl font-light space-y-4"
                    dangerouslySetInnerHTML={{ __html: skills }}
                  />
                </div>
              )}
              {resume && (
                <div className="flex gap-8">
                  <div className="w-20 md:w-28 font-bold">Резюме</div>
                  <div className="flex-1">
                    <Link
                      href={resume}
                      className="hover:text-[--link] duration-300"
                      target="__blank"
                    >
                      Открыть резюме
                    </Link>
                  </div>
                </div>
              )}
              {contacts.email && (
                <div className="flex gap-8">
                  <div className="w-20 md:w-28 font-bold">E-mail</div>
                  <div className="flex-1">
                    <Link
                      href={`mailto:${contacts.email}`}
                      className="hover:text-[--link] duration-300"
                    >
                      {contacts.email}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
        <Footer />
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const about = getAbout();
  const contacts = getContacts();

  return {
    props: {
      about,
      contacts,
    },
  };
};
