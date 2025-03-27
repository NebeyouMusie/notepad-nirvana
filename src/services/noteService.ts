import { supabase } from "@/integrations/supabase/client";

export interface Note {
  id: string;
  created_at: string;
  title: string;
  content: string;
  user_id: string;
  is_favorite: boolean;
  is_archived: boolean;
  is_trashed: boolean;
}

interface FetchNotesOptions {
  favorite?: boolean;
  archived?: boolean;
  trashed?: boolean;
  folderId?: string;
}

export const fetchNotes = async (options: FetchNotesOptions = {}): Promise<Note[]> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) throw userError;

    let query = supabase
      .from("notes")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false });

    if (options.favorite) {
      query = query.eq("is_favorite", true);
    }

    if (options.archived) {
      query = query.eq("is_archived", true);
    }

    if (options.trashed) {
      query = query.eq("is_trashed", true);
    }
    
    if (options.folderId) {
      const { data: notesFolders, error: notesFoldersError } = await supabase
        .from('notes_folders')
        .select('note_id')
        .eq('folder_id', options.folderId);
      
      if (notesFoldersError) throw notesFoldersError;
      
      const noteIds = notesFolders.map(nf => nf.note_id);
      query = query.in('id', noteIds);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data as Note[];
  } catch (error) {
    console.error("Error fetching notes:", error);
    return [];
  }
};

export const updateNote = async (id: string, updates: Partial<Note>): Promise<Note | null> => {
  try {
    const { data, error } = await supabase
      .from("notes")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data as Note;
  } catch (error) {
    console.error("Error updating note:", error);
    return null;
  }
};

export const deleteNote = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from("notes").delete().eq("id", id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error deleting note:", error);
    return false;
  }
};

// Modify the createNote function to check for plan limits
export const createNote = async (
  title: string,
  content?: string,
  folderId?: string
): Promise<Note | null> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) throw userError;

    // Create new note
    const { data, error } = await supabase
      .from("notes")
      .insert([
        {
          title,
          content,
          user_id: userData.user.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // If a folder ID is provided, create a relationship
    if (folderId && data) {
      const { error: relationError } = await supabase
        .from("notes_folders")
        .insert([
          {
            note_id: data.id,
            folder_id: folderId,
          },
        ]);

      if (relationError) {
        console.error("Error creating folder relationship:", relationError);
      }
    }

    return data as Note;
  } catch (error) {
    console.error("Error creating note:", error);
    return null;
  }
};

export const trashNote = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("notes")
      .update({ is_trashed: true })
      .eq("id", id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error trashing note:", error);
    return false;
  }
};

export const restoreNote = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("notes")
      .update({ is_trashed: false })
      .eq("id", id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error restoring note:", error);
    return false;
  }
};

export const toggleFavoriteNote = async (id: string, isFavorite: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("notes")
      .update({ is_favorite: !isFavorite })
      .eq("id", id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error toggling favorite note:", error);
    return false;
  }
};

export const toggleArchiveNote = async (id: string, isArchived: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("notes")
      .update({ is_archived: !isArchived })
      .eq("id", id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error toggling archive note:", error);
    return false;
  }
};
