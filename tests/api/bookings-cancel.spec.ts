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
