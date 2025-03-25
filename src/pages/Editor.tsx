
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { motion } from "framer-motion";
import { createNote, getNoteById, updateNote } from "@/services/noteService";

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useRequireAuth();
  const [initialTitle, setInitialTitle] = useState("");
  const [initialContent, setInitialContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const isNewNote = !id || id === "new";
  
  useEffect(() => {
    const fetchNote = async () => {
      if (isNewNote || !user) {
        setIsLoading(false);
        return;
      }
      
      try {
        const note = await getNoteById(id);
        setInitialTitle(note.title);
        setInitialContent(note.content);
      } catch (error) {
        console.error("Error fetching note:", error);
        toast({
          title: "Error fetching note",
          description: "The note could not be loaded",
          variant: "destructive",
        });
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
  }, [id, isNewNote, user, navigate, toast]);
  
  const handleSave = async (title: string, content: string) => {
    if (!user) return;

    try {
      if (isNewNote) {
        await createNote({ title, content });
        toast({
          title: "Note created",
          description: "Your new note has been created",
        });
        navigate("/");
      } else {
        await updateNote(id, { title, content });
        toast({
          title: "Note updated",
          description: "Your changes have been saved",
        });
      }
    } catch (error) {
      console.error("Error saving note:", error);
      toast({
        title: "Error saving note",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-[calc(100vh-12rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
          initialTitle={initialTitle}
          initialContent={initialContent}
          onSave={handleSave}
        />
      </motion.div>
    </AppLayout>
  );
}
