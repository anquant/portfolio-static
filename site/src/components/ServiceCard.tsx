import Link from 'next/link';
import type { ServicesListData } from '@/lib/content/schemas';
import { FiArrowRight } from 'react-icons/fi';
import Reveal from './Reveal';

type ServiceCardProps = {
  services?: ServicesListData[];
};

export default function ServiceCard({ services }: ServiceCardProps) {
  if (!services || services.length === 0) {
    return <div className="text-muted mt-10">Здесь пока нет услуг…</div>;
  }

  return (
    <div className="mt-12 md:mt-16 grid grid-cols-1 gap-3">
      {services.map((service, index) => (
        <Reveal key={service.slug} delay={index * 90}>
          <Link
            href={`/services/${service.slug}`}
            className="group relative grid grid-cols-[auto_1fr_auto] items-start md:items-center gap-5 md:gap-10 rounded-2xl border border-line bg-surface p-6 md:p-10 transition-colors hover:bg-surface-2 hover:border-fg/20"
          >
            <span className="font-display text-sm md:text-base font-semibold text-muted pt-1.5 md:pt-0">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div>
              <h2 className="t-card-lg transition-colors group-hover:text-accent">{service.preview_title}</h2>
              <p className="mt-2 text-base md:text-lg text-muted max-w-xl">{service.preview_description}</p>
              {service.tech_list && (
                <ul className="mt-5 flex flex-wrap gap-1.5">
                  {service.tech_list.map(t => (
                    <li key={t} className="rounded-full border border-line px-3 py-1 text-xs md:text-sm text-muted">
                      {t}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <span
              aria-hidden
              className="grid place-items-center size-11 md:size-14 rounded-full border border-line text-xl transition-colors group-hover:bg-fg group-hover:text-bg group-hover:border-fg"
            >
              <FiArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
