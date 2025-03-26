
import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { MessageSquare, Star, Archive, Trash2, MoreVertical } from "lucide-react";
import { Note } from "@/services/noteService";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface NoteCardProps {
  note: Note;
  onFavorite: (id: string) => void;
  onArchive: (id: string) => void;
  onTrash: (id: string) => void;
}

export function NoteCard({ note, onFavorite, onArchive, onTrash }: NoteCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Function to truncate strings while preserving HTML structure
  const getTruncatedHTML = (html: string, maxLength = 120) => {
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html || '';
    
    // Extract the text content
    const text = tempDiv.textContent || '';
    
    // Truncate the text if necessary
    if (text.length <= maxLength) {
      return html;
    }
    
    return text.substring(0, maxLength) + '...';
  };
  
  const truncatedContent = getTruncatedHTML(note.content || '');
  
  // Calculate the time difference for the relative date
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };
  
  return (
    <div 
      className={cn(
        "note-card", 
        isHovered && "scale-[1.02]"
      )}
      style={{ backgroundColor: note.color }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-start">
        <Link 
          to={`/notes/${note.id}`} 
          className="block flex-1"
        >
          <h3 className="text-lg font-semibold line-clamp-2 mb-1">
            {note.title}
          </h3>
        </Link>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onFavorite(note.id)}>
              <Star className="mr-2 h-4 w-4" />
              {note.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onArchive(note.id)}>
              <Archive className="mr-2 h-4 w-4" />
              {note.is_archived ? 'Unarchive' : 'Archive'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onTrash(note.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Move to trash
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <Link to={`/notes/${note.id}`} className="block">
        <div className="mt-2 text-sm text-muted-foreground line-clamp-3">
          {note.content ? (
            <div dangerouslySetInnerHTML={{ __html: truncatedContent }} />
          ) : (
            <p className="italic">No content</p>
          )}
        </div>
      </Link>
      
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center">
          <MessageSquare className="mr-1 h-3 w-3" />
          <span>
            {note.content ? 
              (note.content.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length) : 0} words
          </span>
        </div>
        
        <div className="flex items-center">
          {note.is_favorite && <Star className="mr-1 h-3 w-3 text-amber-500" />}
          <span>{getTimeAgo(note.updated_at)}</span>
        </div>
      </div>
      
      {note.tags && note.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {note.tags.map((tag) => (
            <span 
              key={tag} 
              className="px-2 py-0.5 bg-black/5 dark:bg-white/10 rounded-full text-xs"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
