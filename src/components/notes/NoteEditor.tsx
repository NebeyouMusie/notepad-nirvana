
import { useState, useEffect } from "react";
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
  Heading2,
  Hash,
  FolderPlus
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { createNote, updateNote, NoteInput } from "@/services/noteService";
import { toast } from "@/hooks/use-toast";
import { Folder, fetchFolders, addNoteToFolder } from "@/services/folderService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NoteEditorProps {
  initialContent?: string;
  initialTitle?: string;
  initialTags?: string[];
  initialColor?: string;
  noteId?: string;
  onSave?: (id: string) => void;
}

export function NoteEditor({ 
  initialContent = "", 
  initialTitle = "Untitled", 
  initialTags = [],
  initialColor = "#FFFFFF",
  noteId,
  onSave 
}: NoteEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [color, setColor] = useState(initialColor);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [newTag, setNewTag] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  useEffect(() => {
    calculateWordCount(content);
    
    // Load folders
    const loadFolders = async () => {
      const folderData = await fetchFolders();
      setFolders(folderData);
    };
    
    loadFolders();
  }, [content]);

  const calculateWordCount = (text: string) => {
    setWordCount(text.trim() === "" ? 0 : text.trim().split(/\s+/).length);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
  };

  const handleSave = async () => {
    if (title.trim() === "") {
      toast({
        title: "Error",
        description: "Title cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      const noteData: Partial<NoteInput> = {
        title,
        content,
        color,
        tags
      };
      
      let savedNote;
      
      if (noteId) {
        // Update existing note
        savedNote = await updateNote(noteId, noteData);
      } else {
        // Create new note
        savedNote = await createNote(noteData);
        
        // If a folder is selected, add the note to the folder
        if (savedNote && selectedFolder) {
          await addNoteToFolder(savedNote.id, selectedFolder);
        }
      }
      
      if (savedNote) {
        setLastSaved(new Date());
        if (onSave && savedNote.id) {
          onSave(savedNote.id);
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  const addTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag.trim() !== "" && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Color options
  const colorOptions = [
    "#FFFFFF", // White
    "#F8D7DA", // Light Red
    "#D1E7DD", // Light Green
    "#CFF4FC", // Light Blue
    "#FFF3CD", // Light Yellow
    "#E2E3E5", // Light Gray
    "#D7D8F8", // Light Purple
  ];

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
      
      <div className="glassmorphism rounded-lg p-3 mb-4">
        <div className="mb-2 text-sm font-medium">Note Color</div>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((colorOption) => (
            <button
              key={colorOption}
              className={`w-6 h-6 rounded-full border ${
                color === colorOption ? 'ring-2 ring-primary ring-offset-2' : 'border-gray-300'
              }`}
              style={{ backgroundColor: colorOption }}
              onClick={() => setColor(colorOption)}
              aria-label={`Select ${colorOption} color`}
            />
          ))}
        </div>
      </div>
      
      {!noteId && (
        <div className="glassmorphism rounded-lg p-3 mb-4">
          <div className="mb-2 text-sm font-medium flex items-center">
            <FolderPlus className="mr-2 h-4 w-4" />
            Add to Folder
          </div>
          <Select value={selectedFolder} onValueChange={setSelectedFolder}>
            <SelectTrigger>
              <SelectValue placeholder="Select a folder" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {folders.map((folder) => (
                <SelectItem key={folder.id} value={folder.id}>
                  {folder.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="glassmorphism rounded-lg p-3 mb-4">
        <div className="mb-2 text-sm font-medium">Tags</div>
        <form onSubmit={addTag} className="flex mb-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a tag..."
            className="flex-1 mr-2"
          />
          <Button type="submit" size="sm" variant="outline">
            <Hash size={16} />
            Add
          </Button>
        </form>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.map((tag) => (
              <div
                key={tag}
                className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs flex items-center"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-muted-foreground hover:text-foreground"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
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
        <div className="flex items-center gap-2">
          <span>{wordCount} words</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
          >
            {autoSaveEnabled ? "Auto-save: On" : "Auto-save: Off"}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span>
            {isSaving 
              ? "Saving..." 
              : lastSaved 
                ? `Last saved ${lastSaved.toLocaleTimeString()}` 
                : "Not saved yet"}
          </span>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
