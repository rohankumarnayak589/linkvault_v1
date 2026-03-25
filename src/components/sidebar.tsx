"use client";

import { useState } from "react";
import type { Folder, SearchFilters, ThemeName } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ThemePicker } from "@/components/theme-picker";
import { getCollectionIcon, getCollectionColor, THEMES } from "@/lib/icon-mapper";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  X,
  PanelLeftClose,
  PanelLeft,
  Settings,
  LayoutGrid,
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
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 cursor-pointer ${
        isActive
          ? "sidebar-item-active"
          : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
      }`}
    >
      <span className="text-base w-5 text-center">{emoji}</span>
      <span className="flex-1 text-left truncate">{label}</span>
      {count !== undefined && count > 0 && (
        <span
          className={`text-[11px] min-w-5 h-5 flex items-center justify-center rounded-full font-semibold ${
            isActive
              ? "bg-primary/15 text-primary"
              : "bg-secondary text-muted-foreground"
          }`}
        >
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
            className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-[13px] font-medium transition-all duration-150 ${
              isActive
                ? "sidebar-item-active"
                : "hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
            }`}
            style={{ paddingLeft: `${12 + depth * 16}px` }}
            onClick={() =>
              onFilterChange({
                ...filters,
                folderId: isActive ? null : folder.id,
                favoritesOnly: false,
              })
            }
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add("bg-primary/20", "border-primary/50", "ring-2", "ring-primary/20");
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove("bg-primary/20", "border-primary/50", "ring-2", "ring-primary/20");
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove("bg-primary/20", "border-primary/50", "ring-2", "ring-primary/20");
              const bookmarkId = e.dataTransfer.getData("bookmarkId");
              if (bookmarkId) onMoveBookmark(bookmarkId, folder.id);
            }}
          >
            {children.length > 0 ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(folder.id);
                }}
                className="p-0.5 hover:bg-accent rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </button>
            ) : (
              <span className="w-4" />
            )}
            {/* Color dot + emoji */}
            <span
              className="w-5 h-5 rounded-md flex items-center justify-center text-xs shrink-0"
              style={{ backgroundColor: folder.color || "#F5F0EB" }}
            >
              {folder.icon}
            </span>
            <span className="truncate flex-1">{folder.name}</span>
            {count > 0 && (
              <span className="text-[11px] min-w-5 h-5 flex items-center justify-center rounded-full bg-secondary text-muted-foreground font-semibold">
                {count}
              </span>
            )}
            <DropdownMenuTrigger
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-accent rounded-lg transition-all"
            >
              <span className="text-xs font-bold">⋯</span>
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={() => {
                setAddingParentId(folder.id);
                setAddingFolder(true);
                if (!expandedFolders.has(folder.id)) toggleExpand(folder.id);
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Add subfolder
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const name = prompt("Rename collection:", folder.name);
                if (name) onRenameFolder(folder.id, name);
              }}
            >
              ✏️ Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDeleteFolder(folder.id)}
            >
              🗑️ Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {isExpanded && children.map((c) => renderFolder(c, depth + 1))}
        {isExpanded && addingFolder && addingParentId === folder.id && (
          <div
            className="flex items-center gap-1.5 px-3 py-1"
            style={{ paddingLeft: `${28 + depth * 16}px` }}
          >
            <Input
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateFolder();
                if (e.key === "Escape") {
                  setAddingFolder(false);
                  setAddingParentId(null);
                }
              }}
              placeholder="Folder name"
              className="h-7 text-xs"
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
      <div className="w-14 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-5 gap-3 shrink-0">
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
    <div className="w-[260px] bg-sidebar border-r border-sidebar-border flex flex-col h-full shrink-0 animate-slideIn overflow-hidden">
      {/* Logo */}
      <div className="px-4 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}>
            🔖
          </div>
          <span className="font-bold text-foreground text-[15px] tracking-tight">LinkVault</span>
        </div>
        <button onClick={onToggle} className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
          <PanelLeftClose className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <ScrollArea className="flex-1 px-3 py-1">
        {/* Main Navigation */}
        <div className="space-y-0.5 mb-1 px-3">
          <NavButton
            emoji="📚" label="All Bookmarks" count={totalCount}
            onClick={() => onFilterChange({ ...filters, folderId: null, favoritesOnly: false, tags: [] })}
            isActive={!filters.folderId && !filters.favoritesOnly && filters.tags.length === 0}
          />
          <NavButton
            emoji="📂" label="Collections"
            onClick={onNavigateCollections}
            isActive={false}
          />
          <NavButton
            emoji="⭐" label="Favorites" count={favoritesCount}
            onClick={() => onFilterChange({ ...filters, folderId: null, favoritesOnly: true, tags: [] })}
            isActive={filters.favoritesOnly}
          />
          <NavButton
            emoji="🕐" label="Recent" count={recentCount}
            onClick={() => onFilterChange({ ...filters, folderId: null, favoritesOnly: false, tags: [] })}
            isActive={false}
          />
          <NavButton
            emoji="🗑️" label="Trash"
            onClick={() => onFilterChange({ ...filters, folderId: "__trash__", favoritesOnly: false, tags: [] })}
            isActive={filters.folderId === "__trash__"}
          />
        </div>

        <div className="px-3">
          <Separator className="my-4 opacity-50" />
        </div>

        {/* Collections */}
        <div className="mb-4">
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/70">
              My Lists
            </p>
            <div className="flex gap-0.5">
              <button
                onClick={onNavigateCollections}
                className="p-1 hover:bg-secondary rounded-md transition-colors"
                title="View all collections"
              >
                <LayoutGrid className="h-3 w-3 text-muted-foreground" />
              </button>
              <button
                onClick={() => { setAddingFolder(true); setAddingParentId(null); }}
                className="p-1 hover:bg-secondary rounded-md transition-colors"
              >
                <Plus className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>
          </div>
          <div className="space-y-0.5">
            {rootFolders.map((f) => renderFolder(f))}
          </div>
          {addingFolder && addingParentId === null && (
            <div className="flex items-center gap-1.5 px-3 py-1">
              <Input
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateFolder();
                  if (e.key === "Escape") setAddingFolder(false);
                }}
                placeholder="Collection name"
                className="h-7 text-xs"
              />
              <button onClick={() => setAddingFolder(false)} className="p-1 hover:bg-accent rounded">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        <div className="px-3">
          <Separator className="my-4 opacity-50" />
        </div>

        {/* Tags */}
        <div className="mb-8">
          <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/70 flex items-center gap-2">
            🏷️ Top Tags
          </p>
          <div className="flex flex-wrap gap-1.5 px-3">
            {allTags.slice(0, 12).map((tag) => (
              <Badge
                key={tag}
                variant={filters.tags.includes(tag) ? "default" : "secondary"}
                className={`cursor-pointer text-[10px] py-0.5 px-2.5 rounded-full font-medium transition-all duration-150 ${
                  filters.tags.includes(tag)
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary/60 text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
                onClick={() => {
                  const newTags = filters.tags.includes(tag)
                    ? filters.tags.filter((t) => t !== tag)
                    : [...filters.tags, tag];
                  onFilterChange({ ...filters, tags: newTags });
                }}
              >
                {tag}
              </Badge>
            ))}
            {allTags.length === 0 && (
              <p className="px-3 text-[10px] text-muted-foreground/50 italic py-1">No tags yet</p>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Theme + Meta */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/70 mb-2 px-1">
            🎨 Personalize
          </p>
          <div className="grid grid-cols-2 gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="col-span-2 flex items-center justify-between px-3 py-2 bg-secondary/50 hover:bg-secondary rounded-lg text-xs font-semibold text-foreground transition-all cursor-pointer border border-border/40 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {THEMES.find(t => t.name === currentTheme)?.emoji}
                </span>
                <span>{THEMES.find(t => t.name === currentTheme)?.label}</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[228px] p-1.5 rounded-xl">
                {THEMES.map((theme) => (
                  <DropdownMenuItem 
                    key={theme.name}
                    onClick={() => onThemeChange(theme.name)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors mb-0.5 last:mb-0 ${
                      currentTheme === theme.name ? "bg-primary/10 text-primary font-bold" : ""
                    }`}
                  >
                    <div className="h-4 w-4 rounded-full border border-border/40" style={{ backgroundColor: theme.preview }} />
                    <span className="flex-1">{theme.label}</span>
                    <span className="text-xs opacity-60 font-mono uppercase">{theme.isDark ? 'Dark' : 'Light'}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex items-center gap-3 px-1 pt-1 group">
          <div className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold border-2 border-primary/20 bg-primary/5 text-primary group-hover:scale-105 transition-transform">
            GK
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-foreground truncate">Gulshan Kumar</p>
            <p className="text-[10px] text-muted-foreground/70 truncate">Pro Account</p>
          </div>
          <button className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
            <Settings className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
