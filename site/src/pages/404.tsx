import { useEffect, useState } from 'react';

import Button from '@/components/Button';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Layout from '@/components/Layout';
import { DICTIONARY, localeFromPath, localePath, navigation, type Locale } from '@/lib/i18n';
import { LocaleProvider } from '@/lib/use-locale';

export default function Error404() {
  // One static 404.html serves both languages: pick the language from the
  // requested URL once it is known in the browser (Russian until then)
  const [locale, setLocale] = useState<Locale>('ru');
  useEffect(() => setLocale(localeFromPath(window.location.pathname)), []);
  const t = DICTIONARY[locale].notFound;

  return (
    <LocaleProvider value={locale}>
      <Layout seo={{ meta_title: t.metaTitle, meta_description: t.title, noindex: true }}>
        <div className="container-page min-h-screen flex flex-col">
          <Header />
          <section className="flex-1 flex flex-col justify-center">
            <div className="reveal font-display text-[7rem] md:text-[12rem] font-bold leading-none text-surface-2 select-none">
              404
            </div>
            <h1 className="reveal t-section md:text-4xl -mt-4 md:-mt-8 [--d:150ms]">{t.title}</h1>
            <p className="reveal mt-4 text-muted [--d:300ms]">{t.text}</p>
            <div className="reveal mt-8 flex flex-wrap gap-2 [--d:450ms]">
              <Button type="link" href={localePath(locale, '/')}>
                {t.home}
              </Button>
              {navigation(locale)
                .slice(1)
                .map(item => (
                  <Button key={item.slug} type="link" href={item.slug} variant="secondary">
                    {item.title}
                  </Button>
                ))}
            </div>
          </section>
          <Footer cta={false} />
        </div>
      </Layout>
    </LocaleProvider>
  );
}
