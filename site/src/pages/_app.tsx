import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { onest, manrope } from "@/lib/fonts";

export default function App({ Component, pageProps, router }: AppProps) {
  // Remount the page when moving between items of the same dynamic route
  // (case → next case, service → service, article → article). Otherwise React
  // reuses the tree: <video> keeps playing the previous <source>, scroll
  // reveals stay "already shown" and the 3D intro doesn't replay.
  // Query changes (?page, ?category) are intentionally not part of the key.
  const slug = router.query.slug;
  const pageKey = `${router.pathname}:${Array.isArray(slug) ? slug.join("/") : (slug ?? "")}`;

  return (
    <>
      {/* Fonts are set on :root so portals (mobile menu dialog) inherit them too */}
      <style jsx global>{`
        :root {
          --font-sans: ${onest.style.fontFamily};
          --font-display: ${manrope.style.fontFamily};
        }
      `}</style>
      <Component key={pageKey} {...pageProps} />
    </>
  );
}
