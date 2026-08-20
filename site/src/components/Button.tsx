"use client";

import { ReactNode, MouseEvent } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface ButtonProps {
  type?: "button" | "submit" | "link" | "div";
  href?: string;
  size?: "normal" | "medium" | "small";
  theme?: "light" | "dark";
  border?: "default" | "none";
  className?: string;
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  disabled?: boolean;
}

const Button = ({
  type = "button",
  href = "#",
  size = "normal",
  theme = "light",
  border = "default",
  className,
  children,
  onClick,
  disabled,
}: ButtonProps) => {
  const normalSize = "text-sm md:text-base py-3.5 px-8";
  const mediumSize = "text-sm py-2.5 px-6";
  const smallSize = "text-xs md:text-sm py-1.5 px-4";

  const lightTheme = {
    background: "#d2d2d2",
    borderColor: "#d2d2d2",
    color: "black",
    transition: { duration: 0.25 },
  };
  const darkTheme = {
    background: "#303030",
    borderColor: "#303030",
    color: "white",
    transition: { duration: 0.25 },
  };
  const lightThemeHover = {
    background: "#b0b0b0",
    borderColor: "#b0b0b0",
    color: "black",
    transition: { duration: 0.25 },
  };
  const darkThemeHover = {
    background: "#181818",
    borderColor: "#181818",
    color: "white",
    transition: { duration: 0.25 },
  };

  const disabledStyle = {
    background: "#e0e0e0",
    borderColor: "#e0e0e0",
    color: "#a0a0a0",
    cursor: "not-allowed",
    pointerEvents: "auto",
    transition: "none",
  };

  const sizeClass =
    size === "normal" ? normalSize : size === "medium" ? mediumSize : smallSize;
  const defaultClasses = `flex gap-x-10 w-fit items-center rounded-full font-medium text-left cursor-pointer outline-0 ${sizeClass}`;
  const borderClass = border === "none" ? "" : "border border-[--text]";
  const propsButton = {
    className: `${defaultClasses} ${borderClass} ${className}`,
    onClick,
    style:
      border === "none"
        ? theme === "dark"
          ? { background: darkTheme.background, color: darkTheme.color }
          : { background: lightTheme.background, color: lightTheme.color }
        : undefined,
    disabled,
  };
  const propsLink = {
    className: `${defaultClasses} ${borderClass} ${className}`,
    style:
      border === "none"
        ? theme === "dark"
          ? { background: darkTheme.background, color: darkTheme.color }
          : { background: lightTheme.background, color: lightTheme.color }
        : undefined,
  };

  let component;

  switch (type) {
    case "button":
      component =
        border === "none" ? (
          <motion.button
            type="button"
            {...propsButton}
            style={disabled ? disabledStyle : propsButton.style}
            whileHover={
              disabled
                ? undefined
                : theme === "dark"
                  ? darkThemeHover
                  : lightThemeHover
            }
          >
            {children}
          </motion.button>
        ) : (
          <motion.button
            whileHover={
              disabled ? undefined : theme === "dark" ? darkTheme : lightTheme
            }
            type="button"
            {...propsButton}
            style={disabled ? disabledStyle : propsButton.style}
          >
            {children}
          </motion.button>
        );
      break;
    case "submit":
      component =
        border === "none" ? (
          <motion.button
            type="submit"
            {...propsButton}
            style={disabled ? disabledStyle : propsButton.style}
            whileHover={
              disabled
                ? undefined
                : theme === "dark"
                  ? darkThemeHover
                  : lightThemeHover
            }
          >
            {children}
          </motion.button>
        ) : (
          <motion.button
            whileHover={
              disabled ? undefined : theme === "dark" ? darkTheme : lightTheme
            }
            type="submit"
            {...propsButton}
            style={disabled ? disabledStyle : propsButton.style}
          >
            {children}
          </motion.button>
        );
      break;
    case "link":
      component = (
        <Link href={href} className="block w-fit">
          {border === "none" ? (
            <motion.div
              {...propsLink}
              whileHover={theme === "dark" ? darkThemeHover : lightThemeHover}
            >
              {children}
            </motion.div>
          ) : (
            <motion.div
              whileHover={theme === "dark" ? darkTheme : lightTheme}
              {...propsLink}
            >
              {children}
            </motion.div>
          )}
        </Link>
      );
      break;
    case "div":
      component =
        border === "none" ? (
          <motion.div
            {...propsLink}
            whileHover={theme === "dark" ? darkThemeHover : lightThemeHover}
          >
            {children}
          </motion.div>
        ) : (
          <motion.div
            whileHover={theme === "dark" ? darkTheme : lightTheme}
            {...propsLink}
          >
            {children}
          </motion.div>
        );
      break;
    default:
      component = null;
  }

  return component;
};

export default Button;
