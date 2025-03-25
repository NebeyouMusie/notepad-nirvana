
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Folder, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createFolder } from "@/services/folderService";

export function CreateFolderDialog({ onFolderCreated }: { onFolderCreated?: () => void }) {
  const [folderName, setFolderName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      toast({
        title: "Folder name is required",
        description: "Please enter a name for your folder",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);
      await createFolder(folderName);
      toast({
        title: "Folder created",
        description: `Folder "${folderName}" has been created successfully`,
      });
      setFolderName("");
      setOpen(false);
      onFolderCreated?.();
    } catch (error) {
      console.error("Error creating folder:", error);
      toast({
        title: "Error creating folder",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 px-2"
        >
          <Plus size={16} />
          <span>New Folder</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="font-poppins sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder size={18} /> Create New Folder
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="Folder name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            className="w-full"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCreateFolder();
              }
            }}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateFolder}
            disabled={isCreating || !folderName.trim()}
          >
            {isCreating ? "Creating..." : "Create Folder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
