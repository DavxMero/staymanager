import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getServerUserContext, hasPermission } from "@/lib/auth/server-permissions";

const ImageSchema = z.object({
    file: z
        .instanceof(File)
        .refine((file) => file.size <= 5 * 1024 * 1024, {
            message: "File size should be less than 5MB",
        })
        .refine(
            (file) =>
                ["image/jpeg", "image/png", "image/webp"].includes(file.type),
            {
                message: "File type should be JPEG, PNG, or WebP",
            },
        ),
});

export async function POST(request: Request) {
    const ctx = await getServerUserContext(request);
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!hasPermission(ctx, "rooms")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const supabase = await createClient();

    if (request.body === null) {
        return new Response("Request body is empty", { status: 400 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const roomId = (formData.get("roomId") as string) || "unassigned";

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const validated = ImageSchema.safeParse({ file });
        if (!validated.success) {
            const errorMessage = validated.error.issues
                .map((issue) => issue.message)
                .join(", ");
            return NextResponse.json({ error: errorMessage }, { status: 400 });
        }

        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const filepath = `${roomId}/${Date.now()}.${ext}`;
        const buffer = await file.arrayBuffer();

        const { error: uploadError } = await supabase.storage
            .from("room-images")
            .upload(filepath, buffer, {
                contentType: file.type,
                upsert: false,
            });

        if (uploadError) {
            console.error("Supabase storage error:", uploadError);
            return NextResponse.json({ error: "Upload failed" }, { status: 500 });
        }

        const {
            data: { publicUrl },
        } = supabase.storage.from("room-images").getPublicUrl(filepath);

        return NextResponse.json({
            url: publicUrl,
            pathname: filepath,
            contentType: file.type,
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Failed to process request" },
            { status: 500 },
        );
    }
}
