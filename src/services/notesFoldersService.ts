
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Add a note to a folder
export const addNoteToFolder = async (noteId: string, folderId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notes_folders')
      .insert({ note_id: noteId, folder_id: folderId });
      
    if (error) {
      console.error("Error adding note to folder:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error in addNoteToFolder:", error);
    return false;
  }
};

// Remove a note from a folder
export const removeNoteFromFolder = async (noteId: string, folderId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notes_folders')
      .delete()
      .eq('note_id', noteId)
      .eq('folder_id', folderId);
      
    if (error) {
      console.error("Error removing note from folder:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error in removeNoteFromFolder:", error);
    return false;
  }
};

// Get all notes for a folder
export const getNotesForFolder = async (folderId: string) => {
  try {
    const { data, error } = await supabase
      .from('notes_folders')
      .select(`
        note_id,
        notes:note_id(*)
      `)
      .eq('folder_id', folderId);
      
    if (error) {
      console.error("Error fetching notes for folder:", error);
      throw error;
    }
    
    // Extract note objects from the joined query
    return data?.map(item => item.notes) || [];
  } catch (error) {
    console.error("Error in getNotesForFolder:", error);
    return [];
  }
};

// Get all folders for a note
export const getFoldersForNote = async (noteId: string) => {
  try {
    const { data, error } = await supabase
      .from('notes_folders')
      .select(`
        folder_id,
        folders:folder_id(*)
      `)
      .eq('note_id', noteId);
      
    if (error) {
      console.error("Error fetching folders for note:", error);
      throw error;
    }
    
    // Extract folder objects from the joined query
    return data?.map(item => item.folders) || [];
  } catch (error) {
    console.error("Error in getFoldersForNote:", error);
    return [];
  }
};
