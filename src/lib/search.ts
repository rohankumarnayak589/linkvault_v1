"use client";

import Fuse from "fuse.js";
import type { Bookmark, SearchFilters } from "./types";

const fuseOptions = {
  keys: [
    { name: "title", weight: 0.35 },
    { name: "url", weight: 0.2 },
    { name: "tags", weight: 0.2 },
    { name: "description", weight: 0.15 },
    { name: "notes", weight: 0.1 },
  ],
  threshold: 0.35,
  includeScore: true,
  ignoreLocation: true,
};

export function searchBookmarks(bookmarks: Bookmark[], filters: SearchFilters): Bookmark[] {
  let results = bookmarks.filter((b) => !b.isArchived);

  // Apply filters first
  if (filters.folderId) {
    results = results.filter((b) => b.folderId === filters.folderId);
  }
  if (filters.tags.length > 0) {
    results = results.filter((b) =>
      filters.tags.some((tag) => b.tags.includes(tag))
    );
  }
  if (filters.favoritesOnly) {
    results = results.filter((b) => b.isFavorite);
  }
  if (filters.dateFrom) {
    results = results.filter((b) => b.createdAt >= filters.dateFrom!);
  }
  if (filters.dateTo) {
    results = results.filter((b) => b.createdAt <= filters.dateTo!);
  }

  // Then apply text search
  if (filters.query.trim()) {
    const fuse = new Fuse(results, fuseOptions);
    const searchResults = fuse.search(filters.query.trim());
    results = searchResults.map((r) => r.item);
  }

  return results;
}

export function getAllTags(bookmarks: Bookmark[]): string[] {
  const tagSet = new Set<string>();
  for (const b of bookmarks) {
    for (const t of b.tags) {
      tagSet.add(t);
    }
  }
  return Array.from(tagSet).sort();
}
