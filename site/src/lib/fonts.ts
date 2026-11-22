import { Manrope, Onest } from "next/font/google";

export const onest = Onest({
  subsets: ["cyrillic", "latin"],
  display: "swap",
});

export const manrope = Manrope({
  subsets: ["cyrillic", "latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});
