import Layout from "@/components/Layout";
import { navigation } from "@/components/Header";
import Link from "next/link";

export default function Error404() {
  const seo = {
    meta_title: "Ошибка 404",
    meta_description: "Такой страницы не существует",
  };

  return (
    <Layout seo={seo}>
      <section className="relative flex justify-center lg:items-center min-h-screen mx-auto max-w-7xl px-12 xl:px-0">
        <div className="space-y-8 mt-20">
          <div className="text-xl md:text-2xl font-semibold">
            Ошибка 404. Такой страницы не существует.
          </div>
          <div className="flex gap-6 mt-14">
            <div className="text-[--gray-text]">открыть:</div>
            <div className="space-y-3 md:space-y-2">
              {navigation.map((item, index) => (
                <Link
                  key={index}
                  href={item.slug}
                  className="block font-medium whitespace-nowrap hover:text-[--link]"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
