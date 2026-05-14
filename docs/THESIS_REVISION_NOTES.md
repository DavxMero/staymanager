# Thesis Revision Notes — StayManager v3.1

Snapshot ground-truth dari repo untuk update narasi Word doc. Semua quote langsung dari source / Supabase. Tidak ada figure baru — pakai numbering 43 figures yang sudah ada.

Generated: 2026-05-11 · Supabase project: `ncjneagfadrmivgicszm`

---

## AREA 1 — Chatbot Anonymous vs Authenticated

### 1a. Deteksi `isLoggedIn` / `userContext` di chat route

`src/app/api/chat/route.ts:13-25`:

```ts
export async function POST(req: Request) {
  const { messages, userContext } = await req.json();

  const userContextSection = userContext?.isLoggedIn
    ? `\n\nUSER CONTEXT (this conversation):
- Login status: LOGGED IN
- Name from profile: ${userContext.fullName || '(empty)'}
- Email from profile: ${userContext.email || '(empty)'}
- Phone from profile: ${userContext.phone || '(empty)'}
- Action: Use these values to PRE-FILL guest info ...`
    : `\n\nUSER CONTEXT (this conversation):
- Login status: NOT LOGGED IN (anonymous browsing)
- Action: For any booking request, emit SHOW_LOGIN_PROMPT_JSON marker ...
  Do NOT call createBooking.\n`;
```

Propagasi dari client di `src/app/chatbot/page.tsx:54-68`:

```ts
const { messages, ... } = useChat({
  api: '/api/chat',
  maxSteps: 5,
  body: {
    userContext: user
      ? { isLoggedIn: true, fullName: ..., email: user.email, phone: ... }
      : { isLoggedIn: false },
  },
});
```

### 1b. Tools availability (anonymous vs blocked)

| Tool | Anonymous | Logged-in | Catatan |
|---|---|---|---|
| `cekKetersediaan` | ✅ OK | ✅ OK | System prompt eksplisit: *"You can check room availability using 'cekKetersediaan' tool"* (`route.ts:62`) |
| `getRoomTypes` | ✅ OK | ✅ OK | Tidak disebut sebagai blocked |
| `createBooking` | ❌ **BLOCKED** | ✅ OK | *"DO NOT call 'createBooking' tool if user is not logged in"* (`route.ts:68`) → render `LoginPromptCard` |
| `confirmPayment` | ❌ N/A | ✅ OK | Hanya relevan setelah booking |

Marker yang di-emit saat anonymous mau booking (`route.ts:65`):

```
SHOW_LOGIN_PROMPT_JSON:{"reason":"membuat reservasi"}
```

Render di client (`chatbot/page.tsx:815-819`):

```tsx
{loginPrompt && !user && (
  <div className="mt-4 max-w-md">
    <LoginPromptCard reason={loginPrompt.reason || 'membuat reservasi'} />
  </div>
)}
```

### 1c. RLS policy SQL untuk `custom_room_types` public read

Hasil query `pg_policies` schema `public`:

```sql
CREATE POLICY "Public read custom_room_types"
  ON public.custom_room_types
  FOR SELECT
  TO public
  USING (true);
```

(Berdampingan dengan policy lama `authenticated_all_access` FOR ALL TO authenticated USING(true) WITH CHECK(true).)

### 1d. Justifikasi narasi (1-2 kalimat)

> Anonymous user diizinkan **membaca** data publik (room availability, rate, fasilitas) karena keputusan reservasi membutuhkan informasi tersebut sebelum komitmen login; namun aksi **menulis** (createBooking) dihadang login wall agar setiap reservasi terikat pada akun ter-otentikasi — mencegah booking anonim yang sulit diaudit dan memungkinkan auto-fill data tamu dari profil di percakapan berikutnya.

---

## AREA 2 — Form Pemesan (phone vs id_number)

### 2a. Field list di `InteractiveBookingCard` (chatbot)

Source: `src/components/chatbot/InteractiveBookingCard.tsx:75-99`. Stage `info`:

