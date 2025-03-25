
import { Search as SearchIcon } from "lucide-react";
import { useState } from "react";

interface SearchProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export function Search({ onSearch, placeholder = "Search notes..." }: SearchProps) {
  const [query, setQuery] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch?.(value);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <SearchIcon className="h-4 w-4 text-muted-foreground" />
      </div>
      <input
        type="search"
        className="glassmorphism w-full rounded-full py-2 pl-10 pr-4 text-sm 
                  focus:outline-none focus:ring-2 focus:ring-primary/50"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
      />
    </div>
  );
}
