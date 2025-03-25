
import { Search as SearchIcon, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useOnClickOutside } from "@/hooks/use-click-outside";

interface SearchProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export function Search({ onSearch, placeholder = "Search notes..." }: SearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(searchRef, () => setShowResults(false));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch?.(value);
    
    if (value.trim().length > 0) {
      setShowResults(true);
      searchNotes(value);
    } else {
      setShowResults(false);
      setResults([]);
    }
  };

  const searchNotes = async (searchQuery: string) => {
    if (searchQuery.trim().length === 0) return;
    
    setIsSearching(true);
    
    try {
      // Search in title and content, only non-trashed notes
      const { data, error } = await supabase
        .from('notes')
        .select('id, title, content, color')
        .eq('is_trashed', false)
        .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
        .limit(5);
      
      if (error) throw error;
      
      setResults(data || []);
    } catch (error) {
      console.error('Error searching notes:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <SearchIcon className="h-4 w-4 text-muted-foreground" />
      </div>
      <input
        type="search"
        className="glassmorphism w-full rounded-full py-2 pl-10 pr-10 text-sm 
                  focus:outline-none focus:ring-2 focus:ring-primary/50"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        onFocus={() => query.trim().length > 0 && setShowResults(true)}
      />
      {query.trim().length > 0 && (
        <button 
          className="absolute inset-y-0 right-0 flex items-center pr-3"
          onClick={clearSearch}
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
      
      {showResults && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
          <div className="p-2">
            <h3 className="text-xs font-medium text-muted-foreground mb-2">
              {isSearching 
                ? "Searching..." 
                : results.length > 0 
                  ? "Search Results" 
                  : "No results found"}
            </h3>
            
            {results.map((note) => (
              <Link 
                key={note.id} 
                to={`/notes/${note.id}`}
                className="block rounded-md p-2 hover:bg-accent transition-colors"
                onClick={() => setShowResults(false)}
              >
                <div className="flex items-center space-x-2">
                  <div 
                    className="h-2 w-2 rounded-full" 
                    style={{ backgroundColor: note.color || '#FFFFFF' }}
                  />
                  <h4 className="text-sm font-medium line-clamp-1">{note.title}</h4>
                </div>
                {note.content && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {note.content}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
