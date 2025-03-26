
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { getNote } from "@/services/noteService";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchFolders } from "@/services/folderService";

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [note, setNote] = useState<any>(null);
  const [folders, setFolders] = useState<any[]>([]);

  // Extract folderId from location state if present
  const folderId = location.state?.folderId;
  
  const isNewNote = !id || id === "new";
  
  useEffect(() => {
    const loadNote = async () => {
      if (isNewNote) return;
      
      setIsLoading(true);
      const noteData = await getNote(id!);
      setNote(noteData);
      setIsLoading(false);
      
      if (!noteData) {
        toast({
          title: "Note not found",
          description: "The note you're looking for doesn't exist or has been deleted",
          variant: "destructive",
        });
        navigate("/");
      }
    };
    
    const loadFolders = async () => {
      const folderData = await fetchFolders();
      setFolders(folderData);
    };
    
    loadNote();
    loadFolders();
  }, [id, navigate]);
  
  const handleSave = (noteId: string) => {
    if (isNewNote) {
      toast({
        title: "Note created",
        description: "Your new note has been saved",
      });
      navigate(`/notes/${noteId}`);
    } else {
      toast({
        title: "Note updated",
        description: "Your changes have been saved",
      });
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto h-[calc(100vh-12rem)]">
          <Skeleton className="h-10 w-full mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
          </div>
          <Skeleton className="h-48 w-full mt-4" />
        </div>
      </AppLayout>
    );
  }

  // Find folder name if available
  const currentFolderName = folders.find(folder => 
    folder.id === (isNewNote ? folderId : note?.folderId)
  )?.name || '';

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-3xl mx-auto h-[calc(100vh-12rem)]"
      >
        <NoteEditor
          noteId={isNewNote ? undefined : id}
          initialTitle={isNewNote ? "" : note?.title || ""}
          initialContent={isNewNote ? "" : note?.content || ""}
          initialTags={isNewNote ? [] : note?.tags || []}
          initialColor={isNewNote ? "#FFFFFF" : note?.color || "#FFFFFF"}
          initialFolderId={isNewNote ? folderId : note?.folderId}
          currentFolderName={currentFolderName}
          folders={folders}
          onSave={handleSave}
        />
      </motion.div>
    </AppLayout>
  );
}
