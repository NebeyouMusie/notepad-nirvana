
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
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getFolders, createFolder } from "@/services/folderService";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [folders, setFolders] = useState<any[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const isActive = (path: string) => location.pathname === path;
  const isActiveFolder = (id: string) => location.pathname === `/folders/${id}`;

  useEffect(() => {
    const loadFolders = async () => {
      try {
        if (user) {
          const data = await getFolders();
          setFolders(data);
        }
      } catch (error) {
        console.error("Error loading folders:", error);
      }
    };

    loadFolders();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleAddFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      const folder = await createFolder(newFolderName);
      setFolders([...folders, folder]);
      setNewFolderName("");
      setIsAddingFolder(false);
      toast({
        title: "Folder created",
        description: `Folder "${newFolderName}" has been created`,
      });
    } catch (error) {
      console.error("Error creating folder:", error);
      toast({
        title: "Error",
        description: "Could not create folder",
        variant: "destructive",
      });
    }
  };

  return (
    <div
      className={`transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      } border-r h-full flex flex-col ${className}`}
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
                <button 
                  className="rounded-full p-1 hover:bg-secondary transition-colors"
                  onClick={() => setIsAddingFolder(!isAddingFolder)}
                >
                  <Plus size={14} />
                </button>
              </div>
              
              {isAddingFolder && (
                <form onSubmit={handleAddFolder} className="px-3 mb-2">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Folder name"
                    className="w-full p-1 text-sm border rounded"
                    autoFocus
                  />
                </form>
              )}
              
              <div className="space-y-1">
                {folders.map((folder) => (
                  <Link
                    key={folder.id}
                    to={`/folders/${folder.id}`}
                    className={`sidebar-item ${isActiveFolder(folder.id) ? "active" : ""}`}
                  >
                    <FolderOpen size={18} />
                    <span className="truncate">{folder.name}</span>
                  </Link>
                ))}
                
                {folders.length === 0 && !isAddingFolder && (
                  <div className="px-3 py-2 text-xs text-muted-foreground">
                    No folders yet
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>
      </div>

      <div className="border-t p-2">
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
          <button 
            onClick={handleSignOut}
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
