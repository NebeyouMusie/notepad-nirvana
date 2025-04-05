
import { useIsMobile } from "@/hooks/use-mobile";
import { Note } from "@/types";
import { NoteCard } from "./NoteCard";

interface NoteGridProps {
  notes: Note[];
  onUpdate?: () => void;
}

export function NoteGrid({ notes, onUpdate }: NoteGridProps) {
  const isMobile = useIsMobile();
  
  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No notes found</p>
      </div>
    );
  }
  
  return (
    <div className={`grid gap-4 auto-rows-fr ${
      isMobile 
        ? 'grid-cols-1' 
        : 'grid-cols-2 lg:grid-cols-3'
    }`}>
      {notes.map((note) => (
        <NoteCard 
          key={note.id} 
          note={note}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}
