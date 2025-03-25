
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { NoteGrid } from "@/components/notes/NoteGrid";
import { NoteProps } from "@/components/notes/NoteCard";
import { useToast } from "@/hooks/use-toast";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { motion } from "framer-motion";
import { getDeletedNotes, deleteNote } from "@/services/noteService";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function Trash() {
  const [notes, setNotes] = useState<NoteProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmptyingTrash, setIsEmptyingTrash] = useState(false);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useRequireAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const fetchedNotes = await getDeletedNotes();
        setNotes(fetchedNotes);
      } catch (error) {
        console.error("Error fetching deleted notes:", error);
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

  const handleEmptyTrash = async () => {
    try {
      setIsEmptyingTrash(true);
      
      // Delete all notes in the trash
      for (const note of notes) {
        await deleteNote(note.id);
      }
      
      setNotes([]);
      toast({
        title: "Trash emptied",
        description: "All notes in trash have been permanently deleted",
      });
    } catch (error) {
      console.error("Error emptying trash:", error);
      toast({
        title: "Error",
        description: "Could not empty trash",
        variant: "destructive",
      });
    } finally {
      setIsEmptyingTrash(false);
    }
  };

  const handleDeleteSingleNote = async (id: string) => {
    try {
      await deleteNote(id);
      setNotes(notes.filter(note => note.id !== id));
      toast({
        title: "Note deleted",
        description: "Note has been permanently deleted",
      });
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        title: "Error",
        description: "Could not delete note",
        variant: "destructive",
      });
    } finally {
      setSelectedNote(null);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-semibold font-poppins">Trash</h1>
            <p className="text-muted-foreground font-poppins">
              {isLoading 
                ? "Loading notes..." 
                : `You have ${notes.length} note${notes.length !== 1 ? 's' : ''} in trash`}
            </p>
            <p className="text-xs text-muted-foreground mt-1 font-poppins">
              Notes in trash will be permanently deleted after 30 days
            </p>
          </div>
          
          {notes.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={() => setSelectedNote("all")}
              disabled={isEmptyingTrash}
            >
              Empty Trash
            </Button>
          )}
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
            <p className="text-muted-foreground font-poppins">No notes in trash</p>
          </motion.div>
        )}
      </div>
      
      <AlertDialog 
        open={selectedNote === "all"} 
        onOpenChange={(open) => !open && setSelectedNote(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Empty Trash?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all notes in the trash. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleEmptyTrash}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Empty Trash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog 
        open={selectedNote !== null && selectedNote !== "all"} 
        onOpenChange={(open) => !open && setSelectedNote(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this note. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => selectedNote && handleDeleteSingleNote(selectedNote)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
