import { useEffect, useState } from 'react';

import Button from '@/components/Button';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Layout from '@/components/Layout';
import { localeFromPath, localePath, navigation, type Locale } from '@/lib/i18n';

const COPY: Record<Locale, { title: string; text: string; home: string }> = {
  ru: {
    title: 'Такой страницы не существует',
    text: 'Возможно, она переехала. Попробуйте один из разделов:',
    home: 'На главную',
  },
  en: {
    title: 'This page does not exist',
    text: 'It may have moved. Try one of these sections:',
    home: 'Home page',
  },
};

export default function Error404() {
  // One static 404.html serves both languages: pick the copy from the
  // requested URL once it is known in the browser
  const [locale, setLocale] = useState<Locale>('ru');
  useEffect(() => setLocale(localeFromPath(window.location.pathname)), []);
  const copy = COPY[locale];

  return (
    <Layout
      seo={{ meta_title: locale === 'en' ? 'Error 404' : 'Ошибка 404', meta_description: copy.title, noindex: true }}
    >
      <div className="container-page min-h-screen flex flex-col">
        <Header />
        <section className="flex-1 flex flex-col justify-center">
          <div className="reveal font-display text-[7rem] md:text-[12rem] font-bold leading-none text-surface-2 select-none">
            404
          </div>
          <h1 className="reveal t-section md:text-4xl -mt-4 md:-mt-8 [--d:150ms]">{copy.title}</h1>
          <p className="reveal mt-4 text-muted [--d:300ms]">{copy.text}</p>
          <div className="reveal mt-8 flex flex-wrap gap-2 [--d:450ms]">
            <Button type="link" href={localePath(locale, '/')}>
              {copy.home}
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
  );
}
