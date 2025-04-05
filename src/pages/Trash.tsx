import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { fetchNotes } from "@/services/noteService";
import { Note } from "@/types";
import { NoteGrid } from "@/components/notes/NoteGrid";
import { motion } from "framer-motion";
import { Loader2, Trash2 } from "lucide-react";

export default function Trash() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotes = async () => {
    setIsLoading(true);
    const data = await fetchNotes({ trashed: true });
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
          <h1 className="text-3xl font-semibold">Trash</h1>
          <p className="text-muted-foreground">
            {isLoading
              ? "Loading trashed notes..."
              : `You have ${notes.length} trashed note${notes.length !== 1 ? 's' : ''}`}
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12">
            <Trash2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No trashed notes</h3>
            <p className="text-muted-foreground">Notes you delete are moved to the trash</p>
          </div>
        ) : (
          <NoteGrid notes={notes} onUpdate={loadNotes} />
        )}
      </div>
    </AppLayout>
  );
}
