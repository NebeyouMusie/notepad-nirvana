import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { NoteGrid } from "@/components/notes/NoteGrid";
import { fetchNotes } from "@/services/noteService";
import { fetchFolders, updateFolder, deleteFolder } from "@/services/folderService";
import { Note, Folder } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Loader2, FolderOpen, Pencil, Trash, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function FolderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [folder, setFolder] = useState<Folder | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const loadData = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      // Load folder details
      const folders = await fetchFolders();
      const currentFolder = folders.find(f => f.id === id) || null;
      
      if (!currentFolder) {
        navigate("/");
        return;
      }
      
      setFolder(currentFolder);
      setFolderName(currentFolder.name);
      
      // Load notes in this folder
      const folderNotes = await fetchNotes({ folderId: id });
      setNotes(folderNotes);
    } catch (error) {
      console.error("Error loading folder data:", error);
      toast({
        title: "Error",
        description: "Failed to load folder data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, navigate]);

  const handleUpdateFolder = async () => {
    if (!id || !folderName.trim()) return;
    
    setIsUpdating(true);
    try {
      await updateFolder(id, { name: folderName });
      setFolder(prev => prev ? { ...prev, name: folderName } : null);
      setIsEditDialogOpen(false);
      toast({
        title: "Folder updated",
        description: "Folder name has been updated successfully",
      });
    } catch (error) {
      console.error("Error updating folder:", error);
      toast({
        title: "Error",
        description: "Failed to update folder",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteFolder = async () => {
    if (!id) return;
    
    setIsUpdating(true);
    try {
      await deleteFolder(id);
      toast({
        title: "Folder deleted",
        description: "Folder has been deleted successfully",
      });
      navigate("/");
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast({
        title: "Error",
        description: "Failed to delete folder",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading folder...</span>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!folder) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <FolderOpen className="h-4 w-4" />
              <span>Folder not found</span>
            </div>
          </div>
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
            <h1 className="text-3xl font-semibold flex items-center gap-2">
              <FolderOpen className="h-6 w-6" />
              {folder.name}
            </h1>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit Folder
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={isUpdating}
              >
                <Trash className="h-4 w-4 mr-2" />
                {isUpdating ? "Deleting..." : "Delete Folder"}
              </Button>
            </div>
          </div>
        </motion.div>
        
        {notes.length === 0 ? (
          <div className="text-center py-12">
            <Plus className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No notes in this folder</h3>
            <p className="text-muted-foreground">Add notes to this folder to see them here</p>
          </div>
        ) : (
          <NoteGrid notes={notes} />
        )}
      </div>

      {/* Edit Folder Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Folder Name</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Input
                id="name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateFolder}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Folder</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p>Are you sure you want to delete this folder? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteFolder}>
              Delete Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