| Field | Required | Label | Icon | Placeholder | Quote |
|---|---|---|---|---|---|
| `guestName` | wajib (untuk booking) | "Name" | 👤 | — | line 75-81 |
| `guestEmail` | wajib (untuk booking) | "Email" | 📧 | — | line 82-89 |
| `guestPhone` | **opsional** | "No. Telepon" | 📱 | `"Opsional — untuk konfirmasi reservasi"` | line 90-98 |

Catatan: `id_number` **tidak ada** di komponen reservation-time ini.

Tool `createBooking` di `route.ts:329-332` masih mark `guestPhone` sebagai required di Zod (`z.string()`), tapi system prompt mengizinkan booking lanjut meski phone empty (*"if missing, you may ask politely once but proceed even if not provided"* — `route.ts:73`).

### 2b. Schema tabel `guests` di Supabase

Hasil `information_schema.columns`:

| Column | Type | Nullable | Default |
|---|---|---|---|
| `id` | uuid | **NO** | `gen_random_uuid()` |
| `full_name` | varchar | **NO** | — |
| `email` | varchar | YES | — |
| `phone` | varchar | YES (di DB) | — |
| `address` | text | YES | — |
| `id_number` | varchar | YES | — |
| `nationality` | varchar | YES | — |
| `created_at` | timestamptz | YES | `now()` |
| `updated_at` | timestamptz | YES | `now()` |
| `user_id` | uuid | YES | — |

**Penting:** `phone` di **DB level** masih nullable. "Required" untuk phone dienforce **di UI** `/guests` page (validasi visual `*`), bukan via NOT NULL constraint. Justifikasi narasi: enforcement di layer aplikasi memberi fleksibilitas untuk legacy data + import bulk.

### 2c. Validasi phone required di `/guests`

Source: `src/app/guests/page.tsx:958-973`:

```tsx
<Label htmlFor="phone">
  No. Telepon <span className="text-red-500">*</span>
</Label>
<div className="relative">
  <PhoneInput
    id="phone"
    value={phone}
    onChange={setPhone}
    placeholder="812-3456-7890"
  />
</div>
<p className="text-xs text-muted-foreground">
  Kontak utama untuk konfirmasi reservasi & komunikasi.
</p>
```

`id_number` di-render terpisah dengan label opsional (`page.tsx:974-992`):

```tsx
<Label htmlFor="idNumber" className="text-muted-foreground">
  No. Identitas (KTP/Paspor)
  <span className="ml-2 text-xs font-normal">— opsional</span>
</Label>
...
<Input
  id="idNumber"
  placeholder="Diisi saat tamu check-in (NIK / No. Paspor)"
/>
<p className="text-xs text-muted-foreground">
  Hanya wajib saat proses check-in di front desk untuk verifikasi identitas.
</p>
```

### 2d. Justifikasi (1 kalimat)

> Phone dijadikan required di reservation-time karena merupakan **kanal komunikasi minimum** untuk konfirmasi/perubahan reservasi (terutama saat booking online tanpa interaksi langsung); sedangkan `id_number` (KTP/Paspor) **hanya diperlukan saat check-in di front desk** sebagai bagian dari verifikasi identitas fisik — memintanya di tahap reservasi menambah friction tanpa manfaat operasional.

---

## AREA 3 — Room Image Management

### 3a. Struktur kolom `images` (jsonb) + `image_url` di tabel rooms / custom_room_types

**`rooms` table** (per `information_schema`):

| Column | Type | Nullable |
|---|---|---|
| `image_url` | text | YES |

Contoh value (live data):

```
72379ec4-...  · 303 · Presidential · https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800
923f5442-...  · 103 · Deluxe       · https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800
d610def6-...  · 202 · Standard     · https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800
```

(Field `custom_type_id` **tidak ada** di schema aktual — soft-ref via `rooms.type` ↔ `custom_room_types.name` string match.)

**`custom_room_types` table**:

| Column | Type | Nullable | Default |
|---|---|---|---|
| `images` | jsonb | YES | `'[]'::jsonb` |
| `amenities` | jsonb | YES | `'[]'::jsonb` |
| `features` | jsonb | YES | `'[]'::jsonb` |
| `name` | varchar | NO | — |
| `max_occupancy` | integer | NO | `2` |
| `room_size` | numeric | YES | — |
| `bed_configuration` | varchar | YES | — |

