"use client";

import { useState, useCallback } from "react";
import type { NoteType, ViewType, LabelType } from "@/lib/types";
import { NOTE_COLORS, type NoteColor } from "@/types/note";
import { NoteInput } from "./note-input";
import { NoteGrid } from "./note-grid";
import { NoteEditorDialog } from "./note-editor-dialog";
import {
  useNotes,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
  useRestoreNote,
  usePermanentlyDeleteNote,
  useTogglePinNote,
  useToggleArchiveNote,
  useUpdateNoteColor,
  useUpdateNoteLabels,
  useEmptyTrash,
} from "@/hooks/use-notes";
import { useLabels } from "@/hooks/use-labels";
import { useNotesContext } from "@/lib/notes-context";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface NotesViewProps {
  viewType: ViewType;
  labelId?: string;
  title?: string;
}

export function NotesView({ viewType, labelId, title }: NotesViewProps) {
  const { searchQuery } = useNotesContext();
  const { data: labels = [] } = useLabels();
  const { data: notes = [], isLoading } = useNotes({
    view: viewType,
    labelId,
    search: searchQuery,
  });

  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const restoreNote = useRestoreNote();
  const permanentlyDeleteNote = usePermanentlyDeleteNote();
  const togglePinNote = useTogglePinNote();
  const toggleArchiveNote = useToggleArchiveNote();
  const updateNoteColor = useUpdateNoteColor();
  const updateNoteLabels = useUpdateNoteLabels();
  const emptyTrash = useEmptyTrash();

  const [editingNote, setEditingNote] = useState<NoteType | null>(null);

  const handleCreateNote = useCallback(
    (data: {
      title: string;
      content: string;
      color: NoteColor;
      labels: string[];
      isPinned: boolean;
    }) => {
      createNote.mutate(data);
    },
    [createNote]
  );

  const handleSaveNote = useCallback(
    (note: NoteType) => {
      updateNote.mutate({
        noteId: note._id,
        data: {
          title: note.title,
          content: note.content,
          color: note.color,
          labels: note.labels,
          isPinned: note.isPinned,
        },
      });
    },
    [updateNote]
  );

  const handleUpdateColor = useCallback(
    (noteId: string, color: NoteColor) => {
      updateNoteColor.mutate({ noteId, color });
    },
    [updateNoteColor]
  );

  const handleTogglePin = useCallback(
    (noteId: string) => {
      togglePinNote.mutate(noteId);
    },
    [togglePinNote]
  );

  const handleToggleArchive = useCallback(
    (noteId: string) => {
      toggleArchiveNote.mutate(noteId);
      setEditingNote(null);
    },
    [toggleArchiveNote]
  );

  const handleDelete = useCallback(
    (noteId: string) => {
      deleteNote.mutate(noteId);
      setEditingNote(null);
    },
    [deleteNote]
  );

  const handleRestore = useCallback(
    (noteId: string) => {
      restoreNote.mutate(noteId);
      setEditingNote(null);
    },
    [restoreNote]
  );

  const handlePermanentDelete = useCallback(
    (noteId: string) => {
      permanentlyDeleteNote.mutate(noteId);
      setEditingNote(null);
    },
    [permanentlyDeleteNote]
  );

  const handleUpdateLabels = useCallback(
    (noteId: string, labelIds: string[]) => {
      updateNoteLabels.mutate({ noteId, labels: labelIds });
    },
    [updateNoteLabels]
  );

  const getViewTitle = () => {
    if (title) return title;
    switch (viewType) {
      case "archive":
        return "Archive";
      case "trash":
        return "Trash";
      default:
        return "Notes";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {viewType === "notes" && !searchQuery && (
        <div className="mb-8">
          <NoteInput labels={labels} onSubmit={handleCreateNote} />
        </div>
      )}

      {viewType === "trash" && notes.length > 0 && (
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            Notes in trash are deleted after 7 days
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Trash2 className="w-4 h-4" />
                Empty trash
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Empty trash?</AlertDialogTitle>
                <AlertDialogDescription>
                  All notes in trash will be permanently deleted. This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => emptyTrash.mutate()}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Empty trash
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {searchQuery && (
        <p className="text-sm text-muted-foreground mb-4">
          Searching for &quot;{searchQuery}&quot;
        </p>
      )}

      <NoteGrid
        notes={notes}
        labels={labels}
        viewType={viewType}
        onEdit={setEditingNote}
        onUpdateColor={handleUpdateColor}
        onTogglePin={handleTogglePin}
        onToggleArchive={handleToggleArchive}
        onDelete={handleDelete}
        onRestore={handleRestore}
        onPermanentDelete={handlePermanentDelete}
        onUpdateLabels={handleUpdateLabels}
      />

      <NoteEditorDialog
        note={editingNote}
        labels={labels}
        viewType={viewType}
        open={!!editingNote}
        onOpenChange={(open) => !open && setEditingNote(null)}
        onSave={handleSaveNote}
        onTogglePin={handleTogglePin}
        onToggleArchive={handleToggleArchive}
        onDelete={handleDelete}
        onRestore={handleRestore}
        onPermanentDelete={handlePermanentDelete}
        onUpdateLabels={handleUpdateLabels}
      />
    </div>
  );
}
