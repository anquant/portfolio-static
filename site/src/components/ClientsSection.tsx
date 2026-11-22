import Image from "next/image";
import Link from "next/link";
import { ClientsData } from "@/lib/types/clientsType";

interface ClientsSectionProps {
  clients?: ClientsData[];
  title?: string;
}

/**
 * Static logo grid instead of an autoplaying carousel:
 * all clients are visible at once, nothing moves on its own,
 * and no swiper JS is shipped.
 */
export default function ClientsSection({
  clients,
  title = "Клиенты",
}: ClientsSectionProps) {
  if (!clients || clients.length === 0) return null;

  return (
    <section className="mt-32 md:mt-44" aria-labelledby="clients-title">
      <div className="flex items-end justify-between gap-6 border-b border-line pb-4 mb-8">
        <h2 id="clients-title" className="font-display text-2xl md:text-3xl font-semibold">
          {title}
        </h2>
        <span className="text-sm text-muted">{clients.length} компаний</span>
      </div>
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px overflow-hidden rounded-2xl border border-line bg-line">
        {clients.map((client) => {
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
    </section>
  );
}
