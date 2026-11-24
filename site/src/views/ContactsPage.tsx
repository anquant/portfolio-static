import Link from 'next/link';
import { useEffect, useState } from 'react';
import { RiEyeLine, RiEyeOffLine, RiFileCopyLine, RiCheckLine, RiCloseLine } from 'react-icons/ri';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Layout from '@/components/Layout';
import PageIntro from '@/components/PageIntro';
import Reveal from '@/components/Reveal';
import { decode } from '@/lib/obfuscate';
import { breadcrumbLd, personRef } from '@/lib/seo';
import { useLocale } from '@/lib/use-locale';

interface ContactsProps {
  title: string;
  text?: string;
  meta_title: string;
  meta_description?: string;
  emailEncoded: string;
  phoneEncoded: string;
  maskedPhone: string;
  telegramEncoded: string;
  maskedTelegram: string;
}

function IconButton({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid place-items-center size-9 rounded-full border border-line text-muted transition-colors hover:text-fg hover:bg-surface-2"
    >
      {children}
    </button>
  );
}

function CopyButton({ getValue }: { getValue: () => string }) {
  const { t } = useLocale();
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const handleCopy = async () => {
    const value = getValue();
    if (!value) {
      return;
    }
    try {
      // clipboard is unavailable without HTTPS or when permission is denied
      await navigator.clipboard.writeText(value);
      setState('copied');
    } catch {
      setState('failed');
    }
    setTimeout(() => setState('idle'), 1800);
  };

  return (
    <>
      <IconButton
        onClick={handleCopy}
        label={state === 'copied' ? t.contacts.copied : state === 'failed' ? t.contacts.copyFailed : t.contacts.copy}
      >
        {state === 'copied' ? (
          <RiCheckLine size={18} className="text-emerald-400" />
        ) : state === 'failed' ? (
          <RiCloseLine size={18} className="text-red-400" />
        ) : (
          <RiFileCopyLine size={18} />
        )}
      </IconButton>
      {/* announce the result to screen readers */}
      <span role="status" className="sr-only">
        {state === 'copied' ? t.contacts.copied : state === 'failed' ? t.contacts.copyFailed : ''}
      </span>
    </>
  );
}

export default function ContactsPage({
  title,
  text,
  meta_title,
  meta_description,
  emailEncoded,
  phoneEncoded,
  maskedPhone,
  telegramEncoded,
  maskedTelegram,
}: ContactsProps) {
  const seo = { meta_title, meta_description };
  const { locale, t, href } = useLocale();

  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [telegramRevealed, setTelegramRevealed] = useState(false);
  const [telegram, setTelegram] = useState('');

  // Decoded only on the client, after mount, so the prerendered static
  // HTML never contains the plain email/phone for simple scrapers to read.
  useEffect(() => {
    setEmail(decode(emailEncoded));
    setPhone(decode(phoneEncoded));
    setTelegram(decode(telegramEncoded));
  }, [emailEncoded, phoneEncoded, telegramEncoded]);

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
            {email && (
              <Reveal delay={350} className="rounded-2xl border border-line bg-surface p-6 md:p-8">
                <div className="eyebrow mb-3">E-mail</div>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={`mailto:${email}`}
                    className="text-xl md:text-2xl font-medium transition-colors hover:text-accent break-all"
                  >
                    {email}
                  </Link>
                  <CopyButton getValue={() => email} />
                </div>
              </Reveal>
            )}
            {maskedPhone && (
              <Reveal delay={450} className="rounded-2xl border border-line bg-surface p-6 md:p-8">
                <div className="eyebrow mb-3">{t.contacts.phone}</div>
                <div className="flex flex-wrap items-center gap-3">
                  {phoneRevealed && phone ? (
                    <Link
                      href={`tel:${phone.replace(/[^\d+]/g, '')}`}
                      className="text-xl md:text-2xl font-medium transition-colors hover:text-accent"
                    >
                      {phone}
                    </Link>
                  ) : (
                    <span className="text-xl md:text-2xl font-medium tabular-nums">{maskedPhone}</span>
                  )}
                  <IconButton
                    onClick={() => setPhoneRevealed(v => !v)}
                    label={phoneRevealed ? t.contacts.hidePhone : t.contacts.showPhone}
                  >
                    {phoneRevealed ? <RiEyeOffLine size={18} /> : <RiEyeLine size={18} />}
                  </IconButton>
                  <CopyButton getValue={() => phone} />
                </div>
              </Reveal>
            )}
            {maskedTelegram && (
              <Reveal delay={450} className="rounded-2xl border border-line bg-surface p-6 md:p-8">
                <div className="eyebrow mb-3">Telegram</div>
                <div className="flex flex-wrap items-center gap-3">
                  {telegramRevealed && telegram ? (
                    <a
                      href={`https://t.me/${telegram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xl md:text-2xl font-medium transition-colors hover:text-accent"
                    >
                      @{telegram}
                    </a>
                  ) : (
                    <span className="text-xl md:text-2xl font-medium">{maskedTelegram}</span>
                  )}
                  <IconButton
                    onClick={() => setTelegramRevealed(v => !v)}
                    label={telegramRevealed ? t.contacts.hideTelegram : t.contacts.showTelegram}
                  >
                    {telegramRevealed ? <RiEyeOffLine size={18} /> : <RiEyeLine size={18} />}
                  </IconButton>
                  <CopyButton getValue={() => (telegram ? `@${telegram}` : '')} />
                </div>
              </Reveal>
            )}
          </div>
        </section>
        <Footer cta={false} />
      </div>
    </Layout>
  );
}
