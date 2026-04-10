-- Add a unique constraint to prevent users from bookmarking the same URL multiple times
-- This enforces uniqueness at the database level for each user.
-- NOTE: If you have existing duplicates, this query will fail. 
-- You must delete duplicates manually before running this.

ALTER TABLE bookmarks 
ADD CONSTRAINT unique_user_url UNIQUE (user_id, url);
