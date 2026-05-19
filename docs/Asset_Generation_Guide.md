# Asset Generation Guide — StayManager Skripsi

> **Tujuan**: panduan generate / re-generate aset gambar skripsi dengan kualitas HD oleh user (manual), bukan oleh agent.
> **Last sync**: 2026-05-17 (HEAD `5458862` + uncommitted 2026-05-16 chatbot UX overhaul)
> **Konteks**: 6 diagram di `skripsi-assets/diagrams/source/*.mmd` harus di-update karena source code berubah. Yang lain tetap.

---

## 1. Cara render Mermaid → PNG HD

### Opsi A — Web (paling cepat, paling rapi)
1. Buka <https://mermaid.live>
2. Paste Mermaid source dari section di bawah
3. Klik **Actions → PNG** (atau ikon kamera kanan atas)
4. Di settings export: pilih **High resolution** atau set scale 2x/3x
5. Save sebagai `gambar-3-XX.png` di `skripsi-assets/diagrams/png/`

### Opsi B — CLI (untuk batch)
```powershell
# Render single file dengan resolusi tinggi
npx -p @mermaid-js/mermaid-cli mmdc `
  -i skripsi-assets/diagrams/source/gambar-3-07.mmd `
  -o skripsi-assets/diagrams/png/gambar-3-07.png `
  -t neutral `
  -b white `
  -w 1950 `
  -H 1300 `
  --scale 2
