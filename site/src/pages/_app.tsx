import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { onest, manrope } from "@/lib/fonts";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* Fonts are set on :root so portals (mobile menu dialog) inherit them too */}
      <style jsx global>{`
        :root {
          --font-sans: ${onest.style.fontFamily};
          --font-display: ${manrope.style.fontFamily};
        }
      `}</style>
      <Component {...pageProps} />
    </>
  );
}
