-- Supabase SQL updates for Folders and pgvector (P2 Features)

-- 1. Create folders table
create table if not exists folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  parent_id uuid references folders(id) on delete cascade,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable RLS on folders
alter table folders enable row level security;
create policy "Users can modify their own folders"
  on folders for all using (auth.uid() = user_id);

-- 2. Add folder_id to bookmarks
alter table bookmarks add column if not exists folder_id uuid references folders(id) on delete set null;

-- 3. Enable pgvector
create extension if not exists vector;

-- 4. Add embedding to bookmarks (text-embedding-004 is 768 dimensions)
alter table bookmarks add column if not exists embedding vector(768);

-- 5. Create a function to match bookmarks (Semantic Search)
create or replace function match_bookmarks (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  user_id_param uuid
)
returns table (
  id uuid,
  title text,
  url text,
  description text,
  tags text[],
  folder_id uuid,
  created_at timestamp with time zone,
  similarity float
)
language sql stable
as $$
  select
    bookmarks.id,
    bookmarks.title,
    bookmarks.url,
    bookmarks.description,
    bookmarks.tags,
    bookmarks.folder_id,
    bookmarks.created_at,
    1 - (bookmarks.embedding <=> query_embedding) as similarity
  from bookmarks
  where bookmarks.user_id = user_id_param
    and 1 - (bookmarks.embedding <=> query_embedding) > match_threshold
  order by bookmarks.embedding <=> query_embedding
  limit match_count;
$$;
