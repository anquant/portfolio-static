import Layout from "@/components/Layout";
import Header, { navigation } from "@/components/Header";
import Button from "@/components/Button";

export default function Error404() {
  const seo = {
    meta_title: "Ошибка 404",
    meta_description: "Такой страницы не существует",
  };

  return (
    <Layout seo={seo}>
      <div className="container-page min-h-screen flex flex-col">
        <Header />
        <section className="flex-1 flex flex-col justify-center pb-24">
          <div className="reveal font-display text-[7rem] md:text-[12rem] font-bold leading-none text-surface-2 select-none">
            404
          </div>
          <h1 className="reveal t-section md:text-4xl -mt-4 md:-mt-8 [--d:150ms]">
            Такой страницы не существует
          </h1>
          <p className="reveal mt-4 text-muted [--d:300ms]">
            Возможно, она переехала. Попробуйте один из разделов:
          </p>
          <div className="reveal mt-8 flex flex-wrap gap-2 [--d:450ms]">
            <Button type="link" href="/">
              На главную
            </Button>
            {navigation.slice(1).map((item) => (
              <Button
                key={item.slug}
                type="link"
                href={item.slug}
                variant="secondary"
              >
                {item.title}
              </Button>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
