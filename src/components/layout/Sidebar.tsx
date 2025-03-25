
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Archive, 
  LogOut,
  FolderOpen, 
  Inbox, 
  Plus, 
  Star, 
  Trash2, 
  User
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreateFolderDialog } from "@/components/folders/CreateFolderDialog";
import { getFolders, subscribeToFolders } from "@/services/folderService";

type Folder = {
  id: string;
  name: string;
};

export function Sidebar() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        setIsLoading(true);
        const fetchedFolders = await getFolders();
        setFolders(fetchedFolders);
      } catch (error) {
        console.error("Error fetching folders:", error);
        toast({
          title: "Error loading folders",
          description: "Could not load your folders",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFolders();

    // Set up real-time subscription to folders
    const unsubscribe = subscribeToFolders((updatedFolders) => {
      setFolders(updatedFolders);
    });

    return () => {
      unsubscribe();
    };
  }, [toast]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Could not sign out",
        variant: "destructive",
      });
    }
  };

  const getLinkClass = (isActive: boolean) => {
    return `flex items-center gap-2 py-2 px-4 rounded-lg transition-colors ${
      isActive
        ? "bg-primary/10 text-primary font-medium"
        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    }`;
  };

  return (
    <div className="w-64 h-full border-r flex flex-col bg-background">
      <div className="p-4 border-b">
        <h1 className="text-xl font-semibold font-poppins">Notepad</h1>
        <p className="text-xs text-muted-foreground font-poppins">Your personal notes app</p>
      </div>

      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        <div className="flex-1 overflow-hidden flex flex-col">
          <nav className="space-y-1 p-2 font-poppins">
            <NavLink
              to="/"
              className={({ isActive }) => getLinkClass(isActive)}
              end
            >
              <Inbox size={18} /> <span>All Notes</span>
            </NavLink>
            <NavLink
              to="/favorites"
              className={({ isActive }) => getLinkClass(isActive)}
            >
              <Star size={18} /> <span>Favorites</span>
            </NavLink>
            <NavLink
              to="/archived"
              className={({ isActive }) => getLinkClass(isActive)}
            >
              <Archive size={18} /> <span>Archived</span>
            </NavLink>
          </nav>

          <div className="p-2 border-t mt-2">
            <div className="flex items-center justify-between py-2 px-4">
              <h2 className="text-sm font-semibold font-poppins">Folders</h2>
              <CreateFolderDialog />
            </div>

            <ScrollArea className="h-[calc(100vh-350px)]">
              <div className="space-y-1 pr-2 font-poppins">
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-primary"></div>
                  </div>
                ) : folders.length > 0 ? (
                  folders.map((folder) => (
                    <NavLink
                      key={folder.id}
                      to={`/folders/${folder.id}`}
                      className={({ isActive }) => getLinkClass(isActive)}
                    >
                      <FolderOpen size={18} /> <span className="truncate">{folder.name}</span>
                    </NavLink>
                  ))
                ) : (
                  <div className="text-sm text-center text-muted-foreground py-4">
                    No folders yet
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="border-t p-2 space-y-1 mt-auto font-poppins">
          <NavLink
            to="/account"
            className={({ isActive }) => getLinkClass(isActive)}
          >
            <User size={18} /> <span>Account</span>
          </NavLink>
          <NavLink
            to="/trash"
            className={({ isActive }) => getLinkClass(isActive)}
          >
            <Trash2 size={18} /> <span>Trash</span>
          </NavLink>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 py-2 px-4 rounded-lg transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground w-full text-left"
          >
            <LogOut size={18} /> <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
