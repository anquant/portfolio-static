import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Onest } from "next/font/google";

const onest = Onest({ subsets: ["cyrillic"] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={onest.className}>
      <Component {...pageProps} />
    </div>
  );
}
