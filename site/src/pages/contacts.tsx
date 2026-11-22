import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import PageIntro from "@/components/PageIntro";
import Reveal from "@/components/Reveal";
import { getContacts } from "@/lib/content";
import { GetStaticProps } from "next";
import Link from "next/link";
import {
  RiEyeLine,
  RiEyeOffLine,
  RiFileCopyLine,
  RiCheckLine,
} from "react-icons/ri";
import { encode, decode, maskPhone } from "@/helpers/obfuscate";

interface ContactsProps {
  title: string;
  text?: string;
  meta_title: string;
  meta_description?: string;
  emailEncoded: string;
  phoneEncoded: string;
  maskedPhone: string;
}

function IconButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
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
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const value = getValue();
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <IconButton
      onClick={handleCopy}
      label={copied ? "Скопировано" : "Скопировать"}
    >
      {copied ? (
        <RiCheckLine size={18} className="text-emerald-400" />
      ) : (
        <RiFileCopyLine size={18} />
      )}
    </IconButton>
  );
}

export default function Contacts({
  title,
  text,
  meta_title,
  meta_description,
  emailEncoded,
  phoneEncoded,
  maskedPhone,
}: ContactsProps) {
  const seo = { meta_title, meta_description };

  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Decoded only on the client, after mount, so the prerendered static
  // HTML never contains the plain email/phone for simple scrapers to read.
  useEffect(() => {
    setEmail(decode(emailEncoded));
    setPhone(decode(phoneEncoded));
  }, [emailEncoded, phoneEncoded]);

  return (
    <Layout seo={seo}>
      <div className="container-page">
        <Header />
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <PageIntro title={title} lead={text} className="lg:col-span-6" />
          <div className="lg:col-span-6 space-y-3 min-h-64 lg:pt-4">
            {email && (
              <Reveal
                delay={350}
                className="rounded-2xl border border-line bg-surface p-6 md:p-8"
              >
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
              <Reveal
                delay={450}
                className="rounded-2xl border border-line bg-surface p-6 md:p-8"
              >
                <div className="eyebrow mb-3">Телефон</div>
                <div className="flex flex-wrap items-center gap-3">
                  {phoneRevealed && phone ? (
                    <Link
                      href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                      className="text-xl md:text-2xl font-medium transition-colors hover:text-accent"
                    >
                      {phone}
                    </Link>
                  ) : (
                    <span className="text-xl md:text-2xl font-medium tabular-nums">
                      {maskedPhone}
                    </span>
                  )}
                  <IconButton
                    onClick={() => setPhoneRevealed((v) => !v)}
                    label={phoneRevealed ? "Скрыть номер" : "Показать номер"}
                  >
                    {phoneRevealed ? (
                      <RiEyeOffLine size={18} />
                    ) : (
                      <RiEyeLine size={18} />
                    )}
                  </IconButton>
                  <CopyButton getValue={() => phone} />
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

export const getStaticProps: GetStaticProps = async () => {
  const contacts = getContacts();

  return {
    props: {
      title: contacts.title,
      text: contacts.text ?? null,
      meta_title: contacts.meta_title,
      meta_description: contacts.meta_description ?? null,
      emailEncoded: encode(contacts.email ?? ""),
      phoneEncoded: encode(contacts.phone ?? ""),
      maskedPhone: contacts.phone ? maskPhone(contacts.phone) : "",
    },
  };
};
