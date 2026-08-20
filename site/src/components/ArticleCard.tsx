"use client";

import Image from "next/image";
import Link from "next/link";
import { ArticleCardData } from "@/lib/types/blogType";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { MdOutlineArrowOutward } from "react-icons/md";

type ArticleCardProps = {
  articles?: ArticleCardData[];
};

export default function ArticleCard({ articles }: ArticleCardProps) {
  return articles && articles.length > 0 ? (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-14 md:gap-6 mt-10 md:mt-14">
      {articles.map((article, idx) => (
        <article key={idx} className="relative group">
          <picture
            className="relative flex items-center justify-center w-full aspect-[5/3] overflow-hidden"
            style={{
              backgroundColor: article.image_background_color || "#d1d0ca",
            }}
          >
            {article.image ? (
              <Image
                src={article.image.src}
                width={article.image.width}
                height={article.image.height}
                alt={article.title}
                className="w-[50%] h-auto object-cover object-center"
              />
            ) : (
              <Image
                src="/assets/images/default-image-blog.png"
                width="600"
                height="600"
                alt={article.title}
                className="w-[50%] h-auto object-cover object-center"
              />
            )}
            <div className="bg-white text-2xl opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100 duration-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full p-5 z-[2]">
              <MdOutlineArrowOutward />
            </div>
            <div className="bg-[--text] opacity-0 group-hover:opacity-35 duration-300 absolute inset-0 w-full h-full z-[1]" />
          </picture>
          <header className="space-y-4 mt-3">
            <h2 className="text-xl lg:text-2xl font-extralight">
              {article.title}
            </h2>
            {article.annotation && (
              <p className="text-sm md:text-base font-light">
                {article.annotation}
              </p>
            )}
            <div className="flex justify-between gap-4 border-t border-[#b8b8b8] text-sm">
              <div className="text-[--gray-text] lowercase">
                {article.category.title}
              </div>
              <time className="block text-[--gray-text] text-right pt-1">
                {format(new Date(article.pubdate), "dd MMMM yyyy", {
                  locale: ru,
                })}
              </time>
            </div>
          </header>
          <Link
            href={`/blog/${article.slug}`}
            className="absolute top-0 left-0 w-full h-full z-[3]"
          ></Link>
        </article>
      ))}
    </div>
  ) : (
    <div className="text-[--gray-text] mt-10">Здесь пока нет статей ...</div>
  );
}
