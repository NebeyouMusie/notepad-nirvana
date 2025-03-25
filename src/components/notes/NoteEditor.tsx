
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Heading1, 
  Heading2 
} from "lucide-react";

interface NoteEditorProps {
  initialContent?: string;
  initialTitle?: string;
  onSave?: (title: string, content: string) => void;
}

export function NoteEditor({ 
  initialContent = "", 
  initialTitle = "Untitled", 
  onSave 
}: NoteEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [wordCount, setWordCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setWordCount(newContent.trim() === "" ? 0 : newContent.trim().split(/\s+/).length);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onSave?.(title, content);
      setIsSaving(false);
    }, 500);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b pb-2 mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-2xl font-medium bg-transparent border-none outline-none focus:ring-0 p-0"
          placeholder="Untitled"
        />
      </div>
      
      <div className="glassmorphism rounded-lg p-1 mb-4 flex flex-wrap gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Bold size={16} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Italic size={16} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <List size={16} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ListOrdered size={16} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Heading1 size={16} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Heading2 size={16} />
        </Button>
        <div className="flex-1"></div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <AlignLeft size={16} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <AlignCenter size={16} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <AlignRight size={16} />
        </Button>
      </div>
      
      <div className="flex-1 relative">
        <textarea
          value={content}
          onChange={handleContentChange}
          className="w-full h-full resize-none bg-transparent border-none outline-none focus:ring-0 p-0"
          placeholder="Start writing..."
        />
      </div>
      
      <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
        <div>{wordCount} words</div>
        <div className="flex items-center gap-2">
          <span>{isSaving ? "Saving..." : "Saved"}</span>
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
