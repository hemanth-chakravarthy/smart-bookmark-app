-- ==========================================
-- SMART BOOKMARK PROTOCOL
-- Consolidated Database Schema & Configuration (Hardened)
-- ==========================================

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector"; -- Required for semantic search

-- 2. Folders Table
CREATE TABLE IF NOT EXISTS folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. Bookmarks Table
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  is_trashed BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  embedding VECTOR(768), -- Optimized for Google Text-Embedding-004
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Unique Constraint: Prevent duplicate bookmarks per user
  CONSTRAINT unique_user_url UNIQUE (user_id, url)
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies (Bookmarks)
CREATE POLICY "Users can manage their own bookmarks"
  ON bookmarks FOR ALL
  USING (auth.uid() = user_id);

-- 6. RLS Policies (Folders)
CREATE POLICY "Users can manage their own folders"
  ON folders FOR ALL
  USING (auth.uid() = user_id);

-- 7. Real-time Infrastructure
ALTER TABLE bookmarks REPLICA IDENTITY FULL;
ALTER TABLE folders REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'bookmarks') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'folders') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE folders;
  END IF;
END $$;

-- 8. SECURE SEARCH FUNCTION (RPC)
-- Hardened: Strictly enforces auth.uid() filtering to prevent cross-user data leaks
CREATE OR REPLACE FUNCTION match_bookmarks (
  query_embedding VECTOR(768),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  url TEXT,
  title TEXT,
  description TEXT,
  tags TEXT[],
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER -- Runs as system to access the vector index
AS $$
BEGIN
  RETURN QUERY
  SELECT
    bookmarks.id,
    bookmarks.url,
    bookmarks.title,
    bookmarks.description,
    bookmarks.tags,
    1 - (bookmarks.embedding <=> query_embedding) AS similarity
  FROM bookmarks
  WHERE (1 - (bookmarks.embedding <=> query_embedding) > match_threshold)
    AND bookmarks.user_id = auth.uid() -- STRICT SECURITY GUARD
    AND bookmarks.is_trashed = FALSE
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- 9. AUTO-TRASH PURGE FUNCTION
-- Can be scheduled via pg_cron: SELECT purge_old_trash();
CREATE OR REPLACE FUNCTION purge_old_trash()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM bookmarks
  WHERE is_trashed = TRUE
    AND deleted_at < NOW() - INTERVAL '30 days';
END;
$$;

-- 10. Technical Indexes
CREATE INDEX IF NOT EXISTS idx_bookmarks_tags ON bookmarks USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
