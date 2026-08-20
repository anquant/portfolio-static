"use client";

import { useRouter } from "next/router";
import {
  Dialog,
  Transition,
  TransitionChild,
  DialogPanel,
} from "@headlessui/react";
import { Fragment, useState } from "react";
import Link from "next/link";
import Button from "./Button";
import { HiOutlineMenuAlt4 } from "react-icons/hi";
import { GoDotFill } from "react-icons/go";

export const navigation = [
  {
    title: "Проекты",
    slug: "/",
    active: false,
  },
  {
    title: "Услуги",
    slug: "/services",
    active: false,
  },
  {
    title: "Обо мне",
    slug: "/about",
    active: false,
  },
  {
    title: "Блог",
    slug: "/blog",
    active: false,
  },
  {
    title: "Контакты",
    slug: "/contacts",
    active: false,
  },
];

type HeaderProps = {
  classes?: string;
};

export default function Header({ classes = "mb-28 md:mb-40" }: HeaderProps) {
  const siteName = "Павел Моисеев";

  const router = useRouter();
  const path = router.pathname;
  navigation.forEach((item) => {
    item.active = path === item.slug;
  });

  const isHomePage = router.pathname === "/";

  const [open, setOpen] = useState(false);

  return (
    <header className="relative">
      {/* Pop-up menu */}
      <Transition show={open} as={Fragment}>
        <Dialog as="div" className="relative z-20" onClose={setOpen}>
          <div className="fixed inset-0 flex">
            <TransitionChild
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-y-full"
              enterTo="translate-y-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-y-0"
              leaveTo="-translate-y-full"
            >
              <div className="bg-[--background-dark] w-full">
                <DialogPanel className="relative h-full overflow-y-auto mx-auto max-w-7xl px-6 xl:px-0">
                  <div className="flex justify-between items-center pt-8 md:pt-16">
                    {isHomePage ? (
                      <div className="text-xl text-white/90 font-bold cursor-default">
                        {siteName}
                      </div>
                    ) : (
                      <Link
                        href="/"
                        className="block w-fit text-xl text-white/90 font-bold hover:text-white/40 duration-300"
                        onClick={() => setOpen(false)}
                      >
                        {siteName}
                      </Link>
                    )}
                    <button
                      type="button"
                      className="relative outline-none group"
                      onClick={() => setOpen(false)}
                    >
                      <svg
                        className="stroke-white group-hover:stroke-white/40 duration-300"
                        width="30"
                        height="30"
                        viewBox="0 0 30 30"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M7 23.0278L23.0278 7"
                          strokeWidth="3"
                          strokeLinecap="square"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M23.0277 23.0278L6.99996 7"
                          strokeWidth="3"
                          strokeLinecap="square"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="flex justify-center -ml-8 mt-32 px-8">
                    <div className="space-y-4">
                      {navigation.map((item, index) => (
                        <div
                          key={index}
                          className="text-3xl md:text-4xl whitespace-nowrap"
                        >
                          {item.active ? (
                            <span className="flex gap-1 items-center text-white/40 cursor-default">
                              <GoDotFill />
                              {item.title}
                            </span>
                          ) : (
                            <Link
                              href={item.slug}
                              className="flex gap-1 items-center text-white/90 group"
                            >
                              <GoDotFill className="relative opacity-0 -top-3 group-hover:opacity-100 group-hover:top-0 duration-300" />
                              {item.title}
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </DialogPanel>
              </div>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>

      {/* Menu */}
      <div
        className={`relative flex justify-between items-center pt-8 md:pt-16 ${classes}`}
      >
        {isHomePage ? (
          <div className="text-lg md:text-xl font-bold cursor-default">
            {siteName}
          </div>
        ) : (
          <Link
            href="/"
            className="block w-fit text-lg md:text-xl font-bold hover:text-[--link] duration-300"
          >
            {siteName}
          </Link>
        )}
        <div className="flex items-center gap-x-10 xl:gap-x-16">
          <nav className="hidden lg:flex flex-wrap justify-end gap-x-6 gap-y-4">
            {navigation.map((item, index) => (
              <div key={index} className="text-lg whitespace-nowrap">
                {item.active ? (
                  <span className="flex gap-0.5 items-center cursor-default">
                    <GoDotFill />
                    {item.title}
                  </span>
                ) : (
                  <Link
                    href={item.slug}
                    className="flex gap-0.5 items-center group"
                  >
                    <GoDotFill className="relative opacity-0 -top-3 group-hover:opacity-100 group-hover:top-0 duration-300" />
                    {item.title}
                  </Link>
                )}
              </div>
            ))}
          </nav>
          <div className="flex gap-1.5 items-center">
            <Button
              type="button"
              theme="dark"
              size="small"
              className="lg:hidden"
              onClick={() => setOpen(true)}
            >
              <HiOutlineMenuAlt4 size={18} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
