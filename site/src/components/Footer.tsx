"use client";

import ScrollLink from "@/components/ScrollLink";
import { motion } from "motion/react";
import Link from "next/link";

export function Footer() {
  const siteName = "Павел Моисеев";

  const todayDate = new Date();
  const currentYear = todayDate.getFullYear();

  return (
    <footer className="flex flex-col gap-10 md:gap-6 border-t-2 border-[--text] mt-40 py-10 md:py-14">
      <div className="order-2 md:order-1 flex justify-end md:justify-center">
        <ScrollLink to="beginning">
          <motion.div whileHover={{ y: -2 }} className="group">
            <svg
              className=" fill-[--text] group-hover:fill-[--link] duration-300"
              width="24"
              height="27"
              viewBox="0 0 24 27"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10.1758 26.02L13.4574 26.02L13.4574 6.17924L21.0428 13.7647L23.2894 11.4928L11.8166 0.020018L0.318555 11.4928L2.61564 13.7647L10.1758 6.17924L10.1758 26.02Z" />
            </svg>
          </motion.div>
        </ScrollLink>
      </div>
      <div className="order-1 md:order-2 flex flex-col md:flex-row gap-4 md:justify-between">
        <div className="text-xl font-medium">
          {siteName} ⏤ {currentYear}
        </div>
        <div className="flex gap-8">
          <Link
            href="https://www.behance.net/moiseevp"
            target="_blank"
            className="text-xl hover:text-[--link] font-medium"
          >
            Behance
          </Link>
        </div>
      </div>
    </footer>
  );
}
