"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { NoteType, ViewType } from "@/lib/types";
import type { NoteColor } from "@/types/note";
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

/**
 * Global Type for Server Action Responses
 */
type ActionResult<T = any> = {
  success: boolean;
  error?: string;
  data?: T;
};

interface FetchNotesParams {
  view: ViewType;
  labelId?: string;
  search?: string;
}

/**
 * API Fetcher for Notes
 */
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

/**
 * HOOK: useNotes
 */
export function useNotes(params: FetchNotesParams) {
  return useQuery({
    queryKey: ["notes", params],
    queryFn: () => fetchNotes(params),
  });
}

/**
 * HOOK: useCreateNote
 */
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
      const result = (await createNote(data)) as unknown as ActionResult<NoteType>;
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note created");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create note");
    },
  });
}

/**
 * HOOK: useUpdateNote
 */
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
      const result = (await updateNote(noteId, data)) as unknown as ActionResult<NoteType>;
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onMutate: async ({ noteId, data }) => {
      await queryClient.cancelQueries({ queryKey: ["notes"] });
      const previousNotes = queryClient.getQueriesData<NoteType[]>({ queryKey: ["notes"] });

      queryClient.setQueriesData<NoteType[]>({ queryKey: ["notes"] }, (old) => {
        if (!old) return old;
        return old.map((note) =>
          note._id === noteId ? { ...note, ...data } : note
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

/**
 * HOOK: useDeleteNote
 */
export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      const result = (await deleteNote(noteId)) as unknown as ActionResult;
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onMutate: async (noteId) => {
      await queryClient.cancelQueries({ queryKey: ["notes"] });
      const previousNotes = queryClient.getQueriesData<NoteType[]>({ queryKey: ["notes"] });

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
      toast.error("Failed to move note to trash");
    },
    onSuccess: () => {
      toast.success("Note moved to trash");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

/**
 * HOOK: useRestoreNote
 */
export function useRestoreNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      const result = (await restoreNote(noteId)) as unknown as ActionResult;
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note restored");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to restore note");
    },
  });
}

/**
 * HOOK: usePermanentlyDeleteNote
 */
export function usePermanentlyDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      const result = (await permanentlyDeleteNote(noteId)) as unknown as ActionResult;
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onMutate: async (noteId) => {
      await queryClient.cancelQueries({ queryKey: ["notes"] });
      const previousNotes = queryClient.getQueriesData<NoteType[]>({ queryKey: ["notes"] });

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
      toast.error("Failed to delete note permanently");
    },
    onSuccess: () => {
      toast.success("Note permanently deleted");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

/**
 * HOOK: useEmptyTrash
 */
export function useEmptyTrash() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = (await emptyTrash()) as unknown as ActionResult<{ count: number }>;
      if (!result.success) throw new Error(result.error || "Failed to empty trash");
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      const count = data?.count || 0;
      toast.success(`Deleted ${count} note${count !== 1 ? "s" : ""}`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to empty trash");
    },
  });
}

/**
 * HOOK: useTogglePinNote
 */
export function useTogglePinNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      const result = (await togglePinNote(noteId)) as unknown as ActionResult;
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onMutate: async (noteId) => {
      await queryClient.cancelQueries({ queryKey: ["notes"] });
      const previousNotes = queryClient.getQueriesData<NoteType[]>({ queryKey: ["notes"] });

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
      toast.error("Failed to update pin status");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

/**
 * HOOK: useToggleArchiveNote
 */
export function useToggleArchiveNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      const result = (await toggleArchiveNote(noteId)) as unknown as ActionResult;
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onMutate: async (noteId) => {
      await queryClient.cancelQueries({ queryKey: ["notes"] });
      const previousNotes = queryClient.getQueriesData<NoteType[]>({ queryKey: ["notes"] });

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
      toast.error("Failed to update archive status");
    },
    onSuccess: () => {
      toast.success("Note updated");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

/**
 * HOOK: useUpdateNoteColor
 */
export function useUpdateNoteColor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ noteId, color }: { noteId: string; color: NoteColor }) => {
      const result = (await updateNoteColor(noteId, color)) as unknown as ActionResult;
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onMutate: async ({ noteId, color }) => {
      await queryClient.cancelQueries({ queryKey: ["notes"] });
      const previousNotes = queryClient.getQueriesData<NoteType[]>({ queryKey: ["notes"] });

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

/**
 * HOOK: useUpdateNoteLabels
 */
export function useUpdateNoteLabels() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ noteId, labels }: { noteId: string; labels: string[] }) => {
      const result = (await updateNoteLabels(noteId, labels)) as unknown as ActionResult<NoteType>;
      if (!result || !result.success) throw new Error(result?.error || "Failed to update labels");
      return result.data;
    },
    onMutate: async ({ noteId, labels }) => {
      await queryClient.cancelQueries({ queryKey: ["notes"] });
      const previousNotes = queryClient.getQueriesData<NoteType[]>({ queryKey: ["notes"] });

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
      console.error("Label update error:", err);
      toast.error("Failed to update note labels");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}