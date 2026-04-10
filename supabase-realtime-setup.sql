-- Ensure we send the old record ID on deletes so the frontend can filter it out
alter table bookmarks replica identity full;
alter table folders replica identity full;

-- Check if publication exists and add tables if they aren't already there
-- (If these fail because they are already added, you can safely ignore the errors)
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'bookmarks') then
    alter publication supabase_realtime add table bookmarks;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'folders') then
    alter publication supabase_realtime add table folders;
  end if;
end $$;
