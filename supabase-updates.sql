-- 1. Add tags array column to bookmarks table
alter table bookmarks add column if not exists tags text[] default '{}';

-- 2. Create an index to make tag filtering exceptionally fast
create index if not exists idx_bookmarks_tags on bookmarks using gin (tags);
