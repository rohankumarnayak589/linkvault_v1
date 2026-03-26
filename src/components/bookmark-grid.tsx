"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Bookmark } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Star, Pencil, Trash2, ExternalLink, Copy, Clock, Pin, RotateCcw, Trash } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface BookmarkGridProps {
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

export function BookmarkGrid({ 
  bookmarks, onToggleFavorite, onTogglePinned, onDelete, onEdit, onOpen,
  isTrashView = false, onRestore, onPermanentDelete,
}: BookmarkGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <AnimatePresence mode="popLayout">
        {bookmarks.map((bookmark, i) => {
          const domain = getDomainMeta(bookmark.url);
          return (
            <motion.div
              key={bookmark.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ 
                rotateX: -2, 
                rotateY: 2, 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              className="group bg-card rounded-xl border border-border/60 overflow-hidden card-notion relative shadow-sm hover:shadow-xl transition-shadow"
              style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
              draggable
              onDragStart={(e: any) => {
                e.dataTransfer.setData("bookmarkId", bookmark.id);
                e.dataTransfer.effectAllowed = "move";
                e.currentTarget.classList.add("opacity-50");
              }}
              onDragEnd={(e: any) => {
                e.currentTarget.classList.remove("opacity-50");
              }}
            >
              {/* Preview Banner */}
              <div className="relative h-36 bg-secondary/30 overflow-hidden border-b border-border/40">
                {bookmark.previewImage ? (
                  <motion.img 
                    src={bookmark.previewImage} 
                    alt="" 
                    className="h-full w-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                    onError={(e) => { 
                      (e.target as HTMLImageElement).style.display = "none";
                      (e.target as HTMLImageElement).parentElement!.classList.add("bg-gradient-to-br", domain.gradient);
                    }} 
                  />
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${domain.gradient} opacity-80 flex items-center justify-center`}>
                    <motion.span 
                      className="text-5xl opacity-30"
                      whileHover={{ scale: 1.1, opacity: 0.5 }}
                    >
                      {domain.icon}
                    </motion.span>
                  </div>
                )}
                
                <div className="absolute top-3 left-3 z-10">
                  <div className="h-8 w-8 rounded-lg bg-card/80 backdrop-blur-md flex items-center justify-center shadow-sm border border-border/40">
                    {bookmark.favicon ? (
                      <img src={bookmark.favicon} alt="" className="h-4.5 w-4.5" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                      <span className="text-sm">{domain.icon}</span>
                    )}
                  </div>
                </div>

                {!isTrashView && (
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5 translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all z-10">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => { e.stopPropagation(); onToggleFavorite(bookmark.id); }}
                      className={`p-1.5 rounded-lg transition-all duration-150 ${
                        bookmark.isFavorite
                          ? "text-amber-400 bg-amber-400/20 backdrop-blur-sm"
                          : "text-white/40 hover:text-amber-400 bg-black/15 backdrop-blur-sm"
                      }`}
                    >
                      <Star className={`h-3.5 w-3.5 ${bookmark.isFavorite ? "fill-current" : ""}`} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => { e.stopPropagation(); onTogglePinned(bookmark.id); }}
                      className={`p-1.5 rounded-lg transition-all duration-150 ${
                        bookmark.isPinned
                          ? "text-blue-400 bg-blue-400/20 backdrop-blur-sm"
                          : "text-white/40 hover:text-blue-400 bg-black/15 backdrop-blur-sm"
                      }`}
                    >
                      <Pin className={`h-3.5 w-3.5 ${bookmark.isPinned ? "fill-current" : ""}`} />
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Content Body */}
              <div className="p-3.5 space-y-2">
                <div 
                  className="cursor-pointer hover:underline decoration-primary/30"
                  onClick={() => onOpen(bookmark)}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {bookmark.favicon && (
                      <img src={bookmark.favicon} alt="" className="h-3 w-3 rounded-sm" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    )}
                    <span className="text-[10px] text-muted-foreground font-medium truncate uppercase tracking-wider">{domain.name}</span>
                  </div>
                  <h3 className="text-[14px] font-bold text-card-foreground line-clamp-2 leading-tight">{bookmark.title}</h3>
                </div>

                {bookmark.description && (
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{bookmark.description}</p>
                )}

                {bookmark.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {bookmark.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[9px] px-2 py-0 rounded-full font-medium border-0 bg-primary/5 text-primary">
                        {tag}
                      </Badge>
                    ))}
                    {bookmark.tags.length > 3 && (
                      <Badge variant="secondary" className="text-[9px] px-2 py-0 rounded-full font-medium border-0 opacity-60">
                        +{bookmark.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 mt-2 border-t border-border/30">
                  <div className="flex items-center gap-1.5 text-muted-foreground/60">
                    <Clock className="h-3 w-3" />
                    <span className="text-[10px] font-medium">{formatDistanceToNow(new Date(bookmark.createdAt), { addSuffix: true })}</span>
                  </div>
                  <div className="flex items-center gap-0 opacity-0 group-hover:opacity-100 transition-all">
                    {isTrashView ? (
                      <>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); onRestore?.(bookmark.id); }} className="p-1.5 rounded text-primary hover:bg-primary/10 transition-colors" title="Restore">
                          <RotateCcw className="h-4 w-4" />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); onPermanentDelete?.(bookmark.id); }} className="p-1.5 rounded text-destructive hover:bg-destructive/10 transition-colors" title="Delete Permanently">
                          <Trash className="h-4 w-4" />
                        </motion.button>
                      </>
                    ) : (
                      <>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); onEdit(bookmark); }} className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Edit">
                          <Pencil className="h-3.5 w-3.5" />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(bookmark.url); }} className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Copy">
                          <Copy className="h-3.5 w-3.5" />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); window.open(bookmark.url, "_blank"); }} className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Open">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); onDelete(bookmark.id); }} className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
