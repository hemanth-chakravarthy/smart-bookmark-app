# Implementation Plan

## Product: Smart Bookmark App

---

## 1. Overview

### Project Goal
Build a real-time, secure bookmark manager with authentication, CRUD operations, and polished UI.

### MVP Timeline
**72 Hours**

### Build Philosophy
- Build strictly based on PRD, not assumptions
- Keep backend logic minimal (Supabase handles most)
- Validate each step before moving forward
- Focus on correctness > features

---

## 2. Phase 1: Project Setup & Foundation

---

### Step 1.1: Initialize Project

**Duration:** 1 hour  
**Goal:** Setup Next.js project with Tailwind

#### Tasks

```bash
npx create-next-app@latest smart-bookmark-app --typescript --tailwind --app
cd smart-bookmark-app
npm run dev
```

#### Success Criteria
- [ ] App runs locally
- [ ] Tailwind working
- [ ] App Router enabled

---

### Step 1.2: Supabase Setup

**Duration:** 1 hour  
**Goal:** Configure backend services

#### Tasks

1. Create Supabase project
2. Enable Google OAuth
3. Get API keys
4. Add `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

5. Setup Supabase client

#### Success Criteria
- [ ] Supabase client connects
- [ ] Auth configured

---

### Step 1.3: Database Setup

**Duration:** 1 hour  
**Goal:** Create core schema

#### Tasks

```sql
create table bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  url text not null,
  title text not null,
  description text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Enable RLS
alter table bookmarks enable row level security;

-- Policies
-- SELECT, INSERT, DELETE: user_id = auth.uid()
```

#### Success Criteria
- [ ] Table created
- [ ] RLS working
- [ ] Test insert works

---

## 3. Phase 2: Design System

---

### Step 2.1: Tailwind Setup

**Duration:** 2 hours

#### Tasks

- Add colors from frontend guidelines
- Setup spacing, typography

#### Success Criteria
- [ ] Design tokens usable
- [ ] UI consistent

---

### Step 2.2: Core Components

**Duration:** 3–4 hours

#### Build Components
- Button
- Input
- Card
- Modal

#### Success Criteria
- [ ] Components reusable
- [ ] Match design system
- [ ] Accessible

---

## 4. Phase 3: Authentication

---

### Step 3.1: Google Login

**Duration:** 2 hours

#### Tasks

1. Add login button
2. Use Supabase OAuth

```javascript
supabase.auth.signInWithOAuth({
  provider: "google"
})
```

#### Success Criteria
- [ ] Login works
- [ ] Session persists

---

### Step 3.2: Session Handling

**Duration:** 1 hour

#### Tasks

- Get user session
- Protect routes

#### Success Criteria
- [ ] Redirect if not logged in
- [ ] Session accessible globally

---

## 5. Phase 4: Core Features

---

### Step 4.1: Add Bookmark

**Duration:** 3 hours

#### Tasks

1. Create form UI
2. Validate URL
3. Insert into DB

```javascript
supabase.from("bookmarks").insert({
  url,
  title,
  description,
  user_id
})
```

#### Success Criteria
- [ ] Bookmark saved
- [ ] Error handling works

---

### Step 4.2: View Bookmarks

**Duration:** 2 hours

#### Tasks

```javascript
supabase
  .from("bookmarks")
  .select("*")
  .order("created_at", { ascending: false })
```

#### Success Criteria
- [ ] List loads
- [ ] Empty state shown

---

### Step 4.3: Delete Bookmark

**Duration:** 2 hours

#### Tasks

```javascript
supabase
  .from("bookmarks")
  .delete()
  .eq("id", id)
```

#### Success Criteria
- [ ] Deletes correctly
- [ ] UI updates

---

### Step 4.4: Real-Time Sync

**Duration:** 3 hours

#### Tasks

```javascript
supabase
  .channel("bookmarks")
  .on("postgres_changes", { event: "*", schema: "public", table: "bookmarks" }, handler)
  .subscribe()
```

#### Success Criteria
- [ ] Updates reflect instantly
- [ ] No manual refresh needed

---

## 6. Phase 5: Polish & UX

---

### Step 5.1: UI Improvements

**Duration:** 3 hours

#### Tasks

- Loading states
- Empty states
- Error states
- Responsive layout

#### Success Criteria
- [ ] Clean UI
- [ ] No broken states

---

### Step 5.2: Validation

**Duration:** 1 hour

#### Rules

- URL required
- Valid URL format
- Title required

---

## 7. Phase 6: Deployment

---

### Step 6.1: Deploy to Vercel

**Duration:** 1 hour

#### Tasks

1. Push to GitHub
2. Connect Vercel
3. Add env variables

#### Success Criteria
- [ ] App live
- [ ] Auth works in production

---

### Step 6.2: Final Testing

**Duration:** 1–2 hours

#### Test Cases

- [ ] Login/logout
- [ ] Add bookmark
- [ ] Delete bookmark
- [ ] Real-time sync
- [ ] Error states

---

## 8. MVP Checklist

- [ ] Authentication working
- [ ] Bookmark CRUD working
- [ ] RLS enabled
- [ ] Real-time sync working
- [ ] UI polished
- [ ] App deployed

---

## 9. Post-MVP (Optional)

- Tags system
- Search/filter
- Metadata fetching
- AI summary

---

## Final Note

This plan is optimized for:

- **Speed** (72-hour constraint)
- **Simplicity** (Supabase-first)
- **Reliability** (minimal moving parts)
- **Interview clarity** (easy to explain)