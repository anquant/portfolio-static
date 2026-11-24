import { type GetStaticPaths, type GetStaticProps } from 'next';
import { type MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import remarkGfm from 'remark-gfm';

import type { ContactItem } from '@/lib/contact';
import {
  ContentError,
  getAbout,
  getClients,
  getContacts,
  getHome,
  getServiceBySlug,
  getServicesList,
  getServicesPage,
  getWorkBySlug,
  getWorks,
} from '@/lib/content';
import type { ServicePreview } from '@/lib/content/schemas';
import type { Locale } from '@/lib/i18n';
import { encode, maskPhone, maskTelegram } from '@/lib/obfuscate';

/*
 * Build-time data for the pages that exist in both languages. Each factory
 * takes the locale, so /about and /en/about are the same view fed with
 * different content. Server-only: pages reference these only from
 * getStaticProps / getStaticPaths, which Next.js strips from the client.
 */

/** A service section with its blocks' Markdown compiled at build time */
export type SerializedSection = {
  title: string;
  color: 'light' | 'dark';
  blocks: { title: string; mdxSource: MDXRemoteSerializeResult }[];
};

export const homeProps =
  (locale: Locale): GetStaticProps =>
  async () => ({
    props: { home: getHome(locale), works: getWorks(locale), clients: getClients(locale) },
  });

export const aboutProps =
  (locale: Locale): GetStaticProps =>
  async () => ({ props: { about: getAbout(locale) } });

export const contactsProps =
  (locale: Locale): GetStaticProps =>
  async () => {
    const { title, text, meta_title, meta_description, email, phone, telegram } = getContacts(locale);
    // in display order; absent channels are left out
    const contacts: ContactItem[] = [
      ...(email ? [{ kind: 'email' as const, encoded: encode(email), masked: null }] : []),
      ...(phone ? [{ kind: 'phone' as const, encoded: encode(phone), masked: maskPhone(phone) }] : []),
      ...(telegram ? [{ kind: 'telegram' as const, encoded: encode(telegram), masked: maskTelegram(telegram) }] : []),
    ];

    return {
      props: { title, text: text ?? null, meta_title, meta_description: meta_description ?? null, contacts },
    };
  };

export const servicesProps =
  (locale: Locale): GetStaticProps =>
  async () => ({
    props: {
      services_page: getServicesPage(locale),
      services_list: getServicesList(locale).map(
        ({ slug, preview_title, preview_description, tech_list }): ServicePreview => ({
          slug,
          preview_title,
          preview_description,
          ...(tech_list && { tech_list }),
        }),
      ),
    },
  });

export const servicePaths =
  (locale: Locale): GetStaticPaths =>
  async () => ({
    paths: getServicesList(locale).map(s => ({ params: { slug: s.slug } })),
    fallback: false,
  });

export const serviceProps =
  (locale: Locale): GetStaticProps =>
  async ({ params }) => {
    const slug = params?.slug as string;
    const service = getServiceBySlug(slug, locale);
    if (!service) {
      return { notFound: true };
    }

    const sections: SerializedSection[] = await Promise.all(
      (service.content ?? []).map(async section => ({
        title: section.title,
        color: section.color,
        blocks: await Promise.all(
          (section.blocks ?? []).map(async block => ({
            title: block.title,
            mdxSource: await serialize(block.content, {
              mdxOptions: { remarkPlugins: [remarkGfm] },
            }),
          })),
        ),
      })),
    );

    const { content: _content, ...serviceRest } = service;
    const allWorks = getWorks(locale);
    const worksBySlug = new Map(allWorks.map(work => [work.slug, work]));

    return {
      props: {
        service: { ...serviceRest, sections },
        works: service.works
          ? service.works.map(workSlug => {
              const work = worksBySlug.get(workSlug);
              if (!work) {
                throw new ContentError(`services/${slug}.json`, `works: unknown work "${workSlug}"`);
              }

              return work;
            })
          : allWorks.slice(0, 3),
      },
    };
  };

export const workPaths =
  (locale: Locale): GetStaticPaths =>
  async () => ({
    paths: getWorks(locale).map(w => ({ params: { slug: w.slug } })),
    fallback: false,
  });

export const workProps =
  (locale: Locale): GetStaticProps =>
  async ({ params }) => {
    const slug = params?.slug as string;
    const work = getWorkBySlug(slug, locale);
    if (!work) {
      return { notFound: true };
    }

    const works = getWorks(locale);
    const i = works.findIndex(w => w.slug === slug);
    const n = works[(i + 1) % works.length];
    const next = n && n.slug !== slug ? { slug: n.slug, title: n.title } : null;

    return { props: { work, next } };
  };
