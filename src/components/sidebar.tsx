"use client";

import { useState } from "react";
import type { Folder, SearchFilters, ThemeName } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { THEMES } from "@/lib/icon-mapper";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  X,
  PanelLeftClose,
  PanelLeft,
  Share2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
  folders: Folder[];
  allTags: string[];
  bookmarkCounts: Record<string, number>;
  totalCount: number;
  favoritesCount: number;
  recentCount: number;
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  onAddFolder: (name: string, parentId: string | null) => void;
  onDeleteFolder: (id: string) => void;
  onRenameFolder: (id: string, name: string) => void;
  open: boolean;
  onToggle: () => void;
  currentTheme: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
  onNavigateCollections: () => void;
  onMoveBookmark: (bookmarkId: string, folderId: string | null) => void;
}

interface NavItemProps {
  emoji: string;
  label: string;
  count?: number;
  onClick: () => void;
  isActive: boolean;
}

function NavButton({ emoji, label, count, onClick, isActive }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 cursor-pointer ${
        isActive
          ? "sidebar-item-active"
          : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
      }`}
    >
      <span className="text-base w-5 text-center shrink-0">{emoji}</span>
      <span className="flex-1 text-left truncate">{label}</span>
      {count !== undefined && count > 0 && (
        <span
          className={`text-[11px] min-w-5 h-5 flex items-center justify-center rounded-full font-semibold shrink-0 ${
            isActive ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// Compact 2-column nav tile (for grid layout)
function CompactNavTile({
  emoji, label, count, onClick, isActive
}: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-start gap-0.5 px-3 py-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer border ${
        isActive
          ? "bg-primary/10 text-primary border-primary/20 shadow-sm"
          : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground border-transparent hover:border-border/30"
      }`}
    >
      <span className="text-lg leading-none">{emoji}</span>
      <span className="text-[11px] font-semibold leading-tight truncate w-full">{label}</span>
      {count !== undefined && count > 0 && (
        <span className={`text-[10px] font-bold ${
          isActive ? "text-primary" : "text-muted-foreground/70"
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

export function Sidebar({
  folders,
  allTags,
  bookmarkCounts,
  totalCount,
  favoritesCount,
  recentCount,
  filters,
  onFilterChange,
  onAddFolder,
  onDeleteFolder,
  onRenameFolder,
  open,
  onToggle,
  currentTheme,
  onThemeChange,
  onNavigateCollections,
  onMoveBookmark,
}: SidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [addingFolder, setAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [addingParentId, setAddingParentId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onAddFolder(newFolderName.trim(), addingParentId);
      setNewFolderName("");
      setAddingFolder(false);
      setAddingParentId(null);
    }
  };

  const rootFolders = folders.filter((f) => !f.parentId);

  const renderFolder = (folder: Folder, depth: number = 0) => {
    const children = folders.filter((f) => f.parentId === folder.id);
    const isExpanded = expandedFolders.has(folder.id);
    const isActive = filters.folderId === folder.id;
    const count = bookmarkCounts[folder.id] || 0;

    return (
      <div key={folder.id}>
        <DropdownMenu>
          <div
            className={`group flex items-center gap-2 py-2 rounded-lg cursor-pointer text-[13px] font-medium transition-all duration-150 ${
              isActive
                ? "sidebar-item-active"
                : "hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
            }`}
            style={{ paddingLeft: `${12 + depth * 16}px`, paddingRight: "8px" }}
            onClick={() =>
              onFilterChange({ ...filters, folderId: isActive ? null : folder.id, favoritesOnly: false })
            }
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add("bg-primary/20", "ring-2", "ring-primary/40", "ring-inset");
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove("bg-primary/20", "ring-2", "ring-primary/40", "ring-inset");
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove("bg-primary/20", "ring-2", "ring-primary/40", "ring-inset");
              const bookmarkId = e.dataTransfer.getData("bookmarkId");
              if (bookmarkId) onMoveBookmark(bookmarkId, folder.id);
            }}
          >
            {children.length > 0 ? (
              <button
                onClick={(e) => { e.stopPropagation(); toggleExpand(folder.id); }}
                className="p-0.5 hover:bg-accent rounded transition-colors shrink-0"
              >
                {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </button>
            ) : (
              <span className="w-4 shrink-0" />
            )}
            <span
              className="w-5 h-5 rounded-md flex items-center justify-center text-xs shrink-0"
              style={{ backgroundColor: folder.color || "#F5F0EB" }}
            >
              {folder.icon}
            </span>
            <span className="truncate flex-1">{folder.name}</span>
            {count > 0 && (
              <span className="text-[10px] min-w-4 h-4 flex items-center justify-center rounded-full bg-secondary text-muted-foreground font-semibold shrink-0 px-1">
                {count}
              </span>
            )}
            <DropdownMenuTrigger
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-accent rounded-lg transition-all shrink-0"
            >
              <span className="text-xs font-bold">⋯</span>
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => {
              setAddingParentId(folder.id);
              setAddingFolder(true);
              if (!expandedFolders.has(folder.id)) toggleExpand(folder.id);
            }}>
              <Plus className="h-4 w-4 mr-2" /> Add subfolder
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              const name = prompt("Rename collection:", folder.name);
              if (name) onRenameFolder(folder.id, name);
            }}>
              ✏️ Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              const url = `${window.location.origin}/share/${folder.id}`;
              navigator.clipboard.writeText(url);
              alert(`Share link copied!\n${url}`);
            }}>
              <Share2 className="h-4 w-4 mr-2" /> Share
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => onDeleteFolder(folder.id)}>
              🗑️ Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {isExpanded && children.map((c) => renderFolder(c, depth + 1))}
        {isExpanded && addingFolder && addingParentId === folder.id && (
          <div className="flex items-center gap-1.5 px-3 py-1" style={{ paddingLeft: `${28 + depth * 16}px` }}>
            <Input
              autoFocus value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateFolder();
                if (e.key === "Escape") { setAddingFolder(false); setAddingParentId(null); }
              }}
              placeholder="Folder name" className="h-7 text-xs"
            />
            <button onClick={() => { setAddingFolder(false); setAddingParentId(null); }} className="p-1 hover:bg-accent rounded">
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    );
  };

  if (!open) {
    return (
      <div className="hidden md:flex w-14 bg-sidebar border-r border-sidebar-border flex-col items-center py-5 gap-3 shrink-0 h-screen sticky top-0 z-30 transition-all duration-300">
        <button onClick={onToggle} className="p-2.5 hover:bg-secondary rounded-lg transition-colors" aria-label="Open sidebar">
          <PanelLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="mt-auto pb-4">
          <button
            onClick={() => onFilterChange({ ...filters, folderId: "__trash__", favoritesOnly: false, tags: [] })}
            className={`p-2.5 rounded-lg transition-colors ${filters.folderId === "__trash__" ? "bg-primary/10 text-primary" : "hover:bg-secondary text-muted-foreground"}`}
            title="Trash"
          >
            <span className="text-sm">🗑️</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      fixed inset-y-0 left-0 z-40 w-[280px] sm:w-[300px] bg-sidebar border-r border-sidebar-border flex flex-col h-screen shrink-0 transition-transform duration-300 ease-in-out shadow-xl md:shadow-sm md:relative md:translate-x-0 overflow-hidden
      ${open ? "translate-x-0" : "-translate-x-full"}
    `}>
      {/* Logo */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center text-lg shadow-sm" style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}>
            🔖
          </div>
          <span className="font-bold text-foreground text-[15px] tracking-tight">LinkVault</span>
        </div>
        <button onClick={onToggle} className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
          <PanelLeftClose className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Scrollable content — min-h-0 + overflow-y-auto gives a true native scrollbar */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className="px-3 pb-6 pt-1">
          {/* All Bookmarks — full row */}
          <NavButton
            emoji="📚" label="All Bookmarks" count={totalCount}
            onClick={() => onFilterChange({ ...filters, folderId: null, favoritesOnly: false, tags: [] })}
            isActive={!filters.folderId && !filters.favoritesOnly && filters.tags.length === 0}
          />

          {/* 2x2 compact grid */}
          <div className="grid grid-cols-2 gap-1.5 mt-1.5">
            <CompactNavTile
              emoji="📂" label="Collections"
              onClick={onNavigateCollections}
              isActive={false}
            />
            <CompactNavTile
              emoji="⭐" label="Favorites" count={favoritesCount}
              onClick={() => onFilterChange({ ...filters, folderId: null, favoritesOnly: true, tags: [] })}
              isActive={filters.favoritesOnly}
            />
            <CompactNavTile
              emoji="🕐" label="Recent" count={recentCount}
              onClick={() => onFilterChange({ ...filters, folderId: null, favoritesOnly: false, tags: [] })}
              isActive={false}
            />
            <CompactNavTile
              emoji="🗑️" label="Trash"
              onClick={() => onFilterChange({ ...filters, folderId: "__trash__", favoritesOnly: false, tags: [] })}
              isActive={filters.folderId === "__trash__"}
            />
          </div>

          <Separator className="my-3 opacity-40" />

          {/* Collections */}
          <div className="mb-2">
            <div className="flex items-center justify-between px-1 mb-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/60">My Collections</p>
              <button
                onClick={() => { setAddingFolder(true); setAddingParentId(null); }}
                className="p-1 hover:bg-secondary rounded-md transition-colors"
                title="New collection"
              >
                <Plus className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-0.5">
              {rootFolders.map((f) => renderFolder(f))}
            </div>
            {rootFolders.length === 0 && !addingFolder && (
              <p className="text-[11px] text-muted-foreground/40 italic px-3 py-1">No collections yet</p>
            )}
            {addingFolder && addingParentId === null && (
              <div className="flex items-center gap-1.5 px-1 py-1">
                <Input
                  autoFocus value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateFolder();
                    if (e.key === "Escape") setAddingFolder(false);
                  }}
                  placeholder="Collection name" className="h-7 text-xs"
                />
                <button onClick={() => setAddingFolder(false)} className="p-1 hover:bg-accent rounded">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          <Separator className="my-3 opacity-40" />

          {/* Tags — horizontal badges, frequency sorted, real-time */}
          <div className="mb-2">
            <div className="px-1 mb-2.5 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/60 flex items-center gap-1.5">
                🏷️ Top Tags
              </p>
              {allTags.length > 0 && (
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              )}
            </div>
            {allTags.length === 0 ? (
              <p className="text-[11px] text-muted-foreground/40 italic px-1 py-1">Add tags to bookmarks to see them here</p>
            ) : (
              <div className="flex flex-wrap gap-1.5 px-1">
                {allTags.slice(0, 15).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      const newTags = filters.tags.includes(tag)
                        ? filters.tags.filter((t) => t !== tag)
                        : [...filters.tags, tag];
                      onFilterChange({ ...filters, tags: newTags, folderId: null, favoritesOnly: false });
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-150 border ${
                      filters.tags.includes(tag)
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-secondary/60 text-muted-foreground border-border/30 hover:bg-accent hover:text-foreground hover:border-primary/30"
                    }`}
                  >
                    <span className="opacity-50 text-[9px]">#</span>
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Theme Picker — pinned to bottom */}
      <div className="px-4 py-3 border-t border-sidebar-border bg-sidebar shrink-0">
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground/50 mb-2">🎨 Theme</p>
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full flex items-center justify-between px-3 py-2 bg-secondary/40 hover:bg-secondary/70 rounded-xl text-[12px] font-semibold text-foreground transition-all cursor-pointer border border-border/20 group">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full border border-border/50" style={{ backgroundColor: THEMES.find(t => t.name === currentTheme)?.preview }} />
              <span>{THEMES.find(t => t.name === currentTheme)?.label}</span>
              <span className="text-[9px] opacity-40 font-bold uppercase bg-secondary px-1 py-0.5 rounded">
                {THEMES.find(t => t.name === currentTheme)?.isDark ? 'Dark' : 'Light'}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/60" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[268px] p-2 rounded-2xl shadow-xl border-border/40 bg-card/95" align="start" side="top" sideOffset={8}>
            <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Select Appearance</p>
            {THEMES.map((theme) => (
              <DropdownMenuItem
                key={theme.name}
                onClick={() => onThemeChange(theme.name)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                  currentTheme === theme.name ? "bg-primary/10 text-primary font-bold" : "hover:bg-secondary"
                }`}
              >
                <div className="h-5 w-5 rounded-full border-2 border-border/30 shrink-0" style={{ backgroundColor: theme.preview }} />
                <span className="flex-1 text-[13px]">{theme.label}</span>
                <span className="text-[9px] opacity-40 font-bold uppercase bg-secondary/80 px-1.5 py-0.5 rounded-md">{theme.isDark ? 'Dark' : 'Light'}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
