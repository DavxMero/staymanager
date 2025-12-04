// src/lib/groq-service.ts
import { hotelContext } from './hotel-context';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = 'llama-3.1-8b-instant'; // Groq's fastest Llama 3.1 model

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqResponse {
  choices: [{
    message: {
      content: string;
    };
  }];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function getGroqAIResponse(
  messages: GroqMessage[], 
  userContext?: { type: 'guest' | 'staff' | 'visitor', roomNumber?: string, staffRole?: string }
): Promise<string> {
  try {
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    // Format hotel information
    const hotelInfo = [
      "Hotel Information:",
      `Name: ${hotelContext.name}`,
      `Address: ${hotelContext.address}`,
      `Phone: ${hotelContext.phone}`,
      `Check-in Time: ${hotelContext.checkinTime}`,
      `Check-out Time: ${hotelContext.checkoutTime}`,
      "",
      "Room Types and Prices:",
      ...hotelContext.roomTypes.map(room => `- ${room.name}: ${room.price}`),
      "",
      "Facilities:",
      ...hotelContext.facilities.map(facility => `- ${facility}`),
      "",
      "Hotel Policies:",
      ...hotelContext.policies.map(policy => `- ${policy}`)
    ].join('\n');

    // Create system message based on user context
    let systemMessage = "You are a helpful hotel assistant for StayManager Hotel.";
    
    switch (userContext?.type) {
      case 'guest':
        systemMessage = `You are a hotel concierge assistant for StayManager Hotel. You help guests with:
- Room service orders
- Facility information and hours
- Check-in/check-out assistance
- Local area recommendations
- Handling complaints and requests
- General hotel information

${userContext.roomNumber ? `The guest is staying in Room ${userContext.roomNumber}.` : ''}
Be professional, friendly, and helpful. Respond in Indonesian or English based on the guest's language.`;
        break;
        
      case 'staff':
        systemMessage = `You are a hotel management assistant for StayManager Hotel staff. You help with:
- Room status and availability
- Guest information lookup
- Reservation management
- Operational tasks
- Revenue and occupancy reports
- Staff scheduling
- Maintenance requests

${userContext.staffRole ? `The user is a ${userContext.staffRole}.` : ''}
Provide concise, action-oriented responses with specific data when available.`;
        break;
        
      default: // visitor
        systemMessage = `You are a hotel information assistant for StayManager Hotel. You help visitors with:
- Room availability and booking information
- Hotel facilities and amenities
- Location and contact information
- Local area attractions
- Pricing and packages
- General inquiries

Be welcoming and informative to encourage bookings.`;
    }

    // Prepare messages for Groq
    const systemMessages: GroqMessage[] = [
      {
        role: 'system',
        content: `${systemMessage}\n\n${hotelInfo}`
      },
      ...messages
    ];

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: systemMessages,
        temperature: 0.3, // Lower temperature for more consistent responses
        max_tokens: 1024,
        top_p: 0.9,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Groq API error:', response.status, errorData);
      throw new Error(`Groq API error: ${response.status} - ${errorData}`);
    }

    const data: GroqResponse = await response.json();
    return data.choices[0]?.message?.content?.trim() || 'I apologize, but I encountered an issue. Please try again.';

  } catch (error) {
    console.error('Error getting AI response from Groq:', error);
    throw new Error('Failed to get response from AI service');
  }
}

// Streaming version for real-time responses
export async function getGroqAIResponseStream(
  messages: GroqMessage[],
  userContext?: { type: 'guest' | 'staff' | 'visitor', roomNumber?: string, staffRole?: string }
): Promise<ReadableStream> {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  // Same system message setup as above
  const hotelInfo = [
    "Hotel Information:",
    `Name: ${hotelContext.name}`,
    `Address: ${hotelContext.address}`,
    `Phone: ${hotelContext.phone}`,
    `Check-in Time: ${hotelContext.checkinTime}`,
    `Check-out Time: ${hotelContext.checkoutTime}`,
    "",
    "Room Types and Prices:",
    ...hotelContext.roomTypes.map(room => `- ${room.name}: ${room.price}`),
    "",
    "Facilities:",
    ...hotelContext.facilities.map(facility => `- ${facility}`),
    "",
    "Hotel Policies:",
    ...hotelContext.policies.map(policy => `- ${policy}`)
  ].join('\n');

  let systemMessage = "You are a helpful hotel assistant for StayManager Hotel.";
  
  switch (userContext?.type) {
    case 'guest':
      systemMessage = `You are a hotel concierge assistant for StayManager Hotel.
${userContext.roomNumber ? `The guest is staying in Room ${userContext.roomNumber}.` : ''}
Be professional, friendly, and helpful. Respond in Indonesian or English based on the guest's language.`;
      break;
    case 'staff':
      systemMessage = `You are a hotel management assistant for StayManager Hotel staff.
${userContext.staffRole ? `The user is a ${userContext.staffRole}.` : ''}
Provide concise, action-oriented responses.`;
      break;
    default:
      systemMessage = `You are a hotel information assistant for StayManager Hotel. Be welcoming and informative.`;
  }

  const systemMessages: GroqMessage[] = [
    {
      role: 'system',
      content: `${systemMessage}\n\n${hotelInfo}`
    },
    ...messages
  ];

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: systemMessages,
      temperature: 0.3,
      max_tokens: 1024,
      top_p: 0.9,
      stream: true
    })
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  return response.body!;
}

// Simple chat function for quick testing
export async function sendGroqChatMessage(
  userMessage: string,
  userContext?: { type: 'guest' | 'staff' | 'visitor', roomNumber?: string, staffRole?: string }
): Promise<string> {
  const messages: GroqMessage[] = [
    {
      role: 'user',
      content: userMessage
    }
  ];

  return await getGroqAIResponse(messages, userContext);
}