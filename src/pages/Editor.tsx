
import { AppLayout } from "@/components/layout/AppLayout";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isNewNote = id === "new";
  
  const handleSave = (title: string, content: string) => {
    // This would normally save to a backend/database
    toast({
      title: "Note saved",
      description: isNewNote 
        ? "Your new note has been created"
        : "Your changes have been saved",
    });
    
    if (isNewNote) {
      navigate("/");
    }
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-3xl mx-auto h-[calc(100vh-12rem)]"
      >
        <NoteEditor
          initialTitle={isNewNote ? "" : "Sample Note Title"}
          initialContent={isNewNote ? "" : "This is a sample note content.\n\nFeel free to edit this text."}
          onSave={handleSave}
        />
      </motion.div>
    </AppLayout>
  );
}
