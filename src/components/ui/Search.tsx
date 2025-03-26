
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchNotes } from "@/services/noteService";
import { useClickOutside } from "@/hooks/use-click-outside";

export function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useClickOutside(searchRef, () => {
    setIsOpen(false);
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const searchNotes = async () => {
      if (query.trim().length === 0) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const notes = await fetchNotes();
        
        // Search in title, content (stripping HTML tags), and tags
        const filteredNotes = notes.filter((note) => {
          const lowerQuery = query.toLowerCase();
          const titleMatch = note.title.toLowerCase().includes(lowerQuery);
          
          // Strip HTML tags for content search
          const contentText = note.content ? note.content.replace(/<[^>]*>/g, ' ').toLowerCase() : '';
          const contentMatch = contentText.includes(lowerQuery);
          
          // Tag search
          const tagMatch = note.tags && note.tags.some((tag: string) => 
            tag.toLowerCase().includes(lowerQuery)
          );
          
          return titleMatch || contentMatch || tagMatch;
        });
        
        setResults(filteredNotes);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchNotes, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSelectNote = (id: string) => {
    setIsOpen(false);
    setQuery("");
    navigate(`/notes/${id}`);
  };

  const toggleSearch = () => {
    setIsOpen(!isOpen);
  };

  const closeSearch = () => {
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative">
      <Button
        variant="ghost"
        className="px-2"
        onClick={toggleSearch}
        aria-label="Search"
      >
        <SearchIcon className="h-5 w-5" />
        <span className="sr-only md:not-sr-only md:ml-2 text-sm">
          Search
        </span>
        <kbd className="hidden md:inline-flex ml-2 pointer-events-none h-5 select-none items-center gap-1 rounded border px-1.5 text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 md:w-96 bg-background border rounded-md shadow-lg z-50">
          <div className="flex items-center border-b p-2">
            <SearchIcon className="h-4 w-4 mr-2 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search notes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={closeSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="max-h-80 overflow-y-auto p-1">
            {isLoading ? (
              <div className="p-2 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            ) : results.length > 0 ? (
              results.map((note) => (
                <button
                  key={note.id}
                  className="w-full text-left p-2 hover:bg-muted rounded-md flex items-start"
                  onClick={() => handleSelectNote(note.id)}
                >
                  <div>
                    <div className="font-medium truncate">{note.title}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {note.content ? (
                        note.content.replace(/<[^>]*>/g, ' ').substring(0, 50) + (note.content.length > 50 ? '...' : '')
                      ) : (
                        'No content'
                      )}
                    </div>
                    {note.tags && note.tags.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {note.tags.slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 bg-muted rounded-full text-[10px]"
                          >
                            #{tag}
                          </span>
                        ))}
                        {note.tags.length > 3 && (
                          <span className="text-[10px] text-muted-foreground">
                            +{note.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              ))
            ) : query.trim() !== "" ? (
              <div className="p-2 text-center text-sm text-muted-foreground">
                No results found.
              </div>
            ) : (
              <div className="p-2 text-center text-sm text-muted-foreground">
                Type to search notes.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
