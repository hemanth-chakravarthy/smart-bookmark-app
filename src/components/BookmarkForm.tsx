import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Folder } from '@/types';

interface BookmarkFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function BookmarkForm({ onSuccess, onCancel }: BookmarkFormProps) {
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [embedding, setEmbedding] = useState<number[] | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('folders').select('*').order('name').then(({data}) => {
      if (data) setFolders(data);
    });
  }, []);

  const fetchMetadata = async (targetUrl: string) => {
    try {
      new URL(targetUrl);
      if (title.length > 0 && description.length > 0) return;
      
      setIsFetchingMetadata(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch(`/api/metadata?url=${encodeURIComponent(targetUrl)}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.title && !title) setTitle(data.title);
        if (data.description && !description) setDescription(data.description);
        if (data.tags && tags.length === 0) setTags(data.tags);
        if (data.embedding) setEmbedding(data.embedding);
      }
    } catch (e) {
    } finally {
      setIsFetchingMetadata(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrl(val);
    fetchMetadata(val);
  };

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().toLowerCase();
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    setError(null);

    try {
      new URL(url);

      // 1. Pre-check for duplicate URL to provide a better user experience
      const { data: existing, error: checkError } = await supabase
        .from('bookmarks')
        .select('id, is_trashed')
        .eq('user_id', user.id)
        .eq('url', url)
        .maybeSingle();

      if (checkError) throw checkError;
      
      if (existing) {
        if (existing.is_trashed) {
          setError('This URL is already in your Trash. Please restore it if you want it back.');
        } else {
          setError('You have already bookmarked this URL.');
        }
        setIsLoading(false);
        return;
      }

      const payload: any = {
        url,
        title,
        description,
        tags,
        folder_id: folderId,
        user_id: user.id
      };

      if (embedding) {
        payload.embedding = embedding;
      }

      const { error: insertError } = await supabase.from('bookmarks').insert(payload);

      if (insertError) {
        // Handle database-level unique constraint violation (Code 23505)
        if (insertError.code === '23505') {
          setError('You have already bookmarked this URL.');
          setIsLoading(false);
          return;
        }
        throw insertError;
      }
      
      setUrl('');
      setTitle('');
      setDescription('');
      setTags([]);
      setEmbedding(null);
      onSuccess?.();
    } catch (err: any) {
      if (err instanceof TypeError) {
        setError('Please enter a valid URL (e.g., https://example.com)');
      } else {
        console.error('Error adding bookmark:', {
          message: err.message,
          details: err.details,
          hint: err.hint,
          code: err.code,
          error: err
        });
        setError(err.message || 'Failed to add bookmark');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
      {error && (
        <div className="bg-error/10 text-error p-2.5 sm:p-3 rounded text-xs sm:text-sm">
          {error}
        </div>
      )}
      
      <Input
        label="URL *"
        type="url"
        required
        placeholder="https://example.com"
        value={url}
        onChange={handleUrlChange}
      />
      
      <div className="relative">
        <Input
          label="Title *"
          type="text"
          required
          placeholder="My Awesome Website"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {isFetchingMetadata && (
          <div className="absolute right-3 top-9 animate-spin h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full" />
        )}
      </div>

      <div className="w-full">
        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5 sm:mb-2 block">Tags</label>
        <div className="flex flex-wrap gap-1 mb-2 sm:mb-3 min-h-[1.5rem]">
          {tags.map((tag) => (
            <span key={tag} className="bg-primary-500/10 text-primary-400 border border-primary-500/20 px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] uppercase font-bold flex items-center gap-1 transition-all">
              {tag}
              <button 
                type="button" 
                onClick={() => removeTag(tag)}
                className="hover:text-primary-100 focus:outline-none"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
        <input
          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-[#131313] border border-[#2A2A2A] rounded-lg sm:rounded-xl text-neutral-200 placeholder:text-neutral-700 outline-none transition-all focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 text-xs sm:text-sm"
          placeholder="Press enter to add tags..."
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={addTag}
          type="text"
        />
      </div>
      
      <div className="w-full flex-1">
        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5 sm:mb-2 block">
          Description / Memory
        </label>
        <textarea
          className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-[#131313] border border-[#2A2A2A] rounded-lg sm:rounded-xl text-neutral-300 placeholder:text-neutral-700 outline-none transition-all focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 resize-none min-h-[80px] sm:min-h-[100px] text-xs sm:text-sm"
          placeholder="What's special about this link? Gemini will help you summarize..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="w-full">
        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5 sm:mb-2 block">Destination Folder</label>
        <select 
          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-[#131313] border border-[#2A2A2A] rounded-lg sm:rounded-xl text-neutral-300 outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 text-xs sm:text-sm appearance-none select-none"
          value={folderId || ''}
          onChange={(e) => setFolderId(e.target.value || null)}
        >
          <option value="" className="bg-[#191919]">Unorganized / Root</option>
          {folders.map(f => <option key={f.id} value={f.id} className="bg-[#191919]">{f.name}</option>)}
        </select>
      </div>

      <div className="flex gap-2 sm:gap-3 justify-end mt-2 sm:mt-4">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isLoading}>
          Save Bookmark
        </Button>
      </div>
    </form>
  );
}
