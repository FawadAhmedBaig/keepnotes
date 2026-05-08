"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Lightbulb,
  Archive,
  Trash2,
  Tag,
  ChevronRight,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { LabelType } from "@/lib/types";

interface SidebarProps {
  labels: LabelType[];
  isCollapsed?: boolean;
  onEditLabels?: () => void;
}

const mainNavItems = [
  { href: "/notes", label: "Notes", icon: Lightbulb },
  { href: "/archive", label: "Archive", icon: Archive },
  { href: "/trash", label: "Trash", icon: Trash2 },
];

export function Sidebar({ labels, isCollapsed = false, onEditLabels }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* NOTE: We have removed the Branding Header (div with Link/Logo) from here.
        The brand identity is now managed solely by the Header component to 
        avoid visual clutter and the "double logo" issue on desktop.
      */}

      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className={cn("w-5 h-5 shrink-0", isCollapsed && "mx-auto")} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}

          {!isCollapsed && labels.length > 0 && (
            <>
              <div className="px-3 py-2 mt-4">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                  Labels
                </span>
              </div>
              {labels.map((label) => {
                const isActive = pathname === `/label/${label._id}`;
                return (
                  <Link
                    key={label._id}
                    href={`/label/${label._id}`}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    )}
                  >
                    <Tag className="w-5 h-5 shrink-0" />
                    <span className="truncate">{label.name}</span>
                  </Link>
                );
              })}
            </>
          )}

          {!isCollapsed && (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-3 py-2.5 rounded-full text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 mt-2"
              onClick={onEditLabels}
            >
              <Plus className="w-5 h-5 shrink-0" />
              <span>Edit labels</span>
              <ChevronRight className="w-4 h-4 ml-auto opacity-40" />
            </Button>
          )}
        </nav>
      </ScrollArea>
    </aside>
  );
}