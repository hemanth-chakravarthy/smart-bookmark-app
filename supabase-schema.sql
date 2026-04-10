-- Copy and paste this directly into the Supabase SQL Editor in your dashboard

-- 1. Create the bookmarks table
create table if not exists bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  url text not null,
  title text not null,
  description text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- 2. Enable Row Level Security (RLS)
alter table bookmarks enable row level security;

-- 3. Create RLS Policies
-- Allow users to select their own bookmarks
create policy "Users can view their own bookmarks"
  on bookmarks for select
  using (auth.uid() = user_id);

-- Allow users to insert their own bookmarks
create policy "Users can insert their own bookmarks"
  on bookmarks for insert
  with check (auth.uid() = user_id);

-- Allow users to update their own bookmarks
create policy "Users can update their own bookmarks"
  on bookmarks for update
  using (auth.uid() = user_id);

-- Allow users to delete their own bookmarks
create policy "Users can delete their own bookmarks"
  on bookmarks for delete
  using (auth.uid() = user_id);

-- 4. Enable realtime for the bookmarks table
alter publication supabase_realtime add table bookmarks;
