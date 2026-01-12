import { google } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: google('gemini-2.5-flash') as any,

    system: `You are a professional hotel concierge at StayManager Hotel, a premium hospitality establishment. 

MULTILINGUAL SUPPORT:
- You MUST respond in the SAME LANGUAGE the guest uses
- Supported languages: English, Indonesian (Bahasa Indonesia), and other major languages
- Automatically detect the guest's language from their message
- Maintain the same language throughout the entire conversation
- If guest switches language, switch with them
- Default to English if language is unclear

YOUR ROLE:
- You are the digital front desk assistant, available 24/7 to help guests
- Maintain a warm, professional, and courteous tone at all times
- Use proper hospitality language (e.g., "I'd be delighted to assist you", "Certainly, sir/madam")
- Be proactive in anticipating guest needs

COMMUNICATION STYLE:
- Always greet guests warmly
- Use "we" when referring to the hotel (e.g., "We have several options available")
- Be concise but thorough - provide all necessary information without overwhelming
- Show empathy and understanding for guest requests
- Use positive language (e.g., "I'd be happy to" instead of "I can")

CORE RESPONSIBILITIES:
1. **Room Availability**: Check real-time room availability using the 'cekKetersediaan' tool
2. **Provide Information**: Offer details about room types, amenities, and rates
3. **Collect Guest Information**: ALWAYS gather complete guest details FIRST (for logged-in users)
4. **General Inquiries**: Use 'getRoomTypes' tool when guests ask about room types generally (without dates)
5. **Create Reservations**: Use 'createBooking' tool to save reservations to database (ONLY for logged-in users)

GUEST BROWSING MODE (User NOT Logged In):
- You can answer ALL questions about the hotel (facilities, amenities, location, policies)
- You can check room availability using 'cekKetersediaan' tool
- You can show room prices and types
- **CRITICAL**: If user wants to BOOK/RESERVE, you MUST say:
  "Untuk membuat reservasi, Anda perlu login terlebih dahulu. Silakan klik tombol Login di atas untuk melanjutkan booking."
- DO NOT attempt to collect guest information or create bookings for non-logged users
- DO NOT call 'createBooking' tool if user is not logged in

LOGGED-IN USER MODE (User IS Logged In):
- Follow the full booking workflow below
- Guest information may already be available from their profile
- Proceed with booking creation using 'createBooking' tool

BOOKING WORKFLOW (MUST FOLLOW IN ORDER):
**IMPORTANT: Only proceed with booking steps if user status is LOGGED IN. If GUEST, direct them to login.**

Step 1: Greet and understand guest needs (general inquiry about stay)
Step 2: **CHECK USER STATUS**:
   - If GUEST (Not Logged In): Inform them to login for booking
   - If LOGGED IN: Proceed to Step 3

Step 3: **COLLECT GUEST INFORMATION** (ONLY if LOGGED IN):
   - Full Name (required) - "May I have your full name, please?"
   - Email Address (required) - "What's your email address?"
   - Phone Number (required) - "And your phone number for contact?"
   
Step 3: Ask for stay details:
   - Check-in Date (required)
   - Check-out Date (required)  
   - Room Preferences (optional)
   - Number of Adults (required, default: 1)
   - Number of Children (optional, default: 0)
   
Step 4: Check availability using 'cekKetersediaan' tool with all collected information
Step 5: Present available room options with prices (show room cards)
Step 6: Guest selects a room
Step 7: Confirm all details with guest
Step 8: Create booking using 'createBooking' tool
Step 9: **PAYMENT OPTIONS** - Ask guest to choose:
   Option A: "Pay Now" - Guest will pay via chatbot
   Option B: "Pay Later" - Guest will pay at check-in (requires front office confirmation)
   
Step 10A: IF GUEST CHOOSES "PAY NOW":
   - Inform about payment methods:
     * Bank Transfer (BCA): 7125348238 A/n Dava Romero
     * Credit Card (mention will be processed)
     * E-Wallet (mention options)
   - Payment status is "pending" until confirmed
   - After guest confirms payment, use 'confirmPayment' tool
   - **ONLY AFTER PAYMENT CONFIRMED**: Reveal booking reference number
   - Provide full booking details with booking code
   
Step 10B: IF GUEST CHOOSES "PAY LATER":
   - DO NOT reveal booking reference/code
   - Inform guest: "Your reservation has been recorded but is PENDING CONFIRMATION"
   - Tell guest: "Please contact our front office or visit the hotel to confirm your booking and make payment"
   - Provide: Guest name, room type, check-in/out dates
   - Do NOT provide: Booking reference number
   - Status remains "pending" until front office confirms

IMPORTANT RULES:
- **CRITICAL: NO GUEST INFO = NO ROOM CARDS**:
  - You are STRICTLY FORBIDDEN from showing the \`ROOM_CARDS_JSON\` or calling \`cekKetersediaan\` until you have explicitly collected and confirmed the guest's Name, Email, and Phone.
  - If a user asks for availability, you MUST reply: "I'd be happy to check! First, may I have your name, email, and phone number?"
  - Do NOT assume you have the info unless the user has explicitly provided it in the current session.
- **NAME EXTRACTION RULES**:
  - ONLY accept names that are explicitly stated as names (e.g., "My name is John", "John Doe").
  - Do NOT extract names from general sentences like "I am interested in..." or "Tertarik dengan...".
  - If the name is ambiguous or part of a sentence, ASK for clarification: "Could you please confirm your full name?"
  - Do NOT assume the entire message content is the name.
- **NEVER show room availability until you have: Name, Email, AND Phone Number**
- **DON'T ask for dates first** - ALWAYS collect guest info FIRST when they show booking intent
- **NEVER reveal booking reference/code until payment is confirmed**
- NEVER create a booking without collecting guest information first
- ALWAYS ask for: Full Name, Email, and Phone Number BEFORE checking availability
- Flow is: Credentials → Dates → Room Options → Booking
- When guest says "I want to book" or "Check availability", IMMEDIATELY ask for their credentials
- Example: "I'd be delighted to help! Before I check our availability, may I please have your full name, email address, and phone number for the reservation?"
- NEVER make up information - always use the 'cekKetersediaan' tool to check actual availability
- Always confirm key details before proceeding with a booking
- Use Indonesian Rupiah (IDR/Rp) for all prices
- **Booking code is CONFIDENTIAL** - only share after payment confirmation
- For "pay later" bookings, clearly state that front office confirmation is required
- Only use 'confirmPayment' tool after guest explicitly confirms they have completed payment
- If you don't have specific information, politely inform the guest and offer alternatives

SAMPLE RESPONSES (After Booking Created - Pay Now):
"Excellent! Your reservation has been created successfully. 

To secure your booking and receive your booking reference number, please choose a payment method:
1. Bank Transfer to BCA 7125348238 A/n Dava Romero
2. Credit Card 
3. E-Wallet

Total Amount: Rp XXX,XXX

Once you've completed the payment, please let me know so I can confirm your booking and provide your booking reference number."

SAMPLE RESPONSES (After Booking Created - Pay Later):
"Your reservation request has been recorded! 

📋 Reservation Details:
• Guest: [Name]
• Room: [Type]
• Check-in: [Date]
• Check-out: [Date]  
• Total: Rp XXX,XXX

⚠️ Important: Your reservation is currently PENDING and requires confirmation from our front office. Please contact us or visit the hotel to confirm your booking and arrange payment.

Payment Status: Pending
Confirmation: Required by Front Office"

SAMPLE RESPONSES (After Payment Confirmed):
"🎉 Payment confirmed! Your booking is now secured.

📋 Booking Confirmation:
• Booking Reference: [CODE]
• Guest: [Name]
• Room: [Type] - Room [Number]
• Check-in: [Date]
• Check-out: [Date]
• Total Paid: Rp XXX,XXX
• Payment Method: [Method]

Please save this booking reference for check-in. See you soon!"

**IMPORTANT - ROOM CARD DISPLAY FORMAT:**
When showing available rooms after using 'cekKetersediaan' tool, you MUST include the room data in this EXACT JSON format at the END of your response:

ROOM_CARDS_JSON:{\"rooms\":[{\"id\":\"room-id\",\"number\":\"101\",\"type\":\"Deluxe Room\",\"base_price\":250000}]}

Example full response:
"Tentu, dengan senang hati saya akan membantu Anda. Untuk besok, tanggal 2 Desember 2025, hingga tanggal 3 Desember 2025, kami memiliki beberapa pilihan kamar yang tersedia:

ROOM_CARDS_JSON:{\"rooms\":[{\"id\":\"abc-123\",\"number\":\"101\",\"type\":\"Kamar Standard\",\"base_price\":200000},{\"id\":\"def-456\",\"number\":\"103\",\"type\":\"Kamar Deluxe\",\"base_price\":250000}]}

Silakan pilih kamar yang Anda inginkan dengan mengklik tombol \"Book This Room\" pada card."

Rules for ROOM_CARDS_JSON:
- MUST be placed at the very END of your message
- MUST start with exactly "ROOM_CARDS_JSON:" (no spaces before)
- MUST be valid JSON with "rooms" array
- Each room MUST have: id, number, type, base_price
- Use the EXACT data from 'cekKetersediaan' tool response
- This allows the widget to render interactive room cards

Today's date is ${new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}.

Remember: You represent the hotel's commitment to excellence. Every interaction should leave the guest feeling valued and well-cared for. NEVER reveal booking codes before payment confirmation. NEVER proceed to booking without complete guest information. ALWAYS include ROOM_CARDS_JSON when showing available rooms.

INTERACTIVE UI COMPONENTS (CRITICAL):
To provide the best user experience, you MUST trigger interactive UI components by appending specific JSON markers to your response when appropriate.

1. **Guest Information Form**:
   - Show this when asking for guest details (Name, Email, Phone).
   - Format: \`SHOW_GUEST_FORM_JSON:{"guestName":"","guestEmail":"","guestPhone":""}\`
   - If you already know some info, pre-fill it.

3. **Date Selection**:
   - Show this when asking for check-in/out dates.
   - Format: \`SHOW_DATE_SELECTOR_JSON:{"checkIn":"","checkOut":"","adults":1,"children":0}\`

4. **Payment Options**:
   - Show this when asking for payment (Step 9).
   - Format: \`SHOW_PAYMENT_OPTIONS_JSON:{"totalAmount":1500000}\` (Replace with actual total)

Example of combining text and UI:
"I'd be happy to help you with your booking! First, could you please provide your contact details?
SHOW_GUEST_FORM_JSON:{\"guestName\":\"\",\"guestEmail\":\"\",\"guestPhone\":\"\"}"`,
    messages,
    tools: {
      cekKetersediaan: tool({
        description: 'Check real-time room availability in the hotel database for specified dates. Use this tool whenever a guest inquires about available rooms.',
        parameters: z.object({
          checkIn: z.string().describe('Check-in date in YYYY-MM-DD format (e.g., 2025-12-25)'),
          checkOut: z.string().describe('Check-out date in YYYY-MM-DD format (e.g., 2025-12-26)'),
          tipeKamar: z.string().optional().describe('Optional: Specific room type filter (e.g., "Standard", "Deluxe", "Suite")'),
        }),
        execute: async ({ checkIn, checkOut, tipeKamar }) => {
          console.log(`🔎 Checking: ${checkIn} - ${checkOut}`);

          const { data: busyBookings, error: busyError } = await supabase
            .from('reservations')
            .select('room_id')
            .not('status', 'in', '("cancelled","no_show")')
            .lt('check_in', checkOut)
            .gt('check_out', checkIn);

          if (busyError) {
            console.error(busyError);
            return {
              status: 'error',
              message: 'Terjadi kesalahan sistem database.'
            };
          }

          const busyRoomIds = busyBookings?.map((b) => b.room_id) || [];

          let query = supabase
            .from('rooms')
            .select('id, number, type, base_price')
            .eq('status', 'available');

          if (busyRoomIds.length > 0) {
            query = query.not('id', 'in', `(${busyRoomIds.join(',')})`);
          }

          if (tipeKamar) {
            query = query.ilike('type', `%${tipeKamar}%`);
          }

          const { data: availableRooms } = await query;

          if (!availableRooms || availableRooms.length === 0) {
            return {
              status: 'unavailable',
              message: 'Tidak ada kamar tersedia untuk tanggal tersebut.'
            };
          }

          return {
            status: 'available',
            rooms: availableRooms
          };
        },
      }),

      createBooking: tool({
        description: 'Create a new reservation in the database after collecting all required guest information. Only use this after confirming all details with the guest.',
        parameters: z.object({
          guestName: z.string().describe('Full name of the guest (required)'),
          guestEmail: z.string().email().describe('Email address of the guest (required)'),
          guestPhone: z.string().describe('Phone number of the guest (required)'),
          roomId: z.string().uuid().describe('UUID of the selected room'),
          roomNumber: z.string().describe('Room number (e.g., "101")'),
          roomType: z.string().describe('Room type (e.g., "Standard", "Deluxe")'),
          checkIn: z.string().describe('Check-in date in YYYY-MM-DD format'),
          checkOut: z.string().describe('Check-out date in YYYY-MM-DD format'),
          adults: z.number().default(1).describe('Number of adults (default: 1)'),
          children: z.number().default(0).describe('Number of children (default: 0)'),
          roomRate: z.number().describe('Room rate per night'),
          notes: z.string().optional().describe('Special requests or notes from guest'),
          breakfastIncluded: z.boolean().default(false).describe('Whether breakfast is included'),
        }),
        execute: async (bookingData) => {
          try {
            const bookingRef = `BK${Date.now().toString().slice(-8)}`;
            const bookingId = `BOOK-${Date.now()}`;

            const checkInDate = new Date(bookingData.checkIn);
            const checkOutDate = new Date(bookingData.checkOut);
            const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

            const roomTotal = bookingData.roomRate * nights;
            const breakfastPrice = bookingData.breakfastIncluded ? 50000 : 0;
            const breakfastPax = bookingData.breakfastIncluded ? (bookingData.adults + bookingData.children) : 0;
            const breakfastTotal = breakfastPrice * breakfastPax * nights;
            const totalAmount = roomTotal + breakfastTotal;

            const { data: existingGuest } = await supabase
              .from('guests')
              .select('id')
              .eq('email', bookingData.guestEmail)
              .single();

            let guestId = existingGuest?.id;

            if (!guestId) {
              const { data: newGuest, error: guestError } = await supabase
                .from('guests')
                .insert({
                  full_name: bookingData.guestName,
                  email: bookingData.guestEmail,
                  phone: bookingData.guestPhone,
                })
                .select('id')
                .single();

              if (guestError) {
                console.error('Guest creation error:', guestError);
                return {
                  success: false,
                  error: `Failed to create guest: ${guestError.message}`,
                };
              }

              guestId = newGuest.id;
            }

            const { data: reservation, error } = await supabase
              .from('reservations')
              .insert({
                booking_id: bookingId,
                booking_reference: bookingRef,
                guest_id: guestId,
                guest_name: bookingData.guestName,
                guest_email: bookingData.guestEmail,
                guest_phone: bookingData.guestPhone,
                room_id: bookingData.roomId,
                room_number: bookingData.roomNumber,
                room_type: bookingData.roomType,
                check_in: bookingData.checkIn,
                check_out: bookingData.checkOut,
                adults: bookingData.adults,
                children: bookingData.children,
                guest_count: bookingData.adults + bookingData.children,
                room_rate: bookingData.roomRate,
                room_total: roomTotal,
                breakfast_included: bookingData.breakfastIncluded,
                breakfast_pax: breakfastPax,
                breakfast_price: breakfastPrice,
                breakfast_total: breakfastTotal,
                total_amount: totalAmount,
                total_price: totalAmount,
                status: 'confirmed',
                payment_status: 'pending',
                notes: bookingData.notes || null,
              })
              .select()
              .single();

            if (error) {
              console.error('Booking creation error:', error);
              return {
                success: false,
                error: `Failed to create booking: ${error.message}`,
              };
            }

            return {
              success: true,
              bookingReference: bookingRef,
              bookingId: bookingId,
              reservationId: reservation.id,
              guestName: bookingData.guestName,
              roomNumber: bookingData.roomNumber,
              roomType: bookingData.roomType,
              checkIn: bookingData.checkIn,
              checkOut: bookingData.checkOut,
              nights: nights,
              totalAmount: totalAmount,
              status: 'confirmed',
              paymentStatus: 'pending',
              message: 'Reservation created successfully. Awaiting payment confirmation to provide booking reference.',
            };
          } catch (err: any) {
            console.error('Unexpected error:', err);
            return {
              success: false,
              error: `Unexpected error: ${err.message}`,
            };
          }
        },
      }),

      getRoomTypes: tool({
        description: 'Get a list of all available room types and their starting prices. Use this when a guest asks generally about what rooms are available (without specific dates) or wants to know the room categories.',
        parameters: z.object({}),
        execute: async () => {
          try {
            const { data: rooms, error } = await supabase
              .from('rooms')
              .select('type, base_price')
              .order('base_price', { ascending: true });

            if (error) {
              console.error('Error fetching room types:', error);
              return {
                status: 'error',
                message: 'Failed to fetch room types.'
              };
            }

            if (!rooms || rooms.length === 0) {
              return {
                status: 'empty',
                message: 'No rooms found in the system.'
              };
            }

            const roomTypesMap = new Map();

            rooms.forEach(room => {
              if (!roomTypesMap.has(room.type)) {
                roomTypesMap.set(room.type, {
                  type: room.type,
                  startPrice: room.base_price,
                  count: 1
                });
              } else {
                const current = roomTypesMap.get(room.type);
                if (room.base_price < current.startPrice) {
                  current.startPrice = room.base_price;
                }
                current.count++;
              }
            });

            const roomTypes = Array.from(roomTypesMap.values());

            return {
              status: 'success',
              roomTypes: roomTypes
            };
          } catch (err: any) {
            console.error('Unexpected error in getRoomTypes:', err);
            return {
              status: 'error',
              message: `Unexpected error: ${err.message}`
            };
          }
        },
      }),

      confirmPayment: tool({
        description: 'Confirm payment for a reservation after guest has completed payment. Use the booking reference to identify the reservation.',
        parameters: z.object({
          bookingReference: z.string().describe('Booking reference number (e.g., BK12345678)'),
          paymentMethod: z.string().optional().describe('Payment method used (e.g., "Credit Card", "Bank Transfer", "Cash")'),
          paymentAmount: z.number().optional().describe('Amount paid'),
        }),
        execute: async ({ bookingReference, paymentMethod, paymentAmount }) => {
          try {
            const { data: reservation, error: fetchError } = await supabase
              .from('reservations')
              .select('*')
              .eq('booking_reference', bookingReference)
              .single();

            if (fetchError || !reservation) {
              console.error('Payment confirmation error:', fetchError);
              return {
                success: false,
                error: `Booking reference not found: ${fetchError?.message || 'Not found'}`,
              };
            }

            const actualPaymentAmount = paymentAmount || reservation.total_amount;
            const actualPaymentMethod = paymentMethod || 'Bank Transfer';

            const { error: paymentError } = await supabase
              .from('payments')
              .insert({
                reservation_id: reservation.id,
                amount: actualPaymentAmount,
                payment_method: actualPaymentMethod,
                payment_date: new Date().toISOString(),
                transaction_id: `TRX-${Date.now()}-${actualPaymentMethod.replace(/\s/g, '').toUpperCase()}`,
              });

            if (paymentError) {
              console.error('Payment record creation error:', paymentError);
              return {
                success: false,
                error: `Failed to create payment record: ${paymentError.message}`,
              };
            }

            const { error: updateError } = await supabase
              .from('reservations')
              .update({
                payment_status: 'paid',
                updated_at: new Date().toISOString(),
              })
              .eq('booking_reference', bookingReference);

            if (updateError) {
              console.error('Reservation update error:', updateError);
              return {
                success: false,
                error: `Failed to update reservation: ${updateError.message}`,
              };
            }

            return {
              success: true,
              bookingReference: reservation.booking_reference,
              paymentStatus: 'paid',
              paymentMethod: actualPaymentMethod,
              amount: actualPaymentAmount,
              message: '🎉 Payment confirmed! Booking is now secured. You can now provide the booking reference to the guest.',
              guestName: reservation.guest_name,
              roomNumber: reservation.room_number,
              roomType: reservation.room_type,
              checkIn: reservation.check_in,
              checkOut: reservation.check_out,
              totalAmount: reservation.total_amount,
            };
          } catch (err: any) {
            console.error('Unexpected error:', err);
            return {
              success: false,
              error: `Unexpected error: ${err.message}`,
            };
          }
        },
      }),
    },
    maxSteps: 5,
  });

  return result.toDataStreamResponse();
}
