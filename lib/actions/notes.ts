"use server";

import { auth } from "@/auth";
import { Note } from "@/lib/models/note";
import { noteSchema } from "@/lib/validations/note";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import { triggerPusher } from "@/lib/pusher";

// Helper for consistent returns
const path = "/notes";

export async function createNote(data: unknown) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    await dbConnect();
    const validatedData = noteSchema.parse(data);
    const note = await Note.create({ ...validatedData, userId: session.user.id });
    revalidatePath(path);
    return { success: true, data: JSON.parse(JSON.stringify(note)) };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateNote(id: string, data: any) {
  try {
    await dbConnect();
    const note = await Note.findByIdAndUpdate(id, data, { new: true });
    revalidatePath(path);
    return { success: true, data: JSON.parse(JSON.stringify(note)) };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteNote(id: string) {
  try {
    await dbConnect();
    await Note.findByIdAndUpdate(id, { isTrashed: true });
    revalidatePath(path);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function restoreNote(id: string) {
  try {
    await dbConnect();
    await Note.findByIdAndUpdate(id, { isTrashed: false });
    revalidatePath(path);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function permanentlyDeleteNote(id: string) {
  try {
    await dbConnect();
    await Note.findByIdAndDelete(id);
    revalidatePath(path);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function togglePinNote(id: string) {
  try {
    await dbConnect();
    const note = await Note.findById(id);
    const updated = await Note.findByIdAndUpdate(id, { isPinned: !note.isPinned }, { new: true });
    revalidatePath(path);
    return { success: true, data: JSON.parse(JSON.stringify(updated)) };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function toggleArchiveNote(id: string) {
  try {
    await dbConnect();
    const note = await Note.findById(id);
    const updated = await Note.findByIdAndUpdate(id, { isArchived: !note.isArchived }, { new: true });
    revalidatePath(path);
    return { success: true, data: JSON.parse(JSON.stringify(updated)) };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateNoteColor(id: string, color: string) {
  try {
    await dbConnect();
    const note = await Note.findByIdAndUpdate(id, { color }, { new: true });
    revalidatePath(path);
    return { success: true, data: JSON.parse(JSON.stringify(note)) };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateNoteLabels(id: string, labelIds: string[]) {
  try {
    await dbConnect();
    const note = await Note.findByIdAndUpdate(id, { labels: labelIds }, { new: true });
    revalidatePath(path);
    return { success: true, data: JSON.parse(JSON.stringify(note)) };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function emptyTrash() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    await dbConnect();
    const result = await Note.deleteMany({ userId: session.user.id, isTrashed: true });
    revalidatePath(path);
    return { success: true, data: { count: result.deletedCount } };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}