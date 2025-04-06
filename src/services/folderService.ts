
import { supabase } from "@/integrations/supabase/client";

export interface Folder {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

export async function fetchFolders(): Promise<Folder[]> {
  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching folders:", error);
    return [];
  }

  return data || [];
}

export async function createFolder(name: string): Promise<Folder | null> {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData?.user) {
    console.error("No authenticated user found");
    return null;
  }
  
  const { data, error } = await supabase
    .from("folders")
    .insert({
      name,
      user_id: userData.user.id
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating folder:", error);
    return null;
  }
  
  return data;
}

export async function updateFolder(id: string, updates: Partial<Folder>): Promise<Folder | null> {
  const { data, error } = await supabase
    .from("folders")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating folder:", error);
    return null;
  }
  
  return data;
}

export async function deleteFolder(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("folders")
    .delete()
    .eq("id", id);
  
  if (error) {
    console.error("Error deleting folder:", error);
    return false;
  }
  
  return true;
}
