import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getContacts } from "@/lib/content";
import { GetStaticProps } from "next";
import Link from "next/link";
import { RiEyeLine, RiEyeOffLine, RiFileCopyLine, RiCheckLine } from "react-icons/ri";
import { Manrope } from "next/font/google";
import { encode, decode, maskPhone } from "@/helpers/obfuscate";

const manrope = Manrope({
  subsets: ["cyrillic"],
  weight: "500",
});

interface ContactsProps {
  title: string;
  text?: string;
  meta_title: string;
  meta_description?: string;
  emailEncoded: string;
  phoneEncoded: string;
  maskedPhone: string;
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
    <button
      type="button"
      onClick={handleCopy}
      className="text-[#909090] hover:text-[--text] duration-300"
      aria-label="Скопировать"
    >
      {copied ? <RiCheckLine size={18} /> : <RiFileCopyLine size={18} />}
    </button>
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
      <div className="relative flex flex-col justify-between min-h-screen mx-auto max-w-7xl px-6 xl:px-0">
        <section>
          <Header classes="mb-20 md:mb-40" />
          <div className="md:px-20">
            <h1
              className={`${manrope.className} text-5xl lg:text-7xl mb-10 md:mb-16`}
            >
              {title}
            </h1>
            <div className="flex flex-col md:flex-row gap-16 md:gap-8 min-h-80">
              <div className="basis-6/12">
                <div className="flex flex-col gap-10">
                  {email && (
                    <div className="space-y-1.5">
                      <div className="text-[#909090] lowercase">E-mail:</div>
                      <div className="flex items-center gap-2 w-fit">
                        <Link
                          href={`mailto:${email}`}
                          className="text-lg font-medium hover:text-[--link] duration-300"
                        >
                          {email}
                        </Link>
                        <CopyButton getValue={() => email} />
                      </div>
                    </div>
                  )}
                  {maskedPhone && (
                    <div className="space-y-1.5">
                      <div className="text-[#909090] lowercase">Телефон:</div>
                      <div className="flex items-center gap-2 w-fit">
                        {phoneRevealed && phone ? (
                          <Link
                            href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                            className="text-lg font-medium hover:text-[--link] duration-300"
                          >
                            {phone}
                          </Link>
                        ) : (
                          <span className="text-lg font-medium">
                            {maskedPhone}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => setPhoneRevealed((v) => !v)}
                          className="text-[#909090] hover:text-[--text] duration-300"
                          aria-label={
                            phoneRevealed ? "Скрыть номер" : "Показать номер"
                          }
                        >
                          {phoneRevealed ? (
                            <RiEyeOffLine size={20} />
                          ) : (
                            <RiEyeLine size={20} />
                          )}
                        </button>
                        <CopyButton getValue={() => phone} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {text && (
                <div className="basis-6/12 md:mt-24 lg:mt-32">
                  <p className="text-base text-[--gray-text] max-w-md">{text}</p>
                </div>
              )}
            </div>
          </div>
        </section>
        <Footer />
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
