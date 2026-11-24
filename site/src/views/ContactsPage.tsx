import ContactCard from '@/components/ContactCard';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Layout from '@/components/Layout';
import PageIntro from '@/components/PageIntro';
import type { ContactItem } from '@/lib/contact';
import { breadcrumbLd, personRef } from '@/lib/seo';
import { useLocale } from '@/lib/use-locale';

interface ContactsProps {
  title: string;
  text?: string;
  meta_title: string;
  meta_description?: string;
  /** Encoded at build time, decoded in the browser (see ContactCard) */
  contacts: ContactItem[];
}

export default function ContactsPage({ title, text, meta_title, meta_description, contacts }: ContactsProps) {
  const seo = { meta_title, meta_description };
  const { locale, href } = useLocale();

  return (
    <Layout
      seo={seo}
      jsonLd={[
        { '@type': 'ContactPage', about: personRef },
        breadcrumbLd([{ name: meta_title, path: href('/contacts') }], locale),
      ]}
    >
      {/* short page: keep the footer on the bottom edge, like the 404 page */}
      <div className="container-page min-h-screen flex flex-col">
        <Header />
        <section className="flex-1 grid content-start grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <PageIntro title={title} lead={text} className="lg:col-span-6" />
          <div className="lg:col-span-6 space-y-3 min-h-64 lg:pt-4">
            {contacts.map((item, i) => (
              <ContactCard key={item.kind} item={item} delay={350 + i * 100} />
            ))}
          </div>
        </section>
        <Footer cta={false} />
      </div>
    </Layout>
  );
}
