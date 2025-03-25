
import { supabase } from "@/integrations/supabase/client";
import { NoteProps } from "@/components/notes/NoteCard";

export interface DbNote {
  id: string;
  user_id: string;
  title: string;
  content: string;
  color: string;
  is_favorite: boolean;
  is_archived: boolean;
  is_deleted: boolean;
  deleted_at: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// Convert database note to UI note
export const mapDbNoteToUiNote = (dbNote: DbNote): NoteProps => {
  return {
    id: dbNote.id,
    title: dbNote.title,
    content: dbNote.content,
    createdAt: dbNote.created_at,
    isFavorite: dbNote.is_favorite,
    isArchived: dbNote.is_archived,
    isDeleted: dbNote.is_deleted,
    deletedAt: dbNote.deleted_at,
    tags: dbNote.tags,
    color: dbNote.color,
  };
};

export const getNotes = async (): Promise<NoteProps[]> => {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("is_archived", false)
    .eq("is_deleted", false)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as DbNote[]).map(mapDbNoteToUiNote);
};

export const getFavoriteNotes = async (): Promise<NoteProps[]> => {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("is_favorite", true)
    .eq("is_archived", false)
    .eq("is_deleted", false)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as DbNote[]).map(mapDbNoteToUiNote);
};

export const getArchivedNotes = async (): Promise<NoteProps[]> => {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("is_archived", true)
    .eq("is_deleted", false)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as DbNote[]).map(mapDbNoteToUiNote);
};

export const getDeletedNotes = async (): Promise<NoteProps[]> => {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("is_deleted", true)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as DbNote[]).map(mapDbNoteToUiNote);
};

export const getNoteById = async (id: string): Promise<NoteProps> => {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapDbNoteToUiNote(data as DbNote);
};

export const createNote = async (note: { 
  title: string; 
  content: string;
  color?: string;
  tags?: string[];
}): Promise<NoteProps> => {
  const user = supabase.auth.getUser();
  const { data: userData } = await user;
  
  if (!userData.user) {
    throw new Error("User not authenticated");
  }
  
  const { data, error } = await supabase
    .from("notes")
    .insert({
      title: note.title,
      content: note.content,
      color: note.color || "#FFFFFF",
      tags: note.tags || [],
      is_archived: false,
      is_deleted: false,
      deleted_at: null,
      user_id: userData.user.id
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapDbNoteToUiNote(data as DbNote);
};

export const updateNote = async (
  id: string,
  updates: Partial<{
    title: string;
    content: string;
    color: string;
    is_favorite: boolean;
    is_archived: boolean;
    is_deleted: boolean;
    deleted_at: string | null;
    tags: string[];
  }>
): Promise<NoteProps> => {
  const { data, error } = await supabase
    .from("notes")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapDbNoteToUiNote(data as DbNote);
};

export const deleteNote = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
};

export const toggleFavorite = async (id: string, isFavorite: boolean): Promise<NoteProps> => {
  return updateNote(id, { is_favorite: isFavorite });
};

export const archiveNote = async (id: string, isArchived: boolean): Promise<NoteProps> => {
  return updateNote(id, { is_archived: isArchived });
};

export const trashNote = async (id: string): Promise<NoteProps> => {
  return updateNote(id, { 
    is_deleted: true, 
    deleted_at: new Date().toISOString() 
  });
};

export const restoreNote = async (id: string): Promise<NoteProps> => {
  return updateNote(id, { 
    is_deleted: false, 
    deleted_at: null 
  });
};

export const searchNotes = async (query: string): Promise<NoteProps[]> => {
  if (!query.trim()) {
    return getNotes();
  }
  
  // Search in both title and content
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .eq("is_archived", false)
    .eq("is_deleted", false)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as DbNote[]).map(mapDbNoteToUiNote);
};

export const subscribeToNotes = (
  callback: (notes: NoteProps[]) => void
): (() => void) => {
  const channel = supabase
    .channel('public:notes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'notes' },
      async (payload) => {
        // Fetch updated notes when any change occurs
        try {
          const notes = await getNotes();
          callback(notes);
        } catch (error) {
          console.error("Error fetching updated notes:", error);
        }
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
};
