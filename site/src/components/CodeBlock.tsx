import { useState } from 'react';
import { IoMdCopy, IoMdCheckmark } from 'react-icons/io';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { nord } from 'react-syntax-highlighter/dist/cjs/styles/prism';

import { useLocale } from '@/lib/use-locale';

const codeStyle = {
  borderRadius: '1rem',
  padding: '1.25rem',
  background: 'rgb(var(--surface))',
  border: '1px solid rgb(var(--line))',
  fontSize: '0.9rem',
};

type CodeBlockProps = {
  language?: string;
  value: string;
  className?: string;
};

export default function CodeBlock({ language, value, className }: CodeBlockProps) {
  const { t } = useLocale();
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
        aria-label={copied ? t.blog.copied : t.blog.copyCode}
        title={t.blog.copyCode}
      >
        {copied ? <IoMdCheckmark /> : <IoMdCopy />}
      </button>
      {language ? (
        <SyntaxHighlighter language={language} style={nord} customStyle={codeStyle}>
          {value}
        </SyntaxHighlighter>
      ) : (
        <SyntaxHighlighter style={nord} customStyle={codeStyle}>
          {value}
        </SyntaxHighlighter>
      )}
    </div>
  );
}
