
import { Search as SearchIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface SearchProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export function Search({ onSearch, placeholder = "Search notes..." }: SearchProps) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Extract search query from URL if it exists
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get("q");
    if (searchQuery) {
      setQuery(searchQuery);
    }
  }, [location.search]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch?.(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <SearchIcon className="h-4 w-4 text-muted-foreground" />
      </div>
      <input
        type="search"
        className="glassmorphism w-full rounded-full py-2 pl-10 pr-4 text-sm 
                  focus:outline-none focus:ring-2 focus:ring-primary/50 font-poppins"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
      />
    </form>
  );
}
