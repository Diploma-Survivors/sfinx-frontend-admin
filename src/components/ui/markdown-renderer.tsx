import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeRaw from "rehype-raw";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw]}
      components={{
        h1: ({ node, ...props }) => (
          <h1
            className="text-2xl font-bold mb-4 mt-6 text-foreground"
            {...props}
          />
        ),
        h2: ({ node, ...props }) => (
          <h2
            className="text-xl font-bold mb-3 mt-5 text-foreground"
            {...props}
          />
        ),
        h3: ({ node, ...props }) => (
          <h3
            className="text-lg font-bold mb-2 mt-4 text-foreground"
            {...props}
          />
        ),
        p: ({ node, ...props }) => (
          <p
            className="mb-4 text-muted-foreground leading-relaxed"
            {...props}
          />
        ),
        ul: ({ node, ...props }) => (
          <ul
            className="list-disc pl-6 mb-4 text-muted-foreground"
            {...props}
          />
        ),
        ol: ({ node, ...props }) => (
          <ol
            className="list-decimal pl-6 mb-4 text-muted-foreground"
            {...props}
          />
        ),
        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
        blockquote: ({ node, ...props }) => (
          <blockquote
            className="border-l-4 border-border pl-4 italic my-4 text-muted-foreground"
            {...props}
          />
        ),
        a: ({ node, ...props }) => (
          <a
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),
        // @ts-ignore
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <SyntaxHighlighter
              style={oneDark}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code
              className={`${className} bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground`}
              {...props}
            >
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
