
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
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to view your folders",
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

// Create a new folder
export async function createFolder(name: string) {
  try {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create folders",
        variant: "destructive",
      });
      return null;
    }

    const { data, error } = await supabase
      .from('folders')
      .insert([{ name }])
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
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to update folders",
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
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to delete folders",
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
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to update notes",
        variant: "destructive",
      });
      return false;
    }

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
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to update notes",
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
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to view folders",
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
    toast({
      title: "Error fetching note's folders",
      description: error.message,
      variant: "destructive",
    });
    return [];
  }
}
