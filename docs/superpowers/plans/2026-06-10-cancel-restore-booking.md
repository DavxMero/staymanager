# Cancel/Restore Booking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Soft-cancel + restore for reservations (Shneiderman "easy reversal of actions") — staff UI on /occupancy + /guests, chatbot tools, undo snackbar, audit columns, Playwright API tests.

**Architecture:** New POST routes `/api/bookings/[id]/cancel|restore` backed by a server-side RBAC helper (`server-permissions.ts`). Cancel flips status to `cancelled` (the GiST exclusion constraint `no_overlap_active_reservations` auto-frees the room — no inventory writes). Restore flips back to `confirmed` and surfaces exclusion violation 23P01 as 409. A shared `BookingActions` client component provides confirm-dialog cancel + sonner Undo toast + persistent Restore. Chatbot gains `getMyBookings` + `cancelBooking` tools with the same ownership/transition rules.

**Tech Stack:** Next.js 16 App Router, Supabase (service-role + SSR clients), Vercel AI SDK tools (Gemini 2.5-flash), @radix-ui/react-dialog (existing ui/dialog), sonner, @playwright/test request API.

**Verified facts (do not re-derive):**
- `reservations.status` enum already has `cancelled`. No enum migration.
- Exclusion constraint only covers `confirmed`/`checked-in` → cancel frees room automatically; restore can fail 23P01.
- Sonner `<Toaster />` already mounted in `src/app/layout.tsx:93`.
- `scripts/setup-e2e-test-users.mjs` is currently BROKEN: references undefined `PASSWORD` (lines 91, 97, 122) and has no guest-role users — must fix before tests.
- `playwright.config.ts` `testMatch` only covers docs/verification specs — new tests need their own project entry.
- Permission keys: `*` (super_admin), `occupancy`, `guests` (see `src/components/app-sidebar.tsx:53-54`).
- Occupancy `CheckinDialog` fetches only `status='confirmed'` rows via `adminFetchCheckinReservations` — cancelled rows need a new fetch.

---

### Task 1: DB migration — audit columns

**Files:**
- Create: `supabase/migrations/20260610090000_add_reservation_cancellation_audit.sql`
- Apply: live project `ncjneagfadrmivgicszm` via Supabase MCP `apply_migration`

- [ ] **Step 1: Write the SQL file**

```sql
-- Soft-cancel audit columns (Shneiderman: easy reversal of actions).
-- Set on cancel, reset to NULL on restore. No enum change needed:
-- reservations.status already includes 'cancelled'.
alter table public.reservations
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancelled_by uuid,
  add column if not exists cancellation_reason text;
```

- [ ] **Step 2: Apply via MCP** `apply_migration(project_id: ncjneagfadrmivgicszm, name: add_reservation_cancellation_audit, query: <SQL above>)`

- [ ] **Step 3: Verify** — `execute_sql`: `select column_name from information_schema.columns where table_name='reservations' and column_name in ('cancelled_at','cancelled_by','cancellation_reason');` Expected: 3 rows.

- [ ] **Step 4: Commit** `git add supabase/migrations && git commit -m "feat(db): cancellation audit columns on reservations"`

---

### Task 2: Server RBAC helper

**Files:**
- Create: `src/lib/auth/server-permissions.ts`

- [ ] **Step 1: Write the helper**

