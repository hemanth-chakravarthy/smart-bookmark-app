'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { BookmarkList } from '@/components/BookmarkList';
import { BookmarkForm } from '@/components/BookmarkForm';
import { Modal } from '@/components/ui/Modal';
import { ShaderAnimation } from '@/components/ui/ShaderAnimation';
import { 
  Plus, 
  LogOut, 
  Menu,
  X
} from 'lucide-react';
import { FolderManager } from '@/components/FolderManager';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Folder } from '@/types';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Lifted State for Global Layout Alignment
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const fetchFolders = async () => {
    const { data } = await supabase.from('folders').select('*').order('name');
    if (data) setFolders(data);
  };

  useEffect(() => {
    if (!user) return;
    
    fetchFolders();
    
    const channel = supabase
      .channel(`public-folders-${user.id}`)
      .on(
        'postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'folders',
          filter: `user_id=eq.${user.id}`
        }, 
        fetchFolders
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (!user) return null;

  return (
    <div className="flex h-screen bg-[#0F0F0F] text-[#EDEDED] overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Narrower width w-64 for better density */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:transform-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <FolderManager 
          folders={folders} 
          selectedFolderId={selectedFolderId} 
          onSelectFolder={(id) => {
            setSelectedFolderId(id);
            setIsSidebarOpen(false);
          }}
          onFoldersChange={fetchFolders}
        />
        {/* Close button for mobile */}
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className="absolute top-4 right-4 p-2 bg-neutral-800 rounded-lg lg:hidden"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <main className="flex-1 overflow-y-auto relative custom-scrollbar flex flex-col min-w-0">
        {/* Top Bar - Tightened Padding */}
        <div className="absolute top-0 left-0 right-0 z-40 flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 lg:p-6 pointer-events-none gap-4">
          <div className="pointer-events-auto max-w-xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter text-white leading-none mb-2 drop-shadow-2xl">
              My Bookmarks
            </h1>
            <p className="text-amber-500/80 text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] opacity-80">
              Smart Digital Archive
            </p>
          </div>
          
          <div className="flex items-center gap-3 ml-auto pointer-events-auto">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2.5 bg-[#131313]/60 backdrop-blur-md rounded-xl border border-white/5 text-neutral-400 hover:text-white transition-all lg:hidden shadow-xl"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Floating Add Bookmark - Glassmorphism Style - Amber Accent */}
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="group relative flex items-center gap-2.5 px-5 py-2.5 bg-amber-600/10 backdrop-blur-xl border border-white/5 hover:border-amber-500/20 rounded-xl text-white text-sm font-bold transition-all shadow-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <Plus className="w-4 h-4 text-amber-500 group-hover:text-white transition-colors" />
              <span className="hidden sm:inline">Add Bookmark</span>
            </button>
            
            <button
              onClick={signOut}
              className="p-2.5 bg-[#191919]/60 backdrop-blur-md rounded-xl border border-[#2A2A2A] text-neutral-400 hover:text-white transition-all shadow-xl"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cover Area - Slightly shorter for focus */}
        <div className="w-full h-32 sm:h-40 md:h-48 lg:h-[200px] relative overflow-hidden flex-shrink-0">
          <ShaderAnimation />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-transparent to-transparent" />
        </div>

        {/* Content - Tightened margins for density */}
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 -mt-4 lg:-mt-8 relative z-10 pb-20">
          {/* Content Spacing is now tighter since header is moved to Top Bar */}

          {/* Bookmark List */}
          <div className="px-2">
            <BookmarkList 
              selectedFolderId={selectedFolderId}
              folders={folders}
            />
          </div>
        </div>
      </main>

      {/* Add Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title="Add New Bookmark"
      >
        <div className="bg-[#191919]">
          <BookmarkForm 
            onSuccess={() => setIsAddModalOpen(false)}
            onCancel={() => setIsAddModalOpen(false)}
          />
        </div>
      </Modal>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2a2a2a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3a3a3a;
        }
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        .group-hover\\:animate-shine:hover {
          animation: shine 1s ease-in-out;
        }
      `}</style>
    </div>
  );
}
