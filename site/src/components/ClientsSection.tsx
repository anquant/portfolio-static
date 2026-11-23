import Image from 'next/image';
import Link from 'next/link';
import type { ClientsData } from '@/lib/content/schemas';
import Reveal from './Reveal';
import SectionHeader from './SectionHeader';

interface ClientsSectionProps {
  clients?: ClientsData[];
  title?: string;
}

/**
 * Static logo grid instead of an autoplaying carousel:
 * all clients are visible at once and nothing moves on its own.
 */
export default function ClientsSection({ clients, title = 'Клиенты' }: ClientsSectionProps) {
  if (!clients || clients.length === 0) return null;

  return (
    <section className="section-gap" aria-labelledby="clients-title">
      <SectionHeader id="clients-title" title={title} aside={`${clients.length} компаний`} />
      <Reveal>
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px overflow-hidden rounded-2xl border border-line bg-line">
          {clients.map(client => {
            const logo = (
              <Image
                src={client.logo.src}
                width={client.logo.width}
                height={client.logo.height}
                alt={client.title}
                title={client.title}
                className="logo-on-dark w-full h-auto group-hover:opacity-100"
              />
            );
            return (
              <li key={client.id} className="group bg-bg transition-colors hover:bg-surface">
                {client.link ? (
                  <Link
                    href={client.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Сайт ${client.title}`}
                    className="block"
                  >
                    {logo}
                  </Link>
                ) : (
                  logo
                )}
              </li>
            );
          })}
        </ul>
      </Reveal>
    </section>
  );
}