Contoh value `custom_room_types.images`: tabel saat ini **kosong (0 rows)** — fallback chain di UI me-handle empty case dengan auto-borrow dari kamar lain dengan tipe sama (lihat 3d).

### 3b. Endpoint `POST /api/rooms/upload-image`

Source: `src/app/api/rooms/upload-image/route.ts`.

**Validasi Zod** (`route.ts:6-19`):

```ts
const ImageSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "File size should be less than 5MB",
    })
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      { message: "File type should be JPEG, PNG, or WebP" },
    ),
});
```

**Auth gate** (`route.ts:22-29`):

```ts
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

**Request body** (multipart FormData):
- `file: File` (required) — JPEG/PNG/WebP, ≤5MB
- `roomId: string` (optional, default `"unassigned"`) — namespace folder

**Storage path** (`route.ts:52-53`):

```ts
const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
const filepath = `${roomId}/${Date.now()}.${ext}`;
// e.g. "72379ec4-0bdb-4f41-93f9-70c597148fa2/1715438400000.jpg"
```

**Response** (`route.ts:72-76`):

```json
{
  "url": "https://<project>.supabase.co/storage/v1/object/public/room-images/<roomId>/<timestamp>.<ext>",
  "pathname": "<roomId>/<timestamp>.<ext>",
  "contentType": "image/jpeg"
}
```

### 3c. RLS policies untuk bucket `room-images`

Hasil query `pg_policies` schema `storage.objects`:

| Policy Name | Operation | Role | Condition |
|---|---|---|---|
| `Public read room-images` | SELECT | `public` | `bucket_id = 'room-images'` |
| `Authenticated upload room-images` | INSERT | `authenticated` | WITH CHECK `bucket_id = 'room-images'` |
| `Authenticated update room-images` | UPDATE | `authenticated` | `bucket_id = 'room-images'` |
| `Authenticated delete room-images` | DELETE | `authenticated` | `bucket_id = 'room-images'` |

**Bucket config** (`storage.buckets`):

```
id: room-images · public: true · file_size_limit: 5242880 (5MB)
allowed_mime_types: [image/jpeg, image/png, image/webp]
```

### 3d. Fallback chain (4 level — exact order)

Source: `src/app/rooms/page.tsx:1430-1452`:

```tsx
{/* Rooms Grid — auto-rows-fr memastikan semua row punya tinggi sama */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
  {(() => {
    // Build per-type image fallback dari rooms lain
    const firstImageByType: Record<string, string> = {}
    for (const r of rooms) {
      if (r.image_url && !firstImageByType[r.type]) {
        firstImageByType[r.type] = r.image_url
      }
    }
    return filteredRooms.map((room) => {
      const typeImages = typeImagesByName[room.type] || []
      const displayImage =
        room.image_url ||                  // 1. per-room upload (paling spesifik)
        typeImages[0] ||                   // 2. custom_room_types.images[0]
        firstImageByType[room.type] ||     // 3. auto-borrow dari kamar tipe sama
        null                               // 4. placeholder icon (ImageIcon)
```

Urutan: **`room.image_url` → `custom_room_types.images[0]` → `firstImageByType[type]` (auto-borrow) → `null` (ImageIcon placeholder)**.

Khusus chatbot `RoomCard.tsx:54-59` punya gallery merge berbeda:

```ts
const gallery = useMemo(() => {
  const all = [room.image_url, ...(room.images || [])].filter(Boolean);
  return Array.from(new Set(all)); // dedup
}, [room.image_url, room.images]);
```

### 3e. Tailwind classes utama (alasan singkat)

| Class | Lokasi | Alasan |
|---|---|---|
| `auto-rows-fr` | grid container (`page.tsx:1431`) | Equalize tinggi semua row jadi `max(card heights)` — fixes inconsistent row alignment |
| `h-56` (224px) | hero image div (`page.tsx:1460, 1475`) | Fixed pixel — image area pixel-perfect identical lintas card (ganti dari `aspect-video` yang ratio-based & variabel) |
| `min-h-[480px]` | `<Card>` (`page.tsx:1457`) | Minimum card height — mencegah card kurus saat data sparse, edit/delete buttons konsisten di bottom |
| `overflow-hidden h-full flex flex-col` | `<Card>` (`page.tsx:1457`) | Card stretch ke baseline grid + flex-col agar `mt-auto` di footer button bekerja |
| `shrink-0` | hero image (`page.tsx:1460, 1475`) | Cegah image area shrink saat content body panjang |

---

## AREA 4 — cekKetersediaan Refactor

### 4a. 2 query terpisah — exact Supabase client calls

Source: `src/app/api/chat/route.ts:251-295`.

**Query 1 — busy room ids dari reservations:**

```ts
const { data: busyBookings, error: busyError } = await supabase
  .from('reservations')
  .select('room_id')
  .not('status', 'in', '("cancelled","no_show")')
  .lt('check_in', checkOut)
  .gt('check_out', checkIn);
```

**Query 2 — available rooms (exclude busy):**

```ts
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
```

**Query 3 — enrich metadata dari custom_room_types (by name, bukan by FK):**

```ts
const uniqueTypes = Array.from(new Set(availableRooms.map((r) => r.type)));
const { data: typeMeta } = await supabase
  .from('custom_room_types')
  .select('name, images, amenities, max_occupancy, room_size, bed_configuration, description')
  .in('name', uniqueTypes);
```

### 4b. Pseudocode JS merge step

`route.ts:297-318` (3-5 baris inti):

```ts
const metaByName = new Map(
  (typeMeta || []).map((t) => [t.name as string, t]),
);
const enrichedRooms = availableRooms.map((r) => {
  const ct = metaByName.get(r.type) ?? {};
  const typeImages = Array.isArray(ct.images) ? ct.images : [];
  const allImages = [r.image_url, ...typeImages].filter(Boolean);
  return {
    ...r,
    image_url: r.image_url || typeImages[0] || null,
    images: Array.from(new Set(allImages)),
    amenities: ct.amenities ?? [],
    max_occupancy: ct.max_occupancy ?? null,
    // ... room_size, bed_configuration, description
  };
});
```

### 4c. Alasan refactor (1 kalimat)

> Single Postgres JOIN tidak memungkinkan karena **tidak ada foreign key formal** antara `rooms.type` (varchar) dan `custom_room_types.name` (varchar) — relasi keduanya adalah **soft reference by string match**, sehingga merge dilakukan di JavaScript via `Map<name, meta>` setelah dua query terpisah.

### 4d. Anotasi ERD — relasi `rooms` ↔ `custom_room_types`

**Persisnya:**
- `rooms.type` (varchar NOT NULL) berisi string `"Standard"` / `"Deluxe"` / `"Suite"` / `"Presidential"` dst.
- `custom_room_types.name` (varchar NOT NULL) berisi string yang sama.
- **Tidak ada** `FOREIGN KEY` constraint di Postgres yang mengikat keduanya.
- **Tidak ada** field `rooms.custom_type_id` (TypeScript types lama menyebutnya, tapi schema aktual tidak punya).
- Implikasi: rename `custom_room_types.name` tidak cascade ke `rooms.type` — perlu update aplikasi manual.

**Notasi ERD yang akurat:**

```
custom_room_types ||..o{ rooms : "categorizes (soft ref by name)"
```

(dashed line `||..o{` menandai soft-reference, bukan FK constraint enforced.)

---

## AREA 5 — File Inventory

### File BARU

| Path | Purpose |
|---|---|
| `src/app/api/rooms/upload-image/route.ts` | Endpoint upload gambar kamar — validasi 5MB JPEG/PNG/WebP, simpan ke Supabase Storage bucket `room-images`, return public URL |
| `src/components/chatbot/LoginPromptCard.tsx` | Login wall card untuk anonymous chatbot user — ShieldCheck icon, 2 benefit bullets, tombol Login/Daftar |
| `scripts/dev-quiet.mjs` | Wrapper `next dev` yang filter warning kosmetik `[baseline-browser-mapping]` line-by-line |
| `skripsi-assets/` (folder) | Thesis asset pipeline: 34 mermaid diagrams + 9 playwright screenshots + manifest + capture/render scripts |
| `docs/THESIS_REVISION_NOTES.md` | (file ini) — ground-truth snapshot v3.1 untuk revisi narasi Word doc |

### File MODIFIED (perubahan utama)

| Path | Ringkasan |
|---|---|
| `src/app/api/chat/route.ts` | Tambah `userContext` injection ke system prompt (GUEST BROWSING MODE vs LOGGED-IN MODE); refactor `cekKetersediaan` jadi 2-query + JS merge by name; emit `SHOW_LOGIN_PROMPT_JSON` marker untuk anonymous booking attempt |
| `src/app/chatbot/page.tsx` | Propagasi `userContext` via `useChat({ body })`; parse `SHOW_LOGIN_PROMPT_JSON` marker; auto-fill `bookingInfo` dari `user.user_metadata` (full_name/email/phone) |
| `src/app/rooms/page.tsx` | Image upload state + drag-area UI di Add/Edit Dialog; ganti tabel → card grid 3-col dengan 4-level fallback chain; layout: `h-56` hero, `min-h-[480px]` card, `auto-rows-fr` grid |
| `src/components/chatbot/RoomCard.tsx` | Total rewrite ke hybrid design — thumbnail 56×56 + tombol "View Details" yang buka Dialog modal dengan carousel + specs grid (kapasitas/ukuran/bed) + amenities chips |
| `src/components/chatbot/InteractiveBookingCard.tsx` | Field `id_number` (KTP) **dihapus** → diganti `phone` (📱) dengan placeholder "Opsional — untuk konfirmasi reservasi"; tambah `placeholder` prop ke `InfoField` |
| `src/app/guests/page.tsx` | `phone` field jadi required (visual `*` + label merah); `id_number` jadi opsional dengan helper text "diisi saat tamu check-in di front desk" |
| `pnpm-workspace.yaml` | Tambah `publicHoistPattern: ['*styled-jsx*']` (migrasi dari `.npmrc` legacy) |
| `package.json` | `"dev"` sekarang panggil `node scripts/dev-quiet.mjs`; tambah `"dev:noisy": "next dev"` sebagai fallback |
| `pnpm-lock.yaml` | Updated dependencies (zod resolve, baseline-browser-mapping cache) |

### Supabase changes (non-file, tracked terpisah)

| Object | Change |
|---|---|
| `public.custom_room_types` policy | Tambah `Public read custom_room_types` (SELECT, role=public, USING true) |
| `storage.buckets` | Buat bucket `room-images` (public, 5MB, [jpeg,png,webp]) |
| `storage.objects` policies | Tambah 4 policies untuk `room-images`: public read + authenticated insert/update/delete |
| `auth.users` + `auth.identities` + `profiles` + `user_roles` | Insert 3 demo accounts: `demo.manager@hotel-asni.com`, `demo.guest@hotel-asni.com`, `demo.admin@hotel-asni.com` |

---

## Anti-patterns yang harus dihindari di narasi

- ❌ Menyebut `id_number` sebagai field reservasi → itu **check-in time**, lokasi di `/guests` management
- ❌ Menyebut FK formal antara `rooms` dan `custom_room_types` → soft-ref by string match (`rooms.type` = `custom_room_types.name`)
- ❌ Mengklaim anonymous user diblokir total → mereka **bisa browse + cek ketersediaan**, hanya **booking** yang butuh login
- ❌ Menyebut `rooms.custom_type_id` → kolom ini **tidak ada** di schema aktual (TypeScript types lama menyesatkan)
- ❌ Menyebut phone wajib di DB level → `guests.phone` nullable di Postgres, required hanya di UI `/guests`
- ❌ Future tense ("akan diimplementasikan") → semua fitur **sudah implemented & deployed**, pakai present/past tense

---

**End of revision notes.** Cross-reference dengan `skripsi-assets/manifest.json` v3.1 untuk update gambar/diagram captions.
