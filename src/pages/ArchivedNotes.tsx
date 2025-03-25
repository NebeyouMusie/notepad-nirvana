
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { NoteGrid } from "@/components/notes/NoteGrid";
import { NoteProps } from "@/components/notes/NoteCard";
import { useToast } from "@/hooks/use-toast";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { motion } from "framer-motion";
import { getArchivedNotes } from "@/services/noteService";

export default function ArchivedNotes() {
  const [notes, setNotes] = useState<NoteProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useRequireAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const fetchedNotes = await getArchivedNotes();
        setNotes(fetchedNotes);
      } catch (error) {
        console.error("Error fetching archived notes:", error);
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
  }, [user, toast]);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-semibold font-poppins">Archived Notes</h1>
          <p className="text-muted-foreground font-poppins">
            {isLoading 
              ? "Loading notes..." 
              : `You have ${notes.length} archived note${notes.length !== 1 ? 's' : ''}`}
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
            <p className="text-muted-foreground font-poppins">No archived notes found</p>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
