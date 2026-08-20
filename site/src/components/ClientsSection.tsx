import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/grid";
import { Navigation, Autoplay, Grid } from "swiper/modules";
import { ClientsData } from "@/lib/types/clientsType";
import { Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["cyrillic"],
});

interface ClientsSectionProps {
  clients?: ClientsData[];
  title?: string;
}

export default function ClientsSection({
  clients,
  title = "Клиенты",
}: ClientsSectionProps) {
  if (!clients || clients.length === 0) {
    return null;
  }

  return (
    <div className="mt-40">
      <div className="relative">
        <h2
          className={`${manrope.className} text-2xl md:text-3xl !leading-[0]`}
        >
          {title}
        </h2>
      </div>
      <div className="mt-14">
        <Swiper
          breakpoints={{
            320: {
              slidesPerView: 2,
              grid: {
                rows: 2,
                fill: "row",
              },
            },
            640: {
              slidesPerView: 3,
              grid: {
                rows: 2,
                fill: "row",
              },
            },
            768: {
              slidesPerView: 4,
              grid: {
                rows: 2,
                fill: "row",
              },
            },
            1024: {
              slidesPerView: 5,
              grid: {
                rows: 2,
                fill: "row",
              },
            },
          }}
          spaceBetween={6}
          navigation={{
            prevEl: ".swiper-prev",
            nextEl: ".swiper-next",
          }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: true,
          }}
          modules={[Navigation, Autoplay, Grid]}
        >
          {clients.map((client) => (
            <SwiperSlide key={client.id}>
              <div className="flex items-center justify-center border border-[#e5e7eb] group hover:border-transparent hover:bg-[--background] duration-300 relative">
                <Image
                  src={client.logo.src}
                  width={client.logo.width}
                  height={client.logo.height}
                  alt={client.title}
                  title={client.title}
                  className="w-full h-auto"
                />
                {client.link && (
                  <Link
                    href={client.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-0 left-0 w-full h-full z-[2]"
                    aria-label={`Перейти на сайт ${client.title}`}
                  ></Link>
                )}
              </div>
            </SwiperSlide>
          ))}
          <div className="flex justify-center gap-3 mt-3">
            <div className="swiper-prev text-xl hover:text-white border border-[#303030] rounded-full hover:bg-[#303030] duration-300 cursor-pointer p-1.5">
              <IoIosArrowBack />
            </div>
            <div className="swiper-next text-xl hover:text-white border border-[#303030] rounded-full hover:bg-[#303030] duration-300 cursor-pointer p-1.5">
              <IoIosArrowForward />
            </div>
          </div>
        </Swiper>
      </div>
    </div>
  );
}
