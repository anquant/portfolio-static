"use client";

import { useRouter } from "next/router";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment, useState } from "react";
import Link from "next/link";
import { HiOutlineMenuAlt4 } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import Button from "./Button";

export const navigation = [
  { title: "Проекты", slug: "/" },
  { title: "Услуги", slug: "/services" },
  { title: "Обо мне", slug: "/about" },
  { title: "Блог", slug: "/blog" },
];

export const siteName = "Павел Моисеев";

type HeaderProps = {
  classes?: string;
};

function isActive(path: string, slug: string) {
  if (slug === "/") return path === "/" || path === "/[slug]";
  return path === slug || path.startsWith(`${slug}/`);
}

export default function Header({ classes = "mb-16 md:mb-28" }: HeaderProps) {
  const router = useRouter();
  const path = router.pathname;
  const isHomePage = path === "/";
  const [open, setOpen] = useState(false);

  const logo = (
    <span className="flex items-center gap-2.5 text-base md:text-lg font-semibold tracking-tight">
      <span
        aria-hidden
        className="grid place-items-center size-8 rounded-full bg-fg text-bg font-display text-sm font-bold"
      >
        ПМ
      </span>
      {siteName}
    </span>
  );

  return (
    <header className={`relative z-20 ${classes}`}>
      <div className="flex items-center justify-between gap-6 pt-6 md:pt-10">
        {isHomePage ? (
          <div className="cursor-default">{logo}</div>
        ) : (
          <Link href="/" className="transition-opacity hover:opacity-70">
            {logo}
          </Link>
        )}

        {/* Desktop navigation */}
        <nav
          aria-label="Основное меню"
          className="hidden lg:flex items-center gap-1 rounded-full border border-line bg-surface/70 backdrop-blur p-1"
        >
          {navigation.map((item) => {
            const active = isActive(path, item.slug);
            return (
              <Link
                key={item.slug}
                href={item.slug}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-sm transition-colors ${
                  active
                    ? "bg-surface-2 text-fg"
                    : "text-muted hover:text-fg"
                }`}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            type="link"
            href="/contacts"
            size="small"
            className="hidden sm:inline-flex"
          >
            Контакты
          </Button>
          <Button
            variant="secondary"
            size="small"
            className="lg:hidden !px-3"
            onClick={() => setOpen(true)}
            aria-label="Открыть меню"
          >
            <HiOutlineMenuAlt4 size={18} />
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <Transition show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setOpen}>
          <TransitionChild
            as={Fragment}
            enter="transition-opacity duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-bg/95 backdrop-blur-sm" />
          </TransitionChild>
          <div className="fixed inset-0 flex">
            <TransitionChild
              as={Fragment}
              enter="transition duration-300 ease-out"
              enterFrom="opacity-0 -translate-y-4"
              enterTo="opacity-100 translate-y-0"
              leave="transition duration-200 ease-in"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 -translate-y-4"
            >
              <DialogPanel className="container-page flex flex-col h-full overflow-y-auto text-fg font-sans">
                <div className="flex items-center justify-between pt-6 md:pt-10">
                  {logo}
                  <Button
                    variant="secondary"
                    size="small"
                    className="!px-3"
                    onClick={() => setOpen(false)}
                    aria-label="Закрыть меню"
                  >
                    <IoClose size={18} />
                  </Button>
                </div>
                <nav aria-label="Основное меню" className="mt-16 flex flex-col">
                  {[...navigation, { title: "Контакты", slug: "/contacts" }].map(
                    (item, i) => {
                      const active = isActive(path, item.slug);
                      return (
                        <Link
                          key={item.slug}
                          href={item.slug}
                          onClick={() => setOpen(false)}
                          aria-current={active ? "page" : undefined}
                          style={{ "--d": `${120 + i * 60}ms` } as React.CSSProperties}
                          className={`reveal flex items-center justify-between border-b border-line py-5 font-display text-3xl font-semibold transition-colors ${
                            active ? "text-accent" : "text-fg hover:text-accent"
                          }`}
                        >
                          {item.title}
                          <span aria-hidden className="text-xl text-muted">
                            →
                          </span>
                        </Link>
                      );
                    }
                  )}
                </nav>
                <div className="mt-auto pb-10 pt-10">
                  <Button
                    type="link"
                    href="/contacts"
                    className="w-full"
                    onClick={() => setOpen(false)}
                  >
                    Обсудить проект
                  </Button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </header>
  );
}
