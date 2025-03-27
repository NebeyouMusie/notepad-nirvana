
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { NoteGrid } from "@/components/notes/NoteGrid";
import { fetchNotes, Note } from "@/services/noteService";
import { motion } from "framer-motion";
import { Loader2, Star } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function Favorites() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotes = async () => {
    setIsLoading(true);
    const data = await fetchNotes({ favorite: true });
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
          <h1 className="text-3xl font-semibold">Favorites</h1>
          <p className="text-muted-foreground">
            {isLoading 
              ? "Loading favorite notes..." 
              : `You have ${notes.length} favorite note${notes.length !== 1 ? 's' : ''}`}
          </p>
        </motion.div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : notes.length > 0 ? (
          <NoteGrid notes={notes} onUpdate={loadNotes} />
        ) : (
          <EmptyState
            icon={Star}
            title="No favorite notes"
            description="Mark notes as favorites to see them here"
            actionLabel="Browse all notes"
            actionLink="/"
          />
        )}
      </div>
    </AppLayout>
  );
}
