"use client";

import Image from "next/image";
import Link from "next/link";
import { Manrope } from "next/font/google";
import { WorksData } from "@/lib/types/worksType";
import { MdOutlineArrowOutward } from "react-icons/md";

const manrope = Manrope({ subsets: ["cyrillic"] });

type WorkCardProps = {
  works?: WorksData[];
};

export default function WorkCard({ works }: WorkCardProps) {
  return works && works.length > 0 ? (
    <div className="[&>*:not(:first-child)]:pt-28">
      {works.map((work, index) => (
        <article key={index} id={`work-${index + 1}`}>
          <div className="relative flex flex-col lg:flex-row md:justify-between gap-8 md:gap-0 group">
            <header className="order-2 md:order-1 basis-5/12 flex flex-col justify-between">
              <div className="mb-8 md:mb-12">
                <h3
                  className={`${manrope.className} text-3xl md:text-4xl font-bold`}
                >
                  {work.title}
                </h3>
                <div className="text-base md:text-lg text-[--gray-text] !leading-tight mt-6">
                  {work.description}
                </div>
                <div className="text-base md:text-lg text-[--gray-text] !leading-tight mt-3.5">
                  {work.infotext}
                </div>
              </div>
              <div className="w-fit min-w-[40px] bg-[--background] text-base md:text-lg font-semibold rounded-full p-1">
                {String(index + 1).padStart(2, "0")}.
              </div>
            </header>
            <picture className="relative order-1 md:order-2 basis-6/12">
              {work.illustration ? (
                <Image
                  src={work.illustration.src}
                  width={work.illustration.width}
                  height={work.illustration.height}
                  alt={work.title}
                  className="bg-[--background] w-full"
                />
              ) : (
                <Image
                  src="/assets/images/default-image-portfolio.jpg"
                  width="1800"
                  height="1200"
                  alt="Изображение отсутствует"
                  className="bg-[--background] w-full"
                />
              )}
              <div className="bg-white text-2xl opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100 duration-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full p-5 z-[2]">
                <MdOutlineArrowOutward />
              </div>
              <div className="bg-[--text] opacity-0 group-hover:opacity-25 duration-300 absolute inset-0 w-full h-full z-[1]" />
            </picture>
            <Link
              href={`/${work.slug}`}
              className="absolute top-0 left-0 w-full h-full z-[3]"
            ></Link>
          </div>
          <div
            className={`${index !== works.length - 1 ? "md:border-b" : null} border-[--text] opacity-25 md:pb-28`}
          />
        </article>
      ))}
    </div>
  ) : (
    <div className="text-[--gray-text] mt-10">Здесь пока нет проектов ...</div>
  );
}
