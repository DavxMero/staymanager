"use client";

import { Message } from "@/actions";
import { addMessageToChat, createNewChat } from "@/actions/chat";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useState } from 'react';
import { toast } from "sonner";
import ChatWrapper from "./chat-wrapper";

interface Props {
    user: User;
    chatId?: string;
    messages: Message[] | [];
}

const ChatContainer = ({ user, chatId, messages }: Props) => {

    const router = useRouter();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
    const [oMessages, setOMessages] = useState<Message[]>([]);

    const handleSendMessage = async (message: string) => {
        setIsLoading(true);

        if (!message.trim()) return;

        const tempMessageId = `temp-${Date.now()}`;
        const userMessage: Message = {
            id: tempMessageId,
            chat_id: chatId || "",
            content: String(message),
            role: "user",
            created_at: new Date().toISOString(),
        };

        setOMessages((prev) => [...prev, userMessage]);

        try {
            if (chatId) {
                setIsAiLoading(true);
                const { aiMessage } = await addMessageToChat(chatId, message, 'user');

                if (!aiMessage) {
                    toast.error("Failed to generate AI response");
                    return;
                }

                router.refresh();
            } else {
                setIsAiLoading(true);
                const { chatId: newChatId, aiMessage } = await createNewChat(message);

                const aiMessageObj: Message = {
                    id: `temp-ai-${Date.now()}`,
                    chat_id: newChatId,
                    content: String(aiMessage),
                    role: 'assistant',
                    created_at: new Date().toISOString()
                };

                setOMessages(prev => [...prev, aiMessageObj]);
                router.push(`/c/${newChatId}`);
            }

            // NOTE: This is working
            // if(chatId) {
            //     await addMessageToChat(chatId, message, 'user');
            // } else {
            //     const newChatId = await createNewChat(message);
            //     router.push(`/c/${newChatId}`)
            // }
        } catch (error) {
            console.log("Error creating chat", error);
            toast.error("Error creating chat. Please try again");
            setOMessages(prev =>
                prev.filter(msg => msg.id !== tempMessageId)
            );
        } finally {
            setIsLoading(false);
            setIsAiLoading(false);
            setTimeout(() => {
                setOMessages([]);
            }, 1000);
        }
    };

    return (
        <ChatWrapper
            user={user}
            messages={messages}
            isLoading={isLoading}
            oMessages={oMessages}
            isAiLoading={isAiLoading}
            onSubmit={handleSendMessage}
        />
    )
};

export default ChatContainer
