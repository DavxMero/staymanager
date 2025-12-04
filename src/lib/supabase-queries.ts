import "server-only";

import { createClient } from "@/lib/supabase/server";
import { Message } from "ai";

// =====================================================
// Chat Functions
// =====================================================

export async function saveChat({
    id,
    messages,
    userId,
}: {
    id: string;
    messages: any;
    userId: string;
}) {
    try {
        const supabase = await createClient();

        // Check if chat exists
        const { data: existingChat } = await supabase
            .from("Chat")
            .select("id")
            .eq("id", id)
            .single();

        if (existingChat) {
            // Update existing chat
            const { error } = await supabase
                .from("Chat")
                .update({
                    messages: messages,
                })
                .eq("id", id);

            if (error) throw error;
        } else {
            // Insert new chat
            const { error } = await supabase.from("Chat").insert({
                id,
                created_at: new Date().toISOString(),
                messages: messages,
                user_id: userId,
            });

            if (error) throw error;
        }
    } catch (error) {
        console.error("Failed to save chat in database:", error);
        throw error;
    }
}

export async function deleteChatById({ id }: { id: string }) {
    try {
        const supabase = await createClient();

        const { error } = await supabase.from("Chat").delete().eq("id", id);

        if (error) throw error;
    } catch (error) {
        console.error("Failed to delete chat by id from database:", error);
        throw error;
    }
}

export async function getChatsByUserId({ id }: { id: string }) {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("Chat")
            .select("*")
            .eq("user_id", id)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error("Failed to get chats by user from database:", error);
        throw error;
    }
}

export async function getChatById({ id }: { id: string }) {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("Chat")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;

        return data;
    } catch (error) {
        console.error("Failed to get chat by id from database:", error);
        throw error;
    }
}

// =====================================================
// Reservation Functions
// =====================================================

export async function createReservation({
    id,
    userId,
    details,
}: {
    id: string;
    userId: string;
    details: any;
}) {
    try {
        const supabase = await createClient();

        const { error } = await supabase.from("Reservation").insert({
            id,
            created_at: new Date().toISOString(),
            user_id: userId,
            has_completed_payment: false,
            details: details,
        });

        if (error) throw error;
    } catch (error) {
        console.error("Failed to create reservation:", error);
        throw error;
    }
}

export async function getReservationById({ id }: { id: string }) {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("Reservation")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;

        return data;
    } catch (error) {
        console.error("Failed to get reservation by id:", error);
        throw error;
    }
}

export async function updateReservation({
    id,
    hasCompletedPayment,
}: {
    id: string;
    hasCompletedPayment: boolean;
}) {
    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from("Reservation")
            .update({
                has_completed_payment: hasCompletedPayment,
            })
            .eq("id", id);

        if (error) throw error;
    } catch (error) {
        console.error("Failed to update reservation:", error);
        throw error;
    }
}

// =====================================================
// Type Definitions
// =====================================================

export type Chat = {
    id: string;
    created_at: string;
    messages: Array<Message>;
    user_id: string;
};

export type Reservation = {
    id: string;
    created_at: string;
    details: any;
    has_completed_payment: boolean;
    user_id: string;
};
