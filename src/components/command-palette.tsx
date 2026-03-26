"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Bookmark } from "@/lib/types";
import { Search, ExternalLink, Clock, Star, Tag, X, Palette } from "lucide-react";
import Fuse from "fuse.js";
import { formatDistanceToNow } from "date-fns";

import { THEMES } from "@/lib/icon-mapper";
import type { ThemeName } from "@/lib/types";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  bookmarks: Bookmark[];
  onOpen: (bookmark: Bookmark) => void;
  onFilterTag: (tag: string) => void;
  onThemeChange: (theme: ThemeName) => void;
}

export function CommandPalette({ open, onClose, bookmarks, onOpen, onFilterTag, onThemeChange }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"search" | "theme">("search");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const fuse = new Fuse(bookmarks.filter(b => !b.isDeleted), {
    keys: [
      { name: "title", weight: 0.4 },
      { name: "url", weight: 0.2 },
      { name: "tags", weight: 0.25 },
      { name: "description", weight: 0.15 },
    ],
    threshold: 0.35,
    ignoreLocation: true,
    includeScore: true,
  });

  const filteredThemes = query.trim()
    ? THEMES.filter(t => t.name.toLowerCase().includes(query.toLowerCase()) || t.label.toLowerCase().includes(query.toLowerCase()))
    : THEMES;

  const results = mode === "search"
    ? (query.trim()
        ? fuse.search(query.trim()).map(r => r.item).slice(0, 8)
        : bookmarks.filter(b => !b.isDeleted).slice(0, 8))
    : filteredThemes;

  useEffect(() => {
    if (open) {
      setQuery("");
      setMode("search");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, mode]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!open) return;
    if (e.key === "Escape") { 
      if (mode === "theme") { setMode("search"); setQuery(""); return; }
      onClose(); 
      return; 
    }
    
    // Toggle Mode
    if (e.key === "/" && mode === "search" && !query) {
      e.preventDefault();
      setMode("theme");
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, results.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    }
    if (e.key === "Enter" && results[activeIndex]) {
      if (mode === "search") {
        onOpen(results[activeIndex] as Bookmark);
        onClose();
      } else {
        const theme = results[activeIndex] as typeof THEMES[0];
        onThemeChange(theme.name as ThemeName);
        setMode("search");
        setQuery("");
      }
    }
  }, [open, results, activeIndex, onClose, onOpen, mode, onThemeChange]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.children[activeIndex] as HTMLElement;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-xl mx-4 bg-card rounded-2xl shadow-2xl border border-border/60 overflow-hidden animate-fadeInUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/40">
          <Search className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search bookmarks, tags…"
            className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground/60 outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="p-0.5 hover:bg-secondary rounded-md transition-colors">
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-secondary text-[10px] font-mono text-muted-foreground shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto py-2">
          {results.length === 0 ? (
            <div className="px-4 py-8 text-center text-[13px] text-muted-foreground/60">
              No {mode === "search" ? "bookmarks" : "themes"} found for &ldquo;{query}&rdquo;
            </div>
          ) : mode === "search" ? (
            (results as Bookmark[]).map((bookmark, i) => (
              <button
                key={bookmark.id}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors group ${
                  i === activeIndex ? "bg-primary/8 text-foreground" : "hover:bg-secondary/60 text-foreground"
                }`}
                onClick={() => { onOpen(bookmark); onClose(); }}
                onMouseEnter={() => setActiveIndex(i)}
              >
                {/* Favicon */}
                <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 overflow-hidden border border-border/30">
                  {bookmark.favicon ? (
                    <img src={bookmark.favicon} alt="" className="h-5 w-5" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <span className="text-sm">🌐</span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground truncate">{bookmark.title || "Untitled"}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{bookmark.url}</p>
                </div>

                {/* Meta*/}
                <div className="flex items-center gap-2 shrink-0">
                  {bookmark.isFavorite && <Star className="h-3 w-3 text-amber-400 fill-current" />}
                  {bookmark.tags.slice(0, 2).map(tag => (
                    <span
                      key={tag}
                      className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); onFilterTag(tag); onClose(); }}
                    >
                      #{tag}
                    </span>
                  ))}
                  <span className="text-[10px] text-muted-foreground/50">
                    {formatDistanceToNow(new Date(bookmark.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <>
              {!query && (
                <button
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors group ${
                    activeIndex === 0 ? "bg-primary/8 text-foreground" : "hover:bg-secondary/60 text-foreground"
                  }`}
                  onClick={() => { 
                    const randomTheme = THEMES[Math.floor(Math.random() * THEMES.length)];
                    onThemeChange(randomTheme.name as ThemeName);
                    onClose();
                  }}
                  onMouseEnter={() => setActiveIndex(0)}
                >
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center shrink-0 border border-border/30">
                    <Star className="h-4 w-4 text-white animate-spin-slow" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Surprise Me!</p>
                    <p className="text-[11px] text-muted-foreground">Pick a random catchy theme</p>
                  </div>
                </button>
              )}
              {(results as typeof THEMES).map((theme, i) => (
                <button
                  key={theme.name}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors group ${
                    i + (!query ? 1 : 0) === activeIndex ? "bg-primary/8 text-foreground" : "hover:bg-secondary/60 text-foreground"
                  }`}
                  onClick={() => { onThemeChange(theme.name as ThemeName); setMode("search"); setQuery(""); }}
                  onMouseEnter={() => setActiveIndex(i + (!query ? 1 : 0))}
                >
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border border-border/30" style={{ background: theme.colors.sidebar, color: theme.colors.primary }}>
                    <Palette className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold">{theme.label}</p>
                    <p className="text-[11px] text-muted-foreground">{theme.name.includes("dark") ? "Dark Mode" : "Light Mode"}</p>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-border/40 bg-secondary/20 flex items-center gap-4 text-[10px] text-muted-foreground/60">
          <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-secondary font-mono">↑↓</kbd> navigate</span>
          <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-secondary font-mono">↵</kbd> open</span>
          <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-secondary font-mono">ESC</kbd> close</span>
          <span className="ml-auto">{results.length} result{results.length !== 1 ? "s" : ""}</span>
        </div>
      </div>
    </div>
  );
}
