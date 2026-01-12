'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';

interface MarkdownMessageProps {
    content: string;
    isStreaming?: boolean;
    isLatestMessage?: boolean;
}

export function MarkdownMessage({ content, isStreaming = false, isLatestMessage = false }: MarkdownMessageProps) {
    const [displayedContent, setDisplayedContent] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (isLatestMessage && isStreaming) {
            if (currentIndex < content.length) {
                const timeout = setTimeout(() => {
                    setDisplayedContent(content.slice(0, currentIndex + 1));
                    setCurrentIndex(currentIndex + 1);
                }, 3);

                return () => clearTimeout(timeout);
            }
        } else {
            setDisplayedContent(content);
            setCurrentIndex(content.length);
        }
    }, [content, currentIndex, isStreaming, isLatestMessage]);

    return (
        <div className="markdown-content prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
                components={{
                    h1: ({ node, ...props }) => (
                        <h1 className="text-2xl font-bold mb-3 mt-4 text-gray-900 dark:text-white" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                        <h2 className="text-xl font-bold mb-3 mt-3 text-gray-900 dark:text-white" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                        <h3 className="text-lg font-semibold mb-2 mt-2 text-gray-800 dark:text-gray-100" {...props} />
                    ),

                    p: ({ node, ...props }) => (
                        <p className="mb-2 leading-relaxed text-gray-800 dark:text-gray-200" {...props} />
                    ),

                    ul: ({ node, ...props }) => (
                        <ul className="list-disc list-inside mb-3 space-y-1.5 ml-2" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                        <ol className="list-decimal list-inside mb-3 space-y-1.5 ml-2" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                        <li className="text-gray-800 dark:text-gray-200 leading-relaxed" {...props} />
                    ),

                    strong: ({ node, ...props }) => (
                        <strong className="font-bold text-gray-900 dark:text-white" {...props} />
                    ),

                    em: ({ node, ...props }) => (
                        <em className="italic text-gray-800 dark:text-gray-200" {...props} />
                    ),

                    code: ({ node, inline, ...props }: any) => {
                        if (inline) {
                            return (
                                <code
                                    className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono text-blue-600 dark:text-blue-400"
                                    {...props}
                                />
                            );
                        }
                        return (
                            <code
                                className="block bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm font-mono overflow-x-auto mb-3 text-gray-800 dark:text-gray-200"
                                {...props}
                            />
                        );
                    },

                    blockquote: ({ node, ...props }) => (
                        <blockquote
                            className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 py-2 my-3 bg-blue-50 dark:bg-blue-950/30 text-gray-700 dark:text-gray-300 italic"
                            {...props}
                        />
                    ),

                    a: ({ node, ...props }) => (
                        <a
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                            target="_blank"
                            rel="noopener noreferrer"
                            {...props}
                        />
                    ),

                    hr: ({ node, ...props }) => (
                        <hr className="my-4 border-gray-300 dark:border-gray-600" {...props} />
                    ),
                }}
            >
                {displayedContent}
            </ReactMarkdown>

            {/* Blinking cursor when streaming */}
            {isLatestMessage && isStreaming && currentIndex < content.length && (
                <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block w-1.5 h-4 bg-blue-600 dark:bg-blue-400 ml-0.5"
                />
            )}
        </div>
    );
}
