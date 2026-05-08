"use client";

import Link from "next/link";
import Image from "next/image"; // Import Image for the branding
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Archive,
  Trash2,
  Tag,
  ChevronRight,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { LabelType } from "@/lib/types";

// Removed Lightbulb from navItems and replaced with your brand logo logic
const mainNavItems = [
  { href: "/notes", label: "Notes", icon: null }, // Handled specially for brand consistency
  { href: "/archive", label: "Archive", icon: Archive },
  { href: "/trash", label: "Trash", icon: Trash2 },
];

interface SidebarProps {
  labels: LabelType[];
  isCollapsed?: boolean;
  onEditLabels?: () => void;
}

export function Sidebar({ labels, isCollapsed = false, onEditLabels }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Branding Header */}
      <div className="flex items-center h-14 px-4 border-b border-sidebar-border">
        <Link href="/notes" className={cn("flex items-center gap-2", isCollapsed && "mx-auto")}>
          <div className="flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden bg-primary/5">
            <Image 
              src="/icon.png" 
              alt="KeepNotes" 
              width={24} 
              height={24}
              className="object-contain"
            />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-lg text-sidebar-foreground tracking-tight">
              Keep<span className="text-primary">Notes</span>
            </span>
          )}
        </Link>
      </div>

      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            
            // Special handling for the 'Notes' icon to use the brand logo
            const Icon = item.href === "/notes" ? null : item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                {item.href === "/notes" ? (
                  <div className={cn("w-5 h-5 flex items-center justify-center shrink-0", isCollapsed && "mx-auto")}>
                     <Image src="/icon.png" alt="" width={18} height={18} className={cn(!isActive && "grayscale opacity-70")} />
                  </div>
                ) : (
                  Icon && <Icon className={cn("w-5 h-5 shrink-0", isCollapsed && "mx-auto")} />
                )}
                
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}

          {!isCollapsed && labels.length > 0 && (
            <>
              <div className="px-3 py-2 mt-4">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-70">
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
              <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
            </Button>
          )}
        </nav>
      </ScrollArea>
    </aside>
  );
}