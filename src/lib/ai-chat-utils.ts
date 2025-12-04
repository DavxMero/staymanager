import { supabase } from './supabaseClient';
import { CoreMessage } from 'ai';

export interface Chat {
    id: string;
    title: string;
    user_id: string | null;
    created_at: string;
    updated_at: string;
}

export async function saveChat(chat: { id: string; title: string; user_id?: string }) {
    const { error } = await supabase
        .from('ai_chats')
        .upsert({
            id: chat.id,
            title: chat.title,
            user_id: chat.user_id || null,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

    if (error) {
        console.error('Error saving chat:', error);
        throw error;
    }
}

export async function saveMessages(chatId: string, messages: CoreMessage[]) {
    if (!messages.length) return;

    const rows = messages.map(msg => {
        // Handle content - can be string or array of parts
        let content: string;
        if (typeof msg.content === 'string') {
            content = msg.content;
        } else if (Array.isArray(msg.content)) {
            // For array content (parts), extract text from text parts
            content = msg.content
                .filter((part: any) => part.type === 'text')
                .map((part: any) => part.text)
                .join('\n');
        } else {
            content = JSON.stringify(msg.content);
        }

        // Get message ID - validate if UUID, otherwise generate new one
        const messageId = (msg as any).id;
        const validUUID = messageId && messageId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

        return {
            id: validUUID ? messageId : crypto.randomUUID(),
            chat_id: chatId,
            role: msg.role,
            content: content,
            // @ts-ignore
            created_at: (msg as any).createdAt ? new Date((msg as any).createdAt).toISOString() : new Date().toISOString(),
        };
    });

    const { error } = await supabase
        .from('ai_messages')
        .upsert(rows, { onConflict: 'id' });

    if (error) {
        console.error('Error saving messages:', error);
        throw error;
    }
}

export async function getChatHistory(chatId: string): Promise<CoreMessage[]> {
    const { data, error } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

    if (error) throw error;

    return data.map(row => ({
        id: row.id,
        role: row.role as 'user' | 'assistant' | 'system' | 'tool',
        content: row.content,
        createdAt: new Date(row.created_at),
    } as any as CoreMessage));
}

export async function getChats(userId?: string): Promise<Chat[]> {
    let query = supabase
        .from('ai_chats')
        .select('*')
        .order('updated_at', { ascending: false });

    if (userId) {
        query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as Chat[];
}
