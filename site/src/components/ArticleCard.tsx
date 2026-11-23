import BlogCover from "./BlogCover";
import Scene3D from "./Scene3D";
import Reveal from "./Reveal";
import Link from "next/link";
import type { ArticleCardData } from "@/lib/content/schemas";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

type ArticleCardProps = {
  articles?: ArticleCardData[];
  /** h2 on the blog index (directly under the page h1), h3 under a section h2 */
  headingAs?: "h2" | "h3";
};

export default function ArticleCard({
  articles,
  headingAs: Heading = "h2",
}: ArticleCardProps) {
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
            {article.scene ? (
              <Scene3D
                scene={article.scene}
                label={article.title}
                framed={false}
                aspectClassName="aspect-[5/3]"
                className="w-full"
              />
            ) : (
              <BlogCover
                image={article.image}
                color={article.image_background_color}
                className="w-full aspect-[5/3]"
              />
            )}
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
              <Heading className="t-card transition-colors group-hover:text-accent">
                {article.title}
              </Heading>
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
