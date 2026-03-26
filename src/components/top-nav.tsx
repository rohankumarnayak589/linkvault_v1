"use client";

import { useRef } from "react";
import type { SearchFilters, ViewMode, SortOption, ThemeName } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Search, Plus, LayoutGrid, List, ArrowDownAZ, Clock, TrendingUp,
  FileEdit, Download, Upload, Menu, MoreHorizontal, Palette,
} from "lucide-react";
import { THEMES } from "@/lib/icon-mapper";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

interface TopNavProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onAddBookmark: () => void;
  onExport: (format: "json" | "csv" | "html") => void;
  onImport: (file: File) => void;
  onToggleSidebar: () => void;
}

export function TopNav({
  filters, onFilterChange, viewMode, onViewModeChange,
  sortBy, onSortChange, onAddBookmark, onExport, onImport, onToggleSidebar,
}: TopNavProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();

  return (
    <div className="bg-card/80 backdrop-blur-xl border-b border-border/50 px-5 py-3 flex items-center gap-3 shrink-0 z-20 sticky top-0">
      <button onClick={onToggleSidebar} className="p-2 hover:bg-secondary rounded-lg transition-colors md:hidden">
        <Menu className="h-5 w-5 text-muted-foreground" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-xl relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          id="search-input"
          value={filters.query}
          onChange={(e) => onFilterChange({ ...filters, query: e.target.value })}
          placeholder="Search bookmarks, tags, or notes..."
          className="pl-10 h-10 bg-secondary/50 border-border/50 rounded-xl text-[13px] focus-visible:ring-2 focus-visible:ring-primary/40 placeholder:text-muted-foreground/50 transition-all"
        />
      </div>

      {/* View toggles */}
      <div className="hidden md:flex items-center rounded-lg bg-secondary/60 p-0.5 gap-0.5">
        <button
          onClick={() => onViewModeChange("grid")}
          className={`p-2 rounded-md transition-all duration-150 ${
            viewMode === "grid"
              ? "bg-card text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <LayoutGrid className="h-4 w-4" />
        </button>
        <button
          onClick={() => onViewModeChange("list")}
          className={`p-2 rounded-md transition-all duration-150 ${
            viewMode === "list"
              ? "bg-card text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <List className="h-4 w-4" />
        </button>
      </div>

      {/* Sort */}
      <DropdownMenu>
        <DropdownMenuTrigger className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
          <ArrowDownAZ className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onSortChange("dateAdded")}>
            <Clock className="h-4 w-4 mr-2" /> Date Added
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange("title")}>
            <ArrowDownAZ className="h-4 w-4 mr-2" /> Title
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange("mostVisited")}>
            <TrendingUp className="h-4 w-4 mr-2" /> Most Visited
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange("dateUpdated")}>
            <FileEdit className="h-4 w-4 mr-2" /> Last Updated
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger className="hidden md:flex p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[130px]">
          <DropdownMenuItem onClick={() => onExport("json")}><Download className="h-4 w-4 mr-2" /> JSON</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onExport("csv")}><Download className="h-4 w-4 mr-2" /> CSV</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onExport("html")}><Download className="h-4 w-4 mr-2" /> HTML</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => fileInputRef.current?.click()}><Upload className="h-4 w-4 mr-2" /> Import</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <input ref={fileInputRef} type="file" accept=".html,.htm,.json" className="hidden"
        onChange={(e) => { const file = e.target.files?.[0]; if (file) onImport(file); e.target.value = ""; }} />

      {/* Add button */}
      <Button
        onClick={onAddBookmark}
        className="hidden md:flex gap-2 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-150 font-semibold text-[13px] px-5"
        size="sm"
      >
        <Plus className="h-4 w-4" />
        Add
      </Button>

      {/* Auth UI */}
      <div className="flex items-center gap-2 pl-2 border-l border-border/50 ml-1">
        {session?.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all outline-none">
              {session.user.image ? (
                <Image src={session.user.image} alt="User profile" width={32} height={32} />
              ) : (
                <div className="h-8 w-8 bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  {session.user.name?.[0] || session.user.email?.[0] || "?"}
                </div>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-2 py-1.5 text-sm">
                <p className="font-semibold">{session.user.name}</p>
                <p className="text-xs text-muted-foreground">{session.user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })} className="text-red-500 font-medium">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </div>
  );
}
