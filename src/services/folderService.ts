import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type Folder = {
  id: string;
  created_at: string;
  name: string;
  user_id: string;
};

// Create a new folder
export const createFolder = async (name: string): Promise<Folder | null> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    if (!userId) {
      throw new Error("You must be logged in to create folders");
    }
    
    // Check if user can create more folders (free plan limit)
    const { data: canCreate } = await supabase.rpc('check_user_limits', {
      p_user_id: userId,
      p_check_type: 'folder'
    });
    
    // If user has reached the limit
    if (canCreate === false) {
      throw new Error("You've reached your folders limit. Please upgrade to create more folders.");
    }
    
    const { data, error } = await supabase
      .from('folders')
      .insert({
        name,
        user_id: userId
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating folder:", error);
    throw error;
  }
};

// Fetch all folders for the current user
export const fetchFolders = async (): Promise<Folder[]> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      console.error("User not logged in");
      return [];
    }

    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching folders:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching folders:", error);
    return [];
  }
};

// Update an existing folder
export const updateFolder = async (id: string, updates: Partial<Folder>): Promise<Folder | null> => {
  try {
    const { data, error } = await supabase
      .from('folders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating folder:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error updating folder:", error);
    throw error;
  }
};

// Delete a folder
export const deleteFolder = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting folder:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error deleting folder:", error);
    return false;
  }
};
