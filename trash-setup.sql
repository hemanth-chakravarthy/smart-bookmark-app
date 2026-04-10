-- Migration: Add Trash support to bookmarks
-- Run this in your Supabase SQL Editor

-- 1. Add columns for soft delete
ALTER TABLE bookmarks 
ADD COLUMN IF NOT EXISTS is_trashed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- 2. Create index for performance on filtering
CREATE INDEX IF NOT EXISTS idx_bookmarks_is_trashed ON bookmarks(is_trashed);

-- 3. (Optional) Auto-delete items older than 30 days
-- Note: This requires the pg_cron extension to be enabled in your Supabase instance.
-- If you don't use pg_cron, you can skip this and we will implement a client-side cleanup.

/*
SELECT cron.schedule(
    'delete-old-trash',
    '0 0 * * *', -- Every night at midnight
    $$ DELETE FROM bookmarks WHERE is_trashed = true AND deleted_at < now() - interval '30 days' $$
);
*/
