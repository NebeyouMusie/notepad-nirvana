
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { NoteGrid } from "@/components/notes/NoteGrid";
import { fetchNotes, Note } from "@/services/noteService";
import { Folder, fetchFolders, updateFolder, deleteFolder } from "@/services/folderService";
import { motion } from "framer-motion";
import { Loader2, Pencil, Trash2, FolderOpen } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function FolderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [folder, setFolder] = useState<Folder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    
    // Load folder
    const folders = await fetchFolders();
    const currentFolder = folders.find(f => f.id === id);
    setFolder(currentFolder || null);
    
    if (currentFolder) {
      setNewFolderName(currentFolder.name);
      
      // Load notes in folder
      const folderNotes = await fetchNotes({ folderId: id });
      setNotes(folderNotes);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const handleUpdateFolder = async () => {
    if (!id || !newFolderName.trim()) return;
    
    setIsProcessing(true);
    const updatedFolder = await updateFolder(id, newFolderName.trim());
    
    if (updatedFolder) {
      setFolder(updatedFolder);
      setIsEditing(false);
      toast({
        title: "Folder updated",
        description: "Folder name has been updated",
      });
    }
    setIsProcessing(false);
  };

  const handleDeleteFolder = async () => {
    if (!id) return;
    
    setIsProcessing(true);
    const success = await deleteFolder(id);
    
    if (success) {
      toast({
        title: "Folder deleted",
        description: "The folder has been deleted",
      });
      navigate("/");
    }
    setIsProcessing(false);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!folder) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto text-center py-12">
          <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Folder not found</h3>
          <p className="text-muted-foreground">The folder you're looking for doesn't exist</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="max-w-xs"
                  autoFocus
                />
                <Button 
                  onClick={handleUpdateFolder} 
                  disabled={isProcessing || !newFolderName.trim()}
                  size="sm"
                >
                  {isProcessing ? "Saving..." : "Save"}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setIsEditing(false);
                    setNewFolderName(folder.name);
                  }}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <h1 className="text-3xl font-semibold flex items-center">
                <FolderOpen className="mr-2 h-6 w-6" />
                {folder.name}
              </h1>
            )}
            
            <div className="flex items-center gap-2">
              {!isEditing && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Rename
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
          <p className="text-muted-foreground">
            {notes.length} note{notes.length !== 1 ? 's' : ''} in this folder
          </p>
        </motion.div>
        
        <NoteGrid notes={notes} onUpdate={loadData} />
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Folder</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the folder "{folder.name}"? The notes within this folder will not be deleted, but they will be removed from this folder.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteFolder}
              disabled={isProcessing}
            >
              {isProcessing ? "Deleting..." : "Delete Folder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
