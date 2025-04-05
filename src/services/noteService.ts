
import { supabase } from "@/integrations/supabase/client";
import { Note } from "@/types";
import { toast } from "@/hooks/use-toast";

// Helper function to handle errors
const handleServiceError = (error: any, message: string) => {
  console.error(message, error);
  throw new Error(error.message || message);
};

// Function to fetch all notes for a user
export const fetchNotes = async (filters?: { favorite?: boolean, archived?: boolean, trashed?: boolean, folderId?: string }): Promise<Note[]> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;

    if (!userId) {
      throw new Error("You must be logged in to fetch notes");
    }

    let query = supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId);
      
    // Apply filters
    if (filters?.favorite) {
      query = query.eq('is_favorite', true);
    }
    
    if (filters?.archived) {
      query = query.eq('is_archived', true);
    }
    
    if (filters?.trashed) {
      query = query.eq('is_trashed', true);
    } else {
      query = query.eq('is_trashed', false);
    }
    
    // If folderId is provided, get notes from that folder
    if (filters?.folderId) {
      const { data: folderNotesIds } = await supabase
        .from('notes_folders')
        .select('note_id')
        .eq('folder_id', filters.folderId);
      
      if (folderNotesIds && folderNotesIds.length > 0) {
        const noteIds = folderNotesIds.map(item => item.note_id);
        query = query.in('id', noteIds);
      } else {
        // If no notes in this folder, return empty array
        return [];
      }
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return handleServiceError(error, "Error fetching notes");
    }

    return data || [];
  } catch (error: any) {
    handleServiceError(error, "Error fetching notes");
    return [];
  }
};

// Function to fetch a single note by ID
export const fetchNote = async (id: string): Promise<Note | null> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;

    if (!userId) {
      throw new Error("You must be logged in to fetch notes");
    }

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      return handleServiceError(error, `Error fetching note with ID: ${id}`);
    }

    return data || null;
  } catch (error: any) {
    handleServiceError(error, `Error fetching note with ID: ${id}`);
    return null;
  }
};

// Alias for fetchNote for better naming consistency
export const getNote = fetchNote;

// Function to create a new note
export const createNote = async (noteData: Partial<Note>): Promise<Note | null> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;
    
    if (!userId) {
      throw new Error("You must be authenticated to create notes.");
    }
    
    // Check if user can create more notes (free plan limit)
    const { data: canCreate } = await supabase.rpc('check_user_limits', {
      p_user_id: userId,
      p_check_type: 'note'
    });
    
    // If user has reached the limit
    if (canCreate === false) {
      throw new Error("You've reached your notes limit. Please upgrade to create more notes.");
    }

    const newNote = {
      ...noteData,
      user_id: userId,
      title: noteData.title || "Untitled",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('notes')
      .insert(newNote)
      .select()
      .single();

    if (error) {
      console.error("Error creating note:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in createNote:", error);
    throw error;
  }
};

// Function to update an existing note
export const updateNote = async (id: string, noteData: Partial<Note>): Promise<Note | null> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;

    if (!userId) {
      throw new Error("You must be logged in to update notes");
    }

    const { data, error } = await supabase
      .from('notes')
      .update({
        ...noteData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return handleServiceError(error, `Error updating note with ID: ${id}`);
    }

    return data || null;
  } catch (error: any) {
    handleServiceError(error, `Error updating note with ID: ${id}`);
    return null;
  }
};

// Function to delete a note
export const deleteNote = async (id: string): Promise<boolean> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;

    if (!userId) {
      throw new Error("You must be logged in to delete notes");
    }

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return handleServiceError(error, `Error deleting note with ID: ${id}`);
    }

    return true;
  } catch (error: any) {
    handleServiceError(error, `Error deleting note with ID: ${id}`);
    return false;
  }
};

// Function to toggle favorite status
export const toggleFavorite = async (id: string, isFavorite: boolean): Promise<Note | null> => {
  return updateNote(id, { is_favorite: isFavorite });
};

// Function to toggle archived status
export const toggleArchived = async (id: string, isArchived: boolean): Promise<Note | null> => {
  return updateNote(id, { is_archived: isArchived });
};

// Function to trash a note
export const trashNote = async (id: string): Promise<Note | null> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;

    if (!userId) {
      throw new Error("You must be logged in to trash notes");
    }

    const { data, error } = await supabase
      .from('notes')
      .update({ is_trashed: true, trashed_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return handleServiceError(error, `Error trashing note with ID: ${id}`);
    }

    return data || null;
  } catch (error: any) {
    handleServiceError(error, `Error trashing note with ID: ${id}`);
    return null;
  }
};

// Function to restore a note from trash
export const restoreNote = async (id: string): Promise<Note | null> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;

    if (!userId) {
      throw new Error("You must be logged in to restore notes");
    }

    const { data, error } = await supabase
      .from('notes')
      .update({ is_trashed: false, trashed_at: null })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return handleServiceError(error, `Error restoring note with ID: ${id}`);
    }

    return data || null;
  } catch (error: any) {
    handleServiceError(error, `Error restoring note with ID: ${id}`);
    return null;
  }
};
