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
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-border bg-background/80 backdrop-blur-lg pb-safe h-16">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/notes" && pathname.startsWith(item.href));
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center relative group"
          >
            <div className={cn(
              "absolute inset-x-4 top-1 bottom-6 rounded-full transition-all duration-300",
              isActive ? "bg-primary/15 scale-100" : "bg-transparent scale-75 opacity-0"
            )} />

            <item.icon className={cn(
              "w-5 h-5 mb-1 transition-all duration-300 relative z-10",
              isActive ? "text-primary stroke-[2.5px]" : "text-muted-foreground"
            )} 
            fill={isActive ? "currentColor" : "none"}
            fillOpacity={isActive ? 0.2 : 0}
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

      {/* FIXED LABEL LINK: 
          Since your path is /label/[labelId], 
          linking just to /label will 404 unless you have a page.tsx there.
      */}
      <Link
        href="/notes" 
        className={cn(
          "flex-1 flex flex-col items-center justify-center relative group",
          pathname.startsWith("/label") ? "text-primary" : "text-muted-foreground"
        )}
      >
        <div className={cn(
          "absolute inset-x-4 top-1 bottom-6 rounded-full transition-all duration-300",
          pathname.startsWith("/label") ? "bg-primary/15 scale-100" : "bg-transparent scale-75 opacity-0"
        )} />
        
        <Tag className={cn(
          "w-5 h-5 mb-1 transition-all relative z-10",
          pathname.startsWith("/label") ? "text-primary stroke-[2.5px]" : "text-muted-foreground"
        )} 
        fill={pathname.startsWith("/label") ? "currentColor" : "none"}
        fillOpacity={pathname.startsWith("/label") ? 0.2 : 0}
        />
        <span className="text-[10px] font-bold relative z-10">Labels</span>
      </Link>
    </nav>
  );
}