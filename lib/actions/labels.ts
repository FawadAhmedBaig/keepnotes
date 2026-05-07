"use server";

import { revalidateTag } from "next/cache";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Label } from "@/lib/models/label";
import { Note } from "@/lib/models/note";
import { labelSchema } from "@/lib/validations/note";
import { triggerPusherEvent } from "@/lib/pusher";

type ActionResult<T = unknown> = { success: true; data: T } | { success: false; error: string };

export async function createLabel(name: string): Promise<ActionResult<{ _id: string; name: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = labelSchema.safeParse({ name });
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0]?.message || "Invalid data" };
    }

    await connectToDatabase();

    // Check if label already exists
    const existing = await Label.findOne({
      userId: session.user.id,
      name: validated.data.name,
    });

    if (existing) {
      return { success: false, error: "Label already exists" };
    }

    const label = await Label.create({
      userId: session.user.id,
      name: validated.data.name,
    });

    await triggerPusherEvent(session.user.id, "label:created", {
      labelId: label._id.toString(),
    });

    revalidateTag("labels", "max");

    return {
      success: true,
      data: { _id: label._id.toString(), name: label.name },
    };
  } catch (error) {
    console.error("Create label error:", error);
    return { success: false, error: "Failed to create label" };
  }
}

export async function updateLabel(labelId: string, name: string): Promise<ActionResult<{ _id: string; name: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = labelSchema.safeParse({ name });
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0]?.message || "Invalid data" };
    }

    await connectToDatabase();

    // Check if another label with this name exists
    const existing = await Label.findOne({
      userId: session.user.id,
      name: validated.data.name,
      _id: { $ne: labelId },
    });

    if (existing) {
      return { success: false, error: "Label with this name already exists" };
    }

    const label = await Label.findOneAndUpdate(
      { _id: labelId, userId: session.user.id },
      { $set: { name: validated.data.name } },
      { new: true }
    );

    if (!label) {
      return { success: false, error: "Label not found" };
    }

    await triggerPusherEvent(session.user.id, "label:updated", {
      labelId: label._id.toString(),
    });

    revalidateTag("labels", "max");

    return {
      success: true,
      data: { _id: label._id.toString(), name: label.name },
    };
  } catch (error) {
    console.error("Update label error:", error);
    return { success: false, error: "Failed to update label" };
  }
}

export async function deleteLabel(labelId: string): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    await connectToDatabase();

    const label = await Label.findOneAndDelete({
      _id: labelId,
      userId: session.user.id,
    });

    if (!label) {
      return { success: false, error: "Label not found" };
    }

    // Remove label from all notes
    await Note.updateMany(
      { userId: session.user.id, labels: labelId },
      { $pull: { labels: labelId } }
    );

    await triggerPusherEvent(session.user.id, "label:deleted", {
      labelId,
    });

    revalidateTag("labels", "max");
    revalidateTag("notes", "max");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Delete label error:", error);
    return { success: false, error: "Failed to delete label" };
  }
}
