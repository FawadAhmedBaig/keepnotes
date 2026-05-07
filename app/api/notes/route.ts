import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import { Note } from "@/lib/models/note";
import type { NoteType } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") || "notes";
    const labelId = searchParams.get("labelId");
    const search = searchParams.get("search");

    await dbConnect();

    const query: Record<string, unknown> = { userId: session.user.id };

    // Filter by view type
    switch (view) {
      case "archive":
        query.isArchived = true;
        query.isTrashed = false;
        break;
      case "trash":
        query.isTrashed = true;
        break;
      case "label":
        if (labelId) {
          query.labels = labelId;
        }
        query.isArchived = false;
        query.isTrashed = false;
        break;
      default: // notes
        query.isArchived = false;
        query.isTrashed = false;
        break;
    }

    // Search filter
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [{ title: searchRegex }, { content: searchRegex }];
    }

    const notes = await Note.find(query)
      .sort({ isPinned: -1, updatedAt: -1 })
      .lean();

    const formattedNotes: NoteType[] = notes.map((note) => ({
      _id: note._id.toString(),
      userId: note.userId.toString(),
      title: note.title,
      content: note.content,
      color: note.color,
      labels: note.labels.map((l: { toString: () => string }) => l.toString()),
      isPinned: note.isPinned,
      isArchived: note.isArchived,
      isTrashed: note.isTrashed,
      trashedAt: note.trashedAt?.toISOString() || null,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    }));

    return NextResponse.json(formattedNotes);
  } catch (error) {
    console.error("Get notes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}
