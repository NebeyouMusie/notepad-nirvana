
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { fetchNotes, Note, restoreNote, deleteNotePermanently } from "@/services/noteService";
import { motion } from "framer-motion";
import { Loader2, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Trash() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const loadNotes = async () => {
    setIsLoading(true);
    const data = await fetchNotes({ onlyTrashed: true });
    setNotes(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const handleRestore = async (note: Note) => {
    const result = await restoreNote(note.id);
    if (result) {
      toast({
        title: "Note restored",
        description: "The note has been moved out of trash",
      });
      loadNotes();
    }
  };

  const confirmDelete = (note: Note) => {
    setSelectedNote(note);
    setIsDialogOpen(true);
  };

  const handlePermanentDelete = async () => {
    if (!selectedNote) return;
    
    setIsDeleting(true);
    const result = await deleteNotePermanently(selectedNote.id);
    setIsDeleting(false);
    setIsDialogOpen(false);
    
    if (result) {
      toast({
        title: "Note deleted permanently",
        description: "The note has been permanently deleted",
      });
      loadNotes();
    }
  };

  const getTimeRemaining = (trashDate: string) => {
    if (!trashDate) return "Unknown";
    
    const trashedAt = new Date(trashDate);
    const deleteAfter = new Date(trashedAt);
    deleteAfter.setDate(deleteAfter.getDate() + 30);
    
    const now = new Date();
    const daysRemaining = Math.floor((deleteAfter.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysRemaining <= 0 ? "Will be deleted soon" : `${daysRemaining} days`;
  };

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
              ? "Loading trash..." 
              : `Notes in trash will be permanently deleted after 30 days`}
          </p>
        </motion.div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12">
            <Trash2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Trash is empty</h3>
            <p className="text-muted-foreground">No notes in trash</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div 
                key={note.id} 
                className="bg-card border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between"
              >
                <div className="mb-4 md:mb-0">
                  <h3 className="font-medium">{note.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Deleted on {new Date(note.trashed_at || "").toLocaleDateString()} · Will be permanently deleted in {getTimeRemaining(note.trashed_at || "")}
                  </p>
                </div>
                <div className="flex gap-2 self-end md:self-auto">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleRestore(note)}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Restore
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => confirmDelete(note)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Permanently
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Permanently</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this note? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handlePermanentDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
