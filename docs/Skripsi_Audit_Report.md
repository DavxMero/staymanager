# Audit Report — `Skripsi_Final.txt` vs StayManager (Code + Supabase)

**Tanggal audit awal**: 2026-05-07
**Sumber ground truth**:
- Codebase di `e:\Github\staymanager` (commit `e39feef`, branch `master`)
- Supabase project: `ncjneagfadrmivgicszm` ("StayManager", region ap-southeast-1, Postgres 17)

**Verifikasi method**: grep source code + `list_tables` + `execute_sql` ke information_schema.

---

## Status Eksekusi (per 2026-05-07)

| Bagian | Status | Catatan |
|---|---|---|
| A1 (HeroUI/Mantine/react-hook-form/auth-helpers) | ✅ Word agent applied | |
| A2 (lib/rbac.ts → usePermissions.ts) | ✅ Applied | |
| A3 (Next.js 14 → 16, pnpm version) | ✅ Applied | |
| A4 (soft-delete claim) | ✅ Removed | |
| B (Tabel 3.7 schema) | ⏳ Sebagian — 4 tabel tambahan pending paste | payments, roles, user_roles, ai_messages |
| C (Modul Housekeeping) | ✅ Applied | Confirmed: tab di /rooms, 4 task types |
| D (Data empiris) | ⏳ User pilih Level 3, eksekusi 2 minggu | Real data collection |
| E1 (Landing page) | ✅ Sudah konsisten di skripsi | |
| E2 (Auto-create invoice) | ✅ Verified accurate | createCheckoutInvoice di occupancy/page.tsx |
| E3 (Alasan pembatalan) | ✅ Removed via A4 | |

---

## Verifikasi Database Supabase (Production)

**Total tables di public schema**: 27

**Active core entities** (yang punya data atau actively referenced):
1. `rooms`, `custom_room_types` — domain kamar
2. `guests`, `reservations` — domain reservasi
3. `profiles`, `roles`, `user_roles`, `staff_members` — domain user/RBAC
4. `invoices`, `billing_items`, `deposits`, `payments`, `expenses` — domain finansial
5. `inventory_items`, `inventory_suppliers`, `inventory_transactions`, `inventory_purchase_orders`, `inventory_purchase_order_items` — domain logistik
6. `guest_facility_requests`, `guest_facility_items` — domain layanan tamu
7. `housekeeping_tasks` — domain housekeeping
8. `Chat`, `ai_messages` — riwayat chatbot (note: `Chat` capital C)
9. `hotel_settings` — branding/config

**Likely legacy/unused**:
- `service_items`, `room_service_requests`, `users` (custom users table, bukan auth.users)

---

## Klaim yang Sudah Dikoreksi

### Bab 2 (Tinjauan Referensi)
- 2.4.1: "8 entitas utama" → "lebih dari 20 tabel"
- 2.7.2 / 2.8.2: Hapus mention HeroUI
- 2.9.1: `@supabase/auth-helpers-nextjs` → `@supabase/ssr`
- 2.9.3: `lib/rbac.ts`, `hasAnyRole()` → `lib/hooks/usePermissions.ts`, `hasPermission/hasAnyPermission/hasAllPermissions`

### Bab 3 (Metode Penelitian)
- 3.1 Sprint 5: Next.js 14 → Next.js 16
- 3.6.2 Tabel 3.7: schema diperbaiki (booking_code → booking_reference, dst). 4 tabel tambahan pending paste (payments, roles, user_roles, ai_messages)

### Bab 4 (Hasil & Pembahasan)
- 4.1.2 Tabel 4.3: pnpm v10.23.0 → v10.33.0, hapus HeroUI/Mantine
- 4.2.7 Modul Housekeeping: Kanban → tabel task list, koreksi task types ke 4 yang sebenarnya, hapus klaim notifikasi real-time
- 4.3.2.3 Aturan 5: hapus react-hook-form claim
- 4.3.2.3 Aturan 6: hapus soft-delete + alasan pembatalan claim

---

## Pending — Real Data Collection (2 minggu)

User memilih Level 3 (full real, 30 responden) dengan strategi 1 hotel teman sebagai case study.

**Action plan**: lihat [`Interview_Script_dan_Recruitment.md`](Interview_Script_dan_Recruitment.md)

**File pendukung**:
- [`BlackBox_Testing_Checklist.md`](BlackBox_Testing_Checklist.md) — 34 skenario solo execution
- [`UAT_SUS_Questionnaire.md`](UAT_SUS_Questionnaire.md) — Google Forms templates
- [`Interview_Script_dan_Recruitment.md`](Interview_Script_dan_Recruitment.md) — wawancara + UAT recruitment

**Tabel yang dikosongkan sementara**:
- Tabel 3.3 (4 narasumber) — placeholder "[diisi setelah wawancara]"
- Tabel 4.4-4.12 (Black Box) — kolom Status placeholder
- Tabel 4.13-4.14 (UAT) — kolom angka placeholder
- Bab 4.7 + Bab 5.1 — narasi angka spesifik distrip jadi placeholder

---

## Klaim yang DIVERIFIKASI BENAR (jangan diubah)

Untuk referensi penguji / pembimbing:

1. **Gemini 2.5 Flash via @ai-sdk/google** — verified di [`src/app/api/chat/route.ts:17`](src/app/api/chat/route.ts#L17)
2. **4 chatbot tools** (cekKetersediaan, createBooking, getRoomTypes, confirmPayment) — verified di [`src/app/api/chat/route.ts:226-553`](src/app/api/chat/route.ts#L226-L553)
3. **Supabase Realtime** untuk occupancy & dashboard — verified di [`src/app/occupancy/page.tsx:2644`](src/app/occupancy/page.tsx#L2644) dan [`src/components/dashboard/DashboardClient.tsx:107`](src/components/dashboard/DashboardClient.tsx#L107)
4. **Auto-create invoice saat checkout** — verified di [`src/app/occupancy/page.tsx:149`](src/app/occupancy/page.tsx#L149) (`createCheckoutInvoice` di-trigger oleh `handleCheckout`)
5. **6 RBAC roles** (super_admin, manager, front_desk, housekeeping, finance, guest) — verified di tabel `roles` Supabase + logic [`src/lib/hooks/usePermissions.ts`](src/lib/hooks/usePermissions.ts)
6. **Tech stack**: Next.js 16, React 19, TypeScript 5, Tailwind 4, Supabase, shadcn/ui, Radix UI, Zod, Framer Motion, Sonner — verified di [`package.json`](package.json)
7. **Multibahasa ID/EN, pay-now/pay-later, ROOM_CARDS_JSON** — verified di chatbot system prompt

---

## Catatan Insiden

Saat audit pertama (2026-05-07), folder `docs/` tidak sengaja terhapus dari working tree (kemungkinan akibat operasi Word save/sync). File-file dipulihkan dari git index, tapi versi pertama audit report ini hilang. Versi sekarang adalah regenerated copy.

Pelajaran: commit audit report ke git segera setelah selesai supaya tidak hilang.
