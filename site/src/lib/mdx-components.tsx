import type { ReactElement, ComponentProps } from "react";
import type { MDXProvider } from "@mdx-js/react";
import CodeBlock from "@/components/CodeBlock";

type CodeChildProps = {
  className?: string;
  children?: React.ReactNode;
};

type MDXComponentsMap = ComponentProps<typeof MDXProvider>["components"];

export const mdxComponents: MDXComponentsMap = {
  pre: (props: { children?: React.ReactNode }) => {
    const child = props.children as ReactElement<CodeChildProps>;
    const className = child?.props?.className || "";
    const match = /language-(\w+)/.exec(className);
    const value = String(child?.props?.children ?? "").replace(/\n$/, "");

    return (
      <CodeBlock language={match?.[1]} value={value} className="mb-6" />
    );
  },
  blockquote: (props: { children?: React.ReactNode }) => (
    <blockquote
      className="border-y border-[#9f9f9f] space-y-2 my-8 p-6 md:p-8"
      {...props}
    />
  ),
  hr: () => (
    <div className="relative w-[150px] mx-auto my-14 md:my-16">
      <hr className="sr-only" />
      <div className="h-px bg-[#9f9f9f] w-full" />
      <div className="mx-auto h-px bg-[#9f9f9f] w-[50px] -rotate-45" />
    </div>
  ),
  table: (props: React.TableHTMLAttributes<HTMLTableElement>) => (
    <table
      className="border-collapse border border-black/20 w-full mb-6"
      {...props}
    />
  ),
  td: (props: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td className="border border-black/20 p-2" {...props} />
  ),
  th: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th className="border border-black/20 p-2 text-left" {...props} />
  ),
};
