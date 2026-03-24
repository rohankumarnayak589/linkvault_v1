"use client";

import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Bookmark, Folder, User } from "./types";
import { getCollectionIcon, getCollectionColor } from "./icon-mapper";

interface LinkVaultDB extends DBSchema {
  bookmarks: {
    key: string;
    value: Bookmark;
    indexes: {
      "by-folder": string;
      "by-created": string;
      "by-favorite": number;
      "by-pinned": number;
    };
  };
  folders: {
    key: string;
    value: Folder;
    indexes: {
      "by-parent": string;
    };
  };
  users: {
    key: string;
    value: User;
  };
}

let dbPromise: Promise<IDBPDatabase<LinkVaultDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<LinkVaultDB>("linkvault-db", 2, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const bookmarkStore = db.createObjectStore("bookmarks", { keyPath: "id" });
          bookmarkStore.createIndex("by-folder", "folderId");
          bookmarkStore.createIndex("by-created", "createdAt");
          bookmarkStore.createIndex("by-favorite", "isFavorite");
          bookmarkStore.createIndex("by-pinned", "isPinned");

          const folderStore = db.createObjectStore("folders", { keyPath: "id" });
          folderStore.createIndex("by-parent", "parentId");

          db.createObjectStore("users", { keyPath: "id" });
        }
        // v2: icon and color fields are just new properties on Folder objects
        // IndexedDB is schemaless for non-indexed properties, no migration needed
      },
    });
  }
  return dbPromise;
}

// Generate unique IDs
export function generateId(): string {
  return crypto.randomUUID();
}

// ===== BOOKMARK OPERATIONS =====

export async function getAllBookmarks(): Promise<Bookmark[]> {
  const db = await getDB();
  return db.getAll("bookmarks");
}

export async function getBookmark(id: string): Promise<Bookmark | undefined> {
  const db = await getDB();
  return db.get("bookmarks", id);
}

export async function addBookmark(bookmark: Omit<Bookmark, "id" | "createdAt" | "updatedAt" | "visitCount" | "lastVisitedAt">): Promise<Bookmark> {
  const db = await getDB();
  const now = new Date().toISOString();
  const newBookmark: Bookmark = {
    ...bookmark,
    id: generateId(),
    isPinned: bookmark.isPinned || false,
    createdAt: now,
    updatedAt: now,
    visitCount: 0,
    lastVisitedAt: null,
  };
  await db.put("bookmarks", newBookmark);
  return newBookmark;
}

export async function updateBookmark(id: string, updates: Partial<Bookmark>): Promise<Bookmark | undefined> {
  const db = await getDB();
  const existing = await db.get("bookmarks", id);
  if (!existing) return undefined;
  const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  await db.put("bookmarks", updated);
  return updated;
}

export async function deleteBookmark(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("bookmarks", id);
}

export async function getBookmarksByFolder(folderId: string): Promise<Bookmark[]> {
  const db = await getDB();
  return db.getAllFromIndex("bookmarks", "by-folder", folderId);
}

// ===== FOLDER OPERATIONS =====

export async function getAllFolders(): Promise<Folder[]> {
  const db = await getDB();
  const folders = await db.getAll("folders");
  // Ensure all folders have icon and color (backward compat with v1 data)
  return folders.map((f) => ({
    ...f,
    icon: f.icon || getCollectionIcon(f.name),
    color: f.color || getCollectionColor(f.name),
  }));
}

export async function addFolder(
  name: string,
  parentId: string | null = null,
  icon?: string,
  color?: string
): Promise<Folder> {
  const db = await getDB();
  const folders = await db.getAll("folders");
  const newFolder: Folder = {
    id: generateId(),
    name,
    parentId,
    icon: icon || getCollectionIcon(name),
    color: color || getCollectionColor(name, folders.length),
    createdAt: new Date().toISOString(),
    order: folders.length,
  };
  await db.put("folders", newFolder);
  return newFolder;
}

export async function updateFolder(id: string, updates: Partial<Folder>): Promise<Folder | undefined> {
  const db = await getDB();
  const existing = await db.get("folders", id);
  if (!existing) return undefined;
  const updated = { ...existing, ...updates };
  // If name changed and no explicit icon, auto-assign
  if (updates.name && !updates.icon) {
    updated.icon = getCollectionIcon(updates.name);
  }
  await db.put("folders", updated);
  return updated;
}

export async function deleteFolder(id: string): Promise<void> {
  const db = await getDB();
  const bookmarks = await db.getAllFromIndex("bookmarks", "by-folder", id);
  for (const b of bookmarks) {
    await db.put("bookmarks", { ...b, folderId: null });
  }
  const subFolders = await db.getAllFromIndex("folders", "by-parent", id);
  for (const f of subFolders) {
    await deleteFolder(f.id);
  }
  await db.delete("folders", id);
}

// ===== USER OPERATIONS =====

export async function getUser(): Promise<User | undefined> {
  const db = await getDB();
  const users = await db.getAll("users");
  return users[0];
}

