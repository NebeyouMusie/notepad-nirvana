
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
  Hash
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { createNote, updateNote, NoteInput } from "@/services/noteService";
import { toast } from "@/hooks/use-toast";

// Import Tiptap
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';

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
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Initialize Tiptap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
      calculateWordCount(editor.getText());
    },
  });

  useEffect(() => {
    if (editor && initialContent) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  useEffect(() => {
    if (editor) {
      calculateWordCount(editor.getText());
    }
  }, [editor]);

  useEffect(() => {
    // Auto-save after 3 seconds of inactivity
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    
    const timer = setTimeout(() => {
      if ((title !== initialTitle || content !== initialContent || JSON.stringify(tags) !== JSON.stringify(initialTags) || color !== initialColor) && 
          title.trim() !== "") {
        handleSave();
      }
    }, 3000);
    
    setAutoSaveTimer(timer);
    
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [title, content, tags, color]);

  const calculateWordCount = (text: string) => {
    setWordCount(text.trim() === "" ? 0 : text.trim().split(/\s+/).length);
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
        tags,
        is_archived: false,
        is_trashed: false
      };
      
      let savedNote;
      
      if (noteId) {
        // Update existing note
        savedNote = await updateNote(noteId, noteData);
      } else {
        // Create new note
        savedNote = await createNote(noteData);
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
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          data-active={editor?.isActive('bold')}
        >
          <Bold size={16} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          data-active={editor?.isActive('italic')}
        >
          <Italic size={16} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          data-active={editor?.isActive('bulletList')}
        >
          <List size={16} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          data-active={editor?.isActive('orderedList')}
        >
          <ListOrdered size={16} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          data-active={editor?.isActive('heading', { level: 1 })}
        >
          <Heading1 size={16} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          data-active={editor?.isActive('heading', { level: 2 })}
        >
          <Heading2 size={16} />
        </Button>
        <div className="flex-1"></div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={() => editor?.chain().focus().setTextAlign('left').run()}
          data-active={editor?.isActive({ textAlign: 'left' })}
        >
          <AlignLeft size={16} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={() => editor?.chain().focus().setTextAlign('center').run()}
          data-active={editor?.isActive({ textAlign: 'center' })}
        >
          <AlignCenter size={16} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={() => editor?.chain().focus().setTextAlign('right').run()}
          data-active={editor?.isActive({ textAlign: 'right' })}
        >
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
      
      <div className="flex-1 relative bg-transparent border rounded-md p-2">
        <EditorContent editor={editor} className="h-full prose max-w-none" />
      </div>
      
      <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
        <div>{wordCount} words</div>
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
