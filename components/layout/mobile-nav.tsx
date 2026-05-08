"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Lightbulb, Archive, Trash2, Tag } from "lucide-react";

const navItems = [
  { href: "/notes", label: "Notes", icon: Lightbulb },
  { href: "/label", label: "Labels", icon: Tag }, // Now points to our new index page
  { href: "/archive", label: "Archive", icon: Archive },
  { href: "/trash", label: "Trash", icon: Trash2 },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-border bg-background/95 backdrop-blur-md pb-safe h-16">
      {navItems.map((item) => {
        // Precise active state logic
        const isActive = pathname === item.href || (item.href !== "/notes" && pathname.startsWith(item.href));
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center relative transition-all active:opacity-70"
          >
            {/* Active Indicator Pill - Prevents Icon Distortion */}
            <div className={cn(
              "absolute top-1.5 w-14 h-8 rounded-full transition-all duration-300",
              isActive ? "bg-primary/15 opacity-100" : "bg-transparent opacity-0"
            )} />

            <item.icon className={cn(
              "w-5 h-5 mb-1 transition-all duration-300 relative z-10",
              isActive ? "text-primary" : "text-muted-foreground"
            )} 
            strokeWidth={isActive ? 2.5 : 2}
            fill={isActive ? "currentColor" : "none"}
            fillOpacity={0.1}
            />

            <span className={cn(
              "text-[10px] font-bold tracking-tight transition-colors relative z-10",
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