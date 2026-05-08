"use client";

import { Tag, Plus, Settings2 } from "lucide-react";
import { useLabels } from "@/hooks/use-labels";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LabelsIndexPage() {
  const { data: labels = [] } = useLabels();

  return (
    <div className="flex flex-col h-full bg-background p-4 md:hidden">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Labels</h1>
        {/* ADDED THIS BUTTON */}
        <Button variant="outline" size="sm" className="gap-2 rounded-full border-primary/20 text-primary">
          <Settings2 className="w-4 h-4" />
          Manage
        </Button>
      </div>
      
      <div className="grid gap-2">
        {labels.map((label) => (
          <Link
            key={label._id}
            href={`/label/${label._id}`}
            className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card active:bg-secondary/30 transition-all"
          >
            <div className="bg-primary/10 p-2 rounded-lg">
              <Tag className="w-4 h-4 text-primary" />
            </div>
            <span className="font-medium flex-1">{label.name}</span>
            <Plus className="w-4 h-4 text-muted-foreground rotate-45" />
          </Link>
        ))}
        
        {labels.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-2xl">
            <Tag className="w-12 h-12 text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground font-medium">Create your first label</p>
            <Button variant="link" className="text-primary mt-2">Add New Label</Button>
          </div>
        )}
      </div>
    </div>
  );
}