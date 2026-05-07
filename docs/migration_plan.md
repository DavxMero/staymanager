# 🚀 Gemini Chatbot Template Migration Plan

## Overview
Migrating complete Gemini Chatbot template to `/chatbot` route with Supabase integration.

## Database Changes Required

### New Tables
1. **Chat** - Store chat sessions
   - id (uuid, primary key)
   - created_at (timestamp)
   - messages (jsonb)
   - user_id (uuid, FK to auth.users)

2. **Reservation** (for flight booking demo)
   - id (uuid, primary key)
   - created_at (timestamp)
   - details (jsonb)
   - has_completed_payment (boolean)
   - user_id (uuid, FK to auth.users)

## Files to Copy/Migrate

### 1. AI Logic (Upgrade AI SDK v3 → v5)
- ✅ `gemini-chatbot/ai/actions.ts` → `src/ai/actions.ts` (REPLACE)
- ✅ `gemini-chatbot/ai/index.ts` → `src/ai/index.ts` (REPLACE)
- ✅ `gemini-chatbot/ai/custom-middleware.ts` → Keep existing or update

### 2. UI Components (Complete replacement)
- ✅ `gemini-chatbot/components/custom/*` → `src/components/custom/*` (NEW)
- ✅ `gemini-chatbot/components/flights/*` → `src/components/flights/*` (NEW)
- ✅ `gemini-chatbot/components/ui/*` → Merge with existing shadcn components

### 3. API Routes
- ✅ `gemini-chatbot/app/(chat)/api/chat/route.ts` → `src/app/api/chat/route.ts` (REPLACE with Supabase adaptation)
- ✅ `gemini-chatbot/app/(chat)/api/files/upload/route.ts` → `src/app/api/files/upload/route.ts` (NEW)
- ⚠️ Skip history/reservation routes (will implement later if needed)

### 4. Utilities
- ✅ `gemini-chatbot/lib/utils.ts` → Merge functions to `src/lib/utils.ts`

### 5. Page
- ✅ `gemini-chatbot/app/(chat)/page.tsx` → `src/app/chatbot/page.tsx` (REPLACE)

## Adaptations Required

### Database Layer
- ❌ Remove: Drizzle ORM imports
- ✅ Add: Supabase client queries
- ✅ Update: `db/queries.ts` → `lib/supabase-queries.ts` (Supabase version)

### Authentication
- ❌ Remove: NextAuth imports
- ✅ Add: Supabase Auth
- ✅ Update: Session handling to use Supabase session

### AI SDK Upgrades
- ❌ Old: `ai@3.4.9` syntax
- ✅ New: `ai@5.0.98` syntax
- Changes:
  - ✅ `streamText` - same API
  - ✅ `convertToCoreMessages` - same API
  - ✅ Tool definitions - same structure

### Storage
- ❌ Remove: Vercel Blob
- ✅ Add: Supabase Storage for file uploads

## Dependencies to Add
```json
{
  "input-otp": "^1.2.4",
  "geist": "^1.3.1"
}
```

## Step-by-Step Execution

### Phase 1: Database Setup
1. ✅ Create SQL migration script
2. ✅ User runs SQL in Supabase SQL Editor

### Phase 2: Core Files Migration
1. ✅ Copy AI logic files (with AI SDK v5 updates)
2. ✅ Copy all UI components
3. ✅ Copy flight components
4. ✅ Update utilities

### Phase 3: API Routes
1. ✅ Create new API routes with Supabase integration
2. ✅ Replace auth layer with Supabase Auth
3. ✅ Update file upload to use Supabase Storage

### Phase 4: Page Integration
1. ✅ Replace `/chatbot` page
2. ✅ Test routing
3. ✅ Fix imports and paths

### Phase 5: Testing & Validation
1. ✅ Test chatbot functionality
2. ✅ Test tool calling
3. ✅ Test file uploads
4. ✅ Fix any TypeScript errors

## Sidebar Integration (Later)
- Will be handled in Phase 6
- For now, chatbot works standalone on `/chatbot`

## Notes
- Template uses AI SDK v3.4.9, we're on v5.0.98 - mostly compatible
- NextAuth → Supabase Auth migration is critical
- Drizzle → Supabase client migration needed
- Most UI components can be copied as-is
- Flight booking tools serve as demo - can be adapted later for hotel features
