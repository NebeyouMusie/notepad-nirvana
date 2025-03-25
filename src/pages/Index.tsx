
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { NoteGrid } from "@/components/notes/NoteGrid";
import { NoteProps } from "@/components/notes/NoteCard";
import { useToast } from "@/hooks/use-toast";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { motion } from "framer-motion";
import { 
  getNotes, 
  getFavoriteNotes, 
  subscribeToNotes 
} from "@/services/noteService";
import { 
  getFolders,
  getNotesInFolder, 
  subscribeToFolders 
} from "@/services/folderService";

interface IndexProps {
  filter?: "favorites" | "folder" | "archived" | "trash";
}

export default function Index({ filter }: IndexProps) {
  const { folderId } = useParams();
  const [notes, setNotes] = useState<NoteProps[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useRequireAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        let fetchedNotes: NoteProps[] = [];
        
        if (filter === "favorites") {
          fetchedNotes = await getFavoriteNotes();
        } else if (filter === "folder" && folderId) {
          const noteIds = await getNotesInFolder(folderId);
          const allNotes = await getNotes();
          fetchedNotes = allNotes.filter(note => noteIds.includes(note.id));
        } else {
          fetchedNotes = await getNotes();
        }
        
        setNotes(fetchedNotes);
        
        // Fetch folders for sidebar
        const fetchedFolders = await getFolders();
        setFolders(fetchedFolders);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error fetching notes",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscriptions
    const unsubscribeNotes = subscribeToNotes((updatedNotes) => {
      if (filter === "favorites") {
        setNotes(updatedNotes.filter(note => note.isFavorite));
      } else if (filter === "folder" && folderId) {
        // We'll need to refetch folder notes when notes change
        getNotesInFolder(folderId).then(noteIds => {
          setNotes(updatedNotes.filter(note => noteIds.includes(note.id)));
        });
      } else {
        setNotes(updatedNotes);
      }
    });

    const unsubscribeFolders = subscribeToFolders((updatedFolders) => {
      setFolders(updatedFolders);
    });

    return () => {
      unsubscribeNotes();
      unsubscribeFolders();
    };
  }, [user, filter, folderId, toast]);

  // Get page title based on filter
  const getPageTitle = () => {
    if (filter === "favorites") return "Favorite Notes";
    if (filter === "folder" && folderId) {
      const folder = folders.find(f => f.id === folderId);
      return folder ? `${folder.name}` : "Folder";
    }
    if (filter === "archived") return "Archived Notes";
    if (filter === "trash") return "Trash";
    return "All Notes";
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-semibold">{getPageTitle()}</h1>
          <p className="text-muted-foreground">
            {isLoading 
              ? "Loading notes..." 
              : `You have ${notes.length} note${notes.length !== 1 ? 's' : ''}`}
          </p>
        </motion.div>
        
        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : notes.length > 0 ? (
          <NoteGrid notes={notes} />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-12 border border-dashed rounded-lg"
          >
            <p className="text-muted-foreground">No notes found</p>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
