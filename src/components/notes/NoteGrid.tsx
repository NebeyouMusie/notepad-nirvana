
import { useEffect, useRef, useState } from "react";
import { NoteCard, NoteProps } from "./NoteCard";
import { useIsMobile } from "@/hooks/use-mobile";

interface NoteGridProps {
  notes: NoteProps[];
}

export function NoteGrid({ notes }: NoteGridProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className={`grid gap-4 auto-rows-fr ${
      isMobile 
        ? 'grid-cols-1' 
        : 'grid-cols-2 lg:grid-cols-3'
    }`}>
      {notes.map((note) => (
        <NoteCard key={note.id} {...note} />
      ))}
    </div>
  );
}
