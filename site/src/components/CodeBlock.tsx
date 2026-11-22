"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nord } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { IoMdCopy, IoMdCheckmark } from "react-icons/io";

const codeStyle = {
  borderRadius: "1rem",
  padding: "1.25rem",
  background: "rgb(21 21 24)",
  border: "1px solid rgb(46 46 52)",
  fontSize: "0.9rem",
};

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
        className="absolute top-2 right-2 z-10 text-lg p-1.5 rounded-md text-muted hover:text-fg hover:bg-surface-2 transition-opacity opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100"
        aria-label={copied ? "Скопировано" : "Скопировать код"}
        title="Скопировать"
      >
        {copied ? <IoMdCheckmark /> : <IoMdCopy />}
      </button>
      {language ? (
        <SyntaxHighlighter
          language={language}
          style={nord}
          customStyle={codeStyle}
        >
          {value}
        </SyntaxHighlighter>
      ) : (
        <SyntaxHighlighter
          style={nord}
          customStyle={codeStyle}
        >
          {value}
        </SyntaxHighlighter>
      )}
    </div>
  );
}
