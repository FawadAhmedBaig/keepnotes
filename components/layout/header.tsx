"use client";

import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Search, RefreshCw, Sun, Moon, LogOut, Settings, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh?: () => void;
  onToggleSidebar?: () => void; // <--- ADD THIS LINE
}

export function Header({
  searchQuery,
  onSearchChange,
  onRefresh,
}: HeaderProps) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  const userInitials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-50 flex items-center h-14 sm:h-16 gap-2 sm:gap-4 px-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      
      {/* 1. Brand Section: Clean and Minimal */}
      <div className="flex items-center gap-2 mr-1 sm:mr-4 shrink-0">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary">
          <Lightbulb className="w-5 h-5 fill-current" />
        </div>
        <span className="font-bold text-lg hidden lg:block tracking-tight">
          Keep<span className="text-primary">Notes</span>
        </span>
      </div>

      {/* 2. Search Section: Professional Group-Focus Styling */}
      <div className="flex-1 flex items-center max-w-2xl mx-auto">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary pointer-events-none" />
          <Input
            type="search"
            placeholder="Search your notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-9 sm:h-10 bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary rounded-lg sm:rounded-xl transition-all"
          />
        </div>
      </div>

      {/* 3. Actions Section */}
      <div className="flex items-center gap-1">
        {onRefresh && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            aria-label="Refresh"
            className="hidden xs:flex rounded-full h-9 w-9"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
          className="rounded-full h-9 w-9"
        >
          <Sun className="w-5 h-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute w-5 h-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-transparent h-9 w-9 ml-1">
              <Avatar className="w-8 h-8 border-2 border-transparent hover:border-primary transition-all">
                <AvatarImage src={session?.user?.image || undefined} alt={session?.user?.name || "User"} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 mt-2 rounded-xl shadow-xl border-border">
            <div className="flex items-center gap-3 p-3">
              <Avatar className="w-10 h-10 ring-2 ring-primary/10">
                <AvatarImage src={session?.user?.image || undefined} alt={session?.user?.name || "User"} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold truncate leading-none mb-1">
                  {session?.user?.name}
                </span>
                <span className="text-xs text-muted-foreground truncate italic">
                  {session?.user?.email}
                </span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer py-2.5 focus:bg-primary/5">
              <Settings className="w-4 h-4 mr-3 text-muted-foreground" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer py-2.5 text-destructive focus:text-destructive focus:bg-destructive/10"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}