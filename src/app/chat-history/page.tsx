'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface ChatMessage {
    id: string;
    user_id: string;
    messages: any[];
    created_at: string;
    updated_at: string;
}

export default function ChatHistoryPage() {
    const [chats, setChats] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedChat, setSelectedChat] = useState<ChatMessage | null>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        fetchChatHistory();
    }, []);

    const fetchChatHistory = async () => {
        try {
            const { data, error } = await supabase
                .from('chats')
                .select('*')
                .order('updated_at', { ascending: false });

            if (error) throw error;
            setChats(data || []);
        } catch (error) {
            console.error('Error fetching chat history:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteChat = async (id: string) => {
        if (!confirm('Are you sure you want to delete this chat?')) return;

        try {
            const { error } = await supabase
                .from('chats')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setChats(chats.filter(c => c.id !== id));
            if (selectedChat?.id === id) setSelectedChat(null);
        } catch (error) {
            console.error('Error deleting chat:', error);
            alert('Failed to delete chat');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Chat History
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        View all chatbot conversations
                    </p>
                </div>
                <button
                    onClick={() => router.push('/chatbot')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Go to Chatbot
                </button>
            </div>

            {chats.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        No chat history found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Start a conversation in the chatbot to see it here
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chat List */}
                    <div className="lg:col-span-1 space-y-3">
                        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            All Conversations ({chats.length})
                        </h2>
                        <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                            {chats.map((chat) => {
                                const messageCount = chat.messages?.length || 0;
                                const lastMessage = chat.messages?.[messageCount - 1];
                                const preview = lastMessage?.content?.substring(0, 60) || 'No messages';

                                return (
                                    <motion.div
                                        key={chat.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedChat?.id === chat.id
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-700'
                                            }`}
                                        onClick={() => setSelectedChat(chat)}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                                        {messageCount} messages
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                    {preview}...
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteChat(chat.id);
                                                }}
                                                className="text-red-500 hover:text-red-700 p-1"
                                                title="Delete chat"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(chat.updated_at).toLocaleString('id-ID')}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Chat Detail */}
                    <div className="lg:col-span-2">
                        {selectedChat ? (
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                            Conversation Details
                                        </h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {selectedChat.messages?.length || 0} messages • Updated {new Date(selectedChat.updated_at).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                                    {selectedChat.messages?.map((message: any, idx: number) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[80%] p-4 rounded-2xl ${message.role === 'user'
                                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-none'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-semibold opacity-70">
                                                        {message.role === 'user' ? 'Guest' : 'AI Concierge'}
                                                    </span>
                                                </div>
                                                <div className="whitespace-pre-wrap text-sm">
                                                    {message.content}
                                                </div>
                                                {message.toolInvocations && message.toolInvocations.length > 0 && (
                                                    <div className="mt-2 pt-2 border-t border-white/20">
                                                        <div className="text-xs opacity-70">
                                                            🛠️ Used {message.toolInvocations.length} tool(s)
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Select a conversation
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Choose a chat from the list to view its full conversation
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
