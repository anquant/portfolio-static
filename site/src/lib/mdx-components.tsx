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
      className="border-l-2 border-accent bg-surface rounded-r-2xl space-y-2 my-8 p-6 md:p-8 text-fg/90"
      {...props}
    />
  ),
  hr: () => (
    <div className="relative w-[150px] mx-auto my-14 md:my-16">
      <hr className="sr-only" />
      <div className="h-px bg-line w-full" />
      <div className="mx-auto h-px bg-line w-[50px] -rotate-45" />
    </div>
  ),
  table: (props: React.TableHTMLAttributes<HTMLTableElement>) => (
    <table
      className="border-collapse border border-line w-full mb-6 text-base"
      {...props}
    />
  ),
  td: (props: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td className="border border-line p-3" {...props} />
  ),
  th: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th className="border border-line bg-surface p-3 text-left text-fg" {...props} />
  ),
};
