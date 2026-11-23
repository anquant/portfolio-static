import ProjectMedia from './ProjectMedia';
import Scene3D from './Scene3D';
import Link from 'next/link';
import Reveal from './Reveal';
import { displayHost } from '@/lib/url';
import type { WorksData } from '@/lib/content/schemas';
import { FiArrowRight } from 'react-icons/fi';

type WorkCardProps = {
  works?: WorksData[];
};

export default function WorkCard({ works }: WorkCardProps) {
  if (!works || works.length === 0) {
    return <div className="text-muted mt-10">Здесь пока нет проектов…</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-16 md:gap-24">
      {works.map((work, index) => (
        <Reveal as="article" key={work.slug} id={`work-${index + 1}`} className="scroll-mt-24">
          <Link
            href={`/${work.slug}`}
            className="group grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-12 lg:items-center"
          >
            {work.scene ? (
              <Scene3D scene={work.scene} label={work.title} className="lg:col-span-7 lg:order-2" />
            ) : (
              <ProjectMedia
                src={work.illustration?.src ?? '/assets/images/default-image-portfolio.jpg'}
                width={work.illustration?.width ?? 1800}
                height={work.illustration?.height ?? 1200}
                alt=""
                color={work.color}
                mode="hover"
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="lg:col-span-7 lg:order-2"
              />
            )}
            <div className="lg:col-span-5 lg:order-1 flex flex-col">
              <div className="flex items-center gap-3 text-sm text-muted">
                <span className="font-display font-semibold text-fg">{String(index + 1).padStart(2, '0')}</span>
                <span className="h-px w-8 bg-line" />
                {work.link && <span>{displayHost(work.link)}</span>}
              </div>
              <h3 className="t-card-lg mt-5 transition-colors group-hover:text-accent">{work.title}</h3>
              <p className="text-base md:text-lg text-fg/85 leading-snug mt-4">{work.description}</p>
              <p className="text-sm md:text-base text-muted leading-snug mt-3">{work.infotext}</p>
              <span className="mt-7 inline-flex w-fit items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm transition-colors group-hover:border-accent group-hover:text-accent">
                Смотреть кейс
                <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
