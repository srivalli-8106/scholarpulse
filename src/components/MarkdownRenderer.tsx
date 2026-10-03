import React, { useState } from 'react';
import Markdown from 'markdown-to-jsx';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const CodeBlock = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const [copied, setCopied] = useState(false);
  const codeString = String(children).replace(/\n$/, '');
  const language = className ? className.replace(/lang-/, '') : 'text';

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-3 rounded-xl overflow-hidden border border-slate-700/60 bg-slate-950/80 shadow-md">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
        <span className="font-mono text-indigo-400 font-medium">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors p-1 rounded hover:bg-slate-800"
          title="Copy code"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <div className="p-3.5 overflow-x-auto text-sm font-mono text-slate-200 leading-relaxed">
        <pre className="!m-0 !p-0">
          <code>{codeString}</code>
        </pre>
      </div>
    </div>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={`prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed ${className}`}>
      <Markdown
        options={{
          overrides: {
            h1: {
              component: ({ children }) => (
                <h1 className="text-xl sm:text-2xl font-bold text-white mt-4 mb-2 pb-1 border-b border-slate-700/50 flex items-center gap-2">
                  {children}
                </h1>
              ),
            },
            h2: {
              component: ({ children }) => (
                <h2 className="text-lg sm:text-xl font-bold text-slate-100 mt-4 mb-2 flex items-center gap-2 text-indigo-300">
                  {children}
                </h2>
              ),
            },
            h3: {
              component: ({ children }) => (
                <h3 className="text-base sm:text-lg font-semibold text-indigo-200 mt-3 mb-1.5">
                  {children}
                </h3>
              ),
            },
            p: {
              component: ({ children }) => <p className="mb-2.5 last:mb-0 leading-relaxed">{children}</p>,
            },
            ul: {
              component: ({ children }) => <ul className="list-disc pl-5 my-2.5 space-y-1">{children}</ul>,
            },
            ol: {
              component: ({ children }) => <ol className="list-decimal pl-5 my-2.5 space-y-1.5">{children}</ol>,
            },
            li: {
              component: ({ children }) => <li className="pl-1 marker:text-indigo-400">{children}</li>,
            },
            blockquote: {
              component: ({ children }) => (
                <blockquote className="my-3 pl-4 border-l-4 border-indigo-500 bg-indigo-950/20 py-2 pr-3 rounded-r-lg text-slate-300 italic">
                  {children}
                </blockquote>
              ),
            },
            code: {
              component: ({ className, children }) => {
                if (className) {
                  return <CodeBlock className={className}>{children}</CodeBlock>;
                }
                return (
                  <code className="bg-slate-800 text-indigo-300 px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono border border-slate-700/60">
                    {children}
                  </code>
                );
              },
            },
            table: {
              component: ({ children }) => (
                <div className="overflow-x-auto my-3 rounded-lg border border-slate-800 bg-slate-900/60">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">{children}</table>
                </div>
              ),
            },
            th: {
              component: ({ children }) => (
                <th className="px-3 py-2 bg-slate-800/80 font-semibold text-slate-200 border-b border-slate-700">
                  {children}
                </th>
              ),
            },
            td: {
              component: ({ children }) => (
                <td className="px-3 py-2 border-b border-slate-800/60 text-slate-300">{children}</td>
              ),
            },
          },
        }}
      >
        {content}
      </Markdown>
    </div>
  );
};
