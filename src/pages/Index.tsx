
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { NoteGrid } from "@/components/notes/NoteGrid";
import { fetchNotes } from "@/services/noteService";
import { Note } from "@/types";
import { motion } from "framer-motion";
import { Loader2, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Index() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotes = async () => {
    setIsLoading(true);
    const data = await fetchNotes();
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
          <h1 className="text-3xl font-semibold">All Notes</h1>
          <p className="text-muted-foreground">
            {isLoading 
              ? "Loading notes..." 
              : `You have ${notes.length} note${notes.length !== 1 ? 's' : ''}`}
          </p>
        </motion.div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No notes found</h3>
            <p className="text-muted-foreground">Create your first note to get started</p>
          </div>
        ) : (
          <NoteGrid notes={notes} onUpdate={loadNotes} />
        )}
      </div>
    </AppLayout>
  );
}
