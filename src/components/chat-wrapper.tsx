"use client";

import { Message } from "@/actions";
import { useInput } from "@/hooks/use-input";
import { User } from "@supabase/supabase-js";
import React, { useState } from 'react';
import ChatPannel from "./chat-pannel";
import ChatInput from "./chat-input";

interface Props {
    user: User | null;
    messages: Message[];
    oMessages: Message[];
    isLoading: boolean;
    isAiLoading: boolean;
    onSubmit: (message: string) => Promise<void>;
}

const ChatWrapper = ({ user, messages, oMessages, isLoading, isAiLoading, onSubmit }: Props) => {

    const { input, setInput } = useInput();

    const [error, setError] = useState<string | null>(null);

    const filteredOptimistic = oMessages.filter(
        optMsg => !messages.some(msg => 
            msg.content === optMsg.content && 
            msg.role === optMsg.role &&
            Math.abs(new Date(msg.created_at).getTime() - new Date(optMsg.created_at).getTime()) < 1000
        )
    );

    const allMessages = [...messages, ...filteredOptimistic];
    // const [isLoading, setIsLoading] = useState<boolean>(false);
    // const [messages, setMessages] = useState<Message[]>(initialMessages || []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!input.trim()) return;
        setInput("");
        setError(null);

        try {
            await onSubmit(input);
        } catch (error) {
            console.error("Error sending message:", error);
            setError("Error generating response. Try refreshing the page");
        } finally {

        }
    };

    // useEffect(() => {
    //     setMessages(initialMessages);
    // }, [initialMessages]);

    return (
        <div className="relative flex-1 size-full">
            <ChatPannel
                error={error}
                user={user}
                messages={allMessages}
                isLoading={isLoading}
                isAiLoading={isAiLoading}
            />
            <ChatInput
                isLoading={isLoading}
                handleSendMessage={handleSubmit}
            />
        </div>
    )
};

export default ChatWrapper
