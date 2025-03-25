
import { useState } from "react";
import { Link } from "react-router-dom";
import { Star, Trash, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { toggleFavorite, deleteNote } from "@/services/noteService";

export interface NoteProps {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  isFavorite?: boolean;
  tags?: string[];
  color?: string;
}

export function NoteCard({ id, title, content, createdAt, isFavorite = false, tags = [], color = "#FFFFFF" }: NoteProps) {
  const [favorite, setFavorite] = useState(isFavorite);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  
  const excerpt = content.length > 100 ? `${content.substring(0, 100)}...` : content;
  
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setFavorite(!favorite);
      await toggleFavorite(id, !favorite);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      setFavorite(favorite); // Revert on error
      toast({
        title: "Error",
        description: "Could not update favorite status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm("Are you sure you want to delete this note?")) {
      try {
        setIsDeleting(true);
        await deleteNote(id);
        toast({
          title: "Note deleted",
          description: "Your note has been moved to trash",
        });
      } catch (error) {
        console.error("Error deleting note:", error);
        toast({
          title: "Error",
          description: "Could not delete note",
          variant: "destructive",
        });
        setIsDeleting(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={isDeleting ? "hidden" : ""}
    >
      <div 
        className="note-card group rounded-lg border p-4 h-64 flex flex-col relative transition-all hover:shadow-md"
        style={{
          background: `linear-gradient(135deg, ${color}10, ${color}30)`,
          borderColor: `${color}30`,
        }}
      >
        <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleToggleFavorite}
            className="rounded-full p-1 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star size={16} className={favorite ? "fill-yellow-400 text-yellow-400" : ""} />
          </button>
          <button
            onClick={handleDelete}
            className="rounded-full p-1 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label="Delete note"
          >
            <Trash size={16} />
          </button>
          <button
            className="rounded-full p-1 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label="More options"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
        
        <Link to={`/notes/${id}`} className="block h-full">
          <div className="flex flex-col h-full">
            <h3 className="font-medium mb-2 line-clamp-2 text-balance">{title}</h3>
            <div className="text-sm text-muted-foreground mb-3 flex-1">{excerpt}</div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            <div className="text-xs text-muted-foreground mt-auto">
              {formattedDate}
            </div>
          </div>
        </Link>
      </div>
    </motion.div>
  );
}
