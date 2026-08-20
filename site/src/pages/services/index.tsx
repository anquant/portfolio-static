import Layout from "@/components/Layout";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getServicesPage, getServicesList } from "@/lib/content";
import { GetStaticProps } from "next";
import { ServicesPageData, ServicesListData } from "@/lib/types/servicesType";
import ServiceCard from "@/components/ServiceCard";
import { Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["cyrillic"],
  weight: "500",
});

interface ServicesProps {
  services_page: ServicesPageData;
  services_list: ServicesListData[];
}

export default function Services({
  services_page,
  services_list,
}: ServicesProps) {
  const { title, introtext, meta_title, meta_description } = services_page;
  const seo = { meta_title, meta_description };

  return (
    <Layout seo={seo}>
      <div className="relative flex flex-col justify-between min-h-screen mx-auto max-w-7xl px-6 xl:px-0">
        <section>
          <Header classes="mb-20 md:mb-40" />
          <div className="md:px-20">
            <h1
              className={`${manrope.className} text-5xl lg:text-7xl mb-10 md:mb-16`}
            >
              {title}
            </h1>
            {introtext && (
              <p className="text-lg md:text-xl font-light max-w-lg">
                {introtext}
              </p>
            )}
            <ServiceCard services={services_list} />
          </div>
        </section>
        <Footer />
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const services_page = getServicesPage();
  const services_list = getServicesList();

  return {
    props: {
      services_page,
      services_list,
    },
  };
};