export async function createUser(user: Omit<User, "id" | "createdAt">): Promise<User> {
  const db = await getDB();
  const newUser: User = {
    ...user,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  await db.put("users", newUser);
  return newUser;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
  const db = await getDB();
  const existing = await db.get("users", id);
  if (!existing) return undefined;
  const updated = { ...existing, ...updates };
  await db.put("users", updated);
  return updated;
}

// ===== BULK OPERATIONS =====

export async function importBookmarks(bookmarks: Bookmark[]): Promise<number> {
  const db = await getDB();
  let count = 0;
  for (const b of bookmarks) {
    const existing = await db.getAll("bookmarks");
    const duplicate = existing.find((e) => e.url === b.url);
    if (!duplicate) {
      await db.put("bookmarks", { ...b, id: generateId() });
      count++;
    }
  }
  return count;
}

export async function exportBookmarks(): Promise<{ bookmarks: Bookmark[]; folders: Folder[] }> {
  const db = await getDB();
  const bookmarks = await db.getAll("bookmarks");
  const folders = await db.getAll("folders");
  return { bookmarks, folders };
}

// ===== SEED DATA =====
export async function seedSampleData(): Promise<void> {
  const db = await getDB();
  const existing = await db.getAll("bookmarks");
  if (existing.length > 0) return;

  const devFolder = await addFolder("Development", null, "💻", "#DBEAFE");
  const designFolder = await addFolder("Design Resources", null, "🎨", "#FCE7F3");
  const readingFolder = await addFolder("Reading List", null, "📖", "#FEF3C7");
  const moviesFolder = await addFolder("Movies", null, "🎬", "#EDE9FE");
  const educationFolder = await addFolder("Education", null, "🎓", "#D1FAE5");
  const frontendFolder = await addFolder("Frontend", devFolder.id, "⚛️", "#CCFBF1");

  const sampleBookmarks = [
    { url: "https://github.com", title: "GitHub", description: "Where the world builds software. Millions of developers and companies build, ship, and maintain their software on GitHub.", favicon: "https://github.githubassets.com/favicons/favicon.svg", previewImage: "", tags: ["development", "git", "open-source"], folderId: devFolder.id, notes: "", isFavorite: true, isPinned: false, isArchived: false },
    { url: "https://developer.mozilla.org", title: "MDN Web Docs", description: "The MDN Web Docs site provides information about Open Web technologies including HTML, CSS, and APIs.", favicon: "https://developer.mozilla.org/favicon-48x48.png", previewImage: "", tags: ["docs", "web", "reference"], folderId: frontendFolder.id, notes: "Great CSS reference", isFavorite: true, isPinned: false, isArchived: false },
    { url: "https://dribbble.com", title: "Dribbble — Discover the World's Top Designers", description: "Find Top Designers & Creative Professionals on Dribbble. We are where designers gain inspiration, feedback, community, and jobs.", favicon: "https://cdn.dribbble.com/assets/favicon-b38525134603b9513174ec887944bde1a869eb6cd414f4d640ee48ab2a15a26b.ico", previewImage: "", tags: ["design", "inspiration", "ui"], folderId: designFolder.id, notes: "", isFavorite: false, isPinned: false, isArchived: false },
    { url: "https://stackoverflow.com", title: "Stack Overflow", description: "Stack Overflow is the largest, most trusted online community for developers to learn, share their programming knowledge.", favicon: "https://cdn.sstatic.net/Sites/stackoverflow/Img/favicon.ico", previewImage: "", tags: ["development", "q&a", "community"], folderId: devFolder.id, notes: "", isFavorite: false, isPinned: false, isArchived: false },
    { url: "https://medium.com", title: "Medium — Where good ideas find you", description: "Medium is an open platform where readers find dynamic thinking and where expert and undiscovered voices can share their writing.", favicon: "https://miro.medium.com/v2/1*m-R_BkNf1Qjr1YbyOIJY2w.png", previewImage: "", tags: ["reading", "articles", "blog"], folderId: readingFolder.id, notes: "", isFavorite: false, isPinned: false, isArchived: false },
    { url: "https://youtube.com", title: "YouTube", description: "Enjoy the videos and music you love, upload original content, and share it all with friends, family, and the world.", favicon: "https://www.youtube.com/s/desktop/favicon.ico", previewImage: "", tags: ["video", "tutorials", "entertainment"], folderId: moviesFolder.id, notes: "", isFavorite: true, isPinned: false, isArchived: false },
    { url: "https://figma.com", title: "Figma: The Collaborative Interface Design Tool", description: "Figma is the leading collaborative design tool for building meaningful products. Seamlessly design, prototype, develop, and collect feedback.", favicon: "https://static.figma.com/app/icon/1/favicon.svg", previewImage: "", tags: ["design", "prototyping", "ui"], folderId: designFolder.id, notes: "Team design tool", isFavorite: true, isPinned: false, isArchived: false },
    { url: "https://notion.so", title: "Notion — Your connected workspace", description: "A new tool that blends your everyday work apps into one. It's the all-in-one workspace for you and your team.", favicon: "https://www.notion.so/images/favicon.ico", previewImage: "", tags: ["productivity", "notes", "workspace"], folderId: null, notes: "", isFavorite: false, isPinned: false, isArchived: false },
    { url: "https://react.dev", title: "React — The library for web and native user interfaces", description: "React is the library for web and native user interfaces. Build user interfaces out of individual pieces called components.", favicon: "https://react.dev/favicon-32x32.png", previewImage: "", tags: ["react", "javascript", "frontend", "library"], folderId: frontendFolder.id, notes: "Check out React 19 server components", isFavorite: true, isPinned: false, isArchived: false },
    { url: "https://khanacademy.org", title: "Khan Academy — Free Online Learning", description: "Learn for free about math, art, computer programming, economics, physics, chemistry, biology, medicine, finance, history, and more.", favicon: "https://www.khanacademy.org/favicon.ico", previewImage: "", tags: ["education", "learning", "free"], folderId: educationFolder.id, notes: "", isFavorite: false, isPinned: true, isArchived: false },
  ];

  for (const b of sampleBookmarks) {
    await addBookmark(b);
  }
}
