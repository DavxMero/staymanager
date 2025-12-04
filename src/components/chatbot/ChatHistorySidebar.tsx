'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, Trash2, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface ChatHistoryItem {
    id: string;
    created_at: string;
    messages: any[];
}

interface ChatHistorySidebarProps {
    isOpen: boolean;
    onClose: () => void;
    chatHistory: ChatHistoryItem[];
    currentChatId: string | null;
    onSelectChat: (chatId: string) => void;
    onNewChat: () => void;
    onDeleteChat: (chatId: string) => void;
}

export function ChatHistorySidebar({
    isOpen,
    onClose,
    chatHistory,
    currentChatId,
    onSelectChat,
    onNewChat,
    onDeleteChat,
}: ChatHistorySidebarProps) {
    const getChatTitle = (messages: any[]) => {
        if (!messages || messages.length === 0) return 'New Chat';
        const firstUserMessage = messages.find(m => m.role === 'user');
        if (!firstUserMessage) return 'New Chat';
        const title = firstUserMessage.content.slice(0, 50);
        return title.length < firstUserMessage.content.length ? `${title}...` : title;
    };

    return (
        <>
            {/* Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: -320 }}
                        animate={{ x: 0 }}
                        exit={{ x: -320 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed left-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 flex flex-col shadow-xl"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h2 className="font-semibold text-gray-900 dark:text-white">
                                    Chat History
                                </h2>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="md:hidden"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* New Chat Button */}
                        <div className="p-3">
                            <Button
                                onClick={onNewChat}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                New Chat
                            </Button>
                        </div>

                        {/* Chat List */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {chatHistory.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                    <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        No chat history yet
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                        Start a conversation to see it here
                                    </p>
                                </div>
                            ) : (
                                chatHistory.map((chat) => (
                                    <motion.div
                                        key={chat.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="group relative"
                                    >
                                        <div
                                            onClick={() => onSelectChat(chat.id)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    onSelectChat(chat.id);
                                                }
                                            }}
                                            className={`w-full text-left p-3 rounded-lg transition-all cursor-pointer ${currentChatId === chat.id
                                                    ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 dark:border-blue-400'
                                                    : 'bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                        {getChatTitle(chat.messages)}
                                                    </p>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <Clock className="h-3 w-3 text-gray-400" />
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {formatDistanceToNow(new Date(chat.created_at), {
                                                                addSuffix: true,
                                                            })}
                                                        </p>
                                                    </div>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                        {chat.messages.length} messages
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDeleteChat(chat.id);
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                {chatHistory.length} conversation{chatHistory.length !== 1 ? 's' : ''} saved
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
