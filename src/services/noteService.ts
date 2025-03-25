
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  color: string;
  tags: string[];
  is_favorite: boolean;
  is_archived: boolean;
  is_trashed: boolean;
  trashed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NoteInput {
  title: string;
  content: string;
  color: string;
  tags: string[];
}

interface FetchNotesOptions {
  folderId?: string;
  searchQuery?: string;
  onlyFavorites?: boolean;
  onlyArchived?: boolean;
  onlyTrashed?: boolean;
}

// Fetch notes based on options
export async function fetchNotes(options: FetchNotesOptions = {}) {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }
    
    let query = supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id);
    
    // Filter by folder
    if (options.folderId) {
      const folderNotesQuery = supabase
        .from('notes_folders')
        .select('note_id')
        .eq('folder_id', options.folderId);
      
      const { data: folderNotes, error: folderError } = await folderNotesQuery;
      
      if (folderError) throw folderError;
      
      if (folderNotes && folderNotes.length > 0) {
        const noteIds = folderNotes.map(n => n.note_id);
        query = query.in('id', noteIds);
      } else {
        return []; // No notes in this folder
      }
    }
    
    // Filter by search query (search in title and content)
    if (options.searchQuery) {
      const searchTerm = options.searchQuery.toLowerCase();
      query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
    }
    
    // Filter favorites, archived, or trashed notes
    if (options.onlyFavorites) {
      query = query.eq('is_favorite', true);
    }
    
    if (options.onlyArchived) {
      query = query.eq('is_archived', true).eq('is_trashed', false);
    }
    
    if (options.onlyTrashed) {
      query = query.eq('is_trashed', true);
    } else if (!options.onlyArchived) {
      // If not explicitly requesting archived or trashed notes, exclude them
      query = query.eq('is_trashed', false);
      
      // Only exclude archived if not specifically requesting them
      if (!options.onlyArchived) {
        query = query.eq('is_archived', false);
      }
    }
    
    // Order by updated_at (newest first)
    query = query.order('updated_at', { ascending: false });
    
    const { data, error } = await query;
    
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
export async function createNote(noteData: Partial<Note>) {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("You must be logged in to create notes");
    }
    
    const newNote = {
      user_id: user.id,
      title: noteData.title || "Untitled Note",
      content: noteData.content || "",
      color: noteData.color || "#FFFFFF",
      tags: noteData.tags || [],
      is_favorite: noteData.is_favorite || false,
      is_archived: false,
      is_trashed: false
    };
    
    const { data, error } = await supabase
      .from('notes')
      .insert([newNote])
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

// Get a single note by ID
export async function getNote(id: string) {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
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

// Update a note
export async function updateNote(id: string, updates: Partial<Note>) {
  try {
    const { data, error } = await supabase
      .from('notes')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
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

// Delete a note permanently
export async function deleteNotePermanently(id: string) {
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
      title: "Error moving note to trash",
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
      .update({
        is_favorite: isFavorite
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error: any) {
    toast({
      title: "Error updating favorite status",
      description: error.message,
      variant: "destructive",
    });
    return null;
  }
}

// Toggle archive status
export async function toggleArchive(id: string, isArchived: boolean) {
  try {
    const { data, error } = await supabase
      .from('notes')
      .update({
        is_archived: isArchived
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error: any) {
    toast({
      title: "Error updating archive status",
      description: error.message,
      variant: "destructive",
    });
    return null;
  }
}

// Empty trash (delete all trashed notes)
export async function emptyTrash() {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("You must be logged in to empty trash");
    }
    
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('user_id', user.id)
      .eq('is_trashed', true);
    
    if (error) throw error;
    return true;
  } catch (error: any) {
    toast({
      title: "Error emptying trash",
      description: error.message,
      variant: "destructive",
    });
    return false;
  }
}
