"use client";

import React from "react";
import type { Bookmark } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Star, Pencil, Trash2, ExternalLink, Copy, Clock, Pin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface BookmarkGridProps {
  bookmarks: Bookmark[];
  onToggleFavorite: (id: string) => void;
  onTogglePinned: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (bookmark: Bookmark) => void;
  onOpen: (bookmark: Bookmark) => void;
}

// Domain-specific gradient + emoji
function getDomainMeta(url: string): { icon: string; gradient: string; name: string } {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    const map: Record<string, { icon: string; gradient: string }> = {
      "github.com": { icon: "🐙", gradient: "from-gray-700 to-gray-900" },
      "developer.mozilla.org": { icon: "🦊", gradient: "from-blue-600 to-blue-800" },
      "dribbble.com": { icon: "🏀", gradient: "from-pink-500 to-pink-700" },
      "stackoverflow.com": { icon: "📊", gradient: "from-orange-500 to-orange-700" },
      "medium.com": { icon: "✍️", gradient: "from-emerald-600 to-emerald-800" },
      "youtube.com": { icon: "▶️", gradient: "from-red-500 to-red-700" },
      "figma.com": { icon: "🎨", gradient: "from-violet-500 to-violet-700" },
      "notion.so": { icon: "📝", gradient: "from-slate-600 to-slate-800" },
      "react.dev": { icon: "⚛️", gradient: "from-cyan-500 to-cyan-700" },
      "khanacademy.org": { icon: "🎓", gradient: "from-green-500 to-green-700" },
    };
    const meta = map[hostname];
    return {
      icon: meta?.icon || "🌐",
      gradient: meta?.gradient || "from-indigo-500 to-indigo-700",
      name: hostname,
    };
  } catch {
    return { icon: "🌐", gradient: "from-indigo-500 to-indigo-700", name: url };
  }
}

export function BookmarkGrid({ bookmarks, onToggleFavorite, onTogglePinned, onDelete, onEdit, onOpen }: BookmarkGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {bookmarks.map((bookmark, i) => {
        const domain = getDomainMeta(bookmark.url);
        return (
          <div
            key={bookmark.id}
            className="group bg-card rounded-xl border border-border/60 overflow-hidden card-notion animate-fadeInUp"
            style={{ animationDelay: `${i * 35}ms` }}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("bookmarkId", bookmark.id);
              e.dataTransfer.effectAllowed = "move";
              (e.currentTarget as HTMLElement).classList.add("opacity-50");
            }}
            onDragEnd={(e) => {
              (e.currentTarget as HTMLElement).classList.remove("opacity-50");
            }}
          >
            {/* Preview */}
            <div className={`relative h-32 bg-gradient-to-br ${domain.gradient} overflow-hidden`}>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl opacity-30 group-hover:opacity-50 group-hover:scale-110 transition-all duration-400">
                  {domain.icon}
                </span>
              </div>
              <div className="absolute top-3 left-3">
                <div className="h-7 w-7 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  {bookmark.favicon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={bookmark.favicon} alt="" className="h-4 w-4" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <span className="text-xs">{domain.icon}</span>
                  )}
                </div>
              </div>
              <div className="absolute top-3 right-3 flex flex-col gap-1.5 translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite(bookmark.id); }}
                  className={`p-1.5 rounded-lg transition-all duration-150 ${
                    bookmark.isFavorite
                      ? "text-amber-400 bg-amber-400/20 backdrop-blur-sm"
                      : "text-white/40 hover:text-amber-400 bg-black/15 backdrop-blur-sm"
                  }`}
                >
                  <Star className={`h-3.5 w-3.5 ${bookmark.isFavorite ? "fill-current" : ""}`} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onTogglePinned(bookmark.id); }}
                  className={`p-1.5 rounded-lg transition-all duration-150 ${
                    bookmark.isPinned
                      ? "text-blue-400 bg-blue-400/20 backdrop-blur-sm"
                      : "text-white/40 hover:text-blue-400 bg-black/15 backdrop-blur-sm"
                  }`}
                >
                  <Pin className={`h-3.5 w-3.5 ${bookmark.isPinned ? "fill-current" : ""}`} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-3.5 space-y-2">
              <div 
                className="cursor-pointer hover:underline decoration-primary/30"
                onClick={() => onOpen(bookmark)}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  {bookmark.favicon && (
                    <img src={bookmark.favicon} alt="" className="h-3 w-3 rounded-sm" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  )}
                  <span className="text-[10px] text-muted-foreground font-medium truncate">{domain.name}</span>
                </div>
                <h3 className="text-[13px] font-semibold text-card-foreground line-clamp-2 leading-snug">{bookmark.title}</h3>
              </div>

              {bookmark.description && (
                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{bookmark.description}</p>
              )}

              {bookmark.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {bookmark.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[9px] px-2 py-0 rounded-full font-medium border-0">
                      {tag}
                    </Badge>
                  ))}
                  {bookmark.tags.length > 3 && (
                    <Badge variant="secondary" className="text-[9px] px-2 py-0 rounded-full font-medium border-0">
                      +{bookmark.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-1.5 border-t border-border/40">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span className="text-[10px]">{formatDistanceToNow(new Date(bookmark.createdAt), { addSuffix: true })}</span>
                </div>
                <div className="flex items-center gap-0 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={(e) => { e.stopPropagation(); onEdit(bookmark); }} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Edit">
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(bookmark.url); }} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Copy">
                    <Copy className="h-3 w-3" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); window.open(bookmark.url, "_blank"); }} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Open">
                    <ExternalLink className="h-3 w-3" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(bookmark.id); }} className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Delete">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
