
import { Search as SearchIcon, X, Tag } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useOnClickOutside } from "@/hooks/use-click-outside";

interface SearchProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

interface SearchResult {
  id: string;
  title: string;
  content: string | null;
  color: string;
  tags: string[];
}

export function Search({ onSearch, placeholder = "Search notes..." }: SearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
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
      // Search in title, content, and tags
      const { data, error } = await supabase
        .from('notes')
        .select('id, title, content, color, tags')
        .eq('is_trashed', false)
        .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
        .limit(10);
      
      if (error) throw error;
      
      // Also search for tags
      const { data: tagResults, error: tagError } = await supabase
        .from('notes')
        .select('id, title, content, color, tags')
        .eq('is_trashed', false)
        .filter('tags', 'cs', `{${searchQuery}}`)
        .limit(10);
        
      if (tagError) throw tagError;
      
      // Combine and deduplicate results
      const combinedResults = [...(data || [])];
      
      if (tagResults) {
        // Only add tag results if they're not already in the results
        tagResults.forEach(tagResult => {
          const exists = combinedResults.some(item => item.id === tagResult.id);
          if (!exists) {
            combinedResults.push(tagResult);
          }
        });
      }
      
      setResults(combinedResults);
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
                    {note.content}
                  </p>
                )}
                {note.tags && note.tags.length > 0 && (
                  <div className="flex items-center mt-1 pl-5 gap-1 flex-wrap">
                    <Tag size={12} className="text-muted-foreground" />
                    {note.tags.map((tag, idx) => (
                      <span 
                        key={idx} 
                        className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded"
                      >
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
