"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Lightbulb, Archive, Trash2, Tag } from "lucide-react";

const navItems = [
  { href: "/notes", label: "Notes", icon: Lightbulb },
  { href: "/archive", label: "Archive", icon: Archive },
  { href: "/trash", label: "Trash", icon: Trash2 },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-border bg-background/95 backdrop-blur-md pb-safe">
      {navItems.map((item) => {
        // Matches the exact path or any sub-path (like /notes/123)
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex-1 flex flex-col items-center justify-center py-3 gap-1 text-[10px] font-medium transition-all duration-200",
              isActive
                ? "text-primary scale-110"
                : "text-muted-foreground active:scale-95"
            )}
          >
            <item.icon className={cn("w-5 h-5", isActive && "fill-current/10")} />
            <span>{item.label}</span>
            {isActive && (
              <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
            )}
          </Link>
        );
      })}

      {/* FIXING THE 404: 
          If you don't have a /app/labels/page.tsx, this will 404.
          Redirecting to /notes or a specific label management route.
      */}
      <Link
        href="/notes" // Changed from /labels to /notes to avoid 404
        className={cn(
          "flex-1 flex flex-col items-center justify-center py-3 gap-1 text-[10px] font-medium transition-all duration-200",
          pathname.startsWith("/labels")
            ? "text-primary scale-110"
            : "text-muted-foreground active:scale-95"
        )}
      >
        <Tag className={cn("w-5 h-5", pathname.startsWith("/labels") && "fill-current/10")} />
        <span>Labels</span>
        {pathname.startsWith("/labels") && (
          <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
        )}
      </Link>
    </nav>
  );
}