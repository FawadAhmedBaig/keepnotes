"use server";

import { auth } from "@/auth";
import { Note } from "@/lib/models/note";
import { noteSchema } from "@/lib/validations/note";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import { triggerPusher } from "@/lib/pusher";

// Helper for consistent path revalidation
const path = "/notes";

/**
 * Consolidated createNote
 * Handles text, colors, and cloud-uploaded images
 */
export async function createNote(data: {
  title?: string;
  content?: string;
  color?: string;
  imageUrl?: string | null;
  imageKey?: string | null;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    
    await dbConnect();

    // 1. Create the note
    // Note: Ensure your Mongoose Schema in 'models/Note.ts' includes these fields!
    const note = await Note.create({
      title: data.title || "",
      content: data.content || "",
      color: data.color || "default",
      imageUrl: data.imageUrl || null,
      imageKey: data.imageKey || null,
      userId: session.user.id,
    });

    // 2. Convert to plain object for Pusher and Client return
    // This prevents circular reference errors and ensures dates are strings
    const plainNote = JSON.parse(JSON.stringify(note));

    // 3. Broadcast update via Pusher
    // It is critical to send the plainNote which now includes the imageUrl
    await triggerPusher(`user-${session.user.id}`, "note:created", plainNote);

    // 4. Revalidate the cache
    revalidatePath("/notes"); // Assuming your path is /notes
    
    return { 
      success: true, 
      data: plainNote 
    };
  } catch (error: any) {
    console.error("Create note error:", error);
    return { success: false, error: error.message || "Failed to create note" };
  }
}

// lib/actions/notes.ts

export async function updateNote(id: string, data: any) {
  try {
    await dbConnect();
    
    // EXPLICIT MAPPING: Do not trust the spread operator (...)
    const updatePayload = {
      title: data.title,
      content: data.content,
      color: data.color,
      isPinned: data.isPinned,
      isArchived: data.isArchived,
      labels: data.labels,
      imageUrl: data.imageUrl, // Force this field
      imageKey: data.imageKey, // Force this field
    };

    const note = await Note.findByIdAndUpdate(
      id,
      updatePayload,
      { new: true, runValidators: true }
    ).lean();

    if (!note) throw new Error("Note not found");

    const plainNote = JSON.parse(JSON.stringify(note));
    await triggerPusher(`user-${note.userId}`, "note:updated", plainNote);

    revalidatePath("/notes");
    return { success: true, data: plainNote };
  } catch (error: any) {
    console.error("Update error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteNote(id: string) {
  try {
    await dbConnect();
    await Note.findByIdAndUpdate(id, { isTrashed: true, trashedAt: new Date() });
    revalidatePath(path);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function restoreNote(id: string) {
  try {
    await dbConnect();
    await Note.findByIdAndUpdate(id, { isTrashed: false, trashedAt: null });
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
    if (!note) throw new Error("Note not found");
    
    const updated = await Note.findByIdAndUpdate(
      id, 
      { isPinned: !note.isPinned }, 
      { new: true }
    );
    
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
    if (!note) throw new Error("Note not found");
    
    const updated = await Note.findByIdAndUpdate(
      id, 
      { isArchived: !note.isArchived }, 
      { new: true }
    );
    
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