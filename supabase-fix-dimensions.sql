-- 1. Drop the old function first so we can change the vector size
drop function if exists match_bookmarks;

-- 2. Alter the embedding column to the correct size
alter table bookmarks 
alter column embedding type vector(3072);

-- 3. Re-create the function with vector(3072)
create or replace function match_bookmarks (
  query_embedding vector(3072),
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
