"use client";

import { useEffect, useState } from "react";
import { getAllBookmarks, getAllFolders } from "@/lib/db";
import type { Bookmark, Folder } from "@/lib/types";
import { ExternalLink, BookOpen } from "lucide-react";
import Link from "next/link";

export default function SharedCollectionClient({ collectionId }: { collectionId: string }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [folder, setFolder] = useState<Folder | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [allBks, allFolders] = await Promise.all([getAllBookmarks(), getAllFolders()]);
        const col = allFolders.find(f => f.id === collectionId);
        if (!col) { setNotFound(true); setLoading(false); return; }
        setFolder(col);
        setBookmarks(allBks.filter(b => b.folderId === collectionId && !b.isDeleted));
      } catch (e) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [collectionId]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-8">
      <span className="text-6xl">🔍</span>
      <h1 className="text-2xl font-bold text-foreground">Collection Not Found</h1>
      <p className="text-muted-foreground text-center max-w-sm">
        This collection may not exist or is only available on the device where it was created.
      </p>
      <Link href="/" className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors">
        Go to Dashboard
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: folder?.color || "var(--primary)", color: "white" }}>
            {folder?.icon || "📂"}
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">{folder?.name}</h1>
            <p className="text-[12px] text-muted-foreground">{bookmarks.length} bookmark{bookmarks.length !== 1 ? "s" : ""} · Shared Collection</p>
          </div>
          <Link href="/" className="ml-auto flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-[13px] font-semibold hover:bg-primary/90 transition-colors">
            <BookOpen className="h-4 w-4" /> Open LinkVault
          </Link>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {bookmarks.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl">📭</span>
            <p className="mt-4 text-muted-foreground">No bookmarks in this collection yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookmarks.map(bookmark => (
              <a
                key={bookmark.id}
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-card border border-border/50 rounded-xl p-4 hover:shadow-md transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center shrink-0 overflow-hidden border border-border/30">
                    {bookmark.favicon ? (
                      <img src={bookmark.favicon} alt="" className="h-5 w-5" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                      <span className="text-sm">🌐</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{bookmark.title || "Untitled"}</p>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">{new URL(bookmark.url).hostname}</p>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary shrink-0 mt-0.5 transition-colors" />
                </div>
                {bookmark.description && (
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-2.5 leading-relaxed">{bookmark.description}</p>
                )}
                {bookmark.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {bookmark.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-primary/8 text-primary rounded-full">#{tag}</span>
                    ))}
                  </div>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
