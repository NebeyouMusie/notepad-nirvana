
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

export async function updateFolder(id: string, name: string): Promise<Folder | null> {
  const { data, error } = await supabase
    .from("folders")
    .update({ name })
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

export async function addNoteToFolder(noteId: string, folderId: string): Promise<boolean> {
  // First check if the association already exists
  const { data: existingAssociation } = await supabase
    .from("notes_folders")
    .select("*")
    .eq("note_id", noteId)
    .eq("folder_id", folderId)
    .single();

  if (existingAssociation) {
    // Already exists, no need to create again
    return true;
  }

  const { error } = await supabase
    .from("notes_folders")
    .insert({
      note_id: noteId,
      folder_id: folderId
    });

  if (error) {
    console.error("Error adding note to folder:", error);
    return false;
  }

  return true;
}

export async function removeNoteFromFolder(noteId: string, folderId: string): Promise<boolean> {
  const { error } = await supabase
    .from("notes_folders")
    .delete()
    .eq("note_id", noteId)
    .eq("folder_id", folderId);

  if (error) {
    console.error("Error removing note from folder:", error);
    return false;
  }

  return true;
}

export async function getNotesFolders(noteId: string): Promise<Folder[]> {
  const { data, error } = await supabase
    .from("notes_folders")
    .select("folder_id")
    .eq("note_id", noteId);

  if (error || !data) {
    console.error("Error fetching note's folders:", error);
    return [];
  }

  if (data.length === 0) {
    return [];
  }

  const folderIds = data.map(item => item.folder_id);
  
  const { data: folders, error: foldersError } = await supabase
    .from("folders")
    .select("*")
    .in("id", folderIds);

  if (foldersError || !folders) {
    console.error("Error fetching folders by ids:", foldersError);
    return [];
  }

  return folders;
}
