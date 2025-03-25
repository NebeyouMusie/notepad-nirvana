
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Folder {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

// Fetch all folders
export async function fetchFolders() {
  try {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .order('name', { ascending: true });
    
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

// Create a new folder
export async function createFolder(name: string) {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("You must be logged in to create folders");
    }
    
    const { data, error } = await supabase
      .from('folders')
      .insert([{
        name,
        user_id: user.id
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

// Update a folder
export async function updateFolder(id: string, name: string) {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("You must be logged in to update folders");
    }
    
    const { data, error } = await supabase
      .from('folders')
      .update({ name })
      .eq('id', id)
      .eq('user_id', user.id)
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

// Get a folder by ID
export async function getFolder(id: string) {
  try {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error: any) {
    toast({
      title: "Error fetching folder",
      description: error.message,
      variant: "destructive",
    });
    return null;
  }
}

// Delete a folder
export async function deleteFolder(id: string) {
  try {
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
    const { error } = await supabase
      .from('notes_folders')
      .insert([{ note_id: noteId, folder_id: folderId }]);
    
    if (error) throw error;
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
