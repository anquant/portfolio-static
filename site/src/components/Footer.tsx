import Link from 'next/link';
import { FiArrowRight, FiArrowUp, FiArrowUpRight } from 'react-icons/fi';

import { navigation } from '@/lib/i18n';
import { BEHANCE_URL } from '@/lib/site';
import { useLocale } from '@/lib/use-locale';

import Button from './Button';
import Reveal from './Reveal';

type FooterProps = {
  /** Hide the "discuss a project" block (e.g. on the contacts page itself) */
  cta?: boolean;
};

export default function Footer({ cta = true }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const { locale, t, href } = useLocale();

  return (
    <footer className="mt-32 md:mt-44">
      {cta && (
        <Reveal className="relative overflow-hidden rounded-3xl border border-line bg-surface px-6 py-12 md:px-14 md:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-accent/20 blur-3xl"
          />
          <div className="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="eyebrow mb-4">{t.footer.eyebrow}</div>
              <h2 className="t-title max-w-2xl">{t.footer.title}</h2>
              <p className="mt-4 max-w-lg text-muted">{t.footer.text}</p>
            </div>
            <Button type="link" href={href('/contacts')}>
              {t.footer.button} <FiArrowRight aria-hidden />
            </Button>
          </div>
        </Reveal>
      )}

      <div className="flex flex-col gap-8 border-t border-line mt-16 py-10 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-muted">
          © {currentYear} {t.authorName}
        </div>
        <nav aria-label={t.footerMenu} className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
          {navigation(locale).map(item => (
            <Link key={item.slug} href={item.slug} className="text-muted transition-colors hover:text-fg">
              {item.title}
            </Link>
          ))}
          <Link href={href('/contacts')} className="text-muted transition-colors hover:text-fg">
            {t.nav.contacts}
          </Link>
          <Link
            href={BEHANCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted transition-colors hover:text-fg"
          >
            Behance <FiArrowUpRight aria-hidden className="inline -mt-0.5" />
          </Link>
        </nav>
        <a href="#beginning" className="text-sm text-muted transition-colors hover:text-fg">
          {t.footer.toTop} <FiArrowUp aria-hidden className="inline -mt-0.5" />
        </a>
      </div>
    </footer>
  );
}
