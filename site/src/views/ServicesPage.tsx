import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Layout from '@/components/Layout';
import PageIntro from '@/components/PageIntro';
import ServiceCard from '@/components/ServiceCard';
import type { ServicePreview, ServicesPageData } from '@/lib/content/schemas';
import { breadcrumbLd } from '@/lib/seo';
import { useLocale } from '@/lib/use-locale';

interface ServicesProps {
  services_page: ServicesPageData;
  services_list: ServicePreview[];
}

export default function ServicesPage({ services_page, services_list }: ServicesProps) {
  const { title, introtext, meta_title, meta_description } = services_page;
  const seo = { meta_title, meta_description };
  const { locale, href } = useLocale();

  return (
    <Layout seo={seo} jsonLd={[breadcrumbLd([{ name: title, path: href('/services') }], locale)]}>
      <div className="container-page">
        <Header />
        <PageIntro title={title} lead={introtext} />
        <ServiceCard services={services_list} />
        <Footer />
      </div>
    </Layout>
  );
}
