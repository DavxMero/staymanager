'use client';

import ReactMarkdown, { Components } from 'react-markdown';
import { motion } from 'framer-motion';

interface MarkdownMessageProps {
    content: string;
    animate?: boolean;
    messageId?: string;
    isStreaming?: boolean;
}

const components: Components = {
    h1: ({ node: _n, ...props }) => <h1 className="text-2xl font-bold mb-3 mt-4 text-gray-900 dark:text-white" {...props} />,
    h2: ({ node: _n, ...props }) => <h2 className="text-xl font-bold mb-3 mt-3 text-gray-900 dark:text-white" {...props} />,
    h3: ({ node: _n, ...props }) => <h3 className="text-lg font-semibold mb-2 mt-2 text-gray-800 dark:text-gray-100" {...props} />,
    p: ({ node: _n, ...props }) => <p className="mb-2 leading-relaxed text-gray-800 dark:text-gray-200" {...props} />,
    ul: ({ node: _n, ...props }) => <ul className="list-disc list-inside mb-3 space-y-1.5 ml-2" {...props} />,
    ol: ({ node: _n, ...props }) => <ol className="list-decimal list-inside mb-3 space-y-1.5 ml-2" {...props} />,
    li: ({ node: _n, ...props }) => <li className="text-gray-800 dark:text-gray-200 leading-relaxed" {...props} />,
    strong: ({ node: _n, ...props }) => <strong className="font-bold text-gray-900 dark:text-white" {...props} />,
    em: ({ node: _n, ...props }) => <em className="italic text-gray-800 dark:text-gray-200" {...props} />,
    code: ({ node: _n, inline, ...props }: any) =>
        inline ? (
            <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono text-blue-600 dark:text-blue-400" {...props} />
        ) : (
            <code className="block bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm font-mono overflow-x-auto mb-3 text-gray-800 dark:text-gray-200" {...props} />
        ),
    blockquote: ({ node: _n, ...props }) => (
        <blockquote
            className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 py-2 my-3 bg-blue-50 dark:bg-blue-950/30 text-gray-700 dark:text-gray-300 italic"
            {...props}
        />
    ),
    a: ({ node: _n, ...props }) => (
        <a className="text-blue-600 dark:text-blue-400 hover:underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />
    ),
    hr: ({ node: _n, ...props }) => <hr className="my-4 border-gray-300 dark:border-gray-600" {...props} />,
};

export function MarkdownMessage({ content, isStreaming = false }: MarkdownMessageProps) {
    return (
        <div className="markdown-content prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown components={components}>{content}</ReactMarkdown>
            {isStreaming && (
                <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block w-1.5 h-4 bg-blue-600 dark:bg-blue-400 ml-0.5 align-middle"
                />
            )}
        </div>
    );
}