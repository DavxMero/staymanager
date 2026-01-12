import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const FileSchema = z.object({
    file: z
        .instanceof(File)
        .refine((file) => file.size <= 5 * 1024 * 1024, {
            message: "File size should be less than 5MB",
        })
        .refine(
            (file) =>
                ["image/jpeg", "image/png", "application/pdf"].includes(file.type),
            {
                message: "File type should be JPEG, PNG, or PDF",
            },
        ),
});

export async function POST(request: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (request.body === null) {
        return new Response("Request body is empty", { status: 400 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const validatedFile = FileSchema.safeParse({ file });

        if (!validatedFile.success) {
            const errorMessage = validatedFile.error.issues
                .map((issue) => issue.message)
                .join(", ");

            return NextResponse.json({ error: errorMessage }, { status: 400 });
        }

        const filename = file.name;
        const fileBuffer = await file.arrayBuffer();

        try {
            const filepath = `${user.id}/${Date.now()}-${filename}`;

            const { data, error } = await supabase.storage
                .from("chat-attachments")
                .upload(filepath, fileBuffer, {
                    contentType: file.type,
                    upsert: false,
                });

            if (error) {
                console.error("Supabase storage error:", error);
                return NextResponse.json({ error: "Upload failed" }, { status: 500 });
            }

            const {
                data: { publicUrl },
            } = supabase.storage.from("chat-attachments").getPublicUrl(filepath);

            return NextResponse.json({
                url: publicUrl,
                pathname: filepath,
                contentType: file.type,
            });
        } catch (error) {
            console.error("Upload error:", error);
            return NextResponse.json({ error: "Upload failed" }, { status: 500 });
        }
    } catch (error) {
        console.error("Request processing error:", error);
        return NextResponse.json(
            { error: "Failed to process request" },
            { status: 500 },
        );
    }
}
