
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Sidebar } from "./Sidebar";
import { Search } from "@/components/ui/Search";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="flex h-screen font-poppins">
      <div className="fixed h-screen z-20">
        <Sidebar />
      </div>
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden ml-64">
        <header className="border-b glassmorphism backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center justify-between p-4">
            <Search onSearch={handleSearch} />
            
            <div className="flex items-center gap-2">
              <Link to="/new">
                <Button className="gap-1">
                  <Plus size={18} />
                  <span>New Note</span>
                </Button>
              </Link>
              <ThemeToggle />
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
