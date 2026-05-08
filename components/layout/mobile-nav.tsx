"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Lightbulb, Archive, Trash2, Tag } from "lucide-react";

const navItems = [
  { href: "/notes", label: "Notes", icon: Lightbulb },
  { href: "/archive", label: "Archive", icon: Archive },
  { href: "/trash", label: "Trash", icon: Trash2 },
  { href: "/labels", label: "Labels", icon: Tag },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-border bg-background/80 backdrop-blur-lg pb-safe">
      {navItems.map((item) => {
        // Correctly handle active states including sub-routes
        const isActive = 
          pathname === item.href || 
          (item.href !== "/" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center py-2 group relative h-16"
          >
            {/* Active Indicator Background Pill */}
            <div className={cn(
              "absolute top-1.5 px-6 py-1 rounded-full transition-all duration-300",
              isActive ? "bg-primary/15 opacity-100" : "bg-transparent opacity-0"
            )} />

            <item.icon 
              className={cn(
                "w-5 h-5 mb-1 transition-all relative z-10",
                isActive ? "text-primary" : "text-muted-foreground"
              )} 
              // Added subtle fill and thicker stroke for active state
              fill={isActive ? "currentColor" : "none"}
              fillOpacity={0.2}
              strokeWidth={isActive ? 2.5 : 2}
            />

            <span className={cn(
              "text-[10px] font-semibold tracking-tight transition-colors relative z-10",
              isActive ? "text-primary" : "text-muted-foreground"
            )}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}