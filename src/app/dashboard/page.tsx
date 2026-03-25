"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Bookmark, Folder, ViewMode, SortOption, SearchFilters, ThemeName } from "@/lib/types";
import {
  getAllBookmarks, getAllFolders, addBookmark, updateBookmark,
  deleteBookmark, restoreBookmark, permanentlyDeleteBookmark,
  addFolder, deleteFolder, updateFolder, seedSampleData, importBookmarks,
} from "@/lib/db";
import { searchBookmarks, getAllTags } from "@/lib/search";
import {
  exportAsJSON, exportAsCSV, exportAsHTML,
  parseHTMLBookmarks, parseJSONBookmarks, downloadFile,
} from "@/lib/import-export";
import { applyTheme, getSavedTheme } from "@/lib/icon-mapper";
import { Sidebar } from "@/components/sidebar";
import { BookmarkGrid } from "@/components/bookmark-grid";
import { BookmarkList } from "@/components/bookmark-list";
import { AddBookmarkDialog } from "@/components/add-bookmark-dialog";
import { CommandPalette } from "@/components/command-palette";
import { TopNav } from "@/components/top-nav";
import { toast } from "sonner";
import { Plus, Star, Pin } from "lucide-react";
import { Suspense } from "react";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const collectionParam = searchParams.get("collection");

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("dateAdded");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<ThemeName>("ivory-warm");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: "", folderId: null, tags: [], favoritesOnly: false, dateFrom: null, dateTo: null,
  });
  const [loading, setLoading] = useState(true);

  // Apply collection param from URL
  useEffect(() => {
    if (collectionParam) {
      setFilters((prev) => ({ ...prev, folderId: collectionParam, favoritesOnly: false }));
    }
  }, [collectionParam]);

  // Theme init
  useEffect(() => {
    const saved = getSavedTheme();
    setCurrentTheme(saved);
    applyTheme(saved);
  }, []);

  const handleThemeChange = (theme: ThemeName) => {
    setCurrentTheme(theme);
    applyTheme(theme);
  };

  const loadData = useCallback(async () => {
    try {
      await seedSampleData();
      const [bks, flds] = await Promise.all([getAllBookmarks(), getAllFolders()]);
      setBookmarks(bks);
      setFolders(flds);
    } catch (err) {
      console.error("Failed to load:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Ctrl+K shortcut — opens Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const allTags = useMemo(() => getAllTags(bookmarks), [bookmarks]);

  const filteredBookmarks = useMemo(() => {
    let effectiveFilters = { ...filters };
    
    // Trash view logic
    if (filters.folderId === "__trash__") {
      effectiveFilters = { ...filters, folderId: null };
      const results = searchBookmarks(bookmarks, effectiveFilters).filter((b) => b.isDeleted);
      return results.sort((a, b) => new Date(b.deletedAt || b.updatedAt).getTime() - new Date(a.deletedAt || a.updatedAt).getTime());
    }

    // Standard view logic (folders, unsorted, favorites, search)
    if (filters.folderId === "__unsorted__") {
      effectiveFilters = { ...filters, folderId: null };
      const results = searchBookmarks(bookmarks, effectiveFilters).filter((b) => !b.folderId && !b.isDeleted);
      return results.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        switch (sortBy) {
          case "title": return a.title.localeCompare(b.title);
          case "mostVisited": return b.visitCount - a.visitCount;
          case "dateUpdated": return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
    }

    const results = searchBookmarks(bookmarks, effectiveFilters).filter((b) => !b.isDeleted);
    return results.sort((a, b) => {
      // Pinned bookmarks always come first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      switch (sortBy) {
        case "title": return a.title.localeCompare(b.title);
        case "mostVisited": return b.visitCount - a.visitCount;
        case "dateUpdated": return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [bookmarks, filters, sortBy]);

  const handleAddBookmark = async (data: Omit<Bookmark, "id" | "createdAt" | "updatedAt" | "visitCount" | "lastVisitedAt">) => {
    // Duplicate detection
    const duplicate = bookmarks.find(b => b.url.toLowerCase() === data.url.toLowerCase() && !b.isDeleted);
    if (duplicate) {
      toast.error("Duplicate Bookmark", { 
        description: `"${duplicate.title}" is already in your vault.`,
      });
      return;
    }

    // Use the folderId from the dialog data rather than the active filter
    const newBk = await addBookmark(data);
    setBookmarks((prev) => [...prev, newBk]);
    
    const folder = folders.find(f => f.id === data.folderId);
    toast.success("Bookmark saved! 🎉", { 
      description: folder ? `Added to "${folder.name}"` : `Added to "${data.title}"` 
    });
    setShowAddDialog(false);
  };

  const handleMoveBookmark = async (bookmarkId: string, folderId: string | null) => {
    const updated = await updateBookmark(bookmarkId, { folderId });
    if (updated) {
      setBookmarks((prev) => prev.map((b) => (b.id === bookmarkId ? updated : b)));
      const folder = folders.find(f => f.id === folderId);
      toast.success(folder ? `Moved to ${folder.icon} ${folder.name}` : "Moved to Library");
    }
  };

  const handleUpdateBookmark = async (id: string, updates: Partial<Bookmark>) => {
    const updated = await updateBookmark(id, updates);
    if (updated) setBookmarks((prev) => prev.map((b) => (b.id === id ? updated : b)));
  };

  const handleDeleteBookmark = async (id: string) => {
    await deleteBookmark(id);
    await loadData(); // Reload to reflect status
    toast.success("Moved to Trash 🗑️");
  };

  const handleRestoreBookmark = async (id: string) => {
    await restoreBookmark(id);
    await loadData();
    toast.success("Bookmark restored! ✨");
  };

  const handlePermanentDelete = async (id: string) => {
    if (confirm("Permanently delete this bookmark? This cannot be undone.")) {
      await permanentlyDeleteBookmark(id);
      await loadData();
      toast.success("Bookmark permanently deleted");
    }
  };

  const handleToggleFavorite = async (id: string) => {
    const b = bookmarks.find((bk) => bk.id === id);
    if (b) {
      await handleUpdateBookmark(id, { isFavorite: !b.isFavorite });
      toast(b.isFavorite ? "Removed from favorites" : "Added to favorites ⭐");
    }
  };

  const handleTogglePinned = async (id: string) => {
    const b = bookmarks.find((bk) => bk.id === id);
    if (b) {
      await handleUpdateBookmark(id, { isPinned: !b.isPinned });
      toast(b.isPinned ? "Unpinned from top" : "Pinned to top 📌");
    }
  };

  const handleEmptyTrash = async () => {
    if (confirm("Permanently delete all items in Trash? This cannot be undone.")) {
      const trashItems = bookmarks.filter(b => b.isDeleted);
      await Promise.all(trashItems.map(b => permanentlyDeleteBookmark(b.id)));
      await loadData();
      toast.success("Trash emptied");
    }
  };

  const isTrashView = filters.folderId === "__trash__";

  const handleAddFolder = async (name: string, parentId: string | null) => {
    const folder = await addFolder(name, parentId);
    setFolders((prev) => [...prev, folder]);
    toast.success(`Collection "${name}" created ${folder.icon}`);
  };

  const handleDeleteFolder = async (id: string) => {
    await deleteFolder(id);
    const [bks, flds] = await Promise.all([getAllBookmarks(), getAllFolders()]);
    setBookmarks(bks); setFolders(flds);
    toast.success("Collection deleted");
  };

  const handleRenameFolder = async (id: string, name: string) => {
    await updateFolder(id, { name });
    setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, name } : f)));
  };

  const handleExport = (format: "json" | "csv" | "html") => {
    const timestamp = new Date().toISOString().slice(0, 10);
    switch (format) {
      case "json": downloadFile(exportAsJSON(bookmarks, folders), `linkvault-${timestamp}.json`, "application/json"); break;
      case "csv": downloadFile(exportAsCSV(bookmarks), `linkvault-${timestamp}.csv`, "text/csv"); break;
      case "html": downloadFile(exportAsHTML(bookmarks, folders), `linkvault-${timestamp}.html`, "text/html"); break;
    }
    toast.success(`Exported as ${format.toUpperCase()} 📤`);
  };

  const handleImport = async (file: File) => {
    const text = await file.text();
    let parsed: Partial<Bookmark>[] = [];
    if (file.name.endsWith(".html") || file.name.endsWith(".htm")) parsed = parseHTMLBookmarks(text);
    else if (file.name.endsWith(".json")) parsed = parseJSONBookmarks(text);
    if (parsed.length > 0) {
      const count = await importBookmarks(parsed as Bookmark[]);
      await loadData();
      toast.success(`Imported ${count} bookmarks 📥`);
    } else {
      toast.error("No bookmarks found in file");
    }
  };

  const handleEditBookmark = (bookmark: Bookmark) => { setEditingBookmark(bookmark); setShowAddDialog(true); };
  const handleOpenBookmark = async (bookmark: Bookmark) => {
    await handleUpdateBookmark(bookmark.id, { visitCount: bookmark.visitCount + 1, lastVisitedAt: new Date().toISOString() });
    window.open(bookmark.url, "_blank");
  };

  const activeFolder = filters.folderId ? folders.find((f) => f.id === filters.folderId) : null;
  const activeLabel = activeFolder
    ? activeFolder.name
    : filters.folderId === "__unsorted__"
      ? "Inbox"
      : filters.folderId === "__trash__"
        ? "Trash"
        : filters.favoritesOnly
          ? "Favorites"
          : "All Bookmarks";

  const activeEmoji = activeFolder
    ? activeFolder.icon
    : filters.folderId === "__unsorted__"
      ? "📥"
      : filters.folderId === "__trash__"
        ? "🗑️"
        : filters.favoritesOnly
          ? "⭐"
          : "📚";

  const favoritesCount = bookmarks.filter((b) => b.isFavorite && !b.isDeleted).length;
  const recentCount = bookmarks.filter((b) => !b.isDeleted && new Date().getTime() - new Date(b.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000).length;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm font-medium">Loading your vault…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        folders={folders} allTags={allTags}
        bookmarkCounts={bookmarks.reduce((acc, b) => { 
          if (b.isDeleted) return acc;
          const k = b.folderId || "__root__"; 
          acc[k] = (acc[k] || 0) + 1; 
          return acc; 
        }, {} as Record<string, number>)}
        totalCount={bookmarks.filter((b) => !b.isDeleted).length}
        favoritesCount={favoritesCount}
        recentCount={recentCount}
        filters={filters} onFilterChange={setFilters}
        onAddFolder={handleAddFolder} onDeleteFolder={handleDeleteFolder} onRenameFolder={handleRenameFolder}
        open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)}
        currentTheme={currentTheme} onThemeChange={handleThemeChange}
        onNavigateCollections={() => router.push("/collections")}
        onMoveBookmark={handleMoveBookmark}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNav
          filters={filters} onFilterChange={setFilters}
          viewMode={viewMode} onViewModeChange={setViewMode}
          sortBy={sortBy} onSortChange={setSortBy}
          onAddBookmark={() => setShowAddDialog(true)}
          onExport={handleExport} onImport={handleImport}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 overflow-auto p-6">
          {/* Stats Bar */}
          {!isTrashView && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-card border border-border/50 p-4 rounded-2xl card-notion shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <span className="text-xl">📚</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total</p>
                    <p className="text-xl font-bold text-foreground">{bookmarks.filter(b => !b.isDeleted).length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border/50 p-4 rounded-2xl card-notion shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-500">
                    <span className="text-xl">⭐</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Favorites</p>
                    <p className="text-xl font-bold text-foreground">{favoritesCount}</p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border/50 p-4 rounded-2xl card-notion shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-400/10 flex items-center justify-center text-blue-500">
                    <span className="text-xl">📂</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Collections</p>
                    <p className="text-xl font-bold text-foreground">{folders.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border/50 p-4 rounded-2xl card-notion shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-green-400/10 flex items-center justify-center text-green-500">
                    <span className="text-xl">☀️</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">New This Week</p>
                    <p className="text-xl font-bold text-foreground">{recentCount}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Page header */}
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5 tracking-tight">
                <span className="text-3xl">{activeEmoji}</span>
                <span>{activeLabel}</span>
              </h1>
              <p className="text-[13px] text-muted-foreground mt-0.5 font-medium">
                {isTrashView ? "Deleted items remain here until purged" : `Showing ${filteredBookmarks.length} saved link${filteredBookmarks.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            <div className="flex gap-3">
              {isTrashView ? (
                <button
                  onClick={handleEmptyTrash}
                  className="px-6 py-3 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl shadow-sm hover:shadow-md transition-all font-bold text-[13px] cursor-pointer disabled:opacity-50"
                  disabled={filteredBookmarks.length === 0}
                >
                  Empty Trash
                </button>
              ) : (
                <button
                  onClick={() => setShowAddDialog(true)}
                  className="flex items-center gap-2.5 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-150 font-bold text-[13px] cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Quick Add
                </button>
              )}
            </div>
          </div>

          {filteredBookmarks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeInUp">
              <div className="text-6xl mb-5">{isTrashView ? "🗑️" : "🔖"}</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {isTrashView ? "Trash is empty" : "No bookmarks found"}
              </h3>
              <p className="text-[13px] text-muted-foreground mb-6 max-w-sm leading-relaxed">
                {isTrashView 
                  ? "Deleted bookmarks will appear here for recovery." 
                  : filters.query ? `No results for "${filters.query}". Try adjusting your search.` : "Start saving your favorite links! Click + or press Ctrl+K."}
              </p>
              {!isTrashView && (
                <button onClick={() => setShowAddDialog(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm hover:shadow-md transition-all font-semibold text-[13px] cursor-pointer">
                  <Plus className="h-4 w-4" /> Add your first bookmark
                </button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            <BookmarkGrid 
              bookmarks={filteredBookmarks} onToggleFavorite={handleToggleFavorite} 
              onTogglePinned={handleTogglePinned} onDelete={handleDeleteBookmark} 
              onEdit={handleEditBookmark} onOpen={handleOpenBookmark} 
              isTrashView={isTrashView} onRestore={handleRestoreBookmark}
              onPermanentDelete={handlePermanentDelete}
            />
          ) : (
            <BookmarkList 
              bookmarks={filteredBookmarks} onToggleFavorite={handleToggleFavorite} 
              onTogglePinned={handleTogglePinned} onDelete={handleDeleteBookmark} 
              onEdit={handleEditBookmark} onOpen={handleOpenBookmark} 
              isTrashView={isTrashView} onRestore={handleRestoreBookmark}
              onPermanentDelete={handlePermanentDelete}
            />
          )}
        </main>
      </div>

      {/* Mobile FAB */}
      <button onClick={() => setShowAddDialog(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-2xl bg-primary text-primary-foreground shadow-xl flex items-center justify-center animate-pulse-glow hover:scale-110 transition-transform cursor-pointer md:hidden" aria-label="Add">
        <Plus className="h-6 w-6" />
      </button>

      <AddBookmarkDialog
        open={showAddDialog} onOpenChange={(open: boolean) => { setShowAddDialog(open); if (!open) setEditingBookmark(null); }}
        onSave={handleAddBookmark} onUpdate={handleUpdateBookmark}
        editingBookmark={editingBookmark} folders={folders} existingTags={allTags}
      />

      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        bookmarks={bookmarks}
        onOpen={(bookmark) => { handleOpenBookmark(bookmark); }}
        onFilterTag={(tag) => setFilters(prev => ({ ...prev, tags: [tag], folderId: null, favoritesOnly: false }))}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
