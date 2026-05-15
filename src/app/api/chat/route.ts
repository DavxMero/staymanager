import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { streamText, tool, type LanguageModelV1 } from 'ai';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Parse comma-separated API keys dari env var → bisa pakai banyak key untuk multiply rate limit
// Contoh: GOOGLE_GENERATIVE_AI_API_KEY="key1,key2,key3" → effective 3×20 = 60 req/min
function parseKeys(envValue: string | undefined): string[] {
  if (!envValue) return [];
  return envValue.split(',').map((s) => s.trim()).filter(Boolean);
}

// Round-robin counter (module-level state, persistent across requests dalam 1 Vercel function instance)
let geminiCounter = 0;
let groqCounter = 0;

function pickKey(keys: string[], counter: 'gemini' | 'groq'): string | null {
  if (keys.length === 0) return null;
  if (counter === 'gemini') {
    const key = keys[geminiCounter % keys.length];
    geminiCounter++;
    return key;
  } else {
    const key = keys[groqCounter % keys.length];
    groqCounter++;
    return key;
  }
}

// Pilih provider sesuai modelId — return configError kalau env var provider-nya tidak ada.
// Support multi-key round-robin: set GOOGLE_GENERATIVE_AI_API_KEY="key1,key2" untuk 2x rate limit.
function resolveModel(modelId: string): { model: LanguageModelV1; configError: string | null } | null {
  switch (modelId) {
    case 'gemini-2.5-flash': {
      const keys = parseKeys(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
      const key = pickKey(keys, 'gemini');
      if (!key) {
        return { model: null as any, configError: 'GOOGLE_GENERATIVE_AI_API_KEY tidak terpasang di environment' };
      }
      const google = createGoogleGenerativeAI({ apiKey: key });
      return { model: google('gemini-2.5-flash') as unknown as LanguageModelV1, configError: null };
    }
    case 'llama-3.1-8b-instant': {
      const keys = parseKeys(process.env.GROQ_API_KEY);
      const key = pickKey(keys, 'groq');
      if (!key) {
        return { model: null as any, configError: 'GROQ_API_KEY tidak terpasang di environment' };
      }
      const groq = createGroq({ apiKey: key });
      return { model: groq('llama-3.1-8b-instant') as unknown as LanguageModelV1, configError: null };
    }
    case 'llama-3.3-70b-versatile':
    default: {
      // Default: Groq Llama 3.3 70B (gratis, lebih cepat dari Gemini, rate-limit lebih tinggi)
      const keys = parseKeys(process.env.GROQ_API_KEY);
      const key = pickKey(keys, 'groq');
      if (!key) {
        return { model: null as any, configError: 'GROQ_API_KEY tidak terpasang di environment' };
      }
      const groq = createGroq({ apiKey: key });
      return { model: groq('llama-3.3-70b-versatile') as unknown as LanguageModelV1, configError: null };
    }
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const maxDuration = 60;

export async function POST(req: Request) {
  let messages, userContext, modelId: string;
  try {
    const body = await req.json();
    messages = body.messages;
    userContext = body.userContext;
    modelId = body.model || 'llama-3.3-70b-versatile';
  } catch (parseErr) {
    console.error('[/api/chat] Failed to parse request body:', parseErr);
    return new Response(
      JSON.stringify({ error: 'Invalid request body. Mohon kirim JSON valid.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const resolved = resolveModel(modelId);
  if (!resolved || resolved.configError) {
    const errMsg = resolved?.configError || `Model "${modelId}" tidak didukung.`;
    console.error('[/api/chat]', errMsg);
    return new Response(
      JSON.stringify({ error: `Konfigurasi server tidak lengkap: ${errMsg}` }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    );
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(
      JSON.stringify({ error: 'Tidak ada pesan untuk diproses.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const userContextSection = userContext?.isLoggedIn
    ? `\n\nUSER CONTEXT (this conversation):
- Login status: LOGGED IN
- Name from profile: ${userContext.fullName || '(empty)'}
- Email from profile: ${userContext.email || '(empty)'}
- Phone from profile: ${userContext.phone || '(empty)'}
- Action: Use these values to PRE-FILL guest info — do NOT ask name/email again, just confirm. Ask phone politely once if empty, then proceed.\n`
    : `\n\nUSER CONTEXT (this conversation):
- Login status: NOT LOGGED IN (anonymous browsing)
- Action: For any booking request, emit SHOW_LOGIN_PROMPT_JSON marker (see GUEST BROWSING MODE rules below). Do NOT call createBooking.\n`;

  let result;
  try {
    result = await streamText({
    model: resolved.model,
    // Hindari retry otomatis pada 429 — Gemini free tier 20 req/min, retry justru menghabiskan quota tanpa hasil
    // dan bikin error "Failed after 3 attempts". Biarkan user retry manual via countdown di UI.
    maxRetries: 0,

    system: `You are StayManager Hotel's AI concierge. Warm, concise, professional.${userContextSection}

LANGUAGE: Reply in the guest's language (default Indonesian, follow if they switch).

TOOLS:
- cekKetersediaan(checkIn, checkOut, tipeKamar?): real availability for date range
- getRoomTypes(): list room types + starting prices (for general inquiry, no dates)
- createBooking(...): save reservation (LOGGED-IN ONLY)
- confirmPayment(bookingReference, ...): mark paid, unlocks booking code

GUEST (NOT logged in):
- Can answer hotel info + call cekKetersediaan/getRoomTypes
- If they want to BOOK: reply briefly + emit "SHOW_LOGIN_PROMPT_JSON:{\"reason\":\"membuat reservasi\"}" at end. Do NOT call createBooking.

LOGGED-IN:
- Name/email already known from USER CONTEXT. Don't re-ask; confirm only.
- Phone optional — ask once if missing, then proceed.

BOOKING FLOW (logged-in):
1. Collect/confirm dates + adults/children → use SHOW_DATE_SELECTOR_JSON if helpful
2. cekKetersediaan(checkIn, checkOut) → present rooms as ROOM_CARDS_JSON
3. After guest picks room → confirm details → createBooking
4. Ask payment via SHOW_PAYMENT_OPTIONS_JSON:{"totalAmount":NNN}
   - Pay Now: list BCA 7125348238 a.n. Dava Romero / CC / E-Wallet. After guest confirms payment → confirmPayment → REVEAL booking reference.
   - Pay Later: status pending, instruct visit front office. DO NOT reveal booking reference.

JSON MARKERS (append at END of message, only when relevant):
- ROOM_CARDS_JSON:{"rooms":[{"id","number","type","base_price","image_url","images","amenities","max_occupancy","room_size","bed_configuration","description"}]} — use EXACT data from cekKetersediaan result (null/[] for missing fields, never omit)
- SHOW_GUEST_FORM_JSON:{"guestName":"","guestEmail":"","guestPhone":""}
- SHOW_DATE_SELECTOR_JSON:{"checkIn":"","checkOut":"","adults":1,"children":0}
- SHOW_PAYMENT_OPTIONS_JSON:{"totalAmount":NNN}
- SHOW_LOGIN_PROMPT_JSON:{"reason":"..."}

HARD RULES:
- Prices in Rupiah (Rp)
- NEVER reveal booking reference before payment confirmed
- NEVER invent room data — always cekKetersediaan first
- ROOM_CARDS_JSON must be valid JSON at the very end of the message

Today: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`,
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
            .select('id, number, type, base_price, image_url')
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

          // Enrich with custom_room_types metadata, joined by name (no FK exists)
          const uniqueTypes = Array.from(new Set(availableRooms.map((r) => r.type)));
          const { data: typeMeta } = await supabase
            .from('custom_room_types')
            .select('name, images, amenities, max_occupancy, room_size, bed_configuration, description')
            .in('name', uniqueTypes);

          const metaByName = new Map(
            (typeMeta || []).map((t: Record<string, unknown>) => [t.name as string, t]),
          );

          const enrichedRooms = availableRooms.map((r) => {
            const ct = (metaByName.get(r.type) ?? {}) as Record<string, unknown>;
            const typeImages = Array.isArray(ct.images) ? (ct.images as string[]) : [];
            const allImages = [r.image_url, ...typeImages].filter(Boolean) as string[];
            return {
              id: r.id,
              number: r.number,
              type: r.type,
              base_price: r.base_price,
              image_url: r.image_url || typeImages[0] || null,
              images: Array.from(new Set(allImages)),
              amenities: Array.isArray(ct.amenities) ? ct.amenities : [],
              max_occupancy: ct.max_occupancy ?? null,
              room_size: ct.room_size ?? null,
              bed_configuration: ct.bed_configuration ?? null,
              description: ct.description ?? null,
            };
          });

          return {
            status: 'available',
            rooms: enrichedRooms
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
    // Turunkan dari 5 → 3 untuk hemat quota Gemini free tier: 1 user message bisa = up to N tool round-trip.
    // 3 cukup untuk pola umum: (1) detect intent → (2) call cekKetersediaan/createBooking → (3) compose reply.
    maxSteps: 3,
  });
  } catch (initErr) {
    console.error('[/api/chat] streamText init failed:', initErr);
    const message = initErr instanceof Error ? initErr.message : 'Unknown init error';
    return new Response(
      JSON.stringify({ error: `Inisialisasi LLM gagal: ${message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  try {
    return result.toDataStreamResponse({
      getErrorMessage: (error) => {
        console.error('[/api/chat] streaming error:', error);
        const message = error instanceof Error ? error.message : String(error);
        return `Streaming gagal: ${message}`;
      },
    });
  } catch (streamErr) {
    console.error('[/api/chat] toDataStreamResponse fatal:', streamErr);
    const message = streamErr instanceof Error ? streamErr.message : 'Unknown streaming error';
    return new Response(
      JSON.stringify({ error: `Streaming gagal: ${message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