```ts
import { createClient as createServerSupabase } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

// Service-role client: reads user_roles/roles regardless of RLS.
const serviceClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

export interface ServerUserContext {
  userId: string;
  email: string | null;
  permissions: string[];
  roles: string[];
}

/**
 * Resolve the calling user server-side. Accepts either:
 * - Authorization: Bearer <supabase access token> (API tests, programmatic)
 * - Supabase SSR auth cookies (browser)
 * Returns null when unauthenticated.
 */
export async function getServerUserContext(request?: Request): Promise<ServerUserContext | null> {
  let userId: string | null = null;
  let email: string | null = null;

  const authHeader = request?.headers.get('authorization');
  if (authHeader?.toLowerCase().startsWith('bearer ')) {
    const { data, error } = await serviceClient.auth.getUser(authHeader.slice(7).trim());
    if (!error && data.user) {
      userId = data.user.id;
      email = data.user.email ?? null;
    }
  }

  if (!userId) {
    try {
      const ssr = await createServerSupabase();
      const { data: { user } } = await ssr.auth.getUser();
      if (user) {
        userId = user.id;
        email = user.email ?? null;
      }
    } catch {
      // outside a request scope (no cookies) — fall through to null
    }
  }

  if (!userId) return null;

  const { data: userRoles } = await serviceClient
    .from('user_roles')
    .select('role:roles(name, permissions)')
    .eq('user_id', userId);

  const roles: string[] = [];
  const permissions = new Set<string>();
  for (const ur of (userRoles ?? []) as Array<{ role: { name: string; permissions: string[] | null } | null }>) {
    if (!ur.role) continue;
    roles.push(ur.role.name);
    for (const p of ur.role.permissions ?? []) permissions.add(p);
  }

  return { userId, email, permissions: Array.from(permissions), roles };
}

/** Staff who manage bookings: super_admin (*), occupancy, or guests permission. */
export function canManageBookings(ctx: ServerUserContext): boolean {
  return (
    ctx.permissions.includes('*') ||
    ctx.permissions.includes('occupancy') ||
    ctx.permissions.includes('guests')
  );
}

/** Guests may only touch their own booking — matched by email, case-insensitive. */
export function ownsReservation(ctx: ServerUserContext, guestEmail: string | null): boolean {
  return Boolean(ctx.email && guestEmail && guestEmail.toLowerCase() === ctx.email.toLowerCase());
}
```

- [ ] **Step 2: Typecheck** `pnpm exec tsc --noEmit` — expected: no new errors (pre-existing errors unrelated to this file are acceptable; record baseline first).

- [ ] **Step 3: Commit** `git commit -m "feat(auth): server-side permission helper for booking actions"`

---

### Task 3: Fix + extend E2E user seeding

**Files:**
- Modify: `scripts/setup-e2e-test-users.mjs`

- [ ] **Step 1: Fix undefined `PASSWORD` and add guest users.** In `USERS`, append:

```js
  { email: 'e2e.guest@staymanager.test',  roleName: 'guest', mode: 'create', password: E2E_PASSWORD },
  { email: 'e2e.guest2@staymanager.test', roleName: 'guest', mode: 'create', password: E2E_PASSWORD },
```

In `setupUser`, destructure `password` and use it instead of the undefined `PASSWORD`:

```js
async function setupUser({ email, roleName, mode, password }) {
  // ...
    const { error } = await supabase.auth.admin.updateUserById(userId, { password });
  // ...
      password,
```

Final log: `` console.log(`\nAll users ready. E2E password: ${E2E_PASSWORD}`); ``

- [ ] **Step 2: Run it** `node scripts/setup-e2e-test-users.mjs` — expected: ✓ lines for all users, exit 0.

- [ ] **Step 3: Commit** `git commit -m "fix(e2e): repair undefined PASSWORD, seed guest-role test users"`

---

### Task 4: Playwright project for API tests

**Files:**
- Modify: `playwright.config.ts`

- [ ] **Step 1: Add an `api` project** (project-level `testDir` overrides the top-level one):

```ts
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'api',
      testDir: './tests/api',
      testMatch: ['**/*.spec.ts'],
    },
  ],
```

- [ ] **Step 2: Verify discovery** `pnpm exec playwright test --project=api --list` — expected: "no tests found" error is fine until Task 5 (or 0 tests listed).

- [ ] **Step 3: Commit** `git commit -m "test: playwright api project for request-level specs"`

---

### Task 5: API tests (written first — must FAIL with 404 before routes exist)

**Files:**
- Create: `tests/api/bookings-cancel.spec.ts`

- [ ] **Step 1: Write the spec.** Auth = `Authorization: Bearer` tokens from password sign-in; seeding via service-role client; rows tagged `notes: E2E_TAG` and hard-deleted in cleanup (test rows only — the soft-delete rule applies to the app, not test hygiene).

