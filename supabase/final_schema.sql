-- ==========================================
-- SMART BOOKMARK PROTOCOL
-- Consolidated Database Schema & Configuration
-- ==========================================

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
-- Ensure the database sends the full record on updates so the frontend sync is flawless
ALTER TABLE bookmarks REPLICA IDENTITY FULL;
ALTER TABLE folders REPLICA IDENTITY FULL;

-- Add tables to the realtime publication
-- (Ignore errors if already added via Dashboard)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'bookmarks') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'folders') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE folders;
  END IF;
END $$;

-- 8. Technical Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_bookmarks_tags ON bookmarks USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
