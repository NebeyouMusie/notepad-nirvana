
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { NoteGrid } from "@/components/notes/NoteGrid";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchFavoriteNotes, Note } from "@/services/noteService";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Star } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export default function Favorites() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadNotes = async () => {
      setLoading(true);
      const data = await fetchFavoriteNotes();
      setNotes(data);
      setLoading(false);
    };
    
    loadNotes();
  }, []);
  
  const handleCreateNote = () => {
    navigate("/new");
  };
  
  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Favorite Notes</h1>
          <Button onClick={handleCreateNote} size="sm" className="flex items-center gap-1">
            <Plus size={16} />
            New Note
          </Button>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <Skeleton className="h-8 w-2/3 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : notes.length > 0 ? (
          <NoteGrid notes={notes} />
        ) : (
          <EmptyState
            icon={Star}
            title="No favorites yet"
            description="Star your favorite notes to access them quickly."
            action={
              <Button onClick={() => navigate('/')} variant="outline" className="flex items-center gap-1">
                View All Notes
              </Button>
            }
          />
        )}
      </motion.div>
    </AppLayout>
  );
}
