import { supabase } from "@/integrations/supabase/client";
import { Note } from "@/types";

// Helper function to handle errors
const handleServiceError = (error: any, message: string) => {
  console.error(message, error);
  throw new Error(error.message || message);
};

// Function to fetch all notes for a user
export const fetchNotes = async (): Promise<Note[]> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error("You must be logged in to fetch notes");
    }

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .eq('is_trashed', false)
      .order('created_at', { ascending: false });

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
export const fetchNoteById = async (id: string): Promise<Note | null> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.user?.id;

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

// Function to create a new note
export const createNote = async (noteData: Partial<Note>): Promise<Note | null> => {
  try {
    const { user } = await supabase.auth.getSession();
    if (!user?.user?.id) {
      throw new Error("You must be authenticated to create notes.");
    }
    
    // Check if user can create more notes (free plan limit)
    const { data: canCreate } = await supabase.rpc('check_user_limits', {
      p_user_id: user.user.id,
      p_check_type: 'note'
    });
    
    // If user has reached the limit
    if (canCreate === false) {
      throw new Error("You've reached your notes limit. Please upgrade to create more notes.");
    }

    const { data, error } = await supabase
      .from('notes')
      .insert([
        {
          ...noteData,
          user_id: user.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
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
    const userId = session?.user?.id;

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
    const userId = session?.user?.id;

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

// Function to favorite a note
export const favoriteNote = async (id: string, isFavorite: boolean): Promise<Note | null> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error("You must be logged in to favorite notes");
    }

    const { data, error } = await supabase
      .from('notes')
      .update({ is_favorite: isFavorite })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return handleServiceError(error, `Error favoriting note with ID: ${id}`);
    }

    return data || null;
  } catch (error: any) {
    handleServiceError(error, `Error favoriting note with ID: ${id}`);
    return null;
  }
};

// Function to archive a note
export const archiveNote = async (id: string, isArchived: boolean): Promise<Note | null> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error("You must be logged in to archive notes");
    }

    const { data, error } = await supabase
      .from('notes')
      .update({ is_archived: isArchived })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return handleServiceError(error, `Error archiving note with ID: ${id}`);
    }

    return data || null;
  } catch (error: any) {
    handleServiceError(error, `Error archiving note with ID: ${id}`);
    return null;
  }
};

// Function to trash a note
export const trashNote = async (id: string): Promise<Note | null> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.user?.id;

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
    const userId = session?.user?.id;

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

// Function to permanently delete a note
export const permanentlyDeleteNote = async (id: string): Promise<boolean> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error("You must be logged in to permanently delete notes");
    }

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return handleServiceError(error, `Error permanently deleting note with ID: ${id}`);
    }

    return true;
  } catch (error: any) {
    handleServiceError(error, `Error permanently deleting note with ID: ${id}`);
    return false;
  }
};

// Function to fetch trashed notes
export const fetchTrashedNotes = async (): Promise<Note[]> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error("You must be logged in to fetch trashed notes");
    }

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .eq('is_trashed', true)
      .order('trashed_at', { ascending: false });

    if (error) {
      return handleServiceError(error, "Error fetching trashed notes");
    }

    return data || [];
  } catch (error: any) {
    handleServiceError(error, "Error fetching trashed notes");
    return [];
  }
};

// Function to fetch favorite notes
export const fetchFavoriteNotes = async (): Promise<Note[]> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error("You must be logged in to fetch favorite notes");
    }

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .eq('is_favorite', true)
      .eq('is_trashed', false)
      .order('created_at', { ascending: false });

    if (error) {
      return handleServiceError(error, "Error fetching favorite notes");
    }

    return data || [];
  } catch (error: any) {
    handleServiceError(error, "Error fetching favorite notes");
    return [];
  }
};

// Function to fetch archived notes
export const fetchArchivedNotes = async (): Promise<Note[]> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error("You must be logged in to fetch archived notes");
    }

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', true)
       .eq('is_trashed', false)
      .order('created_at', { ascending: false });

    if (error) {
      return handleServiceError(error, "Error fetching archived notes");
    }

    return data || [];
  } catch (error: any) {
    handleServiceError(error, "Error fetching archived notes");
    return [];
  }
};
