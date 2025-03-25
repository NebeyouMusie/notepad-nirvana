
import { useState } from "react";
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
  Settings
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

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
                <button className="rounded-full p-1 hover:bg-secondary transition-colors">
                  <Plus size={14} />
                </button>
              </div>
              <div className="space-y-1">
                <Link
                  to="/folders/personal"
                  className={`sidebar-item ${isActive("/folders/personal") ? "active" : ""}`}
                >
                  <FolderOpen size={18} />
                  <span>Personal</span>
                </Link>
                <Link
                  to="/folders/work"
                  className={`sidebar-item ${isActive("/folders/work") ? "active" : ""}`}
                >
                  <FolderOpen size={18} />
                  <span>Work</span>
                </Link>
                <Link
                  to="/folders/ideas"
                  className={`sidebar-item ${isActive("/folders/ideas") ? "active" : ""}`}
                >
                  <FolderOpen size={18} />
                  <span>Ideas</span>
                </Link>
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
          <div className="sidebar-item">
            <User size={18} />
            {!collapsed && <span>Account</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
