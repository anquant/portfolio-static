import BlogCover from "./BlogCover";
import Reveal from "./Reveal";
import Link from "next/link";
import { ArticleCardData } from "@/lib/types/blogType";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

type ArticleCardProps = {
  articles?: ArticleCardData[];
};

export default function ArticleCard({ articles }: ArticleCardProps) {
  if (!articles || articles.length === 0) {
    return <div className="text-muted mt-10">Здесь пока нет статей…</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-10 md:mt-14">
      {articles.map((article, index) => (
        <Reveal key={article.slug} delay={(index % 3) * 90} className="flex">
          <Link
            href={`/blog/${article.slug}`}
            className="group flex w-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-colors hover:border-fg/20 hover:bg-surface-2"
          >
            <BlogCover
              image={article.image}
              color={article.image_background_color}
              className="w-full aspect-[5/3]"
            />
            <div className="flex flex-1 flex-col gap-3 p-6">
              <div className="flex items-center justify-between gap-4 text-xs md:text-sm text-muted">
                <span className="rounded-full border border-line px-2.5 py-0.5 lowercase">
                  {article.category.title}
                </span>
                <time dateTime={article.pubdate}>
                  {format(new Date(article.pubdate), "d MMMM yyyy", {
                    locale: ru,
                  })}
                </time>
              </div>
              <h2 className="font-display text-xl lg:text-2xl font-semibold leading-snug transition-colors group-hover:text-accent">
                {article.title}
              </h2>
              {article.annotation && (
                <p className="text-sm md:text-base text-muted line-clamp-3">
                  {article.annotation}
                </p>
              )}
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
