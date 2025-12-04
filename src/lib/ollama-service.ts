// src/lib/ollama-service.ts
import { hotelContext } from './hotel-context';

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';

interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export async function getAIResponse(prompt: string, systemMessage?: string): Promise<string> {
  try {
    // Format prompt dengan system message dan context hotel jika ada
    const hotelInfo = [
      "Hotel Information:",
      "Name: " + hotelContext.name,
      "Address: " + hotelContext.address,
      "Phone: " + hotelContext.phone,
      "Check-in Time: " + hotelContext.checkinTime,
      "Check-out Time: " + hotelContext.checkoutTime,
      "",
      "Room Types and Prices:",
      ...hotelContext.roomTypes.map(room => "- " + room.name + ": " + room.price),
      "",
      "Facilities:",
      ...hotelContext.facilities.map(facility => "- " + facility),
      "",
      "Hotel Policies:",
      ...hotelContext.policies.map(policy => "- " + policy)
    ].join('\n');

    const fullPrompt = systemMessage 
      ? systemMessage + "\n\n" + hotelInfo + "\n\nUser: " + prompt + "\nAssistant:"
      : hotelInfo + "\n\nUser: " + prompt + "\nAssistant:";

    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature: 0.3, // Reduced temperature for more factual responses
          top_p: 0.9,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data: OllamaResponse = await response.json();
    return data.response.trim();
  } catch (error) {
    console.error('Error getting AI response from Ollama:', error);
    throw new Error('Failed to get response from AI service');
  }
}

// New function to support streaming responses
export async function getAIResponseStream(prompt: string, systemMessage?: string) {
  try {
    // Format prompt dengan system message dan context hotel jika ada
    const hotelInfo = [
      "Hotel Information:",
      "Name: " + hotelContext.name,
      "Address: " + hotelContext.address,
      "Phone: " + hotelContext.phone,
      "Check-in Time: " + hotelContext.checkinTime,
      "Check-out Time: " + hotelContext.checkoutTime,
      "",
      "Room Types and Prices:",
      ...hotelContext.roomTypes.map(room => "- " + room.name + ": " + room.price),
      "",
      "Facilities:",
      ...hotelContext.facilities.map(facility => "- " + facility),
      "",
      "Hotel Policies:",
      ...hotelContext.policies.map(policy => "- " + policy)
    ].join('\n');

    const fullPrompt = systemMessage 
      ? systemMessage + "\n\n" + hotelInfo + "\n\nUser: " + prompt + "\nAssistant:"
      : hotelInfo + "\n\nUser: " + prompt + "\nAssistant:";

    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: fullPrompt,
        stream: true, // Enable streaming
        options: {
          temperature: 0.3,
          top_p: 0.9,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error('Error getting AI response stream from Ollama:', error);
    throw new Error('Failed to get response stream from AI service');
  }
}

// Fungsi untuk mengirim pesan ke endpoint API Next.js (jika diperlukan nanti)
export async function sendChatMessage(messages: Array<{role: string, content: string}>) {
  try {
    // Gabungkan pesan untuk model completion
    const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    
    return await getAIResponse(prompt);
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}