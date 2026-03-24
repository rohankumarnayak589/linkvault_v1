"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Folder, Bookmark, ThemeName } from "@/lib/types";
import { getAllFolders, getAllBookmarks, addFolder, deleteFolder, updateFolder, updateBookmark, seedSampleData } from "@/lib/db";
import { getCollectionIcon, getCollectionColor, applyTheme, getSavedTheme } from "@/lib/icon-mapper";
import { Sidebar } from "@/components/sidebar";
import { Input } from "@/components/ui/input";
import { Plus, ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function CollectionsPage() {
  const router = useRouter();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<ThemeName>("ivory-warm");
  const [addingFolder, setAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = getSavedTheme();
    setCurrentTheme(saved);
    applyTheme(saved);
  }, []);

  const loadData = useCallback(async () => {
    await seedSampleData();
    const [flds, bks] = await Promise.all([getAllFolders(), getAllBookmarks()]);
    setFolders(flds);
    setBookmarks(bks);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleThemeChange = (theme: ThemeName) => {
    setCurrentTheme(theme);
    applyTheme(theme);
  };

  const handleAddFolder = async (name: string, parentId: string | null) => {
    const folder = await addFolder(name, parentId);
    setFolders((prev) => [...prev, folder]);
    toast.success(`Collection "${name}" created! ${folder.icon}`);
  };

  const handleDeleteFolder = async (id: string) => {
    await deleteFolder(id);
    const [bks, flds] = await Promise.all([getAllBookmarks(), getAllFolders()]);
    setBookmarks(bks);
    setFolders(flds);
    toast.success("Collection deleted");
  };

  const handleRenameFolder = async (id: string, name: string) => {
    await updateFolder(id, { name });
    setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, name, icon: getCollectionIcon(name) } : f)));
  };

  const handleMoveBookmark = async (bookmarkId: string, folderId: string | null) => {
    const updated = await updateBookmark(bookmarkId, { folderId });
    if (updated) {
      setBookmarks((prev) => prev.map((b) => (b.id === bookmarkId ? updated : b)));
      const folder = folders.find(f => f.id === folderId);
      toast.success(folder ? `Moved to ${folder.icon} ${folder.name}` : "Moved to Library");
    }
  };

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      await handleAddFolder(newFolderName.trim(), null);
      setNewFolderName("");
      setAddingFolder(false);
    }
  };

  const getBookmarkCount = (folderId: string): number =>
    bookmarks.filter((b) => b.folderId === folderId).length;

  const rootFolders = folders.filter((f) => !f.parentId);
  const totalBookmarks = bookmarks.filter((b) => !b.isArchived).length;
  const favoritesCount = bookmarks.filter((b) => b.isFavorite).length;
  const recentCount = bookmarks.filter((b) => new Date().getTime() - new Date(b.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000).length;
  const bookmarkCounts = bookmarks.reduce((acc, b) => { const k = b.folderId || "__root__"; acc[k] = (acc[k] || 0) + 1; return acc; }, {} as Record<string, number>);
  const allTags = [...new Set(bookmarks.flatMap((b) => b.tags))].sort();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm font-medium">Loading collections…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        folders={folders} allTags={allTags} bookmarkCounts={bookmarkCounts}
        totalCount={totalBookmarks} favoritesCount={favoritesCount} recentCount={recentCount}
        filters={{ query: "", folderId: null, tags: [], favoritesOnly: false, dateFrom: null, dateTo: null }}
        onFilterChange={() => router.push("/")} onAddFolder={handleAddFolder}
        onDeleteFolder={handleDeleteFolder} onRenameFolder={handleRenameFolder}
        open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)}
        currentTheme={currentTheme} onThemeChange={handleThemeChange}
        onNavigateCollections={() => {}}
        onMoveBookmark={handleMoveBookmark}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-card/80 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center gap-4">
          <button onClick={() => router.push("/")} className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              📂 Collections
            </h1>
            <p className="text-[13px] text-muted-foreground">Organize your bookmarks into categories</p>
          </div>
        </div>

        <main className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {rootFolders.map((folder, i) => {
              const count = getBookmarkCount(folder.id);
              const children = folders.filter((f) => f.parentId === folder.id);
              return (
                <div
                  key={folder.id}
                  className="group collection-card bg-card rounded-xl border border-border/50 overflow-hidden cursor-pointer animate-fadeInUp"
                  style={{ animationDelay: `${i * 40}ms` }}
                  onClick={() => router.push(`/?collection=${folder.id}`)}
                >
                  {/* Color header */}
                  <div className="h-24 flex items-center justify-center relative" style={{ backgroundColor: folder.color || "#F5F0EB" }}>
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-200">{folder.icon}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 backdrop-blur-sm hover:bg-white/80 text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="text-[14px] font-semibold text-foreground mb-0.5">{folder.name}</h3>
                    <p className="text-[12px] text-muted-foreground">
                      {count} bookmark{count !== 1 ? "s" : ""}
                      {children.length > 0 && ` · ${children.length} subfolder${children.length !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* New collection card */}
            {addingFolder ? (
              <div className="bg-card rounded-xl border-2 border-dashed border-primary/30 p-6 flex flex-col items-center justify-center gap-3 animate-fadeInUp">
                <span className="text-3xl">📁</span>
                <Input
                  autoFocus value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreateFolder(); if (e.key === "Escape") setAddingFolder(false); }}
                  placeholder="Collection name" className="text-center h-9 text-sm max-w-[180px]"
                />
                <div className="flex gap-2">
                  <button onClick={() => setAddingFolder(false)} className="text-[12px] text-muted-foreground hover:text-foreground px-3 py-1 rounded-lg hover:bg-secondary transition-colors">Cancel</button>
                  <button onClick={handleCreateFolder} className="text-[12px] bg-primary text-primary-foreground px-3 py-1 rounded-lg hover:opacity-90 font-medium transition-colors">Create</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingFolder(true)}
                className="collection-card bg-card/40 rounded-xl border-2 border-dashed border-border hover:border-primary/40 p-8 flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-foreground transition-all cursor-pointer animate-fadeInUp"
                style={{ animationDelay: `${rootFolders.length * 40}ms` }}
              >
                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
                  <Plus className="h-6 w-6" />
                </div>
                <span className="text-[13px] font-medium">New Collection</span>
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
