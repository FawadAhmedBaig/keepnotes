import { z } from "zod";
import { NOTE_COLORS } from "@/types/note";

export const noteSchema = z.object({
  title: z.string().max(1000, "Title must be 1000 characters or less").optional().default(""),
  content: z.string().max(20000, "Content must be 20,000 characters or less").optional().default(""),
  color: z.enum(NOTE_COLORS.map(c => c.value) as [string, ...string[]]).optional().default("default"),
  labels: z.array(z.string()).optional().default([]),
  isPinned: z.boolean().optional().default(false),
  isArchived: z.boolean().optional().default(false),
});

export const updateNoteSchema = noteSchema.partial();

export const labelSchema = z.object({
  name: z.string().min(1, "Label name is required").max(50, "Label must be 50 characters or less"),
});

export type NoteFormData = z.infer<typeof noteSchema>;
export type UpdateNoteFormData = z.infer<typeof updateNoteSchema>;
export type LabelFormData = z.infer<typeof labelSchema>;