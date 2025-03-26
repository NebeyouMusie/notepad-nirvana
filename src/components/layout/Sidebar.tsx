
import { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  FolderOpen, 
  BookOpen, 
  Star, 
  Archive,
  Plus,
  Trash,
  User,
  Settings,
  LogOut
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { fetchFolders, Folder } from "@/services/folderService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createFolder } from "@/services/folderService";
import { toast } from "@/hooks/use-toast";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const location = useLocation();
  const { signOut } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;
  const isFolderActive = (id: string) => location.pathname === `/folders/${id}`;

  useEffect(() => {
    const loadFolders = async () => {
      const data = await fetchFolders();
      setFolders(data);
    };
    
    loadFolders();
  }, []);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newFolderName.trim()) {
      toast({
        title: "Error",
        description: "Folder name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const folder = await createFolder(newFolderName);
      if (folder) {
        setFolders([...folders, folder]);
        setNewFolderName("");
        setIsDialogOpen(false);
        toast({
          title: "Success",
          description: "Folder created successfully",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 h-screen transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      } border-r flex flex-col ${className}`}
    >
      <div className="flex items-center justify-between p-4">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">Notepad</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-full p-1 hover:bg-secondary transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav className="p-2 space-y-1">
          <Link
            to="/"
            className={`sidebar-item ${isActive("/") ? "active" : ""}`}
          >
            <BookOpen size={18} />
            {!collapsed && <span>All Notes</span>}
          </Link>
          <Link
            to="/favorites"
            className={`sidebar-item ${isActive("/favorites") ? "active" : ""}`}
          >
            <Star size={18} />
            {!collapsed && <span>Favorites</span>}
          </Link>
          <Link
            to="/archived"
            className={`sidebar-item ${isActive("/archived") ? "active" : ""}`}
          >
            <Archive size={18} />
            {!collapsed && <span>Archived</span>}
          </Link>
          
          {!collapsed && (
            <div className="py-2">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  FOLDERS
                </span>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <button className="rounded-full p-1 hover:bg-secondary transition-colors">
                      <Plus size={14} />
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Folder</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateFolder} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="folderName">Folder Name</Label>
                        <Input
                          id="folderName"
                          value={newFolderName}
                          onChange={(e) => setNewFolderName(e.target.value)}
                          placeholder="Enter folder name"
                          required
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? "Creating..." : "Create Folder"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-1">
                {folders.map((folder) => (
                  <Link
                    key={folder.id}
                    to={`/folders/${folder.id}`}
                    className={`sidebar-item ${isFolderActive(folder.id) ? "active" : ""}`}
                  >
                    <FolderOpen size={18} />
                    <span>{folder.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>
      </div>

      <div className="mt-auto border-t p-2">
        <div className="space-y-1">
          <Link
            to="/trash"
            className={`sidebar-item ${isActive("/trash") ? "active" : ""}`}
          >
            <Trash size={18} />
            {!collapsed && <span>Trash</span>}
          </Link>
          <Link
            to="/settings"
            className={`sidebar-item ${isActive("/settings") ? "active" : ""}`}
          >
            <Settings size={18} />
            {!collapsed && <span>Settings</span>}
          </Link>
          <Link
            to="/account"
            className={`sidebar-item ${isActive("/account") ? "active" : ""}`}
          >
            <User size={18} />
            {!collapsed && <span>Account</span>}
          </Link>
          <button
            onClick={() => signOut()}
            className="sidebar-item w-full text-left"
          >
            <LogOut size={18} />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
