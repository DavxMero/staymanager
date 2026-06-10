#!/usr/bin/env node
/**
 * Setup E2E test users untuk Playwright BBT spec.
 * Uses Supabase Admin API (service_role key) untuk reset password +
 * create dedicated test users.
 *
 * Idempotent — safe to re-run.
 *
 * Test users:
 *   demo.admin@hotel-asni.com     → super_admin  (existing, reset password)
 *   demo.manager@hotel-asni.com   → manager       (existing, reset password)
 *   demo.guest@hotel-asni.com     → guest         (existing, reset password)
 *   e2e.frontdesk@staymanager.test → front_desk   (create if missing)
 *
 * Password (semua): E2eTestPass123!
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const env = readFileSync('.env.local', 'utf8');
const SUPABASE_URL = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1].trim();
const SERVICE_KEY = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1].trim().replace(/^["']|["']$/g, '');

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// E2E test password — hanya untuk akun e2e.* (NEVER touch demo.* prod accounts)
const E2E_PASSWORD = 'E2eTestPass123!';

// Production demo accounts — passwords yang di-publish di Google Form responden.
// JANGAN ganti tanpa update Google Form section dulu.
const PROD_DEMO_PASSWORDS = {
  'demo.manager@hotel-asni.com': 'DemoManager2026!',
  // Tambah demo.admin + demo.guest password aktual di sini kalau Dava sudah konfirmasi
};

const USERS = [
  // RESTORE prod password (gue tadi keliru reset ke E2eTestPass)
  { email: 'demo.manager@hotel-asni.com',   roleName: 'manager',     mode: 'restore', password: PROD_DEMO_PASSWORDS['demo.manager@hotel-asni.com'] },
  // E2E-only accounts — tidak referenced di Form
  { email: 'e2e.superadmin@staymanager.test', roleName: 'super_admin', mode: 'create', password: E2E_PASSWORD },
  { email: 'e2e.manager@staymanager.test',    roleName: 'manager',     mode: 'create', password: E2E_PASSWORD },
  { email: 'e2e.frontdesk@staymanager.test',  roleName: 'front_desk',  mode: 'create', password: E2E_PASSWORD },
  { email: 'e2e.guest@staymanager.test',      roleName: 'guest',       mode: 'create', password: E2E_PASSWORD },
  { email: 'e2e.guest2@staymanager.test',     roleName: 'guest',       mode: 'create', password: E2E_PASSWORD },
];

async function getRoleId(name) {
  const { data, error } = await supabase.from('roles').select('id').eq('name', name).single();
  if (error) throw new Error(`Role ${name} not found: ${error.message}`);
  return data.id;
}

async function ensureUserRole(userId, roleId) {
  const { data: existing } = await supabase
    .from('user_roles')
    .select('id')
    .eq('user_id', userId)
    .eq('role_id', roleId)
    .maybeSingle();
  if (existing) return 'exists';
  const { error } = await supabase.from('user_roles').insert({ user_id: userId, role_id: roleId });
  if (error) throw new Error(`Failed insert user_roles: ${error.message}`);
  return 'inserted';
}

async function ensurePublicUser(userId, email) {
  const { data: existing } = await supabase.from('users').select('id').eq('id', userId).maybeSingle();
  if (existing) return 'exists';
  const { error } = await supabase.from('users').insert({ id: userId, email });
  if (error) throw new Error(`Failed insert public.users: ${error.message}`);
  return 'inserted';
}

async function setupUser({ email, roleName, mode, password }) {
  const roleId = await getRoleId(roleName);
  let userId;
  let action;

  // Cek existing auth user
  const { data: listData } = await supabase.auth.admin.listUsers({ perPage: 200 });
  const existing = listData?.users.find(u => u.email === email);

  if (existing) {
    userId = existing.id;
    const { error } = await supabase.auth.admin.updateUserById(userId, { password });
    if (error) throw new Error(`Reset password ${email}: ${error.message}`);
    action = 'password-reset';
  } else if (mode === 'create') {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { source: 'e2e-test-setup' },
    });
    if (error) throw new Error(`Create ${email}: ${error.message}`);
    userId = data.user.id;
    action = 'created';
  } else {
    throw new Error(`User ${email} not found and mode=${mode} (expected reset)`);
  }

  await ensurePublicUser(userId, email);
  await ensureUserRole(userId, roleId);
  console.log(`✓ ${email.padEnd(36)} → ${roleName.padEnd(12)} ${action}`);
}

console.log('Setting up E2E test users...\n');
for (const u of USERS) {
  try {
    await setupUser(u);
  } catch (err) {
    console.error(`✗ ${u.email}: ${err.message}`);
    process.exit(1);
  }
}
console.log(`\nAll users ready. E2E password: ${E2E_PASSWORD}`);
