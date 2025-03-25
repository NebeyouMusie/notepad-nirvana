
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { NoteGrid } from "@/components/notes/NoteGrid";
import { NoteProps } from "@/components/notes/NoteCard";
import { useToast } from "@/hooks/use-toast";
import { searchNotes } from "@/services/noteService";
import { motion } from "framer-motion";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [notes, setNotes] = useState<NoteProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchNotes = async () => {
      if (!query.trim()) {
        setNotes([]);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const results = await searchNotes(query);
        setNotes(results);
      } catch (error) {
        console.error("Error searching notes:", error);
        toast({
          title: "Error searching notes",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [query, toast]);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-semibold font-poppins">Search Results</h1>
          <p className="text-muted-foreground font-poppins">
            {isLoading 
              ? "Searching notes..." 
              : `Found ${notes.length} note${notes.length !== 1 ? 's' : ''} for "${query}"`}
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
            <p className="text-muted-foreground font-poppins">No notes found matching your search</p>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
