"use client";

import Link from "next/link";
import Image from "next/image";
import { ServicesListData } from "@/lib/types/servicesType";
import { useSafari } from "@/hooks/useSafari";

type ServiceCardProps = {
  services?: ServicesListData[];
};

export default function ServiceCard({ services }: ServiceCardProps) {
  // Safari detection
  const isSafari = useSafari();

  return services && services.length > 0 ? (
    <div className="space-y-6 md:space-y-3 mt-10">
      {services.map((service, index) => (
        <article
          key={index}
          className="relative overflow-hidden flex flex-col md:flex-row gap-6 md:gap-12 bg-white/80 md:bg-white/35 md:hover:bg-white/90 duration-300"
        >
          <header className="space-y-3.5 md:space-y-2.5 p-8 md:p-10 z-[2]">
            <h2 className="text-2xl lg:text-3xl font-medium md:font-normal">
              {service.preview_title}
            </h2>
            <p className="text-base md:text-lg text-[--gray-text] duration-300 max-w-xl">
              {service.preview_description}
            </p>
          </header>
          {service.bg_video?.src && (
            <picture className="pointer-events-none z-0">
              {!isSafari && (
                <video
                  playsInline
                  muted
                  autoPlay
                  loop
                  {...(service.bg_video_poster && {
                    poster: service.bg_video_poster.src,
                  })}
                  className="hidden lg:block absolute top-0 right-0 h-full object-cover"
                >
                  <source src={service.bg_video.src} type={service.bg_video.type} />
                </video>
              )}
              {isSafari && service.bg_video_poster && (
                <Image
                  src={service.bg_video_poster.src}
                  alt={service.title}
                  width={service.bg_video_poster.width}
                  height={service.bg_video_poster.height}
                  className="hidden lg:block absolute top-0 right-0 h-full object-cover"
                />
              )}
            </picture>
          )}
          <Link
            href={`/services/${service.slug}`}
            className="absolute top-0 left-0 w-full h-full z-[3]"
          ></Link>
        </article>
      ))}
    </div>
  ) : (
    <div className="text-[--gray-text] mt-10">Здесь пока нет услуг ...</div>
  );
}
