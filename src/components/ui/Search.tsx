
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

  // Extract plain text from HTML
  const getTextFromHtml = (html: string | null) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const searchNotes = async (searchQuery: string) => {
    if (searchQuery.trim().length === 0) return;
    
    setIsSearching(true);
    
    try {
      // Search in title, content, and tags, only non-trashed notes
      const { data, error } = await supabase
        .from('notes')
        .select('id, title, content, color, tags')
        .eq('is_trashed', false)
        .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%,tags.cs.{${searchQuery}}`)
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
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <SearchIcon className="h-4 w-4 text-muted-foreground" />
        </div>
        <input
          type="text"
          className="w-full rounded-full bg-secondary/50 border-transparent py-2 pl-10 pr-10 text-sm 
                    focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          onFocus={() => query.trim().length > 0 && setShowResults(true)}
        />
        {query.trim().length > 0 && (
          <button 
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
            onClick={clearSearch}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {showResults && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-lg">
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
                className="block rounded-md p-2 hover:bg-accent/50 transition-colors"
                onClick={() => setShowResults(false)}
              >
                <div className="flex items-center space-x-2">
                  <div 
                    className="h-3 w-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: note.color || '#FFFFFF' }}
                  />
                  <h4 className="text-sm font-medium line-clamp-1">{note.title}</h4>
                </div>
                {note.content && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1 pl-5">
                    {getTextFromHtml(note.content)}
                  </p>
                )}
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1 pl-5">
                    {note.tags.map((tag: string, index: number) => (
                      <span key={index} className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
