export interface Bookmark {
  id: string;
  user_id: string;
  url: string;
  title: string;
  description: string | null;
  tags: string[];
  folder_id: string | null;
  is_trashed: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface FolderTreeNode extends Folder {
  children: FolderTreeNode[];
}