```ts
import { test, expect, request as pwRequest, type APIRequestContext } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const env = readFileSync('.env.local', 'utf8');
const SUPABASE_URL = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1].trim() ?? '';
const ANON_KEY = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1].trim().replace(/^["']|["']$/g, '') ?? '';
const SERVICE_KEY = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1].trim().replace(/^["']|["']$/g, '') ?? '';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const E2E_PASSWORD = 'E2eTestPass123!';
const OWNER_EMAIL = 'e2e.guest@staymanager.test';
const OTHER_EMAIL = 'e2e.guest2@staymanager.test';
const E2E_TAG = 'E2E-CANCEL-TEST';

const service: SupabaseClient = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let api: APIRequestContext;
let ownerToken: string;
let otherToken: string;
let room: { id: string; number: string; type: string };
// far-future, run-unique window to dodge the GiST exclusion constraint across runs
const dayBase = 1500 + (Math.floor(Date.now() / 86_400_000) % 3000);

function isoDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

async function signIn(email: string): Promise<string> {
  const anon = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
  const { data, error } = await anon.auth.signInWithPassword({ email, password: E2E_PASSWORD });
  if (error || !data.session) throw new Error(`Sign-in failed for ${email}: ${error?.message}`);
  return data.session.access_token;
}

let seedSeq = 0;
async function seedReservation(opts: { status: string; email?: string; offset: number }) {
  seedSeq += 1;
  const suffix = `${Date.now().toString().slice(-6)}${seedSeq}`;
  const { data, error } = await service
    .from('reservations')
    .insert({
      booking_id: `E2E${suffix}`,
      booking_reference: `E2EREF${suffix}`,
      guest_name: 'E2E Cancel Test',
      guest_email: opts.email ?? OWNER_EMAIL,
      guest_phone: '0800000000',
      room_id: room.id,
      room_number: room.number,
      room_type: room.type,
      check_in: isoDate(dayBase + opts.offset),
      check_out: isoDate(dayBase + opts.offset + 2),
      adults: 1,
      children: 0,
      guest_count: 1,
      room_rate: 100000,
      room_total: 200000,
      total_amount: 200000,
      total_price: 200000,
      status: opts.status,
      payment_status: 'pending',
      notes: E2E_TAG,
    })
    .select('id, status')
    .single();
  if (error) throw new Error(`Seed failed: ${error.message}`);
  return data;
}

test.beforeAll(async () => {
  await service.from('reservations').delete().eq('notes', E2E_TAG);
  const { data: rooms } = await service.from('rooms').select('id, number, type').limit(1);
  if (!rooms?.length) throw new Error('No rooms in DB to seed against');
  room = rooms[0];
  ownerToken = await signIn(OWNER_EMAIL);
  otherToken = await signIn(OTHER_EMAIL);
  api = await pwRequest.newContext({ baseURL: BASE_URL });
});

test.afterAll(async () => {
  await service.from('reservations').delete().eq('notes', E2E_TAG);
  await api?.dispose();
});

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

test('unauthenticated cancel → 401', async () => {
  const res = await seedReservation({ status: 'confirmed', offset: 0 });
  const resp = await api.post(`/api/bookings/${res.id}/cancel`, { data: {} });
  expect(resp.status()).toBe(401);
});

test('owner cancels own confirmed booking → 200, audit columns set', async () => {
  const res = await seedReservation({ status: 'confirmed', offset: 10 });
  const resp = await api.post(`/api/bookings/${res.id}/cancel`, {
    headers: authHeaders(ownerToken),
    data: { reason: 'rencana berubah' },
  });
  expect(resp.status()).toBe(200);
  const body = await resp.json();
  expect(body.reservation.status).toBe('cancelled');
  expect(body.reservation.cancelled_at).toBeTruthy();
  expect(body.reservation.cancelled_by).toBeTruthy();
  expect(body.reservation.cancellation_reason).toBe('rencana berubah');
});

test('non-owner guest cancel → 403', async () => {
  const res = await seedReservation({ status: 'confirmed', offset: 20 });
  const resp = await api.post(`/api/bookings/${res.id}/cancel`, {
    headers: authHeaders(otherToken),
    data: {},
  });
  expect(resp.status()).toBe(403);
});

test('cancel checked-out booking → 400', async () => {
  const res = await seedReservation({ status: 'checked-out', offset: 30 });
  const resp = await api.post(`/api/bookings/${res.id}/cancel`, {
    headers: authHeaders(ownerToken),
    data: {},
  });
  expect(resp.status()).toBe(400);
});

test('restore cancelled booking → 200, audit columns cleared', async () => {
  const res = await seedReservation({ status: 'confirmed', offset: 40 });
  await api.post(`/api/bookings/${res.id}/cancel`, { headers: authHeaders(ownerToken), data: {} });
  const resp = await api.post(`/api/bookings/${res.id}/restore`, { headers: authHeaders(ownerToken) });
  expect(resp.status()).toBe(200);
  const body = await resp.json();
  expect(body.reservation.status).toBe('confirmed');
  expect(body.reservation.cancelled_at).toBeNull();
  expect(body.reservation.cancelled_by).toBeNull();
  expect(body.reservation.cancellation_reason).toBeNull();
});

test('restore after room rebooked → 409', async () => {
  const resA = await seedReservation({ status: 'confirmed', offset: 50 });
  const cancelResp = await api.post(`/api/bookings/${resA.id}/cancel`, {
    headers: authHeaders(ownerToken),
    data: {},
  });
  expect(cancelResp.status()).toBe(200);
  // same room, same window, different guest — takes the slot
  await seedReservation({ status: 'confirmed', email: OTHER_EMAIL, offset: 50 });
  const resp = await api.post(`/api/bookings/${resA.id}/restore`, { headers: authHeaders(ownerToken) });
  expect(resp.status()).toBe(409);
  const body = await resp.json();
  expect(body.error).toContain('sudah dipesan');
});

test('unknown booking id → 404', async () => {
  const resp = await api.post(`/api/bookings/00000000-0000-0000-0000-000000000000/cancel`, {
    headers: authHeaders(ownerToken),
    data: {},
  });
  expect(resp.status()).toBe(404);
});
```

