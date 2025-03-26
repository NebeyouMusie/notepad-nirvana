
import { useState, useEffect, useRef, useCallback } from "react";
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
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      calculateWordCount(editor.getText());
    },
  });

  useEffect(() => {
    if (editor && initialContent && !editor.isEmpty) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  useEffect(() => {
    if (editor) {
      calculateWordCount(editor.getText());
    }
    
    // Load folders
    const loadFolders = async () => {
      const foldersData = await fetchFolders();
      setFolders(foldersData);
    };
    
    loadFolders();
  }, [editor]);

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
      const content = editor ? editor.getHTML() : "";
      
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
          className={`h-8 w-8 ${editor?.isActive('bold') ? 'bg-primary/20' : ''}`}
          onClick={() => editor?.chain().focus().toggleBold().run()}
          disabled={!editor?.can().chain().focus().toggleBold().run()}
        >
          <Bold size={16} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`h-8 w-8 ${editor?.isActive('italic') ? 'bg-primary/20' : ''}`}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          disabled={!editor?.can().chain().focus().toggleItalic().run()}
        >
          <Italic size={16} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`h-8 w-8 ${editor?.isActive('bulletList') ? 'bg-primary/20' : ''}`}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          disabled={!editor?.can().chain().focus().toggleBulletList().run()}
        >
          <List size={16} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`h-8 w-8 ${editor?.isActive('orderedList') ? 'bg-primary/20' : ''}`}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          disabled={!editor?.can().chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={16} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`h-8 w-8 ${editor?.isActive('heading', { level: 1 }) ? 'bg-primary/20' : ''}`}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          disabled={!editor?.can().chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 size={16} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`h-8 w-8 ${editor?.isActive('heading', { level: 2 }) ? 'bg-primary/20' : ''}`}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          disabled={!editor?.can().chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 size={16} />
        </Button>
        <div className="flex-1"></div>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`h-8 w-8 ${editor?.isActive({ textAlign: 'left' }) ? 'bg-primary/20' : ''}`}
          onClick={() => editor?.chain().focus().setTextAlign('left').run()}
          disabled={!editor?.can().chain().focus().setTextAlign('left').run()}
        >
          <AlignLeft size={16} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`h-8 w-8 ${editor?.isActive({ textAlign: 'center' }) ? 'bg-primary/20' : ''}`}
          onClick={() => editor?.chain().focus().setTextAlign('center').run()}
          disabled={!editor?.can().chain().focus().setTextAlign('center').run()}
        >
          <AlignCenter size={16} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`h-8 w-8 ${editor?.isActive({ textAlign: 'right' }) ? 'bg-primary/20' : ''}`}
          onClick={() => editor?.chain().focus().setTextAlign('right').run()}
          disabled={!editor?.can().chain().focus().setTextAlign('right').run()}
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
      
      <div className="flex-1 relative note-content-editor">
        <EditorContent editor={editor} className="w-full h-full prose prose-sm max-w-none" />
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
