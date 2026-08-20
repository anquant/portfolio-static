"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nord } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { IoMdCopy, IoMdCheckmark } from "react-icons/io";

type CodeBlockProps = {
  language?: string;
  value: string;
  className?: string;
};

export default function CodeBlock({
  language,
  value,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`relative group ${className}`}>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 bg-transparent text-lg p-1 rounded hover:bg-[--background] transition-opacity opacity-0 group-hover:opacity-100"
        title="Скопировать"
      >
        {copied ? <IoMdCheckmark /> : <IoMdCopy />}
      </button>
      {language ? (
        <SyntaxHighlighter
          language={language}
          style={nord}
          customStyle={{ borderRadius: "0.5rem", padding: "1rem" }}
        >
          {value}
        </SyntaxHighlighter>
      ) : (
        <SyntaxHighlighter
          style={nord}
          customStyle={{ borderRadius: "0.5rem", padding: "1rem" }}
        >
          {value}
        </SyntaxHighlighter>
      )}
    </div>
  );
}
