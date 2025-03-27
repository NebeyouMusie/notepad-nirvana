
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Folder {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

// Fetch all folders for the current user
export async function fetchFolders() {
  try {
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to view folders",
        variant: "destructive",
      });
      return [];
    }
    
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error: any) {
    toast({
      title: "Error fetching folders",
      description: error.message,
      variant: "destructive",
    });
    return [];
  }
}

// Get a specific folder by ID
export async function getFolder(id: string) {
  try {
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to view folders",
        variant: "destructive",
      });
      return null;
    }
    
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Error fetching folder:", error.message);
    return null;
  }
}

// Create a new folder
export async function createFolder(name: string) {
  try {
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to create folders",
        variant: "destructive",
      });
      return null;
    }
    
    const { data, error } = await supabase
      .from('folders')
      .insert([{ 
        name,
        user_id: session.user.id
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error: any) {
    toast({
      title: "Error creating folder",
      description: error.message,
      variant: "destructive",
    });
    return null;
  }
}

// Update a folder name
export async function updateFolder(id: string, name: string) {
  try {
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to update folders",
        variant: "destructive",
      });
      return null;
    }
    
    const { data, error } = await supabase
      .from('folders')
      .update({ name })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error: any) {
    toast({
      title: "Error updating folder",
      description: error.message,
      variant: "destructive",
    });
    return null;
  }
}

// Delete a folder
export async function deleteFolder(id: string) {
  try {
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to delete folders",
        variant: "destructive",
      });
      return false;
    }
    
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error: any) {
    toast({
      title: "Error deleting folder",
      description: error.message,
      variant: "destructive",
    });
    return false;
  }
}

// Add a note to a folder
export async function addNoteToFolder(noteId: string, folderId: string) {
  try {
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to update folders",
        variant: "destructive",
      });
      return false;
    }
    
    // First check if the note is already in this folder
    const { data: existingEntry, error: checkError } = await supabase
      .from('notes_folders')
      .select('*')
      .eq('note_id', noteId)
      .eq('folder_id', folderId);
      
    if (checkError) throw checkError;
    
    // If the note is already in the folder, return true without trying to insert
    if (existingEntry && existingEntry.length > 0) {
      return true;
    }
    
    // If not already in the folder, insert it
    const { error } = await supabase
      .from('notes_folders')
      .insert([{ note_id: noteId, folder_id: folderId }]);
    
    if (error) {
      if (error.code === '23505') { // PostgreSQL duplicate key error code
        // This is fine, the note is already in the folder
        return true;
      }
      throw error;
    }
    
    return true;
  } catch (error: any) {
    toast({
      title: "Error adding note to folder",
      description: error.message,
      variant: "destructive",
    });
    return false;
  }
}

// Remove a note from a folder
export async function removeNoteFromFolder(noteId: string, folderId: string) {
  try {
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to update folders",
        variant: "destructive",
      });
      return false;
    }
    
    const { error } = await supabase
      .from('notes_folders')
      .delete()
      .match({ note_id: noteId, folder_id: folderId });
    
    if (error) throw error;
    
    return true;
  } catch (error: any) {
    toast({
      title: "Error removing note from folder",
      description: error.message,
      variant: "destructive",
    });
    return false;
  }
}

// Get all folders a note belongs to
export async function getNotesFolders(noteId: string) {
  try {
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to view folders",
        variant: "destructive",
      });
      return [];
    }
    
    const { data, error } = await supabase
      .from('notes_folders')
      .select('folder_id')
      .eq('note_id', noteId);
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      const folderIds = data.map(item => item.folder_id);
      
      const { data: folders, error: foldersError } = await supabase
        .from('folders')
        .select('*')
        .in('id', folderIds);
      
      if (foldersError) throw foldersError;
      
      return folders || [];
    }
    
    return [];
  } catch (error: any) {
    console.error("Error fetching note's folders:", error.message);
    return [];
  }
}
