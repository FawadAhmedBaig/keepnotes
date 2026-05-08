"use client";

import { Tag, Plus } from "lucide-react";
import { useLabels } from "@/hooks/use-labels";
import Link from "next/link";

export default function LabelsIndexPage() {
  const { data: labels = [] } = useLabels();

  return (
    <div className="flex flex-col h-full bg-background p-4 md:hidden">
      <h1 className="text-xl font-bold mb-6">Labels</h1>
      
      <div className="grid gap-2">
        {labels.map((label) => (
          <Link
            key={label._id}
            href={`/label/${label._id}`}
            className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 active:bg-secondary/50 transition-colors"
          >
            <Tag className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">{label.name}</span>
          </Link>
        ))}
        
        {labels.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Tag className="w-12 h-12 text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground">No labels created yet</p>
          </div>
        )}
      </div>
    </div>
  );
}