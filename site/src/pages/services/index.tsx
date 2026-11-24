import { type GetStaticProps } from 'next';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Layout from '@/components/Layout';
import PageIntro from '@/components/PageIntro';
import ServiceCard from '@/components/ServiceCard';
import { getServicesPage, getServicesList } from '@/lib/content';
import type { ServicePreview, ServicesPageData } from '@/lib/content/schemas';
import { breadcrumbLd } from '@/lib/seo';

interface ServicesProps {
  services_page: ServicesPageData;
  services_list: ServicePreview[];
}

export default function Services({ services_page, services_list }: ServicesProps) {
  const { title, introtext, meta_title, meta_description } = services_page;
  const seo = { meta_title, meta_description };

  return (
    <Layout seo={seo} jsonLd={[breadcrumbLd([{ name: title, path: '/services' }])]}>
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
      services_list: getServicesList().map(
        ({ slug, preview_title, preview_description, tech_list }): ServicePreview => ({
          slug,
          preview_title,
          preview_description,
          ...(tech_list && { tech_list }),
        }),
      ),
    },
  };
};
