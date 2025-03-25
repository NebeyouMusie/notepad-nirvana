
import { useState } from "react";
import { Link } from "react-router-dom";
import { Star, Trash, Archive, RotateCcw, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { toggleFavorite, trashNote, archiveNote, restoreNote } from "@/services/noteService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface NoteProps {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  isFavorite?: boolean;
  isArchived?: boolean;
  isDeleted?: boolean;
  deletedAt?: string | null;
  tags?: string[];
  color?: string;
}

export function NoteCard({ 
  id, 
  title, 
  content, 
  createdAt, 
  isFavorite = false, 
  isArchived = false,
  isDeleted = false,
  deletedAt = null,
  tags = [], 
  color = "#FFFFFF" 
}: NoteProps) {
  const [favorite, setFavorite] = useState(isFavorite);
  const [isRemoving, setIsRemoving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  
  const deletionDate = deletedAt ? new Date(deletedAt) : null;
  const daysUntilDeletion = deletionDate 
    ? Math.max(0, 30 - Math.floor((new Date().getTime() - deletionDate.getTime()) / (1000 * 60 * 60 * 24)))
    : null;
  
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

  const handleArchive = async () => {
    try {
      setIsRemoving(true);
      await archiveNote(id, !isArchived);
      toast({
        title: isArchived ? "Note unarchived" : "Note archived",
        description: isArchived ? "Your note has been moved back to notes" : "Your note has been archived",
      });
    } catch (error) {
      console.error("Error archiving note:", error);
      toast({
        title: "Error",
        description: "Could not archive note",
        variant: "destructive",
      });
      setIsRemoving(false);
    }
  };

  const handleTrash = async () => {
    try {
      setIsRemoving(true);
      await trashNote(id);
      toast({
        title: "Note moved to trash",
        description: "Your note will be permanently deleted in 30 days",
      });
    } catch (error) {
      console.error("Error trashing note:", error);
      toast({
        title: "Error",
        description: "Could not trash note",
        variant: "destructive",
      });
      setIsRemoving(false);
    }
  };

  const handleRestore = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setIsRemoving(true);
      await restoreNote(id);
      toast({
        title: "Note restored",
        description: "Your note has been moved back to notes",
      });
    } catch (error) {
      console.error("Error restoring note:", error);
      toast({
        title: "Error",
        description: "Could not restore note",
        variant: "destructive",
      });
      setIsRemoving(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={isRemoving ? "hidden" : ""}
      >
        <div 
          className="note-card group rounded-lg border p-4 h-64 flex flex-col relative transition-all hover:shadow-md"
          style={{
            background: `linear-gradient(135deg, ${color}10, ${color}30)`,
            borderColor: `${color}30`,
          }}
        >
          <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!isDeleted && (
              <>
                <button
                  onClick={handleToggleFavorite}
                  className="rounded-full p-1 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
                  title={favorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <Star size={16} className={favorite ? "fill-yellow-400 text-yellow-400" : ""} />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setArchiveDialogOpen(true);
                  }}
                  className="rounded-full p-1 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  aria-label={isArchived ? "Unarchive note" : "Archive note"}
                  title={isArchived ? "Unarchive note" : "Archive note"}
                >
                  <Archive size={16} className={isArchived ? "text-blue-400" : ""} />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDeleteDialogOpen(true);
                  }}
                  className="rounded-full p-1 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  aria-label="Delete note"
                  title="Move to trash"
                >
                  <Trash size={16} />
                </button>
              </>
            )}
            
            {isDeleted && (
              <button
                onClick={handleRestore}
                className="rounded-full p-1 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                aria-label="Restore note"
                title="Restore note"
              >
                <RotateCcw size={16} />
              </button>
            )}
            
            <button
              className="rounded-full p-1 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              aria-label="More options"
              title="More options"
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
              
              <div className="text-xs text-muted-foreground mt-auto flex justify-between items-center">
                <span>{formattedDate}</span>
                {isDeleted && daysUntilDeletion !== null && (
                  <span className="text-red-400">
                    Deletes in {daysUntilDeletion} days
                  </span>
                )}
              </div>
            </div>
          </Link>
        </div>
      </motion.div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="font-poppins">
          <AlertDialogHeader>
            <AlertDialogTitle>Move to Trash?</AlertDialogTitle>
            <AlertDialogDescription>
              This note will be moved to trash and permanently deleted after 30 days.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleTrash();
                setDeleteDialogOpen(false);
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Move to Trash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Archive Confirmation Dialog */}
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent className="font-poppins">
          <AlertDialogHeader>
            <AlertDialogTitle>{isArchived ? "Unarchive Note?" : "Archive Note?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {isArchived 
                ? "This note will be moved back to your notes." 
                : "This note will be archived and removed from your main notes view."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleArchive();
                setArchiveDialogOpen(false);
              }}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {isArchived ? "Unarchive" : "Archive"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
