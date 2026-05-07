"use client";

import { use } from "react";
import { NotesView } from "@/components/notes/notes-view";
import { useLabels } from "@/hooks/use-labels";

export default function LabelPage({
  params,
}: {
  params: Promise<{ labelId: string }>;
}) {
  const { labelId } = use(params);
  const { data: labels = [] } = useLabels();
  const label = labels.find((l) => l._id === labelId);

  return (
    <NotesView
      viewType="label"
      labelId={labelId}
      title={label?.name || "Label"}
    />
  );
}
