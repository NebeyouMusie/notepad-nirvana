
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { NoteGrid } from "@/components/notes/NoteGrid";
import { fetchNotes } from "@/services/noteService";
import { Note } from "@/types";
import { motion } from "framer-motion";
import { Loader2, Archive } from "lucide-react";

export default function Archived() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotes = async () => {
    setIsLoading(true);
    const data = await fetchNotes({ archived: true });
    setNotes(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadNotes();
  }, []);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-semibold">Archived Notes</h1>
          <p className="text-muted-foreground">
            {isLoading 
              ? "Loading archived notes..." 
              : `You have ${notes.length} archived note${notes.length !== 1 ? 's' : ''}`}
          </p>
        </motion.div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12">
            <Archive className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No archived notes</h3>
            <p className="text-muted-foreground">Archive notes you want to keep but don't need right now</p>
          </div>
        ) : (
          <NoteGrid notes={notes} onUpdate={loadNotes} />
        )}
      </div>
    </AppLayout>
  );
}
