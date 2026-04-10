'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Bookmark, Folder } from '@/types';
import { Card } from '@/components/ui/Card';
import { ExternalLink, Trash2, Search, Tag, X, Sparkles, Folder as FolderIcon, Move, RotateCcw, ShieldAlert } from 'lucide-react';
import { formatDistanceToNow, differenceInDays } from 'date-fns';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/Button';

interface BookmarkListProps {
  selectedFolderId: string | 'trash' | null;
  folders: Folder[];
}

export function BookmarkList({ selectedFolderId, folders }: BookmarkListProps) {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  const isTrashView = selectedFolderId === 'trash';

  useEffect(() => {
    if (!user) return;

    fetchBookmarks();

    // --- GLOBAL SYNC LISTENER ---
    // Instead of managing our own channel, we listen to events from the Dashboard
    const handleGlobalSync = (event: any) => {
      const { payload } = event.detail;
      console.log('Bookmark List: Global Sync Detected', payload.eventType);
      
      if (payload.eventType === 'INSERT') {
        const newBookmark = payload.new as Bookmark;
        setBookmarks((prev) => {
          if (prev.some(b => b.id === newBookmark.id)) return prev;
          return [newBookmark, ...prev];
        });
      } else if (payload.eventType === 'DELETE') {
        setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id));
      } else if (payload.eventType === 'UPDATE') {
        const updated = payload.new as Bookmark;
        setBookmarks((prev) =>
          prev.map((b) => (b.id === updated.id ? updated : b))
        );
      }
    };

    window.addEventListener('bookmark-protocol-refresh', handleGlobalSync);

    return () => {
      window.removeEventListener('bookmark-protocol-refresh', handleGlobalSync);
    };
  }, [user]);

  const fetchBookmarks = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setBookmarks(data || []);
    } catch (err: any) {
      console.error('Bookmark Protocol: Initial load failed', err);
      setError(err.message || 'Failed to load bookmarks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSoftDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('bookmarks').update({ is_trashed: true, deleted_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    } catch (err: any) {
      alert('Failed to move to trash');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const { error } = await supabase.from('bookmarks').update({ is_trashed: false, deleted_at: null }).eq('id', id);
      if (error) throw error;
    } catch (err: any) {
      alert('Failed to restore bookmark');
    }
  };

  const handlePermanentDelete = async (id: string) => {
    const isConfirmed = window.confirm('DANGER: This permanently deletes this bookmark from the database.');
    if (!isConfirmed) return;
    try {
      const { error } = await supabase.from('bookmarks').delete().eq('id', id);
      if (error) throw error;
    } catch (err: any) {
      alert('Failed to delete bookmark');
    }
  };

  const handleEmptyTrash = async () => {
    const isConfirmed = window.confirm('Are you sure you want to permanently empty the trash?');
    if (!isConfirmed) return;
    try {
      const { error } = await supabase.from('bookmarks').delete().eq('is_trashed', true);
      if (error) throw error;
      setBookmarks(prev => prev.filter(b => !b.is_trashed));
    } catch (err: any) {
      alert('Failed to empty trash');
    }
  };

  const handleMoveBookmark = async (id: string, newFolderId: string | null) => {
    try {
      const { error } = await supabase.from('bookmarks').update({ folder_id: newFolderId }).eq('id', id);
      if (error) throw error;
    } catch (err: any) {
      alert('Failed to move bookmark');
    }
  };

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    bookmarks.filter(b => !b.is_trashed).forEach(b => {
      if (b.tags) b.tags.forEach(t => tags.add(t));
    });
    return Array.from(tags).sort();
  }, [bookmarks]);

  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter(b => {
      if (isTrashView) {
        if (!b.is_trashed) return false;
      } else {
        if (b.is_trashed) return false;
      }

      let matchesSearch = true;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        matchesSearch = b.title.toLowerCase().includes(query) ||
          b.url.toLowerCase().includes(query) ||
          (b.description?.toLowerCase().includes(query) ?? false);
      }
      const matchesTag = !selectedTag || (b.tags && b.tags.includes(selectedTag));
      const matchesFolder = (isTrashView || !selectedFolderId) || (b.folder_id === selectedFolderId);
      
      return matchesSearch && matchesTag && matchesFolder;
    });
  }, [bookmarks, searchQuery, selectedTag, selectedFolderId, isTrashView]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {isTrashView && (
        <div className="mb-8 p-6 bg-amber-600/10 border border-amber-600/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-600/20 flex items-center justify-center text-amber-500 shadow-lg">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Trash Protocol</h2>
              <p className="text-amber-500/80 text-[10px] font-black uppercase tracking-[0.25em]">Automated Cleanup Active</p>
            </div>
          </div>
          <p className="text-neutral-500 text-xs sm:text-sm font-medium text-center sm:text-left">
            Items in the trash will be permanently deleted after 30 days.
          </p>
          <button 
            onClick={handleEmptyTrash}
            className="px-6 py-2.5 bg-neutral-800 hover:bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-xl active:scale-95"
          >
            Empty Trash
          </button>
        </div>
      )}

      <div className="flex flex-col gap-6 mb-8 group">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative flex-1 group/search">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within/search:text-amber-500 transition-colors" />
            <input 
              type="text"
              placeholder="Search by title, URL or description..."
              className="w-full pl-11 pr-5 py-3 bg-[#131313] border border-white/5 rounded-xl text-base focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all placeholder:text-neutral-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {!isTrashView && allTags.length > 0 && (
          <div className="flex gap-2 p-0.5 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${!selectedTag ? 'bg-[#222] text-white shadow-md' : 'text-neutral-500 hover:text-neutral-300'}`}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all whitespace-nowrap ${selectedTag === tag ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30' : 'text-neutral-500 hover:text-neutral-300'}`}
              >
                <Tag className="w-3 h-3 opacity-60" />
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {filteredBookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 bg-[#0A0A0A] border border-white/5 border-dashed rounded-2xl text-neutral-500">
          <div className="bg-[#131313] p-3 rounded-full mb-3 border border-white/5">
            <X className="w-6 h-6 opacity-20" />
          </div>
          <p className="text-base font-medium text-neutral-400">{isTrashView ? "Trash is empty" : "Nothing found"}</p>
          <p className="text-xs">{isTrashView ? "Archive is clean." : "Try different keywords or filters."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {filteredBookmarks.map((bookmark) => {
            const domain = (url: string) => { try { return new URL(url).hostname; } catch { return ''; } };
            const d = domain(bookmark.url);

            let trashCountdown = null;
            if (bookmark.is_trashed && bookmark.deleted_at) {
               const days = 30 - differenceInDays(new Date(), new Date(bookmark.deleted_at));
               trashCountdown = Math.max(0, days);
            }
            
            return (
              <div key={bookmark.id} className="group relative flex flex-col bg-[#131313] border border-white/5 hover:border-white/10 hover:bg-[#181818] rounded-2xl p-4 transition-all duration-300 shadow-sm hover:shadow-xl">
                <div className="flex items-start justify-between gap-3 mb-4 relative z-10">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#080808] border border-white/5 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-inner font-bold text-white">
                      <img 
                        src={`https://www.google.com/s2/favicons?domain=${d}&sz=128`} 
                        alt="" 
                        className="w-5 h-5 object-contain"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[13px] font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1 tracking-tight leading-tight">
                        {bookmark.title}
                      </h3>
                      <p className="text-[9px] text-neutral-600 font-black tracking-widest uppercase line-clamp-1">{d}</p>
                    </div>
                  </div>

                  <div className="hidden sm:group-hover:flex items-center gap-1 animate-in fade-in zoom-in-95 duration-200">
                      {isTrashView ? (
                        <>
                          <button 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRestore(bookmark.id); }}
                            className="p-1.5 rounded-lg text-neutral-600 hover:text-amber-400 hover:bg-amber-500/10 transition-all border border-transparent hover:border-amber-500/20"
                            title="Restore"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handlePermanentDelete(bookmark.id); }}
                            className="p-1.5 rounded-lg text-neutral-600 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                            title="Delete Permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSoftDelete(bookmark.id); }}
                          className="p-1.5 rounded-lg text-neutral-600 hover:text-amber-500 hover:bg-amber-500/10 transition-all border border-transparent hover:border-amber-500/20"
                          title="Move to Trash"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                  </div>
                </div>

                {!isTrashView && (
                    <a href={bookmark.url} target="_blank" rel="noreferrer" className="absolute inset-0 z-0" />
                )}

                {bookmark.description && (
                  <p className="text-[11px] text-neutral-500 line-clamp-2 mb-4 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                    {bookmark.description}
                  </p>
                )}

                <div className="mt-auto pt-4 flex flex-col gap-3 relative z-10 pointer-events-none">
                  {!isTrashView && bookmark.tags && bookmark.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {bookmark.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[8px] px-1.5 py-0.5 bg-[#1A1A1A] border border-white/5 text-neutral-500 rounded-md font-black uppercase tracking-widest">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {isTrashView && trashCountdown !== null && (
                    <div className="px-2 py-1 bg-[#1A1A1A] rounded-md inline-block self-start border border-white/5">
                       <span className="text-[8px] font-black uppercase text-amber-500/80 tracking-widest">Purge in {trashCountdown} days</span>
                    </div>
                  )}

                   <div className="flex items-center justify-between pointer-events-auto">
                     {!isTrashView ? (
                      <div className="relative group/move flex items-center gap-1.5 text-[9px] text-neutral-700 font-black tracking-tighter min-w-0 flex-1">
                        <Move className="w-3 h-3 group-hover/move:text-amber-500 transition-colors flex-shrink-0" />
                        
                        <div className="relative min-w-0 flex-1">
                          <select 
                            className="appearance-none bg-[#1A1A1A] border border-white/5 hover:border-amber-500/30 text-neutral-500 hover:text-amber-400 pl-2 pr-6 py-1 rounded-md text-[9px] cursor-pointer font-black uppercase tracking-widest transition-all outline-none w-full max-w-[100px] truncate"
                            value={bookmark.folder_id || ''}
                            onChange={(e) => handleMoveBookmark(bookmark.id, e.target.value || null)}
                          >
                            <option value="">Root</option>
                            {folders.map(f => (
                              <option key={f.id} value={f.id} className="bg-[#131313] text-white">
                                {f.name}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                            <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </div>
                      </div>
                    ) : (
                        <div className="text-[9px] text-neutral-800 font-black uppercase tracking-widest">Trash Vault</div>
                    )}

                    <span className="text-[9px] text-neutral-700 font-medium whitespace-nowrap">
                      {formatDistanceToNow(new Date(bookmark.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
