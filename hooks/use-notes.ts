"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { NoteType, ViewType } from "@/lib/types";
import type { NoteColor } from "@/lib/models/note";
import {
  createNote,
  updateNote,
  deleteNote,
  restoreNote,
  permanentlyDeleteNote,
  togglePinNote,
  toggleArchiveNote,
  updateNoteColor,
  updateNoteLabels,
  emptyTrash,
} from "@/lib/actions/notes";

interface FetchNotesParams {
  view: ViewType;
  labelId?: string;
  search?: string;
}

async function fetchNotes(params: FetchNotesParams): Promise<NoteType[]> {
  const searchParams = new URLSearchParams();
  searchParams.set("view", params.view);
  if (params.labelId) searchParams.set("labelId", params.labelId);
  if (params.search) searchParams.set("search", params.search);

  const response = await fetch(`/api/notes?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch notes");
  }
  return response.json();
}

export function useNotes(params: FetchNotesParams) {
  return useQuery({
    queryKey: ["notes", params],
    queryFn: () => fetchNotes(params),
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title?: string;
      content?: string;
      color?: NoteColor;
      labels?: string[];
      isPinned?: boolean;
    }) => {
      const result = await createNote(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note created");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create note");
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      noteId,
      data,
    }: {
      noteId: string;
      data: Partial<NoteType>;
    }) => {
      const result = await updateNote(noteId, data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onMutate: async ({ noteId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["notes"] });

      // Snapshot previous value
      const previousNotes = queryClient.getQueriesData<NoteType[]>({
        queryKey: ["notes"],
      });

      // Optimistically update all matching queries
      queryClient.setQueriesData<NoteType[]>({ queryKey: ["notes"] }, (old) => {
        if (!old) return old;
        return old.map((note) =>
          note._id === noteId ? { ...note, ...data } : note
        );
      });

      return { previousNotes };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousNotes) {
        context.previousNotes.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error("Failed to update note");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      const result = await deleteNote(noteId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onMutate: async (noteId) => {
      await queryClient.cancelQueries({ queryKey: ["notes"] });

      const previousNotes = queryClient.getQueriesData<NoteType[]>({
        queryKey: ["notes"],
      });

      queryClient.setQueriesData<NoteType[]>({ queryKey: ["notes"] }, (old) => {
        if (!old) return old;
        return old.filter((note) => note._id !== noteId);
      });

      return { previousNotes };
    },
    onError: (err, variables, context) => {
      if (context?.previousNotes) {
        context.previousNotes.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error("Failed to delete note");
    },
    onSuccess: () => {
      toast.success("Note moved to trash");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useRestoreNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      const result = await restoreNote(noteId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note restored");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to restore note");
    },
  });
}

export function usePermanentlyDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      const result = await permanentlyDeleteNote(noteId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onMutate: async (noteId) => {
      await queryClient.cancelQueries({ queryKey: ["notes"] });

      const previousNotes = queryClient.getQueriesData<NoteType[]>({
        queryKey: ["notes"],
      });

      queryClient.setQueriesData<NoteType[]>({ queryKey: ["notes"] }, (old) => {
        if (!old) return old;
        return old.filter((note) => note._id !== noteId);
      });

      return { previousNotes };
    },
    onError: (err, variables, context) => {
      if (context?.previousNotes) {
        context.previousNotes.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error("Failed to delete note");
    },
    onSuccess: () => {
      toast.success("Note permanently deleted");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useEmptyTrash() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await emptyTrash();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success(`Deleted ${data.count} note${data.count !== 1 ? "s" : ""}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to empty trash");
    },
  });
}

export function useTogglePinNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      const result = await togglePinNote(noteId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onMutate: async (noteId) => {
      await queryClient.cancelQueries({ queryKey: ["notes"] });

      const previousNotes = queryClient.getQueriesData<NoteType[]>({
        queryKey: ["notes"],
      });

      queryClient.setQueriesData<NoteType[]>({ queryKey: ["notes"] }, (old) => {
        if (!old) return old;
        return old.map((note) =>
          note._id === noteId ? { ...note, isPinned: !note.isPinned } : note
        );
      });

      return { previousNotes };
    },
    onError: (err, variables, context) => {
      if (context?.previousNotes) {
        context.previousNotes.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error("Failed to update note");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useToggleArchiveNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      const result = await toggleArchiveNote(noteId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onMutate: async (noteId) => {
      await queryClient.cancelQueries({ queryKey: ["notes"] });

      const previousNotes = queryClient.getQueriesData<NoteType[]>({
        queryKey: ["notes"],
      });

      queryClient.setQueriesData<NoteType[]>({ queryKey: ["notes"] }, (old) => {
        if (!old) return old;
        return old.filter((note) => note._id !== noteId);
      });

      return { previousNotes };
    },
    onError: (err, variables, context) => {
      if (context?.previousNotes) {
        context.previousNotes.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error("Failed to update note");
    },
    onSuccess: () => {
      toast.success("Note updated");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useUpdateNoteColor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      noteId,
      color,
    }: {
      noteId: string;
      color: NoteColor;
    }) => {
      const result = await updateNoteColor(noteId, color);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onMutate: async ({ noteId, color }) => {
      await queryClient.cancelQueries({ queryKey: ["notes"] });

      const previousNotes = queryClient.getQueriesData<NoteType[]>({
        queryKey: ["notes"],
      });

      queryClient.setQueriesData<NoteType[]>({ queryKey: ["notes"] }, (old) => {
        if (!old) return old;
        return old.map((note) =>
          note._id === noteId ? { ...note, color } : note
        );
      });

      return { previousNotes };
    },
    onError: (err, variables, context) => {
      if (context?.previousNotes) {
        context.previousNotes.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error("Failed to update note color");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useUpdateNoteLabels() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      noteId,
      labels,
    }: {
      noteId: string;
      labels: string[];
    }) => {
      const result = await updateNoteLabels(noteId, labels);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onMutate: async ({ noteId, labels }) => {
      await queryClient.cancelQueries({ queryKey: ["notes"] });

      const previousNotes = queryClient.getQueriesData<NoteType[]>({
        queryKey: ["notes"],
      });

      queryClient.setQueriesData<NoteType[]>({ queryKey: ["notes"] }, (old) => {
        if (!old) return old;
        return old.map((note) =>
          note._id === noteId ? { ...note, labels } : note
        );
      });

      return { previousNotes };
    },
    onError: (err, variables, context) => {
      if (context?.previousNotes) {
        context.previousNotes.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error("Failed to update note labels");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}
