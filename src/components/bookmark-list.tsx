"use client";

import React from "react";
import type { Bookmark } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Star, Pin, Trash2, Pencil, ExternalLink, Copy, Clock, RotateCcw, Trash } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface BookmarkListProps {
  bookmarks: Bookmark[];
  onToggleFavorite: (id: string) => void;
  onTogglePinned: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (bookmark: Bookmark) => void;
  onOpen: (bookmark: Bookmark) => void;
  isTrashView?: boolean;
  onRestore?: (id: string) => void;
  onPermanentDelete?: (id: string) => void;
}

export function BookmarkList({ 
  bookmarks, onToggleFavorite, onTogglePinned, onDelete, onEdit, onOpen,
  isTrashView = false, onRestore, onPermanentDelete,
}: BookmarkListProps) {
  return (
    <div className="space-y-1.5">
      {bookmarks.map((bookmark, i) => (
        <div
          key={bookmark.id}
          className="group flex items-center gap-4 px-4 py-3 rounded-xl bg-card/60 hover:bg-card border border-transparent hover:border-border/50 transition-all duration-150 animate-fadeInUp card-notion shadow-xs"
          style={{ animationDelay: `${i * 20}ms` }}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData("bookmarkId", bookmark.id);
            e.dataTransfer.effectAllowed = "move";
          }}
        >
          <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center shrink-0 border border-border/30">
            {bookmark.favicon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={bookmark.favicon} alt="" className="h-5 w-5" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            ) : (
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div 
              className="flex items-center gap-2 cursor-pointer hover:underline decoration-primary/30"
              onClick={() => onOpen(bookmark)}
            >
              <h3 className="text-[13px] font-semibold text-foreground truncate">{bookmark.title}</h3>
              <div className="flex gap-1 shrink-0">
                
                {bookmark.isFavorite && <Star className="h-3.5 w-3.5 text-amber-400 fill-current" />}
              </div>
            </div>
            <div 
              className="flex items-center gap-2 mt-0.5 cursor-pointer hover:text-foreground transition-colors"
              onClick={() => onOpen(bookmark)}
            >
              <span className="text-[11px] text-muted-foreground truncate max-w-[280px]">{bookmark.url}</span>
              {bookmark.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[9px] px-2 py-0 rounded-full shrink-0 hidden sm:inline-flex font-medium border-0">{tag}</Badge>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1 text-muted-foreground shrink-0">
            <Clock className="h-3 w-3" />
            <span className="text-[10px]">{formatDistanceToNow(new Date(bookmark.createdAt), { addSuffix: true })}</span>
          </div>

          <div className="flex items-center gap-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            {isTrashView ? (
              <>
                <button onClick={(e) => { e.stopPropagation(); onRestore?.(bookmark.id); }} className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors" title="Restore">
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onPermanentDelete?.(bookmark.id); }} className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors" title="Delete Permanently">
                  <Trash className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <button onClick={(e) => { e.stopPropagation(); onTogglePinned(bookmark.id); }} className={`p-1 rounded transition-colors ${bookmark.isPinned ? "text-blue-500 bg-blue-500/10" : "text-muted-foreground hover:text-blue-500 hover:bg-secondary"}`} title="Pin">
                  <Pin className={`h-3 w-3 ${bookmark.isPinned ? "fill-current" : ""}`} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(bookmark.id); }} className={`p-1 rounded transition-colors ${bookmark.isFavorite ? "text-amber-500 bg-amber-500/10" : "text-muted-foreground hover:text-amber-500 hover:bg-secondary"}`} title="Favorite">
                  <Star className={`h-3 w-3 ${bookmark.isFavorite ? "fill-current" : ""}`} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onEdit(bookmark); }} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(bookmark.url); }} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  <Copy className="h-4 w-4" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(bookmark.id); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
