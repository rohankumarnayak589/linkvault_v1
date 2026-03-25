"use client";

import { useState, useEffect, useCallback } from "react";
import type { Bookmark, Folder } from "@/lib/types";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Link2, Loader2, Star, X, Sparkles } from "lucide-react";

interface AddBookmarkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Omit<Bookmark, "id" | "createdAt" | "updatedAt" | "visitCount" | "lastVisitedAt">) => void;
  onUpdate: (id: string, updates: Partial<Bookmark>) => void;
  editingBookmark: Bookmark | null;
  folders: Folder[];
  existingTags: string[];
}

export function AddBookmarkDialog({
  open, onOpenChange, onSave, onUpdate, editingBookmark, folders, existingTags,
}: AddBookmarkDialogProps) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [favicon, setFavicon] = useState("");
  const [folderId, setFolderId] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [notes, setNotes] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [fetching, setFetching] = useState(false);

  const isEditing = !!editingBookmark;

  useEffect(() => {
    if (open && editingBookmark) {
      setUrl(editingBookmark.url);
      setTitle(editingBookmark.title);
      setDescription(editingBookmark.description);
      setFavicon(editingBookmark.favicon);
      setFolderId(editingBookmark.folderId);
      setTags(editingBookmark.tags);
      setNotes(editingBookmark.notes);
      setIsFavorite(editingBookmark.isFavorite);
      setIsPinned(editingBookmark.isPinned || false);
    } else if (open) {
      setUrl(""); setTitle(""); setDescription(""); setFavicon("");
      setFolderId(null); setTags([]); setTagInput(""); setNotes(""); setIsFavorite(false); setIsPinned(false);
    }
  }, [open, editingBookmark]);

  const fetchMetadata = useCallback(async (inputUrl: string) => {
    if (!inputUrl.startsWith("http")) return;
    setFetching(true);
    try {
      const response = await fetch(`/api/metadata?url=${encodeURIComponent(inputUrl)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.title && !title) setTitle(data.title);
        if (data.description && !description) setDescription(data.description);
        if (data.favicon) setFavicon(data.favicon);
        if (data.tags && data.tags.length > 0 && tags.length === 0) {
          setTags(data.tags);
        }
      } else {
        // Fallback to basic domain icon if API fails
        const hostname = new URL(inputUrl).hostname;
        setFavicon(`https://www.google.com/s2/favicons?domain=${hostname}&sz=64`);
      }
    } catch { 
      try {
        const hostname = new URL(inputUrl).hostname;
        setFavicon(`https://www.google.com/s2/favicons?domain=${hostname}&sz=64`);
      } catch { /* ignore */ }
    } finally { setFetching(false); }
  }, [title, description, tags.length]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (url && url.startsWith("http") && !isEditing) fetchMetadata(url);
    }, 500);
    return () => clearTimeout(timer);
  }, [url, isEditing, fetchMetadata]);

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) setTags([...tags, trimmed]);
    setTagInput("");
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const handleSubmit = () => {
    if (!url.trim()) return;
    const data: Omit<Bookmark, "id" | "createdAt" | "updatedAt" | "visitCount" | "lastVisitedAt"> = {
      url: url.trim(), title: title.trim() || url.trim(), description: description.trim(),
      favicon, previewImage: "", tags, folderId, notes: notes.trim(),
      isFavorite, isPinned, isArchived: false, isDeleted: false, deletedAt: null,
    };
    if (isEditing && editingBookmark) {
      onUpdate(editingBookmark.id, data);
      onOpenChange(false);
    } else {
      onSave(data);
    }
  };

  const suggestedTags = existingTags
    .filter((t) => !tags.includes(t) && t.includes(tagInput.toLowerCase()))
    .slice(0, 5);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border rounded-2xl max-w-lg shadow-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground text-lg font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {isEditing ? "Edit Bookmark" : "Add New Bookmark"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* URL */}
          <div className="space-y-1.5">
            <Label htmlFor="bookmark-url" className="text-[13px] text-muted-foreground font-medium">URL</Label>
            <div className="relative">
              <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="bookmark-url" value={url} onChange={(e) => setUrl(e.target.value)}
                onPaste={(e) => { const pasted = e.clipboardData.getData("text"); if (pasted.startsWith("http")) setUrl(pasted); }}
                placeholder="Paste URL here…"
                className="pl-10 h-11 bg-secondary/40 border-border/50 rounded-xl text-[13px] focus-visible:ring-2 focus-visible:ring-primary/40"
                autoFocus={!isEditing}
              />
              {fetching && <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin" />}
            </div>
          </div>

          {/* Preview card */}
          {(favicon || title) && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40 border border-border/30">
              <div className="h-10 w-10 rounded-lg bg-card flex items-center justify-center shrink-0 overflow-hidden border border-border/30">
                {favicon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={favicon} alt="" className="h-6 w-6" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                ) : (
                  <Link2 className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate">{title || "Untitled"}</p>
                <p className="text-[10px] text-muted-foreground truncate">{url}</p>
              </div>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="bookmark-title" className="text-[13px] text-muted-foreground font-medium">Title</Label>
            <Input id="bookmark-title" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Bookmark title"
              className="h-10 bg-secondary/40 border-border/50 rounded-xl text-[13px] focus-visible:ring-2 focus-visible:ring-primary/40"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="bookmark-desc" className="text-[13px] text-muted-foreground font-medium">Description</Label>
            <Textarea id="bookmark-desc" value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              className="bg-secondary/40 border-border/50 rounded-xl text-[13px] focus-visible:ring-2 focus-visible:ring-primary/40 resize-none min-h-[56px]"
              rows={2}
            />
          </div>

          {/* Collection */}
          <div className="space-y-1.5">
            <Label className="text-[13px] text-muted-foreground font-medium">Collection</Label>
            <select value={folderId || ""} onChange={(e) => setFolderId(e.target.value || null)}
              className="w-full h-10 px-3.5 rounded-xl bg-secondary/40 border border-border/50 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            >
              <option value="">No collection</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.icon} {f.parentId ? "└ " : ""}{f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label className="text-[13px] text-muted-foreground font-medium">Tags</Label>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag) => (
                  <Badge key={tag} className="bg-primary/10 text-primary border-primary/20 text-[11px] pl-2.5 pr-1 gap-1 rounded-full font-medium">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:bg-primary/20 rounded-full p-0.5">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && tagInput.trim()) { e.preventDefault(); addTag(tagInput); }
                if (e.key === "Backspace" && !tagInput && tags.length > 0) removeTag(tags[tags.length - 1]);
              }}
              placeholder="Add tags (press Enter)"
              className="h-10 bg-secondary/40 border-border/50 rounded-xl text-[13px] focus-visible:ring-2 focus-visible:ring-primary/40"
            />
            {tagInput && suggestedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {suggestedTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer text-[11px] rounded-full font-medium transition-colors hover:bg-accent"
                    onClick={() => addTag(tag)}>+ {tag}</Badge>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="bookmark-notes" className="text-[13px] text-muted-foreground font-medium">Notes (optional)</Label>
            <Textarea id="bookmark-notes" value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Add personal notes…"
              className="bg-secondary/40 border-border/50 rounded-xl text-[13px] focus-visible:ring-2 focus-visible:ring-primary/40 resize-none min-h-[56px]"
              rows={2}
            />
          </div>

          {/* Favorite toggle */}
          <div className="flex items-center justify-between py-2 px-1">
            <div className="flex items-center gap-2.5">
              <Star className={`h-4 w-4 ${isFavorite ? "text-amber-400 fill-current" : "text-muted-foreground"}`} />
              <Label className="text-[13px] text-foreground font-medium">Add to Favorites</Label>
            </div>
            <Switch checked={isFavorite} onCheckedChange={setIsFavorite} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="flex-1 text-muted-foreground hover:text-foreground rounded-xl h-11 font-medium">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!url.trim()} className="flex-1 rounded-xl shadow-sm h-11 font-semibold">
              {isEditing ? "Update Bookmark" : "Save Bookmark"}
            </Button>
          </div>

          {!isEditing && (
            <p className="text-center text-[11px] text-muted-foreground/60 pb-2">
              Pro tip: Press <kbd className="px-1.5 py-0.5 rounded-md bg-secondary text-[10px] font-mono font-semibold">Ctrl+K</kbd> to quick-add from anywhere
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