- [ ] **Step 2: Run to verify failure** (dev server running: `pnpm dev` in background). `pnpm exec playwright test --project=api` — expected: FAIL, every test gets 404 (routes don't exist yet).

- [ ] **Step 3: Commit** `git commit -m "test(api): cancel/restore booking spec (failing — routes pending)"`

---

### Task 6: Cancel route

**Files:**
- Create: `src/app/api/bookings/[id]/cancel/route.ts`

- [ ] **Step 1: Implement**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { canManageBookings, getServerUserContext, ownsReservation } from '@/lib/auth/server-permissions';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const CANCELLABLE_STATUSES = ['pending', 'confirmed'];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const ctx = await getServerUserContext(request);
    if (!ctx) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: reservation } = await supabase
      .from('reservations')
      .select('id, status, guest_email')
      .eq('id', id)
      .maybeSingle();

    if (!reservation) {
      return NextResponse.json({ error: 'Reservasi tidak ditemukan' }, { status: 404 });
    }

    if (!canManageBookings(ctx) && !ownsReservation(ctx, reservation.guest_email)) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki akses untuk membatalkan reservasi ini' },
        { status: 403 },
      );
    }

    if (!CANCELLABLE_STATUSES.includes(reservation.status)) {
      return NextResponse.json(
        { error: `Reservasi berstatus "${reservation.status}" tidak dapat dibatalkan` },
        { status: 400 },
      );
    }

    let reason: string | null = null;
    try {
      const body = await request.json();
      if (typeof body?.reason === 'string' && body.reason.trim()) {
        reason = body.reason.trim();
      }
    } catch {
      // empty body is fine
    }

    // .in() guards against a concurrent status change between read and write
    const { data: updated, error } = await supabase
      .from('reservations')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: ctx.userId,
        cancellation_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .in('status', CANCELLABLE_STATUSES)
      .select()
      .maybeSingle();

    if (error) {
      console.error('[bookings/cancel] update error:', error);
      return NextResponse.json({ error: 'Gagal membatalkan reservasi' }, { status: 500 });
    }
    if (!updated) {
      return NextResponse.json(
        { error: 'Status reservasi berubah, silakan muat ulang' },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, reservation: updated });
  } catch (err) {
    console.error('[bookings/cancel] unexpected:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Run cancel-side tests** `pnpm exec playwright test --project=api -g "cancel"` — expected: cancel tests PASS, restore tests still fail.

- [ ] **Step 3: Commit** `git commit -m "feat(api): POST /api/bookings/[id]/cancel with RBAC + ownership"`

---

### Task 7: Restore route

**Files:**
- Create: `src/app/api/bookings/[id]/restore/route.ts`

- [ ] **Step 1: Implement** (23P01 = Postgres exclusion violation from `no_overlap_active_reservations`)

```ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { canManageBookings, getServerUserContext, ownsReservation } from '@/lib/auth/server-permissions';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const ctx = await getServerUserContext(request);
    if (!ctx) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: reservation } = await supabase
      .from('reservations')
      .select('id, status, guest_email')
      .eq('id', id)
      .maybeSingle();

    if (!reservation) {
      return NextResponse.json({ error: 'Reservasi tidak ditemukan' }, { status: 404 });
    }

    if (!canManageBookings(ctx) && !ownsReservation(ctx, reservation.guest_email)) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki akses untuk memulihkan reservasi ini' },
        { status: 403 },
      );
    }

    if (reservation.status !== 'cancelled') {
      return NextResponse.json(
        { error: `Hanya reservasi berstatus "cancelled" yang dapat dipulihkan (saat ini "${reservation.status}")` },
        { status: 400 },
      );
    }

    const { data: updated, error } = await supabase
      .from('reservations')
      .update({
        status: 'confirmed',
        cancelled_at: null,
        cancelled_by: null,
        cancellation_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('status', 'cancelled')
      .select()
      .maybeSingle();

    if (error) {
      // GiST exclusion constraint: room was rebooked while this was cancelled
      if (error.code === '23P01') {
        return NextResponse.json(
          { error: 'Kamar sudah dipesan tamu lain pada tanggal tersebut — reservasi tidak dapat dipulihkan' },
          { status: 409 },
        );
      }
      console.error('[bookings/restore] update error:', error);
      return NextResponse.json({ error: 'Gagal memulihkan reservasi' }, { status: 500 });
    }
    if (!updated) {
      return NextResponse.json(
        { error: 'Status reservasi berubah, silakan muat ulang' },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, reservation: updated });
  } catch (err) {
    console.error('[bookings/restore] unexpected:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Run full API suite** `pnpm exec playwright test --project=api` — expected: ALL 7 tests PASS.

- [ ] **Step 3: Commit** `git commit -m "feat(api): POST /api/bookings/[id]/restore — 409 on rebooked room"`

---

### Task 8: Shared `BookingActions` component

**Files:**
- Create: `src/components/booking/BookingActions.tsx`

- [ ] **Step 1: Implement** (radix dialog via existing `ui/dialog`, sonner toast with 6s Undo, optimistic via `onStatusChange`)

```tsx
'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Ban, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface BookingActionsProps {
  bookingId: string
  status: string
  guestName?: string
  /** Optimistic local update — called with the new status after a successful API call. */
  onStatusChange?: (newStatus: string) => void
}

async function postBookingAction(bookingId: string, action: 'cancel' | 'restore', body?: object) {
  const res = await fetch(`/api/bookings/${bookingId}/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

export function BookingActions({ bookingId, status, guestName, onStatusChange }: BookingActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const canCancel = status === 'confirmed' || status === 'pending'
  const canRestore = status === 'cancelled'

  const handleRestore = async () => {
    setLoading(true)
    try {
      await postBookingAction(bookingId, 'restore')
      onStatusChange?.('confirmed')
      toast.success('Reservasi dipulihkan')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memulihkan reservasi')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    setLoading(true)
    try {
      await postBookingAction(bookingId, 'cancel', reason.trim() ? { reason: reason.trim() } : {})
      onStatusChange?.('cancelled')
      setConfirmOpen(false)
      setReason('')
      toast.success('Reservasi dibatalkan', {
        duration: 6000,
        action: { label: 'Undo', onClick: () => void handleRestore() },
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal membatalkan reservasi')
    } finally {
      setLoading(false)
    }
  }

  if (!canCancel && !canRestore) return null

  return (
    <>
      {canCancel && (
        <Button
          variant="outline"
          size="sm"
          className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40"
          disabled={loading}
          onClick={(e) => {
            e.stopPropagation()
            setConfirmOpen(true)
          }}
        >
          <Ban className="mr-1 h-4 w-4" />
          Batalkan
        </Button>
      )}
      {canRestore && (
        <Button
          variant="outline"
          size="sm"
          className="border-green-300 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950/40"
          disabled={loading}
          onClick={(e) => {
            e.stopPropagation()
            void handleRestore()
          }}
        >
          <RotateCcw className="mr-1 h-4 w-4" />
          {loading ? 'Memulihkan...' : 'Restore'}
        </Button>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Batalkan Reservasi?</DialogTitle>
            <DialogDescription>
              {guestName ? `Reservasi atas nama ${guestName} ` : 'Reservasi ini '}
              akan dibatalkan dan kamar tersedia kembali. Anda dapat memulihkannya
              kembali selama kamar belum dipesan tamu lain.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="cancel-reason">Alasan pembatalan (opsional)</Label>
            <Input
              id="cancel-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="cth: rencana berubah"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={loading}>
              Kembali
            </Button>
            <Button variant="destructive" onClick={() => void handleCancel()} disabled={loading}>
              {loading ? 'Membatalkan...' : 'Ya, Batalkan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
```

- [ ] **Step 2: Typecheck** `pnpm exec tsc --noEmit` — expected: no new errors.

- [ ] **Step 3: Commit** `git commit -m "feat(ui): BookingActions — confirm-dialog cancel, undo toast, restore"`

---

### Task 9: `/guests` integration

**Files:**
- Modify: `src/app/guests/page.tsx` (import block; status badges ~line 633; button row ~line 645)

- [ ] **Step 1: Import** `import { BookingActions } from "@/components/booking/BookingActions"`

- [ ] **Step 2: Add cancelled badge.** In the status badge block, render a "Dibatalkan" badge when `booking?.status === 'cancelled'` instead of the Check In/Out badge:

```tsx
{booking?.status === 'cancelled' ? (
  <Badge variant="destructive">Dibatalkan</Badge>
) : isCheckedOut ? (
  <Badge className="bg-gray-500">Check Out</Badge>
) : (
  <Badge className="bg-blue-500">Check In</Badge>
)}
```

- [ ] **Step 3: Button row.** Hide Check In/Checkout for cancelled rows (`!isCheckedOut && booking?.status !== 'cancelled'`) and add, before the Edit button:

```tsx
{booking && (
  <BookingActions
    bookingId={booking.id}
    status={booking.status}
    guestName={guest.full_name}
    onStatusChange={(newStatus) =>
      setGuests((prev) =>
        prev.map((g) =>
          g.id === guest.id && g.currentBooking
            ? { ...g, currentBooking: { ...g.currentBooking, status: newStatus } }
            : g
        )
      )
    }
  />
)}
```

- [ ] **Step 4: Typecheck + commit** `git commit -m "feat(guests): cancel/restore booking actions on guest rows"`

---

### Task 10: `/occupancy` integration

**Files:**
- Modify: `src/app/occupancy/actions.ts` (new server action)
- Modify: `src/app/occupancy/page.tsx` (CheckinDialog ~line 928: state, fetch, render)

- [ ] **Step 1: New server action** in `actions.ts`:

```ts
export async function adminFetchCancelledReservations(roomId: string | number) {
    const { data, error } = await supabaseAdmin
        .from('reservations')
        .select('*')
        .eq('room_id', roomId)
        .eq('status', 'cancelled')
        .order('check_in', { ascending: true })
        .limit(5)

    if (error) {
        console.error("Admin fetch cancelled reservations error:", error)
        return []
    }
    return data || []
}
```

- [ ] **Step 2: CheckinDialog state + fetch.** Add `const [cancelledReservations, setCancelledReservations] = useState<any[]>([])`; in `fetchReservations`, also `const cancelled = await adminFetchCancelledReservations(String(room.id)); setCancelledReservations(cancelled || [])`. Import `adminFetchCancelledReservations` and `BookingActions`.

- [ ] **Step 3: Cancel button on the selected confirmed reservation.** Inside the reservation card (after the guest detail grid), add:

```tsx
{selectedReservation && (
  <div className="mt-4 flex justify-end">
    <BookingActions
      bookingId={selectedReservation.id}
      status={selectedReservation.status}
      guestName={selectedReservation.guest_name}
      onStatusChange={(newStatus) => {
        if (newStatus === 'cancelled') {
          setCancelledReservations((prev) => [{ ...selectedReservation, status: 'cancelled' }, ...prev])
          setReservations((prev) => prev.filter((r) => r.id !== selectedReservation.id))
          setSelectedReservation(null)
          setIsWalkIn(true)
        }
      }}
    />
  </div>
)}
```

- [ ] **Step 4: Cancelled-reservations section with Restore.** Below the `!isWalkIn ? (...) : (...)` block (still inside Guest Information section):

```tsx
{cancelledReservations.length > 0 && (
  <div className="space-y-2">
    <Label className="text-muted-foreground">Reservasi Dibatalkan</Label>
    {cancelledReservations.map((res) => (
      <div
        key={res.id}
        className="flex items-center justify-between rounded-lg border border-dashed border-red-300 dark:border-red-900 p-3 text-sm"
      >
        <div>
          <span className="font-medium">{res.guest_name}</span>
          <span className="text-muted-foreground ml-2">
            {format(new Date(res.check_in), 'dd MMM')} – {format(new Date(res.check_out), 'dd MMM yyyy')}
          </span>
        </div>
        <BookingActions
          bookingId={res.id}
          status="cancelled"
          guestName={res.guest_name}
          onStatusChange={(newStatus) => {
            if (newStatus === 'confirmed') {
              setCancelledReservations((prev) => prev.filter((r) => r.id !== res.id))
              fetchReservations()
            }
          }}
        />
      </div>
    ))}
  </div>
)}
```

- [ ] **Step 5: Typecheck + commit** `git commit -m "feat(occupancy): cancel/restore inside CheckinDialog"`

---

### Task 11: Chatbot tools (4 → 6) + prompt rules

**Files:**
- Modify: `src/app/api/chat/route.ts`

- [ ] **Step 1: Add `getMyBookings` tool** (after `confirmPayment` in the `tools` object):

```ts
      getMyBookings: tool({
        description: "Get the logged-in guest's own reservations (for review or cancellation). Requires login.",
        parameters: z.object({}),
        execute: async () => {
          if (!verifiedUser?.email) {
            return { success: false, error: 'AUTH_REQUIRED: Silakan login untuk melihat reservasi Anda.' };
          }
          const { data, error } = await supabase
            .from('reservations')
            .select('booking_reference, status, payment_status, room_number, room_type, check_in, check_out, total_amount, cancelled_at')
            .ilike('guest_email', verifiedUser.email)
            .order('created_at', { ascending: false })
            .limit(10);
          if (error) {
            console.error('[TOOL:getMyBookings] error:', error);
            return { success: false, error: 'Gagal mengambil data reservasi.' };
          }
          return { success: true, bookings: data ?? [] };
        },
      }),
```

- [ ] **Step 2: Add `cancelBooking` tool** (same transition + ownership rules as the API):

```ts
      cancelBooking: tool({
        description: 'Cancel one of the logged-in guest\'s own reservations by booking reference. ONLY call after the guest has explicitly confirmed they want to cancel.',
        parameters: z.object({
          bookingReference: z.string().describe('Booking reference (e.g., BK12345678)'),
          reason: z.string().optional().describe('Optional cancellation reason from the guest'),
        }),
        execute: async ({ bookingReference, reason }) => {
          if (!verifiedUser?.email) {
            return { success: false, error: 'AUTH_REQUIRED: Silakan login untuk membatalkan reservasi.' };
          }
          const { data: reservation, error: fetchError } = await supabase
            .from('reservations')
            .select('id, status, guest_email, room_number, check_in, check_out')
            .eq('booking_reference', bookingReference)
            .maybeSingle();
          if (fetchError || !reservation) {
            return { success: false, error: 'Reservasi dengan referensi tersebut tidak ditemukan.' };
          }
          if (!reservation.guest_email || reservation.guest_email.toLowerCase() !== verifiedUser.email.toLowerCase()) {
            console.warn(`[cancelBooking] OWNERSHIP MISMATCH: user=${verifiedUser.email} booking=${reservation.guest_email}`);
            return { success: false, error: 'Anda tidak memiliki akses untuk membatalkan reservasi ini.' };
          }
          if (!['pending', 'confirmed'].includes(reservation.status)) {
            return { success: false, error: `Reservasi berstatus "${reservation.status}" tidak dapat dibatalkan.` };
          }
          const { data: updated, error: updateError } = await supabase
            .from('reservations')
            .update({
              status: 'cancelled',
              cancelled_at: new Date().toISOString(),
              cancelled_by: verifiedUser.id,
              cancellation_reason: reason?.trim() || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', reservation.id)
            .in('status', ['pending', 'confirmed'])
            .select('booking_reference, status, room_number, check_in, check_out')
            .maybeSingle();
          if (updateError || !updated) {
            console.error('[TOOL:cancelBooking] update error:', updateError);
            return { success: false, error: 'Gagal membatalkan reservasi. Silakan coba lagi.' };
          }
          return {
            success: true,
            bookingReference: updated.booking_reference,
            status: 'cancelled',
            message: 'Reservasi berhasil dibatalkan. Kamar telah tersedia kembali untuk tamu lain. Jika berubah pikiran, hubungi resepsionis untuk memulihkan reservasi (selama kamar belum dipesan tamu lain).',
          };
        },
      }),
```

- [ ] **Step 3: Prompt updates** (3 edits):
  1. `# Tools` intro: "four tools" → "six tools"; append tool docs:
     ```
     - getMyBookings()
       Returns the logged-in guest's own reservations (with booking references and statuses). AUTH_REQUIRED for anonymous guests.
     - cancelBooking(bookingReference, reason?)
       Cancels the guest's own reservation. Only allowed from status pending/confirmed. ONLY call after explicit textual confirmation.
     ```
  2. Anti-hallucination rule 3 carve-out: `3. NEVER reveal a booking reference until confirmPayment has returned successfully. EXCEPTION: references returned by getMyBookings are the guest's own existing bookings and MAY be shown.`
  3. New section before `# Anonymous`:
     ```
     # Cancellation flow
     1. When the guest asks to cancel a booking, call getMyBookings first to list their reservations (unless they already gave an exact booking reference that getMyBookings has confirmed this session).
     2. ALWAYS ask textual confirmation before cancelling: "Apakah Anda yakin ingin membatalkan reservasi {bookingReference} ({roomType}, {check_in} – {check_out})?" Wait for an explicit yes.
     3. Only after the guest explicitly confirms, call cancelBooking. Never cancel based on an ambiguous message.
     4. After a successful cancel, tell the guest the room is released and that the front office can restore the booking if they change their mind (subject to availability).
     5. Anonymous guests: emit SHOW_LOGIN_PROMPT_JSON instead.
     ```

- [ ] **Step 4: Typecheck + manual smoke** (dev server): logged-in chat "batalkan booking saya" → bot lists bookings, asks confirmation, cancels only after "ya".

- [ ] **Step 5: Commit** `git commit -m "feat(chatbot): getMyBookings + cancelBooking tools with confirmation rule"`

---

### Task 12: Final verification + deliverables

- [ ] **Step 1: Full API suite** `pnpm exec playwright test --project=api` — all pass.
- [ ] **Step 2: `pnpm lint` + `pnpm exec tsc --noEmit`** — no new errors vs baseline.
- [ ] **Step 3: Manual test script** (deliverable, included in final summary):
  1. Login as staff → `/guests` → pick a guest with a confirmed booking → "Batalkan" → confirm dialog → reason → "Ya, Batalkan".
  2. Verify: toast "Reservasi dibatalkan" with Undo; row badge flips to "Dibatalkan"; Check In button gone; Restore button shown.
  3. In Supabase: `select status, cancelled_at, cancelled_by, cancellation_reason from reservations where id = '<id>'` → cancelled + audit set.
  4. `/occupancy` → the room shows as free; chatbot `cekKetersediaan` for those dates now includes the room.
  5. Click Undo within 6s (or persistent Restore) → status back to confirmed, audit columns NULL.
  6. Rebook same room/dates via chatbot or staff, then attempt Restore → red toast "Kamar sudah dipesan tamu lain…".
  7. Chatbot as logged-in guest: "saya mau batalkan reservasi" → bot lists bookings → asks "yakin?" → "ya" → cancelled.
- [ ] **Step 4: Final commit** of plan checkboxes + summary message with changed-file list and schema diff.
