
import { Sidebar } from "./Sidebar";
import { Search } from "@/components/ui/Search";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, isLoading } = useAuth();

  // Load and apply custom primary color on component mount
  useEffect(() => {
    const applyPrimaryColor = () => {
      const savedColor = localStorage.getItem('primaryColor');
      if (savedColor) {
        // Helper function to determine if a color is light or dark
        const isLightColor = (color: string) => {
          const hex = color.replace('#', '');
          const r = parseInt(hex.substr(0, 2), 16);
          const g = parseInt(hex.substr(2, 2), 16);
          const b = parseInt(hex.substr(4, 2), 16);
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          return brightness > 128;
        };
        
        // Apply the primary color
        document.documentElement.style.setProperty('--primary', savedColor);
        
        // Set the foreground color based on the primary color's lightness
        document.documentElement.style.setProperty(
          '--primary-foreground', 
          isLightColor(savedColor) ? '#000000' : '#ffffff'
        );
        
        // Also update the accent color to match primary for consistency
        document.documentElement.style.setProperty('--accent', savedColor);
        document.documentElement.style.setProperty(
          '--accent-foreground', 
          isLightColor(savedColor) ? '#000000' : '#ffffff'
        );
      }
    };
    
    applyPrimaryColor();
    
    // Listen for storage changes in case the color is updated in another tab
    window.addEventListener('storage', applyPrimaryColor);
    
    return () => {
      window.removeEventListener('storage', applyPrimaryColor);
    };
  }, []);

  // If user is not logged in, redirect to auth page
  if (!isLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <Sidebar />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="border-b bg-background/90 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center justify-between p-4">
            <Search />
            
            <div className="flex items-center gap-2">
              <Link to="/new">
                <Button className="gap-1">
                  <Plus size={18} />
                  <span>New Note</span>
                </Button>
              </Link>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
