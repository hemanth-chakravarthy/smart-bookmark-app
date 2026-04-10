'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Folder, FolderTreeNode } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { 
  Folder as FolderIcon, 
  FolderPlus, 
  Trash2, 
  ChevronRight, 
  ChevronDown, 
  ShieldCheck,
  MoreHorizontal,
  BookMarked,
  Clock,
  Star,
  Settings,
  X,
  Plus
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

interface FolderManagerProps {
  folders: Folder[];
  selectedFolderId: string | null;
  onSelectFolder: (id: string | null) => void;
}

export function FolderManager({ folders, selectedFolderId, onSelectFolder }: FolderManagerProps) {
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [parentFolderId, setParentFolderId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newFolderName.trim()) return;
    try {
      const { error } = await supabase.from('folders').insert({
        name: newFolderName.trim(),
        parent_id: parentFolderId,
        user_id: user.id,
      });
      if (error) throw error;
      setNewFolderName('');
      setIsCreateModalOpen(false);
    } catch (err: unknown) {
      alert('Error creating folder');
    }
  };

  const toggleExpand = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteFolder = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    const isConfirmed = window.confirm(`Are you sure you want to delete the folder "${name}"? All bookmarks inside will be moved to the root library.`);
    if (!isConfirmed) return;

    try {
      // Step 1: Move bookmarks in this folder to root (null)
      await supabase
        .from('bookmarks')
        .update({ folder_id: null })
        .eq('folder_id', id);

      // Step 2: Delete the folder
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err: any) {
      alert(`Error deleting folder: ${err.message}`);
    }
  };

  const buildTree = (parentId: string | null): FolderTreeNode[] => {
    return folders.filter(f => f.parent_id === parentId).map(f => ({
      ...f,
      children: buildTree(f.id)
    }));
  };

  const folderTree = buildTree(null);

  const SectionHeader = ({ label }: { label: string }) => (
    <div className="px-5 mb-3 mt-8">
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 block">
        {label}
      </span>
    </div>
  );

  const SidebarItem = ({ icon: Icon, label, active, onClick, count }: { icon: React.ElementType; label: string; active?: boolean; onClick?: () => void; count?: number }) => (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all duration-200 group ${
        active 
          ? 'bg-[#1A1A1A] text-white shadow-sm' 
          : 'text-neutral-500 hover:text-neutral-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-neutral-600 group-hover:text-neutral-400 opacity-60'}`} />
        <span className="text-[13px] font-semibold tracking-tight">{label}</span>
      </div>
      {count !== undefined && (
        <span className="text-[10px] text-neutral-700 font-bold">{count}</span>
      )}
    </button>
  );

  const renderTree = (nodes: FolderTreeNode[], depth: number = 0) => {
    return nodes.map(node => (
      <div key={node.id} className="w-full">
        <div 
          onClick={() => onSelectFolder(node.id)}
          className={`group flex items-center gap-2 px-2 py-1.5 rounded-xl cursor-pointer transition-all duration-200 ${
            selectedFolderId === node.id 
              ? 'bg-[#1A1A1A] text-white shadow-sm ring-1 ring-white/5' 
              : 'text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.03]'
          }`}
          style={{ paddingLeft: `${depth * 0.8 + 0.4}rem` }}
        >
          {/* Chevron/Toggle */}
          <div 
            onClick={(e) => toggleExpand(e, node.id)} 
            className="w-4 h-4 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors shrink-0"
          >
            {node.children.length > 0 ? (
              expandedFolders.has(node.id) 
                ? <ChevronDown className="w-3 h-3 text-neutral-500 group-hover:text-neutral-300" /> 
                : <ChevronRight className="w-3 h-3 text-neutral-600 group-hover:text-neutral-300" />
            ) : <div className="w-3" />}
          </div>

          {/* Folder Icon - Adjusted size and opacity */}
          <FolderIcon className={`w-3.5 h-3.5 shrink-0 transition-colors ${selectedFolderId === node.id ? 'text-primary-400' : 'text-neutral-600 group-hover:text-neutral-500'}`} />
          
          {/* Name - Cleaner tracking */}
          <span className="text-[13px] font-semibold flex-1 truncate tracking-tight">{node.name}</span>

          {/* More Actions Icon - Always visible but very subtle until hover */}
          <button 
            onClick={(e) => handleDeleteFolder(e, node.id, node.name)}
            className="p-1 rounded-md opacity-20 group-hover:opacity-100 hover:bg-white/10 text-neutral-400 hover:text-red-400 transition-all"
            title="Delete Folder"
          >
            <MoreHorizontal className="w-3 h-3" />
          </button>
        </div>
        
        {expandedFolders.has(node.id) && node.children.length > 0 && (
          <div className="w-full mt-0.5 border-l border-white/[0.03] ml-2.5">
            {renderTree(node.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <aside className="relative flex flex-col h-full bg-[#050505] text-[#EDEDED] border-r border-[#151515] select-none">
      {/* Mac Window Controls - Smaller */}
      <div className="p-4 pb-1.5 flex gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-[#ED6A5E]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#F4BF4F]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#61C554]" />
      </div>

      {/* User Identity / Header - More Compact */}
      <div className="p-4 pt-6 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-neutral-800 p-0.5 ring-1 ring-white/5 shadow-xl flex-shrink-0">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} 
              className="w-full h-full object-cover rounded-[10px]"
              alt="Avatar"
            />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-600 mb-0.5">
              Knowledge Curator
            </p>
            <h2 className="text-sm font-bold text-white truncate">
              {user?.email?.split('@')[0] || 'User'}
            </h2>
          </div>
        </div>
      </div>

      {/* Navigation Content */}
      <div className="flex-1 overflow-y-auto px-1.5 custom-scrollbar">
        <SectionHeader label="Main" />
        <div className="space-y-0.5">
          <SidebarItem 
            icon={BookMarked} 
            label="All Bookmarks" 
            active={selectedFolderId === null} 
            onClick={() => onSelectFolder(null)}
          />
        </div>

        <SectionHeader label="Folders" />
        <div className="space-y-0.5">
          {folders.length > 0 ? renderTree(folderTree) : (
             <p className="px-4 py-2 text-[10px] text-neutral-700 italic">No folders created</p>
          )}
        </div>

        <div className="mt-8 border-t border-white/5 pt-4">
          <SidebarItem 
            icon={Trash2} 
            label="Trash" 
            active={selectedFolderId === 'trash'} 
            onClick={() => onSelectFolder('trash')}
          />
        </div>
      </div>

      {/* Bottom Actions - Smaller Pill */}
      <div className="p-3 mt-auto">
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#141414] hover:bg-[#1A1A1A] border border-[#222] rounded-[18px] text-[13px] font-bold text-neutral-300 transition-all duration-300 hover:text-white group active:scale-95"
        >
          <Plus className="w-4 h-4 text-neutral-600 group-hover:text-neutral-400" />
          <span>New Folder</span>
        </button>
      </div>


      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="New Folder">
        <form onSubmit={handleCreateFolder} className="flex flex-col gap-6 p-2">
          <Input 
            label="Folder Name" 
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            required
            autoFocus
            placeholder="Work / Personal / Travel"
          />
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-600">Nesting Level</label>
            <select 
              className="w-full px-4 py-3 bg-[#131313] border border-[#2A2A2A] rounded-2xl text-neutral-300 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 text-sm appearance-none outline-none cursor-pointer"
              value={parentFolderId || ''}
              onChange={(e) => setParentFolderId(e.target.value || null)}
            >
              <option value="">Top Level</option>
              {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Maybe Later</Button>
            <Button type="submit">Create Collection</Button>
          </div>
        </form>
      </Modal>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #151515;
          border-radius: 10px;
        }
        .custom-scrollbar-thumb:hover {
          background: #252525;
        }
      `}</style>
    </aside>
  );
}