import { getChatHistory } from '@/lib/ai-chat-utils';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return new Response('Missing chat ID', { status: 400 });
    }

    try {
        const messages = await getChatHistory(id);
        return Response.json(messages);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
