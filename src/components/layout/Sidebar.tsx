
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
  LogOut,
  Sparkles
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { fetchFolders, Folder } from "@/services/folderService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createFolder } from "@/services/folderService";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePlan } from "@/hooks/usePlan";

interface SidebarProps {
  className?: string;
  onToggle?: (collapsed: boolean) => void;
}

export function Sidebar({ className, onToggle }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const isMobile = useIsMobile();
  const { isPremium, isAtFoldersLimit } = usePlan();
  
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

  const toggleSidebar = () => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);
    if (onToggle) {
      onToggle(newCollapsedState);
    }
  };

  // Handle navigation on mobile devices
  const handleNavigation = (path: string) => {
    if (isMobile && collapsed) {
      // If on mobile and sidebar is collapsed, just navigate without opening sidebar
      navigate(path);
    } else {
      // Normal navigation
      navigate(path);
    }
  };

  const handleAddFolderClick = () => {
    if (isAtFoldersLimit) {
      toast({
        title: "Folder limit reached",
        description: "You've reached the maximum number of folders for your plan. Upgrade to create more folders.",
        variant: "destructive",
      });
      navigate("/upgrade");
      return;
    }
    
    setIsDialogOpen(true);
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
          onClick={toggleSidebar}
          className="rounded-full p-1 hover:bg-secondary transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav className="p-2 space-y-1">
          <button
            onClick={() => handleNavigation("/")}
            className={`sidebar-item w-full text-left ${isActive("/") ? "active" : ""}`}
          >
            <BookOpen size={18} />
            {!collapsed && <span>All Notes</span>}
          </button>
          <button
            onClick={() => handleNavigation("/favorites")}
            className={`sidebar-item w-full text-left ${isActive("/favorites") ? "active" : ""}`}
          >
            <Star size={18} />
            {!collapsed && <span>Favorites</span>}
          </button>
          <button
            onClick={() => handleNavigation("/archived")}
            className={`sidebar-item w-full text-left ${isActive("/archived") ? "active" : ""}`}
          >
            <Archive size={18} />
            {!collapsed && <span>Archived</span>}
          </button>
          
          {!collapsed && (
            <div className="py-2">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  FOLDERS
                </span>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <button 
                      className="rounded-full p-1 hover:bg-secondary transition-colors"
                      onClick={handleAddFolderClick}
                    >
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
                  <button
                    key={folder.id}
                    onClick={() => handleNavigation(`/folders/${folder.id}`)}
                    className={`sidebar-item w-full text-left ${isFolderActive(folder.id) ? "active" : ""}`}
                  >
                    <FolderOpen size={18} />
                    <span>{folder.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </nav>
      </div>

      <div className="mt-auto border-t p-2">
        <div className="space-y-1">
          <button
            onClick={() => handleNavigation("/trash")}
            className={`sidebar-item w-full text-left ${isActive("/trash") ? "active" : ""}`}
          >
            <Trash size={18} />
            {!collapsed && <span>Trash</span>}
          </button>
          <button
            onClick={() => handleNavigation("/settings")}
            className={`sidebar-item w-full text-left ${isActive("/settings") ? "active" : ""}`}
          >
            <Settings size={18} />
            {!collapsed && <span>Settings</span>}
          </button>
          <button
            onClick={() => handleNavigation("/account")}
            className={`sidebar-item w-full text-left ${isActive("/account") ? "active" : ""}`}
          >
            <User size={18} />
            {!collapsed && <span>Account</span>}
          </button>
          <button
            onClick={() => handleNavigation("/upgrade")}
            className={`sidebar-item w-full text-left ${isActive("/upgrade") ? "active" : ""}`}
          >
            <Sparkles size={18} className="text-yellow-500" />
            {!collapsed && (
              <span className="flex items-center">
                Upgrade
                {!isPremium && <span className="ml-1.5 text-[10px] bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-1.5 py-0.5 rounded-full">Pro</span>}
              </span>
            )}
          </button>
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
