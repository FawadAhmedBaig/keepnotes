"use server";

import { revalidateTag } from "next/cache";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Note, type NoteColor } from "@/lib/models/note";
import { noteSchema, updateNoteSchema } from "@/lib/validations/note";
import { triggerPusherEvent } from "@/lib/pusher";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

// Create DOMPurify instance for server-side
const window = new JSDOM("").window;
const purify = DOMPurify(window);

function sanitize(text: string): string {
  return purify.sanitize(text, { ALLOWED_TAGS: [] });
}

type ActionResult<T = unknown> = { success: true; data: T } | { success: false; error: string };

export async function createNote(data: {
  title?: string;
  content?: string;
  color?: NoteColor;
  labels?: string[];
  isPinned?: boolean;
}): Promise<ActionResult<{ _id: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = noteSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0]?.message || "Invalid data" };
    }

    await connectToDatabase();

    const note = await Note.create({
      userId: session.user.id,
      title: sanitize(validated.data.title || ""),
      content: sanitize(validated.data.content || ""),
      color: validated.data.color,
      labels: validated.data.labels || [],
      isPinned: validated.data.isPinned || false,
    });

    await triggerPusherEvent(session.user.id, "note:created", {
      noteId: note._id.toString(),
    });

    revalidateTag("notes", "max");

    return { success: true, data: { _id: note._id.toString() } };
  } catch (error) {
    console.error("Create note error:", error);
    return { success: false, error: "Failed to create note" };
  }
}

export async function updateNote(
  noteId: string,
  data: {
    title?: string;
    content?: string;
    color?: NoteColor;
    labels?: string[];
    isPinned?: boolean;
    isArchived?: boolean;
  }
): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = updateNoteSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0]?.message || "Invalid data" };
    }

    await connectToDatabase();

    const updateData: Record<string, unknown> = {};
    if (validated.data.title !== undefined) updateData.title = sanitize(validated.data.title);
    if (validated.data.content !== undefined) updateData.content = sanitize(validated.data.content);
    if (validated.data.color !== undefined) updateData.color = validated.data.color;
    if (validated.data.labels !== undefined) updateData.labels = validated.data.labels;
    if (validated.data.isPinned !== undefined) updateData.isPinned = validated.data.isPinned;
    if (validated.data.isArchived !== undefined) {
      updateData.isArchived = validated.data.isArchived;
      if (validated.data.isArchived) {
        updateData.isPinned = false; // Unpin when archiving
      }
    }

    const note = await Note.findOneAndUpdate(
      { _id: noteId, userId: session.user.id },
      { $set: updateData },
      { new: true }
    );

    if (!note) {
      return { success: false, error: "Note not found" };
    }

    await triggerPusherEvent(session.user.id, "note:updated", {
      noteId: note._id.toString(),
    });

    revalidateTag("notes", "max");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Update note error:", error);
    return { success: false, error: "Failed to update note" };
  }
}

export async function deleteNote(noteId: string): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    await connectToDatabase();

    const note = await Note.findOneAndUpdate(
      { _id: noteId, userId: session.user.id },
      {
        $set: {
          isTrashed: true,
          trashedAt: new Date(),
          isPinned: false,
        },
      },
      { new: true }
    );

    if (!note) {
      return { success: false, error: "Note not found" };
    }

    await triggerPusherEvent(session.user.id, "note:updated", {
      noteId: note._id.toString(),
    });

    revalidateTag("notes", "max");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Delete note error:", error);
    return { success: false, error: "Failed to delete note" };
  }
}

export async function restoreNote(noteId: string): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    await connectToDatabase();

    const note = await Note.findOneAndUpdate(
      { _id: noteId, userId: session.user.id },
      {
        $set: {
          isTrashed: false,
          trashedAt: null,
        },
      },
      { new: true }
    );

    if (!note) {
      return { success: false, error: "Note not found" };
    }

    await triggerPusherEvent(session.user.id, "note:updated", {
      noteId: note._id.toString(),
    });

    revalidateTag("notes", "max");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Restore note error:", error);
    return { success: false, error: "Failed to restore note" };
  }
}

export async function permanentlyDeleteNote(noteId: string): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    await connectToDatabase();

    const note = await Note.findOneAndDelete({
      _id: noteId,
      userId: session.user.id,
      isTrashed: true,
    });

    if (!note) {
      return { success: false, error: "Note not found or not in trash" };
    }

    await triggerPusherEvent(session.user.id, "note:deleted", {
      noteId,
    });

    revalidateTag("notes", "max");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Permanently delete note error:", error);
    return { success: false, error: "Failed to permanently delete note" };
  }
}

export async function emptyTrash(): Promise<ActionResult<{ count: number }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    await connectToDatabase();

    const result = await Note.deleteMany({
      userId: session.user.id,
      isTrashed: true,
    });

    await triggerPusherEvent(session.user.id, "note:deleted", {
      all: true,
    });

    revalidateTag("notes", "max");

    return { success: true, data: { count: result.deletedCount } };
  } catch (error) {
    console.error("Empty trash error:", error);
    return { success: false, error: "Failed to empty trash" };
  }
}

export async function togglePinNote(noteId: string): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    await connectToDatabase();

    const note = await Note.findOne({ _id: noteId, userId: session.user.id });
    if (!note) {
      return { success: false, error: "Note not found" };
    }

    note.isPinned = !note.isPinned;
    await note.save();

    await triggerPusherEvent(session.user.id, "note:updated", {
      noteId: note._id.toString(),
    });

    revalidateTag("notes", "max");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Toggle pin error:", error);
    return { success: false, error: "Failed to toggle pin" };
  }
}

export async function toggleArchiveNote(noteId: string): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    await connectToDatabase();

    const note = await Note.findOne({ _id: noteId, userId: session.user.id });
    if (!note) {
      return { success: false, error: "Note not found" };
    }

    note.isArchived = !note.isArchived;
    if (note.isArchived) {
      note.isPinned = false;
    }
    await note.save();

    await triggerPusherEvent(session.user.id, "note:updated", {
      noteId: note._id.toString(),
    });

    revalidateTag("notes", "max");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Toggle archive error:", error);
    return { success: false, error: "Failed to toggle archive" };
  }
}

export async function updateNoteColor(noteId: string, color: NoteColor): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    await connectToDatabase();

    const note = await Note.findOneAndUpdate(
      { _id: noteId, userId: session.user.id },
      { $set: { color } },
      { new: true }
    );

    if (!note) {
      return { success: false, error: "Note not found" };
    }

    await triggerPusherEvent(session.user.id, "note:updated", {
      noteId: note._id.toString(),
    });

    revalidateTag("notes", "max");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Update note color error:", error);
    return { success: false, error: "Failed to update note color" };
  }
}

export async function updateNoteLabels(noteId: string, labels: string[]): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    await connectToDatabase();

    const note = await Note.findOneAndUpdate(
      { _id: noteId, userId: session.user.id },
      { $set: { labels } },
      { new: true }
    );

    if (!note) {
      return { success: false, error: "Note not found" };
    }

    await triggerPusherEvent(session.user.id, "note:updated", {
      noteId: note._id.toString(),
    });

    revalidateTag("notes", "max");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Update note labels error:", error);
    return { success: false, error: "Failed to update note labels" };
  }
}
