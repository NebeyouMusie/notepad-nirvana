import { useState } from "react";
import { Link } from "react-router-dom";
import { Star, Trash, MoreHorizontal, Archive } from "lucide-react";
import { motion } from "framer-motion";
import { Note } from "@/types";
import { 
  toggleFavorite, 
  trashNote, 
  toggleArchived 
} from "@/services/noteService";
import { toast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NoteCardProps {
  note: Note;
  onUpdate?: () => void;
}

export function NoteCard({ note, onUpdate }: NoteCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const formattedDate = new Date(note.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  
  // Extract plain text from HTML for excerpt
  const getTextFromHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };
  
  const excerpt = note.content 
    ? getTextFromHtml(note.content).substring(0, 100) + (getTextFromHtml(note.content).length > 100 ? '...' : '')
    : '';
  
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      await toggleFavorite(note.id, !note.is_favorite);
      onUpdate?.();
      toast({
        title: note.is_favorite ? "Removed from favorites" : "Added to favorites",
        duration: 2000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTrash = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      await trashNote(note.id);
      onUpdate?.();
      toast({
        title: "Note moved to trash",
        duration: 2000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleArchive = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      await toggleArchived(note.id, !note.is_archived);
      onUpdate?.();
      toast({
        title: note.is_archived ? "Note unarchived" : "Note archived",
        duration: 2000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div 
        className="note-card group"
        style={{
          background: `linear-gradient(135deg, ${note.color}10, ${note.color}30)`,
          borderColor: `${note.color}30`,
        }}
      >
        <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleToggleFavorite}
            className="rounded-full p-1 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label={note.is_favorite ? "Remove from favorites" : "Add to favorites"}
            disabled={isUpdating}
          >
            <Star size={16} className={note.is_favorite ? "fill-yellow-400 text-yellow-400" : ""} />
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="rounded-full p-1 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                aria-label="More options"
              >
                <MoreHorizontal size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={handleToggleArchive}>
                <Archive className="mr-2 h-4 w-4" />
                {note.is_archived ? "Unarchive" : "Archive"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleTrash}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Move to Trash
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <Link to={`/notes/${note.id}`} className="block h-full">
          <div className="flex flex-col h-full">
            <h3 className="font-medium mb-2 line-clamp-2 text-balance">{note.title}</h3>
            <div className="text-sm text-muted-foreground mb-3 flex-1">{excerpt}</div>
            
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {note.tags.map((tag) => (
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
