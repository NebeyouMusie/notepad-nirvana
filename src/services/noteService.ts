
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Note {
  id: string;
  title: string;
  content: string | null;
  color: string;
  tags: string[];
  is_favorite: boolean;
  is_archived: boolean;
  is_trashed: boolean;
  trashed_at: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export type NoteInput = Omit<Note, 'id' | 'created_at' | 'updated_at' | 'user_id'>;

// Fetch all notes for the current user
export async function fetchNotes(options: { 
  archived?: boolean;
  trashed?: boolean;
  favorite?: boolean;
  folderId?: string;
} = {}) {
  try {
    let query = supabase
      .from('notes')
      .select('*');
    
    // Apply filters based on options
    if (options.archived !== undefined) {
      query = query.eq('is_archived', options.archived);
    }
    
    if (options.trashed !== undefined) {
      query = query.eq('is_trashed', options.trashed);
    }
    
    if (options.favorite) {
      query = query.eq('is_favorite', true);
    }
    
    // If folder ID is provided, fetch notes in that folder
    if (options.folderId) {
      const { data: noteIds } = await supabase
        .from('notes_folders')
        .select('note_id')
        .eq('folder_id', options.folderId);
      
      if (noteIds && noteIds.length > 0) {
        query = query.in('id', noteIds.map(row => row.note_id));
      } else {
        return []; // No notes in this folder
      }
    }
    
    const { data, error } = await query.order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error: any) {
    toast({
      title: "Error fetching notes",
      description: error.message,
      variant: "destructive",
    });
    return [];
  }
}

// Create a new note
export async function createNote(note: Partial<NoteInput>) {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("You must be logged in to create notes");
    }
    
    const { data, error } = await supabase
      .from('notes')
      .insert([{ 
        ...note, 
        user_id: user.id,
        is_archived: false,
        is_trashed: false
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error: any) {
    toast({
      title: "Error creating note",
      description: error.message,
      variant: "destructive",
    });
    return null;
  }
}

// Update an existing note
export async function updateNote(id: string, updates: Partial<NoteInput>) {
  try {
    const { data, error } = await supabase
      .from('notes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error: any) {
    toast({
      title: "Error updating note",
      description: error.message,
      variant: "destructive",
    });
    return null;
  }
}

// Get a single note by ID
export async function getNote(id: string) {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error: any) {
    toast({
      title: "Error fetching note",
      description: error.message,
      variant: "destructive",
    });
    return null;
  }
}

// Delete a note permanently
export async function deleteNote(id: string) {
  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error: any) {
    toast({
      title: "Error deleting note",
      description: error.message,
      variant: "destructive",
    });
    return false;
  }
}

// Move a note to trash
export async function trashNote(id: string) {
  try {
    const { data, error } = await supabase
      .from('notes')
      .update({ 
        is_trashed: true, 
        trashed_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error: any) {
    toast({
      title: "Error trashing note",
      description: error.message,
      variant: "destructive",
    });
    return null;
  }
}

// Restore a note from trash
export async function restoreNote(id: string) {
  try {
    const { data, error } = await supabase
      .from('notes')
      .update({ 
        is_trashed: false, 
        trashed_at: null 
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error: any) {
    toast({
      title: "Error restoring note",
      description: error.message,
      variant: "destructive",
    });
    return null;
  }
}

// Toggle favorite status
export async function toggleFavorite(id: string, isFavorite: boolean) {
  try {
    const { data, error } = await supabase
      .from('notes')
      .update({ is_favorite: isFavorite })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error: any) {
    toast({
      title: "Error updating note",
      description: error.message,
      variant: "destructive",
    });
    return null;
  }
}

// Toggle archived status
export async function toggleArchived(id: string, isArchived: boolean) {
  try {
    const { data, error } = await supabase
      .from('notes')
      .update({ is_archived: isArchived })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error: any) {
    toast({
      title: "Error updating note",
      description: error.message,
      variant: "destructive",
    });
    return null;
  }
}
