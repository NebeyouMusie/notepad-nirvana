
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
  FolderOpen,
  Save
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { createNote, updateNote, NoteInput } from "@/services/noteService";
import { toast } from "@/hooks/use-toast";
import { addNoteToFolder, fetchFolders, Folder } from "@/services/folderService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';

interface NoteEditorProps {
  initialContent?: string;
  initialTitle?: string;
  initialTags?: string[];
  initialColor?: string;
  noteId?: string;
  onSave?: (id: string) => void;
  initialFolderId?: string;
}

export function NoteEditor({ 
  initialContent = "", 
  initialTitle = "Untitled", 
  initialTags = [],
  initialColor = "#FFFFFF",
  noteId,
  onSave,
  initialFolderId
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
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(initialFolderId || null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      setContent(newContent);
      calculateWordCount(newContent);
    },
  });
  
  useEffect(() => {
    if (editor && initialContent) {
      // If the editor exists but its content doesn't match initialContent
      // (happens when navigating between notes)
      if (editor.getHTML() !== initialContent) {
        editor.commands.setContent(initialContent);
      }
    }
  }, [editor, initialContent]);

  useEffect(() => {
    calculateWordCount(content);
    
    // Load folders
    const loadFolders = async () => {
      const foldersData = await fetchFolders();
      setFolders(foldersData);
    };
    
    loadFolders();
  }, []);

  const calculateWordCount = (text: string) => {
    // For HTML content, we need to strip tags to count words accurately
    const strippedText = text.replace(/<[^>]*>/g, ' ').trim();
    setWordCount(strippedText === "" ? 0 : strippedText.split(/\s+/).filter(Boolean).length);
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
        
        // If there's a selected folder, add the note to it
        if (savedNote && selectedFolderId) {
          await addNoteToFolder(savedNote.id, selectedFolderId);
        }
      }
      
      if (savedNote) {
        setLastSaved(new Date());
        toast({
          title: noteId ? "Note updated" : "Note created",
          description: noteId ? "Your changes have been saved" : "Your new note has been saved",
        });
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

  const selectFolder = async (folderId: string) => {
    setSelectedFolderId(folderId);
    
    // If the note already exists and folder is selected, add the note to the folder
    if (noteId) {
      const success = await addNoteToFolder(noteId, folderId);
      if (success) {
        toast({
          title: "Note added to folder",
          description: `Note added to ${folders.find(f => f.id === folderId)?.name || 'folder'}`,
        });
      }
    }
  };

  // Toolbar button handling
  const handleBold = () => {
    editor?.chain().focus().toggleBold().run();
  };

  const handleItalic = () => {
    editor?.chain().focus().toggleItalic().run();
  };

  const handleBulletList = () => {
    editor?.chain().focus().toggleBulletList().run();
  };

  const handleOrderedList = () => {
    editor?.chain().focus().toggleOrderedList().run();
  };

  const handleHeading1 = () => {
    editor?.chain().focus().toggleHeading({ level: 1 }).run();
  };

  const handleHeading2 = () => {
    editor?.chain().focus().toggleHeading({ level: 2 }).run();
  };

  const handleAlignLeft = () => {
    editor?.chain().focus().setTextAlign('left').run();
  };

  const handleAlignCenter = () => {
    editor?.chain().focus().setTextAlign('center').run();
  };

  const handleAlignRight = () => {
    editor?.chain().focus().setTextAlign('right').run();
  };

  // Check if button is active
  const isActive = (type: string, options: any = {}) => {
    if (!editor) return false;
    
    switch(type) {
      case 'bold':
        return editor.isActive('bold');
      case 'italic':
        return editor.isActive('italic');
      case 'bulletList':
        return editor.isActive('bulletList');
      case 'orderedList':
        return editor.isActive('orderedList');
      case 'heading1':
        return editor.isActive('heading', { level: 1 });
      case 'heading2':
        return editor.isActive('heading', { level: 2 });
      case 'alignLeft':
        return editor.isActive({ textAlign: 'left' });
      case 'alignCenter':
        return editor.isActive({ textAlign: 'center' });
      case 'alignRight':
        return editor.isActive({ textAlign: 'right' });
      default:
        return false;
    }
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
          variant={isActive('bold') ? "secondary" : "ghost"} 
          size="icon" 
          className="h-8 w-8"
          onClick={handleBold}
        >
          <Bold size={16} />
        </Button>
        <Button 
          variant={isActive('italic') ? "secondary" : "ghost"} 
          size="icon" 
          className="h-8 w-8"
          onClick={handleItalic}
        >
          <Italic size={16} />
        </Button>
        <Button 
          variant={isActive('bulletList') ? "secondary" : "ghost"} 
          size="icon" 
          className="h-8 w-8"
          onClick={handleBulletList}
        >
          <List size={16} />
        </Button>
        <Button 
          variant={isActive('orderedList') ? "secondary" : "ghost"} 
          size="icon" 
          className="h-8 w-8"
          onClick={handleOrderedList}
        >
          <ListOrdered size={16} />
        </Button>
        <Button 
          variant={isActive('heading1') ? "secondary" : "ghost"} 
          size="icon" 
          className="h-8 w-8"
          onClick={handleHeading1}
        >
          <Heading1 size={16} />
        </Button>
        <Button 
          variant={isActive('heading2') ? "secondary" : "ghost"} 
          size="icon" 
          className="h-8 w-8"
          onClick={handleHeading2}
        >
          <Heading2 size={16} />
        </Button>
        <div className="flex-1"></div>
        <Button 
          variant={isActive('alignLeft') ? "secondary" : "ghost"} 
          size="icon" 
          className="h-8 w-8"
          onClick={handleAlignLeft}
        >
          <AlignLeft size={16} />
        </Button>
        <Button 
          variant={isActive('alignCenter') ? "secondary" : "ghost"} 
          size="icon" 
          className="h-8 w-8"
          onClick={handleAlignCenter}
        >
          <AlignCenter size={16} />
        </Button>
        <Button 
          variant={isActive('alignRight') ? "secondary" : "ghost"} 
          size="icon" 
          className="h-8 w-8"
          onClick={handleAlignRight}
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
      
      {/* Folder Selection */}
      <div className="glassmorphism rounded-lg p-3 mb-4">
        <div className="mb-2 text-sm font-medium">Folder</div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              <FolderOpen className="mr-2 h-4 w-4" />
              {selectedFolderId 
                ? folders.find(f => f.id === selectedFolderId)?.name || 'Select Folder'
                : 'Select Folder'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {folders.length > 0 ? (
              folders.map((folder) => (
                <DropdownMenuItem 
                  key={folder.id}
                  onClick={() => selectFolder(folder.id)}
                >
                  <FolderOpen className="mr-2 h-4 w-4" />
                  {folder.name}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>No folders available</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="flex-1 relative editor-container p-2 glassmorphism rounded-lg">
        <EditorContent editor={editor} className="w-full h-full" />
      </div>
      
      <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
        <div>{wordCount} words</div>
        <div className="flex items-center gap-2">
          <span>
            {lastSaved 
              ? `Last saved ${lastSaved.toLocaleTimeString()}` 
              : "Not saved yet"}
          </span>
          <Button size="sm" onClick={handleSave} disabled={isSaving} className="flex items-center gap-1">
            <Save size={14} />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
