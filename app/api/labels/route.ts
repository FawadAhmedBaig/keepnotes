import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import { Label } from "@/lib/models/label";
import type { LabelType } from "@/lib/types";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const labels = await Label.find({ userId: session.user.id })
      .sort({ name: 1 })
      .lean();

    const formattedLabels: LabelType[] = labels.map((label) => ({
      _id: label._id.toString(),
      userId: label.userId.toString(),
      name: label.name,
      createdAt: label.createdAt.toISOString(),
      updatedAt: label.updatedAt.toISOString(),
    }));

    return NextResponse.json(formattedLabels);
  } catch (error) {
    console.error("Get labels error:", error);
    return NextResponse.json(
      { error: "Failed to fetch labels" },
      { status: 500 }
    );
  }
}
