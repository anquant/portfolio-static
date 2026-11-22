import Layout from "@/components/Layout";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getServicesPage, getServicesList } from "@/lib/content";
import { GetStaticProps } from "next";
import { ServicesPageData, ServicesListData } from "@/lib/types/servicesType";
import ServiceCard from "@/components/ServiceCard";

interface ServicesProps {
  services_page: ServicesPageData;
  services_list: ServicesListData[];
}

export default function Services({ services_page, services_list }: ServicesProps) {
  const { title, introtext, meta_title, meta_description } = services_page;
  const seo = { meta_title, meta_description };

  return (
    <Layout seo={seo}>
      <div className="container-page">
        <Header />
        <section>
          <h1 className="font-display text-5xl lg:text-7xl font-bold tracking-tight">
            {title}
          </h1>
          {introtext && (
            <p className="mt-6 text-lg md:text-xl text-muted max-w-xl">{introtext}</p>
          )}
          <ServiceCard services={services_list} />
        </section>
        <Footer />
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      services_page: getServicesPage(),
      services_list: getServicesList(),
    },
  };
};