```

Catatan flag:
- `-w 1950` — width 1950px (≈ 6.5 inch @ 300dpi); aman untuk Word A4 portrait
- `-H` — height (opsional; biarkan auto kalau sequence diagram panjang)
- `--scale 2` — 2x sharpness (anti-pixelated saat zoom Word)
- `-t neutral` — theme monochrome (sesuai konvensi skripsi)
- `-b white` — background putih solid

### Opsi C — Bulk render semua diagram yang berubah
```powershell
$diagrams = @('3-07','3-08','3-09','3-10','3-17','3-26')
foreach ($d in $diagrams) {
  npx -p @mermaid-js/mermaid-cli mmdc `
    -i "skripsi-assets/diagrams/source/gambar-$d.mmd" `
    -o "skripsi-assets/diagrams/png/gambar-$d.png" `
    -t neutral -b white -w 1950 --scale 2
}
```

---

## 2. Diagram yang HARUS DI-UPDATE (6 diagram)

Source code per 2026-05-16 berubah signifikan. **Replace isi file `.mmd` berikut** dengan Mermaid revisi di bawah, lalu re-render PNG.

### 2.1 `gambar-3-07.mmd` — Sequence: Cek Ketersediaan Kamar

**Yang berubah**: filter status di Query 2 dari `status='available'` jadi `status NOT IN ('maintenance', 'out_of_order')` agar kamar `occupied` tapi free pada tanggal future ikut muncul. Query 1 juga exclude `checked-out` dan null `room_id`.

```mermaid
sequenceDiagram
    autonumber
    actor Tamu as Tamu Hotel<br/>(anonymous / logged-in)
    participant ChatUI as Chatbot UI<br/>(/chatbot/page.tsx)
    participant ChatAPI as Chat Route<br/>(/api/chat/route.ts)
    participant Auth as Server-Side Auth<br/>(createServerSupabase)
    participant Gemini as Google Gemini<br/>(gemini-2.5-flash)
    participant Tool as Tool: cekKetersediaan
    participant DB as Supabase PostgreSQL
    participant Merge as JS Merge Layer

    Tamu->>ChatUI: "Ada kamar tersedia 15-17 Juli?"
    ChatUI->>ChatAPI: POST /api/chat<br/>{messages, userContext (client-supplied)}

    ChatAPI->>Auth: getUser() via cookie session
    Auth-->>ChatAPI: verifiedUser (atau null jika anonymous)
    Note over ChatAPI: userContext di-OVERRIDE server-side<br/>(jangan trust client-supplied)

    ChatAPI->>Gemini: streamText({<br/>system: hotelConcierge + verifiedUserContext,<br/>tools: {cekKetersediaan, ...}<br/>})

    Gemini->>Gemini: Detect intent: cek ketersediaan<br/>Extract checkIn, checkOut

    Gemini->>Tool: invoke cekKetersediaan({<br/>checkIn, checkOut, tipeKamar?<br/>})

    Note over Tool,DB: Query 1 — busy room ids
    Tool->>DB: SELECT room_id FROM reservations<br/>WHERE status NOT IN<br/>('cancelled','no_show','checked-out')<br/>AND room_id IS NOT NULL<br/>AND check_in < checkOut<br/>AND check_out > checkIn
    DB-->>Tool: busyBookings (room_id list)

    Tool->>Tool: busyRoomIds = bookings.map(b=>b.room_id)

    Note over Tool,DB: Query 2 — available rooms
    Tool->>DB: SELECT id, number, type,<br/>base_price, image_url, images<br/>FROM rooms<br/>WHERE status NOT IN ('maintenance','out_of_order')<br/>AND id NOT IN (busyRoomIds)<br/>[AND type ILIKE %tipeKamar%]
    DB-->>Tool: availableRooms

    Tool->>Tool: uniqueTypes = unique<br/>(availableRooms.map(type))

    Note over Tool,DB: Query 3 — enrich metadata<br/>(soft-ref by name)
    Tool->>DB: SELECT name, images, amenities,<br/>max_occupancy, room_size,<br/>bed_configuration, description<br/>FROM custom_room_types<br/>WHERE name IN (uniqueTypes)
    DB-->>Tool: typeMeta (per-type metadata)

    Tool->>Merge: metaByName = Map(typeMeta)
    Merge->>Merge: enrichedRooms = availableRooms.map<br/>(r => ({...r, ...metaByName.get(r.type)}))<br/>Group by type → typeGroupedCards<br/>(satu kartu per tipe + count)
    Merge-->>Tool: enrichedRooms (type-grouped)

    alt enrichedRooms kosong
        Tool-->>Gemini: { status: 'unavailable',<br/>message: 'Tidak ada kamar...' }
    else Ada kamar tersedia
        Tool-->>Gemini: { status: 'available',<br/>rooms: [{type, count, base_price,<br/>image_url, images, amenities,<br/>max_occupancy, bed_configuration, ...}] }
    end

    Gemini->>Gemini: Generate response text +<br/>append ROOM_CARDS_JSON marker

    Gemini-->>ChatAPI: stream chunks (SSE)
    ChatAPI-->>ChatUI: stream response<br/>(useChat hook, maxSteps:1)

    ChatUI->>ChatUI: Parse ROOM_CARDS_JSON marker<br/>render <RoomCard /> type-grouped<br/>("3 kamar tersedia" + thumbnail + modal)

    ChatUI-->>Tamu: Tampilkan teks + kartu kamar<br/>(dapat dilihat tanpa login)

    Note over Tool,DB: 3 queries terpisah + JS merge<br/>karena tidak ada FK formal antara<br/>rooms.type ↔ custom_room_types.name<br/>(soft reference by string match).
```

---

### 2.2 `gambar-3-08.mmd` — Sequence: Create Booking

**Yang berubah**:
- **Server-side auth verification** sekarang menjadi gate UTAMA, bukan sekadar driven by system prompt.
- `userContext.isLoggedIn` di-OVERRIDE server-side via `createServerSupabase().auth.getUser()`.
- Format `booking_reference` non-prediktif: `BK<6-digit-time><6-char-random>` (bukan `BK + Date.now().slice(-8)`).
- Server short-circuit jika tamu anonymous coba `createBooking`.

```mermaid
sequenceDiagram
    autonumber
    actor Tamu as Tamu Hotel
    participant ChatUI as Chatbot UI<br/>(/chatbot/page.tsx)
    participant ChatAPI as Chat Route<br/>(/api/chat/route.ts)
    participant Auth as Server-Side Auth<br/>(createServerSupabase)
    participant Gemini as Google Gemini<br/>(gemini-2.5-flash)
    participant Tool as Tool: createBooking
    participant DB as Supabase PostgreSQL
    participant UI as LoginPromptCard

    Tamu->>ChatUI: Pilih kamar dari ROOM_CARDS<br/>klik "Book This Room"
    ChatUI->>ChatAPI: POST /api/chat<br/>{messages, userContext (client-supplied)}

    Note over ChatAPI,Auth: AUTH GATE (server-side, sebelum LLM)
    ChatAPI->>Auth: cookies().get(session) → getUser()
    Auth->>DB: SELECT full_name, phone FROM profiles<br/>WHERE id = auth.uid
    DB-->>Auth: profile data
    Auth-->>ChatAPI: verifiedUser { id, email, fullName, phone }<br/>(atau null jika anonymous)

    Note over ChatAPI: userContext = verifiedUser<br/>OVERRIDE client-supplied isLoggedIn

    ChatAPI->>Gemini: streamText({<br/>system: hotelConcierge + verifiedUserContext,<br/>tools: {createBooking, ...}})

    alt verifiedUser = null<br/>(ANONYMOUS USER)
        Note over Gemini: System prompt instruct:<br/>"jangan invoke createBooking,<br/>emit SHOW_LOGIN_PROMPT"
        Gemini->>Gemini: Emit SHOW_LOGIN_PROMPT_JSON<br/>marker — TIDAK invoke tool
        Gemini-->>ChatAPI: "Untuk lanjut reservasi, login dulu"
        ChatAPI-->>ChatUI: stream response
        ChatUI->>UI: Render <LoginPromptCard /><br/>(ShieldCheck + benefit bullets +<br/>tombol Login / Daftar)
        UI-->>Tamu: Tampilkan login wall card
    else verifiedUser ≠ null<br/>(AUTHENTICATED)
        Gemini->>Gemini: Validate guest info complete<br/>(name + email wajib, phone opsional)<br/>auto-fill dari verifiedUser

        Gemini->>Tool: invoke createBooking({<br/>guestName, guestEmail, guestPhone,<br/>roomId, roomNumber, roomType,<br/>checkIn, checkOut, adults, children,<br/>roomRate, breakfastIncluded<br/>})

        Note over Tool: Server-side double-check:<br/>verifiedUser ≠ null,<br/>else reject 401

        Tool->>Tool: bookingRef = "BK" + slice(Date.now(), -6)<br/>+ random(6 chars: A-Z 0-9)<br/>// non-enumerable, contoh: BK472019AB7K2X<br/>nights = (checkOut - checkIn) / 86400000<br/>roomTotal = roomRate × nights<br/>breakfastTotal = pax × 50000 × nights<br/>totalAmount = roomTotal + breakfastTotal

        Tool->>DB: SELECT id FROM guests<br/>WHERE email = ?
        DB-->>Tool: existingGuest (atau null)

        alt Guest belum ada
            Tool->>DB: INSERT INTO guests<br/>(full_name, email, phone)
            DB-->>Tool: newGuest.id
        else Guest sudah terdaftar
            Tool->>Tool: guestId = existingGuest.id
        end

        Tool->>DB: INSERT INTO reservations (<br/>booking_id (14 char),<br/>booking_reference (non-enumerable),<br/>guest_id, guest_email,<br/>room_id, check_in, check_out,<br/>adults, children, room_rate, total_amount,<br/>status='confirmed',<br/>payment_status='pending')
        DB-->>Tool: reservation row

        Tool-->>Gemini: { success: true,<br/>bookingReference, reservationId,<br/>totalAmount, status: 'confirmed',<br/>paymentStatus: 'pending' }

        Gemini->>Gemini: Generate response<br/>+ append SHOW_PAYMENT_OPTIONS_JSON

        Gemini-->>ChatAPI: stream chunks (SSE)
        ChatAPI-->>ChatUI: stream response
        ChatUI->>ChatUI: Render <PaymentOptions /><br/>(Bank Transfer / Credit / E-Wallet)
        ChatUI-->>Tamu: Ringkasan booking + opsi pembayaran<br/>(booking code TIDAK diungkap, ditahan<br/>sampai confirmPayment)
    end

    Note over Tool: Booking code non-enumerable +<br/>di-hold sampai confirmPayment<br/>= mitigasi enumeration attack.
```

---

### 2.3 `gambar-3-09.mmd` — Sequence: Konfirmasi Pembayaran

**Yang berubah**: tambah **ownership check** — `reservation.guest_email` harus match `verifiedUser.email`, else reject 403.

```mermaid
sequenceDiagram
    autonumber
    actor Tamu as Tamu Hotel
    participant ChatUI as Chatbot UI<br/>(/chatbot/page.tsx)
    participant ChatAPI as Chat Route<br/>(/api/chat/route.ts)
    participant Auth as Server-Side Auth<br/>(createServerSupabase)
    participant Gemini as Google Gemini<br/>(gemini-2.5-flash)
    participant Tool as Tool: confirmPayment
    participant DB as Supabase PostgreSQL

    Tamu->>ChatUI: "Saya sudah transfer Rp X via BCA"
    ChatUI->>ChatAPI: POST /api/chat<br/>{messages: [..., payment confirmation]}

    Note over ChatAPI,Auth: AUTH GATE (server-side)
    ChatAPI->>Auth: getUser() via cookie session
    Auth-->>ChatAPI: verifiedUser { id, email, ... }

    alt verifiedUser = null
        ChatAPI-->>ChatUI: Tolak: harus login untuk konfirmasi
        ChatUI-->>Tamu: Render LoginPromptCard
    else verifiedUser ≠ null
        ChatAPI->>Gemini: streamText({<br/>tools: {confirmPayment, ...}})

        Gemini->>Gemini: Extract bookingReference dari<br/>conversation context

        Gemini->>Tool: invoke confirmPayment({<br/>bookingReference,<br/>paymentMethod?,<br/>paymentAmount?<br/>})

        Tool->>DB: SELECT * FROM reservations<br/>WHERE booking_reference = ?
        DB-->>Tool: reservation (atau null)

        alt Booking reference tidak ditemukan
            Tool-->>Gemini: { success: false,<br/>error: 'Booking reference not found' }
        else Reservasi ditemukan
            Note over Tool: OWNERSHIP CHECK
            Tool->>Tool: Verifikasi:<br/>reservation.guest_email === verifiedUser.email
            alt Email TIDAK match
                Tool-->>Gemini: { success: false, status: 403,<br/>error: 'Reservasi ini bukan milik Anda' }
                Gemini-->>ChatUI: Pesan: "internal system problem"<br/>(generic, tidak leak info)
            else Email match
                Tool->>Tool: actualAmount = paymentAmount<br/>?? reservation.total_amount<br/>actualMethod = paymentMethod<br/>?? 'Bank Transfer'<br/>txId = "TRX-" + Date.now() + "-" + method

                Tool->>DB: INSERT INTO payments (<br/>reservation_id,<br/>amount, payment_method,<br/>payment_date = NOW(),<br/>transaction_id)
                DB-->>Tool: payment row

                Tool->>DB: UPDATE reservations<br/>SET payment_status = 'paid',<br/>updated_at = NOW()<br/>WHERE booking_reference = ?
                DB-->>Tool: updated row count

                Tool-->>Gemini: { success: true,<br/>bookingReference,<br/>paymentStatus: 'paid',<br/>amount, paymentMethod,<br/>guestName, roomNumber,<br/>checkIn, checkOut,<br/>message: 'Payment confirmed!' }
            end
        end

        Gemini->>Gemini: Generate konfirmasi lengkap<br/>+ REVEAL booking reference<br/>+ instruksi check-in

        Gemini-->>ChatAPI: stream chunks (SSE)
        ChatAPI-->>ChatUI: stream response

        ChatUI-->>Tamu: Tampilkan booking reference,<br/>detail kamar, tanggal,<br/>total dibayar, instruksi check-in
    end

    Note over Tool,DB: Setelah payment_status='paid',<br/>reservasi siap untuk check-in<br/>fisik di front desk.<br/><br/>Ownership check mencegah session-hijack:<br/>pengguna login lain tidak bisa konfirmasi<br/>pembayaran reservasi orang lain dengan<br/>tebakan booking_reference.
```

---

### 2.4 `gambar-3-10.mmd` — Arsitektur Integrasi LLM Chatbot

**Yang berubah**:
- Tambah **Server-Side Auth Gate** sebelum LLM (createServerSupabase).
- DB: hapus `ai_messages` (kosong, tidak dipakai), hanya `Chat` single-table JSONB.
- Tambah marker `SHOW_LOGIN_PROMPT_JSON` di Cards parser.
- Provider: **Gemini-only** (Groq + Llama dihapus 2026-05-16).

```mermaid
flowchart LR
    subgraph Client["Client Layer (Browser)"]
        UI[Chatbot UI<br/>chatbot/page.tsx<br/>useChat hook + maxSteps:1<br/>+ Stop / Regenerate]
        Cards[Interactive Cards<br/>RoomCard type-grouped<br/>shadcn Calendar + Popover<br/>GuestForm PaymentOptions<br/>LoginPromptCard]
    end

    subgraph NextServer["Next.js Server Runtime"]
        APIRoute["/api/chat/route.ts<br/>POST handler"]
        AuthGate["Server-Side Auth Gate<br/>createServerSupabase<br/>getUser → verifiedUser<br/>OVERRIDE client userContext"]
        AISDK["Vercel AI SDK<br/>ai@4.0.38<br/>streamText, maxSteps:3"]
    end

    subgraph LLM["Google Gemini API (single provider)"]
        Model[gemini-2.5-flash<br/>via @ai-sdk/google 1.0.10]
        FuncCall[Function Calling<br/>Engine]
    end

    subgraph Tools["Tool Definitions (Zod schema)"]
        T1[cekKetersediaan<br/>checkIn checkOut tipeKamar?]
        T2[createBooking<br/>guest + room + dates<br/>requires verifiedUser]
        T3[getRoomTypes<br/>tanpa parameter]
        T4[confirmPayment<br/>bookingReference + method<br/>ownership check guest_email]
    end

    subgraph DB["Supabase PostgreSQL"]
        TR[(rooms)]
        TG[(guests)]
        TRes[(reservations)]
        TP[(payments)]
        TPr[(profiles)]
        TC[(Chat JSONB messages)]
    end

    subgraph SystemPrompt["System Prompt Configuration"]
        SP[Hotel Concierge<br/>Bilingual ID-EN<br/>Date-first booking flow<br/>Pay-now or Pay-later<br/>Booking code hold rule<br/>Auth gate rules]
    end

    User((Tamu Hotel)) -->|Pesan natural language| UI
    UI -->|POST messages + client userContext| APIRoute
    APIRoute -->|cookies session| AuthGate
    AuthGate -->|SELECT profile| TPr
    AuthGate -->|verifiedUser| APIRoute
    APIRoute -->|streamText with verified context| AISDK
    AISDK -->|HTTPS request| Model
    SP -.->|inject| Model

    Model --> FuncCall
    FuncCall -->|Auto-select tool| T1
    FuncCall -->|Auto-select tool| T2
    FuncCall -->|Auto-select tool| T3
    FuncCall -->|Auto-select tool| T4

    T1 -->|SELECT busy + available + meta| TR
    T1 -->|JOIN reservations| TRes
    T2 -->|UPSERT guest| TG
    T2 -->|INSERT reservation<br/>non-enumerable booking_ref| TRes
    T3 -->|SELECT distinct types| TR
    T4 -->|verify guest_email match| TRes
    T4 -->|INSERT payment| TP
    T4 -->|UPDATE reservation| TRes

    T1 -.->|tool result| FuncCall
    T2 -.->|tool result| FuncCall
    T3 -.->|tool result| FuncCall
    T4 -.->|tool result| FuncCall

    FuncCall -->|generate text<br/>+ JSON markers| Model
    Model -->|stream chunks| AISDK
    AISDK -->|SSE response| APIRoute
    APIRoute -->|stream to client| UI

    UI -->|Parse markers<br/>SHOW_GUEST_FORM<br/>ROOM_CARDS (type-grouped)<br/>SHOW_PAYMENT_OPTIONS<br/>SHOW_DATE_SELECTOR<br/>SHOW_LOGIN_PROMPT| Cards
    Cards --> User

    APIRoute -.->|Persist conversation| TC

    classDef clientNode fill:#fef3c7,stroke:#f59e0b
    classDef serverNode fill:#dbeafe,stroke:#3b82f6
    classDef authNode fill:#fee2e2,stroke:#ef4444,stroke-width:2px
    classDef llmNode fill:#fce7f3,stroke:#ec4899
    classDef toolNode fill:#e0e7ff,stroke:#6366f1
    classDef dbNode fill:#dcfce7,stroke:#10b981

    class UI,Cards clientNode
    class APIRoute,AISDK serverNode
    class AuthGate authNode
    class Model,FuncCall,SP llmNode
    class T1,T2,T3,T4 toolNode
    class TR,TG,TRes,TP,TPr,TC dbNode
```

---

### 2.5 `gambar-3-17.mmd` — Activity Diagram: Reservasi via Chatbot

**Yang berubah**:
- **Date-first flow**: SHOW_DATE_SELECTOR (shadcn Calendar + Popover) WAJIB sebelum `cekKetersediaan`, bahkan untuk frasa relatif ("besok", "akhir pekan").
- Auth gate sekarang **server-side enforced**, bukan hanya driven by system prompt.
- Kartu kamar **type-grouped** (satu kartu per tipe + count).

```mermaid
flowchart TD
    Start([Tamu buka /chatbot]) --> AuthCheck[Server-side auth check<br/>createServerSupabase.getUser]
    AuthCheck --> Greet[Chatbot sapa user<br/>verifiedUser injected ke system prompt]
    Greet --> Intent{Intent message?}

    Intent -->|Pertanyaan informasi<br/>fasilitas, kebijakan, lokasi| InfoAns[Jawab dari knowledge base<br/>system prompt]
    InfoAns --> AskMore{Ada permintaan<br/>lanjutan?}
    AskMore -->|Ya| Intent
    AskMore -->|Tidak| End

    Intent -->|Cek ketersediaan kamar /<br/>frasa relatif besok / akhir pekan| ForceDate[Render SHOW_DATE_SELECTOR_JSON<br/>shadcn Calendar + Popover<br/>auto-bump checkout +1 hari<br/>past dates disabled]
    ForceDate --> WaitDate[Tunggu user pilih tanggal<br/>via komponen kalender]
    WaitDate --> CallCek[Tool cekKetersediaan<br/>checkIn, checkOut, tipeKamar?]
    CallCek --> Avail{Ada kamar<br/>tersedia?}
    Avail -->|Tidak| NoRooms[Pesan: tidak tersedia,<br/>tawarkan tanggal lain]
    NoRooms --> Intent
    Avail -->|Ya| ShowCards["Render ROOM_CARDS_JSON<br/>RoomCard type-grouped<br/>(satu kartu per tipe + X kamar tersedia)<br/>sorted by price ascending<br/>thumbnail + modal carousel"]

    ShowCards --> WaitPick[Tunggu user klik<br/>Book This Room]
    WaitPick --> Intent

    Intent -->|User pilih kamar / mau booking| ServerAuth{Server-side<br/>verifiedUser?}

    ServerAuth -->|null<br/>ANONYMOUS| ShowLogin[Render<br/>SHOW_LOGIN_PROMPT_JSON<br/>LoginPromptCard<br/>+ system prompt blok tool]
    ShowLogin --> ClickLogin{User klik?}
    ClickLogin -->|Login / Daftar| Redir["/login atau /signup"]
    ClickLogin -->|Tutup / lanjut tanya| Intent
    Redir --> Return[Kembali ke /chatbot<br/>session cookie aktif]
    Return --> ServerAuth

    ServerAuth -->|verifiedUser ≠ null<br/>AUTHENTICATED| AutoFill[Auto-fill form dari<br/>verifiedUser:<br/>fullName, email, phone<br/>dari tabel profiles]
    AutoFill --> HasGuestInfo{Sudah ada<br/>name + email?}
    HasGuestInfo -->|Tidak| ShowForm[Render SHOW_GUEST_FORM_JSON<br/>InteractiveBookingCard<br/>phone OPSIONAL]
    ShowForm --> WaitGuest[Tunggu user submit form]
    WaitGuest --> HasGuestInfo
    HasGuestInfo -->|Ya| Confirm[Tampilkan ringkasan<br/>untuk konfirmasi]

    Confirm --> UserOK{User<br/>confirm?}
    UserOK -->|Tidak| Intent
    UserOK -->|Ya| CallCreate[Tool createBooking<br/>guest + room + dates<br/>+ booking_reference non-enumerable]

    CallCreate --> SaveDB[(INSERT guests if new<br/>INSERT reservation<br/>booking_reference=BK6digit6char<br/>status=confirmed<br/>payment_status=pending)]
    SaveDB --> ShowPay[Render SHOW_PAYMENT_OPTIONS_JSON<br/>Bank Transfer / Card / E-Wallet]

    ShowPay --> PayChoice{User pilih}
    PayChoice -->|Pay Now| InstrPay[Instruksi transfer<br/>BCA 7125348238]
    PayChoice -->|Pay Later| Pending[Status pending<br/>booking code DITAHAN]
    Pending --> End

    InstrPay --> WaitPaid[Tunggu user konfirmasi<br/>'sudah transfer']
    WaitPaid --> CallConfirm[Tool confirmPayment<br/>bookingReference]
    CallConfirm --> OwnCheck{guest_email<br/>match verifiedUser.email?}
    OwnCheck -->|Tidak| Reject[Reject 403<br/>generic error message]
    Reject --> End
    OwnCheck -->|Ya| InsertPay[(INSERT payments<br/>UPDATE reservation<br/>payment_status=paid)]
    InsertPay --> Reveal[Reveal booking_reference<br/>+ instruksi check-in]
    Reveal --> End([Selesai])

    classDef startEnd fill:#dcfce7,stroke:#10b981
    classDef decision fill:#fef3c7,stroke:#f59e0b
    classDef action fill:#dbeafe,stroke:#4472C4
    classDef llm fill:#fce7f3,stroke:#ec4899
    classDef db fill:#e0e7ff,stroke:#6366f1
    classDef wall fill:#fee2e2,stroke:#ef4444,stroke-width:2px
    classDef auth fill:#fef9c3,stroke:#eab308,stroke-width:2px

    class Start,End startEnd
    class Intent,ServerAuth,HasGuestInfo,Avail,UserOK,PayChoice,AskMore,ClickLogin,OwnCheck decision
    class Greet,InfoAns,ShowForm,WaitGuest,ForceDate,WaitDate,NoRooms,ShowCards,WaitPick,Confirm,InstrPay,WaitPaid,Pending,ShowPay,Reveal,AutoFill,Redir,Return action
    class CallCek,CallCreate,CallConfirm llm
    class SaveDB,InsertPay db
    class ShowLogin,Reject wall
    class AuthCheck auth
```

---

### 2.6 `gambar-3-26.mmd` — Entity Relationship Diagram (ERD)

**Yang berubah**:
- Hapus row `ai_messages` (kosong, tidak dipakai produksi) dan relasinya. Konsisten dengan narasi skripsi (LOKASI-5).
- Hapus `pos_transactions` / `pos_transaction_items` (tidak ada di Supabase).
- Tabel `Chat` standalone (tidak FK keluar).

```mermaid
erDiagram
    rooms ||--o{ reservations : "booking"
    rooms ||--o{ housekeeping_tasks : "task target"
    rooms ||--o{ billing_items : "service line"
    custom_room_types ||..o{ rooms : "categorizes<br/>(soft ref by name)"

    guests ||--o{ reservations : "books"
    guests ||--o{ billing_items : "billed to"

    reservations ||--o{ payments : "settled by"
    reservations ||--o{ billing_items : "items"
    reservations ||--o{ deposits : "deposit"
    reservations ||--o{ invoices : "invoiced"

    profiles ||--o{ deposits : "collected by"
    profiles ||--o{ invoices : "created by"

    roles ||--o{ user_roles : "assigned"
    user_roles }o--|| profiles : "user"

    staff_members ||--o{ housekeeping_tasks : "assigned"

    inventory_items ||--o{ inventory_transactions : "stock change"
    inventory_items ||--o{ inventory_purchase_order_items : "ordered"
    inventory_suppliers ||--o{ inventory_purchase_orders : "supplies"
    inventory_purchase_orders ||--o{ inventory_purchase_order_items : "lines"

    rooms {
        uuid id PK
        varchar number
        varchar type "soft ref→custom_room_types.name"
        int floor
        numeric base_price
        varchar status "available|occupied|maintenance|cleaning|out_of_order"
        text image_url
        jsonb images
        timestamptz created_at
    }

    custom_room_types {
        bigint id PK
        varchar name UK
        text description
        numeric base_price
        int max_occupancy
        numeric room_size
        varchar bed_configuration "King|Queen|Twin|Double|Single|Bunk|Sofa"
        jsonb amenities "AC|TV|WiFi|fridge|safe|balcony|bathtub"
        jsonb images "default per-type"
        jsonb features
        boolean is_active
    }

    guests {
        uuid id PK
        varchar full_name "NOT NULL"
        varchar email
        varchar phone "DB nullable / UI required"
        text address
        varchar id_number "opsional - saat check-in"
        varchar nationality
        uuid user_id FK
    }

    reservations {
        uuid id PK
        varchar booking_id "14 char"
        varchar booking_reference "non-enumerable<br/>BK + 6digit-time + 6char-random"
        uuid guest_id FK
        varchar guest_name "denormalized"
        varchar guest_email "denormalized<br/>+ ownership check"
        varchar guest_phone "denormalized"
        uuid room_id FK
        varchar room_number "denormalized"
        varchar room_type "denormalized"
        date check_in
        date check_out
        int adults
        int children
        int guest_count
        numeric room_rate
        numeric room_total
        numeric total_amount
        numeric total_price
        varchar status "pending|confirmed|checked-in|<br/>checked-out|cancelled|no_show"
        varchar payment_status "pending|partial|paid|refunded"
        boolean breakfast_included
        int breakfast_pax
        numeric breakfast_price
        numeric breakfast_total
        text notes
        timestamptz actual_check_in
        timestamptz actual_check_out
    }

    payments {
        uuid id PK
        uuid reservation_id FK
        numeric amount
        varchar payment_method
        timestamptz payment_date
        text transaction_id
    }

    invoices {
        bigint id PK
        text invoice_number
        uuid reservation_id FK
        uuid guest_id
        numeric subtotal
        numeric tax_amount
        numeric total_amount
        varchar status
        uuid created_by FK
    }

    billing_items {
        bigint id PK
        uuid reservation_id FK
        uuid room_id FK
        uuid guest_id FK
        text item_name
        text category
        int quantity
        numeric unit_price
        numeric total_price
    }

    deposits {
        bigint id PK
        uuid reservation_id FK
        numeric amount
        varchar status
        uuid collected_by FK
        uuid refunded_by FK
    }

    profiles {
        uuid id PK
        uuid user_id
        text employee_id
        text full_name
        text role
        boolean is_active
    }

    roles {
        uuid id PK
        text name
        text display_name
        jsonb permissions
    }

    user_roles {
        uuid id PK
        uuid user_id FK
        uuid role_id FK
    }

    housekeeping_tasks {
        int id PK
        uuid room_id FK
        int staff_id FK
        varchar task_type
        varchar status
        varchar priority
    }

    staff_members {
        int id PK
        varchar full_name
        varchar role
        boolean is_active
    }

    inventory_items {
        bigint id PK
        text name
        text category
        int current_stock
        int min_stock
        numeric unit_cost
    }

    inventory_suppliers {
        bigint id PK
        text name
        text email
    }

    inventory_transactions {
        bigint id PK
        bigint item_id FK
        varchar transaction_type
        int quantity
    }

    inventory_purchase_orders {
        bigint id PK
        text po_number
        bigint supplier_id FK
        text status
        numeric total_amount
    }

    inventory_purchase_order_items {
        bigint id PK
        bigint po_id FK
        bigint item_id FK
        numeric quantity_ordered
        numeric unit_cost
    }

    Chat {
        uuid id PK
        uuid user_id "FK auth.users"
        jsonb messages "array of role/content"
        timestamptz created_at
    }
```

---

## 3. Diagram yang TIDAK BERUBAH

File `.mmd` berikut tetap valid — PNG existing bisa dipakai langsung tanpa re-render:

| File | Deskripsi | Status |
|---|---|---|
| `gambar-1-01.mmd` | Arsitektur Umum PMS (generic) | ✅ tetap |
| `gambar-2-01.mmd` | Arsitektur PMS (layers) | ✅ tetap |
| `gambar-2-02.mmd` | Alur Kerja Scrum (generic) | ✅ tetap |
| `gambar-2-05.mmd` | Contoh Use Case (generic textbook) | ✅ tetap |
| `gambar-2-06.mmd` | Contoh Class Diagram (generic) | ✅ tetap |
| `gambar-2-07.mmd` | Contoh Activity Diagram (generic) | ✅ tetap |
| `gambar-2-08.mmd` | Contoh Sequence Diagram (generic) | ✅ tetap |
| `gambar-3-01.mmd` | Alur Pengembangan Scrum (4 sprints) | ✅ tetap |
| `gambar-3-02.mmd` | Kerangka Berpikir Penelitian | ✅ tetap |
| `gambar-3-03.mmd` | Flowchart Alur Aplikasi | ✅ tetap |
| `gambar-3-04.mmd` | Use Case Diagram StayManager | ✅ tetap (auth gate sudah captured) |
| `gambar-3-05.mmd` | Class Diagram (Domain Entity) | ✅ tetap (sudah pakai ChatSession single-table) |
| `gambar-3-06.mmd` | Sequence Login Staf | ✅ tetap |
| `gambar-3-11.mmd` | Sequence Check-in Tamu | ✅ tetap |
| `gambar-3-12.mmd` | Sequence Check-out Tamu | ✅ tetap |
| `gambar-3-13.mmd` | Sequence Manajemen Kamar | ✅ tetap |
| `gambar-3-14.mmd` | Sequence Manajemen Housekeeping | ✅ tetap |
| `gambar-3-15.mmd` | Activity Login | ✅ tetap |
| `gambar-3-16.mmd` | Activity Registrasi Akun Staff | ✅ tetap |
| `gambar-3-18.mmd` | Activity Check-in Tamu | ✅ tetap |
| `gambar-3-19.mmd` | Activity Housekeeping | ✅ tetap |
| `gambar-3-20.mmd` | Activity Transaksi Keuangan | ✅ tetap |
| `gambar-3-21.mmd` | Antarmuka Halaman Publik | ✅ tetap |
| `gambar-3-22.mmd` | Antarmuka Chatbot LLM | ⚠️ pertimbangkan update untuk reflect type-grouped + Stop/Regenerate (low priority) |
| `gambar-3-23.mmd` | Antarmuka Halaman Login | ✅ tetap |
| `gambar-3-24.mmd` | Antarmuka Manajemen Kamar | ⚠️ pertimbangkan update untuk reflect amenities editor + room detail viewer (low priority) |
| `gambar-3-25.mmd` | Antarmuka Modul Keuangan | ✅ tetap |

---

## 4. Screenshot Bab 4 (manual capture)

Folder output: `skripsi-assets/screenshots/`

### Screenshot existing yang perlu DI-RE-CAPTURE karena ada fitur baru

| File | Halaman | Apa yang harus terlihat (BARU) |
|---|---|---|
| `gambar-4-03.png` | `/rooms` Manajemen Kamar | **Tab Rooms** dengan tabel + thumbnail; pastikan **room detail viewer modal** dibuka (carousel + amenities chip + bed config + size + view type) |
| `gambar-4-10.png` | `/chatbot` Antarmuka Chatbot | Pastikan visible: (a) **shadcn Calendar di Popover** open, (b) **RoomCard type-grouped** dengan "X kamar tersedia", (c) tombol **Stop & Regenerate** dekat input box, (d) typing indicator single persistent |

### Screenshot BARU yang disarankan untuk diambil

| Suggested file | Halaman | Apa yang harus terlihat |
|---|---|---|
| `gambar-4-24.png` (baru) | `/rooms` → edit tipe kamar | **Amenities chip-selector** (AC/TV/WiFi/dll) + **bed config dropdown** (King/Queen/Twin/...) |
| `gambar-4-25.png` (baru) | `/rooms` → klik detail row | **Room detail viewer modal** dengan carousel galeri, spec (kapasitas/luas/bed/view), chip amenitas, deskripsi |
| `gambar-4-26.png` (baru) | `/chatbot` | **Date picker shadcn Calendar** terbuka dalam Popover, dengan past dates di-disable + auto-bump checkout |
| `gambar-4-27.png` (baru) | `/chatbot` | **RoomCard type-grouped**: 3 kartu @1 per tipe dengan label "X kamar tersedia", sorted by price |
| `gambar-4-28.png` (baru) | `/chatbot` saat streaming | Bubble assistant sedang streaming dengan tombol **Stop** visible |
| `gambar-4-29.png` (baru) | `/chatbot` setelah response | Tombol **Regenerate** di assistant message terakhir |

### Spek capture
- Viewport: **1280×800** (desktop default, sesuai konvensi skripsi v3.1)
- Browser: Chrome/Edge in **light mode** (tema aplikasi terang)
- Format: PNG (lossless), bukan JPG
- Disarankan tools: Snipping Tool / ShareX / browser DevTools "Capture full size screenshot"
- Demo accounts (dari `skripsi-assets/.env`):
  - Manager: `demo.manager@hotel-asni.com` / `DemoManager2026!`
  - Guest: `demo.guest@hotel-asni.com` / `DemoGuest2026!`

---

## 5. Anti-patterns & catatan akademis

- **Label Bahasa Indonesia** di seluruh diagram
- **Monochrome** dengan accent biru (`#4472C4`) / abu (`#A5A5A5`), font sans-serif
- **ERD**: `rooms.type` ↔ `custom_room_types.name` = **soft-ref by string**, BUKAN FK formal → digambar putus-putus
- **`Chat` table** = single-table JSONB (capital C, sesuai produksi); `ai_messages` tidak dipakai di kode
- **`id_number`** bukan field reservasi — itu di tabel `guests`, diisi saat check-in fisik
- **`guests.phone`** DB nullable, UI-only required untuk reservasi via chatbot
- **Anonymous user** bisa: browse room types + cek ketersediaan; tidak bisa: createBooking / confirmPayment (server-side blocked)
- **Server-side auth** (createServerSupabase) sekarang mengoverride client-supplied `userContext.isLoggedIn` — pertahankan ini di narasi diagram
- **`booking_reference`** non-enumerable: prefix `BK` + 6-digit timestamp terpangkas + 6-char random (contoh: `BK472019AB7K2X`)

---

## 6. Checklist generate

- [ ] Replace isi 6 file `.mmd` di `skripsi-assets/diagrams/source/` (gambar-3-07, 3-08, 3-09, 3-10, 3-17, 3-26) dengan Mermaid revisi di section 2
- [ ] Re-render PNG ke `skripsi-assets/diagrams/png/` pakai Opsi A (mermaid.live) atau Opsi C (bulk CLI)
- [ ] Re-capture 2 screenshot existing yang berubah: `gambar-4-03.png`, `gambar-4-10.png`
- [ ] Capture 6 screenshot baru opsional untuk fitur baru (`gambar-4-24` s/d `gambar-4-29`)
- [ ] Sisipkan ke Word doc skripsi di posisi placeholder `[GAMBAR BELUM DIINPUT — Gambar X.Y: ...]`

---

*Source-of-truth code references: `src/app/api/chat/route.ts`, `src/app/rooms/page.tsx`, `src/app/chatbot/page.tsx`, `src/components/chatbot/*.tsx`. Untuk audit lengkap, lihat `docs/Skripsi_Audit_Report.md` § "Audit Pass #2 — 2026-05-17".*
