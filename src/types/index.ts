
export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
  is_archived: boolean;
  is_trashed: boolean;
  trashed_at?: string;
  user_id: string;
  color: string;
  tags: string[];
  folderId?: string;
}

export interface Folder {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}
