import Layout from "@/components/Layout";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getServicesPage, getServicesList } from "@/lib/content";
import { type GetStaticProps } from "next";
import type { ServicesPageData, ServicesListData } from "@/lib/content/schemas";
import ServiceCard from "@/components/ServiceCard";
import PageIntro from "@/components/PageIntro";

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
      <div className="container-page">
        <Header />
        <PageIntro title={title} lead={introtext} />
        <ServiceCard services={services_list} />
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
