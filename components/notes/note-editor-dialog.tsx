"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { NoteType, LabelType, ViewType } from "@/lib/types";
import { type NoteColor } from "@/types/note";
import { ColorPicker, getNoteColorClass } from "./color-picker";
import { LabelPicker } from "./label-picker";
import { LabelBadge } from "@/components/labels/label-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose, // Added this
} from "@/components/ui/dialog";
import { 
  Pin, 
  PinOff, 
  Archive, 
  ArchiveRestore, 
  Trash2, 
  RotateCcw, 
  Trash, 
  ImageIcon, 
  X 
} from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { toast } from "sonner";

interface NoteEditorDialogProps {
  note: NoteType | null;
  labels: LabelType[];
  viewType: ViewType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (note: NoteType) => void;
  onTogglePin: (noteId: string) => void;
  onToggleArchive: (noteId: string) => void;
  onDelete: (noteId: string) => void;
  onRestore?: (noteId: string) => void;
  onPermanentDelete?: (noteId: string) => void;
  onUpdateLabels: (noteId: string, labelIds: string[]) => void;
}

export function NoteEditorDialog({
  note,
  labels,
  viewType,
  open,
  onOpenChange,
  onSave,
  onTogglePin,
  onToggleArchive,
  onDelete,
  onRestore,
  onPermanentDelete,
  onUpdateLabels,
}: NoteEditorDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState<NoteColor>("default");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [isPinned, setIsPinned] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState<string | null>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title || "");
      setContent(note.content || "");
      setColor(note.color || "default");
      setSelectedLabels(note.labels || []);
      setIsPinned(note.isPinned || false);
      setImageUrl(note.imageUrl || null);
      setImageKey(note.imageKey || null);
    }
  }, [note]);

  const handleClose = useCallback(() => {
    if (note) {
      const hasChanges =
        title !== (note.title || "") ||
        content !== (note.content || "") ||
        color !== note.color ||
        JSON.stringify(selectedLabels.sort()) !== JSON.stringify([...note.labels].sort()) ||
        isPinned !== note.isPinned;

      if (hasChanges) {
        onSave({
          ...note,
          title: title.trim(),
          content: content.trim(),
          color,
          labels: selectedLabels,
          isPinned,
          imageUrl,
          imageKey,
        });
      }
    }
    onOpenChange(false);
  }, [note, title, content, color, selectedLabels, isPinned, imageUrl, imageKey, onSave, onOpenChange]);

  const selectedLabelObjects = labels.filter((l) =>
    selectedLabels.includes(l._id)
  );

  if (!note) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        // CRITICAL: Ensure 'p-0' and 'gap-0' to control spacing manually
        className={cn(
          "sm:max-w-xl p-0 gap-0 border-none shadow-2xl overflow-hidden [&>button]:hidden", 
          getNoteColorClass(color)
        )}
      >
        <VisuallyHidden>
          <DialogTitle>Edit Note</DialogTitle>
          <DialogDescription>Note editing mode</DialogDescription>
        </VisuallyHidden>

        {/* 1. Header Section: Input and Buttons on one horizontal line */}
        <div className="flex items-start justify-between px-4 pt-4 pb-1 gap-2">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-lg font-bold bg-transparent border-0 outline-none placeholder:text-muted-foreground mt-1"
            disabled={note.isTrashed}
          />
          
          <div className="flex items-center gap-1 shrink-0">
            {!note.isTrashed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPinned(!isPinned)}
                className={cn(
                  "h-9 w-9 rounded-full", 
                  isPinned ? "text-primary" : "text-slate-500 hover:bg-black/5"
                )}
              >
                {isPinned ? <PinOff className="w-5 h-5" /> : <Pin className="w-5 h-5" />}
              </Button>
            )}
            
            {/* Manual Close Button - This is the only one that will show */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-9 w-9 rounded-full text-slate-500 hover:bg-black/5"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* 2. Content Section */}
        <textarea
          placeholder="Note"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-4 py-2 text-base bg-transparent border-0 outline-none resize-none placeholder:text-muted-foreground min-h-[150px]"
          disabled={note.isTrashed}
        />

        {/* 3. Labels Section */}
        {selectedLabelObjects.length > 0 && (
          <div className="flex flex-wrap gap-1 px-4 pb-3">
            {selectedLabelObjects.map((label) => (
              <LabelBadge
                key={label._id}
                name={label.name}
                onRemove={note.isTrashed ? undefined : () => {
                  const newLabels = selectedLabels.filter((id) => id !== label._id);
                  setSelectedLabels(newLabels);
                  onUpdateLabels(note._id, newLabels);
                }}
              />
            ))}
          </div>
        )}

        {/* 4. Footer Toolbar */}
        <div className="flex items-center justify-between px-2 py-2 border-t border-black/10">
          <div className="flex items-center gap-1">
            {!note.isTrashed && (
              <>
                <ColorPicker value={color} onChange={setColor} />
                <LabelPicker
                  labels={labels}
                  selectedLabels={selectedLabels}
                  onChange={(newLabels) => {
                    setSelectedLabels(newLabels);
                    onUpdateLabels(note._id, newLabels);
                  }}
                />
                <Button variant="ghost" size="icon" onClick={() => onToggleArchive(note._id)} className="rounded-full h-9 w-9 text-slate-500">
                  {note.isArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(note._id)} className="rounded-full h-9 w-9 text-slate-500">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-sm font-semibold hover:bg-black/5"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}