
import { supabase } from "@/integrations/supabase/client";

export interface Folder {
  id: string;
  name: string;
  created_at: string;
}

export const getFolders = async (): Promise<Folder[]> => {
  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return data as Folder[];
};

export const createFolder = async (name: string): Promise<Folder> => {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user) {
    throw new Error("User not authenticated");
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
    throw new Error(error.message);
  }

  return data as Folder;
};

export const updateFolder = async (id: string, name: string): Promise<Folder> => {
  const { data, error } = await supabase
    .from("folders")
    .update({ name })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Folder;
};

export const deleteFolder = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("folders")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
};

export const addNoteToFolder = async (noteId: string, folderId: string): Promise<void> => {
  const { error } = await supabase
    .from("notes_folders")
    .insert({ note_id: noteId, folder_id: folderId });

  if (error) {
    throw new Error(error.message);
  }
};

export const removeNoteFromFolder = async (noteId: string, folderId: string): Promise<void> => {
  const { error } = await supabase
    .from("notes_folders")
    .delete()
    .eq("note_id", noteId)
    .eq("folder_id", folderId);

  if (error) {
    throw new Error(error.message);
  }
};

export const getNotesInFolder = async (folderId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from("notes_folders")
    .select("note_id")
    .eq("folder_id", folderId);

  if (error) {
    throw new Error(error.message);
  }

  return data.map(item => item.note_id);
};

export const subscribeToFolders = (
  callback: (folders: Folder[]) => void
): (() => void) => {
  const channel = supabase
    .channel('public:folders')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'folders' },
      async () => {
        // Fetch updated folders when any change occurs
        try {
          const folders = await getFolders();
          callback(folders);
        } catch (error) {
          console.error("Error fetching updated folders:", error);
        }
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
};
