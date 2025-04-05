
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Note } from "@/types";
import { fetchNote, createNote, updateNote, deleteNote } from "@/services/noteService";
import { fetchFolders } from "@/services/folderService";
import { addNoteToFolder, removeNoteFromFolder } from "@/services/notesFoldersService";
import { 
  Save, 
  MoreVertical, 
  Trash, 
  Star, 
  Archive, 
  FolderPlus,
  StarOff,
  ArchiveRestore,
  Sparkles
} from "lucide-react";
import { usePlan } from "@/hooks/usePlan";
import { Link } from "react-router-dom";

export interface NoteEditorProps {
  onSave?: (note: Note) => void;
}

export function NoteEditor({ onSave }: NoteEditorProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [folders, setFolders] = useState<any[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const { isPremium, isAtNotesLimit } = usePlan();

  // Load note data
  useEffect(() => {
    const loadNote = async () => {
      if (id && id !== "new") {
        setIsLoading(true);
        try {
          const noteData = await fetchNote(id);
          if (noteData) {
            setNote(noteData);
            setTitle(noteData.title);
            setContent(noteData.content || "");
            
            // Load folders for this note
            const allFolders = await fetchFolders();
            setFolders(allFolders);
            
            // For now, just load all folders
            // In a real app, you would fetch which folders this note belongs to
            const noteFolderIds: string[] = []; // This would normally be populated from an API call
            setSelectedFolders(noteFolderIds);
          }
        } catch (error) {
          console.error("Error loading note:", error);
          toast({
            title: "Error",
            description: "Failed to load note",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        // Load folders for new note
        const loadFolders = async () => {
          try {
            const allFolders = await fetchFolders();
            setFolders(allFolders);
          } catch (error) {
            console.error("Error loading folders:", error);
          }
        };
        
        loadFolders();
      }
    };
    
    loadNote();
  }, [id]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Title cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      let savedNote: Note | null = null;
      
      if (id && id !== "new" && note) {
        // Update existing note
        savedNote = await updateNote(id, {
          title,
          content,
        });
      } else {
        // Create new note
        try {
          savedNote = await createNote({
            title,
            content,
          });
        } catch (error: any) {
          // Check if this is a plan limit error
          if (error.message?.includes("limit")) {
            setIsUpgradeDialogOpen(true);
            return;
          }
          throw error;
        }
      }
      
      if (savedNote) {
        // Handle folder assignments
        if (id && id !== "new") {
          // Get current folders
          const currentFolders = folders
            .filter(folder => folder.notes?.some((note: any) => note.id === id))
            .map(folder => folder.id);
          
          // Folders to add
          const foldersToAdd = selectedFolders.filter(
            folderId => !currentFolders.includes(folderId)
          );
          
          // Folders to remove
          const foldersToRemove = currentFolders.filter(
            folderId => !selectedFolders.includes(folderId)
          );
          
          // Add note to new folders
          for (const folderId of foldersToAdd) {
            await addNoteToFolder(savedNote.id, folderId);
          }
          
          // Remove note from unselected folders
          for (const folderId of foldersToRemove) {
            await removeNoteFromFolder(savedNote.id, folderId);
          }
        } else {
          // For new notes, add to all selected folders
          for (const folderId of selectedFolders) {
            await addNoteToFolder(savedNote.id, folderId);
          }
          
          // Navigate to the new note
          navigate(`/notes/${savedNote.id}`);
        }
        
        setNote(savedNote);
        
        if (onSave) {
          onSave(savedNote);
        }
        
        toast({
          title: "Success",
          description: "Note saved successfully",
        });
      }
    } catch (error) {
      console.error("Error saving note:", error);
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await deleteNote(id);
      toast({
        title: "Success",
        description: "Note moved to trash",
      });
      navigate("/");
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const toggleFavorite = async () => {
    if (!id || !note) return;
    
    try {
      const updatedNote = await updateNote(id, {
        is_favorite: !note.is_favorite,
      });
      
      if (updatedNote) {
        setNote(updatedNote);
        toast({
          title: updatedNote.is_favorite ? "Added to favorites" : "Removed from favorites",
          description: updatedNote.is_favorite 
            ? "Note added to favorites" 
            : "Note removed from favorites",
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      });
    }
  };

  const toggleArchive = async () => {
    if (!id || !note) return;
    
    try {
      const updatedNote = await updateNote(id, {
        is_archived: !note.is_archived,
      });
      
      if (updatedNote) {
        setNote(updatedNote);
        toast({
          title: updatedNote.is_archived ? "Archived" : "Unarchived",
          description: updatedNote.is_archived 
            ? "Note moved to archive" 
            : "Note removed from archive",
        });
      }
    } catch (error) {
      console.error("Error toggling archive:", error);
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      });
    }
  };

  const handleFolderSelection = (folderId: string) => {
    setSelectedFolders(prev => 
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[60vh] w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled Note"
          className="text-xl font-medium border-none shadow-none focus-visible:ring-0"
        />
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={toggleFavorite}>
                {note?.is_favorite ? (
                  <>
                    <StarOff className="h-4 w-4 mr-2" />
                    Remove from Favorites
                  </>
                ) : (
                  <>
                    <Star className="h-4 w-4 mr-2" />
                    Add to Favorites
                  </>
                )}
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={toggleArchive}>
                {note?.is_archived ? (
                  <>
                    <ArchiveRestore className="h-4 w-4 mr-2" />
                    Unarchive
                  </>
                ) : (
                  <>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </>
                )}
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => setIsFolderDialogOpen(true)}>
                <FolderPlus className="h-4 w-4 mr-2" />
                Manage Folders
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="h-4 w-4 mr-2" />
                Move to Trash
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="flex-1 p-4">
        <Textarea
          value={content}
          onChange={handleContentChange}
          placeholder="Start writing your note here..."
          className="w-full h-full min-h-[60vh] resize-none focus-visible:ring-0 border rounded-md p-4"
        />
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will move the note to trash. You can restore it later from the trash.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Move to Trash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Folder Selection Dialog */}
      <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Folders</DialogTitle>
            <DialogDescription>
              Select the folders where you want to save this note.
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[300px] overflow-y-auto py-4">
            {folders.length === 0 ? (
              <p className="text-center text-muted-foreground">No folders found</p>
            ) : (
              <div className="space-y-2">
                {folders.map((folder) => (
                  <div key={folder.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`folder-${folder.id}`}
                      checked={selectedFolders.includes(folder.id)}
                      onChange={() => handleFolderSelection(folder.id)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor={`folder-${folder.id}`} className="text-sm font-medium">
                      {folder.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFolderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsFolderDialogOpen(false)}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Upgrade Dialog */}
      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Upgrade to Premium
            </DialogTitle>
            <DialogDescription>
              You've reached the maximum number of notes on the free plan.
              Upgrade to Premium for unlimited notes and more features.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="rounded-lg bg-muted p-4">
              <h4 className="font-medium mb-2">Premium Benefits:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Unlimited notes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Unlimited folders</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Priority support</span>
                </li>
              </ul>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsUpgradeDialogOpen(false)}
              className="sm:order-1"
            >
              Not Now
            </Button>
            <Button asChild className="w-full sm:w-auto">
              <Link to="/upgrade">
                Upgrade to Premium
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
