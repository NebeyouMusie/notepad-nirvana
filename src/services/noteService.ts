
import { supabase } from "@/integrations/supabase/client";

export interface Note {
  id: string;
  title: string;
  content: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_favorite: boolean | null;
  is_archived: boolean | null;
  is_trashed: boolean | null;
  trashed_at: string | null;
  color: string | null;
  tags: string[] | null;
}

export interface NoteInput {
  title: string;
  content?: string | null;
  color?: string;
  tags?: string[] | null;
}

export interface NoteFilter {
  favorite?: boolean;
  archived?: boolean;
  trashed?: boolean;
  folderId?: string;
}

export async function fetchNotes(filter: NoteFilter = {}): Promise<Note[]> {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData?.user) {
    console.error("No authenticated user found");
    return [];
  }

  let query = supabase
    .from("notes")
    .select("*")
    .eq("user_id", userData.user.id);
  
  // Apply filters
  if (filter.favorite) {
    query = query.eq("is_favorite", true);
  }
  
  if (filter.archived) {
    query = query.eq("is_archived", true);
  } else if (!filter.trashed) {
    // If not viewing archived or trashed, only show non-archived notes
    query = query.eq("is_archived", false);
  }
  
  if (filter.trashed) {
    query = query.eq("is_trashed", true);
  } else {
    // If not viewing trash, only show non-trashed notes
    query = query.eq("is_trashed", false);
  }
  
  if (filter.folderId) {
    const { data: notesInFolder } = await supabase
      .from("notes_folders")
      .select("note_id")
      .eq("folder_id", filter.folderId);
    
    if (notesInFolder && notesInFolder.length > 0) {
      const noteIds = notesInFolder.map(item => item.note_id);
      query = query.in("id", noteIds);
    } else {
      // If no notes in folder, return empty array
      return [];
    }
  }
  
  const { data, error } = await query.order("updated_at", { ascending: false });
  
  if (error) {
    console.error("Error fetching notes:", error);
    return [];
  }
  
  return data || [];
}

export async function getNote(id: string): Promise<Note | null> {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error) {
    console.error("Error fetching note:", error);
    return null;
  }
  
  return data;
}

export async function createNote(note: Partial<NoteInput>): Promise<Note | null> {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData?.user) {
    console.error("No authenticated user found");
    return null;
  }
  
  const newNote = {
    ...note,
    user_id: userData.user.id,
    title: note.title || "Untitled Note",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  const { data, error } = await supabase
    .from("notes")
    .insert(newNote)
    .select()
    .single();
  
  if (error) {
    console.error("Error creating note:", error);
    return null;
  }
  
  return data;
}

export async function updateNote(id: string, updates: Partial<Note>): Promise<Note | null> {
  // Always update the updated_at timestamp
  const updatedNote = {
    ...updates,
    updated_at: new Date().toISOString(),
  };
  
  const { data, error } = await supabase
    .from("notes")
    .update(updatedNote)
    .eq("id", id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating note:", error);
    return null;
  }
  
  return data;
}

export async function toggleFavorite(id: string, isFavorite: boolean): Promise<boolean> {
  const { error } = await supabase
    .from("notes")
    .update({ is_favorite: isFavorite })
    .eq("id", id);
  
  if (error) {
    console.error("Error toggling favorite:", error);
    return false;
  }
  
  return true;
}

export async function toggleArchived(id: string, isArchived: boolean): Promise<boolean> {
  const { error } = await supabase
    .from("notes")
    .update({ is_archived: isArchived })
    .eq("id", id);
  
  if (error) {
    console.error("Error toggling archive status:", error);
    return false;
  }
  
  return true;
}

export async function trashNote(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("notes")
    .update({
      is_trashed: true,
      trashed_at: new Date().toISOString(),
    })
    .eq("id", id);
  
  if (error) {
    console.error("Error trashing note:", error);
    return false;
  }
  
  return true;
}

export async function restoreNote(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("notes")
    .update({
      is_trashed: false,
      trashed_at: null,
    })
    .eq("id", id);
  
  if (error) {
    console.error("Error restoring note:", error);
    return false;
  }
  
  return true;
}

export async function deleteNote(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", id);
  
  if (error) {
    console.error("Error deleting note permanently:", error);
    return false;
  }
  
  return true;
}

export async function deleteNotesPermanently(ids: string[]): Promise<boolean> {
  const { error } = await supabase
    .from("notes")
    .delete()
    .in("id", ids);
  
  if (error) {
    console.error("Error deleting notes permanently:", error);
    return false;
  }
  
  return true;
}
