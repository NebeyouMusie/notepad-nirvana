
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { getNote } from "@/services/noteService";
import { Loader2 } from "lucide-react";

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [note, setNote] = useState<any>(null);

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
    
    loadNote();
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
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

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
          onSave={handleSave}
        />
      </motion.div>
    </AppLayout>
  );
}
