// Bookmark & folder types for LinkVault

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  description: string;
  favicon: string;
  previewImage: string;
  tags: string[];
  folderId: string | null;
  notes: string;
  isFavorite: boolean;
  isPinned: boolean;
  isArchived: boolean;
  visitCount: number;
  createdAt: string;
  updatedAt: string;
  lastVisitedAt: string | null;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  icon: string;
  color: string;
  createdAt: string;
  order: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  defaultView: "grid" | "list";
  theme: ThemeName;
}

export type ThemeName =
  | "ivory-warm"
  | "ocean-breeze"
  | "forest-dew"
  | "midnight"
  | "lavender-haze"
  | "sunset-glow";

export type ViewMode = "grid" | "list";
export type SortOption = "dateAdded" | "title" | "mostVisited" | "dateUpdated";

export interface SearchFilters {
  query: string;
  folderId: string | null;
  tags: string[];
  favoritesOnly: boolean;
  dateFrom: string | null;
  dateTo: string | null;
}
